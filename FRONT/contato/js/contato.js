document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://api.japauniverse.com.br/api/public';

    const form = document.getElementById('contactForm');
    if (form) {
        const formMessage = document.getElementById('form-message');

        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            const nome = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const assunto = document.getElementById('subject').value;
            const mensagem = document.getElementById('message').value;

            const formData = {
                nome,
                email,
                assunto,
                mensagem
            };

            formMessage.textContent = 'Enviando sua mensagem...';
            formMessage.style.color = 'var(--text-secondary)';
            formMessage.style.backgroundColor = 'transparent';
            
            try {
                await axios.post(`${API_URL}/contato`, formData);

                formMessage.textContent = 'Obrigado! Sua mensagem foi enviada com sucesso.';
                formMessage.style.color = '#fff';
                formMessage.style.backgroundColor = 'var(--primary)';
                form.reset();

                setTimeout(() => {
                    formMessage.textContent = '';
                    formMessage.style.backgroundColor = 'transparent';
                }, 5000);

            } catch (error) {
                console.error('Erro ao enviar mensagem:', error);
                formMessage.textContent = 'Ocorreu um erro ao enviar sua mensagem. Tente novamente.';
                formMessage.style.color = '#F44336';
                formMessage.style.backgroundColor = 'rgba(244, 67, 54, 0.1)';
            }
        });
    }

    const header = document.querySelector('.main-header');
    if (header) {
        window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 50));
    }
    const yearEl = document.getElementById('currentYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
});
