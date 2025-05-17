// api/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Conecte ao MongoDB Atlas com tratamento de erros
mongoose.connect('mongodb+srv://crrcorazzim:82jVSD5rbULgZebW@cluster0.ofzj9xy.mongodb.net/beatytech', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  retryWrites: true,
  w: 'majority'
})
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

const Agendamento = mongoose.model('Agendamento', {
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  funcionario: { type: mongoose.Schema.Types.ObjectId, ref: 'Funcionario', required: true },
  servico: { type: String, required: true },
  data: { type: Date, required: true },
  horario: { type: String, required: true },
  duracao: { type: Number, required: true }, // duração em minutos
  status: { type: String, enum: ['agendado', 'concluido', 'cancelado'], default: 'agendado' },
  dataCriacao: { type: Date, default: Date.now }
});

// Middleware de erro
const errorHandler = (err, req, res, next) => {
  console.error('Erro detalhado:', err);
  
  // Erros de validação do Mongoose
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      message: 'Erro de validação', 
      errors: Object.values(err.errors).map(e => e.message) 
    });
  }
  
  // Erros de ID inválido
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(400).json({ message: 'ID inválido' });
  }
  
  // Erros de parsing de data/hora
  if (err instanceof TypeError && err.message.includes('Invalid date')) {
    return res.status(400).json({ message: 'Data ou hora inválida' });
  }
  
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

// Adicionar validações mais robustas
const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
};

const validatePhone = (phone) => {
  // Aceita formatos: (XX) XXXX-XXXX ou (XX) XXXXX-XXXX
  return phone.match(/^\(\d{2}\) \d{4,5}-\d{4}$/);
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

// Rota de busca de clientes
app.get('/clientes/search', async (req, res, next) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }

    const clientes = await Cliente.find({
      $or: [
        { nome: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { telefone: { $regex: query, $options: 'i' } }
      ]
    });
    res.json(clientes);
  } catch (err) {
    next(err);
  }
});

// Rota para obter um cliente específico
app.get('/clientes/:id', async (req, res, next) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    res.json(cliente);
  } catch (err) {
    next(err);
  }
});

// Rota para atualizar um cliente
app.put('/clientes/:id', async (req, res, next) => {
  try {
    const { nome, email, telefone } = req.body;
    
    if (!nome || !email || !telefone) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }
    
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Email inválido' });
    }

    const cliente = await Cliente.findByIdAndUpdate(
      req.params.id,
      { nome, email, telefone },
      { new: true, runValidators: true }
    );

    if (!cliente) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    res.json(cliente);
  } catch (err) {
    next(err);
  }
});

// Rota para excluir um cliente
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

// Rota para atualizar um funcionário
app.put('/funcionarios/:id', async (req, res, next) => {
  try {
    console.log('Recebendo requisição PUT /funcionarios/:id', {
      id: req.params.id,
      body: req.body
    });

    const { nome, email, telefone, especialidade } = req.body;
    
    if (!nome || !email || !telefone || !especialidade) {
      console.log('Campos obrigatórios faltando');
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }
    
    if (!validateEmail(email)) {
      console.log('Email inválido:', email);
      return res.status(400).json({ message: 'Email inválido' });
    }

    if (!validatePhone(telefone)) {
      console.log('Telefone inválido:', telefone);
      return res.status(400).json({ message: 'Telefone inválido. Use o formato: (XX) XXXX-XXXX ou (XX) XXXXX-XXXX' });
    }

    const funcionario = await Funcionario.findByIdAndUpdate(
      req.params.id,
      { nome, email, telefone, especialidade },
      { new: true }
    );

    if (!funcionario) {
      return res.status(404).json({ message: 'Funcionário não encontrado' });
    }

    res.json(funcionario);
  } catch (err) {
    next(err);
  }
});

// Rota para buscar um funcionário específico
app.get('/funcionarios/:id', async (req, res, next) => {
  try {
    const funcionario = await Funcionario.findById(req.params.id);
    if (!funcionario) {
      return res.status(404).json({ message: 'Funcionário não encontrado' });
    }
    res.json(funcionario);
  } catch (err) {
    next(err);
  }
});

// Rotas de Agendamento
app.post('/agendamentos', async (req, res, next) => {
  try {
    const { clienteId, funcionarioId, servico, data, horario, duracao } = req.body;

    // Validação básica dos campos
    if (!clienteId || !funcionarioId || !servico || !data || !horario || !duracao) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    // Validar IDs de MongoDB
    if (!mongoose.Types.ObjectId.isValid(clienteId) || !mongoose.Types.ObjectId.isValid(funcionarioId)) {
      return res.status(400).json({ message: 'ID de cliente ou funcionário inválido' });
    }

    // Validar funcionário e cliente
    const [cliente, funcionario] = await Promise.all([
      Cliente.findById(clienteId),
      Funcionario.findById(funcionarioId)
    ]);

    if (!cliente || !funcionario) {
      return res.status(404).json({ 
        message: !cliente ? 'Cliente não encontrado' : 'Funcionário não encontrado' 
      });
    }    // Verificar se já existe agendamento no mesmo horário para o funcionário
    const dataAgendamento = new Date(data);
    dataAgendamento.setHours(0, 0, 0, 0);  // Normalizar a data para início do dia
    
    const [horaInicio, minutoInicio] = horario.split(':').map(Number);
    const inicioMinutos = horaInicio * 60 + minutoInicio;
    const fimMinutos = inicioMinutos + duracao;
    
    const agendamentoExistente = await Agendamento.find({
      funcionario: funcionarioId,
      data: dataAgendamento,
      status: 'agendado'
    });
    
    // Verificar sobreposição de horários
    const temConflito = agendamentoExistente.some(agend => {
      const [h, m] = agend.horario.split(':').map(Number);
      const agendInicioMinutos = h * 60 + m;
      const agendFimMinutos = agendInicioMinutos + agend.duracao;
      
      // Verifica se há sobreposição
      return (inicioMinutos < agendFimMinutos && fimMinutos > agendInicioMinutos);
    });
    
    if (temConflito) {
      return res.status(400).json({ message: 'Horário não disponível' });
    }

    if (agendamentoExistente) {
      return res.status(400).json({ message: 'Horário não disponível' });
    }

    const agendamento = new Agendamento({
      cliente: clienteId,
      funcionario: funcionarioId,
      servico,
      data: dataAgendamento,
      horario,
      duracao
    });

    await agendamento.save();
    res.status(201).json(agendamento);
  } catch (err) {
    next(err);
  }
});

