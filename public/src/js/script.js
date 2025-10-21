// --- DADOS DOS SERVIÇOS ---
const services = [
    {
        name: "Massagem Terapêutica",
        description: "Tratamento especializado para alívio de dores musculares, tensões e problemas posturais com técnicas avançadas.",
        price: "120",
        duration: "60 min",
        category: "Terapêutica",
        icon: "❤️"
    },
    {
        name: "Massagem Relaxante",
        description: "Experiência de relaxamento profundo para reduzir o estresse e promover o bem-estar mental e físico.",
        price: "100",
        duration: "50 min",
        category: "Relaxamento",
        icon: "✨"
    },
    {
        name: "Massagem Fit",
        description: "Ideal para atletas e praticantes de atividade física, focada na recuperação muscular e prevenção de lesões.",
        price: "130",
        duration: "60 min",
        category: "Esportiva",
        icon: "⚡"
    },
    {
        name: "Massagem Personalizada",
        description: "Tratamento sob medida, combinando diferentes técnicas de acordo com suas necessidades específicas.",
        price: "140",
        duration: "70 min",
        category: "Personalizada",
        icon: "👤"
    },
    {
        name: "Depilação",
        description: "Serviços completos de depilação com técnicas modernas e produtos de alta qualidade para sua comodidade.",
        price: "50",
        duration: "30 min",
        category: "Estética",
        icon: "✂️"
    },
    {
        name: "Liberação Miofascial",
        description: "Técnica especializada para liberação de tensões profundas na fáscia muscular, melhorando mobilidade e flexibilidade.",
        price: "150",
        duration: "60 min",
        category: "Terapêutica",
        icon: "🔥"
    },
    {
        name: "Reflexologia Podal",
        description: "Terapia através dos pés, estimulando pontos reflexos para promover equilíbrio e bem-estar em todo o corpo.",
        price: "90",
        duration: "45 min",
        category: "Terapêutica",
        icon: "🦶"
    },
    {
        name:"Avaliação da Profissional",
        description: "Ainda não sei bem qual o melhor no meu caso e gostaria de conversar e ter uma avaliação com a profissional",
        price: "50",
        duration: "20 min",
        category: "Avaliação",
        icon: "📰"
    }

];

// --- NOVO: CONFIGURAÇÃO CENTRAL DE HORÁRIOS ---
// Altere aqui para definir seus horários de trabalho
const scheduleConfig = {
    daysToShow: 7, // Quantos dias no futuro mostrar
    // Dias da semana: 0 = Domingo, 1 = Segunda, 2 = Terça, etc.
    // Domingo está ausente, então é um dia de folga.
    workingHours: {
        1: ["08:00", "10:00", "14:00", "16:00"], // Segunda
        2: ["08:00", "09:30", "14:00", "15:30", "17:00"], // Terça
        3: ["08:00", "10:00", "14:00", "16:00"], // Quarta
        4: ["08:00", "09:30", "14:00", "15:30", "17:00"], // Quinta
        5: ["08:00", "10:00", "14:00", "16:00"], // Sexta
        6: ["08:00", "10:00", "12:00"] // Sábado
    }
};

// --- ESTADO GLOBAL DO AGENDAMENTO ---
let appointmentState = {
    selectedService: null,
    selectedDate: null,
    selectedTime: null,
    dayOfWeek: null, // NOVO: para guardar o dia da semana
    clientName: null,
    clientPhone: null,
    clientMessage: null
};

// --- SELETORES DE ELEMENTOS (DOM) ---
const servicesGrid = document.getElementById('servicesGrid');
const serviceSelectionContainer = document.getElementById('service-selection-container');
const timeSelectionWrapper = document.getElementById('time-selection-wrapper');
const timeSlotsContainer = document.getElementById('timeSlotsContainer');
const timeSelectionSummary = document.getElementById('timeSelectionSummary');
const bookingSummary = document.getElementById('bookingSummary');
const confirmationDetails = document.getElementById('confirmationDetails');
const contactForm = document.getElementById('contactForm');
const whatsappBtn = document.getElementById('whatsappBtn');

