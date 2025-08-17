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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Processing pending Google Sheets sync requests...');

    // Get pending sync requests (with retry logic)
    const { data: pendingSyncs, error: fetchError } = await supabase
      .from('google_sheets_sync_log')
      .select('*')
      .in('status', ['pending', 'failed'])
      .lt('retry_count', 3) // Max 3 retries
      .order('created_at', { ascending: true })
      .limit(10); // Process in batches

    if (fetchError) {
      console.error('Failed to fetch pending syncs:', fetchError);
      throw new Error('Failed to fetch pending sync requests');
    }

    if (!pendingSyncs || pendingSyncs.length === 0) {
      console.log('No pending sync requests found');
      return new Response(
        JSON.stringify({ message: 'No pending sync requests', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${pendingSyncs.length} pending sync requests`);

    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Process each sync request
    for (const syncLog of pendingSyncs) {
      try {
        console.log(`Processing sync log ${syncLog.id} (attempt ${syncLog.retry_count + 1})`);

        // Mark as processing (to prevent duplicate processing)
        await supabase
          .from('google_sheets_sync_log')
          .update({
            retry_count: syncLog.retry_count + 1,
          })
          .eq('id', syncLog.id);

        // Call the sync function
        const syncResponse = await fetch(`${supabaseUrl}/functions/v1/sync-to-google-sheets`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            sync_log_id: syncLog.id,
          }),
        });

        if (syncResponse.ok) {
          const result = await syncResponse.json();
          if (result.success) {
            successCount++;
            console.log(`Sync ${syncLog.id} completed successfully`);
          } else {
            errorCount++;
            errors.push(`Sync ${syncLog.id} failed: ${result.error}`);
            console.error(`Sync ${syncLog.id} failed:`, result.error);
          }
        } else {
          const errorText = await syncResponse.text();
          errorCount++;
          errors.push(`Sync ${syncLog.id} HTTP error: ${syncResponse.status} - ${errorText}`);
          console.error(`Sync ${syncLog.id} HTTP error:`, syncResponse.status, errorText);

          // Mark as failed if max retries reached
          if (syncLog.retry_count + 1 >= 3) {
            await supabase
              .from('google_sheets_sync_log')
              .update({
                status: 'failed',
                error_message: `Max retries reached. Last error: ${errorText}`,
                completed_at: new Date().toISOString(),
              })
              .eq('id', syncLog.id);
          }
        }

        processedCount++;

      } catch (error) {
        console.error(`Error processing sync ${syncLog.id}:`, error);
        errorCount++;
        errors.push(`Sync ${syncLog.id} processing error: ${error.message}`);

        // Mark as failed if max retries reached
        if (syncLog.retry_count + 1 >= 3) {
          await supabase
            .from('google_sheets_sync_log')
            .update({
              status: 'failed',
              error_message: `Max retries reached. Last error: ${error.message}`,
              completed_at: new Date().toISOString(),
            })
            .eq('id', syncLog.id);
        }
      }

      // Add small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`Batch processing completed. Processed: ${processedCount}, Success: ${successCount}, Errors: ${errorCount}`);

    // Log batch processing result
    await supabase
      .from('security_audit_log')
      .insert({
        action: 'google_sheets_batch_sync',
        resource: 'google_sheets_integration',
        details: {
          processed: processedCount,
          success: successCount,
          errors: errorCount,
          error_details: errors.length > 0 ? errors : undefined,
        },
        success: errorCount === 0,
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Batch sync processing completed',
        processed: processedCount,
        success_count: successCount,
        error_count: errorCount,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Batch processing error:', error);

    return new Response(
      JSON.stringify({
        error: error.message,
        success: false,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Schedule this function to run every minute to process pending syncs
// This can be set up via cron job or called from a scheduled trigger