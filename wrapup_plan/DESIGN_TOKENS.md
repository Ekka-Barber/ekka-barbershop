# 🎨 EKKA APP DESIGN TOKENS

> **Version**: 1.0.0  
> **Last Updated**: January 26, 2026  
> **Source**: `src/index.css` & `tailwind.config.ts`

---

## 🎯 Overview

This document defines the single source of truth for design tokens used across the Ekka application. All colors, spacing, typography, and other design decisions should reference these tokens.

---

## 🎨 Color Palette

### Brand Colors

| Token | Hex | HSL | Usage |
|-------|-----|-----|-------|
| `brand-primary` | `#e9b353` | `38 77% 62%` | Primary brand gold (buttons, accents, highlights) |
| `brand-secondary` | `#4A4A4A` | N/A | Secondary dark gray (text, borders) |
| `brand-light` | `#FAF9F7` | N/A | Background light cream |
| `brand-gradient-light` | `#f2d197` | Lighter gold (gradients, hover) |
| `brand-gradient-base` | `#efc780` | Light gold (gradients) |
| `brand-gradient-dark` | `#e39f26` | Dark gold (gradients, active) |
| `brand-gradient-darker` | `#d4921b` | Darker gold (gradients, active) |

### Golden Shades (New Palette)

| Hex | Name | Usage |
|-----|------|-------|
| `#e9b353` | Base Gold | Primary brand color |
| `#efc780` | Light Gold | Hover states, gradients |
| `#e39f26` | Dark Gold | Active states, gradients |
| `#f2d197` | Lighter Gold | Light gradients, highlights |
| `#d4921b` | Darker Gold | Dark gradients, shadows |

### Semantic Colors (CSS Variables)

| Variable | HSL (Light) | HSL (Dark) | Usage |
|----------|-------------|------------|-------|
| `--primary` | `38 77% 62%` | `38 77% 62%` | Primary actions, buttons |
| `--primary-foreground` | `210 40% 98%` | `222.2 47.4% 11.2%` | Text on primary |
| `--secondary` | `210 40% 96.1%` | `217.2 32.6% 17.5%` | Secondary elements |
| `--secondary-foreground` | `222.2 47.4% 11.2%` | `210 40% 98%` | Text on secondary |
| `--background` | `0 0% 100%` | `222.2 84% 4.9%` | App background |
| `--foreground` | `222.2 84% 4.9%` | `210 40% 98%` | Text color |
| `--card` | `0 0% 100%` | `222.2 84% 4.9%` | Card backgrounds |
| `--card-foreground` | `222.2 84% 4.9%` | `210 40% 98%` | Card text |
| `--destructive` | `0 84.2% 60.2%` | `0 62.8% 30.6%` | Error, destructive actions |
| `--destructive-foreground` | `210 40% 98%` | `210 40% 98%` | Text on destructive |
| `--muted` | `210 40% 96.1%` | `217.2 32.6% 17.5%` | Muted backgrounds |
| `--muted-foreground` | `215.4 16.3% 46.9%` | `215 20.2% 65.1%` | Muted text |
| `--accent` | `210 40% 96.1%` | `217.2 32.6% 17.5%` | Accent backgrounds |
| `--accent-foreground` | `222.2 47.4% 11.2%` | `210 40% 98%` | Text on accent |
| `--border` | `214.3 31.8% 91.4%` | `217.2 32.6% 17.5%` | Border colors |
| `--input` | `214.3 31.8% 91.4%` | `217.2 32.6% 17.5%` | Input backgrounds |
| `--ring` | `38 77% 62%` | `38 77% 62%` | Focus ring color |

### Scrollbar Colors

| Element | Color |
|---------|-------|
| Track background | `#FBF7F2` |
| Track border | `#E4D8C8` |
| Thumb gradient (default) | `linear-gradient(180deg, #efc780, #e9b353, #e39f26)` |
| Thumb gradient (hover) | `linear-gradient(180deg, #f2d197, #efc780, #e9b353)` |
| Thumb gradient (active) | `linear-gradient(180deg, #e9b353, #e39f26, #d4921b)` |

