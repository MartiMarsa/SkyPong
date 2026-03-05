import Link from 'next/link';
import { colors, spacing, borderRadius } from './global-styles';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
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
  href,
  className = '',
  children,
  type = 'button',
  disabled = false,
  onClick,
}: ButtonProps) {
  const baseStyles = `
    inline-flex items-center justify-center
    font-medium
    transition-colors
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${colors[variant]}
    ${spacing[size]}
    ${borderRadius.md}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  if (href) {
    return (
      <Link href={href} className={baseStyles}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={baseStyles}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
