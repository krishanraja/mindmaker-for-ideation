# Visual Guidelines

**Last Updated:** 2025-01

---

## Overview

MindMaker's visual language is **clean, premium, and approachable**. We use:
- **Purple/Violet gradients** for brand presence
- **Glass morphism** for modern, layered depth
- **Generous whitespace** for breathing room
- **Subtle animations** for polish without distraction

---

## Layout Patterns

### 1. Hero Sections
**Structure:**
```
Logo (centered, 64px height)
↓
Headline (Gobold Bold, all caps, 48px)
↓
Subheadline (Inter Regular, 20px, muted)
↓
CTA Button (Primary, centered)
```

**Example:**
```tsx
<div className="text-center space-y-6 py-12">
  <img src={logo} alt="MindMaker" className="h-16 mx-auto" />
  <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
    MINDMAKER AI SUITE
  </h1>
  <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
    Your comprehensive platform for AI ideation and literacy
  </p>
  <Button size="lg">Start Your Blueprint</Button>
</div>
```

---

### 2. Feature Cards (Side-by-Side)
**Layout:** 2-column grid (desktop), stacked (mobile)

**Structure:**
```
Icon (left) | Title (right, bold)
            | Description (right, muted)
```

**Example:**
```tsx
<div className="grid md:grid-cols-2 gap-8">
  <Card className="p-6 space-y-4">
    <div className="flex items-center gap-3">
      <div className="p-3 rounded-lg bg-primary/10">
        <Lightbulb className="h-6 w-6 text-primary" />
      </div>
      <h2 className="text-2xl font-bold">AI IDEATION</h2>
    </div>
    <p className="text-muted-foreground">
      Generate comprehensive business blueprints...
    </p>
  </Card>
  {/* Repeat for second card */}
</div>
```

---

### 3. Full-Width Content Sections
**Padding:** `py-12 md:py-20` (mobile: 48px, desktop: 80px)  
**Container:** `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`

**Example:**
```tsx
<section className="section-padding">
  <div className="container-width">
    <h2 className="text-3xl font-bold mb-8">Section Title</h2>
    <div className="grid md:grid-cols-3 gap-6">
      {/* Cards */}
    </div>
  </div>
</section>
```

---

### 4. Dashboard / Results Layouts
**Structure:**
```
Header (title + actions)
↓
Tabs (if multi-section)
↓
Main Content (cards in grid)
↓
Footer (pagination, secondary actions)
```

**Example:**
```tsx
<div className="space-y-6">
  <div className="flex justify-between items-center">
    <h1 className="text-3xl font-bold">Your AI Blueprint</h1>
    <Button variant="outline">Download PDF</Button>
  </div>
  
  <Tabs defaultValue="overview">
    <TabsList>
      <TabsTrigger value="overview">Overview</TabsTrigger>
      <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
    </TabsList>
    <TabsContent value="overview">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Cards */}
      </div>
    </TabsContent>
  </Tabs>
</div>
```

---

## Component Styles

### 1. Cards
**Default Style:**
```tsx
<Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
</Card>
```

**Glass Card:**
```tsx
<div className="glass-card p-6">
  Elevated content with blur effect
</div>
```

**When to use:**
- Default Card: Content sections, feature blocks
- Glass Card: Overlays, modals, floating elements

---

### 2. Buttons
**Variants:**
- **Primary:** Purple gradient, white text
- **Secondary:** Muted background, dark text
- **Outline:** Transparent with border
- **Ghost:** Transparent, no border

**Sizes:**
- `sm`: 32px height, 12px horizontal padding
- `default`: 40px height, 16px horizontal padding
- `lg`: 48px height, 24px horizontal padding

**Example:**
```tsx
<Button variant="default" size="lg">Primary Action</Button>
<Button variant="outline" size="default">Secondary Action</Button>
```

---

### 3. Form Fields
**Style:**
```tsx
<div className="space-y-2">
  <Label htmlFor="email">Email Address</Label>
  <Input 
    id="email" 
    type="email" 
    placeholder="you@company.com"
    className="h-12"
  />
  <p className="text-sm text-muted-foreground">
    We'll never share your email
  </p>
</div>
```

**Field Height:** Minimum 48px for touch targets (mobile)

---

### 4. Progress Indicators
**Linear Progress:**
```tsx
<div className="space-y-2">
  <div className="flex justify-between text-sm">
    <span>Progress</span>
    <span>75%</span>
  </div>
  <Progress value={75} className="h-2" />
</div>
```

**Circular Progress:**
```tsx
<ProgressRing value={75} size={120} strokeWidth={8} />
```

---

## Spacing System

### Container Spacing
```
Mobile:  px-4  (16px)
Tablet:  px-6  (24px)
Desktop: px-8  (32px)
```

### Section Spacing (Vertical)
```
Mobile:  py-8   (32px)
Tablet:  py-12  (48px)
Desktop: py-20  (80px)
```

### Card Internal Spacing
```
Compact: p-4  (16px)
Default: p-6  (24px)
Spacious: p-8 (32px)
```

### Element Gaps
```
Tight:  gap-2 (8px)
Normal: gap-4 (16px)
Loose:  gap-6 (24px)
```

---

## Iconography

### Icon Library
**Primary:** Lucide React  
**Installation:** Already included

**Usage:**
```tsx
import { Home, User, Settings } from "lucide-react";

<Home className="h-6 w-6 text-primary" />
```

---

