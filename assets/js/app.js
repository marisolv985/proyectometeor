document.addEventListener("DOMContentLoaded", () => {
  requireAuth();
  buildMenu();

  const session = getSession();
  const welcomeUser = document.getElementById("welcomeUser");

  if (session && welcomeUser) {
    welcomeUser.textContent = `Hola, ${session.nombre}. Perfil: ${session.perfil}.`;
  }
});