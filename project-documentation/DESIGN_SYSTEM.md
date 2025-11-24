# Design System

**Last Updated:** 2025-01  
**Version:** 1.0

---

## Overview

MindMaker uses a **semantic token-based design system** built on Tailwind CSS. All colors, spacing, typography, and components reference CSS variables defined in `src/index.css` and `tailwind.config.ts`.

**Core Principle:** Never use hardcoded values. Always use semantic tokens for themability and consistency.

---

## 1. Color System

### 1.1 Semantic Tokens (HSL format)
All colors are defined as HSL variables for easy manipulation.

**Base Colors:**
```css
--background: 0 0% 100%;        /* White background */
--foreground: 222 47% 11%;      /* Dark text */
--muted: 210 40% 96%;           /* Muted background */
--muted-foreground: 215 28% 25%; /* Muted text */
```

**Brand Colors:**
```css
--primary: 248 73% 67%;          /* Purple #667eea */
--primary-100: 248 73% 97%;      /* Lightest purple */
--primary-200: 248 73% 90%;
--primary-400: 248 73% 75%;
--primary-600: 248 73% 55%;      /* Darkest purple */

--accent: 264 35% 46%;           /* Violet #764ba2 */
--accent-400: 264 35% 56%;
--accent-foreground: 0 0% 100%;
```

**Semantic Colors:**
```css
--destructive: 0 84% 60%;        /* Red for errors */
--success: 142 76% 36%;          /* Green for success */
--destructive-foreground: 210 40% 98%;
--success-foreground: 355 100% 100%;
```

**Surface Colors:**
```css
--card: 0 0% 100%;               /* White card background */
--border: 214 32% 91%;           /* Light border */
--ring: 262 100% 63%;            /* Focus ring */
--input: 214 32% 91%;            /* Input border */
--popover: 0 0% 100%;            /* Popover background */
```

**Usage in Components:**
```tsx
// ✅ CORRECT
<div className="bg-primary text-primary-foreground">

// ❌ WRONG
<div className="bg-[#667eea] text-white">
```

---

### 1.2 Dark Mode
Dark mode uses the same semantic tokens with different values:

```css
.dark {
  --background: 222 47% 7%;      /* Dark background */
  --foreground: 210 40% 98%;     /* Light text */
  --card: 222 47% 9%;
  --border: 222 28% 18%;
  /* ... etc */
}
```

**Activation:** Add `dark` class to `<html>` element.

---

### 1.3 Brand Gradients
Predefined gradients for consistency:

```css
--gradient-brand: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%);
--gradient-subtle: linear-gradient(135deg, hsl(var(--primary-200)) 0%, hsl(var(--primary-400)) 100%);
```

**Usage:**
```tsx
<div className="bg-brand-gradient">
  Gradient background
</div>
```

---

## 2. Typography

### 2.1 Font Families
```css
font-family: {
  sans: ['Inter', 'system-ui', 'sans-serif'],      /* Body text */
  gobold: ['Gobold', 'Impact', 'Arial Black'],     /* Headings */
}
```

**Font Loading:**
- Gobold loaded via `@font-face` in `index.css`
- Inter loaded from Google Fonts (or system fallback)

---

### 2.2 Type Scale
Mobile-first responsive typography:

```css
.mobile-text-sm   /* text-sm sm:text-base md:text-lg */
.mobile-text-base /* text-base sm:text-lg md:text-xl */
.mobile-text-lg   /* text-lg sm:text-xl md:text-2xl */
.mobile-text-xl   /* text-xl sm:text-2xl md:text-3xl */
```

**Usage:**
```tsx
<h1 className="mobile-text-xl font-bold">
  Responsive Heading
</h1>
```

---

### 2.3 Font Weights
- **Regular:** 400 (body text)
- **Medium:** 500 (subheadings)
- **Semibold:** 600 (buttons, labels)
- **Bold:** 700 (headings)

---

## 3. Spacing

### 3.1 Base Unit
Tailwind default: `1 unit = 0.25rem = 4px`

**Common Spacing:**
- `p-4` = 16px
- `p-6` = 24px
- `p-8` = 32px
- `gap-4` = 16px gap
- `space-y-6` = 24px vertical spacing

---

### 3.2 Layout Utilities
```css
.section-padding {
  @apply py-8 sm:py-12 md:py-20 lg:py-24;
}

.container-width {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}

.mobile-spacing {
  @apply space-y-4 sm:space-y-6 md:space-y-8;
}

.mobile-padding {
  @apply p-4 sm:p-6 md:p-8;
}
```

---

### 3.3 Safe Area (Mobile)
```css
.pt-safe-top {
  padding-top: max(1rem, env(safe-area-inset-top));
}

.pb-safe-bottom {
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
}
```

---

## 4. Border Radius

**Tokens:**
```css
--radius: 0.75rem;  /* 12px base radius */
```

**Derived Values:**
- `rounded-lg` = `var(--radius)` = 12px
- `rounded-md` = `calc(var(--radius) - 2px)` = 10px
- `rounded-sm` = `calc(var(--radius) - 4px)` = 8px

---

## 5. Shadows

**Predefined Shadows:**
```css
.card {
  box-shadow: 0 4px 12px hsl(var(--foreground) / 0.08);
}

.glass-card {
  box-shadow: 0 8px 32px hsl(var(--foreground) / 0.08);
}
```

