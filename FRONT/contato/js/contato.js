document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:8080/api/public'; // Verifique se a URL está correta para seu backend

    const form = document.getElementById('contactForm');
    const modalOverlay = document.getElementById('successModal');
    const closeModalBtn = document.getElementById('closeModalBtn');

    // --- Funções do Modal ---
    function openModal() {
        if (modalOverlay) modalOverlay.classList.add('active');
    }

    function closeModal() {
        if (modalOverlay) modalOverlay.classList.remove('active');
    }

    // Fechar no botão
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

    // Fechar clicando fora
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }

    // --- Envio do Formulário ---
    if (form) {
        const formMessage = document.getElementById('form-message'); 

        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Botão em estado de carregamento
            const submitBtn = document.getElementById('btn-submit');
            const originalText = submitBtn ? submitBtn.innerText : 'Enviar';
            if(submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            }

            // Dados
            const formData = {
                nome: document.getElementById('name').value,
                email: document.getElementById('email').value,
                assunto: document.getElementById('subject').value,
                mensagem: document.getElementById('message').value
            };

            // Limpa erros anteriores
            if(formMessage) {
                formMessage.textContent = '';
                formMessage.style.backgroundColor = 'transparent';
            }
            
            try {
                await axios.post(`${API_URL}/contato`, formData);

                // SUCESSO: Limpa e Abre Modal
                form.reset();
                openModal();

            } catch (error) {
                console.error('Erro ao enviar mensagem:', error);
                
                // ERRO: Mostra mensagem discreta abaixo do botão
                if(formMessage) {
                    formMessage.textContent = 'Erro ao enviar. Verifique sua conexão.';
                    formMessage.style.color = '#ff4444';
                }
            } finally {
                // Restaura botão
                if(submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerText = originalText;
                }
            }
        });
    }

    // Header Scroll Effect
    const header = document.querySelector('.main-header');
    if (header) {
        window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 50));
    }
    const yearEl = document.getElementById('currentYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
});