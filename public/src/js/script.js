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
// --- CONFIGURAÇÃO CENTRAL DE HORÁRIOS ---
const scheduleConfig = {
    daysToShow: 7,
    workingHours: {
        1: ["08:00", "10:00", "14:00", "16:00"], 2: ["08:00", "09:30", "14:00", "15:30", "17:00"],
        3: ["08:00", "10:00", "14:00", "16:00"], 4: ["08:00", "09:30", "14:00", "15:30", "17:00"],
        5: ["08:00", "10:00", "14:00", "16:00"], 6: ["08:00", "10:00", "12:00"]
    }
};

// --- ESTADO GLOBAL ---
let appointmentState = { selectedService: null, selectedDate: null, selectedTime: null, dayOfWeek: null, clientName: null, clientPhone: null, clientMessage: null };

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

// --- INICIALIZAÇÃO ---
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
                <div class="service-header"><div class="service-icon">${service.icon}</div><div class="service-badge">${service.category}</div></div>
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

// --- ATUALIZADO: RENDERIZA OS RÁDIOS COM NOVO DESIGN ---
function renderServiceSelectionRadios() {
    let servicesHtml = '<div class="radio-group">';
    services.forEach((service, index) => {
        const serviceId = `service-radio-${index}`;
        servicesHtml += `
            <div class="radio-option">
                <input type="radio" id="${serviceId}" name="selected_service" value="${service.name}">
                <label for="${serviceId}" class="service-radio-card">
                    <span class="icon">${service.icon}</span>
                    <div class="details">
                        <strong>${service.name}</strong>
                        <span>${service.duration} - R$ ${service.price}</span>
                    </div>
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
            renderAvailableSlots();
            resetTimeSelectionSummary();
        });
    });
}

// --- FUNÇÕES DE DATA ---
function formatDateToBrazilian(date) { const d = String(date.getDate()).padStart(2, '0'), m = String(date.getMonth() + 1).padStart(2, '0'), y = date.getFullYear(); return `${d}/${m}/${y}`; }
function getDayOfWeekName(date) { return ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"][date.getDay()]; }

// --- GERA HORÁRIOS DISPONÍVEIS ---
function generateAvailableSlots() {
    const slots = [];
    const today = new Date();
    for (let i = 0; i < scheduleConfig.daysToShow; i++) {
        const currentDate = new Date();
        currentDate.setDate(today.getDate() + i);
        const dayOfWeek = currentDate.getDay();
        if (scheduleConfig.workingHours[dayOfWeek]) {
            const dateFormatted = formatDateToBrazilian(currentDate);
            const dayName = getDayOfWeekName(currentDate);
            scheduleConfig.workingHours[dayOfWeek].forEach(time => {
                slots.push({ date: dateFormatted, time: time, dayOfWeek: dayName });
            });
        }
    }
    return slots;
}

// --- ATUALIZADO: RENDERIZA HORÁRIOS AGRUPADOS POR DIA ---
function renderAvailableSlots() {
    timeSlotsContainer.innerHTML = '<!-- Carregando horários... -->';
    const slots = generateAvailableSlots();
    
    if (slots.length === 0) {
        timeSlotsContainer.innerHTML = '<p>Nenhum horário disponível.</p>';
        return;
    }

    // 1. Agrupar horários por data
    const groupedSlots = slots.reduce((acc, slot) => {
        const key = `${slot.dayOfWeek}, ${slot.date}`;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(slot.time);
        return acc;
    }, {});

    // 2. Renderizar os grupos
    let finalHtml = '';
    for (const dateKey in groupedSlots) {
        finalHtml += `<div class="day-group">`;
        finalHtml += `<h5 class="day-group-header">${dateKey}</h5>`;
        finalHtml += `<div class="time-slots-grid">`;
        
        const times = groupedSlots[dateKey];
        times.forEach(time => {
            // Criamos um data-attribute para guardar os dados
            finalHtml += `<button class="time-slot" data-date="${dateKey.split(', ')[1]}" data-time="${time}" data-dayofweek="${dateKey.split(', ')[0]}">${time}</button>`;
        });

        finalHtml += `</div></div>`;
    }
    
    timeSlotsContainer.innerHTML = finalHtml;

    // 3. Adicionar eventos de clique aos novos botões
    document.querySelectorAll('.time-slot').forEach(button => {
        button.addEventListener('click', (event) => {
            const target = event.currentTarget;
            appointmentState.selectedDate = target.dataset.date;
            appointmentState.selectedTime = target.dataset.time;
            appointmentState.dayOfWeek = target.dataset.dayofweek;

            document.querySelectorAll('.time-slot').forEach(el => el.classList.remove('selected'));
            target.classList.add('selected');

            showTimeSelectionSummary();
        });
    });
}

// --- MOSTRAR E LIMPAR RESUMO DA ETAPA 1 ---
function showTimeSelectionSummary() {
    timeSelectionSummary.innerHTML = `
        <div class="selection-details">
            <h4 style="margin-bottom: 16px;">Sua Seleção</h4>
            <div class="detail-row">...</div>
            <div class="detail-row">
                <span>📅</span><span class="detail-label">Data:</span><span class="detail-value">${appointmentState.dayOfWeek}, ${appointmentState.selectedDate}</span>
            </div>
            <div class="detail-row">
                <span>⏰</span><span class="detail-label">Horário:</span><span class="detail-value">${appointmentState.selectedTime}</span>
            </div>
        </div>
        <div style="margin-top: 16px;">
            <button class="btn btn-primary" onclick="proceedToContactForm()" style="width: 100%;">✅ Prosseguir</button>
        </div>
    `;
    // Preenche o serviço dinamicamente
    const serviceDetailRow = `<div class="detail-row"><span class="detail-label">Serviço:</span><span class="detail-value">${appointmentState.selectedService}</span></div>`;
    timeSelectionSummary.querySelector('.selection-details .detail-row').outerHTML = serviceDetailRow;
}

function resetTimeSelectionSummary() {
    timeSelectionSummary.innerHTML = `<div class="empty-state"><div class="empty-icon">📅</div><p>Selecione um horário</p></div>`;
}

// --- NAVEGAÇÃO, FORMULÁRIO, CONFIRMAÇÃO, WHATSAPP, RESET, MÁSCARA, UTILITÁRIOS, ANIMAÇÕES ---
// (O resto do seu código a partir daqui pode continuar o mesmo, pois a lógica de estado não mudou)
// (Colei por completo abaixo para garantir)

window.proceedToContactForm = () => { showStep('contactStep'); updateBookingSummary(); }
window.goBackToTimeSelection = () => { showStep('timeStep'); }
function showStep(stepId) { document.querySelectorAll('.appointment-step').forEach(s => s.classList.add('hidden')); const step = document.getElementById(stepId); step.classList.remove('hidden'); step.classList.add('fade-in'); }

function updateBookingSummary() {
    bookingSummary.innerHTML = `
        <div class="detail-row"><span class="detail-label">Serviço:</span><span class="detail-value">${appointmentState.selectedService}</span></div>
        <div class="detail-row"><span>📅</span><span class="detail-label">Data:</span><span class="detail-value">${appointmentState.dayOfWeek}, ${appointmentState.selectedDate}</span></div>
        <div class="detail-row"><span>⏰</span><span class="detail-label">Horário:</span><span class="detail-value">${appointmentState.selectedTime}</span></div>
        <div class="detail-row"><span>👤</span><span class="detail-label">Profissional:</span><span class="detail-value">Neves Alves</span></div>`;
}

function setupEventListeners() {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        appointmentState.clientName = document.getElementById('clientName').value;
        appointmentState.clientPhone = document.getElementById('clientPhone').value;
        appointmentState.clientMessage = document.getElementById('clientMessage').value;
        if (!appointmentState.clientName || !appointmentState.clientPhone) { showToast('Preencha os campos obrigatórios.', 'error'); return; }
        const dadosCompletos = { nome: appointmentState.clientName, telefone: appointmentState.clientPhone, observacoes: appointmentState.clientMessage, data: `${appointmentState.dayOfWeek}, ${appointmentState.selectedDate}`, hora: appointmentState.selectedTime, servico: appointmentState.selectedService };
        const submitButton = contactForm.querySelector('button[type="submit"]');
        submitButton.disabled = true; submitButton.innerText = 'Enviando...';
        try {
            const response = await fetch('/.netlify/functions/agendar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dadosCompletos) });
            const resultado = await response.json();
            if (response.ok) { showConfirmation(); } else { showToast(`Erro: ${resultado.mensagem || 'Tente novamente.'}`, 'error'); }
        } catch (error) { console.error('Erro de rede:', error); showToast('Erro de conexão.', 'error'); } finally { submitButton.disabled = false; submitButton.innerText = 'Finalizar Agendamento'; }
    });
    whatsappBtn.addEventListener('click', () => sendWhatsApp());
}

function showConfirmation() {
    showStep('confirmationStep');
    confirmationDetails.innerHTML = `
        <div class="detail-row"><span class="detail-label">Serviço:</span><span class="detail-value">${appointmentState.selectedService}</span></div>
        <div class="detail-row"><span class="detail-label">Nome:</span><span class="detail-value">${appointmentState.clientName}</span></div>
        <div class="detail-row"><span class="detail-label">Data:</span><span class="detail-value">${appointmentState.dayOfWeek}, ${appointmentState.selectedDate}</span></div>
        <div class="detail-row"><span class="detail-label">Horário:</span><span class="detail-value">${appointmentState.selectedTime}</span></div>
        ${appointmentState.clientMessage ? `<div class="detail-row"><span class="detail-label">Observações:</span><span class="detail-value">${appointmentState.clientMessage}</span></div>` : ''}`;
    showToast('Agendamento confirmado!', 'success');
}

function sendWhatsApp() {
    const message = `Olá! Confirmação de agendamento:\n\n⭐ Serviço: ${appointmentState.selectedService}\n👤 Nome: ${appointmentState.clientName}\n📅 Data: ${appointmentState.dayOfWeek}, ${appointmentState.selectedDate}\n⏰ Horário: ${appointmentState.selectedTime}\n\n${appointmentState.clientMessage ? `📝 Obs: ${appointmentState.clientMessage}` : ''}Obrigado(a)!`;
    const whatsappUrl = `https://wa.me/5547988901715?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

window.resetAppointment = () => {
    appointmentState = { selectedService: null, selectedDate: null, selectedTime: null, dayOfWeek: null, clientName: null, clientPhone: null, clientMessage: null };
    contactForm.reset(); showStep('timeStep');
    document.querySelectorAll('input[name="selected_service"]').forEach(radio => radio.checked = false);
    timeSelectionWrapper.classList.add('hidden');
    resetTimeSelectionSummary();
    document.querySelectorAll('.time-slot').forEach(slot => slot.classList.remove('selected'));
    showToast('Pronto para um novo agendamento!', 'info');
}

function setupPhoneMask() {
    const phoneInput = document.getElementById('clientPhone');
    phoneInput.addEventListener('input', e => {
        let v = e.target.value.replace(/\D/g, '').substring(0, 11);
        if (v.length >= 11) { v = v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3'); }
        else if (v.length >= 7) { v = v.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3'); }
        else if (v.length >= 3) { v = v.replace(/(\d{2})(\d+)/, '($1) $2'); }
        e.target.value = v;
    });
}

window.scrollToSection = id => document.getElementById(id).scrollIntoView({ behavior: 'smooth', block: 'start' });
window.openWhatsApp = (msg = '') => { const txt = msg || 'Olá! Gostaria de mais informações.'; window.open(`https://wa.me/5547988901715?text=${encodeURIComponent(txt)}`, '_blank'); }
function showToast(message, type = 'success') {
    const t = document.getElementById('toast'), ti = document.getElementById('toastIcon'), tm = document.getElementById('toastMessage');
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    ti.textContent = icons[type] || '✅'; tm.textContent = message;
    t.className = 'toast show ' + type;
    setTimeout(() => { t.classList.remove('show'); }, 5000);
}

function addScrollAnimations() {
    const obs = new IntersectionObserver(e => e.forEach(i => { if (i.isIntersecting) i.target.classList.add('fade-in'); }), { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.service-card, .contact-card, .cta-card').forEach(c => obs.observe(c));
}
document.addEventListener('click', e => { if (e.target.matches('a[href^="#"]')) { e.preventDefault(); scrollToSection(e.target.getAttribute('href').substring(1)); } });

