# UI Component Style System Guide

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [How to Use Existing Styles](#how-to-use-existing-styles)
4. [How to Modify Styles](#how-to-modify-styles)
5. [How to Create New Components](#how-to-create-new-components)
6. [How to Change the Theme](#how-to-change-the-theme)
7. [Style Reference](#style-reference)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Overview

This project uses a **centralized style system** where all design tokens (colors, spacing, typography, etc.) are defined in a single source of truth:

```
front/app/ui/base/global-styles.ts
```

All UI components import their styles from this file, ensuring consistency across the entire application.

### Key Principles

- ✅ **Single Source of Truth** - All styles defined in `global-styles.ts`
- ✅ **Type Safety** - Full TypeScript support with autocomplete
- ✅ **Direct Tailwind Classes** - All styles use direct class strings (no template literals)
- ✅ **Component-First** - Pre-composed styles for common patterns
- ✅ **Scalable** - Easy to add new components using existing tokens

---

## Architecture

### File Structure

```
front/app/ui/base/
├── global-styles.ts    # 🎨 Central style system (SINGLE SOURCE OF TRUTH)
├── Button.tsx          # Button component
├── TextField.tsx       # Input/TextField component
├── Chip.tsx            # Chip/Badge component
└── index.ts            # Public exports

front/app/ui-test/
└── page.tsx            # Test page showcasing all components
```

### Style Layers

The style system is organized into layers:

1. **Design Tokens** (Foundation)
   - Colors, typography, spacing, borders, shadows
   - Example: `componentSpacing.md = 'px-4 py-2'`

2. **Utilities** (Helpers)
   - Common class combinations
   - Example: `utilities.flexCenter = 'inline-flex items-center justify-center'`

3. **Component Styles** (Pre-composed)
   - Complete styles ready for components
   - Example: `buttonStyles.base`, `inputStyles.base`, `chipStyles.base`

---

## How to Use Existing Styles

### 1. Import Styles from the Base System

```typescript
// Import what you need from the centralized system
import { 
  Button,           // Pre-built components
  typography,       // Typography styles
  colors,           // Color variants
  layoutStyles,     // Layout utilities
  inlineSpacing,    // Gap utilities
} from '@/app/ui/base';
```

### 2. Use Pre-built Components

The easiest way is to use the existing components:

```tsx
// Button component with variants
<Button variant="primary" size="md" font="display">
  Click Me
</Button>

<Button variant="secondary" size="lg">
  Secondary Action
</Button>

<Button variant="danger" disabled>
  Delete
</Button>

// TextField component
<TextField 
  label="Username" 
  placeholder="Enter your username"
  value={username}
  onChange={setUsername}
/>

<TextField 
  label="Email" 
  type="email"
  error="Invalid email address"
/>

// Chip component
<Chip variant="success">Active</Chip>
<Chip variant="warning">Pending</Chip>
<Chip variant="error">Failed</Chip>
```

### 3. Use Design Tokens in Custom Components

Apply centralized styles directly in your JSX:

```tsx
import { typography, layoutStyles, inlineSpacing } from '@/app/ui/base';

function MyCustomComponent() {
  return (
    <div className={layoutStyles.pageContainer}>
      <div className={layoutStyles.contentContainer}>
        <h1 className={typography.heading}>My Page Title</h1>
        <p className={typography.body}>Some body text here.</p>
        
        <div className={`flex ${inlineSpacing.md}`}>
          <span className={typography.small}>Item 1</span>
          <span className={typography.small}>Item 2</span>
        </div>
      </div>
    </div>
  );
}
```

### 4. Combine Multiple Tokens

You can combine tokens using template literals:

```tsx
import { typography, inlineSpacing, layout } from '@/app/ui/base';

<div className={`${layout.maxWidth.xl} ${layout.center} ${layout.padding.page}`}>
  <h2 className={`${typography.subheading} mb-8`}>
    Section Title
  </h2>
  <div className={`flex flex-wrap ${inlineSpacing.lg}`}>
    {/* Content here */}
  </div>
</div>
```

---

## How to Modify Styles

### Step 1: Open the Central Style File

```bash
# Edit the single source of truth
front/app/ui/base/global-styles.ts
```

### Step 2: Find the Style Category

The file is organized into sections:

1. **COLOR SYSTEM** - Button colors, chip colors
2. **TYPOGRAPHY SYSTEM** - Font families, sizes, weights, complete typography styles
3. **SPACING SYSTEM** - Component padding, section margins, inline gaps
4. **LAYOUT & CONTAINER** - Max widths, page padding, min heights
5. **INTERACTIVE STATES** - Focus, disabled, transitions
6. **BORDERS & SHADOWS** - Border widths, colors, radius, shadows
7. **COMMON UTILITIES** - Flex helpers, width utilities
8. **INPUT-SPECIFIC STYLES** - Input border colors
9. **COMPONENT-SPECIFIC STYLE BUILDERS** - Button, input, chip, layout styles

### Step 3: Modify the Values

**Example: Change button padding**

```typescript
// BEFORE
export const componentSpacing = {
  sm: 'px-3 py-1.5',
  md: 'px-4 py-2',      // ← Current value
  lg: 'px-6 py-3',
} as const;

// AFTER
export const componentSpacing = {
  sm: 'px-3 py-1.5',
  md: 'px-6 py-3',      // ← Increased padding
  lg: 'px-8 py-4',
} as const;
```

**Example: Change heading font size**

```typescript
// BEFORE
export const typography = {
  heading: 'text-xl md:text-2xl font-bold text-gray-900',
  // ...
} as const;

// AFTER
export const typography = {
  heading: 'text-2xl md:text-3xl font-bold text-gray-900',  // ← Larger
  // ...
} as const;
```

### Step 4: Save and Test

Changes automatically apply to **all components** using that token!

---

## How to Create New Components

### Method 1: Use Component Style Builders

Use the pre-composed style builders from `global-styles.ts`:

```tsx
// front/app/ui/base/MyNewComponent.tsx
import { buttonStyles, type ColorVariant } from './global-styles';

interface MyComponentProps {
  variant?: ColorVariant;
  children: React.ReactNode;
}

export function MyNewComponent({ 
  variant = 'primary', 
  children 
}: MyComponentProps) {
  return (
    <div className={`
      ${buttonStyles.base}
      ${buttonStyles.variants[variant]}
      ${buttonStyles.sizes.md}
    `.trim().replace(/\s+/g, ' ')}>
      {children}
    </div>
  );
}
```

### Method 2: Compose from Design Tokens

Build your own styles using individual tokens:

```tsx
// front/app/ui/base/Card.tsx
import { 
  layout, 
  borderRadius, 
  shadows, 
  componentSpacing 
} from './global-styles';

export function Card({ children }: { children: React.ReactNode }) {
  const cardStyles = `
    ${layout.padding.card}
    bg-white
    ${borderRadius.lg}
    ${shadows.medium}
    border
    border-gray-200
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={cardStyles}>
      {children}
    </div>
  );
}
```

### Method 3: Add New Component Styles to global-styles.ts

For components you'll reuse often, add them to the central file:

```typescript
// In global-styles.ts, add a new section:

// Card component styles
export const cardStyles = {
  base: 'p-4 bg-white rounded-lg shadow-md border border-gray-200',
  
  variants: {
    default: 'bg-white',
    highlighted: 'bg-blue-50 border-blue-200',
    dark: 'bg-gray-900 text-white border-gray-700',
  },
  
  padding: {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  },
} as const;

// Add TypeScript type
export type CardVariant = 'default' | 'highlighted' | 'dark';
```

Then use it in your component:

```tsx
// front/app/ui/base/Card.tsx
import { cardStyles, type CardVariant } from './global-styles';

interface CardProps {
  variant?: CardVariant;
  padding?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Card({ 
  variant = 'default', 
  padding = 'md',
  children 
}: CardProps) {
  return (
    <div className={`
      ${cardStyles.base}
      ${cardStyles.variants[variant]}
      ${cardStyles.padding[padding]}
    `.trim().replace(/\s+/g, ' ')}>
      {children}
    </div>
  );
}
```

### Step 4: Export Your Component

Add to `front/app/ui/base/index.ts`:

```typescript
export { Card } from './Card';
export type { CardVariant } from './global-styles';
```

---

## How to Change the Theme

### Changing the Primary Color

The current theme uses **purple** as the primary color. To change to **blue**:

**Step 1:** Open `front/app/ui/base/global-styles.ts`

**Step 2:** Search and replace purple with blue:

```typescript
// BEFORE (Purple theme)
export const colors: Record<ColorVariant, string> = {
  primary: 'bg-purple-600 hover:bg-purple-700 text-white',
  // ...
} as const;

export const states = {
  focus: 'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
  // ...
} as const;

// AFTER (Blue theme)
export const colors: Record<ColorVariant, string> = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  // ...
} as const;

export const states = {
  focus: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  // ...
} as const;
```

**Step 3:** Update input focus rings:

```typescript
// BEFORE
export const inputColors = {
  focus: 'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 border-transparent',
} as const;

// AFTER
export const inputColors = {
  focus: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border-transparent',
} as const;
```

**Step 4:** Update button styles base:

```typescript
// BEFORE
export const buttonStyles = {
  base: 'inline-flex items-center justify-center font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-md',
  // ...
} as const;

// AFTER
export const buttonStyles = {
  base: 'inline-flex items-center justify-center font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-md',
  // ...
} as const;
```

**Step 5:** Update input styles base:

```typescript
// BEFORE
export const inputStyles = {
  base: 'w-full px-4 py-2 text-base md:text-lg text-gray-900 border rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  // ...
} as const;

// AFTER
export const inputStyles = {
  base: 'w-full px-4 py-2 text-base md:text-lg text-gray-900 border rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  // ...
} as const;
```

### Quick Search & Replace Guide

Use your editor's search & replace feature in `global-styles.ts`:

| Search For | Replace With | Description |
|------------|--------------|-------------|
| `bg-purple-600` | `bg-blue-600` | Primary background |
| `hover:bg-purple-700` | `hover:bg-blue-700` | Primary hover |
| `ring-purple-500` | `ring-blue-500` | Focus rings |

### Changing Other Colors

**Secondary color (currently gray):**
```typescript
secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
// Change to green:
secondary: 'bg-green-600 hover:bg-green-700 text-white',
```

**Danger color (currently red):**
```typescript
danger: 'bg-red-600 hover:bg-red-700 text-white',
// Change to orange:
danger: 'bg-orange-600 hover:bg-orange-700 text-white',
```

**Status colors (chips):**
```typescript
export const chipColors: Record<ChipVariant, string> = {
  success: 'bg-green-100 text-green-800',   // Success state
  warning: 'bg-yellow-100 text-yellow-800',  // Warning state
  error: 'bg-red-100 text-red-800',          // Error state
} as const;
```

---

## Style Reference

### Available Style Exports

#### Colors & Variants
```typescript
colors.primary      // 'bg-purple-600 hover:bg-purple-700 text-white'
colors.secondary    // 'bg-gray-600 hover:bg-gray-700 text-white'
colors.danger       // 'bg-red-600 hover:bg-red-700 text-white'
colors.ghost        // 'bg-transparent hover:bg-gray-100 text-gray-700'

chipColors.default  // 'bg-gray-100 text-gray-800'
chipColors.success  // 'bg-green-100 text-green-800'
chipColors.warning  // 'bg-yellow-100 text-yellow-800'
chipColors.error    // 'bg-red-100 text-red-800'
```

#### Typography
```typescript
fontFamilies.display  // 'font-display'
fontFamilies.body     // 'font-sans'
fontFamilies.mono     // 'font-mono'

fontSizes.xs          // 'text-xs md:text-sm'
fontSizes.sm          // 'text-sm md:text-base'
fontSizes.base        // 'text-base md:text-lg'
fontSizes.lg          // 'text-lg md:text-xl'
fontSizes.xl          // 'text-xl md:text-2xl'
fontSizes['2xl']      // 'text-2xl md:text-3xl'

fontWeights.normal    // 'font-normal'
fontWeights.medium    // 'font-medium'
fontWeights.semibold  // 'font-semibold'
fontWeights.bold      // 'font-bold'

typography.body       // 'text-base md:text-lg text-gray-900'
typography.heading    // 'text-xl md:text-2xl font-bold text-gray-900'
typography.subheading // 'text-lg md:text-xl font-semibold text-gray-900'
typography.small      // 'text-sm md:text-base text-gray-600'
typography.label      // 'text-sm font-medium text-gray-700'
typography.error      // 'text-sm text-red-600'
```

#### Spacing
```typescript
componentSpacing.sm   // 'px-3 py-1.5'
componentSpacing.md   // 'px-4 py-2'
componentSpacing.lg   // 'px-6 py-3'

sectionSpacing.sm     // 'mb-6'
sectionSpacing.md     // 'mb-8'
sectionSpacing.lg     // 'mb-12'

inlineSpacing.xs      // 'gap-2'
inlineSpacing.sm      // 'gap-3'
inlineSpacing.md      // 'gap-4'
inlineSpacing.lg      // 'gap-6'

margins.xs            // 'mb-1'
margins.sm            // 'mb-2'
margins.md            // 'mb-4'
margins.lg            // 'mb-8'

spacing               // Alias for componentSpacing (backward compatibility)
```

#### Layout
```typescript
layout.maxWidth.sm    // 'max-w-sm'
layout.maxWidth.md    // 'max-w-md'
layout.maxWidth.lg    // 'max-w-2xl'
layout.maxWidth.xl    // 'max-w-4xl'
layout.maxWidth['2xl'] // 'max-w-6xl'

layout.padding.page   // 'p-8'
layout.padding.section // 'p-4'
layout.padding.card   // 'p-4'

layout.minHeight.screen // 'min-h-screen'
layout.minHeight.dvh    // 'min-h-dvh'

layout.center         // 'mx-auto'
```

#### Interactive States
```typescript
states.focus          // 'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'
states.disabled       // 'disabled:opacity-50 disabled:cursor-not-allowed'
states.transition     // 'transition-colors duration-200'
states.transitionAll  // 'transition-all duration-200'
```

#### Borders & Shadows
```typescript
borders.width.none    // 'border-0'
borders.width.default // 'border'
borders.width.thick   // 'border-2'

borders.colors.default // 'border-gray-300'
borders.colors.hover   // 'hover:border-gray-400'
borders.colors.error   // 'border-red-500'
borders.colors.focus   // 'border-transparent'

borderRadius.none     // 'rounded-none'
borderRadius.sm       // 'rounded'
borderRadius.md       // 'rounded-md'
borderRadius.lg       // 'rounded-lg'
borderRadius.full     // 'rounded-full'

shadows.none          // 'shadow-none'
shadows.subtle        // 'shadow-sm'
shadows.medium        // 'shadow-md'
shadows.large         // 'shadow-lg'
```

#### Utilities
```typescript
utilities.flexCenter  // 'inline-flex items-center justify-center'
utilities.flexStart   // 'inline-flex items-center'
utilities.flexCol     // 'flex flex-col'
utilities.flexWrap    // 'flex flex-wrap'
utilities.fullWidth   // 'w-full'
utilities.block       // 'block'
utilities.inlineBlock // 'inline-block'
utilities.hidden      // 'hidden'
```

#### Input-Specific
```typescript
inputColors.default   // 'border-gray-300 hover:border-gray-400'
inputColors.error     // 'border-red-500 focus:ring-red-500'
inputColors.focus     // 'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 border-transparent'
```

#### Component Style Builders
```typescript
buttonStyles.base     // Complete button base styles
buttonStyles.variants // Button color variants (primary, secondary, danger, ghost)
buttonStyles.sizes    // Button sizes (sm, md, lg)
buttonStyles.fonts    // Font families

inputStyles.wrapper   // Input wrapper styles
inputStyles.label     // Input label styles
inputStyles.base      // Input field base styles
inputStyles.states    // Input states (default, error, focus)
inputStyles.errorText // Error message styles

chipStyles.base       // Chip base styles
chipStyles.variants   // Chip color variants (default, success, warning, error)

layoutStyles.pageContainer    // Full page container
layoutStyles.contentContainer // Max-width content area
layoutStyles.section          // Section spacing
layoutStyles.sectionHeader    // Section title styles
layoutStyles.card             // Card container
layoutStyles.cardHighlight    // Highlighted card (info)
```

---

## Best Practices

### ✅ DO

1. **Always use centralized styles from `global-styles.ts`**
   ```tsx
   // ✅ Good
   import { typography, colors } from '@/app/ui/base';
   <h1 className={typography.heading}>Title</h1>
   ```

2. **Use direct Tailwind class strings (no template literals for color values)**
   ```typescript
   // ✅ Good - in global-styles.ts
   primary: 'bg-purple-600 hover:bg-purple-700 text-white'
   
   // ❌ Bad - Tailwind can't detect these
   primary: `bg-${colorVariable} hover:bg-${hoverVariable} text-white`
   ```

3. **Compose multiple tokens when needed**
   ```tsx
   // ✅ Good
   <div className={`${layout.maxWidth.xl} ${layout.center} ${layout.padding.page}`}>
   ```

4. **Add new component styles to `global-styles.ts` if you'll reuse them**
   ```typescript
   // ✅ Good - Add to global-styles.ts
   export const modalStyles = {
     overlay: 'fixed inset-0 bg-black bg-opacity-50',
     content: 'bg-white rounded-lg p-6 max-w-md mx-auto',
   } as const;
   ```

5. **Use TypeScript types for variants**
   ```typescript
   // ✅ Good
   export type ColorVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
   
   interface ButtonProps {
     variant?: ColorVariant;  // Autocomplete + type safety
   }
   ```

6. **Test your changes with the test page**
   - Visit `/ui-test` to see all components
   - Verify changes work across all variants

### ❌ DON'T

1. **Don't hardcode styles in component files**
   ```tsx
   // ❌ Bad
   <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md">
     Click Me
   </button>
   
   // ✅ Good
   <Button variant="primary" size="md">Click Me</Button>
   ```

2. **Don't use template literals for dynamic Tailwind classes**
   ```typescript
   // ❌ Bad - Tailwind can't detect these at build time
   const color = 'purple';
   const bgClass = `bg-${color}-600`;  // Won't work!
   
   // ✅ Good - Use direct strings
   const bgClass = 'bg-purple-600';
   ```

3. **Don't create duplicate style definitions**
   ```typescript
   // ❌ Bad - Duplicate definitions
   // In ComponentA.tsx
   const buttonPadding = 'px-4 py-2';
   
   // In ComponentB.tsx
   const buttonPadding = 'px-4 py-2';
   
   // ✅ Good - Use centralized definition
   import { componentSpacing } from '@/app/ui/base';
   const buttonPadding = componentSpacing.md;
   ```

4. **Don't skip the centralized system for "one-off" styles**
   ```tsx
   // ❌ Bad - Inconsistent
   <div className="px-5 py-2.5">  // Different from standard spacing
   
   // ✅ Good - Use closest standard size
   <div className={componentSpacing.md}>  // px-4 py-2
   ```

5. **Don't modify Tailwind classes in component files**
   ```tsx
   // ❌ Bad - Component-specific style override
   <Button className="!bg-blue-600">  // Overriding with !important
   
   // ✅ Good - Add new variant to global-styles.ts
   // Then use: <Button variant="info">
   ```

---

## Troubleshooting

### Problem: Styles not appearing / backgrounds missing

**Cause:** Using template literals or dynamic class construction that Tailwind can't detect.

**Solution:** Replace with direct Tailwind class strings in `global-styles.ts`.

```typescript
// ❌ Bad
const primary = `bg-${colorVar}-600`;

// ✅ Good
const primary = 'bg-purple-600';
```

### Problem: TypeScript errors when importing styles

**Cause:** Missing or incorrect exports in `index.ts`.

**Solution:** Check that your component/style is exported:

```typescript
// front/app/ui/base/index.ts
export { Button } from './Button';
export { MyNewComponent } from './MyNewComponent';
export * from './global-styles';
```

### Problem: Changes to `global-styles.ts` not reflecting

**Cause:** Development server needs restart or browser cache.

**Solution:**
1. Restart dev server: `npm run dev`
2. Hard refresh browser: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)
3. Clear browser cache

### Problem: Inconsistent styling across components

**Cause:** Some components using centralized styles, others using hardcoded values.

**Solution:** Audit all components and ensure they import from `global-styles.ts`:

```bash
# Search for hardcoded Tailwind classes
grep -r "className=\"bg-" front/app/ui/

# Should only find instances in global-styles.ts and test files
```

### Problem: Want to override a style for one specific instance

**Solution:** Use the `className` prop to extend (not replace) styles:

```tsx
// ✅ Good - Extends base styles
<Button variant="primary" className="mt-4 w-full">
  Full Width Button
</Button>

// Component implementation should append className:
className={`${buttonStyles.base} ${buttonStyles.variants[variant]} ${className}`}
```

### Problem: Need different colors for different sections

**Solution:** Add semantic variants instead of creating new colors:

```typescript
// In global-styles.ts, add semantic variants:
export const colors: Record<ColorVariant, string> = {
  primary: 'bg-purple-600 hover:bg-purple-700 text-white',
  secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  success: 'bg-green-600 hover:bg-green-700 text-white',  // Add new semantic variant
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
} as const;

// Update the type
export type ColorVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
```

---

## Quick Reference Card

### Common Tasks Cheatsheet

| Task | File to Edit | Section |
|------|--------------|---------|
| Change button colors | `global-styles.ts` | Section 1: COLOR SYSTEM → `colors` |
| Change chip colors | `global-styles.ts` | Section 1: COLOR SYSTEM → `chipColors` |
| Change font sizes | `global-styles.ts` | Section 2: TYPOGRAPHY → `typography` |
| Change spacing | `global-styles.ts` | Section 3: SPACING → `componentSpacing` |
| Change focus color | `global-styles.ts` | Section 5: STATES → `states.focus` |
| Change border colors | `global-styles.ts` | Section 6: BORDERS → `borders.colors` |
| Add new component | Create new file in `ui/base/` | Follow Method 3 above |
| Test changes | Visit `/ui-test` | - |

### File Quick Links

- **Central Styles:** `front/app/ui/base/global-styles.ts`
- **Button Component:** `front/app/ui/base/Button.tsx`
- **TextField Component:** `front/app/ui/base/TextField.tsx`
- **Chip Component:** `front/app/ui/base/Chip.tsx`
- **Public Exports:** `front/app/ui/base/index.ts`
- **Test Page:** `front/app/ui-test/page.tsx`

---

## Summary

This centralized style system provides:

- ✅ **Consistency** - All components use the same design tokens
- ✅ **Maintainability** - Change once, update everywhere
- ✅ **Type Safety** - Full TypeScript support with autocomplete
- ✅ **Scalability** - Easy to add new components and variants
- ✅ **Performance** - Direct Tailwind classes for optimal JIT compilation

**Remember:** All style changes should happen in `front/app/ui/base/global-styles.ts` — it's your single source of truth! 🎨

---

**Last Updated:** March 2026  
**Version:** 1.0  
**Maintainer:** UI Team
