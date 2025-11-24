# MindMaker AI Suite - Project Documentation

**Version:** 1.0  
**Last Updated:** 2025-01  
**Project ID:** bkyuxvschuwngtcdhsyg

---

## Quick Links

### Product & Strategy
- [Purpose](./PURPOSE.md) - App purpose and mission
- [ICP (Ideal Customer Profile)](./ICP.md) - Target users and segments
- [Features](./FEATURES.md) - Core features and capabilities
- [Outcomes](./OUTCOMES.md) - User outcomes and success metrics
- [Value Proposition](./VALUE_PROP.md) - Unique selling points

### Design & Brand
- [Design System](./DESIGN_SYSTEM.md) - Tokens, spacing, typography, components
- [Branding](./BRANDING.md) - Tone, color choices, brand identity
- [Visual Guidelines](./VISUAL_GUIDELINES.md) - Layout preferences, visual patterns

### Technical
- [Architecture](./ARCHITECTURE.md) - Backend architecture and data flow
- [Replication Guide](./REPLICATION_GUIDE.md) - Full setup from scratch
- [Common Issues](./COMMON_ISSUES.md) - Known bugs and troubleshooting
- [Decisions Log](./DECISIONS_LOG.md) - Architectural decisions and rationale
- [History](./HISTORY.md) - Evolution and major milestones

---

## Project Overview

MindMaker AI Suite is a dual-track platform for executive-focused AI transformation:
1. **AI Ideation** - Generate comprehensive business blueprints and AI strategies
2. **AI Literacy** - Build AI knowledge through interactive exercises

**Tech Stack:**
- Frontend: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- Backend: Supabase (PostgreSQL, Edge Functions, Auth, Storage)
- AI: OpenAI GPT-4/5, Gemini API
- Deployment: Lovable Cloud

**Project Structure:**
```
mindmaker/
├── src/
│   ├── components/          # React components
│   ├── pages/               # Route pages (Auth, Index, AILiteracy, NotFound)
│   ├── contexts/            # React contexts (AuthContext)
│   ├── hooks/               # Custom hooks
│   ├── lib/                 # Utilities (PDF generation, naming, chunking)
│   ├── integrations/        # Supabase client and types
│   └── assets/              # Images, fonts, logos
├── supabase/
│   ├── functions/           # Edge functions (11 total)
│   └── config.toml          # Supabase configuration
└── project-documentation/   # This folder

```

---

## Key Files

| File | Purpose |
|------|---------|
| `src/pages/Index.tsx` | Main AI Ideation flow (Welcome → Questionnaire → Blueprint) |
| `src/pages/Auth.tsx` | Landing and authentication page |
| `src/pages/AILiteracy.tsx` | AI Literacy module with daily challenges |
| `src/contexts/AuthContext.tsx` | Profile and session management |
| `src/index.css` | Complete design system (colors, tokens, animations) |
| `tailwind.config.ts` | Tailwind configuration with semantic tokens |
| `supabase/functions/` | 11 edge functions for AI processing and integrations |

---

## Documentation Standards

All documentation follows:
- **Concise, technical, instruction-led style**
- **Zero duplication** - cross-reference instead of repeating
- **Standardized terminology** (see BRANDING.md for glossary)
- **Version control** - date-stamp all major changes
- **Code examples** where applicable

---

## Quick Start

For new developers:
1. Read [REPLICATION_GUIDE.md](./REPLICATION_GUIDE.md) first
2. Review [ARCHITECTURE.md](./ARCHITECTURE.md) for data flow
3. Check [COMMON_ISSUES.md](./COMMON_ISSUES.md) for known gotchas
4. Reference [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) when building UI

---

## Contribution Guidelines

When updating documentation:
1. Update the "Last Updated" date at the top of the file
2. Follow the existing style and structure
3. Add cross-references to related docs
4. Update this README if adding new files
5. Run a search for terminology consistency

---

## Support

- **Project URL:** https://lovable.dev/projects/8ade4947-779b-4483-8159-123e99eee7b9
- **Supabase Dashboard:** https://supabase.com/dashboard/project/bkyuxvschuwngtcdhsyg
- **GitHub Repo:** (connected via Lovable GitHub integration)
