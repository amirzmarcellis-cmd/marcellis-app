import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // Check if user has admin or super_admin role
    const { data: userRoles, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)

    if (roleError) {
      throw new Error('Failed to check user roles')
    }

    const hasAdminRole = userRoles?.some(r => 
      r.role === 'admin' || r.role === 'super_admin'
    )

    if (!hasAdminRole) {
      throw new Error('Insufficient permissions')
    }

    const { action, userId, userData } = await req.json()

    switch (action) {
      case 'create_user': {
        const { email, password, name } = userData
        
        // Create user
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          user_metadata: {
            full_name: name
          },
          email_confirm: true
        })

        if (createError) {
          throw createError
        }

        // Create profile
        if (name && newUser.user) {
          await supabaseAdmin
            .from('profiles')
            .upsert({
              user_id: newUser.user.id,
              name: name
            })
        }

        return new Response(
          JSON.stringify({ success: true, user: newUser }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'update_user': {
        const { email, password, name } = userData
        
        // Prepare update data
        const updateData: any = {
          user_metadata: {
            full_name: name
          }
        }

        if (password) {
          updateData.password = password
        }

        if (email) {
          updateData.email = email
        }

        // Update user
        const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          updateData
        )

        if (updateError) {
          throw updateError
        }

        // Update profile
        await supabaseAdmin
          .from('profiles')
          .upsert({
            user_id: userId,
            name: name || null
          })

        return new Response(
          JSON.stringify({ success: true, user: updatedUser }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'delete_user': {
        // Delete user
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

        if (deleteError) {
          throw deleteError
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        throw new Error('Invalid action')
    }

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})