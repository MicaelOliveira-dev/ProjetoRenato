const mongoose = require('mongoose');

const FormularioModeloSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
        trim: true
    },
    campos: {
        type: [String], 
        required: true
    },
    url: {
        type: String,
        required: true,
        unique: true
    },
    logoUrl: {
        type: String,
        required: false,
    },
    textoTermos: {
        type: String,
        required: false,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserSchema'
    }
}, { timestamps: true });

module.exports = mongoose.model('FormularioModelo', FormularioModeloSchema);