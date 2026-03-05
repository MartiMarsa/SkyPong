import { inputStyles } from './global-styles';

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
  const inputClasses = `
    ${inputStyles.base}
    ${error ? inputStyles.states.error : inputStyles.states.default}
    ${inputStyles.states.focus}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={inputStyles.wrapper}>
      {label && (
        <label className={inputStyles.label}>
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={inputClasses}
        disabled={disabled}
      />
      {error && (
        <p className={inputStyles.errorText}>{error}</p>
      )}
    </div>
  );
}