// Obter agendamentos por data
app.get('/agendamentos', async (req, res, next) => {
  try {
    const { data, funcionarioId } = req.query;
    const query = {};
    
    if (data) {
      const dataInicio = new Date(data);
      dataInicio.setHours(0, 0, 0, 0);
      const dataFim = new Date(dataInicio);
      dataFim.setHours(23, 59, 59, 999);
      
      query.data = {
        $gte: dataInicio,
        $lte: dataFim
      };
    }

    if (funcionarioId) {
      query.funcionario = funcionarioId;
    }

    const agendamentos = await Agendamento.find(query)
      .populate('cliente', 'nome telefone')
      .populate('funcionario', 'nome especialidade')
      .sort({ data: 1, horario: 1 });

    res.json(agendamentos);
  } catch (err) {
    next(err);
  }
});

// Cancelar agendamento
app.put('/agendamentos/:id/cancelar', async (req, res, next) => {
  try {
    const agendamento = await Agendamento.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelado' },
      { new: true }
    );

    if (!agendamento) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }

    res.json(agendamento);
  } catch (err) {
    next(err);
  }
});

// Concluir agendamento
app.put('/agendamentos/:id/concluir', async (req, res, next) => {
  try {
    const agendamento = await Agendamento.findByIdAndUpdate(
      req.params.id,
      { status: 'concluido' },
      { new: true }
    );

    if (!agendamento) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }

    res.json(agendamento);
  } catch (err) {
    next(err);
  }
});

// Rota para verificar disponibilidade
app.get('/agendamentos/disponibilidade', async (req, res, next) => {
  try {
    const { data, funcionarioId } = req.query;
    
    if (!data || !funcionarioId) {
      return res.status(400).json({ message: 'Data e funcionário são obrigatórios' });
    }

    const dataInicio = new Date(data);
    dataInicio.setHours(0, 0, 0, 0);
    const dataFim = new Date(dataInicio);
    dataFim.setHours(23, 59, 59, 999);

    // Buscar todos os agendamentos do funcionário para o dia
    const agendamentos = await Agendamento.find({
      funcionario: funcionarioId,
      data: {
        $gte: dataInicio,
        $lte: dataFim
      },
      status: 'agendado'
    }).select('horario duracao');

    // Criar um mapa de horários ocupados
    const horariosOcupados = new Map();
    agendamentos.forEach(agendamento => {
      const [horas, minutos] = agendamento.horario.split(':').map(Number);
      const startMinutes = horas * 60 + minutos;
      
      // Marcar cada intervalo de 30 minutos dentro da duração do agendamento como ocupado
      for (let i = 0; i < agendamento.duracao; i += 30) {
        const slot = minutesToTime(startMinutes + i);
        horariosOcupados.set(slot, true);
      }
    });

    res.json({
      funcionarioId,
      data,
      horariosOcupados: Array.from(horariosOcupados.keys())
    });
  } catch (err) {
    next(err);
  }
});

// Rota para obter próximos agendamentos de um cliente
app.get('/agendamentos/cliente/:clienteId', async (req, res, next) => {
  try {
    const clienteId = req.params.clienteId;
    const agora = new Date();

    const agendamentos = await Agendamento.find({
      cliente: clienteId,
      data: { $gte: agora },
      status: 'agendado'
    })
    .populate('funcionario', 'nome especialidade')
    .sort({ data: 1, horario: 1 });

    res.json(agendamentos);
  } catch (err) {
    next(err);
  }
});

// Rota para obter agendamentos de um funcionário
app.get('/agendamentos/funcionario/:funcionarioId', async (req, res, next) => {
  try {
    const { funcionarioId } = req.params;
    const { data } = req.query;
    
    let query = {
      funcionario: funcionarioId,
      status: 'agendado'
    };

    if (data) {
      const dataInicio = new Date(data);
      dataInicio.setHours(0, 0, 0, 0);
      const dataFim = new Date(dataInicio);
      dataFim.setHours(23, 59, 59, 999);
      
      query.data = {
        $gte: dataInicio,
        $lte: dataFim
      };
    }

    const agendamentos = await Agendamento.find(query)
      .populate('cliente', 'nome telefone')
      .sort({ data: 1, horario: 1 });

    res.json(agendamentos);
  } catch (err) {
    next(err);
  }
});

// Função auxiliar para converter minutos em horário formatado
function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

app.use(errorHandler);

app.listen(3001, () => {
  console.log('API rodando em http://localhost:3001');
});

// Adicione logs para depuração
console.log('Servidor iniciado. Verifique se a mensagem acima aparece.');
