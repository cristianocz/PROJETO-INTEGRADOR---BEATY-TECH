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
        row.innerHTML = `
            <td>${client.nome || ''}</td>
            <td>${client.email || ''}</td>
            <td>${client.telefone || ''}</td>
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
        
        resetForm();
        await loadClients();
    } catch (error) {
        console.error('Erro ao salvar cliente:', error);
        alert('Erro ao salvar cliente: ' + error.message);
    }
}

// Função para criar modal de edição
function createEditModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Editar Cliente</h2>
            <form id="edit-client-form">
                <div class="form-group">
                    <label for="edit-client-name" class="form-label">Nome Completo</label>
                    <input type="text" id="edit-client-name" name="edit-client-name" class="form-input" required>
                    <div class="error-message"></div>
                </div>
                <div class="form-group">
                    <label for="edit-client-email" class="form-label">Email</label>
                    <input type="email" id="edit-client-email" name="edit-client-email" class="form-input" required>
                    <div class="error-message"></div>
                </div>
                <div class="form-group">
                    <label for="edit-client-phone" class="form-label">Telefone</label>
                    <input type="tel" id="edit-client-phone" name="edit-client-phone" class="form-input" required maxlength="15" placeholder="(XX) XXXXX-XXXX">
                    <div class="error-message"></div>
                </div>
                <div class="form-group">
                    <label for="edit-client-birth" class="form-label">Data de Nascimento</label>
                    <input type="date" id="edit-client-birth" name="edit-client-birth" class="form-input">
                    <div class="error-message"></div>
                </div>
                <button type="submit" class="button button-primary">Salvar Alterações</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

// Função para editar cliente
async function editClient(id) {
    try {
        let modal = document.querySelector('.modal');
        if (!modal) {
            modal = createEditModal();
        }

        const response = await fetch(`${API_URL}/clientes/${id}`);
        if (!response.ok) {
            throw new Error(`Erro ao carregar cliente: ${response.status}`);
        }
        
        const client = await response.json();
        
        // Remove event listeners antigos do input de telefone
        const oldPhoneInput = document.getElementById('edit-client-phone');
        if (oldPhoneInput) {
            const oldListeners = oldPhoneInput.cloneNode(true);
            oldPhoneInput.parentNode.replaceChild(oldListeners, oldPhoneInput);
        }

        // Preenche o formulário com os dados do cliente
        document.getElementById('edit-client-name').value = client.nome || '';
        document.getElementById('edit-client-email').value = client.email || '';
        document.getElementById('edit-client-phone').value = client.telefone || '';
        document.getElementById('edit-client-birth').value = client.dataNascimento ? client.dataNascimento.split('T')[0] : '';
        
        // Adiciona formatação de telefone ao campo
        const phoneInput = document.getElementById('edit-client-phone');
        phoneInput.addEventListener('input', () => formatPhone(phoneInput));

        // Mostra o modal
        modal.style.display = 'block';

        function closeModal() {
            modal.style.display = 'none';
            // Limpa o formulário e os erros
            document.getElementById('edit-client-form').reset();
            clearError(document.getElementById('edit-client-name'));
            clearError(document.getElementById('edit-client-email'));
            clearError(document.getElementById('edit-client-phone'));
            clearError(document.getElementById('edit-client-birth'));
            // Remove os event listeners
            closeBtn.removeEventListener('click', closeModal);
            window.removeEventListener('click', closeOnOutsideClick);
        }

        function closeOnOutsideClick(event) {
            if (event.target === modal) {
                closeModal();
            }
        }

        // Adiciona event listeners para fechar o modal
        const closeBtn = modal.querySelector('.close');
        closeBtn.addEventListener('click', closeModal);
        window.addEventListener('click', closeOnOutsideClick);

        // Manipula o envio do formulário
        const form = document.getElementById('edit-client-form');
        form.onsubmit = async (e) => {
            e.preventDefault();
            
            // Limpa erros anteriores
            clearError(document.getElementById('edit-client-name'));
            clearError(document.getElementById('edit-client-email'));
            clearError(document.getElementById('edit-client-phone'));
            
            const formData = {
                nome: document.getElementById('edit-client-name').value.trim(),
                email: document.getElementById('edit-client-email').value.trim(),
                telefone: document.getElementById('edit-client-phone').value.trim(),
                dataNascimento: document.getElementById('edit-client-birth').value
            };

            // Valida o formulário
            const { isValid, errors } = validateForm(formData);
            
            if (!isValid) {
                if (errors.nome) {
                    showError(document.getElementById('edit-client-name'), errors.nome);
                    document.getElementById('edit-client-name').focus();
                }
                if (errors.email) {
                    showError(document.getElementById('edit-client-email'), errors.email);
                    if (!errors.nome) document.getElementById('edit-client-email').focus();
                }
                if (errors.telefone) {
                    showError(document.getElementById('edit-client-phone'), errors.telefone);
                    if (!errors.nome && !errors.email) document.getElementById('edit-client-phone').focus();
                }
                return;
            }

            try {
                const response = await fetch(`${API_URL}/clientes/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) {
                    throw new Error('Erro ao atualizar cliente');
                }

                alert('Cliente atualizado com sucesso!');
                closeModal();
                loadClients(); // Recarrega a lista
            } catch (error) {
                console.error('Erro ao atualizar cliente:', error);
                alert('Erro ao atualizar cliente. Por favor, tente novamente.');
            }
        };

    } catch (error) {
        console.error('Erro ao carregar cliente:', error);
        alert('Erro ao carregar dados do cliente. Por favor, tente novamente.');
    }
}

