import { chipStyles, type ChipVariant } from './global-styles';

interface ChipProps {
  variant?: ChipVariant;
  className?: string;
  children: React.ReactNode;
}

export function Chip({ variant = 'default', className = '', children }: ChipProps) {
  const classes = `
    ${chipStyles.base}
    ${chipStyles.variants[variant]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <span className={classes}>
      {children}
    </span>
  );
}
