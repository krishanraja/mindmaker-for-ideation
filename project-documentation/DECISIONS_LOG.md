# Decisions Log

**Last Updated:** 2025-01

---

## Architectural Decisions

### 1. Username-Based Auth (No Passwords)
**Decision:** Use username-only authentication  
**Rationale:** Reduce friction, executive users prefer simplicity  
**Trade-offs:** Lower security, suitable for non-sensitive data  
**Date:** 2024-Q4

### 2. Supabase Over Firebase
**Decision:** Use Supabase for backend  
**Rationale:** PostgreSQL > NoSQL for relational data, better developer experience  
**Trade-offs:** Smaller ecosystem than Firebase  
**Date:** 2024-Q4

### 3. Edge Functions Over Backend Server
**Decision:** Use Supabase Edge Functions (Deno) instead of Node.js server  
**Rationale:** Serverless scaling, lower operational complexity  
**Trade-offs:** 30s timeout limit, limited npm package support  
**Date:** 2024-Q4

### 4. Dual-Track Platform (Ideation + Literacy)
**Decision:** Combine strategy generation with team training  
**Rationale:** Strategy alone doesn't work without team capability  
**Trade-offs:** More complex product, harder to explain  
**Date:** 2025-Q1

### 5. Purple/Violet Rebrand
**Decision:** Switch from blue/white to purple/violet gradient  
**Rationale:** Stronger brand differentiation, premium feel  
**Trade-offs:** Required full design system overhaul  
**Date:** 2025-Q1

---

## Technical Decisions

### 1. Semantic Tokens (CSS Variables)
**Decision:** Use HSL-based CSS variables for all colors  
**Rationale:** Themability, dark mode support, consistency  
**Date:** 2025-Q1

### 2. shadcn/ui Over Material-UI
**Decision:** Use shadcn/ui component library  
**Rationale:** Lightweight, copy-paste model, full customization  
**Date:** 2024-Q4

### 3. Framer Motion for Animations
**Decision:** Use Framer Motion over CSS animations  
**Rationale:** Declarative API, better orchestration, React-first  
**Date:** 2024-Q4