---

## 📏 Spacing & Sizing

### CSS Custom Properties

| Variable | Value | Usage |
|----------|-------|-------|
| `--content-spacing` | `1rem` | Default content spacing |
| `--header-height` | `2.75rem` | Header height |
| `--bottom-nav-height` | `4rem` | Bottom navigation height |
| `--app-max-width` | `28rem` | Maximum app width |

### Safe Area Insets (iOS Notch Support)

| Variable | Description |
|----------|-------------|
| `--sal` | Safe area inset left |
| `--sar` | Safe area inset right |
| `--sat` | Safe area inset top |
| `--sab` | Safe area inset bottom |

### Tailwind Spacing Scale

Uses default Tailwind spacing scale (0.25rem increments). Custom utilities:

| Utility | CSS | Usage |
|---------|-----|-------|
| `content` | `var(--content-spacing, 1rem)` | Content spacing |
| `safe-t` | `var(--sat)` | Top safe area |
| `safe-r` | `var(--sar)` | Right safe area |
| `safe-b` | `var(--sab)` | Bottom safe area |
| `safe-l` | `var(--sal)` | Left safe area |
| `header` | `calc(var(--header-height, 2.75rem) + var(--sat))` | Header height with safe area |
| `bottom-nav` | `var(--bottom-nav-height, 4rem)` | Bottom nav height |
| `tap-target` | `44px` | Minimum touch target size |
| `app` | `var(--app-max-width, 28rem)` | App max width |

---

## 🖋️ Typography

### Font Families

| Token | Value | Usage |
|-------|-------|-------|
| `--font-sans` | `'IBM Plex Sans Arabic', sans-serif` | Primary font stack |
| `font-sans` | `var(--font-sans)` | Tailwind utility |

### Font Sizes

Uses default Tailwind typography scale. Commonly used combinations:

| Utility | Equivalent | Usage |
|---------|------------|-------|
| `section-title` | `text-lg sm:text-xl md:text-2xl font-semibold tracking-tight` | Section titles |
| `section-description` | `text-sm sm:text-base text-muted-foreground` | Section descriptions |

---

## 🎭 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius` | `0.5rem` | Base border radius |
| `lg` | `var(--radius)` | Large radius (cards, modals) |
| `md` | `calc(var(--radius) - 2px)` | Medium radius (inputs, buttons) |
| `sm` | `calc(var(--radius) - 4px)` | Small radius (badges, small elements) |

---

## 🌓 Shadows & Elevation

### Box Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-soft` | `0 2px 8px -2px rgba(0, 0, 0, 0.05)` | Soft elevation |
| `shadow-card` | `0 4px 12px -4px rgba(0, 0, 0, 0.08)` | Card elevation |
| `shadow-dialog` | `0 10px 40px -10px rgba(0, 0, 0, 0.1)` | Dialog/modals |

### Enhanced Multi-Layer Shadows (Luxury Design)

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-hero` | `0 50px 140px -60px rgba(0,0,0,0.85), 0 20px 60px -30px rgba(214,179,90,0.25)` | Hero section - deep shadow with gold tint |
| `shadow-card` | `0 30px 70px -30px rgba(0,0,0,0.6), 0 10px 30px -10px rgba(232,198,111,0.15)` | Card elevation with gold accent |
| `shadow-button-gold` | `0 25px 50px -20px rgba(232,198,111,0.8), 0 10px 25px -10px rgba(214,179,90,0.4)` | Primary button - gold glow |
| `shadow-button-gold-hover` | `0 30px 60px -20px rgba(232,198,111,0.9), 0 15px 35px -10px rgba(214,179,90,0.5)` | Primary button hover state |
| `shadow-stat` | `0 15px 35px -15px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.1)` | Stats/statistic boxes |
| `shadow-gold-orb` | `0 0 50px rgba(214,179,90,0.2)` | Decorative gold glow elements |

### Gradient Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-gold` | `0 10px 40px -10px rgba(233, 179, 83, 0.5)` | Gold accent shadows |
| `shadow-gold-light` | `0 4px 12px -4px rgba(233, 179, 83, 0.3)` | Light gold shadows |

