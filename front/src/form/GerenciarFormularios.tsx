import React, { useState, useEffect } from 'react';

// 1. Tipagem para as props do componente Modal
interface ModalProps {
  show: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  showCancel?: boolean;
}

// 2. Componente Modal tipado
const Modal: React.FC<ModalProps> = ({ show, title, message, onConfirm, onCancel, showCancel = true }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75 flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg mx-auto bg-white rounded-xl shadow-2xl transition-all transform scale-100 p-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600 mb-6">{message}</p>
        </div>
        <div className="flex justify-end space-x-4">
          {showCancel && (
            <button
              type="button"
              className="py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
              onClick={onCancel}
            >
              Cancelar
            </button>
          )}
          <button
            type="button"
            className="py-2 px-4 bg-blue-600 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
            onClick={onConfirm}
          >
            {showCancel ? 'Confirmar' : 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
};

// 3. Tipagem para as props do componente LogoUploader
interface LogoUploaderProps {
  onLogoChange: (logoUrl: string | null) => void;
}

// 4. Componente LogoUploader tipado
const LogoUploader: React.FC<LogoUploaderProps> = ({ onLogoChange }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          onLogoChange(reader.result as string);
        } else {
          onLogoChange(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <label className="block text-gray-700 font-semibold mb-2" htmlFor="logoUpload">
        Logotipo do Formulário
      </label>
      <input
        id="logoUpload"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
    </div>
  );
};

interface Formulario {
  _id: string; 
  nome: string;
  url: string;
  campos: string[];
}

const GerenciarFormularios = () => {
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [nomeNovoForm, setNomeNovoForm] = useState('');
  const [camposSelecionados, setCamposSelecionados] = useState<string[]>([]);
  const [textoTermos, setTextoTermos] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalAction, setModalAction] = useState<() => void>(() => () => {});
  const [modalIsConfirmation, setModalIsConfirmation] = useState(false);

  const camposDisponiveis = [
    'nomeCompleto', 'nomeSocial', 'sexo', 'situacaoFuncional', 'matricula',
    'nomeMae', 'dataAdmissao', 'dataNascimento', 'rg', 'cpf', 'lotacao',
    'setor', 'cargo', 'salarioBase', 'enderecoResidencial', 'bairro',
    'cidade', 'estado', 'cep', 'telefoneFixo', 'celular',
    'whatsapp', 'email', 'bancoRecebimento', 'observacoes', 'aceitaTermos', 'mensagem'
  ];

  // 5. Parâmetros de função tipados
  const showInfoModal = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalIsConfirmation(false);
    setModalAction(() => () => setShowModal(false));
    setShowModal(true);
  };

  // 6. Parâmetros de função tipados
  const showConfirmationModal = (title: string, message: string, onConfirm: () => void) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalIsConfirmation(true);
    setModalAction(() => () => {
      onConfirm();
      setShowModal(false);
    });
    setShowModal(true);
  };

  const fetchFormularios = async () => {
    try {
      const response = await fetch("https://api.empactoon.com.br/api/formulariosCriados");
      if (!response.ok) {
        throw new Error(`Erro na rede: ${response.statusText}`);
      }
      const data = await response.json();
      setFormularios(data);
    } catch (error) {
      console.error("Erro ao buscar formulários:", error);
      showInfoModal('Erro', 'Erro ao carregar a lista de formulários.');
    }
  };

  useEffect(() => {
    fetchFormularios();
  }, []);
  
  const criarNovoFormulario = async () => {
    if (!nomeNovoForm || camposSelecionados.length === 0) {
      showInfoModal('Atenção', 'Preencha o nome e selecione pelo menos um campo.');
      return;
    }

    try {
      const response = await fetch("https://api.empactoon.com.br/api/criarFormularios", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: nomeNovoForm,
          campos: camposSelecionados,
          textoTermos: textoTermos,
          logoUrl: logoUrl,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na rede: ${response.statusText}`);
      }
      
      const formCriado = await response.json();
      
      setFormularios([...formularios, formCriado]);
      setNomeNovoForm('');
      setCamposSelecionados([]);
      setTextoTermos('');
      setLogoUrl(null);
      showInfoModal('Sucesso', `Formulário "${formCriado.nome}" criado com sucesso! URL: ${formCriado.url}`);
    } catch (error) {
      console.error("Erro ao criar formulário:", error);
      showInfoModal('Erro', 'Erro ao criar o formulário. Tente novamente.');
    }
  };

  const handleCampoChange = (campo: string) => {
    setCamposSelecionados(prev =>
      prev.includes(campo) ? prev.filter(c => c !== campo) : [...prev, campo]
    );
  };
  
  const excluirFormulario = (id: string) => {
    showConfirmationModal(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este formulário?',
      async () => {
        try {
          const response = await fetch(`https://api.empactoon.com.br/api/formulariosCriados/${id}`, {
            method: 'DELETE',
          });
          if (!response.ok) {
            throw new Error(`Erro ao excluir o formulário: ${response.statusText}`);
          }
          setFormularios(formularios.filter(form => form._id !== id));
          showInfoModal('Sucesso', 'Formulário excluído com sucesso!');
        } catch (error) {
          console.error("Erro ao excluir formulário:", error);
          showInfoModal('Erro', 'Erro ao excluir o formulário. Tente novamente.');
        }
      }
    );
  };

  return (
    <>
      <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-10">
            Gerenciar Formulários
          </h1>
  
          <div className="bg-white rounded-xl shadow-lg p-8 mb-10 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Criar Novo Formulário</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-gray-700 font-semibold mb-2" htmlFor="formName">
                  Nome do Formulário
                </label>
                <input
                  id="formName"
                  type="text"
                  value={nomeNovoForm}
                  onChange={(e) => setNomeNovoForm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Ex: Contato Rápido"
                />
                <div className="mt-4">
                  <label className="block text-gray-700 font-semibold mb-2" htmlFor="termos">
                    Texto dos Termos e Condições
                  </label>
                  <textarea
                    id="termos"
                    value={textoTermos}
                    onChange={(e) => setTextoTermos(e.target.value)}
                    placeholder="Digite o texto de termos e condições..."
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div className="mt-4">
                  <LogoUploader onLogoChange={setLogoUrl} />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Campos Disponíveis
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {camposDisponiveis.map(campo => (
                    <label key={campo} className="inline-flex items-center text-gray-700">
                      <input
                        type="checkbox"
                        checked={camposSelecionados.includes(campo)}
                        onChange={() => handleCampoChange(campo)}
                        className="form-checkbox h-5 w-5 text-blue-600 rounded"
                      />
                      <span className="ml-2">{campo}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
  
            <button
              onClick={criarNovoFormulario}
              className="mt-8 w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-colors duration-300 transform hover:scale-105"
            >
              Criar Formulário
            </button>
          </div>
  
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Formulários Ativos</h2>
            {formularios.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {formularios.map((form) => (
                  <li key={form._id} className="py-5 flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div className="mb-2 md:mb-0">
                      <h3 className="text-lg font-semibold text-gray-900">{form.nome}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Campos: <span className="font-medium">{form.campos.join(', ')}</span>
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <a 
                        href={form.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:text-blue-800 font-medium break-all text-sm transition-colors"
                      >
                        {form.url}
                      </a>
                      <button
                        onClick={() => excluirFormulario(form._id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Excluir Formulário"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic text-center py-4">Nenhum formulário ativo no momento.</p>
            )}
          </div>
        </div>
      </div>
      <Modal
        show={showModal}
        title={modalTitle}
        message={modalMessage}
        onConfirm={modalAction}
        onCancel={() => setShowModal(false)}
        showCancel={modalIsConfirmation}
      />
    </>
  );
};

export default GerenciarFormularios;
