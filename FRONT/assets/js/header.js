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
  
  const basePath = headerElement.dataset.basepath || ".";
  const homeUrl = `${basePath}/index.html`.replace("./", "");
  const catalogoUrl = `${basePath}/FRONT/catalogo/HTML/catalogo.html`;
  const contatoUrl = `${basePath}/FRONT/contato/HTML/contato.html`;
  const adminUrl = `${basePath}/FRONT/admin/HTML/admin.html`;
  const perfilUrl = `${basePath}/FRONT/perfil/HTML/perfil.html`;
  const loginUrl = `${basePath}/FRONT/login/HTML/login.html`;

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

  // --- LÓGICA DE TRAVAMENTO DE SCROLL ATUALIZADA ---
  let scrollPosition = 0;
  const body = document.body;
  const html = document.documentElement;

  const openNav = () => {
      scrollPosition = window.pageYOffset;
      html.classList.add('nav-open');
      body.classList.add('nav-open');
      body.style.top = `-${scrollPosition}px`;
  };

  const closeNav = () => {
      html.classList.remove('nav-open');
      body.classList.remove('nav-open');
      body.style.top = '';
      window.scrollTo(0, scrollPosition);
  };

  const toggleBtn = document.querySelector(".mobile-nav-toggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      body.classList.contains('nav-open') ? closeNav() : openNav();
    });
  }

  document.body.addEventListener('click', (e) => {
      if (body.classList.contains('nav-open') && e.target === body) {
          closeNav();
      }
  });
});