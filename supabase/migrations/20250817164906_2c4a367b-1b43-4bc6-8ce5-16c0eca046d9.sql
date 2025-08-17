-- Fix security warnings by updating function search paths

-- Update the update_updated_at_column function with proper security settings
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Update the trigger_google_sheets_sync function with proper security settings  
CREATE OR REPLACE FUNCTION public.trigger_google_sheets_sync()
RETURNS TRIGGER
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
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
$$;