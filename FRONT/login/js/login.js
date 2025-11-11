document.addEventListener("DOMContentLoaded", () => {
  // ===============================================
  // CONSTANTES DA API
  // ===============================================
  const API_URL = "http://localhost:8080/api/auth";

  // ===============================================
  // LÓGICA DOS FORMULÁRIOS DE LOGIN/REGISTRO
  // ===============================================
  const showLoginBtn = document.getElementById("showLoginBtn");
  const showRegisterBtn = document.getElementById("showRegisterBtn");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const loginMessage = document.getElementById("loginMessage");
  const registerMessage = document.getElementById("registerMessage");

  if (showLoginBtn) {
    showLoginBtn.addEventListener("click", () => {
      loginForm.classList.add("active");
      registerForm.classList.remove("active");
      showLoginBtn.classList.add("active");
      showRegisterBtn.classList.remove("active");
    });
  }

  if (showRegisterBtn) {
    showRegisterBtn.addEventListener("click", () => {
      registerForm.classList.add("active");
      loginForm.classList.remove("active");
      showRegisterBtn.classList.add("active");
      showLoginBtn.classList.remove("active");
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      loginMessage.textContent = "";
      const email = document.getElementById("login-email").value;
      const senha = document.getElementById("login-password").value;
      try {
        const response = await axios.post(`${API_URL}/login`, { email, senha });

        localStorage.setItem("jwtToken", response.data.token);

        loginMessage.textContent = "Login bem-sucedido! Redirecionando...";
        loginMessage.className = "form-message success";
        setTimeout(() => {
          // --- CAMINHO CORRIGIDO AQUI ---
          window.location.href = "/index.html"; // Redireciona para a página inicial correta
        }, 1500);
      } catch (error) {
        loginMessage.textContent = "E-mail ou senha inválidos.";
        loginMessage.className = "form-message error";
        console.error("Erro de login:", error);
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      registerMessage.textContent = "";
      // NOVO: Peguei o CPF do seu DTO (precisa adicionar no HTML de registro se for obrigatório)
      const nome = document.getElementById("register-name").value;
      const cpf = "000.000.000-00"; // !! ATENÇÃO: Adicionar campo de CPF no HTML de registro
      const email = document.getElementById("register-email").value;
      const senha = document.getElementById("register-password").value;
      try {
        // ATENÇÃO: Seu back-end espera 'cpf', mas o front não pedia.
        // O endpoint de registro no seu AuthController é /registro, não /registrar
        await axios.post(`${API_URL}/registro`, { nome, cpf, email, senha });
        registerMessage.textContent =
          "Registo bem-sucedido! Pode fazer login agora.";
        registerMessage.className = "form-message success";
        registerForm.reset();
        setTimeout(() => {
          showLoginBtn.click();
        }, 2000);
      } catch (error) {
        registerMessage.textContent =
          "Erro ao registar. O e-mail já pode existir.";
        registerMessage.className = "form-message error";
        console.error("Erro de registo:", error);
      }
    });
  }

  // ===============================================
  // NOVA LÓGICA DO MODAL "ESQUECI SENHA" (ADICIONADA)
  // ===============================================
  const forgotPasswordLink = document.getElementById("forgotPasswordLink");
  const forgotPasswordModal = document.getElementById("forgotPasswordModal");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const forgotPasswordForm = document.getElementById("forgotPasswordForm");
  const forgotMessage = document.getElementById("forgotMessage");

  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", (e) => {
      e.preventDefault();
      forgotPasswordModal.classList.add("active");
    });
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
      forgotPasswordModal.classList.remove("active");
    });
  }

  if (forgotPasswordModal) {
    // Fecha o modal se clicar fora do conteúdo
    forgotPasswordModal.addEventListener("click", (e) => {
      if (e.target === forgotPasswordModal) {
        forgotPasswordModal.classList.remove("active");
      }
    });
  }

  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      forgotMessage.textContent = "Enviando...";
      forgotMessage.className = "form-message";
      
      const email = document.getElementById("forgot-email").value;

      try {
        const response = await axios.post(`${API_URL}/forgot-password`, { email });
        forgotMessage.textContent = response.data.message;
        forgotMessage.className = "form-message success";
      } catch (error) {
        forgotMessage.textContent = error.response?.data?.error || "Erro ao enviar e-mail.";
        forgotMessage.className = "form-message error";
      }
    });
  }


  // ===============================================
  // LÓGICA DO CANVAS DE FUNDO (Existente)
  // ===============================================
  const canvas = document.getElementById("background-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let particles = [];
    const particleCount = 70;

    function setCanvasSize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
      }
      draw() {
        ctx.fillStyle = "rgba(255, 122, 0, 0.5)";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function init() {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }

    function handleParticles() {
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 122, 0, ${1 - distance / 100})`;
            ctx.lineWidth = 0.2;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      handleParticles();
      requestAnimationFrame(animate);
    }

    window.addEventListener("resize", () => {
      setCanvasSize();
      init();
    });

    setCanvasSize();
    init();
    animate();
  }
});
