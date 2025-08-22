document.addEventListener('DOMContentLoaded', () => {
    const headerElement = document.querySelector('header.main-header');
    if (!headerElement) return;

    // Função para decodificar JWT
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
        // Saudação e menu "Minha conta"
        actionsHTML += `
            <div class="user-menu" style="display:flex;flex-direction:column;align-items:flex-end;gap:2px;">
                <span class="user-greeting" style="font-size:13px;">Olá ${userData?.nome || userData?.email || 'Usuário'}</span>
                <div class="account-dropdown" style="position:relative;">
                    <button class="account-btn" style="background:none;border:none;font-size:16px;font-weight:bold;cursor:pointer;">
                        Minha conta <span style="font-size:10px;">&#9660;</span>
                    </button>
                    <div class="dropdown-content" style="display:none;position:absolute;right:0;top:110%;background:#fff;border:1px solid #eee;box-shadow:0 2px 8px rgba(0,0,0,0.07);min-width:140px;z-index:50;border-radius:4px;padding:8px 0;">
                        <a href="${basePath}/FRONT/perfil/HTML/perfil.html" style="display:block;padding:8px 16px;text-align:left;color:#222;font-size:15px;text-decoration:none;">Perfil</a>
                        <button id="logoutBtn" style="width:100%;padding:8px 16px;text-align:left;background:none;border:none;color:#222;font-size:15px;cursor:pointer;">Sair</button>
                    </div>
                </div>
            </div>
        `;
    } else {
        actionsHTML += `
            <a href="${basePath}/login/HTML/login.html" class="btn btn-outline">Login</a>
        `;
    }

    headerActions.innerHTML = actionsHTML;

    // Dropdown functionality para "Minha conta"
    if (isLoggedIn) {
        const accountBtn = document.querySelector('.account-btn');
        const dropdownContent = document.querySelector('.dropdown-content');
        if (accountBtn && dropdownContent) {
            accountBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
            });
            // Fecha dropdown ao clicar fora
            document.addEventListener('click', (e) => {
                if (!accountBtn.contains(e.target) && !dropdownContent.contains(e.target)) {
                    dropdownContent.style.display = 'none';
                }
            });
        }
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('jwtToken');
            window.location.href = `${basePath}/index.html`;
        });
    }

    // Mobile menu
    const toggleBtn = document.querySelector('.mobile-nav-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('nav-open');
        });
    }
});