---

## ⚡ Transitions & Animations

### Transition Durations

| Variable | Value | Usage |
|----------|-------|-------|
| `--transition-fast` | `150ms` | Fast transitions |
| `--transition-medium` | `250ms` | Medium transitions |
| `--transition-slow` | `350ms` | Slow transitions |

### Keyframe Animations

| Name | Keyframes | Usage |
|------|-----------|-------|
| `app-fade-in` | `from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); }` | Fade in with slight upward movement |
| `app-rise-in` | `from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); }` | Rise in from below |
| `pulse-once` | `0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); }` | Single pulse animation |
| `heart-beat` | `0%, 100% { transform: scale(1); } 15% { transform: scale(1.1); } 30% { transform: scale(1); } 45% { transform: scale(1.05); } 60% { transform: scale(1); }` | Heartbeat effect |
| `shimmer` | `0% { background-position: -200% 0; } 100% { background-position: 200% 0; }` | Shimmer loading effect |
| `fadeIn` | `from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); }` | Simple fade in |
| `scale` | `from { transform: scale(0.95); } to { transform: scale(1); }` | Scale in animation |
| `bounce` | `0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); }` | Gentle bounce |

### Animation Utilities

| Class | Properties | Usage |
|-------|------------|-------|
| `app-fade-in` | `animation: app-fade-in 0.5s ease-out both;` | Apply fade-in animation |
| `app-rise-in` | `animation: app-rise-in 0.6s ease-out both;` | Apply rise-in animation |
| `app-delay-1` | `animation-delay: 0.08s;` | Small animation delay |
| `app-delay-2` | `animation-delay: 0.16s;` | Larger animation delay |

---

## 🌈 Multi-Stop Gradients (Luxury Design)

### Background Gradients

| Token | Value | Usage |
|-------|-------|-------|
| `gradient-hero` | `from-[#1a1a1a] via-[#222222] to-[#1f1f1f]` | Hero section background |
| `gradient-card` | `from-white/[0.08] to-white/[0.02]` | Card backgrounds with transparency |
| `gradient-dark` | `from-[#252525] to-[#1f1f1f]` | Dark card backgrounds |

### Gold Accent Gradients

| Token | Value | Usage |
|-------|-------|-------|
| `gradient-gold-accent` | `from-[#efc780]/10 via-[#efc780]/5 to-[#2a2a2a]` | Gold-accented card borders |
| `gradient-gold-light` | `from-[#f2d197] via-[#efc780] to-[#e9b353]` | Buttons, badges - full gold gradient |
| `gradient-gold-badge` | `from-[#E8C66F] via-[#D6B35A] to-[#C79A2A]` | Badge elements |

### Accent Gradients

| Token | Value | Usage |
|-------|-------|-------|
| `gradient-purple-accent` | `from-[#9CA3AF]/10 via-[#9CA3AF]/5 to-[#2a2a2a]` | Secondary accent cards |
| `gradient-gold-secondary` | `from-[#D6B35A]/10 via-[#D6B35A]/5 to-[#2a2a2a]` | Loyalty cards |

### Radial Gradients

| Token | Value | Usage |
|-------|-------|-------|
| `radial-gold-top` | `radial-gradient(circle_at_top, rgba(214,179,90,0.15), transparent 55%)` | Top-centered gold glow |
| `radial-gold-center` | `radial-gradient(circle_at_center, rgba(214,179,90,0.18), transparent 65%)` | Center gold glow |
| `radial-gold-top-left` | `radial-gradient(circle_at_top_left, rgba(214,179,90,0.2), transparent 60%)` | Corner gold glow |

---

### Common Utility Combinations

