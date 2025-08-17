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

    console.log('Checking for tokens that need refresh...');

    // Get tokens that are expired or expire within 5 minutes
    const fiveMinutesFromNow = new Date();
    fiveMinutesFromNow.setMinutes(fiveMinutesFromNow.getMinutes() + 5);

    const { data: tokens, error: fetchError } = await supabase
      .from('google_oauth_tokens')
      .select('*')
      .eq('is_active', true)
      .lt('expires_at', fiveMinutesFromNow.toISOString());

    if (fetchError) {
      console.error('Failed to fetch tokens:', fetchError);
      throw new Error('Failed to fetch OAuth tokens');
    }

    if (!tokens || tokens.length === 0) {
      console.log('No tokens need refreshing');
      return new Response(
        JSON.stringify({ message: 'No tokens need refreshing', refreshed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let refreshedCount = 0;
    let errors = [];

    for (const token of tokens) {
      try {
        if (!token.refresh_token) {
          console.error(`No refresh token available for user ${token.user_id}`);
          errors.push(`No refresh token for user ${token.user_id}`);
          continue;
        }

        console.log(`Refreshing token for user ${token.user_id}...`);

        // Refresh the access token
        const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: credentials.client_id,
            client_secret: credentials.client_secret,
            refresh_token: token.refresh_token,
            grant_type: 'refresh_token',
          }),
        });

        if (!refreshResponse.ok) {
          const error = await refreshResponse.text();
          console.error(`Token refresh failed for user ${token.user_id}:`, error);
          errors.push(`Token refresh failed for user ${token.user_id}: ${error}`);
          continue;
        }

        const refreshData = await refreshResponse.json();
        
        // Calculate new expiry
        const newExpiresAt = new Date();
        newExpiresAt.setSeconds(newExpiresAt.getSeconds() + refreshData.expires_in);

        // Update the token in database
        const { error: updateError } = await supabase
          .from('google_oauth_tokens')
          .update({
            access_token: refreshData.access_token,
            refresh_token: refreshData.refresh_token || token.refresh_token, // Keep existing if not provided
            expires_at: newExpiresAt.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', token.id);

        if (updateError) {
          console.error(`Failed to update token for user ${token.user_id}:`, updateError);
          errors.push(`Failed to update token for user ${token.user_id}`);
          continue;
        }

        refreshedCount++;
        console.log(`Token refreshed successfully for user ${token.user_id}`);

        // Log the refresh
        await supabase
          .from('security_audit_log')
          .insert({
            user_id: token.user_id,
            action: 'google_token_refresh',
            resource: 'google_sheets_integration',
            details: { 
              new_expires_at: newExpiresAt.toISOString(),
              token_id: token.id
            },
            success: true,
          });

      } catch (error) {
        console.error(`Error refreshing token for user ${token.user_id}:`, error);
        errors.push(`Error refreshing token for user ${token.user_id}: ${error.message}`);
      }
    }

    console.log(`Token refresh completed. Refreshed: ${refreshedCount}, Errors: ${errors.length}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Token refresh completed`,
        refreshed: refreshedCount,
        errors: errors.length > 0 ? errors : undefined
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Token refresh error:', error);
    
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