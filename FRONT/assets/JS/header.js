document.addEventListener("DOMContentLoaded", () => {
  const headerElement = document.querySelector("header.main-header");
  if (!headerElement) return;

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      return null;
    }
  };

  const token = localStorage.getItem("jwtToken");
  const userData = token ? parseJwt(token) : null;
  const isLoggedIn = userData !== null;
  const basePath = headerElement.dataset.basepath || ".";

  // --- ESTRUTURA BASE DO HEADER COM LINKS CORRIGIDOS ---
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

  const headerActions = document.getElementById("header-actions");
  
  let actionsHTML = `
        <button class="cart-btn" id="cartButton" aria-label="Abrir carrinho de compras">
            <i class="fas fa-shopping-bag"></i>
            <span class="cart-count">0</span>
        </button>
    `;

  if (isLoggedIn) {
    const userName = userData.nome ? userData.nome.split(' ')[0].toUpperCase() : 'USUÁRIO';

    // --- ESTRUTURA LOGADO COM LINKS CORRIGIDOS ---
    actionsHTML += `
            <div class="user-account-menu">
                <div class="user-info">
                    <span class="welcome-text">Olá, ${userName}</span>
                    <a href="${basePath}/perfil/HTML/perfil.html" class="my-account-link">Minha conta <i class="fas fa-chevron-down"></i></a>
                </div>
                <div class="account-dropdown">
                    <a href="${basePath}/perfil/HTML/perfil.html">Meus Dados</a>
                    <button id="logoutBtn" class="logout-button">Sair</button>
                </div>
            </div>
        `;
  } else {
    // --- LINK DE LOGIN CORRIGIDO ---
    actionsHTML += `
            <a href="${basePath}/login/HTML/login.html" class="btn btn-outline">Login</a>
        `;
  }

  headerActions.innerHTML = actionsHTML;

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("jwtToken");
      // CORREÇÃO: Redirecionamento de logout para a página inicial correta
      window.location.href = `${basePath}/inicio/HTML/index.html`; 
    });
  }

  const toggleBtn = document.querySelector(".mobile-nav-toggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      document.body.classList.toggle("nav-open");
    });
  }
});