// --- INICIALIZAÇÃO DA APLICAÇÃO ---
document.addEventListener('DOMContentLoaded', function() {
    renderServices();
    renderServiceSelectionRadios();
    setupEventListeners();
    setupPhoneMask();
    addScrollAnimations();
});

// --- RENDERIZAÇÃO DOS SERVIÇOS (VITRINE) ---
function renderServices() {
    servicesGrid.innerHTML = services.map(service => `
        <div class="card service-card">
            <div class="card-header">
                <div class="service-header">
                    <div class="service-icon">${service.icon}</div>
                    <div class="service-badge">${service.category}</div>
                </div>
                <h3 class="service-name">${service.name}</h3>
            </div>
            <div class="card-content">
                <p class="service-description">${service.description}</p>
                <div class="service-details">
                    <div class="service-duration"><span>⏰</span><span>${service.duration}</span></div>
                    <div class="service-price"><span>💰</span><span>R$ ${service.price}</span></div>
                </div>
                <button class="btn btn-primary" onclick="scrollToSection('appointment')" style="width: 100%;">Agendar</button>
            </div>
        </div>
    `).join('');
}

// --- RENDERIZA OS BOTÕES DE RÁDIO ---
function renderServiceSelectionRadios() {
    let servicesHtml = '<div class="radio-group">';
    services.forEach((service, index) => {
        const serviceId = `service-radio-${index}`;
        servicesHtml += `
            <div class="radio-option">
                <input type="radio" id="${serviceId}" name="selected_service" value="${service.name}">
                <label for="${serviceId}" class="radio-label">
                    <strong>${service.name}</strong>
                    <span>(${service.duration} - R$ ${service.price})</span>
                </label>
            </div>
        `;
    });
    servicesHtml += '</div>';
    serviceSelectionContainer.innerHTML += servicesHtml;

    const radioButtons = document.querySelectorAll('input[name="selected_service"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', (event) => {
            appointmentState.selectedService = event.target.value;
            timeSelectionWrapper.classList.remove('hidden');
            renderAvailableSlots(); // ATUALIZADO: Chama a nova função dinâmica
            resetTimeSelectionSummary();
        });
    });
}

// --- NOVO: FUNÇÕES AUXILIARES DE DATA ---

