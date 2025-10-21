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
    }
];

// --- ESTADO GLOBAL DO AGENDAMENTO ---
// Armazena as seleções do usuário
let appointmentState = {
    selectedService: null,
    selectedDate: null, // Mudamos de 'Day' (dia da semana) para 'Date' (data real)
    selectedTime: null,
    clientName: null,
    clientPhone: null,
    clientMessage: null
};

// --- SELETORES DE ELEMENTOS (DOM) ---
const servicesGrid = document.getElementById('servicesGrid');
const timeSlotsContainer = document.getElementById('timeSlotsContainer');
const timeSelectionSummary = document.getElementById('timeSelectionSummary');
const bookingSummary = document.getElementById('bookingSummary');
const confirmationDetails = document.getElementById('confirmationDetails');
const contactForm = document.getElementById('contactForm');
const whatsappBtn = document.getElementById('whatsappBtn');

// --- INICIALIZAÇÃO DA APLICAÇÃO ---
document.addEventListener('DOMContentLoaded', function() {
    renderServices();
    renderFakeTimeSlots(); // ATUALIZADO: Usamos horários "fake" por enquanto
    setupEventListeners();
    setupPhoneMask();
    addScrollAnimations();
});

// --- RENDERIZAÇÃO DOS SERVIÇOS ---
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
                    <div class="service-duration">
                        <span>⏰</span>
                        <span>${service.duration}</span>
                    </div>
                    <div class="service-price">
                        <span>💰</span>
                        <span>R$ ${service.price}</span>
                    </div>
                </div>
                <button class="btn btn-primary" onclick="selectService('${service.name}')" style="width: 100%;">
                    Agendar ${service.name}
                </button>
            </div>
        </div>
    `).join('');
}

// --- FUNÇÃO DE SELEÇÃO DE SERVIÇO (NOVA) ---
// Chamada pelo 'onclick' do botão do serviço
window.selectService = (serviceName) => {
    appointmentState.selectedService = serviceName;
    showToast(`Serviço selecionado: ${serviceName}`, 'info');
    scrollToSection('appointment');
    // No futuro, podemos recarregar os horários aqui
};

// --- RENDERIZAÇÃO DOS HORÁRIOS (ATUALIZADO) ---
// Esta função é TEMPORÁRIA. Ela simula horários reais.
// O próximo passo será carregar isso da planilha.
function renderFakeTimeSlots() {
    timeSlotsContainer.innerHTML = ''; // Limpa

    // Horários de exemplo (com datas reais)
    const horariosFalsos = [
        { data: '2025-10-28', hora: '09:00' },
        { data: '2025-10-28', hora: '10:00' },
        { data: '2025-10-29', hora: '14:00' },
        { data: '2025-10-29', hora: '15:00' },
    ];

    horariosFalsos.forEach(horario => {
        const btn = document.createElement('button');
        btn.className = 'time-slot'; // Usando sua classe CSS
        btn.innerHTML = `<span>📅 ${horario.data}</span> <span>⏰ ${horario.hora}</span>`;

        // Lógica de clique movida para cá
        btn.onclick = (event) => {
            // 1. Verifica se um serviço foi selecionado
            if (!appointmentState.selectedService) {
                showToast('Por favor, selecione um serviço primeiro!', 'error');
                scrollToSection('services');
                return;
            }

            // 2. Atualiza o estado
            appointmentState.selectedDate = horario.data;
            appointmentState.selectedTime = horario.hora;

            // 3. Atualiza a UI (marca como selecionado)
            document.querySelectorAll('.time-slot').forEach(slot => {
                slot.classList.remove('selected');
            });
            event.currentTarget.classList.add('selected');

            // 4. Mostra o resumo da Etapa 1
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
                <span class="detail-value">${appointmentState.selectedDate}</span>
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

// --- NAVEGAÇÃO ENTRE ETAPAS ---

// (ETAPA 1 -> ETAPA 2)
window.proceedToContactForm = () => {
    showStep('contactStep');
    updateBookingSummary();
}

// (ETAPA 2 -> ETAPA 1)
window.goBackToTimeSelection = () => {
    showStep('timeStep');
}

// Função principal de navegação
function showStep(stepId) {
    document.querySelectorAll('.appointment-step').forEach(step => {
        step.classList.add('hidden');
    });
    const stepToShow = document.getElementById(stepId)
    stepToShow.classList.remove('hidden');
    
    // Adiciona animação (do seu código original)
    stepToShow.classList.add('fade-in');
}

// --- ATUALIZAR RESUMO DA ETAPA 2 (ATUALIZADO) ---
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
                <span class="detail-value">${appointmentState.selectedDate}</span>
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

// --- CONFIGURAÇÃO DE EVENTOS (ATUALIZADO COM API) ---
function setupEventListeners() {
    
    // Evento de envio do formulário (ETAPA 2)
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault(); // Impede o recarregamento
        
        // 1. Coleta dados do formulário
        appointmentState.clientName = document.getElementById('clientName').value;
        appointmentState.clientPhone = document.getElementById('clientPhone').value;
        appointmentState.clientMessage = document.getElementById('clientMessage').value;
        
        // 2. Validação simples
        if (!appointmentState.clientName || !appointmentState.clientPhone) {
            showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }
        
        // 3. Prepara dados para a API
        const dadosCompletos = {
            nome: appointmentState.clientName,
            telefone: appointmentState.clientPhone,
            observacoes: appointmentState.clientMessage,
            data: appointmentState.selectedDate,
            hora: appointmentState.selectedTime,
            servico: appointmentState.selectedService
        };

        // Feedback visual no botão
        const submitButton = contactForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerText = 'Enviando...';

        try {
            // 4. CHAMA A API (Netlify Function)
            const response = await fetch('/.netlify/functions/agendar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosCompletos),
            });

            const resultado = await response.json();

            if (response.ok) {
                // 5. SUCESSO: Mostra a confirmação (ETAPA 3)
                showConfirmation();
            } else {
                // 6. ERRO: Mostra toast de erro
                showToast(`Erro: ${resultado.mensagem || 'Tente novamente.'}`, 'error');
            }

        } catch (error) {
            // 7. ERRO DE REDE
            console.error('Erro de rede:', error);
            showToast('Erro de conexão. Tente novamente.', 'error');
        } finally {
            // 8. Reabilita o botão
            submitButton.disabled = false;
            submitButton.innerText = 'Finalizar Agendamento';
        }
    });
    
    // Botão do WhatsApp (ETAPA 3)
    whatsappBtn.addEventListener('click', function() {
        sendWhatsApp();
    });
}

// --- MOSTRAR CONFIRMAÇÃO (ETAPA 3) (ATUALIZADO) ---
function showConfirmation() {
    showStep('confirmationStep');
    
    // ATUALIZADO: usa 'selectedDate'
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
            <span class="detail-value">${appointmentState.selectedDate}</span> 
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

// --- ENVIAR MENSAGEM WHATSAPP (ATUALIZADO) ---
function sendWhatsApp() {
    // ATUALIZADO: usa 'selectedDate' e 'selectedService'
    const message = `Olá! Gostaria de confirmar meu agendamento:

