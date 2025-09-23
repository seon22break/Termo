import React from 'react';

interface CustomInputProps {
  id: string;
  name: string;
  type?: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  maxLength?: number;
  minLength?: number;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  error?: string;
  helperText?: string;
  min?: number;
  max?: number;
  autoFocus?: boolean;
}

const CustomInput: React.FC<CustomInputProps> = ({
  id,
  name,
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  maxLength,
  minLength,
  required = false,
  disabled = false,
  autoComplete = 'off',
  className = '',
  labelClassName = '',
  inputClassName = '',
  error,
  helperText,
  min,
  max,
  autoFocus = false
}) => {
  const hasError = Boolean(error);

  return (
    <div className={className}>
      <label 
        htmlFor={id} 
        className={`block text-sm font-medium text-zinc-300 mb-2 ${labelClassName}`}
      >
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        className={`w-full px-2 py-1 bg-zinc-800 border rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 transition-colors duration-200 ${
          hasError 
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
            : 'border-zinc-700 focus:ring-blue-500 focus:border-transparent'
        } ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${inputClassName}`}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        minLength={minLength}
        min={min}
        max={max}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
      />
      {(error || helperText) && (
        <div className="mt-1">
          {error && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          )}
          {helperText && !error && (
            <p className="text-xs text-zinc-500">
              {helperText}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomInput;