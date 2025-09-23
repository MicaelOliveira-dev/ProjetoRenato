import React, { useState } from 'react';

interface LogoUploaderProps {
  onLogoUrlChange: (url: string) => void;
}

const LogoUploader = ({ onLogoUrlChange }: LogoUploaderProps) => {
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
console.log("Evento onChange disparado!");
    const file = e.target.files?.[0];
    if (file) {
      // 1. Crie um objeto FormData para enviar o arquivo
        console.log("Arquivo detectado:", file.name);
      const formData = new FormData();
      formData.append('logo', file);

      try {
        // 2. Envie o arquivo para um endpoint de upload separado
        const response = await fetch('http://localhost:3001/api/uploadLogo', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload falhou');
        }

        const data = await response.json();
        const uploadedLogoUrl = data.url; // Assumindo que o servidor retorna a URL

        // 3. Chame a função para atualizar a URL no componente pai
        onLogoUrlChange(uploadedLogoUrl);

        // Opcional: Crie uma URL temporária para exibir a pré-visualização
        setLogoPreviewUrl(URL.createObjectURL(file));
      } catch (error) {
        console.error('Erro ao fazer upload do arquivo:', error);
        alert('Erro no upload da imagem. Tente novamente.');
      }
    }
  };

  return (
    <div className="flex flex-col items-center mb-6">
      <h3 className="text-xl font-bold text-gray-700 mb-4">Logo do Formulário</h3>
      {logoPreviewUrl ? (
        <img src={logoPreviewUrl} alt="Logo preview" className="w-32 h-32 object-contain mb-4 rounded-lg shadow" />
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