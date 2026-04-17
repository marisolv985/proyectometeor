document.addEventListener("DOMContentLoaded", () => {
  requireAuth();
  bindLogoutButton();

  const session = getSession();
  const welcomeUser = document.getElementById("welcomeUser");

  if (session && welcomeUser) {
    welcomeUser.textContent = `Hola, ${session.nombre}. Perfil: ${session.perfil}.`;
  }
});