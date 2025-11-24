# Architecture

**Last Updated:** 2025-01

---

## System Overview

**Stack:** React + TypeScript + Supabase (PostgreSQL + Edge Functions)  
**Deployment:** Lovable Cloud  
**AI Models:** OpenAI GPT-4o/GPT-5, Gemini API

---

## Frontend Architecture

**Framework:** React 18 + Vite  
**Routing:** React Router v6  
**State:** React Context API (AuthContext)  
**Styling:** Tailwind CSS + shadcn/ui  
**Animations:** Framer Motion

**Key Pages:**
- `/` - AI Ideation flow (Index.tsx)
- `/auth` - Landing + authentication (Auth.tsx)
- `/ai-literacy` - Learning modules (AILiteracy.tsx)

---

## Backend Architecture

**Database:** Supabase PostgreSQL (40+ tables)  
**Functions:** 11 edge functions (Deno runtime)  
**Auth:** Username-based (no password)  
**Storage:** Supabase Storage (QR codes, future: user uploads)

**Edge Functions:**
1. `ai-business-chat` - Follow-up conversations
2. `analyze-initial-input` - Extract business context
3. `generate-comprehensive-blueprint` - Full blueprint generation
4. `generate-dynamic-questions` - Context-aware questions
5. `generate-pdf-blueprint` - PDF export
6. Google Sheets integration (5 functions)

---

## Data Flow

**AI Ideation Flow:**
```
User Input → analyze-initial-input → conversation_sessions
  ↓
generate-dynamic-questions → chat_messages
  ↓
User Responses → generate-comprehensive-blueprint
  ↓
Blueprint → BlueprintResults → PDF Export
```

**Key Tables:**
- `profiles` - User profiles
- `conversation_sessions` - Session tracking
- `chat_messages` - Q&A history
- `booking_requests` - Service inquiries
- `lead_qualification_scores` - Lead scoring

---

## Integrations

**AI APIs:**
- OpenAI (primary)
- Gemini (future)

**Third-Party:**
- Google Sheets (CRM sync)
- Resend (email)
- Stripe (future: payments)

---

## Security

**RLS Policies:** Enabled on all user-facing tables  
**Auth:** Supabase Auth (username-based)  
**Secrets:** Stored in Supabase Edge Function secrets

---

## Performance

**Optimizations:**
- React lazy loading
- Image optimization (WebP)
- Edge function caching (future)
- Database indexing on common queries
