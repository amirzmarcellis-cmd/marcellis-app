import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.error('No authorization header');
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the JWT token and get the user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has admin privileges or is a team leader
    const [userRoleData, membershipData] = await Promise.all([
      supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle(),
      supabaseAdmin
        .from('memberships')
        .select('role')
        .eq('user_id', user.id)
    ]);

    const orgRole = userRoleData.data?.role || 'EMPLOYEE';
    const isAdmin = orgRole === 'ADMIN';
    const isManagement = orgRole === 'MANAGEMENT';
    const isTeamLeader = membershipData.data?.some((m: any) => m.role === 'TEAM_LEADER');

    if (!isAdmin && !isManagement && !isTeamLeader) {
      console.error('User does not have sufficient permissions');
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, userId, userData } = await req.json();

    switch (action) {
      case 'create_team_member': {
        console.log('Creating team member:', userData.email);
        
        if (!userData.email || !userData.password || !userData.name || !userData.teamId) {
          return new Response(
            JSON.stringify({ error: 'Missing required fields' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          user_metadata: {
            name: userData.name
          },
          email_confirm: true
        });

        if (createError) {
          console.error('User creation error:', createError);
          return new Response(
            JSON.stringify({ error: createError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Create profile entry
        if (newUser.user) {
          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .insert({
              user_id: newUser.user.id,
              name: userData.name,
              email: userData.email,
              is_admin: false,
              slug: 'me'
            });

          if (profileError) {
            console.error('Profile creation error:', profileError);
          }

          // Create team membership as EMPLOYEE
          const { error: membershipError } = await supabaseAdmin
            .from('memberships')
            .insert({
              user_id: newUser.user.id,
              team_id: userData.teamId,
              role: 'EMPLOYEE'
            });

          if (membershipError) {
            console.error('Membership creation error:', membershipError);
            return new Response(
              JSON.stringify({ error: 'Failed to add user to team' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }

        return new Response(
          JSON.stringify({ 
            user: { 
              id: newUser.user?.id, 
              email: newUser.user?.email,
              name: userData.name
            }, 
            success: true 
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'create_user': {
        console.log('Creating user:', userData.email);
        
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          user_metadata: {
            name: userData.name
          },
          email_confirm: true
        });

        if (createError) {
          // If user already exists, try to retrieve them
          if (createError.message?.includes('email address has already been registered')) {
            console.log('User already exists, retrieving existing user:', userData.email);
            
            // List users and find by email
            const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
            
            if (listError) {
              console.error('Error listing users:', listError);
              return new Response(
                JSON.stringify({ error: 'Failed to retrieve existing user' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
            
            const existingUser = existingUsers.users.find(user => user.email === userData.email);
            
            if (!existingUser) {
              console.error('User not found after email exists error');
              return new Response(
                JSON.stringify({ error: 'User exists but could not be retrieved' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
            
            // Update user profile if needed
            await supabaseAdmin
              .from('profiles')
              .upsert({
                user_id: existingUser.id,
                name: userData.name,
                email: userData.email,
                is_admin: userData.org_role === 'admin' // backwards compatibility
              });

            // Update or insert organization role
            await supabaseAdmin
              .from('user_roles')
              .upsert({
                user_id: existingUser.id,
                role: userData.org_role === 'admin' ? 'ADMIN' : 
                      userData.org_role === 'management' ? 'MANAGEMENT' : 'EMPLOYEE'
              });

            // Create team membership if team is specified
            if (userData.team && (userData.org_role === 'team_member' || userData.org_role === 'team_leader')) {
              await supabaseAdmin
                .from('memberships')
                .upsert({
                  user_id: existingUser.id,
                  team_id: userData.team,
                  role: userData.org_role === 'team_leader' ? 'TEAM_LEADER' : 'EMPLOYEE'
                });
            }
            
            return new Response(
              JSON.stringify({ user: { user: existingUser }, success: true }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          console.error('User creation error:', createError);
          return new Response(
            JSON.stringify({ error: createError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Create profile entry
        if (newUser.user) {
          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .insert({
              user_id: newUser.user.id,
              name: userData.name,
              email: userData.email,
              is_admin: userData.org_role === 'admin', // backwards compatibility
              slug: 'me'
            });

          if (profileError) {
            console.error('Profile creation error:', profileError);
          }

          // Organization role is automatically created by trigger, but update if needed
          const roleMapping = {
            'admin': 'ADMIN',
            'management': 'MANAGEMENT',
            'team_leader': 'EMPLOYEE', // team_leader is team-based, not org-level
            'team_member': 'EMPLOYEE'
          };
          
          const orgRoleValue = roleMapping[userData.org_role] || 'EMPLOYEE';
          
          await supabaseAdmin
            .from('user_roles')
            .update({ role: orgRoleValue })
            .eq('user_id', newUser.user.id);

          // Create team membership if team is specified
          if (userData.team && (userData.org_role === 'team_member' || userData.org_role === 'team_leader')) {
            const { error: membershipError } = await supabaseAdmin
              .from('memberships')
              .insert({
                user_id: newUser.user.id,
                team_id: userData.team,
                role: userData.org_role === 'team_leader' ? 'TEAM_LEADER' : 'EMPLOYEE'
              });

            if (membershipError) {
              console.error('Membership creation error:', membershipError);
            }
          }
        }

        return new Response(
          JSON.stringify({ user: newUser, success: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'update_user': {
        console.log('Updating user:', userId, 'with role:', userData.org_role);
        
        // Update user profile
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .update({
            name: userData.name,
            email: userData.email,
            is_admin: userData.org_role === 'admin' // backwards compatibility
          })
          .eq('user_id', userId);

        if (profileError) {
          console.error('Profile update error:', profileError);
          return new Response(
            JSON.stringify({ error: profileError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Update user email in auth if it changed
        const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          { 
            email: userData.email,
            user_metadata: { name: userData.name }
          }
        );

        if (authUpdateError) {
          console.error('Auth update error:', authUpdateError);
        }

        // Update organization role
        const roleMapping = {
          'admin': 'ADMIN',
          'management': 'MANAGEMENT',
          'team_leader': 'EMPLOYEE', // team_leader is team-based, not org-level
          'team_member': 'EMPLOYEE'
        };
        
        const orgRoleValue = roleMapping[userData.org_role] || 'EMPLOYEE';
        
        const { error: roleUpdateError } = await supabaseAdmin
          .from('user_roles')
          .upsert({ 
            user_id: userId,
            role: orgRoleValue 
          });

        if (roleUpdateError) {
          console.error('Role update error:', roleUpdateError);
        }

        // Handle team memberships
        if (userData.org_role === 'team_member' || userData.org_role === 'team_leader') {
          if (userData.team) {
            // First, remove all existing memberships for this user
            await supabaseAdmin
              .from('memberships')
              .delete()
              .eq('user_id', userId);

            // Then add the new membership
            const { error: membershipError } = await supabaseAdmin
              .from('memberships')
              .insert({
                user_id: userId,
                team_id: userData.team,
                role: userData.org_role === 'team_leader' ? 'TEAM_LEADER' : 'EMPLOYEE'
              });

            if (membershipError) {
              console.error('Membership creation error:', membershipError);
            }
          }
        } else {
          // If role is admin or management, remove all team memberships
          await supabaseAdmin
            .from('memberships')
            .delete()
            .eq('user_id', userId);
        }

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'delete_user': {
        console.log('Deleting user:', userId);
        
        // First check if user exists in auth
        const { data: authUser, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(userId);
        
        let authDeletionSuccess = false;
        
        if (!getUserError && authUser?.user) {
          // User exists in auth, try to delete
          const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
          
          if (deleteError) {
            console.error('User deletion from auth error:', deleteError);
            // Continue with profile deletion even if auth deletion fails
          } else {
            authDeletionSuccess = true;
            console.log('User successfully deleted from auth');
          }
        } else {
          console.log('User not found in auth, will only delete profile:', getUserError?.message || 'User does not exist');
        }

        // Always try to clean up the profile and related data
        const { error: profileDeleteError } = await supabaseAdmin
          .from('profiles')
          .delete()
          .eq('user_id', userId);

        if (profileDeleteError) {
          console.error('Profile deletion error:', profileDeleteError);
        }

        // Clean up memberships
        const { error: membershipDeleteError } = await supabaseAdmin
          .from('memberships')
          .delete()
          .eq('user_id', userId);

        if (membershipDeleteError) {
          console.error('Membership deletion error:', membershipDeleteError);
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            authDeleted: authDeletionSuccess,
            profileDeleted: !profileDeleteError,
            message: authDeletionSuccess ? 'User completely deleted' : 'Profile cleaned up (auth user was already missing)'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});