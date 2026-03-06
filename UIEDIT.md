# UI Components Customization Guide

> Comprehensive guide for customizing the design system in the Transcendence project

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Quick Start](#quick-start)
4. [Customizing Colors](#customizing-colors)
5. [Customizing Components](#customizing-components)
6. [Creating New Components](#creating-new-components)
7. [Typography & Fonts](#typography--fonts)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Overview

This project uses a modern design system built with:

- **Tailwind CSS v4** with native CSS variables in `@theme` block
- **Class Variance Authority (CVA)** for type-safe component variants
- **clsx + tailwind-merge** via `cn()` utility for className management
- **Next.js 16** with App Router
- **TypeScript** for type safety

### Key Principles

✅ **CSS-first configuration**: Define theme variables in `globals.css`  
✅ **Auto-generated utilities**: `--color-primary` automatically creates `bg-primary`, `text-primary`, etc.  
✅ **Type-safe variants**: CVA ensures component variants are predictable and type-checked  
✅ **Backward compatible**: Component APIs remain stable while internals use modern patterns

---

## Architecture

```
front/
├── app/
│   ├── globals.css              # Theme variables & Tailwind config
│   ├── layout.js                # Font loading (Space Mono, Lora)
│   ├── lib/
│   │   └── utils.ts             # cn() utility for className merging
│   ├── ui/
│   │   └── base/
│   │       ├── Button.tsx       # Button component with CVA
│   │       ├── Chip.tsx         # Chip/badge component
│   │       ├── TextField.tsx    # Input field component
│   │       ├── types.ts         # Shared TypeScript types
│   │       └── index.ts         # Barrel export
│   └── ui-test/
│       └── page.tsx             # Component showcase & documentation
├── postcss.config.mjs           # PostCSS with Tailwind v4 plugin
├── tsconfig.json                # Path aliases (@/*)
└── package.json                 # Dependencies
```

### Dependencies

```json
{
  "tailwindcss": "^4.1.18",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.5.0"
}
```

---

## Quick Start

### 1. View the Component Showcase

Start the dev server and visit the test page:

```bash
cd front
npm run dev
```

Open http://localhost:3000/ui-test to see all components and design tokens.

### 2. Import Components

```tsx
import { Button, Chip, TextField } from '@/ui/base';

export default function MyPage() {
  return (
    <div>
      <Button variant="primary">Click me</Button>
      <Chip variant="success">Active</Chip>
      <TextField label="Username" placeholder="Enter name" />
    </div>
  );
}
```

### 3. Use the `cn()` Utility

```tsx
import { cn } from '@/lib/utils';

<Button className={cn('extra-class', isActive && 'opacity-50')} />
```

---

## Customizing Colors

### Understanding the Theme System

Colors are defined in `front/app/globals.css` inside the `@theme` block:

```css
@theme {
  --color-primary: #9333ea;        /* Generates: bg-primary, text-primary, border-primary */
  --color-primary-hover: #7e22ce;  /* Generates: bg-primary-hover, etc. */
}
```

**Key concept**: CSS variables with the `--color-*` prefix automatically generate Tailwind utility classes.

### Change Brand Colors

**File**: `front/app/globals.css` (lines 10-18)

```css
@theme {
  /* Change primary color (purple → blue) */
  --color-primary: #2563eb;           /* blue-600 */
  --color-primary-hover: #1d4ed8;     /* blue-700 */
  
  /* Change secondary color */
  --color-secondary: #4b5563;         /* gray-600 */
  --color-secondary-hover: #374151;   /* gray-700 */
  
  /* Change danger color */
  --color-danger: #dc2626;            /* red-600 */
  --color-danger-hover: #b91c1c;      /* red-700 */
  
  /* Ghost button (transparent background) */
  --color-ghost: transparent;
  --color-ghost-hover: #f3f4f6;       /* gray-100 */
}
```

**Result**: All buttons using `variant="primary"` will now be blue.

### Customize Chip Colors

**File**: `front/app/globals.css` (lines 20-27)

```css
@theme {
  /* Default chip */
  --color-chip-default: #f3f4f6;      /* Background */
  --color-chip-default-text: #1f2937; /* Text color */
  
  /* Success chip (green) */
  --color-chip-success: #d1fae5;      /* Light green bg */
  --color-chip-success-text: #065f46; /* Dark green text */
  
  /* Warning chip (yellow) */
  --color-chip-warning: #fef3c7;      /* Light yellow bg */
  --color-chip-warning-text: #92400e; /* Dark yellow text */
  
  /* Error chip (red) */
  --color-chip-error: #fee2e2;        /* Light red bg */
  --color-chip-error-text: #991b1b;   /* Dark red text */
}
```

### Customize Focus & Border Colors

**File**: `front/app/globals.css` (lines 29-33)

```css
@theme {
  /* Focus ring color (appears when inputs/buttons are focused) */
  --color-focus: #a855f7;             /* purple-500 */
  
  /* Border colors for inputs */
  --color-border: #d1d5db;            /* gray-300 - default */
  --color-border-hover: #9ca3af;      /* gray-400 - hover state */
  --color-border-error: #ef4444;      /* red-500 - error state */
}
```

### Add New Colors

To add a new color theme:

1. **Define the CSS variable** in `globals.css`:

```css
@theme {
  --color-accent: #f59e0b;            /* orange-500 */
  --color-accent-hover: #d97706;      /* orange-600 */
}
```

2. **Use in components**:

```tsx
<Button className="bg-accent hover:bg-accent-hover text-white">
  Accent Button
</Button>
```

Or add as a new variant (see [Customizing Components](#customizing-components)).

---

## Customizing Components

### Button Component

**File**: `front/app/ui/base/Button.tsx`

#### Change Button Sizes

```tsx
const buttonVariants = cva(
  '/* base styles */',
  {
    variants: {
      size: {
        sm: 'px-4 py-1.5',      // Smaller padding
        md: 'px-6 py-4',        // Medium (default)
        lg: 'px-10 py-6',       // Larger padding
        xl: 'px-14 py-8',       // 👈 Add new size
      },
    },
  }
);
```

**Usage**:
```tsx
<Button size="xl">Extra Large</Button>
```

#### Add New Button Variant

```tsx
const buttonVariants = cva(
  '/* base styles */',
  {
    variants: {
      variant: {
        primary: 'bg-primary hover:bg-primary-hover text-white',
        secondary: 'bg-secondary hover:bg-secondary-hover text-white',
        danger: 'bg-danger hover:bg-danger-hover text-white',
        ghost: 'bg-ghost hover:bg-ghost-hover text-gray-700',
        // 👇 Add new variant
        accent: 'bg-accent hover:bg-accent-hover text-white',
      },
    },
  }
);
```

**Update TypeScript types** in `front/app/ui/base/types.ts`:

```tsx
export type ColorVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'accent';
```

**Usage**:
```tsx
<Button variant="accent">New Variant</Button>
```

#### Change Button Border Radius

```tsx
const buttonVariants = cva(
  // Change 'rounded-full' to 'rounded-md' for less rounded corners
  'inline-flex items-center justify-center font-bold rounded-md /* ... */',
  // ...
);
```

Options:
- `rounded-none` - No rounding
- `rounded-sm` - Slightly rounded (2px)
- `rounded-md` - Medium rounded (6px)
- `rounded-lg` - Large rounded (8px)
- `rounded-xl` - Extra large (12px)
- `rounded-full` - Fully rounded (pill shape)

### Chip Component

**File**: `front/app/ui/base/Chip.tsx`

#### Add New Chip Variant

1. **Add CSS variables** in `globals.css`:

```css
@theme {
  --color-chip-info: #dbeafe;       /* blue-100 */
  --color-chip-info-text: #1e40af;  /* blue-800 */
}
```

2. **Add variant to CVA**:

```tsx
const chipVariants = cva(
  '/* base styles */',
  {
    variants: {
      variant: {
        default: 'bg-chip-default text-chip-default-text',
        success: 'bg-chip-success text-chip-success-text',
        warning: 'bg-chip-warning text-chip-warning-text',
        error: 'bg-chip-error text-chip-error-text',
        info: 'bg-chip-info text-chip-info-text', // 👈 New
      },
    },
  }
);
```

3. **Update types** in `types.ts`:

```tsx
export type ChipVariant = 'default' | 'success' | 'warning' | 'error' | 'info';
```

#### Change Chip Size

```tsx
const chipVariants = cva(
  // Adjust padding and text size
  'inline-flex items-center px-3 py-1 text-sm font-medium rounded-full',
  // ...
);
```

### TextField Component

**File**: `front/app/ui/base/TextField.tsx`

#### Change Input Styling

```tsx
const inputVariants = cva(
  // Modify base styles here
  'w-full px-4 py-3 text-lg text-gray-900 border-2 rounded-lg /* ... */',
  // ...
);
```

#### Add Input Variants (e.g., filled style)

```tsx
const inputVariants = cva(
  '/* base styles */',
  {
    variants: {
      variant: {
        outlined: 'border border-border bg-transparent',
        filled: 'border-0 bg-gray-100',
      },
      error: {
        true: 'border-border-error focus:ring-red-500',
        false: 'border-border hover:border-border-hover',
      },
    },
    defaultVariants: {
      variant: 'outlined',
      error: false,
    },
  }
);
```

---

## Creating New Components

### Step 1: Create Component File

**File**: `front/app/ui/base/Badge.tsx`

```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  // Base styles
  'inline-flex items-center font-semibold rounded',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white',
        secondary: 'bg-secondary text-white',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant, size, className, children }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size, className }))}>
      {children}
    </span>
  );
}
```

### Step 2: Export from Barrel

**File**: `front/app/ui/base/index.ts`

```tsx
export { Button } from './Button';
export { Chip } from './Chip';
export { TextField } from './TextField';
export { Badge } from './Badge'; // 👈 Add new component
```

### Step 3: Use Component

```tsx
import { Badge } from '@/ui/base';

<Badge variant="primary" size="sm">New</Badge>
```

---

## Typography & Fonts

### Current Fonts

Defined in `front/app/layout.js`:

```javascript
import { Space_Mono, Lora } from 'next/font/google';

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
});

const lora = Lora({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-lora',
});
```

### Font Classes Available

Defined in `globals.css` (outside the `@theme` block):

```css
/* Custom font utility classes - these look up CSS vars from the cascade */
.font-display {
  font-family: var(--font-space-mono, ui-monospace, monospace);
}

/* Override Tailwind's default .font-sans to use our Lora font */
.font-sans {
  font-family: var(--font-lora, ui-serif, serif);
}
```

**Usage in Tailwind**:
- `font-display` - Space Mono (monospace) - for buttons and display elements
- `font-sans` - Lora (serif) - for body text
- `font-mono` - System monospace

**Important**: Font utility classes must reference Next.js font CSS variables directly (not through intermediate `:root` variables) to ensure proper CSS cascade inheritance from the `<body>` element where Next.js sets the font variables.

### Change Fonts

1. **Install new font** in `layout.js`:

```javascript
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});
```

2. **Update font utility class** in `globals.css`:

```css
/* Define custom utility class that references the Next.js font CSS variable */
.font-sans {
  font-family: var(--font-inter, ui-sans-serif, sans-serif);
}
```

**Important**: Do NOT use intermediate CSS variables at `:root` level. Font utility classes must directly reference the Next.js font variables (e.g., `var(--font-inter)`) to properly inherit from the `<body>` element.

3. **Apply to body** in `layout.js`:

```javascript
<body className={`${inter.variable} font-sans`}>
```

### Troubleshooting Fonts

**Problem**: Fonts not displaying on buttons or other elements.

**Common Causes**:
1. **CSS Variable Scope Issue**: Trying to reference Next.js font CSS variables from `:root` won't work because Next.js sets them on `<body>`.
   
   ```css
   /* ❌ WRONG - This won't work */
   :root {
     --font-display: var(--font-space-mono, monospace);
   }
   .font-display {
     font-family: var(--font-display);
   }
   
   /* ✅ CORRECT - Directly reference Next.js font variable */
   .font-display {
     font-family: var(--font-space-mono, ui-monospace, monospace);
   }
   ```

2. **Using `@theme` block**: Font families cannot use CSS variables inside Tailwind v4's `@theme` directive because it's evaluated at build time.

3. **Cache Issues**: Clear Next.js cache and restart dev server:
   ```bash
   rm -rf .next
   npm run dev
   ```

**Solution**: Define font utility classes outside the `@theme` block and have them directly reference Next.js font CSS variables with proper fallbacks.

### Typography Utilities

Use Tailwind's built-in typography classes:

```tsx
<h1 className="text-4xl font-bold">Large Heading</h1>
<p className="text-base md:text-lg">Responsive body text</p>
<small className="text-sm text-gray-600">Small text</small>
```

**Font Control in Components**:

For the Button component specifically:

```tsx
// Default - uses Space Mono (monospace)
<Button variant="primary">Click Me</Button>

// Override to use Lora (serif)
<Button variant="primary" font="body">Click Me</Button>

// Use system monospace
<Button variant="primary" font="mono">Click Me</Button>
```

The Button component in `front/app/ui/base/Button.tsx` has a `font` prop with these options:
- `font="display"` - Space Mono (default)
- `font="body"` - Lora
- `font="mono"` - System monospace

---

## Best Practices

### ✅ Do's

1. **Always use the `cn()` utility** when combining classNames:
   ```tsx
   <Button className={cn('custom-class', isActive && 'opacity-50')} />
   ```

2. **Define colors in `globals.css`** - Don't hardcode hex values in components:
   ```tsx
   // ❌ Bad
   <div className="bg-[#9333ea]">
   
   // ✅ Good
   <div className="bg-primary">
   ```

3. **Use CVA for component variants** - Keep variant logic centralized:
   ```tsx
   const variants = cva(base, { variants: { ... } });
   ```

4. **Leverage TypeScript types** - Define shared types in `types.ts`:
   ```tsx
   interface MyComponentProps extends VariantProps<typeof myVariants> {
     // ...
   }
   ```

5. **Test on `/ui-test` page** - Add new components to the showcase for visual testing.

### ❌ Don'ts

1. **Don't use inline styles** unless absolutely necessary:
   ```tsx
   // ❌ Avoid
   <div style={{ backgroundColor: '#9333ea' }}>
   
   // ✅ Use Tailwind
   <div className="bg-primary">
   ```

2. **Don't bypass the design system** - If you need a new color, add it to `globals.css`:
   ```tsx
   // ❌ Bad
   <Button className="!bg-[#random-color]">
   
   // ✅ Good - Add to theme first
   <Button variant="newVariant">
   ```

3. **Don't create one-off components** - Extend existing components when possible:
   ```tsx
   // ❌ Bad - New component for minor change
   export function PurpleButton() { ... }
   
   // ✅ Good - Use existing component
   <Button variant="primary" className="custom-tweaks">
   ```

### Naming Conventions

- **Component files**: PascalCase (`Button.tsx`, `TextField.tsx`)
- **CSS variables**: kebab-case (`--color-primary`, `--font-family-display`)
- **Utility classes**: Auto-generated from CSS variables (`bg-primary`, `text-danger`)
- **CVA variants**: camelCase (`variant`, `size`, `fontSize`)

---

## Troubleshooting

### Components Don't Have Styles

**Problem**: Button/Chip backgrounds are transparent or missing styles.

**Solution**: Ensure CSS variables are properly defined in `globals.css` `@theme` block and use proper Tailwind utility classes (not arbitrary values with `[]`).

```tsx
// ❌ Wrong - arbitrary value syntax
className="bg-[--color-primary]"

// ✅ Correct - auto-generated utility
className="bg-primary"
```

### Colors Not Updating

**Problem**: Changed CSS variable but color doesn't update in browser.

**Solutions**:
1. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)
2. Restart dev server: `npm run dev`
3. Clear Next.js cache: `rm -rf .next`

### TypeScript Errors on New Variants

**Problem**: Adding new variant causes type errors.

**Solution**: Update type definitions in `types.ts`:

```tsx
// Add new variant to type
export type ColorVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'newVariant';
```

### Path Alias Not Working

**Problem**: Import from `@/...` fails.

**Solution**: Verify `tsconfig.json` has correct configuration:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./app/*"]
    }
  }
}
```

Restart TypeScript server in your IDE.

### CVA Not Working

**Problem**: Variants don't apply or type errors occur.

**Solution**: 
1. Check CVA is installed: `npm list class-variance-authority`
2. Verify import: `import { cva } from 'class-variance-authority'`
3. Ensure variants extend `VariantProps<typeof variantName>`

---

## Advanced Customization

### Dark Mode Support

To add dark mode, use Tailwind's `dark:` variant:

1. **Add dark mode colors** to `globals.css`:

```css
@theme {
  --color-bg-dark: #1f2937;
  --color-text-dark: #f9fafb;
}
```

2. **Update component**:

```tsx
const buttonVariants = cva(
  'bg-primary text-white dark:bg-bg-dark dark:text-text-dark',
  // ...
);
```

3. **Enable dark mode** in Next.js (add to layout):

```tsx
<html className="dark">
```

### Responsive Variants

CVA supports responsive variants using Tailwind breakpoints:

```tsx
<Button className="w-full md:w-auto">
  Responsive Button
</Button>
```

### Animation

Add animations to `globals.css` and use in components:

```css
@theme {
  @keyframes slide-in {
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
  }
  
  --animate-slide-in: slide-in 0.3s ease-out;
}
```

```tsx
<div className="animate-slide-in">Animated content</div>
```

---

## Resources

- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [Class Variance Authority](https://cva.style/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Component Showcase](/ui-test) - Local testing page

---

## Need Help?

- View component examples at `/ui-test`
- Check `front/app/ui/base/` for component source code
- Review `front/app/globals.css` for theme configuration

**Happy customizing! 🎨**
