import { typography, inputColors } from './global-styles';

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
  className = '',
  disabled = false,
}: TextFieldProps) {
  const inputStyles = `
    w-full
    px-4 py-2
    ${typography.body}
    border
    rounded-md
    transition-colors
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:opacity-50 disabled:cursor-not-allowed
    ${error ? inputColors.error : inputColors.default}
    ${inputColors.focus}
    ${className}
  `.trim().replace(/\s+/g, ' ');

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
        className={inputStyles}
        disabled={disabled}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
