import React, { useState } from 'react';
import Input from '../components/Input';
import Select from '../components/Select';
import RadioGroup from '../components/RadioGroup';
import TextArea from '../components/TextArea';
import Checkbox from '../components/Checkbox';
import Logo from '../assets/LOGO Sindserh BsB C1.png';

const FiliacaoForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    nome: '',
    nomeSocial: '',
    sexo: '',
    situacaoFuncional: '',
    matricula: '',
    nomeMae: '',
    dataAdmissao: '',
    dataNascimento: '',
    rg: '',
    cpf: '',
    lotacao: '',
    setor: '',
    cargo: '',
    salarioBase: '',
    enderecoResidencial: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    telefoneFixo: '',
    celular: '',
    whatsapp: '',
    email: '',
    bancoRecebimento: '',
    observacoes: '',
    aceitaTermos: false,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isError, setIsError] = useState(false);
   const [submitMessage, setSubmitMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const sexoOptions = [
    { value: 'masculino', label: 'MASC.' },
    { value: 'feminino', label: 'FEM.' },
    { value: 'outros', label: 'OUTROS' },
  ];

  const situacaoFuncionalOptions = [
    { value: 'ativo', label: 'ATIVO' },
    { value: 'aposentado', label: 'APOSENTADO' },
    { value: 'pensionista', label: 'PENSIONISTA' },
  ];

  const lotacaoOptions = [
    { value: 'sede', label: 'SEDE' },
    { value: 'hub', label: 'HUB' },
  ];

  const estadoOptions = [
    { value: 'DF', label: 'Distrito Federal' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData((prevData) => ({
      ...prevData,
      [name]: newValue,
    }));

    if (errors[name]) {
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const formatCpf = (value: string) => {
    const cleanedValue = value.replace(/\D/g, '');
    if (cleanedValue.length <= 3) return cleanedValue;
    if (cleanedValue.length <= 6) return `${cleanedValue.substring(0, 3)}.${cleanedValue.substring(3)}`;
    if (cleanedValue.length <= 9) return `${cleanedValue.substring(0, 3)}.${cleanedValue.substring(3, 6)}.${cleanedValue.substring(6)}`;
    return `${cleanedValue.substring(0, 3)}.${cleanedValue.substring(3, 6)}.${cleanedValue.substring(6, 9)}-${cleanedValue.substring(9, 11)}`;
  };

  const formatRg = (value: string) => {
    const cleanedValue = value.replace(/\D/g, '');
    if (cleanedValue.length <= 2) return cleanedValue;
    if (cleanedValue.length <= 5) return `${cleanedValue.substring(0, 2)}.${cleanedValue.substring(2)}`;
    if (cleanedValue.length <= 8) return `${cleanedValue.substring(0, 2)}.${cleanedValue.substring(2, 5)}.${cleanedValue.substring(5)}`;
    return `${cleanedValue.substring(0, 2)}.${cleanedValue.substring(2, 5)}.${cleanedValue.substring(5, 8)}-${cleanedValue.substring(8, 9)}`;
  };

  const formatCep = (value: string) => {
    const cleanedValue = value.replace(/\D/g, '');
    if (cleanedValue.length <= 5) return cleanedValue;
    return `${cleanedValue.substring(0, 5)}-${cleanedValue.substring(5, 8)}`;
  };

  const formatPhone = (value: string) => {
    const cleanedValue = value.replace(/\D/g, '');
    if (cleanedValue.length <= 2) return cleanedValue;
    if (cleanedValue.length <= 6) return `(${cleanedValue.substring(0, 2)}) ${cleanedValue.substring(2)}`;
    if (cleanedValue.length <= 10) return `(${cleanedValue.substring(0, 2)}) ${cleanedValue.substring(2, 6)}-${cleanedValue.substring(6)}`;
    return `(${cleanedValue.substring(0, 2)}) ${cleanedValue.substring(2, 7)}-${cleanedValue.substring(7, 11)}`;
  };


  const validateCPF = (cpf: string): boolean => {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    let sum = 0;
    let remainder;

    for (let i = 1; i <= 9; i++) sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i);
    remainder = (sum * 10) % 11;

    if ((remainder === 10) || (remainder === 11)) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i);
    remainder = (sum * 10) % 11;

    if ((remainder === 10) || (remainder === 11)) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;

    return true;
  };

  const validateRG = (rg: string): boolean => {
    const cleanedRg = rg.replace(/\D/g, '');
    return cleanedRg.length >= 7 && cleanedRg.length <= 10;
  };

  const validateStep = (step: number): boolean => {
    const currentErrors: { [key: string]: string } = {};
    let isValid = true;

    if (step === 1) {
      if (!formData.nome.trim()) {
        currentErrors.nome = 'Nome é obrigatório.';
        isValid = false;
      }
      if (!formData.sexo) {
        currentErrors.sexo = 'Sexo é obrigatório.';
        isValid = false;
      }
      if (!formData.situacaoFuncional) {
        currentErrors.situacaoFuncional = 'Situação funcional é obrigatória.';
        isValid = false;
      }
      if (!formData.matricula.trim()) {
        currentErrors.matricula = 'Matrícula é obrigatória.';
        isValid = false;
      }
      if (!formData.nomeMae.trim()) {
        currentErrors.nomeMae = 'Nome da mãe é obrigatório.';
        isValid = false;
      }
      if (!formData.dataAdmissao) {
        currentErrors.dataAdmissao = 'Data de admissão é obrigatória.';
        isValid = false;
      }
      if (!formData.dataNascimento) {
        currentErrors.dataNascimento = 'Data de nascimento é obrigatória.';
        isValid = false;
      }
      if (!formData.rg.trim()) {
        currentErrors.rg = 'RG é obrigatório.';
        isValid = false;
      } else if (!validateRG(formData.rg)) {
        currentErrors.rg = 'RG inválido. Deve conter entre 7 e 10 dígitos numéricos.';
        isValid = false;
      }
      if (!formData.cpf.trim()) {
        currentErrors.cpf = 'CPF é obrigatório.';
        isValid = false;
      } else if (!validateCPF(formData.cpf)) {
        currentErrors.cpf = 'CPF inválido.';
        isValid = false;
      }
    } else if (step === 2) {
      if (!formData.lotacao) {
        currentErrors.lotacao = 'Lotação é obrigatória.';
        isValid = false;
      }
      if (!formData.setor.trim()) {
        currentErrors.setor = 'Setor é obrigatório.';
        isValid = false;
      }
      if (!formData.cargo.trim()) {
        currentErrors.cargo = 'Cargo é obrigatório.';
        isValid = false;
      }
      if (!formData.salarioBase.trim() || isNaN(Number(formData.salarioBase))) {
        currentErrors.salarioBase = 'Salário base é obrigatório e deve ser um número.';
        isValid = false;
      }
    } else if (step === 3) {
      if (!formData.enderecoResidencial.trim()) {
        currentErrors.enderecoResidencial = 'Endereço residencial é obrigatório.';
        isValid = false;
      }
      if (!formData.bairro.trim()) {
        currentErrors.bairro = 'Bairro é obrigatório.';
        isValid = false;
      }
      if (!formData.cidade.trim()) {
        currentErrors.cidade = 'Cidade é obrigatória.';
        isValid = false;
      }
      if (!formData.estado) {
        currentErrors.estado = 'Estado é obrigatório.';
        isValid = false;
      }
      if (!formData.cep.trim() || !/^\d{5}-?\d{3}$/.test(formData.cep)) {
        currentErrors.cep = 'CEP inválido ou obrigatório (formato XXXXX-XXX).';
        isValid = false;
      }
    } else if (step === 4) {
      if (!formData.telefoneFixo.trim() && !formData.celular.trim()) {
        currentErrors.telefoneFixo = 'Pelo menos um telefone (fixo ou celular) é obrigatório.';
        currentErrors.celular = 'Pelo menos um telefone (fixo ou celular) é obrigatório.';
        isValid = false;
      }
      if (!formData.email.trim() || !/\S+@\S+\.\S/.test(formData.email)) {
        currentErrors.email = 'Email inválido ou obrigatório.';
        isValid = false;
      }
      if (!formData.bancoRecebimento.trim()) {
        currentErrors.bancoRecebimento = 'Banco de recebimento é obrigatório.';
        isValid = false;
      }
    } else if (step === 5) {
      if (!formData.aceitaTermos) {
        currentErrors.aceitaTermos = 'Você deve aceitar os termos e condições.';
        isValid = false;
      }
    }

    setErrors(currentErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prevStep) => prevStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      try {
        const response = await fetch('http://localhost:3000/api/formularios', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (response.ok) {
          setSubmitMessage('Formulário enviado com sucesso!');
          setIsError(false);
          setIsSubmitted(true);
        } else {
          let errorMessage = 'Erro ao enviar o formulário.';
          if (data.msg) {
            errorMessage = data.msg;
          } else if (data.errors) {
            const backendErrors: { [key: string]: string } = {};
            for (const field in data.errors) {
              backendErrors[field] = data.errors[field];
            }
            setErrors(backendErrors);
            errorMessage = 'Verifique os campos com erro.';
          }
          setSubmitMessage(errorMessage);
          setIsError(true);
          setIsSubmitted(true); 
        }
      } catch (error) {
        console.error('Erro na requisição:', error);
        setSubmitMessage('Erro de conexão com o servidor. Tente novamente mais tarde.');
        setIsError(true);
        setIsSubmitted(true); 
      }
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="animate-fade-in">
            <h3 className="text-xl font-bold text-gray-700 mb-6 text-center">Informações Pessoais e Funcionais</h3>
            <Input
              label="Nome"
              id="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Seu nome"
              error={errors.nome}
            />
            <Input
              label="Nome Social"
              id="nomeSocial"
              value={formData.nomeSocial}
              onChange={handleChange}
              placeholder="Seu nome social (opcional)"
            />
            <RadioGroup
              label="Sexo"
              name="sexo"
              options={sexoOptions}
              selectedValue={formData.sexo}
              onChange={handleChange}
              error={errors.sexo}
            />
            <RadioGroup
              label="Situação Funcional"
              name="situacaoFuncional"
              options={situacaoFuncionalOptions}
              selectedValue={formData.situacaoFuncional}
              onChange={handleChange}
              error={errors.situacaoFuncional}
            />
            <Input
              label="Matrícula"
              id="matricula"
              value={formData.matricula}
              onChange={handleChange}
              placeholder="Número de matrícula"
              error={errors.matricula}
            />
            <Input
              label="Nome da Mãe"
              id="nomeMae"
              value={formData.nomeMae}
              onChange={handleChange}
              placeholder="Nome completo da sua mãe"
              error={errors.nomeMae}
            />
            <Input
              label="Data de Admissão"
              id="dataAdmissao"
              type="date"
              value={formData.dataAdmissao}
              onChange={handleChange}
              error={errors.dataAdmissao}
            />
            <Input
              label="Data de Nascimento"
              id="dataNascimento"
              type="date"
              value={formData.dataNascimento}
              onChange={handleChange}
              error={errors.dataNascimento}
            />
            <Input
              label="RG"
              id="rg"
              value={formData.rg}
              onChange={handleChange}
              placeholder="Ex: XX.XXX.XXX-X"
              maskPattern={/^\d+$/}
              maxLength={12}
              formatFn={formatRg}
              error={errors.rg}
            />
            <Input
              label="CPF"
              id="cpf"
              value={formData.cpf}
              onChange={handleChange}
              placeholder="XXX.XXX.XXX-XX"
              maskPattern={/^\d+$/}
              maxLength={14}
              formatFn={formatCpf}
              error={errors.cpf}
            />
          </div>
        );
      case 2:
        return (
          <div className="animate-fade-in">
            <h3 className="text-xl font-bold text-gray-700 mb-6 text-center">Lotação e Cargo</h3>
            <RadioGroup
              label="Lotação"
              name="lotacao"
              options={lotacaoOptions}
              selectedValue={formData.lotacao}
              onChange={handleChange}
              error={errors.lotacao}
            />
            <Input
              label="Setor"
              id="setor"
              value={formData.setor}
              onChange={handleChange}
              placeholder="Setor de trabalho"
              error={errors.setor}
            />
            <Input
              label="Cargo"
              id="cargo"
              value={formData.cargo}
              onChange={handleChange}
              placeholder="Seu cargo"
              error={errors.cargo}
            />
            <Input
              label="Salário Base (R$)"
              id="salarioBase"
              type="number"
              value={formData.salarioBase}
              onChange={handleChange}
              placeholder="Ex: 3500.00"
              error={errors.salarioBase}
            />
          </div>
        );
      case 3:
        return (
          <div className="animate-fade-in">
            <h3 className="text-xl font-bold text-gray-700 mb-6 text-center">Endereço Residencial</h3>
            <Input
              label="Endereço Residencial"
              id="enderecoResidencial"
              value={formData.enderecoResidencial}
              onChange={handleChange}
              placeholder="Rua, número, complemento"
              error={errors.enderecoResidencial}
            />
            <Input
              label="Bairro"
              id="bairro"
              value={formData.bairro}
              onChange={handleChange}
              placeholder="Seu bairro"
              error={errors.bairro}
            />
            <Input
              label="Cidade"
              id="cidade"
              value={formData.cidade}
              onChange={handleChange}
              placeholder="Sua cidade"
              error={errors.cidade}
            />
            <Select
              label="Estado"
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              options={estadoOptions}
              error={errors.estado}
            />
            <Input
              label="CEP"
              id="cep"
              type="text"
              value={formData.cep}
              onChange={handleChange}
              placeholder="XXXXX-XXX"
              maskPattern={/^\d+$/}
              maxLength={9}
              formatFn={formatCep}
              error={errors.cep}
            />
          </div>
        );
      case 4:
        return (
          <div className="animate-fade-in">
            <h3 className="text-xl font-bold text-gray-700 mb-6 text-center">Contato e Banco</h3>
            <Input
              label="Telefone Fixo"
              id="telefoneFixo"
              type="tel"
              value={formData.telefoneFixo}
              onChange={handleChange}
              placeholder="(XX) XXXX-XXXX"
              maskPattern={/^\d+$/}
              maxLength={14}
              formatFn={formatPhone}
              error={errors.telefoneFixo}
            />
            <Input
              label="Celular"
              id="celular"
              type="tel"
              value={formData.celular}
              onChange={handleChange}
              placeholder="(XX) 9XXXX-XXXX"
              maskPattern={/^\d+$/}
              maxLength={15}
              formatFn={formatPhone}
              error={errors.celular}
            />
            <Input
              label="WhatsApp"
              id="whatsapp"
              type="tel"
              value={formData.whatsapp}
              onChange={handleChange}
              placeholder="(XX) 9XXXX-XXXX (opcional)"
              maskPattern={/^\d+$/}
              maxLength={15}
              formatFn={formatPhone}
            />
            <Input
              label="Email"
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="seu.email@example.com"
              error={errors.email}
            />
            <Input
              label="Banco de Recebimento"
              id="bancoRecebimento"
              value={formData.bancoRecebimento}
              onChange={handleChange}
              placeholder="Nome do banco"
              error={errors.bancoRecebimento}
            />
          </div>
        );
      case 5:
        return (
          <div className="animate-fade-in">
            <h3 className="text-xl font-bold text-gray-700 mb-6 text-center">Termos e Observações</h3>
            <p className="text-sm text-gray-600 mb-4">
              O signatário deste, acima identificado, requer a sua inscrição como filiado ao Sindicato dos Trabalhadores de
              Empresas Públicas de Serviços Hospitalares — SINDSERH — DF, e autoriza ao setor competente do seu órgão
              de origem (órgão pagador) a consignar em sua folha de pagamento, o valor correspondente à mensalidade em
              benefício da Entidade Sindical, equivalente a 1% (um por cento) de seu subsídio ou remuneração base, valor
              este que deverá ser descontado na rubrica própria do Sindicato e creditado à sua conta.
              <br /><br />
              Fica, ainda, o Sindicato dos Trabalhadores de Empresas Públicas de Serviços Hospitalares - SINDSERH — DF AUTORIZADO a
              representa-lo (lá) como substituto processual em quaisquer ações ou processos, na esfera administrativa ou
              judicial que envolvam seus direitos coletivos ou individuais, nos termos do Estatuto da Entidade.
              <br /><br />
              Declaro para os devidos fins de direito que todas as informações aqui prestadas são a expressão da verdade.
            </p>
            <Checkbox
              label="Eu aceito os termos e condições do SINDSERH - DF."
              id="aceitaTermos"
              name="aceitaTermos"
              checked={formData.aceitaTermos}
              onChange={handleChange}
              error={errors.aceitaTermos}
            />
            <TextArea
              label="Observações"
              id="observacoes"
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              placeholder="Alguma observação adicional?"
              rows={4}
            />
          </div>
        );
      case 6:
        return (
          <div className="animate-fade-in">
            <h3 className="text-xl font-bold text-gray-700 mb-6 text-center">Revisão e Confirmação</h3>
            <div className="bg-blue-50 p-6 rounded-lg shadow-inner mb-6 text-gray-700 overflow-y-auto max-h-[50vh]">
              <p className="mb-2"><strong className="text-blue-700">Nome:</strong> {formData.nome}</p>
              <p className="mb-2"><strong className="text-blue-700">Nome Social:</strong> {formData.nomeSocial || 'Não informado'}</p>
              <p className="mb-2"><strong className="text-blue-700">Sexo:</strong> {sexoOptions.find(opt => opt.value === formData.sexo)?.label || 'Não informado'}</p>
              <p className="mb-2"><strong className="text-blue-700">Situação Funcional:</strong> {situacaoFuncionalOptions.find(opt => opt.value === formData.situacaoFuncional)?.label || 'Não informado'}</p>
              <p className="mb-2"><strong className="text-blue-700">Matrícula:</strong> {formData.matricula}</p>
              <p className="mb-2"><strong className="text-blue-700">Nome da Mãe:</strong> {formData.nomeMae}</p>
              <p className="mb-2"><strong className="text-blue-700">Data de Admissão:</strong> {formData.dataAdmissao}</p>
              <p className="mb-2"><strong className="text-blue-700">Data de Nascimento:</strong> {formData.dataNascimento}</p>
              <p className="mb-2"><strong className="text-blue-700">RG:</strong> {formData.rg}</p>
              <p className="mb-2"><strong className="text-blue-700">CPF:</strong> {formData.cpf}</p>
              <p className="mb-2"><strong className="text-blue-700">Lotação:</strong> {lotacaoOptions.find(opt => opt.value === formData.lotacao)?.label || 'Não informado'}</p>
              <p className="mb-2"><strong className="text-blue-700">Setor:</strong> {formData.setor}</p>
              <p className="mb-2"><strong className="text-blue-700">Cargo:</strong> {formData.cargo}</p>
              <p className="mb-2"><strong className="text-blue-700">Salário Base:</strong> R$ {formData.salarioBase}</p>
              <p className="mb-2"><strong className="text-blue-700">Endereço Residencial:</strong> {formData.enderecoResidencial}</p>
              <p className="mb-2"><strong className="text-blue-700">Bairro:</strong> {formData.bairro}</p>
              <p className="mb-2"><strong className="text-blue-700">Cidade:</strong> {formData.cidade}</p>
              <p className="mb-2"><strong className="text-blue-700">Estado:</strong> {estadoOptions.find(opt => opt.value === formData.estado)?.label || 'Não informado'}</p>
              <p className="mb-2"><strong className="text-blue-700">CEP:</strong> {formData.cep}</p>
              <p className="mb-2"><strong className="text-blue-700">Telefone Fixo:</strong> {formData.telefoneFixo || 'Não informado'}</p>
              <p className="mb-2"><strong className="text-blue-700">Celular:</strong> {formData.celular || 'Não informado'}</p>
              <p className="mb-2"><strong className="text-blue-700">WhatsApp:</strong> {formData.whatsapp || 'Não informado'}</p>
              <p className="mb-2"><strong className="text-blue-700">Email:</strong> {formData.email}</p>
              <p className="mb-2"><strong className="text-blue-700">Banco de Recebimento:</strong> {formData.bancoRecebimento}</p>
              <p className="mb-2"><strong className="text-blue-700">Termos Aceitos:</strong> {formData.aceitaTermos ? 'Sim' : 'Não'}</p>
              {formData.observacoes && <p className="mb-2"><strong className="text-blue-700">Observações:</strong> {formData.observacoes}</p>}
            </div>
            <p className="text-center text-lg text-green-600 font-semibold">
              Por favor, revise suas informações antes de finalizar.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        body {
          font-family: 'Inter', sans-serif;
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        `}
      </style>
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 hover:scale-[1.01] border border-gray-100">
        <div className="flex justify-center mb-4">  
          <img className='w-30' src={Logo} />
        </div>        
        <h2 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">SINDSERH - DF</h2>
        <p className='text-xs text-center mb-8'>SINDICATO DOS TRABALHADORES DE EMPRESAS PÚBLICA DE SERVIÇOS HOSPITALARES - SINDSERH - DF</p>
        <div className="flex justify-center mb-8">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div
              key={step}
              className={`w-10 h-10 rounded-full flex items-center justify-center mx-2 text-white font-bold transition-all duration-300 ease-in-out
                ${currentStep === step ? 'bg-blue-600 shadow-md transform scale-110' : 'bg-gray-300'}
                ${currentStep > step ? 'bg-green-500' : ''}
              `}
            >
              {step}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {renderStepContent()}

          <div className="flex justify-between mt-8 pt-4 border-t border-gray-200">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg font-semibold shadow-md hover:bg-gray-400 transition duration-300 ease-in-out transform hover:-translate-y-0.5"
              >
                Anterior
              </button>
            )}

            {currentStep < 6 && (
              <button
                type="button"
                onClick={handleNext}
                className={`px-6 py-3 rounded-lg font-semibold shadow-md transition duration-300 ease-in-out transform hover:-translate-y-0.5
                  ${currentStep === 1 ? 'ml-auto' : ''} ${Object.keys(errors).length > 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                disabled={Object.keys(errors).length > 0}
              >
                Próximo
              </button>
            )}

            {currentStep === 6 && (
              <button
                type="submit"
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold shadow-md hover:bg-green-700 transition duration-300 ease-in-out transform hover:-translate-y-0.5 ml-auto"
              >
                Finalizar Filiação
              </button>
            )}
          </div>
        </form>

        {isSubmitted && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md w-full">
              <h3 className="text-2xl font-bold text-green-700 mb-4">{isError ? 'Erro no Envio!' : 'Formulário Enviado com Sucesso!'}</h3>
              <p className="text-gray-700 mb-6">{submitMessage}</p>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setCurrentStep(1);
                  setFormData({
                    nome: '', nomeSocial: '', sexo: '', situacaoFuncional: '', matricula: '',
                    nomeMae: '', dataAdmissao: '', dataNascimento: '', rg: '', cpf: '',
                    lotacao: '', setor: '', cargo: '', salarioBase: '',
                    enderecoResidencial: '', bairro: '', cidade: '', estado: '', cep: '',
                    telefoneFixo: '', celular: '', whatsapp: '', email: '', bancoRecebimento: '',
                    observacoes: '', aceitaTermos: false,
                  });
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
              >
                Novo Formulário
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FiliacaoForm;