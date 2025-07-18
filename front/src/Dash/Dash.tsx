import React, { useState, useEffect, useRef } from 'react';
import { FiEye, FiEdit, FiTrash2, FiSearch, FiXCircle } from 'react-icons/fi';
import Chart from 'chart.js/auto';
import { IoReaderOutline } from "react-icons/io5";

interface Cadastro {
  _id: string;
  nome?: string;
  razaoSocial?: string;
  sexo: 'Masculino' | 'Feminino' | 'Outro';
  lotacao?: string;
  setor?: string;
  situacaoFuncional: 'Ativo' | 'Inativo' | 'Licença';
  dataEnvio: string;
  matricula: string;
  dataNascimento: string;
  email: string;
  dataAdmissao?: string;
  nomeMae?: string;
  rg?: string;
  cpf?: string;
  cargo?: string;
  salarioBase?: number;
  enderecoResidencial?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  telefoneFixo?: string;
  celular?: string;
  whatsapp?: string;
  bancoRecebimento?: string;
  observacoes?: string;
  aceitaTermos?: boolean;
  mensagem?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

const ConfirmModal: React.FC<{ message: string; onConfirm: () => void; onCancel: () => void }> = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-lg p-8 shadow-2xl max-w-sm w-full transform scale-95 animate-scale-in">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Confirmação</h3>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-5 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

const AlertModal: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-lg p-8 shadow-2xl max-w-sm w-full transform scale-95 animate-scale-in">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Aviso</h3>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

const DateRangeModal: React.FC<{
  onConfirm: (dataInicial: string, dataFinal: string) => void;
  onCancel: () => void;
  defaultDataInicial?: string;
  defaultDataFinal?: string;
}> = ({ onConfirm, onCancel, defaultDataInicial = '', defaultDataFinal = '' }) => {
  const [dataInicial, setDataInicial] = useState(defaultDataInicial);
  const [dataFinal, setDataFinal] = useState(defaultDataFinal);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConfirm = () => {
    if (!dataInicial || !dataFinal) {
      setErrorMessage('Por favor, selecione ambas as datas.');
      return;
    }
    if (new Date(dataInicial) > new Date(dataFinal)) {
      setErrorMessage('A Data Inicial não pode ser posterior à Data Final.');
      return;
    }
    setErrorMessage(null);
    onConfirm(dataInicial, dataFinal);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-lg p-8 shadow-2xl max-w-md w-full transform scale-95 animate-scale-in">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Gerar Relatório PDF</h3>
        <p className="text-gray-700 mb-6">Selecione o intervalo de datas para o relatório:</p>

        <div className="mb-4">
          <label htmlFor="modalDataInicial" className="block text-sm font-medium text-gray-700">Data Inicial:</label>
          <input
            type="date"
            id="modalDataInicial"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
            value={dataInicial}
            onChange={(e) => { setDataInicial(e.target.value); setErrorMessage(null); }}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="modalDataFinal" className="block text-sm font-medium text-gray-700">Data Final:</label>
          <input
            type="date"
            id="modalDataFinal"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
            value={dataFinal}
            onChange={(e) => { setDataFinal(e.target.value); setErrorMessage(null); }}
          />
        </div>

        {errorMessage && (
          <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
        )}

        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-5 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Gerar Relatório
          </button>
        </div>
      </div>
    </div>
  );
};

const GeneratingPdfModal: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-lg p-8 shadow-2xl max-w-sm w-full flex flex-col items-center justify-center transform scale-95 animate-scale-in">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-700 text-lg font-semibold">Gerando seu relatório PDF...</p>
        <p className="text-gray-500 text-sm">Isso pode levar alguns instantes.</p>
      </div>
    </div>
  );
};

