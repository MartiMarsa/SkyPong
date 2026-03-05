type ChipVariant = 'default' | 'success' | 'warning' | 'error';

interface ChipProps {
  variant?: ChipVariant;
  className?: string;
  children: React.ReactNode;
}

const chipColors: Record<ChipVariant, string> = {
  default: "bg-gray-100 text-gray-800",
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  error: "bg-red-100 text-red-800",
};

export function Chip({ variant = 'default', className = '', children }: ChipProps) {
  const chipStyles = `
    inline-flex items-center
    px-2.5 py-0.5
    text-xs md:text-sm
    font-medium
    rounded-full
    ${chipColors[variant]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <span className={chipStyles}>
      {children}
    </span>
  );
}
