// URL base da API
const API_URL = 'http://localhost:3001';

// Estado da aplicação
let selectedService = null;
let selectedProfessional = null;
let selectedDate = null;
let selectedTime = null;
let clienteId = null; // Será preenchido quando o cliente for selecionado/logado

// Função para formatar data
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

// Função para atualizar o resumo do agendamento
function updateBookingSummary() {
    const summaryService = document.querySelector('.summary-value:nth-child(2)');
    const summaryProfessional = document.querySelector('.summary-value:nth-child(4)');
    const summaryDate = document.querySelector('.summary-value:nth-child(6)');
    const summaryTime = document.querySelector('.summary-value:nth-child(8)');
    const bookButton = document.querySelector('.book-button');

    summaryService.textContent = selectedService ? selectedService.name : '-';
    summaryProfessional.textContent = selectedProfessional ? selectedProfessional.name : '-';
    summaryDate.textContent = selectedDate ? new Date(selectedDate).toLocaleDateString() : '-';
    summaryTime.textContent = selectedTime || '-';

    // Habilita o botão apenas se todos os campos estiverem preenchidos
    bookButton.disabled = !(selectedService && selectedProfessional && selectedDate && selectedTime);
}

// Função para verificar disponibilidade de horários
async function checkAvailability(date, professionalId) {
    try {
        const response = await fetch(`${API_URL}/agendamentos?data=${date}&funcionarioId=${professionalId}`);
        const agendamentos = await response.json();
        
        // Criar mapa de horários ocupados
        const occupiedSlots = new Map();
        agendamentos.forEach(agendamento => {
            const startTime = agendamento.horario;
            const duration = agendamento.duracao;
            const startMinutes = timeToMinutes(startTime);
            
            for (let i = 0; i < duration; i += 30) {
                const timeSlot = minutesToTime(startMinutes + i);
                occupiedSlots.set(timeSlot, true);
            }
        });

        return occupiedSlots;
    } catch (error) {
        console.error('Erro ao verificar disponibilidade:', error);
        return new Map();
    }
}

// Função para converter horário em minutos
function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

// Função para converter minutos em horário
function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

// Função para gerar horários disponíveis
async function generateTimeSlots(date, professional) {
    const timeSlots = document.querySelector('.time-slots');
    timeSlots.innerHTML = '';
    
    if (!date || !professional) return;

    const occupiedSlots = await checkAvailability(date, professional._id);
    const startHour = 9; // 9:00
    const endHour = 20; // 20:00
    const interval = 30; // 30 minutos

    for (let hour = startHour; hour < endHour; hour++) {
        for (let minutes = 0; minutes < 60; minutes += interval) {
            const timeString = `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';
            
            // Verificar se o horário está ocupado
            if (occupiedSlots.has(timeString)) {
                timeSlot.classList.add('occupied');
                timeSlot.title = 'Horário não disponível';
            } else {
                timeSlot.addEventListener('click', () => {
                    document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                    timeSlot.classList.add('selected');
                    selectedTime = timeString;
                    updateBookingSummary();
                });
            }
            
            timeSlot.textContent = timeString;
            timeSlots.appendChild(timeSlot);
        }
    }
}

// Função para realizar o agendamento
async function bookAppointment() {
    if (!selectedService || !selectedProfessional || !selectedDate || !selectedTime || !clienteId) {
        alert('Por favor, preencha todos os campos');
        return;
    }

    const agendamento = {
        clienteId: clienteId,
        funcionarioId: selectedProfessional._id,
        servico: selectedService.name,
        data: selectedDate,
        horario: selectedTime,
        duracao: selectedService.duration
    };

    try {
        const response = await fetch(`${API_URL}/agendamentos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(agendamento)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao realizar agendamento');
        }

        const result = await response.json();
        alert('Agendamento realizado com sucesso!');
        
        // Limpar seleções
        selectedService = null;
        selectedProfessional = null;
        selectedDate = null;
        selectedTime = null;
        updateBookingSummary();
        
        // Recarregar horários disponíveis
        if (selectedDate && selectedProfessional) {
            generateTimeSlots(selectedDate, selectedProfessional);
        }
    } catch (error) {
        alert(error.message);
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Adicionar eventos aos serviços
    document.querySelectorAll('.service-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.service-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            
            const serviceName = option.querySelector('.service-name').textContent;
            const durationText = option.querySelector('.service-duration').textContent;
            const duration = parseInt(durationText);
            
            selectedService = { name: serviceName, duration };
            updateBookingSummary();
        });
    });

    // Adicionar eventos aos profissionais
    document.querySelectorAll('.professional-card').forEach(card => {
        card.addEventListener('click', async () => {
            document.querySelectorAll('.professional-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            
            selectedProfessional = {
                _id: card.dataset.id,
                name: card.querySelector('.professional-name').textContent
            };
            
            updateBookingSummary();
            
            if (selectedDate) {
                await generateTimeSlots(selectedDate, selectedProfessional);
            }
        });
    });

    // Configurar navegação do calendário
    const prevMonthButton = document.querySelector('.month-navigation button:first-child');
    const nextMonthButton = document.querySelector('.month-navigation button:last-child');
    const monthDisplay = document.querySelector('.month-navigation h2');

    let currentDate = new Date();

    function updateCalendar() {
        generateCalendar(currentDate);
        const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        monthDisplay.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }

    prevMonthButton.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        updateCalendar();
    });

    nextMonthButton.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        updateCalendar();
    });

    // Configurar botão de agendamento
    const bookButton = document.querySelector('.book-button');
    bookButton.addEventListener('click', bookAppointment);

    // Inicializar
    updateCalendar();
    updateBookingSummary();

    // Temporariamente, vamos definir um ID de cliente para teste
    // Em produção, isso viria do sistema de login
    clienteId = "um-id-de-cliente-valido";
});
