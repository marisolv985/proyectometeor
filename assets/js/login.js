document.addEventListener("DOMContentLoaded", () => {
  const session = getSession();
  if (session) {
    window.location.href = "../pages/dashboard.html";
    return;
  }

  const loginForm = document.getElementById("loginForm");
  const loginMessage = document.getElementById("loginMessage");
  const fakeCaptchaBox = document.getElementById("fakeCaptchaBox");
  const captchaInput = document.getElementById("captchaInput");
  const refreshCaptcha = document.getElementById("refreshCaptcha");

  let currentCaptcha = generateCaptcha();
  fakeCaptchaBox.textContent = currentCaptcha;

  refreshCaptcha.addEventListener("click", () => {
    currentCaptcha = generateCaptcha();
    fakeCaptchaBox.textContent = currentCaptcha;
    captchaInput.value = "";
  });

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const correo = document.getElementById("correo").value.trim();
    const password = document.getElementById("password").value.trim();
    const captchaValue = captchaInput.value.trim();

    if (captchaValue.toUpperCase() !== currentCaptcha) {
      loginMessage.className = "message-box message-error";
      loginMessage.textContent = "Captcha incorrecto.";
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ correo, password })
      });

      const result = await response.json();

      if (!response.ok) {
        loginMessage.className = "message-box message-error";
        loginMessage.textContent = result.message || "No se pudo iniciar sesión.";
        return;
      }

      saveToken(result.token);
      saveSession(result.user);

      loginMessage.className = "message-box message-success";
      loginMessage.textContent = "Inicio de sesión correcto.";

      setTimeout(() => {
        window.location.href = "../pages/dashboard.html";
      }, 700);
    } catch (error) {
      loginMessage.className = "message-box message-error";
      loginMessage.textContent = "Error de conexión con el servidor.";
    }
  });
});

function generateCaptcha(length = 4) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}