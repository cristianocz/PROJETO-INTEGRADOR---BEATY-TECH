// URL base da API
const API_URL = 'http://localhost:3001';

// Funções de validação
function validateEmail(email) {
    return String(email)
        .toLowerCase()
        .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
}

function validatePhone(phone) {
    // Aceita formatos: (XX) XXXX-XXXX ou (XX) XXXXX-XXXX
    return phone.match(/^\(\d{2}\) \d{4,5}-\d{4}$/);
}

function validateName(name) {
    return name.length >= 3; // Nome deve ter pelo menos 3 caracteres
}

function showError(inputElement, message) {
    const errorDiv = inputElement.parentElement.querySelector('.error-message');
    if (!errorDiv) {
        const div = document.createElement('div');
        div.className = 'error-message';
        div.style.color = 'var(--error)';
        div.style.fontSize = '0.875rem';
        div.style.marginTop = '0.25rem';
        inputElement.parentElement.appendChild(div);
    }
    errorDiv.textContent = message;
    inputElement.style.borderColor = 'var(--error)';
}

function clearError(inputElement) {
    const errorDiv = inputElement.parentElement.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.remove();
    }
    inputElement.style.borderColor = '';
}

function validateForm(formData) {
    let isValid = true;
    const errors = {};

    if (!validateName(formData.nome)) {
        errors.nome = 'O nome deve ter pelo menos 3 caracteres';
        isValid = false;
    }

    if (!validateEmail(formData.email)) {
        errors.email = 'Email inválido';
        isValid = false;
    }

    if (!validatePhone(formData.telefone)) {
        errors.telefone = 'Telefone inválido. Use o formato: (XX) XXXX-XXXX';
        isValid = false;
    }

    return { isValid, errors };
}

// Função para formatar número de telefone
function formatPhone(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 11) {
        value = value.slice(0, 11);
    }
    
    if (value.length >= 11) {
        value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (value.length >= 10) {
        value = value.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
    } else if (value.length >= 6) {
        value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    } else if (value.length >= 2) {
        value = value.replace(/^(\d{2})/, '($1) ');
    }
    
    input.value = value;
}

// Função para carregar a lista de clientes
async function loadClients() {
    const loadingIndicator = document.getElementById('loading-indicator');
    const tableBody = document.getElementById('client-list');
    
    try {
        if (loadingIndicator) loadingIndicator.style.display = 'block';
        if (tableBody) tableBody.style.opacity = '0.5';

        const response = await fetch(`${API_URL}/clientes`);
        if (!response.ok) {
            throw new Error(`Erro ao carregar clientes: ${response.statusText}`);
        }
        
        const clients = await response.json();
        displayClients(clients);
    } catch (error) {
        console.error('Erro ao carregar clientes:', error);
        const errorMessage = error.message || 'Erro ao carregar clientes. Por favor, tente novamente.';
        showError(document.querySelector('.client-list'), errorMessage);
    } finally {
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        if (tableBody) tableBody.style.opacity = '1';
    }
}

