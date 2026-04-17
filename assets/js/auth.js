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
  return JSON.parse(localStorage.getItem("proyecto_session"));
}

function clearSession() {
  localStorage.removeItem("proyecto_session");
}

function logout() {
  clearToken();
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

function requireAuth() {
  const token = getToken();
  if (!token) {
    window.location.href = "../pages/login.html";
  }
}

async function fetchWithAuth(url, options = {}) {
  const token = getToken();

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