// Formata um objeto Date para "DD/MM/YYYY"
function formatDateToBrazilian(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mês é base 0
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Pega o nome do dia da semana a partir de um objeto Date
function getDayOfWeekName(date) {
    const days = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    return days[date.getDay()];
}

// --- NOVO: GERA OS HORÁRIOS DINAMICAMENTE ---
function generateAvailableSlots() {
    const availableSlots = [];
    const today = new Date();

    for (let i = 0; i < scheduleConfig.daysToShow; i++) {
        const currentDate = new Date();
        currentDate.setDate(today.getDate() + i);

        const dayOfWeek = currentDate.getDay(); // 0-6

        // Verifica se é um dia de trabalho configurado
        if (scheduleConfig.workingHours[dayOfWeek]) {
            const dateFormatted = formatDateToBrazilian(currentDate);
            const dayName = getDayOfWeekName(currentDate);

            // Adiciona os horários para este dia
            scheduleConfig.workingHours[dayOfWeek].forEach(time => {
                availableSlots.push({
                    date: dateFormatted,
                    time: time,
                    dayOfWeek: dayName
                });
            });
        }
    }
    return availableSlots;
}

// --- ATUALIZADO: RENDERIZA HORÁRIOS DISPONÍVEIS ---
function renderAvailableSlots() {
    timeSlotsContainer.innerHTML = '<!-- Carregando horários... -->';

    const slots = generateAvailableSlots();
    
    if (slots.length === 0) {
        timeSlotsContainer.innerHTML = '<p>Nenhum horário disponível nos próximos dias. Tente novamente mais tarde.</p>';
        return;
    }

    timeSlotsContainer.innerHTML = '';
    
    slots.forEach(slot => {
        const btn = document.createElement('button');
        btn.className = 'time-slot';
        // ATUALIZADO: Mostra o dia da semana e a data formatada
        btn.innerHTML = `<span>📅 ${slot.dayOfWeek}, ${slot.date}</span> <span>⏰ ${slot.time}</span>`;

        btn.onclick = (event) => {
            appointmentState.selectedDate = slot.date;
            appointmentState.selectedTime = slot.time;
            appointmentState.dayOfWeek = slot.dayOfWeek; // Guarda o dia da semana

            document.querySelectorAll('.time-slot').forEach(el => el.classList.remove('selected'));
            event.currentTarget.classList.add('selected');

            showTimeSelectionSummary();
        };
        timeSlotsContainer.appendChild(btn);
    });
}

// --- MOSTRAR RESUMO DA ETAPA 1 (ATUALIZADO) ---
function showTimeSelectionSummary() {
    timeSelectionSummary.innerHTML = `
        <div class="selection-details">
            <h4 style="margin-bottom: 16px;">Detalhes do Agendamento</h4>
            <div class="detail-row">
                <span class="detail-label">Serviço:</span>
                <span class="detail-value">${appointmentState.selectedService}</span>
            </div>
            <div class="detail-row">
                <span>📅</span>
                <span class="detail-label">Data:</span>
                <span class="detail-value">${appointmentState.dayOfWeek}, ${appointmentState.selectedDate}</span>
            </div>
            <div class="detail-row">
                <span>⏰</span>
                <span class="detail-label">Horário:</span>
                <span class="detail-value">${appointmentState.selectedTime}</span>
            </div>
        </div>
        <div style="margin-top: 16px;">
            <button class="btn btn-primary" onclick="proceedToContactForm()" style="width: 100%;">
                ✅ Prosseguir com Agendamento
            </button>
        </div>
    `;
}

function resetTimeSelectionSummary() {
     timeSelectionSummary.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">📅</div>
            <p>Selecione um horário disponível para continuar</p>
        </div>
    `;
}

// --- NAVEGAÇÃO ENTRE ETAPAS ---
window.proceedToContactForm = () => {
    showStep('contactStep');
    updateBookingSummary();
}
window.goBackToTimeSelection = () => {
    showStep('timeStep');
}
function showStep(stepId) {
    document.querySelectorAll('.appointment-step').forEach(step => step.classList.add('hidden'));
    const stepToShow = document.getElementById(stepId);
    stepToShow.classList.remove('hidden');
    stepToShow.classList.add('fade-in');
}

// --- ATUALIZAR RESUMO DA ETAPA 2 ---
function updateBookingSummary() {
    if (appointmentState.selectedDate && appointmentState.selectedTime) {
        bookingSummary.innerHTML = `
            <div class="detail-row">
                <span class="detail-label">Serviço:</span>
                <span class="detail-value">${appointmentState.selectedService}</span>
            </div>
            <div class="detail-row">
                <span>📅</span>
                <span class="detail-label">Data:</span>
                <span class="detail-value">${appointmentState.dayOfWeek}, ${appointmentState.selectedDate}</span>
            </div>
            <div class="detail-row">
                <span>⏰</span>
                <span class="detail-label">Horário:</span>
                <span class="detail-value">${appointmentState.selectedTime}</span>
            </div>
            <div class="detail-row">
                <span>👤</span>
                <span class="detail-label">Profissional:</span>
                <span class="detail-value">Neves Alves</span>
            </div>
        `;
    }
}

// --- CONFIGURAÇÃO DE EVENTOS (CHAMADA API) ---
function setupEventListeners() {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault(); 
        appointmentState.clientName = document.getElementById('clientName').value;
        appointmentState.clientPhone = document.getElementById('clientPhone').value;
        appointmentState.clientMessage = document.getElementById('clientMessage').value;
        
        if (!appointmentState.clientName || !appointmentState.clientPhone) {
            showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }
        
        const dadosCompletos = {
            nome: appointmentState.clientName,
            telefone: appointmentState.clientPhone,
            observacoes: appointmentState.clientMessage,
            // ATUALIZADO: envia a data formatada
            data: `${appointmentState.dayOfWeek}, ${appointmentState.selectedDate}`,
            hora: appointmentState.selectedTime,
            servico: appointmentState.selectedService
        };

        const submitButton = contactForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerText = 'Enviando...';

        try {
            const response = await fetch('/.netlify/functions/agendar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosCompletos),
            });
            const resultado = await response.json();
            if (response.ok) {
                showConfirmation();
            } else {
                showToast(`Erro: ${resultado.mensagem || 'Tente novamente.'}`, 'error');
            }
        } catch (error) {
            console.error('Erro de rede:', error);
            showToast('Erro de conexão. Tente novamente.', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.innerText = 'Finalizar Agendamento';
        }
    });
    
    whatsappBtn.addEventListener('click', function() {
        sendWhatsApp();
    });
}

// --- MOSTRAR CONFIRMAÇÃO (ETAPA 3) ---
function showConfirmation() {
    showStep('confirmationStep');
    confirmationDetails.innerHTML = `
        <div class="detail-row">
            <span class="detail-label">Serviço:</span>
            <span class="detail-value">${appointmentState.selectedService}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Nome:</span>
            <span class="detail-value">${appointmentState.clientName}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Data:</span>
            <span class="detail-value">${appointmentState.dayOfWeek}, ${appointmentState.selectedDate}</span> 
        </div>
        <div class="detail-row">
            <span class="detail-label">Horário:</span>
            <span class="detail-value">${appointmentState.selectedTime}</span>
        </div>
        ${appointmentState.clientMessage ? `
        <div class="detail-row">
            <span class="detail-label">Observações:</span>
            <span class="detail-value">${appointmentState.clientMessage}</span>
        </div>
        ` : ''}
    `;
    showToast('Agendamento confirmado com sucesso!', 'success');
}

// --- ENVIAR MENSAGEM WHATSAPP ---
function sendWhatsApp() {
    const message = `Olá! Gostaria de confirmar meu agendamento:

⭐ Serviço: ${appointmentState.selectedService}
👤 Nome: ${appointmentState.clientName}
📅 Data: ${appointmentState.dayOfWeek}, ${appointmentState.selectedDate}
⏰ Horário: ${appointmentState.selectedTime}
${appointmentState.clientMessage ? `📝 Observações: ${appointmentState.clientMessage}` : ''}

Aguardo a confirmação. Obrigado(a)!`;
    const whatsappUrl = `https://wa.me/5547988901715?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// --- RESETAR AGENDAMENTO ---
window.resetAppointment = () => {
    appointmentState = {
        selectedService: null, selectedDate: null, selectedTime: null, dayOfWeek: null,
        clientName: null, clientPhone: null, clientMessage: null
    };
    contactForm.reset();
    showStep('timeStep');
    const radioButtons = document.querySelectorAll('input[name="selected_service"]');
    radioButtons.forEach(radio => radio.checked = false);
    timeSelectionWrapper.classList.add('hidden');
    resetTimeSelectionSummary();
    document.querySelectorAll('.time-slot').forEach(slot => slot.classList.remove('selected'));
    showToast('Pronto para um novo agendamento!', 'info');
}

// --- MÁSCARA DE TELEFONE ---
function setupPhoneMask() {
    const phoneInput = document.getElementById('clientPhone');
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '').substring(0, 11);
        if (value.length >= 11) {
            value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (value.length >= 7) {
            value = value.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
        } else if (value.length >= 3) {
            value = value.replace(/(\d{2})(\d+)/, '($1) $2');
        }
        e.target.value = value;
    });
}

// --- FUNÇÕES UTILITÁRIAS ---
window.scrollToSection = (sectionId) => {
    document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth', block: 'start' });
}
window.openWhatsApp = (message = '') => {
    const defaultMessage = message || 'Olá! Gostaria de mais informações sobre os tratamentos.';
    const whatsappUrl = `https://wa.me/5547988901715?text=${encodeURIComponent(defaultMessage)}`;
    window.open(whatsappUrl, '_blank');
}
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastIcon = document.getElementById('toastIcon');
    const toastMessage = document.getElementById('toastMessage');
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    toastIcon.textContent = icons[type] || icons.success;
    toastMessage.textContent = message;
    toast.classList.remove('success', 'error', 'info');
    toast.classList.add(type);
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 5000);
}

// --- ANIMAÇÕES E SCROLL ---
function addScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) { entry.target.classList.add('fade-in'); }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.service-card, .contact-card, .cta-card').forEach(card => observer.observe(card));
}
document.addEventListener('click', function(e) {
    if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        scrollToSection(targetId);
    }
});