---

## 6. Component Patterns

### 6.1 Card
```css
.card {
  background-color: hsl(var(--card));
  color: hsl(var(--card-foreground));
  border: 1px solid hsl(var(--border));
  border-radius: 1rem;
  box-shadow: 0 4px 12px hsl(var(--foreground) / 0.08);
}
```

**Usage:**
```tsx
<div className="card p-6">
  Card content
</div>
```

---

### 6.2 Glass Morphism
```css
.glass-card {
  background: hsl(var(--background) / 0.95) !important;
  backdrop-filter: blur(12px) !important;
  border: 1px solid hsl(var(--border) / 0.3) !important;
  border-radius: 1rem !important;
  box-shadow: 0 8px 32px hsl(var(--foreground) / 0.08) !important;
}

.glass-card-dark {
  background: hsl(var(--card) / 0.1) !important;
  backdrop-filter: blur(12px) !important;
  /* ... */
}
```

---

### 6.3 Buttons
Buttons use shadcn/ui `Button` component with variants:

**Variants:**
- `default` - Primary brand button
- `secondary` - Muted button
- `outline` - Outlined button
- `ghost` - Transparent button
- `destructive` - Red error button

**Example:**
```tsx
import { Button } from "@/components/ui/button";

<Button variant="default">Primary Action</Button>
<Button variant="outline">Secondary Action</Button>
```

---

## 7. Animations

### 7.1 Keyframe Animations
```css
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes hero-text-shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

@keyframes subtle-glow {
  0%, 100% { transform: scale(1); filter: brightness(1); }
  50% { transform: scale(1.02); filter: brightness(1.1); }
}
```

---

### 7.2 Animation Classes
```css
.fade-in-up {
  animation: fade-in-up 0.6s ease-out forwards;
  opacity: 0;
}

.hero-text-shimmer {
  animation: hero-text-shimmer 10s linear 2s 1;
  animation-fill-mode: forwards;
}

.number-update {
  animation: subtle-glow 0.5s ease-out;
}
```

---

### 7.3 Motion Library
Uses `framer-motion` for advanced animations:

**Example:**
```tsx
import { motion } from "framer-motion";

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Animated content
</motion.div>
```

---

## 8. Responsive Breakpoints

**Tailwind Defaults:**
- `sm: 640px`
- `md: 768px`
- `lg: 1024px`
- `xl: 1280px`
- `2xl: 1400px` (custom)

**Mobile-First Approach:**
All styles are mobile-first. Desktop styles override via `md:`, `lg:`, etc.

**Example:**
```tsx
<div className="text-sm md:text-base lg:text-lg">
  Responsive text
</div>
```

---

## 9. Accessibility

### 9.1 Focus States
```css
button:focus-visible,
a:focus-visible,
input:focus-visible {
  outline: none !important;
  box-shadow: 0 0 0 2px hsl(var(--ring)) !important;
}
```

---

### 9.2 Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

---

## 10. Component Library (shadcn/ui)

MindMaker uses **shadcn/ui** components with custom styling.

**Installed Components:**
- Accordion, Alert, Alert Dialog, Avatar, Badge, Breadcrumb, Button, Calendar, Card, Carousel, Chart, Checkbox, Collapsible, Command, Context Menu, Dialog, Drawer, Dropdown Menu, Form, Hover Card, Input, Label, Menubar, Navigation Menu, Pagination, Popover, Progress, Radio Group, Resizable, Scroll Area, Select, Separator, Sheet, Sidebar, Skeleton, Slider, Sonner, Switch, Table, Tabs, Textarea, Toast, Toggle, Tooltip

**Location:** `src/components/ui/`

**Customization:** All components styled via semantic tokens.

---

## 11. Icon System

Uses **Lucide React** for icons:

```tsx
import { Lightbulb, GraduationCap, Home } from "lucide-react";

<Lightbulb className="h-6 w-6 text-primary" />
```

**Icon Sizes:**
- `h-4 w-4` = 16px (small)
- `h-6 w-6` = 24px (medium)
- `h-8 w-8` = 32px (large)

---

## 12. Design Tokens Reference

**File Locations:**
- **CSS Variables:** `src/index.css` (lines 21-86)
- **Tailwind Config:** `tailwind.config.ts` (lines 20-59)

**Usage:**
```tsx
// In Tailwind classes
<div className="bg-primary text-primary-foreground">

// In inline styles (if necessary)
<div style={{ backgroundColor: 'hsl(var(--primary))' }}>
```

---

## 13. Best Practices

### ✅ DO:
- Use semantic tokens (`bg-primary`, `text-foreground`)
- Use mobile-first responsive classes (`text-sm md:text-lg`)
- Use predefined component classes (`.card`, `.glass-card`)
- Use spacing utilities (`p-4`, `gap-6`)
- Use framer-motion for complex animations

### ❌ DON'T:
- Use hardcoded colors (`bg-[#667eea]`)
- Use hardcoded pixel values (`w-[345px]`)
- Use `!important` (except in predefined utilities)
- Create duplicate component styles
- Use inline styles for theming

---

## 14. Future Enhancements

- [ ] Dark mode toggle component
- [ ] Color theme variants (e.g., "Ocean", "Sunset")
- [ ] Component Storybook
- [ ] Figma design tokens export
- [ ] A11y audit and WCAG 2.1 AA compliance
