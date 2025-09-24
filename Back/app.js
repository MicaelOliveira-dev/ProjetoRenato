const express = require('express');
const connectDB = require('./config/db');
const CadastroModelo = require('./models/CadastroModelo');
const FormularioModelo = require('./models/FormularioModelo');
const UserModelo = require('./models/UserSchema');
const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const multer = require('multer');
const path = require('path');

const app = express();

connectDB();

app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(session({
    secret: process.env.SESSION_SECRET || 'chave-secreta-padrao',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 
    }
}));

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

// --- Rotas de Autenticação ---
// Rota de Cadastro
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Verifica se o usuário já existe
        const userExists = await UserModelo.findOne({ username });
        if (userExists) {
            return res.status(400).json({ msg: 'Nome de usuário já existe.' });
        }

        const newUser = new UserModelo({ username, password, role: 'user' });
        await newUser.save();

        res.status(201).json({ msg: 'Usuário registrado com sucesso.' });
    } catch (err) {
        console.error('Erro no registro:', err.message);
        res.status(500).send('Erro no servidor.');
    }
});

// Rota de Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await UserModelo.findOne({ username });
        if (!user) {
            return res.status(400).json({ msg: 'Credenciais inválidas.' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Credenciais inválidas.' });
        }

        // Retorna a role do usuário na resposta
        res.json({ msg: 'Login bem-sucedido!', user: { username: user.username, role: user.role, id: user.id } });
    } catch (err) {
        console.error('Erro no login:', err.message);
        res.status(500).send('Erro no servidor.');
    }
});

// Rota de Logout
app.post('/api/auth/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ msg: 'Não foi possível fazer logout.' });
        }
        res.clearCookie('connect.sid'); // Limpa o cookie de sessão
        res.status(200).json({ msg: 'Logout bem-sucedido.' });
    });
});

// Rota para verificar o status de autenticação
app.get('/api/auth/status', (req, res) => {
    if (req.session.user) {
        res.json({ isAuthenticated: true, user: req.session.user });
    } else {
        res.json({ isAuthenticated: false });
    }
});

// --- Rotas Protegidas e com Controle de Acesso por Role ---

// Rota para administradores: Criar um novo usuário admin
app.post('/api/auth/create-admin', async (req, res) => {
    try {
        const { username, password } = req.body;

        const userExists = await UserModelo.findOne({ username });
        if (userExists) {
            return res.status(400).json({ msg: 'Nome de usuário já existe.' });
        }

        const newAdmin = new UserModelo({ username, password, role: 'admin' });
        await newAdmin.save();

        res.status(201).json({ msg: 'Novo usuário admin registrado com sucesso.' });
    } catch (err) {
        console.error('Erro na criação do admin:', err.message);
        res.status(500).send('Erro no servidor.');
    }
});

// Rota para administradores: Obter todos os usuários com a role 'user'
app.post('/api/usuariosNormais', async (req, res) => {
    try {
        const { role } = req.body;
        
        // Verifica se a role é 'admin'
        if (role !== 'admin') {
            return res.status(403).json({ msg: 'Acesso negado. Apenas administradores podem visualizar esta lista.' });
        }

        const usuariosNormais = await UserModelo.find({ role: 'user' });
        res.status(200).json(usuariosNormais);
    } catch (err) {
        console.error('Erro ao buscar usuários normais:', err.message);
        res.status(500).send('Erro no servidor.');
    }
});

app.get('/api/formularios/relatorio-pdf', async (req, res) => {
    try {
        const { formId } = req.query;

        if (!formId) {
            return res.status(400).json({ msg: 'Por favor, forneça o `formId` para o relatório.' });
        }

        let query = {
            formId: new mongoose.Types.ObjectId(formId)
        };
        let cadastros = await CadastroModelo.find(query);

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

app.get('/api/formulariosCriados', async (req, res) => {
    try {
        const { role, userId } = req.query;
        if (role === 'admin') {
            formularios = await FormularioModelo.find();
        } else if(role == 'user') {
            formularios = await FormularioModelo.find({ userId: userId });
        }  else {
            return res.status(403).json({ message: 'Função de usuário não reconhecida ou acesso não autorizado.' });
        }
        res.status(200).json(formularios);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar formulários', error: error.message });
    }
});

// Rota para administradores: Criar um formulário
app.post('/api/criarFormularios', async (req, res) => {
    const { nome, campos, textoTermos, logoUrl, userId, role } = req.body;

    // AVISO DE SEGURANÇA: Esta é uma verificação de role insegura
    if (role !== 'admin') {
        return res.status(403).json({ msg: 'Acesso negado. Apenas administradores podem criar formulários.' });
    }

    const idUnico = new mongoose.Types.ObjectId();
    const urlFormulario = `http://localhost:5173/form/${idUnico}`;
    
    // Usa o userId do corpo da requisição
    const ownerId = userId;

    try {
        const novoFormulario = new FormularioModelo({
            _id: idUnico,
            nome,
            campos,
            url: urlFormulario,
            textoTermos,
            logoUrl,
            userId: ownerId
        });

        const formularioSalvo = await novoFormulario.save();
        res.status(201).json(formularioSalvo);

    } catch (error) {
        res.status(400).json({ message: 'Erro ao criar o formulário', error: error.message });
    }
});

// Rota para administradores: Deletar um formulário
app.delete('/api/formulariosCriados/:id',  async (req, res) => {
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

app.get('/api/formularios/filtros', async (req, res) => {
    try {
        const {
            formId,
            nomeCompleto,
            situacaoFuncional,
            matricula,
            email,
            sexo,
            deletedAt,
            userRole, 
            userId    
        } = req.query;
        if (userRole !== 'admin' && !formId) {
            return res.status(403).json({ msg: 'Acesso negado. Você deve selecionar um formulário acima.' });
        }

        let query = {};

        if (userRole === 'user') {
            query.userId = userId;
        }

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

// Rota para submeter formulário (agora protegida para autenticados)
app.post('/api/formularios/submeter', async (req, res) => {
    try {
        if (req.session.user) {
            req.body.userId = req.session.user.id;
        }
        
        const novoCadastro = new CadastroModelo(req.body);
        const cadastroSalvo = await novoCadastro.save();
        res.status(201).json(cadastroSalvo);
    } catch (error) {
        res.status(400).json({ message: 'Erro ao submeter o formulário', error: error.message });
    }
});

// Rota para administradores: Deletar formulário
app.delete('/api/formularios/:id',  async (req, res) => {
    try {
        let formulario = await FormularioModelo.findById(req.params.id);

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

// Rota para administradores: Editar formulário
app.put('/api/formularios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;
        const formulario = await FormularioModelo.findByIdAndUpdate(
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

// Função Puppeteer para gerar PDF
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

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
    }
  }
});

app.post('/api/uploadLogo', upload.single('logo'), (req, res) => {

  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }

  const fileUrl = `http://localhost:3001/uploads/${req.file.filename}`;

  res.status(200).json({
    message: 'Upload realizado com sucesso!',
    url: fileUrl
  });
});

app.get('/api/formulario/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const formulario = await FormularioModelo.findById(id);

        if (!formulario) {
            return res.status(404).json({ message: 'Formulário não encontrado com o ID fornecido.' });
        }

        res.status(200).json(formulario);

    } catch (error) {
        console.error("Erro ao buscar formulário por ID:", error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar formulário.', error: error.message });
    }
})