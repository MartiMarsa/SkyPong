import { chipColors } from './global-styles';

type ChipVariant = 'default' | 'success' | 'warning' | 'error';

interface ChipProps {
  variant?: ChipVariant;
  className?: string;
  children: React.ReactNode;
}

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
