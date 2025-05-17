// URL base da API
const API_URL = 'http://localhost:3000';

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

function validatePosition(position) {
    return position.length >= 3; // Especialidade deve ter pelo menos 3 caracteres
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

    if (!validatePosition(formData.especialidade)) {
        errors.especialidade = 'A especialidade deve ter pelo menos 3 caracteres';
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

// Função para carregar a lista de funcionários
async function loadEmployees() {
    try {
        const response = await fetch(`${API_URL}/funcionarios`);
        const employees = await response.json();
        displayEmployees(employees);
    } catch (error) {
        console.error('Erro ao carregar funcionários:', error);
        alert('Erro ao carregar a lista de funcionários. Por favor, tente novamente.');
    }
}

// Função para exibir os funcionários na tabela
function displayEmployees(employees) {
    const tbody = document.querySelector('#employee-list');
    tbody.innerHTML = '';    employees.forEach(employee => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td title="${employee.nome || ''}">${employee.nome || ''}</td>
            <td title="${employee.especialidade || ''}">${employee.especialidade || ''}</td>
            <td title="${employee.telefone || ''}">${employee.telefone || ''}</td>
            <td title="${employee.email || ''}">${employee.email || ''}</td>
            <td>
                <div class="action-buttons">
                    <button onclick="editEmployee('${employee._id}')" title="Editar funcionário">
                        <span class="material-icons">edit</span>
                    </button>
                    <button onclick="deleteEmployee('${employee._id}')" title="Excluir funcionário">
                        <span class="material-icons">delete</span>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Função para cadastrar um novo funcionário
async function registerEmployee(event) {
    event.preventDefault();

    // Limpa erros anteriores
    clearError(document.getElementById('name'));
    clearError(document.getElementById('position'));
    clearError(document.getElementById('email'));
    clearError(document.getElementById('phone'));

    const formData = {
        nome: document.getElementById('name').value.trim(),
        especialidade: document.getElementById('position').value.trim(),
        email: document.getElementById('email').value.trim(),
        telefone: document.getElementById('phone').value.trim(),
        disponivel: true
    };

    // Valida o formulário
    const { isValid, errors } = validateForm(formData);
    
    if (!isValid) {
        if (errors.nome) {
            showError(document.getElementById('name'), errors.nome);
            document.getElementById('name').focus();
        }
        if (errors.especialidade) {
            showError(document.getElementById('position'), errors.especialidade);
            if (!errors.nome) document.getElementById('position').focus();
        }
        if (errors.email) {
            showError(document.getElementById('email'), errors.email);
            if (!errors.nome && !errors.especialidade) document.getElementById('email').focus();
        }
        if (errors.telefone) {
            showError(document.getElementById('phone'), errors.telefone);
            if (!errors.nome && !errors.especialidade && !errors.email) document.getElementById('phone').focus();
        }
        return;
    }

    try {
        console.log('Enviando dados:', formData);
        const response = await fetch(`${API_URL}/funcionarios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Erro ao cadastrar funcionário');
        }

        alert('Funcionário cadastrado com sucesso!');
        document.getElementById('employee-form').reset();
        loadEmployees(); // Recarrega a lista de funcionários
    } catch (error) {
        console.error('Erro ao cadastrar funcionário:', error);
        if (error.message.includes('Email inválido')) {
            showError(document.getElementById('email'), 'Email inválido');
            document.getElementById('email').focus();
        } else if (error.message.includes('Telefone inválido')) {
            showError(document.getElementById('phone'), 'Formato de telefone inválido: use (XX) XXXX-XXXX');
            document.getElementById('phone').focus();
        } else {
            alert(error.message || 'Erro ao cadastrar funcionário. Por favor, tente novamente.');
        }
    }
}

// Função para buscar dados do funcionário
async function getEmployee(id) {
    const response = await fetch(`${API_URL}/funcionarios/${id}`);
    if (!response.ok) {
        throw new Error('Erro ao buscar dados do funcionário');
    }
    return await response.json();
}

// Função para criar modal de edição
function createEditModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Editar Funcionário</h2>
            <form id="edit-employee-form">
                <div class="form-group">
                    <label for="edit-name" class="form-label">Nome Completo</label>
                    <input type="text" id="edit-name" name="edit-name" class="form-input" required>
                </div>
                <div class="form-group">
                    <label for="edit-position" class="form-label">Cargo/Especialidade</label>
                    <input type="text" id="edit-position" name="edit-position" class="form-input" required>
                </div>
                <div class="form-group">
                    <label for="edit-email" class="form-label">Email</label>
                    <input type="email" id="edit-email" name="edit-email" class="form-input" required>
                </div>
                <div class="form-group">
                    <label for="edit-phone" class="form-label">Telefone</label>
                    <input type="tel" id="edit-phone" name="edit-phone" class="form-input" required maxlength="15" placeholder="(XX) XXXXX-XXXX">
                </div>
                <button type="submit" class="button button-primary">Salvar Alterações</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

// Função para editar um funcionário
async function editEmployee(id) {
    try {
        let modal = document.querySelector('.modal');
        if (!modal) {
            modal = createEditModal();
        }

        const employee = await getEmployee(id);
        
        // Remove event listeners antigos, se existirem
        const oldPhoneInput = document.getElementById('edit-phone');
        if (oldPhoneInput) {
            const oldListeners = oldPhoneInput.cloneNode(true);
            oldPhoneInput.parentNode.replaceChild(oldListeners, oldPhoneInput);
        }
        
        // Preenche o formulário com os dados atuais
        document.getElementById('edit-name').value = employee.nome || '';
        document.getElementById('edit-position').value = employee.especialidade || '';
        document.getElementById('edit-email').value = employee.email || '';
        document.getElementById('edit-phone').value = employee.telefone || '';

        // Adiciona formatação de telefone
        const phoneInput = document.getElementById('edit-phone');
        phoneInput.addEventListener('input', () => formatPhone(phoneInput));

        // Mostra o modal
        modal.style.display = 'block';

        function closeModal() {
            modal.style.display = 'none';
            // Limpa o formulário ao fechar
            document.getElementById('edit-employee-form').reset();
            // Remove os event listeners
            closeBtn.removeEventListener('click', closeModal);
            window.removeEventListener('click', closeOnOutsideClick);
            // Limpa os erros
            clearError(document.getElementById('edit-name'));
            clearError(document.getElementById('edit-position'));
            clearError(document.getElementById('edit-email'));
            clearError(document.getElementById('edit-phone'));
        }

        function closeOnOutsideClick(event) {
            if (event.target === modal) {
                closeModal();
            }
        }

        // Fecha o modal quando clicar no X
        const closeBtn = modal.querySelector('.close');
        closeBtn.addEventListener('click', closeModal);

        // Fecha o modal quando clicar fora dele
        window.addEventListener('click', closeOnOutsideClick);

        // Manipula o envio do formulário
        const form = document.getElementById('edit-employee-form');
        form.onsubmit = async (e) => {
            e.preventDefault();
            
            // Limpa erros anteriores
            clearError(document.getElementById('edit-name'));
            clearError(document.getElementById('edit-position'));
            clearError(document.getElementById('edit-email'));
            clearError(document.getElementById('edit-phone'));
            
            const formData = {
                nome: document.getElementById('edit-name').value.trim(),
                especialidade: document.getElementById('edit-position').value.trim(),
                email: document.getElementById('edit-email').value.trim(),
                telefone: document.getElementById('edit-phone').value.trim()
            };

            // Valida o formulário
            const { isValid, errors } = validateForm(formData);
            
            if (!isValid) {
                if (errors.nome) {
                    showError(document.getElementById('edit-name'), errors.nome);
                    document.getElementById('edit-name').focus();
                }
                if (errors.especialidade) {
                    showError(document.getElementById('edit-position'), errors.especialidade);
                    if (!errors.nome) document.getElementById('edit-position').focus();
                }
                if (errors.email) {
                    showError(document.getElementById('edit-email'), errors.email);
                    if (!errors.nome && !errors.especialidade) document.getElementById('edit-email').focus();
                }
                if (errors.telefone) {
                    showError(document.getElementById('edit-phone'), errors.telefone);
                    if (!errors.nome && !errors.especialidade && !errors.email) document.getElementById('edit-phone').focus();
                }
                return;
            }

            try {
                console.log('Enviando dados de atualização:', formData);                console.log('Enviando dados para atualização:', formData);
                const response = await fetch(`${API_URL}/funcionarios/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();
                console.log('Resposta da API:', data);

                if (!response.ok) {
                    const error = new Error(data.message || 'Erro ao atualizar funcionário');
                    error.statusCode = response.status;
                    error.responseData = data;
                    throw error;
                }

                alert('Funcionário atualizado com sucesso!');
                closeModal();
                loadEmployees(); // Recarrega a lista
            } catch (error) {
                console.error('Erro ao atualizar funcionário:', error);
                
                // Se o erro vier do backend com uma mensagem específica
                if (error.responseData && error.responseData.message) {
                    if (error.responseData.message.includes('Email inválido')) {
                        showError(document.getElementById('edit-email'), 'Email inválido');
                        document.getElementById('edit-email').focus();
                    } else if (error.responseData.message.includes('Telefone inválido')) {
                        showError(document.getElementById('edit-phone'), 'Formato de telefone inválido. Use o formato: (XX) XXXX-XXXX ou (XX) XXXXX-XXXX');
                        document.getElementById('edit-phone').focus();
                    } else {
                        alert(error.responseData.message);
                    }
                } else {
                    alert('Erro ao atualizar funcionário. Por favor, tente novamente.');
                }
            }
        };

    } catch (error) {
        console.error('Erro ao editar funcionário:', error);
        alert('Erro ao editar funcionário. Por favor, tente novamente.');
    }
}

// Função para excluir um funcionário
async function deleteEmployee(id) {
    if (!confirm('Tem certeza que deseja excluir este funcionário?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/funcionarios/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Erro ao excluir funcionário');
        }

        alert('Funcionário excluído com sucesso!');
        loadEmployees(); // Recarrega a lista de funcionários
    } catch (error) {
        console.error('Erro ao excluir funcionário:', error);
        alert('Erro ao excluir funcionário. Por favor, tente novamente.');
    }
}

// Função para pesquisar funcionários
function searchEmployees(event) {
    const searchTerm = event.target.value.toLowerCase();
    const rows = document.querySelectorAll('#employee-list tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Carregar lista inicial de funcionários
    loadEmployees();

    // Adicionar event listener para o formulário de cadastro
    const form = document.getElementById('employee-form');
    form.addEventListener('submit', registerEmployee);

    // Adicionar event listener para a pesquisa
    const searchInput = document.querySelector('.search-input');
    searchInput.addEventListener('input', searchEmployees);

    // Adicionar event listener para formatação de telefone no formulário de cadastro
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', () => formatPhone(phoneInput));
});
