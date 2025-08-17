-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a cron job to process Google Sheets sync queue every minute
SELECT cron.schedule(
  'process-google-sheets-sync',
  '* * * * *', -- every minute
  $$
  SELECT
    net.http_post(
        url:='https://dtlcprcpvdomrehbejhw.supabase.co/functions/v1/process-google-sheets-sync',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bGNwcmNwdmRvbXJlaGJlamh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MTM3ODEsImV4cCI6MjA2OTM4OTc4MX0.bSvVAJb5Y2Tszq_AcvAHaNeJs5m--kFlRH4XZ2dfP_8"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);

-- Create a cron job to refresh Google OAuth tokens every hour
SELECT cron.schedule(
  'refresh-google-oauth-tokens',
  '0 * * * *', -- every hour
  $$
  SELECT
    net.http_post(
        url:='https://dtlcprcpvdomrehbejhw.supabase.co/functions/v1/refresh-google-tokens',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bGNwcmNwdmRvbXJlaGJlamh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MTM3ODEsImV4cCI6MjA2OTM4OTc4MX0.bSvVAJb5Y2Tszq_AcvAHaNeJs5m--kFlRH4XZ2dfP_8"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);