# Common Issues

**Last Updated:** 2025-01

---

## Known Issues

### 1. Logo Import Errors
**Symptom:** White screen, "cannot find module" error  
**Cause:** Missing `mindmaker-hero-logo.png` in `src/assets/`  
**Fix:** Ensure logo file exists, restart dev server

### 2. Supabase Types Out of Sync
**Symptom:** TypeScript errors on database queries  
**Cause:** Database schema changed but types not regenerated  
**Fix:** Run `supabase gen types typescript` (handled automatically by Lovable)

### 3. Edge Function Timeouts
**Symptom:** 504 Gateway Timeout on blueprint generation  
**Cause:** OpenAI API slow or edge function timeout (default: 30s)  
**Fix:** Increase timeout in `supabase/config.toml` or add retry logic

### 4. Dark Mode Flickering
**Symptom:** Brief white flash on page load  
**Cause:** Dark mode class applied after initial render  
**Fix:** Add dark mode script to `index.html` head (future)

---

## Troubleshooting

**Console Logs:** Check browser console for errors  
**Network Tab:** Inspect API calls, check for 500/timeout errors  
**Supabase Logs:** Check Edge Function logs in Supabase dashboard  
**Database:** Query `google_sheets_sync_log` for integration issues
