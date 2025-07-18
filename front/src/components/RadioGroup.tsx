import React from 'react';

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  label: string;
  name: string;
  options: RadioOption[];
  selectedValue: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string; // Adicionado para exibir erros
}

const RadioGroup: React.FC<RadioGroupProps> = ({ label, name, options, selectedValue, onChange, error }) => {
  return (
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-semibold mb-2">
        {label}:
      </label>
      {options.map((option) => (
        <div key={option.value} className="inline-flex items-center mr-6 mb-2">
          <input
            type="radio"
            id={`${name}-${option.value}`}
            name={name}
            value={option.value}
            checked={selectedValue === option.value}
            onChange={onChange}
            className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <label htmlFor={`${name}-${option.value}`} className="ml-2 text-gray-700 text-sm cursor-pointer">
            {option.label}
          </label>
        </div>
      ))}
      {error && <p className="text-red-500 text-xs italic mt-1">{error}</p>}
    </div>
  );
};


export default RadioGroup;