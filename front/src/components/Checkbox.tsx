import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string; 
}

const Checkbox: React.FC<CheckboxProps> = ({ label, id, checked, onChange, error, ...props }) => {
  return (
    <div className="mb-4 flex items-center">
      <input
        type="checkbox"
        id={id}
        name={id}
        checked={checked}
        onChange={onChange}
        className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
        {...props}
      />
      <label htmlFor={id} className="ml-2 text-gray-700 text-sm cursor-pointer">
        {label}
      </label>
      {error && <p className="text-red-500 text-xs italic mt-1">{error}</p>}
    </div>
  );
};

export default Checkbox;