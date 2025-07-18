import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; 
  placeholder?: string;
  rows?: number;
  error?: string; 
}

const TextArea: React.FC<TextAreaProps> = ({ label, id, value, onChange, placeholder, rows = 3, error, ...props }) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-gray-700 text-sm font-semibold mb-2">
        {label}:
      </label>
      <textarea
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`shadow-sm appearance-none border rounded-lg w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y transition duration-200 ease-in-out ${error ? 'border-red-500' : 'border-gray-300'}`}
        {...props}
      ></textarea>
      {error && <p className="text-red-500 text-xs italic mt-1">{error}</p>}
    </div>
  );
};

export default TextArea;