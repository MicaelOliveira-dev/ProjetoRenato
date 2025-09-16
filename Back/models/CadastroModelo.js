const mongoose = require('mongoose');

const CadastroSchema = mongoose.Schema({
    formId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FormularioModelo',
        required: true
    },
    nomeCompleto: {
        type: String,
        trim: true
    },
    nomeSocial: {
        type: String,
        trim: true
    },
    sexo: {
        type: String,
        enum: ['masculino', 'feminino', 'outros']
    },
    situacaoFuncional: {
        type: String,
        enum: ['ativo', 'aposentado', 'pensionista']
    },
    matricula: {
        type: String,
        trim: true,
    },
    nomeMae: {
        type: String,
        trim: true
    },
    dataAdmissao: {
        type: Date,
    },
    dataNascimento: {
        type: Date,
    },
    rg: {
        type: String,
        trim: true,
        minlength: 7
    },
    cpf: {
        type: String,
        trim: true,
        minlength: 11
    },

    lotacao: {
        type: String,
        enum: ['sede', 'hub']
    },
    setor: {
        type: String,
        trim: true
    },
    cargo: {
        type: String,
        trim: true
    },
    salarioBase: {
        type: Number,
        min: 0
    },

    enderecoResidencial: {
        type: String,
        trim: true
    },
    bairro: {
        type: String,
        trim: true
    },
    cidade: {
        type: String,
        trim: true
    },
    estado: {
        type: String,
        trim: true,
        minlength: 2,
        maxlength: 2
    },
    cep: {
        type: String,
        trim: true,
        minlength: 8
    },
    telefoneFixo: {
        type: String,
        trim: true,
    },
    celular: {
        type: String,
        trim: true,
    },
    whatsapp: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Por favor, use um endereço de email válido.']
    },
    bancoRecebimento: {
        type: String,
        trim: true
    },

    observacoes: {
        type: String,
        trim: true
    },
    aceitaTermos: {
        type: Boolean,
        default: false
    },
    mensagem: {
        type: String,
        required: false
    },


    dataEnvio: {
        type: Date,
        default: Date.now
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('Cadastro', CadastroSchema);
