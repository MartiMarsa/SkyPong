import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  'w-full px-4 py-2 text-base md:text-lg text-gray-900 border rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      error: {
        true: 'border-border-error focus:ring-red-500',
        false: 'border-border hover:border-border-hover',
      },
    },
    defaultVariants: {
      error: false,
    },
  }
);

interface TextFieldProps {
  label?: string;
  placeholder?: string;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number';
  className?: string;
  disabled?: boolean;
}

export function TextField({
  label,
  placeholder,
  error,
  value,
  onChange,
  type = 'text',
  className,
  disabled = false,
}: TextFieldProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn(inputVariants({ error: !!error }), className)}
        disabled={disabled}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
