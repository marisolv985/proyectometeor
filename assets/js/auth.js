function getUsers() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
}

function getSession() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION));
}

function saveSession(user) {
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}

function login(correo, password) {
  const users = getUsers();

  const user = users.find(
    (u) => u.correo === correo && u.password === password
  );

  if (!user) {
    return { ok: false, message: "Correo o contraseña incorrectos." };
  }

  if (user.estado !== "Activo") {
    return { ok: false, message: "La cuenta está inactiva." };
  }

  saveSession(user);
  return { ok: true, user };
}

function requireAuth() {
  const session = getSession();
  if (!session) {
    window.location.href = "../pages/login.html";
  }
}

function logout() {
  clearSession();
  window.location.href = "../pages/login.html";
}

function bindLogoutButton() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      logout();
    });
  }
}