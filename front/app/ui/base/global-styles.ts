// ============================================================================
// DESIGN TOKENS - Core Design System
// ============================================================================
// This file contains all centralized styles, design tokens, and utilities
// for the UI component system. All colors, spacing, typography, and other
// design decisions should be defined here for consistency.
// ============================================================================

// ----------------------------------------------------------------------------
// TypeScript Types for Type Safety
// ----------------------------------------------------------------------------

export type ColorVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ChipVariant = 'default' | 'success' | 'warning' | 'error';
export type Size = 'sm' | 'md' | 'lg';
export type FontFamily = 'display' | 'body' | 'mono';

// ----------------------------------------------------------------------------
// 1. COLOR SYSTEM
// ----------------------------------------------------------------------------
// All colors use direct Tailwind class strings for proper JIT compilation
// Theme: Purple primary, with semantic colors for success/warning/danger

// Component-specific color combinations (background + text + hover)
export const colors: Record<ColorVariant, string> = {
  primary: 'bg-purple-600 hover:bg-purple-700 text-white',
  secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
} as const;

export const chipColors: Record<ChipVariant, string> = {
  default: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
} as const;

// ----------------------------------------------------------------------------
// 2. TYPOGRAPHY SYSTEM
// ----------------------------------------------------------------------------

// Font families
export const fontFamilies: Record<FontFamily, string> = {
  display: '!font-display',
  body: '!font-sans',
  mono: '!font-mono',
} as const;

// Font sizes (responsive)
export const fontSizes = {
  xs: 'text-xs md:text-sm',
  sm: 'text-sm md:text-base',
  base: 'text-base md:text-lg',
  lg: 'text-lg md:text-xl',
  xl: 'text-xl md:text-2xl',
  '2xl': 'text-2xl md:text-3xl',
} as const;

// Font weights
export const fontWeights = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
} as const;

// Complete typography styles (size + weight + color)
export const typography = {
  body: 'text-base md:text-lg text-gray-900',
  heading: 'text-xl md:text-2xl font-bold text-gray-900',
  subheading: 'text-lg md:text-xl font-semibold text-gray-900',
  small: 'text-sm md:text-base text-gray-600',
  label: 'text-sm font-medium text-gray-700',
  error: 'text-sm text-red-600',
} as const;

// ----------------------------------------------------------------------------
// 3. SPACING SYSTEM
// ----------------------------------------------------------------------------

// Component padding (internal spacing)
export const componentSpacing = {
  sm: 'px-4 py-1.5',
  md: 'px-6 py-4',
  lg: 'px-10 py-6',
} as const;

// Section margins (space between sections)
export const sectionSpacing = {
  sm: 'mb-6',
  md: 'mb-8',
  lg: 'mb-12',
} as const;

// Inline spacing (gaps in flex/grid)
export const inlineSpacing = {
  xs: 'gap-2',
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
} as const;

// Margin utilities
export const margins = {
  xs: 'mb-1',
  sm: 'mb-2',
  md: 'mb-4',
  lg: 'mb-8',
} as const;

// Legacy spacing export (for backward compatibility)
export const spacing = componentSpacing;

// ----------------------------------------------------------------------------
// 4. LAYOUT & CONTAINER
// ----------------------------------------------------------------------------

export const layout = {
  maxWidth: {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
  },
  padding: {
    page: 'p-8',
    section: 'p-4',
    card: 'p-4',
  },
  minHeight: {
    screen: 'min-h-screen',
    dvh: 'min-h-dvh',
  },
  center: 'mx-auto',
} as const;

// ----------------------------------------------------------------------------
// 5. INTERACTIVE STATES
// ----------------------------------------------------------------------------

export const states = {
  // Focus state (using purple to match primary color)
  focus: 'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
  // Disabled state
  disabled: 'disabled:opacity-50 disabled:cursor-not-allowed',
  // Transitions
  transition: 'transition-colors duration-200',
  transitionAll: 'transition-all duration-200',
} as const;

