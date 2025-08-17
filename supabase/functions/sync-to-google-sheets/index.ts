import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LeadData {
  id: string;
  user_id: string;
  session_id?: string;
  qualification_criteria: any;
  pain_point_severity?: number;
  budget_qualified?: boolean;
  timeline_qualified?: boolean;
  authority_level?: number;
  need_urgency?: number;
  fit_score?: number;
  conversion_probability?: number;
  recommended_service?: string;
  next_action?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface UserProfile {
  name?: string;
  email?: string;
  industry?: string;
  company_size?: string;
  business_type?: string;
  pain_points?: string[];
  goals?: string[];
  budget_range?: string;
  timeline?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const googleSheetsId = Deno.env.get('GOOGLE_SHEETS_ID');

    if (!googleSheetsId) {
      throw new Error('Google Sheets ID not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { sync_log_id } = await req.json();

    if (!sync_log_id) {
      throw new Error('Sync log ID required');
    }

    console.log(`Processing sync request: ${sync_log_id}`);

    // Get the sync log entry
    const { data: syncLog, error: logError } = await supabase
      .from('google_sheets_sync_log')
      .select('*')
      .eq('id', sync_log_id)
      .single();

    if (logError || !syncLog) {
      throw new Error(`Failed to fetch sync log: ${logError?.message}`);
    }

    if (syncLog.status !== 'pending') {
      console.log(`Sync log ${sync_log_id} already processed with status: ${syncLog.status}`);
      return new Response(
        JSON.stringify({ message: 'Sync already processed', status: syncLog.status }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const startTime = Date.now();

    // Get active OAuth token
    const { data: tokenData, error: tokenError } = await supabase
      .from('google_oauth_tokens')
      .select('*')
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (tokenError || !tokenData) {
      throw new Error('No valid OAuth token found. Please set up Google OAuth first.');
    }

    // Extract lead data from sync log
    const leadData: LeadData = syncLog.sync_data;
    
    // Get user profile for enrichment
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', leadData.user_id)
      .single();

    if (profileError) {
      console.warn(`Failed to fetch user profile for ${leadData.user_id}:`, profileError);
    }

    // Format data for Google Sheets
    const sheetRow = formatLeadDataForSheet(leadData, userProfile);
    
    console.log('Formatted data for Google Sheets:', JSON.stringify(sheetRow, null, 2));

    // Initialize Google Sheet if needed
    await initializeGoogleSheet(tokenData.access_token, googleSheetsId);

    // Append data to Google Sheet
    const appendResult = await appendToGoogleSheet(
      tokenData.access_token,
      googleSheetsId,
      sheetRow
    );

    const processingTime = Date.now() - startTime;

    // Update sync log with success
    await supabase
      .from('google_sheets_sync_log')
      .update({
        status: 'success',
        completed_at: new Date().toISOString(),
        processing_time_ms: processingTime,
        sheet_row_number: appendResult.updates?.updatedRows || null,
      })
      .eq('id', sync_log_id);

    console.log(`Sync completed successfully in ${processingTime}ms`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Lead synced to Google Sheets successfully',
        processing_time_ms: processingTime,
        sheet_row_number: appendResult.updates?.updatedRows
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Sync error:', error);

    // Update sync log with error
    try {
      const { sync_log_id } = await req.json();
      if (sync_log_id) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        await supabase
          .from('google_sheets_sync_log')
          .update({
            status: 'failed',
            error_message: error.message,
            completed_at: new Date().toISOString(),
          })
          .eq('id', sync_log_id);
      }
    } catch (updateError) {
      console.error('Failed to update sync log with error:', updateError);
    }
    
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

function formatLeadDataForSheet(leadData: LeadData, userProfile?: UserProfile): string[] {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatArray = (arr?: string[]) => {
    return arr ? arr.join(', ') : '';
  };

  const formatScore = (score?: number) => {
    return score ? (score * 100).toFixed(1) + '%' : '';
  };

  const formatBoolean = (value?: boolean) => {
    return value === true ? 'Yes' : value === false ? 'No' : '';
  };

  return [
    userProfile?.name || 'Unknown',
    userProfile?.email || '',
    userProfile?.industry || '',
    userProfile?.company_size || '',
    formatArray(userProfile?.pain_points),
    formatArray(userProfile?.goals),
    userProfile?.budget_range || '',
    userProfile?.timeline || '',
    formatScore(leadData.fit_score),
    formatScore(leadData.conversion_probability),
    leadData.pain_point_severity?.toString() || '',
    leadData.authority_level?.toString() || '',
    leadData.need_urgency?.toString() || '',
    formatBoolean(leadData.budget_qualified),
    formatBoolean(leadData.timeline_qualified),
    leadData.recommended_service || '',
    leadData.next_action || '',
    formatDate(leadData.created_at),
    formatDate(leadData.updated_at),
    leadData.session_id || '',
    leadData.notes || '',
  ];
}

async function initializeGoogleSheet(accessToken: string, sheetId: string) {
  try {
    // Check if sheet exists and has headers
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A1:U1`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to check sheet: ${response.status}`);
    }

    const data = await response.json();
    
    // If no headers exist, add them
    if (!data.values || data.values.length === 0) {
      console.log('Initializing Google Sheet with headers...');
      
      const headers = [
        'Name',
        'Email', 
        'Industry',
        'Company Size',
        'Pain Points',
        'Goals',
        'Budget Range',
        'Timeline',
        'Fit Score',
        'Conversion Probability',
        'Pain Severity',
        'Authority Level',
        'Need Urgency',
        'Budget Qualified',
        'Timeline Qualified',
        'Recommended Service',
        'Next Action',
        'Created Date',
        'Updated Date',
        'Session ID',
        'Notes'
      ];

      const headerResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A1:U1?valueInputOption=USER_ENTERED`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: [headers],
          }),
        }
      );

      if (!headerResponse.ok) {
        throw new Error(`Failed to add headers: ${headerResponse.status}`);
      }

      console.log('Sheet headers initialized successfully');
    }
  } catch (error) {
    console.error('Sheet initialization error:', error);
    throw error;
  }
}

async function appendToGoogleSheet(accessToken: string, sheetId: string, rowData: string[]) {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [rowData],
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to append to sheet: ${response.status} - ${error}`);
  }

  return await response.json();
}