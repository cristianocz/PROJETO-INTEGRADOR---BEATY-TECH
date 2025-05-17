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

// Modelo Cliente
const Cliente = mongoose.model('Cliente', {
  nome: String,
  email: String,
  telefone: String,
  dataCadastro: { type: Date, default: Date.now }
});

// Cliente de teste
const clienteTeste = {
  nome: 'Cliente Teste',
  email: 'teste@beautytech.com',
  telefone: '(15) 99999-9999'
};

// Função para inicializar o cliente de teste
async function initializeClienteTeste() {
  try {
    // Procurar se já existe um cliente com este email
    let cliente = await Cliente.findOne({ email: clienteTeste.email });
    
    if (!cliente) {
      cliente = new Cliente(clienteTeste);
      await cliente.save();
      console.log('Cliente de teste criado:', cliente);
    } else {
      console.log('Cliente de teste já existe:', cliente);
    }
    
    // Salvar o ID do cliente para uso no frontend
    console.log('\nID do cliente para usar no frontend:');
    console.log(`clientId = "${cliente._id}";`);

  } catch (error) {
    console.error('Erro ao inicializar cliente de teste:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Executar inicialização
initializeClienteTeste();
