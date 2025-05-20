const mongoose = require('mongoose');

// Conectar ao MongoDB Atlas com opções de conexão otimizadas
mongoose.connect('mongodb+srv://crrcorazzim:82jVSD5rbULgZebW@cluster0.ofzj9xy.mongodb.net/beatytech', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  retryWrites: true,
  w: 'majority'
})
  .then(() => console.log('Conexão com MongoDB Atlas bem-sucedida'))
  .catch(err => {
    console.error('Erro ao conectar ao MongoDB Atlas:', err.message);
    process.exit(1);
  });

// Modelo Funcionario
const Funcionario = mongoose.model('Funcionario', {
  nome: String,
  email: String,
  telefone: String,
  especialidade: String,
  disponivel: { type: Boolean, default: true }
});

// Dados dos funcionários
const funcionarios = [
  {
    nome: 'Caroline Gimenes',
    email: 'caroline@beautytech.com',
    telefone: '(15) 99741-1907',
    especialidade: 'Cabeleireira Master',
    disponivel: true
  },
  {
    nome: 'Naire',
    email: 'naire@beautytech.com',
    telefone: '(15) 99999-9999',
    especialidade: 'Maquiagem',
    disponivel: true
  },  {
    nome: 'Amanda',
    email: 'amanda@beautytech.com',
    telefone: '(15) 98888-8888',
    especialidade: 'Manicure',
    disponivel: true
  },
  {
    nome: 'Lenita',
    email: 'lenita@beautytech.com',
    telefone: '(15) 97777-7777',
    especialidade: 'Esteticista',
    disponivel: true
  }
];

// Função para inicializar os funcionários
async function initializeFuncionarios() {
  try {
    // Limpar coleção existente
    await Funcionario.deleteMany({});
    
    // Inserir novos funcionários
    const result = await Funcionario.insertMany(funcionarios);
    console.log('Funcionários adicionados:', result);
    
    // Buscar e mostrar todos os funcionários
    const todosFuncionarios = await Funcionario.find();
    console.log('\nFuncionários cadastrados:');
    todosFuncionarios.forEach(func => {
      console.log(`ID: ${func._id}`);
      console.log(`Nome: ${func.nome}`);
      console.log(`Especialidade: ${func.especialidade}`);
      console.log('---');
    });

  } catch (error) {
    console.error('Erro ao inicializar funcionários:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Executar inicialização
initializeFuncionarios();
