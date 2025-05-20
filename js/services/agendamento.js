// URL base da API
const API_URL = 'http://localhost:3001';

// Classe para gerenciar a comunicação com a API
class AgendamentoService {    constructor(baseUrl = 'http://localhost:3001') {
        this.baseUrl = baseUrl;
    }

    async fetchAgendamentos(data, funcionarioId = null) {
        let url = `${this.baseUrl}/agendamentos?data=${data}`;
        if (funcionarioId) {
            url += `&funcionarioId=${funcionarioId}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Erro ao buscar agendamentos');
        }
        return await response.json();
    }    async criarAgendamento(dados) {
        try {
            // Validar formato da data e hora antes de enviar
            if (!(dados.data && dados.horario)) {
                throw new Error('Data e horário são obrigatórios');
            }            // Validar formato do horário (HH:mm)
            if (!/^\d{2}:\d{2}$/.test(dados.horario)) {
                throw new Error('Horário deve estar no formato HH:mm');
            }

            // A data já deve estar no formato YYYY-MM-DD
            if (!/^\d{4}-\d{2}-\d{2}$/.test(dados.data)) {
                throw new Error('Data deve estar no formato YYYY-MM-DD');
            }

            const dadosValidados = {
                ...dados,
                data: dados.data,  // Manter a data exatamente como está
                duracao: parseInt(dados.duracao)          // Garantir que duração é número
            };

            const response = await fetch(`${this.baseUrl}/agendamentos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dadosValidados)
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || 'Erro ao criar agendamento. Status: ' + response.status);
            }

            return responseData;
        } catch (error) {
            console.error('Erro ao criar agendamento:', error);
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Erro de conexão com o servidor. Verifique sua conexão com a internet.');
            }
            throw error;
        }
    }

    async buscarCliente(clienteId) {
        const response = await fetch(`${this.baseUrl}/clientes/${clienteId}`);
        if (!response.ok) {
            throw new Error('Cliente não encontrado');
        }
        return await response.json();
    }

    async buscarFuncionarios() {
        const response = await fetch(`${this.baseUrl}/funcionarios`);
        if (!response.ok) {
            throw new Error('Erro ao buscar funcionários');
        }
        return await response.json();
    }    async verificarDisponibilidade(data, funcionarioId) {
        // Retorna um Set vazio, indicando que todos os horários estão disponíveis
        return new Set();
    }    async getHorariosDisponiveis(data, funcionarioId, duracaoServico) {
        try {
            const horarios = [];
            const inicioExpediente = 9; // 9:00
            const fimExpediente = 20; // 20:00
            const intervalo = 30; // 30 minutos
            
            for (let hora = inicioExpediente; hora < fimExpediente; hora++) {
                for (let minuto = 0; minuto < 60; minuto += intervalo) {
                    const horario = `${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`;
                    horarios.push(horario);
                }
            }
            
            return horarios;
        } catch (error) {
            console.error('Erro ao obter horários disponíveis:', error);
            throw error;
        }
    }

    minutosParaHorario(minutos) {
        const horas = Math.floor(minutos / 60);
        const mins = minutos % 60;
        return `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    }
}

// Classe para gerenciar o estado da aplicação
class AgendamentoState {
    constructor() {
        this.service = new AgendamentoService();
        this.selectedService = null;
        this.selectedProfessional = null;
        this.selectedDate = null;
        this.selectedTime = null;
        this.selectedClient = null;
        this.initialized = false;
    }

    isValid() {
        return this.selectedService && 
               this.selectedProfessional && 
               this.selectedDate && 
               this.selectedTime && 
               this.selectedClient;
    }    updateUI() {
        // Selecionar os elementos usando os elementos pai
        const summaryContainer = document.querySelector('.booking-summary');
        if (!summaryContainer) return;

        const summaryElements = summaryContainer.querySelectorAll('.summary-item');
        const summaryClient = summaryContainer.querySelector('.client-value');
        const summaryService = summaryElements[1]?.querySelector('.summary-value');
        const summaryProfessional = summaryElements[2]?.querySelector('.summary-value');
        const summaryDate = summaryElements[3]?.querySelector('.summary-value');
        const summaryTime = summaryElements[4]?.querySelector('.summary-value');
        const summaryTotal = summaryElements[5]?.querySelector('.summary-value');
        const bookButton = summaryContainer.querySelector('.book-button');

        // Atualizar os valores        
        if (summaryClient) summaryClient.textContent = this.selectedClient ? this.selectedClient.nome : '-';
        if (summaryService) summaryService.textContent = this.selectedService ? this.selectedService.name : '-';
        if (summaryProfessional) summaryProfessional.textContent = this.selectedProfessional ? this.selectedProfessional.name : '-';        if (summaryDate && this.selectedDate) {
            const dateParts = this.selectedDate.split('-').map(Number);
            // Criar a data no dia correto sem ajuste de timezone
            const localDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
            summaryDate.textContent = localDate.toLocaleDateString('pt-BR');
        } else if (summaryDate) {
            summaryDate.textContent = '-';
        }
        if (summaryTime) summaryTime.textContent = this.selectedTime || '-';
        if (summaryTotal) summaryTotal.textContent = this.selectedService ? `R$ ${this.selectedService.preco.toFixed(2)}` : 'R$ 0,00';

        // Habilitar/desabilitar o botão de agendamento
        if (bookButton) bookButton.disabled = !this.isValid();
    }    async createAppointment() {
        if (!this.isValid()) {
            throw new Error('Preencha todos os campos necessários');
        }

        // Extrai a duração do texto "XX min" para número
        const duracao = parseInt(this.selectedService.duration.toString().replace('min', ''));
        if (isNaN(duracao)) {
            throw new Error('Duração do serviço inválida');
        }

        const appointmentData = {
            clienteId: this.selectedClient._id,
            funcionarioId: this.selectedProfessional.id,
            servico: this.selectedService.name,
            data: this.selectedDate,
            horario: this.selectedTime,
            duracao: duracao
        };

        const response = await this.service.criarAgendamento(appointmentData);
        this.reset();
        return response;
    }

    reset() {
        this.selectedService = null;
        this.selectedProfessional = null;
        this.selectedDate = null;
        this.selectedTime = null;
        this.selectedClient = null;
        this.updateUI();
    }
}

// Inicialização
const state = new AgendamentoState();

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Setup dos event listeners
        setupServiceListeners();
        await setupProfessionalCards(); // Primeiro carrega os funcionários
        setupDateListeners();
        setupClientSearch();
        setupBookingButton();
        setupClientListeners();
        setupClientSearch();
        
        // Carregar profissionais
        await setupProfessionalCards();
    } catch (error) {
        console.error('Erro ao inicializar:', error);
    }
});

function setupServiceListeners() {
    document.querySelectorAll('.service-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.service-option').forEach(opt => 
                opt.classList.remove('selected'));
            option.classList.add('selected');

            const serviceName = option.querySelector('.service-name').textContent;
            const durationText = option.querySelector('.service-duration').textContent;
            const duration = parseInt(durationText.replace('min', '')); // Remove 'min' e converte para número
            const priceText = option.querySelector('.service-price').textContent;
            const preco = parseFloat(priceText.replace('R$ ', '').replace(',', '.'));

            console.log('Serviço selecionado:', {
                name: serviceName,
                duration: duration,
                preco: preco
            });

            state.selectedService = { 
                name: serviceName, 
                duration: duration, // Agora é um número puro
                preco: preco
            };
            
            state.selectedTime = null; // Reset time when service changes
            state.updateUI();

            // Update available time slots if we have a professional and date selected
            if (state.selectedProfessional && state.selectedDate) {
                updateAvailableTimeSlots();
            }
        });
    });
}

function setupProfessionalListeners() {
    document.querySelectorAll('.professional-card').forEach(card => {
        card.addEventListener('click', async () => {
            document.querySelectorAll('.professional-card').forEach(c => 
                c.classList.remove('selected'));
            card.classList.add('selected');

            state.selectedProfessional = {
                id: card.dataset.id,
                name: card.querySelector('.professional-name').textContent
            };
            state.updateUI();

            // Se tiver uma data selecionada, atualiza os horários disponíveis
            if (state.selectedDate) {
                await updateAvailableTimeSlots();
            }
        });
    });
}

async function setupProfessionalCards() {
    try {
        const response = await fetch(`${API_URL}/funcionarios`);
        if (!response.ok) {
            throw new Error('Erro ao buscar funcionários');
        }
        
        const funcionarios = await response.json();
        const cardsContainer = document.querySelector('.professional-cards');
        cardsContainer.innerHTML = ''; // Limpa o container

        funcionarios.forEach(funcionario => {
            const card = document.createElement('div');
            card.className = 'professional-card';
            card.dataset.id = funcionario._id;
              // Determina a imagem baseada na especialidade do funcionário
            let imagemSrc;            const especialidade = funcionario.especialidade.toLowerCase();
            const nome = funcionario.nome.toLowerCase();
              
            // Atribuição específica por nome para garantir a foto correta
            if (nome.includes('caroline')) {
                imagemSrc = 'assets/team-1.png';
            } else if (nome.includes('naire')) {
                imagemSrc = 'assets/team-3.png';            } else if (nome.includes('amanda')) {
                imagemSrc = 'assets/team-4.png';
            } else if (nome.includes('lenita')) {
                imagemSrc = 'assets/team-5.png';
            } else {
                // Imagem padrão caso não encontre correspondência
                imagemSrc = 'assets/default.png';
            }

            card.innerHTML = `
                <img src="${imagemSrc}" alt="${funcionario.nome}" class="professional-avatar">
                <div class="professional-name">${funcionario.nome}</div>
                <div class="professional-role">${funcionario.especialidade}</div>
            `;
            
            cardsContainer.appendChild(card);
        });

        // Reaplica os event listeners nos novos cards
        setupProfessionalListeners();
    } catch (error) {
        console.error('Erro ao carregar funcionários:', error);
        const cardContainer = document.querySelector('.professional-cards');
        if (cardContainer) {
            cardContainer.innerHTML = '<p class="error-message">Erro ao carregar funcionários. Por favor, recarregue a página.</p>';
        }
    }
}

function setupDateListeners() {
    const calendar = document.querySelector('.calendar');
    const today = new Date();
    
    calendar.addEventListener('click', async (event) => {
        const dayElement = event.target.closest('.calendar-day');
        if (!dayElement || dayElement.classList.contains('disabled')) return;

        document.querySelectorAll('.calendar-day').forEach(day => 
            day.classList.remove('selected'));
        dayElement.classList.add('selected');

        const day = parseInt(dayElement.textContent);
        const currentMonth = document.querySelector('.month-navigation h2').textContent;
        const [month, year] = currentMonth.split(' ');
        
        // Converter mês em português para número
        const months = {
            'Janeiro': 0, 'Fevereiro': 1, 'Março': 2, 'Abril': 3,
            'Maio': 4, 'Junho': 5, 'Julho': 6, 'Agosto': 7,
            'Setembro': 8, 'Outubro': 9, 'Novembro': 10, 'Dezembro': 11
        };

        // Criar a data mantendo o dia correto no fuso horário local        // Criar a data usando UTC para evitar problemas de fuso horário
        const date = new Date(Date.UTC(parseInt(year), months[month], day));
        const formattedDate = date.toISOString().split('T')[0];
        state.selectedDate = formattedDate;
        state.selectedTime = null;
        state.updateUI();

        if (state.selectedProfessional) {
            await updateAvailableTimeSlots();
        }
    });
}

function setupClientListeners() {
    document.querySelectorAll('.client-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.client-option').forEach(opt => 
                opt.classList.remove('selected'));
            option.classList.add('selected');

            const clientId = option.dataset.id;
            const clientName = option.querySelector('.client-name').textContent;

            state.selectedClient = { 
                _id: clientId,
                nome: clientName
            };
            
            state.updateUI();

            // Atualizar horários disponíveis em tempo real
            if (state.selectedProfessional && state.selectedDate) {
                updateAvailableTimeSlots();
            }
        });
    });
}

function setupClientSearch() {
    const searchInput = document.getElementById('client-search');
    const clientList = document.querySelector('.client-list');
    let debounceTimeout;

    if (!searchInput || !clientList) return;

    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(async () => {
            const query = searchInput.value.trim();
            
            if (query.length < 2) {
                clientList.style.display = 'none';
                return;
            }

            try {
                const response = await fetch(`${state.service.baseUrl}/clientes/search?q=${encodeURIComponent(query)}`);
                if (!response.ok) throw new Error('Erro ao buscar clientes');
                
                const clients = await response.json();
                
                clientList.innerHTML = '';
                clients.forEach(client => {
                    const item = document.createElement('div');
                    item.className = 'client-item';
                    item.innerHTML = `
                        <div class="client-name">${client.nome}</div>
                        <div class="client-info">${client.telefone}</div>
                    `;
                    
                    item.addEventListener('click', () => {
                        state.selectedClient = client;
                        searchInput.value = client.nome;
                        clientList.style.display = 'none';
                        state.updateUI();
                    });
                    
                    clientList.appendChild(item);
                });
                
                clientList.style.display = clients.length > 0 ? 'block' : 'none';
            } catch (error) {
                console.error('Erro ao buscar clientes:', error);
                clientList.style.display = 'none';
            }
        }, 300);
    });

    // Esconder a lista quando clicar fora
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !clientList.contains(e.target)) {
            clientList.style.display = 'none';
        }
    });

    // Mostrar a lista ao focar no input
    searchInput.addEventListener('focus', () => {
        if (searchInput.value.length >= 2) {
            clientList.style.display = 'block';
        }
    });
}

async function updateAvailableTimeSlots() {
    try {
        if (!state.selectedDate || !state.selectedProfessional || !state.selectedService) {
            return;
        }

        const horariosDisponiveis = await state.service.getHorariosDisponiveis(
            state.selectedDate,
            state.selectedProfessional.id,
            state.selectedService.duration
        );

        const timeSlots = document.querySelector('.time-slots');
        timeSlots.innerHTML = '';

        horariosDisponiveis.forEach(horario => {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';
            timeSlot.textContent = horario;
            timeSlot.addEventListener('click', () => {
                document.querySelectorAll('.time-slot').forEach(slot => 
                    slot.classList.remove('selected'));
                timeSlot.classList.add('selected');
                state.selectedTime = horario;
                state.updateUI();
            });

            timeSlots.appendChild(timeSlot);
        });
    } catch (error) {
        console.error('Erro ao atualizar horários:', error);
        alert('Erro ao carregar horários disponíveis. Por favor, tente novamente.');
    }
}

function setupBookingButton() {
    const bookButton = document.querySelector('.book-button');
    if (!bookButton) return;

    bookButton.addEventListener('click', async () => {
        if (!state.isValid()) {
            alert('Por favor, preencha todos os campos antes de confirmar o agendamento');
            return;
        }

        try {            const endTime = minutesToTime(timeToMinutes(state.selectedTime) + state.selectedService.duration);
            
            // Criar a data no dia correto sem ajuste de timezone
            const dateParts = state.selectedDate.split('-').map(Number);
            const localDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
            const formattedDate = localDate.toLocaleDateString('pt-BR');

            const confirmacao = await showConfirmDialog(
                'Confirmar Agendamento',
                `Cliente: ${state.selectedClient.nome}\n` +
                `Telefone: ${state.selectedClient.telefone}\n` +
                `Serviço: ${state.selectedService.name}\n` +
                `Profissional: ${state.selectedProfessional.name}\n` +
                `Data: ${formattedDate}\n` +
                `Horário: ${state.selectedTime} - ${endTime}\n` +
                `Valor: R$ ${state.selectedService.preco.toFixed(2)}`
            );

            if (confirmacao) {
                await state.createAppointment();
                alert('Agendamento realizado com sucesso!');
                await updateAvailableTimeSlots();
            }
        } catch (error) {
            console.error('Erro ao criar agendamento:', error);
            alert(error.message || 'Erro ao realizar agendamento. Por favor, tente novamente.');
        }
    });
}

// Funções auxiliares para feedback visual
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = 'background-color: #fee; color: #c00; padding: 10px; border-radius: 4px; margin: 10px 0; border: 1px solid #f88;';
    
    const container = document.querySelector('.booking-container') || document.body;
    container.insertBefore(errorDiv, container.firstChild);
    
    setTimeout(() => errorDiv.remove(), 5000);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    successDiv.style.cssText = 'background-color: #efe; color: #0a0; padding: 10px; border-radius: 4px; margin: 10px 0; border: 1px solid #8f8;';
    
    const container = document.querySelector('.booking-container') || document.body;
    container.insertBefore(successDiv, container.firstChild);
    
    setTimeout(() => successDiv.remove(), 5000);
}

function showConfirmDialog(title, message) {
    return new Promise((resolve) => {
        const dialog = document.createElement('div');
        dialog.className = 'confirm-dialog';
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 1000;
        `;
        
        dialog.innerHTML = `
            <h3 style="margin-bottom: 15px;">${title}</h3>
            <p style="white-space: pre-line; margin-bottom: 20px;">${message}</p>
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
                <button class="cancel-btn">Cancelar</button>
                <button class="confirm-btn" style="background: #4CAF50; color: white;">Confirmar</button>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        const backdrop = document.createElement('div');
        backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 999;
        `;
        document.body.appendChild(backdrop);
        
        function closeDialog(result) {
            dialog.remove();
            backdrop.remove();
            resolve(result);
        }
        
        dialog.querySelector('.confirm-btn').onclick = () => closeDialog(true);
        dialog.querySelector('.cancel-btn').onclick = () => closeDialog(false);
        backdrop.onclick = () => closeDialog(false);
    });
}

