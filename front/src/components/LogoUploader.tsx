import React, { useState } from 'react';

const LogoUploader = ({ onLogoChange }: { onLogoChange: (url: string) => void }) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoUrl(result);
        onLogoChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center mb-6">
      <h3 className="text-xl font-bold text-gray-700 mb-4">Logo do Formulário</h3>
      {logoUrl ? (
        <img src={logoUrl} alt="Logo preview" className="w-32 h-32 object-contain mb-4 rounded-lg shadow" />
      ) : (
        <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center text-sm text-gray-500 mb-4">
          Nenhuma imagem
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4
                   file:rounded-full file:border-0
                   file:text-sm file:font-semibold
                   file:bg-blue-50 file:text-blue-700
                   hover:file:bg-blue-100"
      />
    </div>
  );
};

export default LogoUploader;
