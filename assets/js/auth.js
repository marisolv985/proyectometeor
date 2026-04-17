function saveToken(token) {
  localStorage.setItem("proyecto_token", token);
}

function getToken() {
  return localStorage.getItem("proyecto_token");
}

function clearToken() {
  localStorage.removeItem("proyecto_token");
}

function saveSession(user) {
  localStorage.setItem("proyecto_session", JSON.stringify(user));
}

function getSession() {
  const raw = localStorage.getItem("proyecto_session");
  return raw ? JSON.parse(raw) : null;
}

function clearSession() {
  localStorage.removeItem("proyecto_session");
}

function goToLogin() {
  window.location.href = "/pages/login.html";
}

function goToDashboard() {
  window.location.href = "/pages/dashboard.html";
}

function logout() {
  clearToken();
  clearSession();
  goToLogin();
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

function requireAuth() {
  const token = getToken();
  const session = getSession();

  if (!token || !session) {
    goToLogin();
    return false;
  }

  return true;
}

async function fetchWithAuth(url, options = {}) {
  const token = getToken();

  if (!token) {
    goToLogin();
    throw new Error("Token no encontrado");
  }

  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (response.status === 401) {
    logout();
    throw new Error("Sesión expirada");
  }

  return response;
}