// Função para exibir os clientes na tabela
function displayClients(clients) {
    const tableBody = document.getElementById('client-list');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    clients.forEach(client => {
        const row = document.createElement('tr');
        let dataNascimento = '';
        
        if (client.dataNascimento) {
            try {
                const data = new Date(client.dataNascimento);
                if (!isNaN(data.getTime())) {
                    const dia = String(data.getUTCDate()).padStart(2, '0');
                    const mes = String(data.getUTCMonth() + 1).padStart(2, '0');
                    const ano = data.getUTCFullYear();
                    dataNascimento = `${dia}/${mes}/${ano}`;
                }
            } catch (err) {
                console.error('Erro ao formatar data:', err);
                dataNascimento = '';
            }
        }

        row.innerHTML = `
            <td>${client.nome || ''}</td>
            <td>${client.email || ''}</td>
            <td>${client.telefone || ''}</td>
            <td>${dataNascimento}</td>
            <td>
                <div class="action-buttons">
                    <button onclick="editClient('${client._id}')" class="button-edit" title="Editar">
                        <span class="material-icons">edit</span>
                    </button>
                    <button onclick="deleteClient('${client._id}')" class="button-delete" title="Excluir">
                        <span class="material-icons">delete</span>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Função para pesquisar clientes
async function searchClients(event) {
    const query = event.target.value.trim();
    if (query === '') {
        loadClients();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/clientes/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const clients = await response.json();
        displayClients(clients);
    } catch (error) {
        console.error('Erro ao pesquisar clientes:', error);
    }
}

// Função para validar o formulário
function validateForm(data) {
    const errors = {};
    
    if (!data.nome || data.nome.length < 3) {
        errors.nome = 'Nome deve ter pelo menos 3 caracteres';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
        errors.email = 'Email inválido';
    }
    
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    if (!data.telefone || !phoneRegex.test(data.telefone)) {
        errors.telefone = 'Telefone inválido. Use o formato (99) 99999-9999';
    }
    
    const isValid = Object.keys(errors).length === 0;
    return { isValid, errors };
}

// Função para criar/editar cliente
async function handleClientSubmit(event) {
    event.preventDefault();
    
    // Limpa erros anteriores
    clearError(document.getElementById('client-name'));
    clearError(document.getElementById('client-email'));
    clearError(document.getElementById('client-phone'));
    
    const form = event.target;
    const formData = {
        nome: document.getElementById('client-name').value.trim(),
        email: document.getElementById('client-email').value.trim(),
        telefone: document.getElementById('client-phone').value.trim(),
        dataNascimento: document.getElementById('client-birth').value
    };

    // Valida o formulário
    const { isValid, errors } = validateForm(formData);
    if (!isValid) {
        if (errors.nome) {
            showError(document.getElementById('client-name'), errors.nome);
            document.getElementById('client-name').focus();
        }
        if (errors.email) {
            showError(document.getElementById('client-email'), errors.email);
            if (!errors.nome) document.getElementById('client-email').focus();
        }
        if (errors.telefone) {
            showError(document.getElementById('client-phone'), errors.telefone);
            if (!errors.nome && !errors.email) document.getElementById('client-phone').focus();
        }
        return;
    }

    const editId = form.dataset.editId;
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `${API_URL}/clientes/${editId}` : `${API_URL}/clientes`;

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || `Erro ao salvar cliente: ${response.status}`);
        }

        const action = editId ? 'atualizado' : 'cadastrado';
        alert(`Cliente ${action} com sucesso!`);
        loadClients();
        closeModal();
    } catch (error) {
        console.error('Erro ao salvar cliente:', error);
        alert(`Erro ao salvar cliente: ${error.message}`);
    }
}

// Função para editar cliente
async function editClient(clientId) {
    try {
        const response = await fetch(`${API_URL}/clientes/${clientId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const client = await response.json();

        document.getElementById('client-name').value = client.nome || '';
        document.getElementById('client-email').value = client.email || '';
        document.getElementById('client-phone').value = client.telefone || '';
        document.getElementById('client-birth').value = client.dataNascimento.split('T')[0] || '';

        const form = document.getElementById('client-form');
        form.dataset.editId = clientId;
        form.querySelector('h2').textContent = 'Editar Cliente';

        openModal();
    } catch (error) {
        console.error('Erro ao editar cliente:', error);
        alert(`Erro ao editar cliente: ${error.message}`);
    }
}

// Função para excluir cliente
async function deleteClient(clientId) {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return;

    try {
        const response = await fetch(`${API_URL}/clientes/${clientId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        alert('Cliente excluído com sucesso!');
        loadClients();
    } catch (error) {
        console.error('Erro ao excluir cliente:', error);
        alert(`Erro ao excluir cliente: ${error.message}`);
    }
}

// Inicializa a lista de clientes ao carregar a página
document.addEventListener('DOMContentLoaded', loadClients);

// Máscara para o campo de telefone
const phoneInput = document.getElementById('client-phone');
if (phoneInput) {
    phoneInput.addEventListener('input', function() {
        formatPhone(this);
    });
}

// Evento para o formulário de cliente
const clientForm = document.getElementById('client-form');
if (clientForm) {
    clientForm.addEventListener('submit', handleClientSubmit);
}

// Evento para o campo de pesquisa
const searchInput = document.getElementById('search-client');
if (searchInput) {
    searchInput.addEventListener('input', searchClients);
}

// Função para abrir o modal
function openModal() {
    const modal = document.getElementById('client-modal');
    if (modal) {
        modal.style.display = 'block';
        modal.setAttribute('aria-hidden', 'false');
        modal.setAttribute('aria-modal', 'true');

        // Adiciona evento para fechar o modal ao clicar fora do conteúdo
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeModal();
            }
        });
    }
}

// Função para fechar o modal
function closeModal() {
    const modal = document.getElementById('client-modal');
    if (modal) {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        modal.removeAttribute('aria-modal');

        // Limpa o formulário e o ID de edição
        const form = document.getElementById('client-form');
        if (form) {
            form.reset();
            delete form.dataset.editId;
            form.querySelector('h2').textContent = 'Adicionar Cliente';
        }
    }
}

// Fecha o modal ao pressionar ESC
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});
