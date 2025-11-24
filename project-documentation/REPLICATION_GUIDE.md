# Replication Guide

**Last Updated:** 2025-01

---

## From Zero to Working Build

### Prerequisites
- Node.js 18+
- npm or bun
- Supabase account
- OpenAI API key

---

## Step 1: Clone Repository
```bash
git clone <repo-url>
cd mindmaker
npm install
```

---

## Step 2: Supabase Setup
1. Create new Supabase project at supabase.com
2. Copy project ref ID and anon key
3. Create `.env` file:
```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

---

## Step 3: Database Migration
```bash
# Run all migrations in supabase/migrations/
# This creates 40+ tables, functions, triggers
supabase db push
```

---

## Step 4: Edge Function Secrets
Set in Supabase dashboard → Edge Functions → Secrets:
- `OPENAI_API_KEY`
- `RESEND_API_KEY` (optional)
- `GOOGLE_SHEETS_ID` (optional)

---

## Step 5: Deploy Edge Functions
```bash
supabase functions deploy ai-business-chat
supabase functions deploy analyze-initial-input
supabase functions deploy generate-comprehensive-blueprint
# ... repeat for all 11 functions
```

---

## Step 6: Local Development
```bash
npm run dev
# Open http://localhost:5173
```

---

## Step 7: Test Flow
1. Navigate to `/auth`
2. Enter username (creates profile)
3. Navigate to `/` (AI Ideation)
4. Complete questionnaire
5. View blueprint results

---

## Production Deployment
Deploy via Lovable Cloud (automatic) or self-host:
```bash
npm run build
# Deploy dist/ folder to Netlify, Vercel, etc.
```
