/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Input from '../components/Input';
import Select from '../components/Select';
import RadioGroup from '../components/RadioGroup';
import TextArea from '../components/TextArea';
import Checkbox from '../components/Checkbox';

const API_URL = 'http://localhost:3001/api/formulario';
const API_SUBMIT_URL = 'http://localhost:3001/api/formularios/submeter';

// Mapeamento dos campos de seleção
const getCampoOptions = (campo: string) => {
  switch (campo) {
    case 'sexo':
      return [
        { value: 'masculino', label: 'MASC.' },
        { value: 'feminino', label: 'FEM.' },
        { value: 'outros', label: 'OUTROS' },
      ];
    case 'situacaoFuncional':
      return [
        { value: 'ativo', label: 'ATIVO' },
        { value: 'aposentado', label: 'APOSENTADO' },
        { value: 'pensionista', label: 'PENSIONISTA' },
      ];
    case 'lotacao':
      return [
        { value: 'sede', label: 'SEDE' },
        { value: 'hub', label: 'HUB' },
      ];
    case 'estado':
      return [
        { value: 'DF', label: 'Distrito Federal' },
        { value: 'SP', label: 'São Paulo' },
        { value: 'RJ', label: 'Rio de Janeiro' },
      ];
    default:
      return [];
  }
};

const campoMap: { [key: string]: any } = {
  nomeCompleto: { label: 'Nome Completo', component: Input },
  nomeSocial: { label: 'Nome Social', component: Input },
  sexo: { label: 'Sexo', component: RadioGroup },
  situacaoFuncional: { label: 'Situação Funcional', component: RadioGroup },
  matricula: { label: 'Matrícula', component: Input },
  nomeMae: { label: 'Nome da Mãe', component: Input },
  dataAdmissao: { label: 'Data de Admissão', component: Input, type: 'date' },
  dataNascimento: { label: 'Data de Nascimento', component: Input, type: 'date' },
  rg: { label: 'RG', component: Input, placeholder: 'Ex: XX.XXX.XXX-X' },
  cpf: { label: 'CPF', component: Input, placeholder: 'XXX.XXX.XXX-XX' },
  lotacao: { label: 'Lotação', component: RadioGroup },
  setor: { label: 'Setor', component: Input },
  cargo: { label: 'Cargo', component: Input },
  salarioBase: { label: 'Salário Base (R$)', component: Input, type: 'number' },
  enderecoResidencial: { label: 'Endereço Residencial', component: Input },
  bairro: { label: 'Bairro', component: Input },
  cidade: { label: 'Cidade', component: Input },
  estado: { label: 'Estado', component: Select },
  cep: { label: 'CEP', component: Input, placeholder: 'XXXXX-XXX' },
  telefoneFixo: { label: 'Telefone Fixo', component: Input, placeholder: '(XX) XXXX-XXXX', type: 'tel' },
  celular: { label: 'Celular', component: Input, placeholder: '(XX) 9XXXX-XXXX', type: 'tel' },
  whatsapp: { label: 'WhatsApp', component: Input, placeholder: '(XX) 9XXXX-XXXX (opcional)', type: 'tel' },
  email: { label: 'Email', component: Input, type: 'email' },
  bancoRecebimento: { label: 'Banco de Recebimento', component: Input },
  observacoes: { label: 'Observações', component: TextArea },
  aceitaTermos: { label: 'Eu aceito os termos e condições.', component: Checkbox },
  dataCadastro: { label: 'Data de Cadastro', component: Input, type: 'date' },
};

const FormularioDinamico: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [formulario, setFormulario] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackModal, setFeedbackModal] = useState<{ visible: boolean, message: string, isError: boolean }>({
    visible: false,
    message: '',
    isError: false,
  });

  useEffect(() => {
    const fetchFormulario = async () => {
      try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) {
          throw new Error('Formulário não encontrado');
        }
        const data = await response.json();
        setFormulario(data);
        setLoading(false);
      } catch (err) {
        setError("Não foi possível carregar o formulário.");
        setLoading(false);
      }
    };
    fetchFormulario();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData((prevData: any) => ({
      ...prevData,
      [name]: newValue,
    }));
  };
  
  const resetForm = () => {
    setFormData({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(API_SUBMIT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, formId: id }),
      });

      if (!response.ok) {
        throw new Error('Falha no envio do formulário.');
      }

      setFeedbackModal({
        visible: true,
        message: 'Formulário enviado com sucesso!',
        isError: false,
      });
      resetForm();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao enviar o formulário.';
      setFeedbackModal({
        visible: true,
        message: `Erro ao enviar o formulário: ${errorMessage}`,
        isError: true,
      });
    }
  };

  const renderField = (field: string) => {
    const campoInfo = campoMap[field];
    if (!campoInfo) return null;
    
    const Component = campoInfo.component;
    const props: any = {
      id: field,
      name: field,
      label: campoInfo.label,
      value: formData[field] || '',
      onChange: handleChange,
      ...campoInfo,
      component: undefined,
    };
    
    if (Component === Checkbox) {
      props.checked = formData[field] || false;
      props.value = undefined;
    }
    
    // Adiciona o campo options para Select e RadioGroup
    if (Component === Select || Component === RadioGroup) {
      props.options = getCampoOptions(field);
      props.selectedValue = formData[field] || '';
    }
    
    return <Component {...props} />;
  };

  if (loading) {
    return <div className="text-center mt-20 text-gray-700">Carregando formulário...</div>;
  }

  if (error) {
    return <div className="text-center mt-20 text-red-600 font-bold">{error}</div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 border border-gray-200">
        <div className="flex justify-center mb-6">
          {formulario?.logoUrl ? (
            <img src={formulario.logoUrl} alt="Logo do Formulário" className="w-40 object-contain" />
          ) : (
            <div className="w-40 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-sm text-gray-500">
              Logo do Formulário
            </div>
          )}
        </div>
        <h2 className="text-3xl font-extrabold text-gray-800 mb-2 text-center">{formulario?.nome}</h2>
        <p className="text-sm text-center text-gray-500 mb-8">Preencha os campos abaixo para concluir seu cadastro.</p>
        
        <form onSubmit={handleSubmit}>
          {formulario?.campos.map((campo: string) => {
            if (campo === 'aceitaTermos' && formulario?.textoTermos) {
              return (
                <div key={campo}>
                  <p style={{ wordBreak: 'break-word' }} className="text-sm text-gray-600 mb-4" dangerouslySetInnerHTML={{ __html: formulario.textoTermos.replace(/\n/g, '<br/>') }} />
                  {renderField(campo)}
                </div>
              );
            }
            return (
              <div key={campo}>
                {renderField(campo)}
              </div>
            );
          })}
          
          <button
            type="submit"
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-colors"
          >
            Enviar Formulário
          </button>
        </form>
      </div>

      {feedbackModal.visible && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
          <div className="relative p-8 bg-white w-96 rounded-lg shadow-xl text-center">
            <h3 className={`text-2xl font-bold mb-4 ${feedbackModal.isError ? 'text-red-600' : 'text-green-600'}`}>
              {feedbackModal.isError ? 'Erro' : 'Sucesso'}
            </h3>
            <p className="text-gray-700 mb-6">{feedbackModal.message}</p>
            <button
              onClick={() => setFeedbackModal({ ...feedbackModal, visible: false })}
              className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormularioDinamico;
