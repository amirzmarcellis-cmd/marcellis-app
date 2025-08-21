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

    // Check if user has admin privileges using the new company_users table
    const { data: userRoles, error: roleError } = await supabaseAdmin
      .from('company_users')
      .select('role')
      .eq('user_id', user.id);

    if (roleError) {
      console.error('Error checking user roles:', roleError);
      return new Response(
        JSON.stringify({ error: 'Failed to check user roles' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const hasAdminRole = userRoles?.some(role => 
      role.role === 'platform_admin' || role.role === 'company_admin'
    );

    if (!hasAdminRole) {
      console.error('User does not have admin role');
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, userId, userData } = await req.json();

    switch (action) {
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
                name: userData.name
              });
            
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
              name: userData.name
            });

          if (profileError) {
            console.error('Profile creation error:', profileError);
          }
        }

        return new Response(
          JSON.stringify({ user: newUser, success: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'update_user': {
        console.log('Updating user:', userId);
        
        const updateData: any = {};
        if (userData.email) updateData.email = userData.email;
        if (userData.password) updateData.password = userData.password;
        if (userData.name) {
          updateData.user_metadata = { name: userData.name };
        }

        const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          updateData
        );

        if (updateError) {
          console.error('User update error:', updateError);
          return new Response(
            JSON.stringify({ error: updateError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Update profile
        if (userData.name) {
          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ name: userData.name })
            .eq('user_id', userId);

          if (profileError) {
            console.error('Profile update error:', profileError);
          }
        }

        return new Response(
          JSON.stringify({ user: updatedUser, success: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'delete_user': {
        console.log('Deleting user:', userId);
        
        const { data: deletedUser, error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (deleteError) {
          console.error('User deletion error:', deleteError);
          return new Response(
            JSON.stringify({ error: deleteError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ user: deletedUser, success: true }),
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