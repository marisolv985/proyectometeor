document.addEventListener("DOMContentLoaded", () => {
  const session = getSession();
  if (session) {
    window.location.href = "../pages/dashboard.html";
    return;
  }

  const loginForm = document.getElementById("loginForm");
  const loginMessage = document.getElementById("loginMessage");
  const togglePassword = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("password");

  togglePassword.addEventListener("click", () => {
    passwordInput.type = passwordInput.type === "password" ? "text" : "password";
    togglePassword.textContent = passwordInput.type === "password" ? "Ver" : "Ocultar";
  });

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const correo = document.getElementById("correo").value.trim();
    const password = document.getElementById("password").value.trim();

    const result = login(correo, password);

    if (!result.ok) {
      loginMessage.className = "message-box message-error";
      loginMessage.textContent = result.message;
      return;
    }

    loginMessage.className = "message-box message-success";
    loginMessage.textContent = "Inicio de sesión correcto.";

    setTimeout(() => {
      window.location.href = "../pages/dashboard.html";
    }, 700);
  });
});