// Funções auxiliares
function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

function updateTimeSlotDisplay(occupiedSlots) {
    const timeSlots = document.querySelector('.time-slots');
    timeSlots.innerHTML = '';

    const startHour = 9; // 9:00
    const endHour = 20; // 20:00
    const interval = 30; // 30 minutos

    for (let hour = startHour; hour < endHour; hour++) {
        for (let minutes = 0; minutes < 60; minutes += interval) {
            const timeString = `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';
            
        
                timeSlot.addEventListener('click', () => {
                    document.querySelectorAll('.time-slot').forEach(slot => 
                        slot.classList.remove('selected'));
                    timeSlot.classList.add('selected');
                    state.selectedTime = timeString;
                    state.updateUI();
                });
            
            timeSlot.textContent = timeString;
            timeSlots.appendChild(timeSlot);
        }
    }
}

// Função para gerar o calendário
function generateCalendar(currentDate) {
    const calendar = document.querySelector('.calendar');
    calendar.innerHTML = '';

    // Adicionar cabeçalhos dos dias da semana
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    weekDays.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-header';
        dayHeader.textContent = day;
        calendar.appendChild(dayHeader);
    });

    // Configurar primeiro dia do mês
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const startingDay = firstDay.getDay();

    // Adicionar espaços vazios até o primeiro dia do mês
    for (let i = 0; i < startingDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day';
        calendar.appendChild(emptyDay);
    }

    // Obter último dia do mês
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const today = new Date();

    // Adicionar dias do mês
    for (let day = 1; day <= lastDay; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;

        // Verificar se o dia está no passado
        const currentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        if (currentDay < today) {
            dayElement.classList.add('disabled');
        }

        calendar.appendChild(dayElement);
    }

    // Atualizar título do mês
    const monthDisplay = document.querySelector('.month-navigation h2');
    const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    monthDisplay.textContent = `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
}

// Adicionar navegação do calendário
document.addEventListener('DOMContentLoaded', () => {
    const currentDate = new Date();
    const prevButton = document.querySelector('.month-navigation button:first-child');
    const nextButton = document.querySelector('.month-navigation button:last-child');

    generateCalendar(currentDate);

    prevButton.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        generateCalendar(currentDate);
    });

    nextButton.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        generateCalendar(currentDate);
    });
});
