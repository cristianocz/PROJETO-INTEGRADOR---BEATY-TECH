// URL base da API
const API_URL = 'http://localhost:3000';

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
    tbody.innerHTML = '';

    employees.forEach(employee => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${employee.nome}</td>
            <td>${employee.especialidade}</td>
            <td>${employee.telefone}</td>
            <td>${employee.email}</td>
            <td>
                <div class="action-buttons">
                    <button class="button button-secondary" onclick="editEmployee('${employee._id}')">
                        <span class="material-icons">edit</span>
                    </button>
                    <button class="button button-secondary" onclick="deleteEmployee('${employee._id}')">
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

    const formData = {
        nome: document.getElementById('name').value,
        especialidade: document.getElementById('position').value,
        telefone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        disponivel: true
    };

    try {
        const response = await fetch(`${API_URL}/funcionarios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao cadastrar funcionário');
        }

        alert('Funcionário cadastrado com sucesso!');
        document.getElementById('employee-form').reset();
        loadEmployees(); // Recarrega a lista de funcionários
    } catch (error) {
        console.error('Erro ao cadastrar funcionário:', error);
        alert(error.message || 'Erro ao cadastrar funcionário. Por favor, tente novamente.');
    }
}

// Função para editar um funcionário
async function editEmployee(id) {
    try {
        // Aqui você pode implementar a lógica de edição
        // Por exemplo, abrir um modal com os dados do funcionário
        alert('Funcionalidade de edição será implementada em breve.');
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
});