| Pattern | Classes | Usage |
|---------|---------|-------|
| Flex center | `flex items-center justify-center` | Centered content |
| Flex between | `flex items-center justify-between` | Space between with alignment |
| Card padding | `p-5 sm:p-6` | Standard card padding |
| Section spacing | `space-y-4 sm:space-y-5` | Vertical spacing in sections |
| Gradient border | `border border-[#efc780]/40 bg-gradient-to-br from-[#efc780]/10 via-[#efc780]/5 to-[#2a2a2a] p-[1px]` | Gradient border effect |

### Component-specific Tokens

| Component | Padding | Border Radius | Shadow | Notes |
|-----------|---------|---------------|--------|-------|
| Card | `p-5 sm:p-6` | `rounded-xl` | `shadow-soft` | Standard card |
| Button (default) | `px-4 py-2` | `rounded-md` | none | Primary button |
| Button (sm) | `px-3 py-2` | `rounded-md` | none | Small button |
| Button (lg) | `px-6 py-2` | `rounded-md` | none | Large button |
| Input | `px-3 py-2` | `rounded-md` | none | Text input |
| Dialog | `p-6` | `rounded-xl` | `shadow-dialog` | Modal dialogs |

---

## 📱 Breakpoints

Uses default Tailwind breakpoints:

| Breakpoint | Min-width | Usage |
|------------|-----------|-------|
| `xs` | `375px` | Extra small devices |
| `sm` | `640px` | Small devices |
| `md` | `768px` | Medium devices |
| `lg` | `1024px` | Large devices |
| `xl` | `1280px` | Extra large devices |
| `2xl` | `1536px` | 2X large devices |

---

## 🧩 Utility Classes

### Custom Utility Classes (from `src/index.css`)

| Class | Purpose |
|-------|---------|
| `hide-scrollbar` | Hides scrollbar while maintaining scroll functionality |
| `momentum-scroll` | Enables momentum scrolling on touch devices |
| `touch-target` | Ensures minimum 44px touch target size |
| `custom-scrollbar` | Applies branded gold scrollbar styling |
| `page-shell` | Container for page content |
| `page-padding` | Responsive horizontal padding |
| `app-surface` | Base app surface styling |
| `page-stack` | Vertical stacking with responsive spacing |
| `tabs-underline-list` | Underline tab list styling |
| `tabs-underline-trigger` | Underline tab trigger styling |
| `logo-mark` | Logo container styling |
| `gold-glow-blur` | Gold blur effect for decorative elements |
| `gold-glow-sm` | Small gold glow shadow (40px blur) |
| `gold-glow-md` | Medium gold glow shadow (50px blur) |
| `radial-gold-top` | Radial gradient gold glow from top |
| `radial-gold-center` | Radial gradient gold glow from center |
| `radial-gold-top-left` | Radial gradient gold glow from top-left corner |
| `radial-gold-bottom-right` | Radial gradient dark glow from bottom-right corner |
| `radial-white-center` | Radial gradient white glow from center |
| `glow-pulse` | Animated pulsing glow effect |

---

## 🚀 Usage Guidelines

### 1. Color Usage
- Use CSS variables (`--primary`, `--background`) for theming
- Use `brand-primary` for brand-specific gold elements
- Use semantic colors for states (destructive, muted, accent)

### 2. Spacing
- Use Tailwind spacing utilities (`p-4`, `m-2`) for consistency
- Use custom spacing utilities (`content`, `header`) for layout-specific spacing
- Respect safe area insets on mobile

### 3. Typography
- Use `font-sans` for all text
- Use `section-title` and `section-description` for consistent section headers
- Follow responsive text sizing patterns

### 4. Component Styling
- Follow the component-specific token patterns above
- Extract repeated class combinations into reusable utilities when used 3+ times
- Use animation utilities for consistent motion

---

## 📁 Source Files

- `src/index.css` – CSS custom properties, utility classes, animations
- `tailwind.config.ts` – Tailwind theme extensions, custom colors, spacing

---

## 🔄 Maintenance

1. **Add new tokens**: Update both source files and this document
2. **Modify tokens**: Ensure backward compatibility when possible
3. **Deprecate tokens**: Mark as deprecated in this document before removal

---

*Design tokens version 1.0.0 – Aligned with Phase 6 Design Unification*