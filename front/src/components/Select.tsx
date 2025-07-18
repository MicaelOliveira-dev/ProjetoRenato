import React from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  error?: string; // Adicionado para exibir erros
}

const Select: React.FC<SelectProps> = ({ label, id, value, onChange, options, error, ...props }) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-gray-700 text-sm font-semibold mb-2">
        {label}:
      </label>
      <select
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        className={`shadow-sm appearance-none border rounded-lg w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out ${error ? 'border-red-500' : 'border-gray-300'}`}
        {...props}
      >
        <option value="">Selecione...</option> {/* Opção padrão */}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-xs italic mt-1">{error}</p>}
    </div>
  );
};
export default Select;