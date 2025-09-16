const express = require('express');
const connectDB = require('./config/db');
const CadastroModelo = require('./models/CadastroModelo'); 
const FormularioModelo = require('./models/FormularioModelo');
const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); 
const app = express();

connectDB();

app.use(express.json());

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

const allowedOrigins = [
  'https://empactoon.com.br',
  'https://www.sindserhdf.empactoon.com.br',
  'https://sindserhdf.empactoon.com.br',
  'http://localhost:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

async function gerarRelatorioComPuppeteer(formNome, cadastros) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    const htmlContent = `
        <html>
            <head>
                <style>
                    body { font-family: 'Roboto', sans-serif; }
                    .header { font-size: 22px; text-align: center; margin-bottom: 20px; }
                    .record { border: 1px solid #ccc; padding: 15px; margin-bottom: 20px; border-radius: 8px; }
                    .record h3 { margin-top: 0; color: #333; }
                    .record p { margin: 5px 0; }
                    .record strong { color: #555; }
                </style>
            </head>
            <body>
                <div class="header">Relatório Detalhado de Cadastros</div>
                <p><strong>Formulário:</strong> ${formNome}</p>
                ${cadastros.map(cadastro => {
                    const dadosDoFormulario = cadastro._doc;

                    const camposHTML = Object.entries(dadosDoFormulario)
                        .filter(([key]) => key !== '_id' && key !== '__v')
                        .map(([key, value]) => `
                            <p><strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong> ${value}</p>
                        `).join('');

                    return `
                        <div class="record">
                            <h3>Registro #${cadastro._id}</h3>
                            ${camposHTML}
                        </div>
                    `;
                }).join('')}
            </body>
        </html>
    `;

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true 
    });

    await browser.close();

    return pdfBuffer;
}

app.get('/api/formularios/relatorio-pdf', async (req, res) => {
    try {
        const { formId } = req.query;

        if (!formId) {
            return res.status(400).json({ msg: 'Por favor, forneça o `formId` para o relatório.' });
        }
        
        let cadastros;
        try {
            cadastros = await CadastroModelo.find({
                formId: new mongoose.Types.ObjectId(formId)            
            });
        } catch (error) { 
            cadastros = await CadastroModelo.find({
                formId: formId
            });
        }

        if (cadastros.length === 0) {
            return res.status(404).json({ msg: 'Nenhum cadastro encontrado para o formulário e período especificados.' });
        }

        const formularioMetadata = await FormularioModelo.findById(formId);
        const formNome = formularioMetadata ? formularioMetadata.nome : 'Formulário Desconhecido';

        const pdfBuffer = await gerarRelatorioComPuppeteer(formNome, cadastros);

        res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=relatorio_${formId}.pdf`,
            'Content-Length': pdfBuffer.length
        });
        res.end(pdfBuffer);

    } catch (err) {
        console.error('Erro ao gerar relatório PDF detalhado:', err.message);
        res.status(500).send('Erro no servidor ao gerar o relatório PDF.');
    }
});

app.get('/api/formularios/nomes', async (req, res) => {
    try {
        const formularios = await FormularioModelo.find({}, { nome: 1, _id: 1 });
        res.status(200).json(formularios);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar formulários', error: error.message });
    }
});

app.get('/api/formulario/:id', async (req, res) => {
    try {
        const formulario = await FormularioModelo.findById(req.params.id);
        if (!formulario) {
            return res.status(404).json({ message: 'Formulário não encontrado.' });
        }
        res.status(200).json(formulario);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar formulário', error: error.message });
    }
});

app.post('/api/formularios/submeter', async (req, res) => {
    try {
        const novoCadastro = new CadastroModelo(req.body);
        const cadastroSalvo = await novoCadastro.save();
        res.status(201).json(cadastroSalvo);
    } catch (error) {
        res.status(400).json({ message: 'Erro ao submeter o formulário', error: error.message });
    }
});

// GET /api/formularios
app.get('/api/formulariosCriados', async (req, res) => {
    try {
        const formularios = await FormularioModelo.find();
        res.status(200).json(formularios);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar formulários', error: error.message });
    }
});

// POST /api/formularios
app.post('/api/criarFormularios', async (req, res) => {
    const { nome, campos, textoTermos, logoUrl } = req.body;

    const idUnico = new mongoose.Types.ObjectId();
    const urlFormulario = `http://localhost:5173/form/${idUnico}`;

    try {
        const novoFormulario = new FormularioModelo({
            _id: idUnico,
            nome,
            campos,
            url: urlFormulario,
            textoTermos,
            logoUrl,
        });

        const formularioSalvo = await novoFormulario.save();
        res.status(201).json(formularioSalvo);

    } catch (error) {
        res.status(400).json({ message: 'Erro ao criar o formulário', error: error.message });
    }
});

app.delete('/api/formulariosCriados/:id', async (req, res) => {
    try {
        const formulario = await FormularioModelo.findByIdAndDelete(req.params.id);
        
        if (!formulario) {
            return res.status(404).json({ message: 'Formulário não encontrado.' });
        }
        
        res.status(200).json({ message: 'Formulário excluído com sucesso!' });
    } catch (error) {
        if (error.kind === 'ObjectId') {
             return res.status(400).json({ message: 'ID de formulário inválido.' });
        }
        res.status(500).json({ message: 'Erro no servidor.', error: error.message });
    }
});

// Create
app.post('/api/formularios', async (req, res) => {
    try {
        const novoFormulario = new Formulario(req.body);
        const formularioSalvo = await novoFormulario.save();
        res.status(201).json(formularioSalvo);
    } catch (err) {
        console.error(err.message);
        if (err.name === 'ValidationError') {
            const errors = {};
            for (let field in err.errors) {
                errors[field] = err.errors[field].message;
            }
            return res.status(400).json({ msg: 'Erro de validação', errors });
        }
        if (err.code === 11000) {
            let field = Object.keys(err.keyValue)[0];
            let msg = '';
            if (field === 'email') msg = 'Este e-mail já está cadastrado.';
            else if (field === 'cpf') msg = 'Este CPF já está cadastrado.';
            else if (field === 'matricula') msg = 'Esta matrícula já está cadastrada.';
            else msg = `${field} já cadastrado.`;
            return res.status(400).json({ msg });
        }
        res.status(500).send('Erro no servidor.');
    }
});

// Soft Delete
app.delete('/api/formularios/:id', async (req, res) => {
    try {
        let formulario = await Formulario.findById(req.params.id);

        if (!formulario) {
            return res.status(404).json({ msg: 'Formulário não encontrado.' });
        }
        if (formulario.deletedAt !== null) {
            return res.status(200).json({ msg: 'Formulário já foi soft-deletado anteriormente.' });
        }
        formulario.deletedAt = new Date();
        await formulario.save();

        res.status(200).json({ msg: 'Formulário soft-deletado com sucesso.' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'ID do Formulário inválido.' });
        }
        res.status(500).send('Erro no servidor.');
    }
});

