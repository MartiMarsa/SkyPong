import Link from 'next/link';
import { 
  buttonStyles,
  type ColorVariant,
  type Size,
  type FontFamily,
  fontWeights,
} from './global-styles';

interface ButtonProps {
  variant?: ColorVariant;
  size?: Size;
  font?: FontFamily;
  href?: string;
  className?: string;
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: () => void;
}

export function Button({
  variant = 'primary',
  size = 'md',
  font = 'display',
  href,
  className = '',
  children,
  type = 'button',
  disabled = false,
  onClick,
}: ButtonProps) {
  const baseStyles = `
    ${buttonStyles.base}
    ${buttonStyles.variants[variant]}
    ${buttonStyles.sizes[size]}
    ${className}
  `.trim().replace(/\s+/g, ' ');
  
  const fontStyle = {
    fontFamily: font === 'display' 
      ? 'var(--font-space-mono), monospace' 
      : font === 'mono' 
        ? 'monospace' 
        : 'var(--font-lora), serif',
    fontWeight: buttonStyles.fontWeight,
  };

  if (href) {
    return (
      <Link href={href} className={baseStyles} style={fontStyle}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={baseStyles}
      style={fontStyle}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
