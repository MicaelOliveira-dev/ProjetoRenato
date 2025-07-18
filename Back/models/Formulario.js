const mongoose = require('mongoose');

const FormularioSchema = mongoose.Schema({
    nome: {
        type: String,
        required: true,
        trim: true
    },
    nomeSocial: {
        type: String,
        trim: true
    },
    sexo: {
        type: String,
        required: true,
        enum: ['masculino', 'feminino', 'outros']
    },
    situacaoFuncional: {
        type: String,
        required: true,
        enum: ['ativo', 'aposentado', 'pensionista']
    },
    matricula: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    nomeMae: {
        type: String,
        required: true,
        trim: true
    },
    dataAdmissao: {
        type: Date,
        required: true
    },
    dataNascimento: {
        type: Date,
        required: true
    },
    rg: {
        type: String,
        required: true,
        trim: true,
        minlength: 7
    },
    cpf: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 11
    },

    lotacao: {
        type: String,
        required: true,
        enum: ['sede', 'hub']
    },
    setor: {
        type: String,
        required: true,
        trim: true
    },
    cargo: {
        type: String,
        required: true,
        trim: true
    },
    salarioBase: {
        type: Number,
        required: true,
        min: 0
    },

    enderecoResidencial: {
        type: String,
        required: true,
        trim: true
    },
    bairro: {
        type: String,
        required: true,
        trim: true
    },
    cidade: {
        type: String,
        required: true,
        trim: true
    },
    estado: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 2
    },
    cep: {
        type: String,
        required: true,
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
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Por favor, use um endereço de email válido.']
    },
    bancoRecebimento: {
        type: String,
        required: true,
        trim: true
    },

    observacoes: {
        type: String,
        trim: true
    },
    aceitaTermos: {
        type: Boolean,
        required: true,
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

module.exports = mongoose.model('Formulario', FormularioSchema);