### Icon Sizing
```
Small:  h-4 w-4 (16px)
Medium: h-6 w-6 (24px)
Large:  h-8 w-8 (32px)
Hero:   h-12 w-12 (48px)
```

---

### Icon Colors
Use semantic tokens:
```tsx
<Icon className="text-primary" />      // Purple
<Icon className="text-accent" />       // Violet
<Icon className="text-muted-foreground" /> // Gray
<Icon className="text-destructive" />  // Red
<Icon className="text-success" />      // Green
```

---

## Animation Guidelines

### 1. Fade-In-Up (Page Transitions)
**Use for:** New page loads, section reveals

```tsx
<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
  Content
</motion.div>
```

---

### 2. Shimmer (Loading States)
**Use for:** Hero text on first load

```tsx
<h1 className="hero-text-shimmer">
  MINDMAKER AI SUITE
</h1>
```

---

### 3. Hover Effects
**Use for:** Cards, buttons, interactive elements

```css
.card {
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.12);
}
```

---

### 4. Number Updates
**Use for:** Stats, scores, dynamic values

```tsx
<span className="number-update">
  {score}
</span>
```

---

## Image Guidelines

### Logo Usage
**Primary Logo:** `mindmaker-hero-logo.png`  
**Dimensions:** 256px × 64px (4:1 ratio)  
**Formats:** PNG (transparency), SVG (scalable)

**Placement:**
- Top-left corner (navigation)
- Centered (hero sections)
- Footer (secondary)

**Minimum Size:** 120px width (legibility)

---

### Photography Style
**Preferred:**
- Real people (not stock photo clichés)
- Professional settings (offices, boardrooms)
- Natural lighting
- Diverse representation

**Avoid:**
- Overly posed shots
- "Business handshake" stock photos
- Low-resolution images
- Heavy filters

---

### Illustrations
**Style:** Line-art, minimalist, purple/violet color scheme  
**Use Cases:**
- Empty states
- Onboarding flows
- Error pages
- Blog headers

**Sources:** Custom illustrations (future) or Undraw, Humaaans

---

## Responsive Behavior

### Breakpoint Strategy
**Mobile-First:** All styles default to mobile, override for larger screens

```tsx
// Mobile: Stacked
// Desktop: 2 columns
<div className="grid md:grid-cols-2 gap-6">
```

---

### Mobile Optimizations
1. **Touch Targets:** Minimum 44px × 44px
2. **Font Sizes:** Minimum 14px (body text)
3. **Safe Areas:** Account for notches, home indicators
4. **Horizontal Scrolling:** Avoid at all costs
5. **Fixed Navigation:** Bottom tab bar (future)

---

### Tablet Considerations
- Use `md:` breakpoint (768px) for tablet-specific styles
- Increase font sizes slightly from mobile
- Maintain card-based layouts (don't go full-width)

---

### Desktop Enhancements
- Max content width: 1280px (prevent ultra-wide stretching)
- Add hover states (not applicable on mobile)
- Show more content per screen (reduce scrolling)
- Use multi-column layouts (2-3 columns)

---

## Visual Hierarchy

### Priority Levels

**Level 1 (Primary Focus):**
- Hero headlines
- Main CTAs
- Critical error messages

**Style:** Largest text, bold weights, brand colors

---

**Level 2 (Secondary Focus):**
- Section titles
- Feature cards
- Form fields

**Style:** Medium text, semibold weights, foreground color

---

**Level 3 (Supporting Info):**
- Body text
- Descriptions
- Helper text

**Style:** Base text, regular weight, muted color

---

**Level 4 (Tertiary Info):**
- Timestamps
- Metadata
- Legal disclaimers

**Style:** Small text, regular weight, light gray

---

## Accessibility Considerations

### Color Contrast
**Minimum Ratios (WCAG AA):**
- Normal text: 4.5:1
- Large text (18px+): 3:1
- UI components: 3:1

**Tools:** Use WebAIM Contrast Checker

---

### Focus Indicators
All interactive elements must have visible focus states:

```css
button:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px hsl(var(--ring));
}
```

---

### Alt Text
All images must have descriptive alt text:

```tsx
<img src={logo} alt="MindMaker AI Suite logo" />
```

---

### Reduced Motion
Respect user preferences:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
  }
}
```

---

## Brand Assets

### Logo Files
**Location:** `src/assets/`  
**Files:**
- `mindmaker-hero-logo.png` (primary)
- `mindmaker-logo.png` (alternate)
- `fractionl-ai-logo.png` (partner logo)

---

### Favicon
**Location:** `public/favicon.png`  
**Size:** 32px × 32px

---

### Open Graph Images
**Size:** 1200px × 630px  
**Location:** `public/og-image.png` (future)

---

## Do's and Don'ts

### ✅ DO:
- Use semantic color tokens
- Maintain consistent spacing (multiples of 4px)
- Add hover states to interactive elements
- Use subtle animations for polish
- Test on mobile devices
- Respect dark mode preferences

### ❌ DON'T:
- Use hardcoded colors or sizes
- Overcomplicate layouts
- Animate excessively (motion sickness)
- Ignore accessibility guidelines
- Use low-contrast text
- Add decorative-only images without alt text

---

## Future Visual Enhancements

- [ ] Custom illustration set
- [ ] Animated SVG icons
- [ ] Lottie animations for loading states
- [ ] Dark mode toggle UI
- [ ] Interactive 3D elements (Three.js)
- [ ] Video backgrounds (hero sections)
