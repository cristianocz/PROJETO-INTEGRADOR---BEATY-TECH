// URL base da API
const API_URL = 'http://localhost:3000';

// Função para carregar a lista de clientes
async function loadClients() {
    try {
        console.log('Iniciando carregamento de clientes...');
        const response = await fetch(`${API_URL}/clientes`);
        console.log('Resposta do servidor:', response.status);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const clients = await response.json();
        console.log('Clientes recebidos:', clients);
        
        if (!Array.isArray(clients)) {
            console.error('Resposta não é um array:', clients);
            throw new Error('Formato de resposta inválido');
        }
        
        displayClients(clients);
    } catch (error) {
        console.error('Erro detalhado ao carregar clientes:', error);
        alert('Erro ao carregar a lista de clientes. Por favor, tente novamente.');
    }
}

// Função para exibir os clientes na tabela
function displayClients(clients) {
    console.log('Exibindo clientes:', clients); // Log para debug
    const tbody = document.querySelector('.clients-table tbody');
    if (!tbody) {
        console.error('Elemento tbody não encontrado');
        return;
    }
    tbody.innerHTML = '';

    if (!Array.isArray(clients)) {
        console.error('Lista de clientes inválida:', clients);
        return;
    }

    clients.forEach(client => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${client.nome || ''}</td>
            <td>${client.email || ''}</td>
            <td>${client.telefone || ''}</td>
            <td>
                <div class="action-buttons">
                    <button class="button button-secondary" onclick="editClient('${client._id}')">
                        <span class="material-icons">edit</span>
                    </button>
                    <button class="button button-secondary" onclick="deleteClient('${client._id}')">
                        <span class="material-icons">delete</span>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Função para cadastrar um novo cliente
async function registerClient(event) {
    event.preventDefault();

    const formData = {
        nome: document.getElementById('client-name').value,
        email: document.getElementById('client-email').value,
        telefone: document.getElementById('client-phone').value
    };

    try {
        const response = await fetch(`${API_URL}/clientes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao cadastrar cliente');
        }

        alert('Cliente cadastrado com sucesso!');
        document.getElementById('client-form').reset();
        loadClients(); // Recarrega a lista de clientes
    } catch (error) {
        console.error('Erro ao cadastrar cliente:', error);
        alert(error.message || 'Erro ao cadastrar cliente. Por favor, tente novamente.');
    }
}

// Função para pesquisar clientes
function searchClients(event) {
    const searchTerm = event.target.value.toLowerCase();
    const rows = document.querySelectorAll('.clients-table tbody tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Função para editar um cliente
async function editClient(id) {
    try {
        // Aqui você pode implementar a lógica de edição
        // Por exemplo, abrir um modal com os dados do cliente
        alert('Funcionalidade de edição será implementada em breve.');
    } catch (error) {
        console.error('Erro ao editar cliente:', error);
        alert('Erro ao editar cliente. Por favor, tente novamente.');
    }
}

// Função para excluir um cliente
async function deleteClient(id) {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/clientes/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Erro ao excluir cliente');
        }

        alert('Cliente excluído com sucesso!');
        loadClients(); // Recarrega a lista de clientes
    } catch (error) {
        console.error('Erro ao excluir cliente:', error);
        alert('Erro ao excluir cliente. Por favor, tente novamente.');
    }
}

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Carregar lista inicial de clientes
    loadClients();

    // Adicionar event listener para o formulário de cadastro
    const form = document.getElementById('client-form');
    form.addEventListener('submit', registerClient);

    // Adicionar event listener para a pesquisa
    const searchInput = document.querySelector('.search-input');
    searchInput.addEventListener('input', searchClients);
});
