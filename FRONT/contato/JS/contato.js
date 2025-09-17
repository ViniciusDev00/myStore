document.addEventListener('DOMContentLoaded', () => {
    // A API pública para onde o formulário enviará os dados.
    const API_URL = 'https://japauniverse.com.br/api/public';

    // Lógica do formulário de contato
    const form = document.getElementById('contactForm');
    if (form) {
        const formMessage = document.getElementById('form-message');

        form.addEventListener('submit', async function(e) {
            e.preventDefault(); // Previne o recarregamento da página

            // Pega os valores dos campos do formulário
            const nome = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const assunto = document.getElementById('subject').value;
            const mensagem = document.getElementById('message').value;

            // Monta o objeto de dados para enviar ao backend
            const formData = {
                nome,
                email,
                assunto,
                mensagem
            };

            // Exibe mensagem de "enviando"
            formMessage.textContent = 'Enviando sua mensagem...';
            formMessage.style.color = 'var(--text-secondary)';
            formMessage.style.backgroundColor = 'transparent';
            
            try {
                // --- AQUI ESTÁ A CORREÇÃO ---
                // Usa o axios para enviar os dados para o backend via POST
                await axios.post(`${API_URL}/contato`, formData);

                // Se a requisição for bem-sucedida, mostra mensagem de sucesso
                formMessage.textContent = 'Obrigado! Sua mensagem foi enviada com sucesso.';
                formMessage.style.color = '#fff';
                formMessage.style.backgroundColor = 'var(--primary)';
                form.reset(); // Limpa o formulário

                // Limpa a mensagem de sucesso após 5 segundos
                setTimeout(() => {
                    formMessage.textContent = '';
                    formMessage.style.backgroundColor = 'transparent';
                }, 5000);

            } catch (error) {
                // Se ocorrer um erro, mostra uma mensagem de falha
                console.error('Erro ao enviar mensagem:', error);
                formMessage.textContent = 'Ocorreu um erro ao enviar sua mensagem. Tente novamente.';
                formMessage.style.color = '#F44336'; // Cor de erro
                formMessage.style.backgroundColor = 'rgba(244, 67, 54, 0.1)';
            }
        });
    }

    // Lógica genérica do header e footer que pode ser mantida
    const header = document.querySelector('.main-header');
    if (header) {
        window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 50));
    }
    const yearEl = document.getElementById('currentYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
});
