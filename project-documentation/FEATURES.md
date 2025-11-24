# Features

**Last Updated:** 2025-01

---

## Feature Overview

MindMaker AI Suite consists of two primary tracks:
1. **AI Ideation** - Blueprint generation flow
2. **AI Literacy** - Knowledge-building modules

---

## 1. AI Ideation Features

### 1.1 Welcome Screen
**Purpose:** Capture initial business context  
**Location:** `src/components/WelcomeScreen.tsx`

**Functionality:**
- Hero section with branding
- Text input for initial project idea
- Start button to initiate questionnaire
- Session restoration for returning users

**User Flow:**
```
Landing → Input project idea → Start → Questionnaire
```

---

### 1.2 Structured Questionnaire
**Purpose:** Extract detailed business requirements  
**Location:** `src/components/StructuredQuestionnaire.tsx`

**Functionality:**
- 10-15 guided questions across categories:
  - Business Context (industry, company size, revenue model)
  - Target Audience (user personas, pain points)
  - Technical Environment (existing systems, data sources)
  - Success Metrics (KPIs, ROI expectations)
  - Timeline & Budget (constraints, deadlines)
  
- Progress tracking with visual indicator
- Conversation history display
- Dynamic question generation based on prior answers
- Save/resume capability

**Backend Integration:**
- `supabase/functions/generate-dynamic-questions/` - Context-aware question generation
- `supabase/functions/analyze-initial-input/` - Extract business context from input

**Data Storage:**
- `conversation_sessions` table - Session tracking
- `chat_messages` table - Question/answer pairs
- `ai_conversations` table - AI-generated insights

---

### 1.3 Blueprint Generation
**Purpose:** Create comprehensive AI implementation strategy  
**Location:** `src/components/BlueprintResults.tsx`

**Output Components:**
1. **Executive Summary**
   - 2-3 paragraph overview
   - Key opportunities and risks
   - Expected ROI and timeline

2. **Technical Specifications**
   - Recommended AI models and tools
   - Data requirements and sources
   - Integration points with existing systems

3. **User Experience Design**
   - Wireframes and user flows
   - Feature specifications
   - Success metrics per feature

4. **Implementation Roadmap**
   - Phased rollout plan (30/60/90 days)
   - Resource requirements
   - Dependencies and blockers

5. **Lovable-Ready Prompts**
   - 5-10 actionable prompts for immediate build
   - Prioritized by business impact
   - Pre-formatted for Lovable IDE

6. **Workflow Suggestions**
   - Detailed process maps
   - Duration estimates
   - Dependencies and deliverables

7. **AI Agent Recommendations**
   - Specific agents for each use case
   - Configuration guidance
   - Integration strategies

**Backend Integration:**
- `supabase/functions/generate-comprehensive-blueprint/` - Main blueprint generation
- `supabase/functions/generate-blueprint/` - Workflow and agent suggestions
- Uses GPT-4o or GPT-5-2025-08-07 (with fallback)

**Export Options:**
- PDF download (via `src/lib/buildProposalPdf.ts`)
- Email delivery
- Save to profile for later access

---

### 1.4 Conversation History
**Purpose:** Track all interactions within a session  
**Location:** `src/components/ConversationHistory.tsx`

**Functionality:**
- Chronological display of Q&A
- Visual differentiation (user vs. AI)
- Step-by-step progress indicators
- Expandable/collapsible for long sessions

---

### 1.5 Business Insights Dashboard
**Purpose:** Visualize key metrics from assessment  
**Location:** `src/components/BusinessInsights.tsx`

**Functionality:**
- Lead qualification scoring
- Engagement analytics
- ROI projections
- Risk assessment

**Data Sources:**
- `lead_qualification_scores` table
- `conversion_analytics` table
- Real-time calculation via edge functions

---

## 2. AI Literacy Features

### 2.1 Learning Path
**Purpose:** Personalized skill development  
**Location:** `src/components/literacy/LearningPath.tsx`

**Functionality:**
- Role-based module recommendations
- Prerequisite tracking
- Progress visualization
- Difficulty progression (Beginner → Advanced)

**Module Categories:**
- Foundations (AI basics, terminology)
- Business Applications (use case identification)
- Prompt Engineering (effective AI interaction)
- Ethics & Governance (responsible AI)