// Função para excluir cliente
async function deleteClient(id) {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return;

    try {
        const response = await fetch(`${API_URL}/clientes/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        alert('Cliente excluído com sucesso!');
        loadClients();
    } catch (error) {
        console.error('Erro ao excluir cliente:', error);
        alert('Erro ao excluir cliente. Por favor, tente novamente.');
    }
}

// Função para resetar o formulário
function resetForm() {
    const form = document.getElementById('client-form');
    form.reset();
    delete form.dataset.editId;
    
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.textContent = 'Cadastrar Cliente';
    
    // Limpa erros
    clearError(document.getElementById('client-name'));
    clearError(document.getElementById('client-email'));
    clearError(document.getElementById('client-phone'));
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    loadClients();
    
    // Event listeners
    const form = document.getElementById('client-form');
    form.addEventListener('submit', handleClientSubmit);
    
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(searchClients, 300));
    }
    
    const phoneInput = document.getElementById('client-phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', () => formatPhone(phoneInput));
    }
});

// Função utilitária debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Função para mostrar popup de edição
function showEditPopup(client) {
    const popup = document.createElement('div');
    popup.className = 'edit-popup';
    popup.innerHTML = `
        <div class="popup-content">
            <h2>Editar Cliente</h2>
            <form id="editForm">
                <div class="form-group">
                    <label for="nome">Nome:</label>
                    <input type="text" id="nome" name="nome" value="${client.nome}" required>
                </div>
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" value="${client.email}" required>
                </div>
                <div class="form-group">
                    <label for="telefone">Telefone:</label>
                    <input type="tel" id="telefone" name="telefone" value="${client.telefone}" required>
                </div>
                <div class="button-group">
                    <button type="submit" class="btn-primary">Salvar</button>
                    <button type="button" class="btn-secondary" onclick="closePopup()">Cancelar</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(popup);

    const form = popup.querySelector('#editForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:3001/clientes/${client._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nome: form.nome.value,
                    email: form.email.value,
                    telefone: form.telefone.value
                })
            });

            if (!response.ok) {
                throw new Error('Erro ao atualizar cliente');
            }

            loadClients(); // Recarrega a lista
            closePopup();
        } catch (error) {
            alert('Erro ao atualizar cliente: ' + error.message);
        }
    });
}

function closePopup() {
    const popup = document.querySelector('.edit-popup');
    if (popup) {
        popup.remove();
    }
}
