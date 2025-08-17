-- Create table for storing encrypted Google OAuth tokens
CREATE TABLE public.google_oauth_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMP WITH TIME ZONE,
  scope TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS for security
ALTER TABLE public.google_oauth_tokens ENABLE ROW LEVEL SECURITY;

-- Only system can manage OAuth tokens (admin operations only)
CREATE POLICY "System can manage OAuth tokens" 
ON public.google_oauth_tokens 
FOR ALL 
USING (false)
WITH CHECK (false);

-- Create table for Google Sheets sync logging and audit trail
CREATE TABLE public.google_sheets_sync_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  lead_qualification_id UUID REFERENCES public.lead_qualification_data(id),
  sync_type TEXT NOT NULL, -- 'insert', 'update', 'batch'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'success', 'failed', 'retry'
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  sheet_row_number INTEGER,
  sync_data JSONB,
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for sync logs
ALTER TABLE public.google_sheets_sync_log ENABLE ROW LEVEL SECURITY;

-- System can manage sync logs
CREATE POLICY "System can manage sync logs" 
ON public.google_sheets_sync_log 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates on OAuth tokens
CREATE TRIGGER update_google_oauth_tokens_updated_at
  BEFORE UPDATE ON public.google_oauth_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to trigger Google Sheets sync
CREATE OR REPLACE FUNCTION public.trigger_google_sheets_sync()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert sync request into log table
  INSERT INTO public.google_sheets_sync_log (
    user_id,
    lead_qualification_id,
    sync_type,
    sync_data
  ) VALUES (
    NEW.user_id,
    NEW.id,
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'insert'
      WHEN TG_OP = 'UPDATE' THEN 'update'
      ELSE 'unknown'
    END,
    row_to_json(NEW)::jsonb
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on lead_qualification_data for automatic sync
CREATE TRIGGER sync_lead_to_google_sheets
  AFTER INSERT OR UPDATE ON public.lead_qualification_data
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_google_sheets_sync();