---

### 2.2 Daily Challenges
**Purpose:** Reinforce learning through practice  
**Location:** `src/components/literacy/DailyChallenge.tsx`

**Functionality:**
- One new challenge per day
- Scenario-based questions
- Immediate feedback
- Streak tracking

**Challenge Types:**
- Multiple choice
- Short answer
- Prompt optimization
- Case study analysis

---

### 2.3 Stats & Progress Tracking
**Purpose:** Visualize learning progress  
**Location:** `src/components/literacy/StatsOverview.tsx`

**Metrics:**
- Modules completed
- Daily streak count
- Average scores
- Time invested
- Skill level progression

---

## 3. Cross-Cutting Features

### 3.1 Authentication & Profiles
**Purpose:** User identification and session management  
**Location:** `src/contexts/AuthContext.tsx`, `src/components/auth/UsernameForm.tsx`

**Functionality:**
- Username-based authentication (no password)
- Anonymous session support
- Profile creation and management
- Session restoration on return visits

**Data Model:**
- `profiles` table - User profiles
- `conversation_sessions` table - Session tracking
- `leaders` table - Executive profiles
- `leader_assessments` table - Assessment history

---

### 3.2 Navigation
**Purpose:** Move between Ideation and Literacy tracks  
**Location:** `src/components/MainNav.tsx`

**Functionality:**
- Logo link to home
- Track switcher (Ideation / Literacy)
- User profile menu
- Responsive mobile menu

---

### 3.3 Visual Effects & Animations
**Purpose:** Premium feel and engagement  
**Location:** `src/components/NeuronLoop.tsx`, `src/index.css`

**Functionality:**
- Animated neuron network background
- Shimmer effects on hero text
- Fade-in-up animations for content
- Progress ring animations
- Glass morphism effects

---

## 4. Backend Features

### 4.1 Edge Functions (11 total)
**Purpose:** AI processing, integrations, data transformations

| Function | Purpose |
|----------|---------|
| `ai-business-chat` | Conversational AI for follow-up questions |
| `analyze-initial-input` | Extract business context from user input |
| `analyze-input` | Semantic analysis + follow-up questions |
| `generate-blueprint` | Create Lovable prompts and workflows |
| `generate-comprehensive-blueprint` | Full blueprint generation |
| `generate-dynamic-questions` | Context-aware questionnaire |
| `generate-pdf-blueprint` | PDF export of blueprints |
| `generate-questions` | Initial question set generation |
| `parse-website` | Extract info from URLs (future) |
| `send-admin-notification` | Alert admins of key events |
| `test-email` | Email delivery testing |

**Additional Functions (Google Sheets Integration):**
- `setup-google-oauth`, `refresh-google-tokens`, `sync-to-google-sheets`, `process-google-sheets-sync`, `test-google-sheets-integration`

---

### 4.2 Database Schema
**Purpose:** Persist user data, sessions, assessments

**Key Tables:**
- `profiles` - User profiles
- `conversation_sessions` - Ideation sessions
- `chat_messages` - Q&A history
- `ai_conversations` - AI-generated insights
- `booking_requests` - Service inquiries
- `lead_qualification_scores` - Lead scoring
- `leaders` - Executive profiles
- `leader_assessments` - Assessment results
- `ai_literacy_modules` - Learning content

**Total Tables:** 40+ (see `src/integrations/supabase/types.ts`)

---

### 4.3 Google Sheets Integration
**Purpose:** CRM sync for lead management

**Functionality:**
- Auto-sync booking requests
- Lead qualification data export
- Sync log tracking
- Error handling and retry logic

**Tables:**
- `google_sheets_sync_log` - Sync history

---

### 4.4 Email Notifications
**Purpose:** Admin alerts and user confirmations

**Integration:** Resend API (via `RESEND_API_KEY` secret)

---

## 5. Planned Features (Not Yet Implemented)

- **Team Collaboration:** Multi-user sessions, shared blueprints
- **Industry Templates:** Pre-built blueprints for common use cases
- **Advanced Analytics:** Cohort analysis, A/B testing
- **API Access:** Programmatic blueprint generation
- **White-Label Mode:** Custom branding for B2B partners
