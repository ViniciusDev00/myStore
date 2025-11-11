document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "http://localhost:8080/api/auth";

  const resetPasswordForm = document.getElementById("resetPasswordForm");
  const newPasswordEl = document.getElementById("new-password");
  const confirmPasswordEl = document.getElementById("confirm-password");
  const resetMessage = document.getElementById("resetMessage");

  // 1. Pegar o Token da URL
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  if (!token) {
    resetMessage.textContent = "Token não encontrado. Link inválido.";
    resetMessage.className = "form-message error";
    resetPasswordForm.querySelector("button").disabled = true;
  }

  // 2. Lógica do Formulário de Reset
  if (resetPasswordForm) {
    resetPasswordForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      resetMessage.textContent = "";

      const newPassword = newPasswordEl.value;
      const confirmPassword = confirmPasswordEl.value;

      if (newPassword !== confirmPassword) {
        resetMessage.textContent = "As senhas não conferem.";
        resetMessage.className = "form-message error";
        return;
      }

      if (!token) {
        resetMessage.textContent = "Erro: Token de redefinição ausente.";
        resetMessage.className = "form-message error";
        return;
      }

      try {
        resetMessage.textContent = "Salvando...";
        resetMessage.className = "form-message";

        // 3. Enviar para o Back-end
        const response = await axios.post(
          `${API_URL}/reset-password?token=${token}`,
          { newPassword }
        );

        resetMessage.textContent = response.data.message;
        resetMessage.className = "form-message success";

        // 4. Redirecionar para o login
        setTimeout(() => {
          window.location.href = "./login.html";
        }, 3000);

      } catch (error) {
        resetMessage.textContent = error.response?.data?.error || "Erro ao redefinir a senha.";
        resetMessage.className = "form-message error";
      }
    });
  }


  // ===============================================
  // LÓGICA DO CANVAS DE FUNDO (Copiada do login.js)
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