const EditModal: React.FC<{
  cadastro: Cadastro;
  onClose: () => void;
  onSave: (updatedCadastro: Cadastro) => void;
  setAlertMessage: (msg: string) => void;
  setShowAlert: (show: boolean) => void;
}> = ({ cadastro, onClose, onSave, setAlertMessage, setShowAlert }) => {
  const [formData, setFormData] = useState<Cadastro>(cadastro);

  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/formularios/${formData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          throw new Error(`Erro HTTP! Status: ${response.status} - ${response.statusText}`);
        }
        throw new Error(errorData.msg || errorData.message || 'Falha ao atualizar o cadastro.');
      }

      const updatedCadastro = await response.json();

      onSave(updatedCadastro);
      setAlertMessage('Cadastro atualizado com sucesso!');
      setShowAlert(true);
      onClose();
    } catch (err: any) {
      setAlertMessage(`Erro ao atualizar cadastro: ${err.message}`);
      setShowAlert(true);
      console.error('Erro ao atualizar cadastro:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-lg p-8 shadow-2xl max-w-2xl w-full transform scale-95 animate-scale-in overflow-y-auto max-h-[90vh]">
        <h3 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">Editar Cadastro</h3>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome</label>
            <input
              type="text"
              id="nome"
              name="nome"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              value={formData.nome || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="razaoSocial" className="block text-sm font-medium text-gray-700">Razão Social</label>
            <input
              type="text"
              id="razaoSocial"
              name="razaoSocial"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              value={formData.razaoSocial || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="matricula" className="block text-sm font-medium text-gray-700">Matrícula</label>
            <input
              type="text"
              id="matricula"
              name="matricula"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              value={formData.matricula || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="sexo" className="block text-sm font-medium text-gray-700">Sexo</label>
            <select
              id="sexo"
              name="sexo"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              value={formData.sexo || ''}
              onChange={handleChange}
            >
              <option value="">Selecione</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
          <div>
            <label htmlFor="situacaoFuncional" className="block text-sm font-medium text-gray-700">Situação Funcional</label>
            <select
              id="situacaoFuncional"
              name="situacaoFuncional"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              value={formData.situacaoFuncional || ''}
              onChange={handleChange}
            >
              <option value="">Selecione</option>
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
              <option value="Licença">Licença</option>
            </select>
          </div>
          <div>
            <label htmlFor="dataNascimento" className="block text-sm font-medium text-gray-700">Data de Nascimento</label>
            <input
              type="date"
              id="dataNascimento"
              name="dataNascimento"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              value={formatDateForInput(formData.dataNascimento)}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail</label>
            <input
              type="email"
              id="email"
              name="email"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              value={formData.email || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="lotacao" className="block text-sm font-medium text-gray-700">Lotação</label>
            <input
              type="text"
              id="lotacao"
              name="lotacao"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              value={formData.lotacao || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="setor" className="block text-sm font-medium text-gray-700">Setor</label>
            <input
              type="text"
              id="setor"
              name="setor"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              value={formData.setor || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="dataAdmissao" className="block text-sm font-medium text-gray-700">Data de Admissão</label>
            <input
              type="date"
              id="dataAdmissao"
              name="dataAdmissao"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              value={formatDateForInput(formData.dataAdmissao)}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="nomeMae" className="block text-sm font-medium text-gray-700">Nome da Mãe</label>
            <input
              type="text"
              id="nomeMae"
              name="nomeMae"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              value={formData.nomeMae || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="rg" className="block text-sm font-medium text-gray-700">RG</label>
            <input
              type="text"
              id="rg"
              name="rg"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              value={formData.rg || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">CPF</label>
            <input
              type="text"
              id="cpf"
              name="cpf"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              value={formData.cpf || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="cargo" className="block text-sm font-medium text-gray-700">Cargo</label>
            <input
              type="text"
              id="cargo"
              name="cargo"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              value={formData.cargo || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="salarioBase" className="block text-sm font-medium text-gray-700">Salário Base</label>
            <input
              type="number"
              id="salarioBase"
              name="salarioBase"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              value={formData.salarioBase || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="enderecoResidencial" className="block text-sm font-medium text-gray-700">Endereço Residencial</label>
            <input
              type="text"
              id="enderecoResidencial"
              name="enderecoResidencial"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              value={formData.enderecoResidencial || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="bairro" className="block text-sm font-medium text-gray-700">Bairro</label>
            <input
              type="text"
              id="bairro"
              name="bairro"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              value={formData.bairro || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="cidade" className="block text-sm font-medium text-gray-700">Cidade</label>
            <input
              type="text"
              id="cidade"
              name="cidade"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              value={formData.cidade || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="estado" className="block text-sm font-medium text-gray-700">Estado</label>
            <input
              type="text"
              id="estado"
              name="estado"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              value={formData.estado || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="cep" className="block text-sm font-medium text-gray-700">CEP</label>
            <input
              type="text"
              id="cep"
              name="cep"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              value={formData.cep || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="telefoneFixo" className="block text-sm font-medium text-gray-700">Telefone Fixo</label>
            <input
              type="text"
              id="telefoneFixo"
              name="telefoneFixo"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              value={formData.telefoneFixo || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="celular" className="block text-sm font-medium text-gray-700">Celular</label>
            <input
              type="text"
              id="celular"
              name="celular"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              value={formData.celular || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700">WhatsApp</label>
            <input
              type="text"
              id="whatsapp"
              name="whatsapp"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              value={formData.whatsapp || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="bancoRecebimento" className="block text-sm font-medium text-gray-700">Banco de Recebimento</label>
            <input
              type="text"
              id="bancoRecebimento"
              name="bancoRecebimento"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              value={formData.bancoRecebimento || ''}
              onChange={handleChange}
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700">Observações</label>
            <textarea
              id="observacoes"
              name="observacoes"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              value={formData.observacoes || ''}
              onChange={handleChange}
            />
          </div>
          <div className="md:col-span-2 flex items-center">
            <input
              type="checkbox"
              id="aceitaTermos"
              name="aceitaTermos"
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              checked={formData.aceitaTermos || false}
              onChange={handleChange}
            />
            <label htmlFor="aceitaTermos" className="ml-2 block text-sm text-gray-900">Aceita Termos</label>
          </div>
        </form>
        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};


function Dash() {
  const [cadastros, setCadastros] = useState<Cadastro[]>([]);
  const [cadastroSelecionado, setCadastroSelecionado] = useState<Cadastro | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [filterNomeRazaoSocial, setFilterNomeRazaoSocial] = useState<string>('');
  const [filterSituacaoFuncional, setFilterSituacaoFuncional] = useState<string>('');
  const [filterDataCadastramentoInicial, setFilterDataCadastramentoInicial] = useState<string>('');
  const [filterDataCadastramentoFinal, setFilterDataCadastramentoFinal] = useState<string>('');
  const [filterMatricula, setFilterMatricula] = useState<string>('');
  const [filterDataNascimentoInicial, setFilterDataNascimentoInicial] = useState<string>('');
  const [filterDataNascimentoFinal, setFilterDataNascimentoFinal] = useState<string>('');
  const [filterEmail, setFilterEmail] = useState<string>('');
  const [filterSexo, setFilterSexo] = useState<string>('');
  const [deletedAt, setDeletedAt] = useState<string>('');

  const [showRelatorioDateModal, setShowRelatorioDateModal] = useState(false);
  const [relatorioDataInicial,] = useState<string>('');
  const [relatorioDataFinal,] = useState<string>('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalMessage, setConfirmModalMessage] = useState('');
  const [confirmModalCallback, setConfirmModalCallback] = useState<(() => void) | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertModalMessage, setAlertModalMessage] = useState('');
  const [alertModalCallback,] = useState<(() => void) | null>(null);

  const generoChartRef = useRef<HTMLCanvasElement>(null);
  const lotacaoChartRef = useRef<HTMLCanvasElement>(null);

  const generoChartInstance = useRef<Chart | null>(null);
  const lotacaoChartInstance = useRef<Chart | null>(null);

  const fetchCadastros = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();

      if (filterNomeRazaoSocial) {
        queryParams.append('nomeRazaoSocial', filterNomeRazaoSocial);
      }
      if (filterSituacaoFuncional) {
        queryParams.append('situacaoFuncional', filterSituacaoFuncional);
      }
      if (filterDataCadastramentoInicial) {
        queryParams.append('dataCadastramentoInicial', filterDataCadastramentoInicial);
      }
      if (filterDataCadastramentoFinal) {
        queryParams.append('dataCadastramentoFinal', filterDataCadastramentoFinal);
      }
      if (filterMatricula) {
        queryParams.append('matricula', filterMatricula);
      }
      if (filterDataNascimentoInicial) {
        queryParams.append('dataNascimentoInicial', filterDataNascimentoInicial);
      }
      if (filterDataNascimentoFinal) {
        queryParams.append('dataNascimentoFinal', filterDataNascimentoFinal);
      }
      if (filterEmail) {
        queryParams.append('email', filterEmail);
      }
      if (filterSexo) {
        queryParams.append('sexo', filterSexo);
      }
      if (deletedAt) {
        queryParams.append('Deletado', deletedAt)
      }

      const url = `http://localhost:3000/api/formularios/filtros?${queryParams.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ msg: 'Erro desconhecido' }));
        throw new Error(errorData.msg || `Erro HTTP! Status: ${response.status}`);
      }

      const data: Cadastro[] = await response.json();
      setCadastros(data);
    } catch (err: any) {
      console.error("Erro ao buscar cadastros:", err);
      setError(err.message || 'Falha ao carregar os dados.');
      setCadastros([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCadastros();
  }, [
    filterNomeRazaoSocial,
    filterSituacaoFuncional,
    filterDataCadastramentoInicial,
    filterDataCadastramentoFinal,
    filterMatricula,
    filterDataNascimentoInicial,
    filterDataNascimentoFinal,
    filterEmail,
    filterSexo,
    deletedAt
  ]);


  useEffect(() => {
    const generoCounts = cadastros.reduce((acc, curr) => {
      acc[curr.sexo] = (acc[curr.sexo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    if (generoChartRef.current) {
      const ctx = generoChartRef.current.getContext('2d');
      if (ctx) {
        if (generoChartInstance.current) {
          generoChartInstance.current.destroy();
        }

        generoChartInstance.current = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: Object.keys(generoCounts),
            datasets: [{
              data: Object.values(generoCounts),
              backgroundColor: ['#6366F1', '#EC4899', '#FCD34D'],
            }],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: 'Distribuição por Sexo',
              },
            },
          },
        });
      }
    }

    const lotacaoCounts = cadastros.reduce((acc, curr) => {
      if (curr.lotacao) {
        acc[curr.lotacao] = (acc[curr.lotacao] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    if (lotacaoChartRef.current) {
      const ctx = lotacaoChartRef.current.getContext('2d');
      if (ctx) {
        if (lotacaoChartInstance.current) {
          lotacaoChartInstance.current.destroy();
        }

        lotacaoChartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: Object.keys(lotacaoCounts),
            datasets: [{
              label: 'Cadastros por Lotação',
              data: Object.values(lotacaoCounts),
              backgroundColor: '#3B82F6',
            }],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                display: false,
              },
              title: {
                display: true,
                text: 'Cadastros por Lotação',
              },
            },
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        });
      }
    }
    return () => {
      if (generoChartInstance.current) {
        generoChartInstance.current.destroy();
        generoChartInstance.current = null;
      }
      if (lotacaoChartInstance.current) {
        lotacaoChartInstance.current.destroy();
        lotacaoChartInstance.current = null;
      }
    };
  }, [cadastros]);

  const handleVisualizar = (cadastro: Cadastro) => {
    setCadastroSelecionado(cadastro);
  };

  const handleEditar = (cadastro: Cadastro) => {
    setCadastroSelecionado(cadastro);
    setShowEditModal(true);
  };

  const handleSaveEditedCadastro = (updatedCadastro: Cadastro) => {
    setCadastros(prevCadastros =>
      prevCadastros.map(c => (c._id === updatedCadastro._id ? updatedCadastro : c))
    );
    setShowEditModal(false);
  };

  const handleExcluir = (id: string) => {
    setConfirmModalMessage('Tem certeza que deseja excluir (soft delete) este cadastro?');
    setConfirmModalCallback(async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/formularios/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.msg || 'Falha ao excluir o cadastro.');
        }

        setShowConfirmModal(false);
        setShowAlertModal(true);
        setAlertModalMessage('Cadastro soft-deletado com sucesso!');
        fetchCadastros();
      } catch (err: any) {
        setShowConfirmModal(false);
        setShowAlertModal(true);
        setAlertModalMessage(`Erro ao excluir cadastro: ${err.message}`);
        console.error('Erro ao excluir cadastro:', err);
      }
    });
    setShowConfirmModal(true);
  };

  const generateAndDownloadPdf = async (dataInicial: string, dataFinal: string) => {
    setShowRelatorioDateModal(false);
    setIsGeneratingPdf(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:3000/api/formulario/relatorio-pdf?dataInicial=${dataInicial}&dataFinal=${dataFinal}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        let errorMsg = 'Falha ao gerar o relatório.';
        try {
          const errorData = await response.json();
          errorMsg = errorData.msg || errorData.message || errorMsg;
        } catch (jsonError) {
          errorMsg = `Erro ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMsg);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio_cadastros_${dataInicial}_${dataFinal}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setShowAlertModal(true);
      setAlertModalMessage('Relatório PDF gerado e baixado com sucesso!');

    } catch (err: any) {
      console.error("Erro ao gerar relatório:", err);
      setError(err.message || 'Falha ao gerar relatório.');
      setShowAlertModal(true);
      setAlertModalMessage(`Erro ao gerar relatório: ${err.message}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleRelatorio = () => {
    setShowRelatorioDateModal(true);
  };

  const handleClearFilters = () => {
    setFilterNomeRazaoSocial('');
    setFilterSituacaoFuncional('');
    setFilterDataCadastramentoInicial('');
    setFilterDataCadastramentoFinal('');
    setFilterMatricula('');
    setFilterDataNascimentoInicial('');
    setFilterDataNascimentoFinal('');
    setFilterEmail('');
    setFilterSexo('');
    setDeletedAt('');
  };

  const handleRestore = async (id: string) => {
    setConfirmModalMessage('Tem certeza que deseja restaurar este cadastro?');
    setConfirmModalCallback(async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/formularios/undelete/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch (jsonError) {
            throw new Error(`Erro HTTP! Status: ${response.status} - ${response.statusText}`);
          }
          throw new Error(errorData.msg || 'Falha ao restaurar o cadastro.');
        }

        const result = await response.json();
        const restoredCadastro = result.formulario; 

        setCadastros(prevCadastros =>
          prevCadastros.map(c => (c._id === restoredCadastro._id ? restoredCadastro : c))
        );

        setShowConfirmModal(false);
        setShowAlertModal(true);
        setAlertModalMessage(result.msg || 'Cadastro restaurado com sucesso!'); 
      } catch (err: any) {
        setShowConfirmModal(false);
        setShowAlertModal(true);
        setAlertModalMessage(`Erro ao restaurar cadastro: ${err.message}`);
        console.error('Erro ao restaurar cadastro:', err);
      }
    });
    setShowConfirmModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Mini Dashboard SINDSERCH DF</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 ">
        <div className="bg-white p-6 h-[300px] rounded-lg shadow-md flex items-center justify-between transform transition-transform duration-200 hover:scale-105">
          <div>
            <p className="text-lg text-gray-500">Total de Cadastros</p>
            {loading ? (
              <p className="text-4xl font-bold text-indigo-600">Carregando...</p>
            ) : error ? (
              <p className="text-xl text-red-500">Erro!</p>
            ) : (
              <p className="text-4xl font-bold text-indigo-600">{cadastros.length}</p>
            )}
          </div>
          <FiEye className="text-indigo-400 text-5xl" />
        </div>

        <div className="bg-white p-6 h-[300px] rounded-lg shadow-md col-span-1 md:col-span-1 flex items-center justify-center">
          <canvas ref={generoChartRef} className="max-w-full h-auto"></canvas>
        </div>

        <div className="bg-white p-6 h-[300px] rounded-lg shadow-md col-span-1 md:col-span-1 flex items-center justify-center">
          <canvas ref={lotacaoChartRef} className="max-w-full h-auto"></canvas>
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6 flex items-center">
          <FiSearch className="mr-2" /> Filtros de Cadastros
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label htmlFor="filterNomeRazaoSocial" className="block text-sm font-medium text-gray-700">Nome / Razão Social</label>
            <input
              type="text"
              id="filterNomeRazaoSocial"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              value={filterNomeRazaoSocial}
              onChange={(e) => setFilterNomeRazaoSocial(e.target.value)}
              placeholder="Ex: João Silva ou Empresa XYZ"
            />
          </div>

          <div>
            <label htmlFor="filterSituacaoFuncional" className="block text-sm font-medium text-gray-700">Situação Funcional</label>
            <select
              id="filterSituacaoFuncional"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              value={filterSituacaoFuncional}
              onChange={(e) => setFilterSituacaoFuncional(e.target.value)}
            >
              <option value="">Todas</option>
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
              <option value="Licença">Licença</option>
            </select>
          </div>

          <div>
            <label htmlFor="filterDataCadastramentoInicial" className="block text-sm font-medium text-gray-700">Data de Cadastramento (Desde)</label>
            <input
              type="date"
              id="filterDataCadastramentoInicial"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              value={filterDataCadastramentoInicial}
              onChange={(e) => setFilterDataCadastramentoInicial(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="filterDataCadastramentoFinal" className="block text-sm font-medium text-gray-700">Data de Cadastramento (Até)</label>
            <input
              type="date"
              id="filterDataCadastramentoFinal"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              value={filterDataCadastramentoFinal}
              onChange={(e) => setFilterDataCadastramentoFinal(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="filterMatricula" className="block text-sm font-medium text-gray-700">Matrícula</label>
            <input
              type="text"
              id="filterMatricula"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              value={filterMatricula}
              onChange={(e) => setFilterMatricula(e.target.value)}
              placeholder="Ex: M001"
            />
          </div>

          <div>
            <label htmlFor="filterDataNascimentoInicial" className="block text-sm font-medium text-gray-700">Data de Nascimento (Desde)</label>
            <input
              type="date"
              id="filterDataNascimentoInicial"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              value={filterDataNascimentoInicial}
              onChange={(e) => setFilterDataNascimentoInicial(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="filterDataNascimentoFinal" className="block text-sm font-medium text-gray-700">Data de Nascimento (Até)</label>
            <input
              type="date"
              id="filterDataNascimentoFinal"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              value={filterDataNascimentoFinal}
              onChange={(e) => setFilterDataNascimentoFinal(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="filterEmail" className="block text-sm font-medium text-gray-700">E-mail</label>
            <input
              type="email"
              id="filterEmail"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              value={filterEmail}
              onChange={(e) => setFilterEmail(e.target.value)}
              placeholder="Ex: email@example.com"
            />
          </div>

          <div>
            <label htmlFor="filterSexo" className="block text-sm font-medium text-gray-700">Sexo</label>
            <select
              id="filterSexo"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              value={filterSexo}
              onChange={(e) => setFilterSexo(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
          <div>
            <label htmlFor="deletedAt" className="block text-sm font-medium text-gray-700">Status de Exclusão</label>
            <select
              id="deletedAt"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              value={deletedAt}
              onChange={(e) => setDeletedAt(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="true">Deletados</option>
              <option value="false">Não Deletados</option>
            </select>
          </div>

        </div>
        <div className="flex justify-end">
          <button
            onClick={handleClearFilters}
            className="px-4 mr-3 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors duration-200 flex items-center"
          >
            <FiXCircle className="mr-2" /> Limpar Filtros
          </button>
          <button
            onClick={handleRelatorio}
            className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 flex items-center"
            disabled={loading || isGeneratingPdf}
          >
            <IoReaderOutline className="mr-2" /> Gerar Relatório PDF
          </button>
        </div>
      </div>


      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Lista de Cadastros</h2>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando dados...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            <p className="text-lg">Ocorreu um erro ao carregar os cadastros:</p>
            <p className="text-sm mt-2">{error}</p>
            <button
              onClick={fetchCadastros}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
            >
              Tentar Novamente
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome / Razão Social</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matrícula</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sexo</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Situação Funcional</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Cadastro</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Nascimento</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-mail</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Soft Delete</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cadastros.length > 0 ? (
                  cadastros.map((cadastro) => (
                    <tr key={cadastro._id} className={`${cadastro.deletedAt
                      ? 'bg-red-100 hover:bg-red-200'
                      : 'hover:bg-gray-50'
                      } transition-colors duration-150`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cadastro.nome || cadastro.razaoSocial || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cadastro.matricula || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cadastro.sexo || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cadastro.situacaoFuncional || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cadastro.dataEnvio ? new Date(cadastro.dataEnvio).toLocaleDateString('pt-BR') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cadastro.dataNascimento ? new Date(cadastro.dataNascimento).toLocaleDateString('pt-BR') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cadastro.email || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cadastro.deletedAt ? 'Deletado' : 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-center space-x-3">
                          <button
                            onClick={() => handleVisualizar(cadastro)}
                            className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-100 transition-colors duration-200"
                            title="Ver Detalhes"
                          >
                            <FiEye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleEditar(cadastro)}
                            className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-100 transition-colors duration-200"
                            title="Editar"
                          >
                            <FiEdit className="h-5 w-5" />
                          </button>
                          {cadastro.deletedAt ? (
                            <button
                              onClick={() => handleRestore(cadastro._id)}
                              className="text-green-600 hover:text-green-900 p-2 rounded-full hover:bg-green-100 transition-colors duration-200"
                              title="Restaurar"
                            >
                              <IoReaderOutline className="h-5 w-5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleExcluir(cadastro._id)}
                              className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-100 transition-colors duration-200"
                              title="Excluir"
                            >
                              <FiTrash2 className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500">Nenhum cadastro encontrado com os filtros aplicados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {cadastroSelecionado && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-lg p-8 shadow-2xl max-w-lg w-full transform scale-95 animate-scale-in">
            <h3 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">Detalhes do Cadastro</h3>
            <div className="space-y-2 text-gray-700 overflow-y-auto max-h-[70vh] pr-2">
              <p><strong>ID:</strong> {cadastroSelecionado._id}</p>
              <p><strong>Nome:</strong> {cadastroSelecionado.nome || 'N/A'}</p>
              <p><strong>Razão Social:</strong> {cadastroSelecionado.razaoSocial || 'N/A'}</p>
              <p><strong>Matrícula:</strong> {cadastroSelecionado.matricula || 'N/A'}</p>
              <p><strong>Sexo:</strong> {cadastroSelecionado.sexo || 'N/A'}</p>
              <p><strong>Lotação:</strong> {cadastroSelecionado.lotacao || 'N/A'}</p>
              <p><strong>Setor:</strong> {cadastroSelecionado.setor || 'N/A'}</p>
              <p><strong>Situação Funcional:</strong> {cadastroSelecionado.situacaoFuncional || 'N/A'}</p>
              <p><strong>Data de Cadastramento:</strong> {cadastroSelecionado.dataEnvio ? new Date(cadastroSelecionado.dataEnvio).toLocaleDateString('pt-BR') : 'N/A'}</p>
              <p><strong>Data de Nascimento:</strong> {cadastroSelecionado.dataNascimento ? new Date(cadastroSelecionado.dataNascimento).toLocaleDateString('pt-BR') : 'N/A'}</p>
              <p><strong>E-mail:</strong> {cadastroSelecionado.email || 'N/A'}</p>
              <p><strong>Nome da Mãe:</strong> {cadastroSelecionado.nomeMae || 'N/A'}</p>
              <p><strong>Data de Admissão:</strong> {cadastroSelecionado.dataAdmissao ? new Date(cadastroSelecionado.dataAdmissao).toLocaleDateString('pt-BR') : 'N/A'}</p>
              <p><strong>RG:</strong> {cadastroSelecionado.rg || 'N/A'}</p>
              <p><strong>CPF:</strong> {cadastroSelecionado.cpf || 'N/A'}</p>
              <p><strong>Cargo:</strong> {cadastroSelecionado.cargo || 'N/A'}</p>
              <p><strong>Salário Base:</strong> {cadastroSelecionado.salarioBase ? cadastroSelecionado.salarioBase.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'N/A'}</p>
              <p><strong>Endereço:</strong> {cadastroSelecionado.enderecoResidencial || 'N/A'}</p>
              <p><strong>Bairro:</strong> {cadastroSelecionado.bairro || 'N/A'}</p>
              <p><strong>Cidade:</strong> {cadastroSelecionado.cidade || 'N/A'}</p>
              <p><strong>Estado:</strong> {cadastroSelecionado.estado || 'N/A'}</p>
              <p><strong>CEP:</strong> {cadastroSelecionado.cep || 'N/A'}</p>
              <p><strong>Telefone Fixo:</strong> {cadastroSelecionado.telefoneFixo || 'N/A'}</p>
              <p><strong>Celular:</strong> {cadastroSelecionado.celular || 'N/A'}</p>
              <p><strong>WhatsApp:</strong> {cadastroSelecionado.whatsapp || 'N/A'}</p>
              <p><strong>Banco de Recebimento:</strong> {cadastroSelecionado.bancoRecebimento || 'N/A'}</p>
              <p><strong>Observações:</strong> {cadastroSelecionado.observacoes || 'N/A'}</p>
              <p><strong>Aceita Termos:</strong> {cadastroSelecionado.aceitaTermos ? 'Sim' : 'Não'}</p>
              <p><strong>Mensagem:</strong> {cadastroSelecionado.mensagem || 'N/A'}</p>
              <p><strong>Criado em (DB):</strong> {cadastroSelecionado.createdAt ? new Date(cadastroSelecionado.createdAt).toLocaleDateString('pt-BR') : 'N/A'}</p>
              <p><strong>Última Atualização (DB):</strong> {cadastroSelecionado.updatedAt ? new Date(cadastroSelecionado.updatedAt).toLocaleDateString('pt-BR') : 'N/A'}</p>
              <p><strong>Deletado em (Soft Delete):</strong> {cadastroSelecionado.deletedAt ? new Date(cadastroSelecionado.deletedAt).toLocaleDateString('pt-BR') : 'Não'}</p>
            </div>
            <button
              onClick={() => setCadastroSelecionado(null)}
              className="mt-6 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <ConfirmModal
          message={confirmModalMessage}
          onConfirm={() => {
            if (confirmModalCallback) confirmModalCallback();
          }}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}

      {showAlertModal && (
        <AlertModal
          message={alertModalMessage}
          onClose={() => {
            setShowAlertModal(false);
            if (alertModalCallback) alertModalCallback();
          }}
        />
      )}

      {showRelatorioDateModal && (
        <DateRangeModal
          onConfirm={generateAndDownloadPdf}
          onCancel={() => setShowRelatorioDateModal(false)}
          defaultDataInicial={relatorioDataInicial}
          defaultDataFinal={relatorioDataFinal}
        />
      )}

      {isGeneratingPdf && <GeneratingPdfModal />}

      {showEditModal && cadastroSelecionado && (
        <EditModal
          cadastro={cadastroSelecionado}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveEditedCadastro}
          setAlertMessage={setAlertModalMessage}
          setShowAlert={setShowAlertModal}
        />
      )}
    </div>
  );
}

export default Dash;