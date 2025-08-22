document.addEventListener('DOMContentLoaded', () => {
    const headerElement = document.querySelector('header.main-header');
    if (!headerElement) return;

    const parseJwt = (token) => {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return null;
        }
    };

    const token = localStorage.getItem('jwtToken');
    const userData = token ? parseJwt(token) : null;
    const isLoggedIn = userData !== null;
    const basePath = headerElement.dataset.basepath || '.';

    headerElement.innerHTML = `
        <div class="container">
            <button class="mobile-nav-toggle" aria-controls="main-nav" aria-expanded="false">
                <span class="sr-only">Menu</span>
                <div class="hamburger-icon"></div>
            </button>
            <a href="${basePath}/index.html" class="logo">Japa<span> Universe</span></a>
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

    if (isLoggedIn) {
        actionsHTML += `
            <a href="${basePath}/FRONT/perfil/HTML/perfil.html" class="nav-icon-btn" aria-label="Minha Conta">
                <i class="fas fa-user"></i>
            </a>
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

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('jwtToken');
            window.location.href = `${basePath}/index.html`;
        });
    }

    const toggleBtn = document.querySelector('.mobile-nav-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('nav-open');
        });
    }
});
