export const colors = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white",
  secondary: "bg-gray-600 hover:bg-gray-700 text-white",
  danger: "bg-red-600 hover:bg-red-700 text-white",
  ghost: "bg-transparent hover:bg-gray-100 text-gray-700",
};

export const chipColors: Record<'default' | 'success' | 'warning' | 'error', string> = {
  default: "bg-gray-100 text-gray-800",
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  error: "bg-red-100 text-red-800",
};

export const inputColors = {
  default: "border-gray-300 hover:border-gray-400",
  error: "border-red-500 focus:ring-red-500",
  focus: "focus:ring-blue-500 focus:border-transparent",
};

export const typography = {
  body: "text-base md:text-lg text-gray-900",
  heading: "text-xl md:text-2xl font-bold text-gray-900",
  small: "text-sm md:text-base text-gray-600",
};

export const spacing = {
  sm: "px-3 py-1.5",
  md: "px-4 py-2",
  lg: "px-6 py-3",
};

export const borderRadius = {
  sm: "rounded",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};

export const fonts = {
  display: "font-display",
  body: "font-sans",
  mono: "font-mono",
};