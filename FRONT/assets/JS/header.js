document.addEventListener("DOMContentLoaded", () => {
  const headerElement = document.querySelector("header.main-header");
  if (!headerElement) return;

  const parseJwt = (token) => {
    try {
      // Decodifica a parte do meio (payload) do token
      return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      return null;
    }
  };

  const token = localStorage.getItem("jwtToken");
  const userData = token ? parseJwt(token) : null;
  const isLoggedIn = userData !== null;
  const basePath = headerElement.dataset.basepath || ".";

  // Estrutura base do Header
  headerElement.innerHTML = `
        <div class="container">
            <button class="mobile-nav-toggle" aria-controls="main-nav" aria-expanded="false">
                <span class="sr-only">Menu</span>
                <div class="hamburger-icon"></div>
            </button>
            <a href="${basePath}/index.html" class="logo">Japa<span> Universe</span></a>
            <nav class="main-nav" id="main-nav">
                <ul class="nav-list">
                    <li><a href="${basePath}/FRONT/inicio/HTML/index.html" class="nav-link">Início</a></li>
                    <li><a href="${basePath}/FRONT/catalogo/HTML/catalogo.html" class="nav-link">Catálogo</a></li>
                    <li><a href="${basePath}/FRONT/contato/HTML/contato.html" class="nav-link">Contato</a></li>
                </ul>
            </nav>
            <div class="header-actions" id="header-actions"></div>
        </div>
    `;

  const headerActions = document.getElementById("header-actions");
  
  // O carrinho é comum para ambos os estados (logado ou não)
  let actionsHTML = `
        <button class="cart-btn" id="cartButton" aria-label="Abrir carrinho de compras">
            <i class="fas fa-shopping-bag"></i>
            <span class="cart-count">0</span>
        </button>
    `;

  if (isLoggedIn) {
    // Pega o primeiro nome do usuário a partir do token e o deixa em maiúsculas
    const userName = userData.nome ? userData.nome.split(' ')[0].toUpperCase() : 'USUÁRIO';

    // --- NOVA ESTRUTURA QUANDO ESTÁ LOGADO ---
    actionsHTML += `
            <div class="user-account-menu">
                <div class="user-info">
                    <span class="welcome-text">Olá, ${userName}</span>
                    <a href="#" class="my-account-link">Minha conta <i class="fas fa-chevron-down"></i></a>
                </div>
                <div class="account-dropdown">
                    <a href="${basePath}/FRONT/perfil/HTML/perfil.html">Meus Dados</a>
                    <a href="#">Meus Pedidos</a>
                    <button id="logoutBtn" class="logout-button">Sair</button>
                </div>
            </div>
        `;
  } else {
    // Botão de Login quando não está logado
    actionsHTML += `
            <a href="${basePath}/login/HTML/login.html" class="btn btn-outline">Login</a>
        `;
  }

  headerActions.innerHTML = actionsHTML;

  // Adiciona o evento de logout ao botão
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("jwtToken");
      // Redireciona para o index na raiz, que deve carregar a página inicial
      window.location.href = `${basePath}/index.html`; 
    });
  }

  // Lógica para o menu mobile
  const toggleBtn = document.querySelector(".mobile-nav-toggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      document.body.classList.toggle("nav-open");
    });
  }
});