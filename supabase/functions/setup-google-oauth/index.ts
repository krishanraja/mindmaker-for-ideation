import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const googleOAuthCredentials = Deno.env.get('GOOGLE_OAUTH_CREDENTIALS');

    if (!googleOAuthCredentials) {
      throw new Error('Google OAuth credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const credentials = JSON.parse(googleOAuthCredentials);

    const { code, admin_user_id } = await req.json();

    if (!code || !admin_user_id) {
      throw new Error('Authorization code and admin user ID required');
    }

    console.log('Exchanging authorization code for tokens...');

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: credentials.client_id,
        client_secret: credentials.client_secret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: credentials.redirect_uris[0], // Use first redirect URI
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Token exchange failed:', error);
      throw new Error(`Token exchange failed: ${error}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('Token exchange successful');

    // Calculate token expiry
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);

    // Store tokens securely in database (only for admin user)
    const { error: insertError } = await supabase
      .from('google_oauth_tokens')
      .upsert({
        user_id: admin_user_id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_type: tokenData.token_type || 'Bearer',  
        expires_at: expiresAt.toISOString(),
        scope: tokenData.scope,
        is_active: true,
      });

    if (insertError) {
      console.error('Failed to store tokens:', insertError);
      throw new Error('Failed to store OAuth tokens');
    }

    console.log('OAuth tokens stored successfully');

    // Log the OAuth setup
    await supabase
      .from('security_audit_log')
      .insert({
        user_id: admin_user_id,
        action: 'google_oauth_setup',
        resource: 'google_sheets_integration',
        details: { 
          scope: tokenData.scope,
          token_expires_at: expiresAt.toISOString()
        },
        success: true,
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Google OAuth setup completed successfully',
        expires_at: expiresAt.toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('OAuth setup error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});