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
    const googleSheetsId = Deno.env.get('GOOGLE_SHEETS_ID');
    const googleOAuthCreds = Deno.env.get('GOOGLE_OAUTH_CREDENTIALS');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Testing Google Sheets integration setup...');

    const testResults = {
      environment_check: {},
      database_check: {},
      oauth_check: {},
      sync_queue_check: {},
      overall_status: 'unknown'
    };

    // 1. Environment Variables Check
    console.log('1. Checking environment variables...');
    testResults.environment_check = {
      supabase_url: !!supabaseUrl,
      supabase_service_key: !!supabaseServiceKey,
      google_sheets_id: !!googleSheetsId,
      google_oauth_credentials: !!googleOAuthCreds,
      status: !!supabaseUrl && !!supabaseServiceKey && !!googleSheetsId && !!googleOAuthCreds ? 'pass' : 'fail'
    };

    // 2. Database Tables Check
    console.log('2. Checking database tables...');
    try {
      // Check if our custom tables exist
      const { data: oauthTokens, error: oauthError } = await supabase
        .from('google_oauth_tokens')
        .select('id')
        .limit(1);

      const { data: syncLogs, error: syncError } = await supabase
        .from('google_sheets_sync_log')
        .select('id')
        .limit(1);

      const { data: leadData, error: leadError } = await supabase
        .from('lead_qualification_data')
        .select('id')
        .limit(1);

      testResults.database_check = {
        google_oauth_tokens_table: !oauthError,
        google_sheets_sync_log_table: !syncError,
        lead_qualification_data_table: !leadError,
        status: !oauthError && !syncError && !leadError ? 'pass' : 'fail'
      };

    } catch (error) {
      testResults.database_check = {
        error: error.message,
        status: 'fail'
      };
    }

    // 3. OAuth Token Check
    console.log('3. Checking OAuth tokens...');
    try {
      const { data: activeTokens, error: tokenError } = await supabase
        .from('google_oauth_tokens')
        .select('*')
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString());

      testResults.oauth_check = {
        active_tokens_found: activeTokens ? activeTokens.length : 0,
        tokens_valid: !tokenError && activeTokens && activeTokens.length > 0,
        next_expiry: activeTokens && activeTokens.length > 0 ? activeTokens[0].expires_at : null,
        status: !tokenError && activeTokens && activeTokens.length > 0 ? 'pass' : 'setup_required'
      };

    } catch (error) {
      testResults.oauth_check = {
        error: error.message,
        status: 'fail'
      };
    }

    // 4. Sync Queue Check
    console.log('4. Checking sync queue...');
    try {
      const { data: pendingSyncs, error: queueError } = await supabase
        .from('google_sheets_sync_log')
        .select('status')
        .in('status', ['pending', 'failed']);

      const { data: recentSyncs, error: recentError } = await supabase
        .from('google_sheets_sync_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      testResults.sync_queue_check = {
        pending_syncs: pendingSyncs ? pendingSyncs.length : 0,
        recent_syncs: recentSyncs ? recentSyncs.length : 0,
        recent_sync_statuses: recentSyncs ? recentSyncs.map(s => ({ status: s.status, created_at: s.created_at })) : [],
        status: !queueError && !recentError ? 'pass' : 'fail'
      };

    } catch (error) {
      testResults.sync_queue_check = {
        error: error.message,
        status: 'fail'
      };
    }

    // 5. Overall Status Assessment
    const allPassed = Object.values(testResults).every(check => 
      typeof check === 'object' && check.status === 'pass'
    );
    
    const needsSetup = testResults.oauth_check.status === 'setup_required';
    
    testResults.overall_status = allPassed ? 'ready' : needsSetup ? 'needs_oauth_setup' : 'has_issues';

    console.log('Integration test completed:', testResults.overall_status);

    // Generate setup instructions if needed
    let setupInstructions = null;
    if (testResults.overall_status !== 'ready') {
      setupInstructions = {
        next_steps: [],
        oauth_setup_url: null
      };

      if (testResults.environment_check.status !== 'pass') {
        setupInstructions.next_steps.push('Configure missing environment variables in Supabase Edge Functions secrets');
      }

      if (testResults.oauth_check.status === 'setup_required') {
        if (googleOAuthCreds) {
          try {
            const creds = JSON.parse(googleOAuthCreds);
            const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
              `client_id=${creds.client_id}&` +
              `redirect_uri=${encodeURIComponent(creds.redirect_uris[0])}&` +
              `response_type=code&` +
              `scope=${encodeURIComponent('https://www.googleapis.com/auth/spreadsheets')}&` +
              `access_type=offline&` +
              `prompt=consent`;
            
            setupInstructions.oauth_setup_url = authUrl;
            setupInstructions.next_steps.push('Complete Google OAuth setup using the provided URL');
          } catch (error) {
            setupInstructions.next_steps.push('Fix Google OAuth credentials format in environment variables');
          }
        } else {
          setupInstructions.next_steps.push('Add Google OAuth credentials to environment variables');
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        integration_status: testResults.overall_status,
        test_results: testResults,
        setup_instructions: setupInstructions,
        timestamp: new Date().toISOString()
      }),     
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Integration test error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        integration_status: 'error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});