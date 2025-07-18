import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  error?: string;
  maskPattern?: RegExp; 
  formatFn?: (value: string) => string; 
  maxLength?: number; 
}

const Input: React.FC<InputProps> = ({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  maskPattern,
  formatFn,
  maxLength,
  ...props
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawValue = e.target.value;

    if (maskPattern) {
      rawValue = rawValue.replace(/\D/g, '');
    }

    if (maxLength && rawValue.length > maxLength) {
      rawValue = rawValue.substring(0, maxLength);
    }

    let formattedValue = rawValue;
    if (formatFn) {
      formattedValue = formatFn(rawValue);
    }

    const syntheticEvent = {
      ...e,
      target: {
        ...e.target, 
        value: formattedValue,
        name: id, 
      },
    } as React.ChangeEvent<HTMLInputElement>;

    onChange(syntheticEvent);
  };

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-gray-700 text-sm font-semibold mb-2">
        {label}:
      </label>
      <input
        type={type}
        id={id}
        name={id} 
        value={value}
        onChange={handleInputChange} 
        placeholder={placeholder}
        className={`shadow-sm appearance-none border rounded-lg w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out ${error ? 'border-red-500' : 'border-gray-300'}`}
        maxLength={maxLength} 
        {...props}
      />
      {error && <p className="text-red-500 text-xs italic mt-1">{error}</p>}
    </div>
  );
};

export default Input;