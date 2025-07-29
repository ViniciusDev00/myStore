document.addEventListener('DOMContentLoaded', () => {

    // ===== DADOS GLOBAIS (Necessário para o carrinho no header) =====
    const productsData = [
        { id: 'p1', name: 'Asuna 2.0 “Black/White”', brand: 'Nike', price: 240.00, image: '../IMG/recentes/p1.webp' },
        // ... cole o resto da sua lista de produtos aqui para o carrinho funcionar corretamente
    ];

    // ===== LÓGICA GLOBAL (HEADER, MENU, CARRINHO) =====
    const header = document.querySelector('.main-header');
    if (header) {
        window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 50));
    }
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.main-nav .nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPage) link.classList.add('active');
    });
    const yearEl = document.getElementById('currentYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
    
    // Lógica do carrinho (essencial para o header)
    const cartCountEl = document.querySelector('.cart-count');
    const itemsInCart = JSON.parse(localStorage.getItem('tnDoJapaCart')) || [];
    const totalItems = itemsInCart.reduce((sum, item) => sum + item.quantity, 0);
    if(cartCountEl) cartCountEl.textContent = totalItems;


    // ===== LÓGICA ESPECÍFICA DO CONTATO =====
    const form = document.getElementById('contactForm');
    if (form) {
        const formMessage = document.getElementById('form-message');
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            formMessage.textContent = 'Enviando sua mensagem...';
            formMessage.style.color = 'var(--text-secondary)';
            formMessage.style.background = 'none';
            formMessage.style.border = 'none';

            setTimeout(() => {
                formMessage.textContent = 'Obrigado! Sua mensagem foi enviada com sucesso.';
                formMessage.style.color = '#fff';
                formMessage.style.backgroundColor = 'var(--primary)'; // Feedback visual forte
                formMessage.style.border = '1px solid var(--primary-light)';
                form.reset();
                setTimeout(() => {
                    formMessage.textContent = '';
                    formMessage.style.backgroundColor = 'transparent';
                    formMessage.style.border = 'none';
                }, 5000);
            }, 1500);
        });
    }
});