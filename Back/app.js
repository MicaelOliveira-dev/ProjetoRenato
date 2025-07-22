const express = require('express');
const connectDB = require('./config/db');
const Formulario = require('./models/Formulario'); 
const pdfmake = require('pdfmake/build/pdfmake');
const vfsFonts = require('pdfmake/build/vfs_fonts');
const cors = require('cors');
require('dotenv').config(); 

const app = express();

connectDB();

app.use(express.json());

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
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Explícito para métodos
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

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

// Filtros
app.get('/api/formularios', async (req, res) => {
    try {
        const filters = {};

        if (req.query.nome) {
            filters.nome = { $regex: req.query.nome, $options: 'i' };
        }

        if (req.query.situacaoFuncional) {
            filters.situacaoFuncional = req.query.situacaoFuncional;
        }

        if (req.query.dataEnvioDesde || req.query.dataEnvioAte) {
            filters.dataEnvio = {};
            if (req.query.dataEnvioDesde) {
                filters.dataEnvio.$gte = new Date(req.query.dataEnvioDesde);
            }
            if (req.query.dataEnvioAte) {
                let endDate = new Date(req.query.dataEnvioAte);
                endDate.setUTCHours(23, 59, 59, 999);
                filters.dataEnvio.$lte = endDate;
            }
        }

        if (req.query.matricula) {
            filters.matricula = req.query.matricula;
        }

        if (req.query.dataNascimentoDesde || req.query.dataNascimentoAte) {
            filters.dataNascimento = {};
            if (req.query.dataNascimentoDesde) {
                filters.dataNascimento.$gte = new Date(req.query.dataNascimentoDesde);
            }
            if (req.query.dataNascimentoAte) {
                let endDate = new Date(req.query.dataNascimentoAte);
                endDate.setUTCHours(23, 59, 59, 999);
                filters.dataNascimento.$lte = endDate;
            }
        }

        if (req.query.email) {
            filters.email = { $regex: req.query.email, $options: 'i' };
        }

        if (req.query.sexo) {
            filters.sexo = req.query.sexo;
        }

        if (req.query.cpf) {
            filters.cpf = req.query.cpf.replace(/\D/g, '');
        }

        const formularios = await Formulario.find(filters);
        res.json(formularios);
    } catch (err) {
        console.error(err.message);
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

// filtros
app.get('/api/formularios/filtros', async (req, res) => {
    try {
        const {
            nomeRazaoSocial, 
            situacaoFuncional,
            dataCadastramentoInicial, 
            dataCadastramentoFinal,
            matricula,
            dataNascimentoInicial,
            dataNascimentoFinal,
            email,
            sexo
        } = req.query;

        let query = {};

        if (nomeRazaoSocial) {
            query.$or = [
                { nome: { $regex: nomeRazaoSocial, $options: 'i' } }, 
                { razaoSocial: { $regex: nomeRazaoSocial, $options: 'i' } }
            ];
        }

        if (situacaoFuncional) {
            query.situacaoFuncional = situacaoFuncional;
        }

        if (dataCadastramentoInicial || dataCadastramentoFinal) {
            query.dataCadastramento = {};
            if (dataCadastramentoInicial) {
                query.dataCadastramento.$gte = new Date(dataCadastramentoInicial);
            }
            if (dataCadastramentoFinal) {
                let endDate = new Date(dataCadastramentoFinal);
                endDate.setHours(23, 59, 59, 999);
                query.dataCadastramento.$lte = endDate;
            }
        }

        if (matricula) {
            query.matricula = matricula;
        }

        if (dataNascimentoInicial || dataNascimentoFinal) {
            query.dataNascimento = {};
            if (dataNascimentoInicial) {
                query.dataNascimento.$gte = new Date(dataNascimentoInicial);
            }
            if (dataNascimentoFinal) {
                let endDate = new Date(dataNascimentoFinal);
                endDate.setHours(23, 59, 59, 999);
                query.dataNascimento.$lte = endDate;
            }
        }

        if (email) {
            query.email = email;
        }

        if (sexo) {
            query.sexo = sexo;
        }

        const formularios = await Formulario.find(query);

        res.json(formularios);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor.');
    }
});

// Quantidade de Cadastros
app.get('/api/formulario/cadastros', async (req, res) => {
    try {
        const totalCadastros = await Formulario.countDocuments({}); 
        res.json({ total: totalCadastros });
    }catch(err){
        console.error(err.message);
        res.status(500).send('Erro no servidor ao buscar quantidade total de cadastros.');
    }
});

// Quantidade de cadastro por sexo
app.get('/api/formulario/cadastrosSexo', async (req, res) => {
    try {
        const cadastrosPorSexo = await Formulario.aggregate([
            {
                $group: {
                    _id: "$sexo", 
                    count: { $sum: 1 } 
                }
            },
            {
                $project: {
                    sexo: "$_id", 
                    count: 1,
                    _id: 0 
                }
            }
        ]);
        res.json(cadastrosPorSexo);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor ao buscar quantidade de cadastros por sexo.');
    }
});

// Quantidade de cadastro setor
app.get('/api/formulario/cadastrosSetor', async (req, res) => {
    try {
        const cadastrosPorSetor = await Formulario.aggregate([
            {
                $group: {
                    _id: "$setor", 
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    setor: "$_id", 
                    count: 1,
                    _id: 0
                }
            }
        ]);
        res.json(cadastrosPorSetor);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor ao buscar quantidade de cadastros por setor.');
    }
});

//Relatorio Pdf por periodo de cadastro
app.get('/api/formulario/relatorio-pdf', async (req, res) => {
    try {
        const { dataInicial, dataFinal } = req.query;

        if (!dataInicial || !dataFinal) {
            return res.status(400).json({ msg: 'Por favor, forneça `dataInicial` e `dataFinal` para o relatório.' });
        }

        let startDate = new Date(dataInicial);
        let endDate = new Date(dataFinal);
        endDate.setHours(23, 59, 59, 999); 

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return res.status(400).json({ msg: 'Formato de data inválido. Use YYYY-MM-DD.' });
        }
        if (startDate > endDate) {
            return res.status(400).json({ msg: 'A data inicial não pode ser posterior à data final.' });
        }

        const formularios = await Formulario.find({
            createdAt: {
                $gte: startDate,
                $lte: endDate
            }
        }).sort({ createdAt: 1 }); 

        if (formularios.length === 0) {
            return res.status(404).json({ msg: 'Nenhum cadastro encontrado para o período especificado.' });
        }

        let content = [
            { text: `Relatório Detalhado de Cadastros`, style: 'header' },
            { text: `Período: ${dataInicial} a ${dataFinal}`, style: 'subheader' },
            '\n'
        ];

        formularios.forEach((form, index) => {
            if (index > 0) {
                content.push({ text: '', pageBreak: 'before' });
            }

            content.push(
                { text: `Formulário #${index + 1} - Matrícula: ${form.matricula || 'N/A'}`, style: 'formTitle' },
                { text: `Nome: ${form.nome || 'N/A'}`, style: 'field' },
                { text: `Nome Social: ${form.nomeSocial || 'N/A'}`, style: 'field' },
                { text: `Sexo: ${form.sexo || 'N/A'}`, style: 'field' },
                { text: `Situação Funcional: ${form.situacaoFuncional || 'N/A'}`, style: 'field' },
                { text: `Nome da Mãe: ${form.nomeMae || 'N/A'}`, style: 'field' },
                { text: `Data de Admissão: ${form.dataAdmissao ? form.dataAdmissao.toLocaleDateString('pt-BR') : 'N/A'}`, style: 'field' },
                { text: `Data de Nascimento: ${form.dataNascimento ? form.dataNascimento.toLocaleDateString('pt-BR') : 'N/A'}`, style: 'field' },
                { text: `RG: ${form.rg || 'N/A'}`, style: 'field' },
                { text: `CPF: ${form.cpf || 'N/A'}`, style: 'field' },
                { text: `Lotação: ${form.lotacao || 'N/A'}`, style: 'field' },
                { text: `Setor: ${form.setor || 'N/A'}`, style: 'field' },
                { text: `Cargo: ${form.cargo || 'N/A'}`, style: 'field' },
                { text: `Salário Base: ${form.salarioBase ? form.salarioBase.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'N/A'}`, style: 'field' },
                { text: `Endereço: ${form.enderecoResidencial || 'N/A'}`, style: 'field' },
                { text: `Bairro: ${form.bairro || 'N/A'}`, style: 'field' },
                { text: `Cidade: ${form.cidade || 'N/A'}`, style: 'field' },
                { text: `Estado: ${form.estado || 'N/A'}`, style: 'field' },
                { text: `CEP: ${form.cep || 'N/A'}`, style: 'field' },
                { text: `Telefone Fixo: ${form.telefoneFixo || 'N/A'}`, style: 'field' },
                { text: `Celular: ${form.celular || 'N/A'}`, style: 'field' },
                { text: `WhatsApp: ${form.whatsapp || 'N/A'}`, style: 'field' },
                { text: `Email: ${form.email || 'N/A'}`, style: 'field' },
                { text: `Banco de Recebimento: ${form.bancoRecebimento || 'N/A'}`, style: 'field' },
                { text: `Observações: ${form.observacoes || 'N/A'}`, style: 'field' },
                { text: `Aceita Termos: ${form.aceitaTermos ? 'Sim' : 'Não'}`, style: 'field' },
                { text: `Mensagem: ${form.mensagem || 'N/A'}`, style: 'field' },
                { text: `Data de Envio: ${form.dataEnvio ? form.dataEnvio.toLocaleDateString('pt-BR') : 'N/A'}`, style: 'field' },
                { text: `Data de Criação (DB): ${form.createdAt ? form.createdAt.toLocaleDateString('pt-BR') : 'N/A'}`, style: 'field' },
                { text: `Última Atualização (DB): ${form.updatedAt ? form.updatedAt.toLocaleDateString('pt-BR') : 'N/A'}`, style: 'field' },
                '\n\n' 
            );
        });

        const documentDefinition = {
            content: content, 
            styles: {
                header: {
                    fontSize: 22,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 0, 0, 20]
                },
                subheader: {
                    fontSize: 16,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 0, 0, 10]
                },
                formTitle: {
                    fontSize: 14,
                    bold: true,
                    margin: [0, 15, 0, 5],
                    decoration: 'underline'
                },
                field: {
                    fontSize: 10,
                    margin: [0, 2, 0, 2]
                },
            },
            defaultStyle: {
                fontSize: 10
            }
        };

        const pdfDoc = pdfmake.createPdf(documentDefinition);

        pdfDoc.getBuffer((buffer) => {
            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename=relatorio_detalhado_cadastros_${dataInicial}_a_${dataFinal}.pdf`,
                'Content-Length': buffer.length
            });
            res.end(buffer);
        });

    } catch (err) {
        console.error('Erro ao gerar relatório PDF detalhado:', err.message);
        res.status(500).send('Erro no servidor ao gerar o relatório PDF.');
    }
});

//restaurar soft delete
app.put('/api/formularios/undelete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let formulario = await Formulario.findById(id); 

        if (!formulario) {
            return res.status(404).json({ msg: 'Formulário não encontrado.' });
        }

        if (formulario.deletedAt === null) {
            return res.status(400).json({ msg: 'O formulário não estava no estado de deletado para ser restaurado.' });
        }

        formulario.deletedAt = null; 
        await formulario.save(); 

        res.json({ msg: 'Formulário restaurado com sucesso.', formulario }); 
    } catch (err) {
        console.error(err.message);
        if (err.name === 'CastError') {
            return res.status(400).json({ msg: 'ID do Formulário inválido.' });
        }
        res.status(500).send('Erro no servidor ao restaurar formulário.');
    }
});

const PORT = process.env.PORT || 5000; 

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