// ----------------------------------------------------------------------------
// 6. BORDERS & SHADOWS
// ----------------------------------------------------------------------------

export const borders = {
  width: {
    none: 'border-0',
    default: 'border',
    thick: 'border-2',
  },
  colors: {
    default: 'border-gray-300',
    hover: 'hover:border-gray-400',
    error: 'border-red-500',
    focus: 'border-transparent',
  },
} as const;

export const borderRadius = {
  none: 'rounded-none',
  sm: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
} as const;

export const shadows = {
  none: 'shadow-none',
  subtle: 'shadow-sm',
  medium: 'shadow-md',
  large: 'shadow-lg',
} as const;

// ----------------------------------------------------------------------------
// 7. COMMON UTILITIES
// ----------------------------------------------------------------------------

export const utilities = {
  // Flex utilities
  flexCenter: 'inline-flex items-center justify-center',
  flexStart: 'inline-flex items-center',
  flexCol: 'flex flex-col',
  flexWrap: 'flex flex-wrap',
  // Width utilities
  fullWidth: 'w-full',
  // Display utilities
  block: 'block',
  inlineBlock: 'inline-block',
  hidden: 'hidden',
} as const;

// ----------------------------------------------------------------------------
// 8. INPUT-SPECIFIC STYLES
// ----------------------------------------------------------------------------

export const inputColors = {
  default: 'border-gray-300 hover:border-gray-400',
  error: 'border-red-500 focus:ring-red-500',
  focus: 'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 border-transparent',
} as const;

// ----------------------------------------------------------------------------
// 9. COMPONENT-SPECIFIC STYLE BUILDERS
// ----------------------------------------------------------------------------
// Pre-composed styles for common component patterns

// Button component styles
export const buttonStyles = {
  base: 'inline-flex items-center justify-center font-bold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-full',
  
  variants: colors,
  sizes: componentSpacing,
  fonts: fontFamilies,
  fontWeight: 'bold',
} as const;

// Input/TextField component styles
export const inputStyles = {
  wrapper: 'w-full',
  
  label: 'block text-sm font-medium text-gray-700 mb-1',
  
  base: 'w-full px-4 py-2 text-base md:text-lg text-gray-900 border rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  
  states: {
    default: 'border-gray-300 hover:border-gray-400',
    error: 'border-red-500 focus:ring-red-500',
    focus: 'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 border-transparent',
  },
  
  errorText: 'mt-1 text-sm text-red-600',
} as const;

// Chip component styles
export const chipStyles = {
  base: 'inline-flex items-center px-2.5 py-0.5 text-xs md:text-sm font-medium rounded-full',
  
  variants: chipColors,
} as const;

// Layout styles for pages and sections
export const layoutStyles = {
  pageContainer: 'min-h-dvh bg-gray-50 p-8',
  
  contentContainer: 'mx-auto max-w-4xl',
  
  section: 'mb-12',
  
  sectionHeader: 'text-xl md:text-2xl font-semibold mb-4',
  
  card: 'p-4 bg-white rounded-lg border',
  
  cardHighlight: 'p-4 bg-blue-50 rounded-lg',
} as const;

// ----------------------------------------------------------------------------
// THEME REFERENCE (for future theme changes)
// ----------------------------------------------------------------------------
// To change the color theme, search and replace these color values:
//
// PRIMARY (Purple):
//   - Buttons: bg-purple-600, hover:bg-purple-700
//   - Focus rings: ring-purple-500
//
// SECONDARY (Gray):
//   - Buttons: bg-gray-600, hover:bg-gray-700
//   - Borders: border-gray-300, hover:border-gray-400
//   - Text: text-gray-600, text-gray-700, text-gray-900
//
// DANGER (Red):
//   - Buttons: bg-red-600, hover:bg-red-700
//   - Errors: border-red-500, text-red-600, bg-red-100, text-red-800
//
// SUCCESS (Green):
//   - Chips: bg-green-100, text-green-800
//
// WARNING (Yellow):
//   - Chips: bg-yellow-100, text-yellow-800
//
// ----------------------------------------------------------------------------
