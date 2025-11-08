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
  
  // === CORREÇÃO APLICADA AQUI ===
  // Agora usamos caminhos absolutos a partir da raiz do site.
  // Isso garante que os links funcionem em qualquer página.
  const homeUrl = "/index.html";
  const catalogoUrl = "/FRONT/catalogo/HTML/catalogo.html";
  const contatoUrl = "/FRONT/contato/HTML/contato.html";
  const adminUrl = "/FRONT/admin/HTML/admin.html";
  const perfilUrl = "/FRONT/perfil/HTML/perfil.html";
  const loginUrl = "/FRONT/login/HTML/login.html";
  const pedidosUrl = "/FRONT/perfil/HTML/pedidos.html";

  headerElement.innerHTML = `
        <div class="container">
            <button class="mobile-nav-toggle" aria-controls="main-nav" aria-expanded="false">
                <span class="sr-only">Menu</span>
                <div class="hamburger-icon"></div>
            </button>
            
            <a href="${homeUrl}" class="logo">Japa<span> Universe</span></a>
            
            <nav class="desktop-nav" id="desktop-nav-menu">
                <ul class="nav-list">
                    <li><a href="${homeUrl}" class="nav-link">Início</a></li>
                    <li><a href="${catalogoUrl}" class="nav-link">Catálogo</a></li>
                    <li><a href="${contatoUrl}" class="nav-link">Contato</a></li>
                </ul>
            </nav>

            <nav class="main-nav" id="main-nav">
                <div class="nav-header">
                    <span class="nav-title">Menu</span>
                </div>
                <ul class="nav-list">
                    <li><a href="${homeUrl}" class="nav-link"><i class="fas fa-home"></i> Início</a></li>
                    <li><a href="${catalogoUrl}" class="nav-link"><i class="fas fa-search"></i> Catálogo</a></li>
                    <li><a href="${contatoUrl}" class="nav-link"><i class="fas fa-envelope"></i> Contato</a></li>
                </ul>
            </nav>
            <div class="header-actions" id="header-actions"></div>
        </div>
    `;

  const headerActions = document.getElementById("header-actions");
  const navList = document.querySelector("#main-nav .nav-list");

  let actionsHTML = `
        <button class="cart-btn" id="cartButton" aria-label="Abrir carrinho de compras">
            <i class="fas fa-shopping-bag"></i>
            <span class="cart-count">0</span>
        </button>
    `;

  if (isLoggedIn) {
    const userName = userData.nome ? userData.nome.split(' ')[0].toUpperCase() : 'USUÁRIO';
    const isAdmin = userData.authorities && userData.authorities.some(auth => auth.authority === 'ROLE_ADMIN');

    actionsHTML += `
            <div class="user-account-menu">
                <div class="user-info">
                    <span class="welcome-text">Olá, ${userName}</span>
                    <a href="${perfilUrl}" class="my-account-link">Minha conta <i class="fas fa-chevron-down"></i></a>
                </div>
                <div class="account-dropdown">
                    ${isAdmin ? `<a href="${adminUrl}">Painel Admin</a>` : ''}
                    <a href="${perfilUrl}">Meus Dados</a>
                    <a href="${pedidosUrl}">Meus Pedidos</a>
                    <button id="logoutBtn" class="logout-button">Sair</button>
                </div>
            </div>
        `;
    
    if (navList) {
        const mobileAccountLinks = `
            <li class="nav-separator"></li>
            <li class="nav-item-account"><a href="${perfilUrl}" class="nav-link"><i class="fas fa-user"></i> Meus Dados</a></li>
            <li class="nav-item-account"><a href="${pedidosUrl}" class="nav-link"><i class="fas fa-box"></i> Meus Pedidos</a></li>
            ${isAdmin ? `<li class="nav-item-account"><a href="${adminUrl}" class="nav-link"><i class="fas fa-cogs"></i> Painel Admin</a></li>` : ''}
            <li class="nav-item-account"><button id="mobileLogoutBtn" class="nav-link-logout"><i class="fas fa-sign-out-alt"></i> Sair</button></li>
        `;
        navList.insertAdjacentHTML('beforeend', mobileAccountLinks);
    }

  } else {
    actionsHTML += `<a href="${loginUrl}" class="btn btn-outline desktop-login-btn">Login</a>`;

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

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);
  
  const mobileLogoutBtn = document.getElementById("mobileLogoutBtn");
  if (mobileLogoutBtn) mobileLogoutBtn.addEventListener("click", handleLogout);

  const toggleBtn = document.querySelector(".mobile-nav-toggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      document.body.classList.toggle("nav-open");
    });
  }

  document.body.addEventListener('click', (e) => {
      if (document.body.classList.contains('nav-open') && e.target === document.body) {
          document.body.classList.remove('nav-open');
      }
  });
});