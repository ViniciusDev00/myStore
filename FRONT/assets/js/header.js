document.addEventListener("DOMContentLoaded", () => {
  const headerElement = document.querySelector("header.main-header");
  if (!headerElement) return;

  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const token = localStorage.getItem("jwtToken");
  const userData = token ? parseJwt(token) : null;
  const isLoggedIn = userData !== null;
  
  // --- CORREÇÃO DEFINITIVA DE ROTEAMENTO APLICADA AQUI ---
  const basePath = headerElement.dataset.basepath || ".";
  
  // Esta lógica agora monta os caminhos corretamente a partir da raiz do projeto,
  // usando o basePath para navegar de volta para a raiz de qualquer subpágina.
  const homeUrl = `${basePath}/index.html`;
  const catalogoUrl = `${basePath}/FRONT/catalogo/HTML/catalogo.html`;
  const contatoUrl = `${basePath}/FRONT/contato/HTML/contato.html`;
  const adminUrl = `${basePath}/FRONT/admin/HTML/admin.html`;
  const perfilUrl = `${basePath}/FRONT/perfil/HTML/perfil.html`;
  const loginUrl = `${basePath}/FRONT/login/HTML/login.html`;
  // --- FIM DA CORREÇÃO ---

  headerElement.innerHTML = `
        <div class="container">
            <button class="mobile-nav-toggle" aria-controls="main-nav" aria-expanded="false">
                <span class="sr-only">Menu</span>
                <div class="hamburger-icon"></div>
            </button>
            
            <a href="${homeUrl}" class="logo">Japa<span> Universe</span></a>
            
            <nav class="main-nav" id="main-nav">
                <div class="nav-header">
                    <span class="nav-title">Menu</span>
                </div>
                <ul class="nav-list">
                    <li><a href="${homeUrl}" class="nav-link">Início</a></li>
                    <li><a href="${catalogoUrl}" class="nav-link">Catálogo</a></li>
                    <li><a href="${contatoUrl}" class="nav-link">Contato</a></li>
                </ul>
            </nav>
            <div class="header-actions" id="header-actions"></div>
        </div>
    `;

  const headerActions = document.getElementById("header-actions");
  const navList = document.querySelector(".nav-list");

  let actionsHTML = `
        <button class="cart-btn" id="cartButton" aria-label="Abrir carrinho de compras">
            <i class="fas fa-shopping-bag"></i>
            <span class="cart-count">0</span>
        </button>
    `;

  if (isLoggedIn) {
    const userName = userData.nome ? userData.nome.split(' ')[0].toUpperCase() : 'USUÁRIO';
    const isAdmin = userData.authorities && userData.authorities.some(auth => auth.authority === 'ROLE_ADMIN');

    // Monta o menu dropdown para desktop
    actionsHTML += `
            <div class="user-account-menu">
                <div class="user-info">
                    <span class="welcome-text">Olá, ${userName}</span>
                    <a href="${perfilUrl}" class="my-account-link">Minha conta <i class="fas fa-chevron-down"></i></a>
                </div>
                <div class="account-dropdown">
                    ${isAdmin ? `<a href="${adminUrl}">Painel Admin</a>` : ''}
                    <a href="${perfilUrl}">Meus Dados</a>
                    <button id="logoutBtn" class="logout-button">Sair</button>
                </div>
            </div>
        `;
    
    // Adiciona os links da conta ao menu de navegação (para uso no mobile)
    if (navList) {
        const mobileAccountLinks = `
            <li class="nav-separator"></li>
            <li class="nav-item-account"><a href="${perfilUrl}" class="nav-link"><i class="fas fa-user"></i> Meus Dados</a></li>
            ${isAdmin ? `<li class="nav-item-account"><a href="${adminUrl}" class="nav-link"><i class="fas fa-cogs"></i> Painel Admin</a></li>` : ''}
            <li class="nav-item-account"><button id="mobileLogoutBtn" class="nav-link-logout"><i class="fas fa-sign-out-alt"></i> Sair</button></li>
        `;
        navList.insertAdjacentHTML('beforeend', mobileAccountLinks);
    }

  } else {
    // Botão de Login para o cabeçalho (desktop)
    actionsHTML += `<a href="${loginUrl}" class="btn btn-outline desktop-login-btn">Login</a>`;

    // Botão de Login para o menu de navegação (mobile)
    if (navList) {
        const mobileLoginLink = `
            <li class="nav-separator"></li>
            <li><a href="${loginUrl}" class="btn btn-primary nav-login-btn">Fazer Login</a></li>
        `;
        navList.insertAdjacentHTML('beforeend', mobileLoginLink);
    }
  }

  headerActions.innerHTML = actionsHTML;

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    window.location.href = homeUrl;
  };

  // Listeners de logout para ambos os botões
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);
  
  const mobileLogoutBtn = document.getElementById("mobileLogoutBtn");
  if (mobileLogoutBtn) mobileLogoutBtn.addEventListener("click", handleLogout);

  // Listener do menu hamburguer
  const toggleBtn = document.querySelector(".mobile-nav-toggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      document.body.classList.toggle("nav-open");
    });
  }

  // Adiciona um listener para fechar o menu ao clicar no overlay
  document.body.addEventListener('click', (e) => {
      if (document.body.classList.contains('nav-open') && e.target === document.body) {
          document.body.classList.remove('nav-open');
      }
  });
});