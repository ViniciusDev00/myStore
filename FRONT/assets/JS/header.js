// Arquivo: FRONT/assets/JS/header.js
document.addEventListener('DOMContentLoaded', () => {
    const headerElement = document.querySelector('header.main-header');
    if (!headerElement) return;

    // Esta função decodifica o payload do Token JWT
    const parseJwt = (token) => {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return null;
        }
    };

    const token = localStorage.getItem('jwtToken');
    const userData = token ? parseJwt(token) : null; // Decodifica o token para pegar os dados
    const isLoggedIn = userData !== null;
    const basePath = headerElement.dataset.basepath || '.';

    // O HTML base do header continua o mesmo
    headerElement.innerHTML = `
        <div class="container">
            <button class="mobile-nav-toggle" aria-controls="main-nav" aria-expanded="false">
                <span class="sr-only">Menu</span>
                <div class="hamburger-icon"></div>
            </button>
            <a href="${basePath}/inicio/HTML/index.html" class="logo">Japa<span> Universe</span></a>
            <nav class="main-nav" id="main-nav">
                <ul class="nav-list">
                    <li><a href="${basePath}/inicio/HTML/index.html" class="nav-link">Início</a></li>
                    <li><a href="${basePath}/catalogo/HTML/catalogo.html" class="nav-link">Catálogo</a></li>
                    <li><a href="${basePath}/contato/HTML/contato.html" class="nav-link">Contato</a></li>
                </ul>
            </nav>
            <div class="header-actions" id="header-actions"></div>
        </div>
    `;

    const headerActions = document.getElementById('header-actions');
    let actionsHTML = `
        <button class="cart-btn" id="cartButton" aria-label="Abrir carrinho de compras">
            <i class="fas fa-shopping-bag"></i>
            <span class="cart-count">0</span>
        </button>
    `;

    // AQUI ESTÁ A MUDANÇA PRINCIPAL
    if (isLoggedIn) {
        const userName = userData.nome.split(' ')[0].toUpperCase(); // Pega o primeiro nome e o deixa em maiúsculo
        actionsHTML += `
            <div class="user-info">
                <span>Olá, ${userName}</span>
                <a href="${basePath}/perfil/HTML/perfil.html" class="my-account-link">Minha conta</a>
            </div>
            <button id="logoutBtn" class="nav-icon-btn" aria-label="Sair">
                <i class="fas fa-sign-out-alt"></i>
            </button>
        `;
    } else {
        actionsHTML += `
            <a href="${basePath}/login/HTML/login.html" class="btn btn-outline">Login</a>
        `;
    }

    headerActions.innerHTML = actionsHTML;

    // A lógica de logout e menu mobile permanece a mesma
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('jwtToken');
            window.location.href = `${basePath}/inicio/HTML/index.html`;
        });
    }

    const toggleBtn = document.querySelector('.mobile-nav-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('nav-open');
        });
    }
});