⭐ Serviço: ${appointmentState.selectedService}
👤 Nome: ${appointmentState.clientName}
📅 Data: ${appointmentState.selectedDate}
⏰ Horário: ${appointmentState.selectedTime}

${appointmentState.clientMessage ? `📝 Observações: ${appointmentState.clientMessage}` : ''}

Aguardo a confirmação. Obrigado(a)!`;
    
    const whatsappUrl = `https://wa.me/5547988901715?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// --- RESETAR AGENDAMENTO ---
window.resetAppointment = () => {
    appointmentState = {
        selectedService: null,
        selectedDate: null,
        selectedTime: null,
        clientName: null,
        clientPhone: null,
        clientMessage: null
    };
    
    contactForm.reset();
    showStep('timeStep');
    
    // Limpa o resumo da Etapa 1
    timeSelectionSummary.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">📅</div>
            <p>Selecione um horário disponível para continuar</p>
        </div>
    `;
    // Limpa os botões selecionados
     document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });

    showToast('Pronto para um novo agendamento!', 'info');
}

// --- MÁSCARA DE TELEFONE ---
function setupPhoneMask() {
    const phoneInput = document.getElementById('clientPhone');
    
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        value = value.substring(0, 11); // Limita a 11 dígitos (DDD + 9 + 8 dígitos)
        
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

// Scroll suave (chamada pelo HTML)
window.scrollToSection = (sectionId) => {
    document.getElementById(sectionId).scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// Abrir WhatsApp (chamada pelo HTML)
window.openWhatsApp = (message = '') => {
    const defaultMessage = message || 'Olá! Gostaria de mais informações sobre os tratamentos.';
    const whatsappUrl = `https://wa.me/5547988901715?text=${encodeURIComponent(defaultMessage)}`;
    window.open(whatsappUrl, '_blank');
}

// Mostrar notificação (Toast)
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastIcon = document.getElementById('toastIcon');
    const toastMessage = document.getElementById('toastMessage');
    
    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️'
    };
    
    toastIcon.textContent = icons[type] || icons.success;
    toastMessage.textContent = message;
    
    toast.classList.remove('success', 'error', 'info');
    toast.classList.add(type);
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 5000);
}

// --- ANIMAÇÕES DE SCROLL ---
function addScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    document.querySelectorAll('.service-card, .contact-card, .cta-card').forEach(card => {
        observer.observe(card);
    });
}

// Scroll suave para links internos (do seu código original)
document.addEventListener('click', function(e) {
    if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        scrollToSection(targetId);
    }
});