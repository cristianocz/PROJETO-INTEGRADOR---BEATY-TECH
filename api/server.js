// api/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Conecte ao MongoDB Atlas com tratamento de erros
mongoose.connect('mongodb+srv://crrcorazzim:82jVSD5rbULgZebW@cluster0.ofzj9xy.mongodb.net/beatytech')
  .then(() => console.log('Conexão com MongoDB Atlas bem-sucedida'))
  .catch(err => {
    console.error('Erro ao conectar ao MongoDB Atlas:', err.message);
    process.exit(1); // Encerra o processo em caso de erro
  });

// Modelos
const Cliente = mongoose.model('Cliente', {
  nome: String,
  email: String,
  telefone: String,
  dataCadastro: { type: Date, default: Date.now }
});

const Servico = mongoose.model('Servico', {
  nome: String,
  descricao: String,
  preco: Number,
  duracao: Number // em minutos
});

const Funcionario = mongoose.model('Funcionario', {
  nome: String,
  email: String,
  telefone: String,
  especialidade: String,
  disponivel: { type: Boolean, default: true }
});

// Middleware de erro
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erro interno do servidor' });
};

// Adicionar validações mais robustas
const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
};

// Rotas de Clientes
app.get('/clientes', async (req, res, next) => {
  try {
    const clientes = await Cliente.find();
    res.json(clientes);
  } catch (err) {
    next(err);
  }
});

app.post('/clientes', async (req, res, next) => {
  try {
    const { nome, email, telefone } = req.body;
    
    if (!nome || !email || !telefone) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }
    
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Email inválido' });
    }

    const cliente = new Cliente({ nome, email, telefone });
    await cliente.save();
    res.status(201).json(cliente);
  } catch (err) {
    next(err);
  }
});

app.delete('/clientes/:id', async (req, res, next) => {
  try {
    const cliente = await Cliente.findByIdAndDelete(req.params.id);
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    res.json({ message: 'Cliente excluído com sucesso' });
  } catch (err) {
    next(err);
  }
});

// Rotas de Serviços
app.get('/servicos', async (req, res, next) => {
  try {
    const servicos = await Servico.find();
    res.json(servicos);
  } catch (err) {
    next(err);
  }
});

app.post('/servicos', async (req, res, next) => {
  try {
    const servico = new Servico(req.body);
    await servico.save();
    res.status(201).json(servico);
  } catch (err) {
    next(err);
  }
});

// Rotas de Funcionários
app.get('/funcionarios', async (req, res, next) => {
  try {
    const funcionarios = await Funcionario.find();
    res.json(funcionarios);
  } catch (err) {
    next(err);
  }
});

app.post('/funcionarios', async (req, res, next) => {
  try {
    const funcionario = new Funcionario(req.body);
    await funcionario.save();
    res.status(201).json(funcionario);
  } catch (err) {
    next(err);
  }
});

app.delete('/funcionarios/:id', async (req, res, next) => {
  try {
    const funcionario = await Funcionario.findByIdAndDelete(req.params.id);
    if (!funcionario) {
      return res.status(404).json({ message: 'Funcionário não encontrado' });
    }
    res.json({ message: 'Funcionário excluído com sucesso' });
  } catch (err) {
    next(err);
  }
});

app.use(errorHandler);

app.listen(3000, () => {
  console.log('API rodando em http://localhost:3000');
});

// Adicione logs para depuração
console.log('Servidor iniciado. Verifique se a mensagem acima aparece.');
