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
  
  // --- CORREÇÃO APLICADA AQUI ---
  // Definindo caminhos fixos a partir da raiz do site para evitar erros.
  const homeUrl = "/index.html";
  const basePath = "/FRONT";

  headerElement.innerHTML = `
        <div class="container">
            <button class="mobile-nav-toggle" aria-controls="main-nav" aria-expanded="false">
                <span class="sr-only">Menu</span>
                <div class="hamburger-icon"></div>
            </button>
            
            <a href="${homeUrl}" class="logo">Japa<span> Universe</span></a>
            
            <nav class="main-nav" id="main-nav">
                <ul class="nav-list">
                    <li><a href="${homeUrl}" class="nav-link">Início</a></li>
                    <li><a href="${basePath}/catalogo/HTML/catalogo.html" class="nav-link">Catálogo</a></li>
                    <li><a href="${basePath}/contato/HTML/contato.html" class="nav-link">Contato</a></li>
                </ul>
            </nav>
            <div class="header-actions" id="header-actions"></div>
        </div>
    `;

  const headerActions = document.getElementById("header-actions");
  
  let actionsHTML = `
        <button class="cart-btn" id="cartButton" aria-label="Abrir carrinho de compras">
            <i class="fas fa-shopping-bag"></i>
            <span class="cart-count">0</span>
        </button>
    `;

  if (isLoggedIn) {
    const userName = userData.nome ? userData.nome.split(' ')[0].toUpperCase() : 'USUÁRIO';
    const isAdmin = userData.authorities && userData.authorities.some(auth => auth.authority === 'ROLE_ADMIN');
    const adminLink = isAdmin ? `<a href="${basePath}/admin/HTML/admin.html">Painel Admin</a>` : '';

    actionsHTML += `
            <div class="user-account-menu">
                <div class="user-info">
                    <span class="welcome-text">Olá, ${userName}</span>
                    <a href="${basePath}/perfil/HTML/perfil.html" class="my-account-link">Minha conta <i class="fas fa-chevron-down"></i></a>
                </div>
                <div class="account-dropdown">
                    ${adminLink}
                    <a href="${basePath}/perfil/HTML/perfil.html">Meus Dados</a>
                    <button id="logoutBtn" class="logout-button">Sair</button>
                </div>
            </div>
        `;
  } else {
    actionsHTML += `
            <a href="${basePath}/login/HTML/login.html" class="btn btn-outline">Login</a>
        `;
  }

  headerActions.innerHTML = actionsHTML;

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("jwtToken");
      window.location.href = homeUrl; 
    });
  }

  const toggleBtn = document.querySelector(".mobile-nav-toggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      document.body.classList.toggle("nav-open");
    });
  }
});