// Editar
app.put('/api/formularios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;
        const formulario = await Formulario.findByIdAndUpdate(
            id,
            { $set: updatedData }, 
            { new: true, runValidators: true }
        );

        if (!formulario) {
            return res.status(404).json({ msg: 'Formulário não encontrado.' });
        }

        res.json(formulario); 
    } catch (err) {
        console.error(err.message);
        if (err.name === 'CastError') {
            return res.status(400).json({ msg: 'ID do Formulário inválido.' });
        }
        if (err.name === 'ValidationError') {
            const errors = {};
            for (let field in err.errors) {
                errors[field] = err.errors[field].message;
            }
            return res.status(400).json({ msg: 'Erro de validação ao atualizar', errors });
        }
        if (err.code === 11000) {
            let field = Object.keys(err.keyValue)[0];
            let msg = '';
            if (field === 'email') msg = 'Este e-mail já está cadastrado.';
            else if (field === 'cpf') msg = 'Este CPF já está cadastrado.';
            else if (field === 'matricula') msg = 'Esta matrícula já está cadastrada.';
            else msg = `${field} já cadastrado.`;
            return res.status(400).json({ msg });
        }
        res.status(500).send('Erro no servidor.');
    }
});

// Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    const FIXED_EMAIL = process.env.FIXED_LOGIN_EMAIL;
    const FIXED_PASSWORD = process.env.FIXED_LOGIN_PASSWORD;

    if (email === FIXED_EMAIL && password === FIXED_PASSWORD) {
        res.json({ msg: 'Login bem-sucedido!'});        
    } else {
        res.status(401).json({ msg: 'Credenciais inválidas.' });
    }
});

// GET /api/formularios/filtros
app.get('/api/formularios/filtros', async (req, res) => {
    try {
        const {
            formId, 
            nomeCompleto, 
            situacaoFuncional,
            matricula,
            email,
            sexo,
            deletedAt
        } = req.query;

        let query = {};

        if (formId) {
            query.formId = new mongoose.Types.ObjectId(formId); 
        }
        
        if (nomeCompleto) {
            query.nomeCompleto = { $regex: nomeCompleto, $options: 'i' };
        }

        if (situacaoFuncional) {
            query.situacaoFuncional = situacaoFuncional;
        }
        if (matricula) {
            query.matricula = matricula;
        }
        if (email) {
            query.email = email;
        }

        if (sexo) {
            query.sexo = sexo;
        }
        
        if (deletedAt) {
            query.deletedAt = { $ne: null };
        } else {
            query.deletedAt = null;
        }

        const cadastros = await CadastroModelo.find(query);

        res.json(cadastros);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor.');
    }
});

