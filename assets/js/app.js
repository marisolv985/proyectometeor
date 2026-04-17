document.addEventListener("DOMContentLoaded", async () => {
  requireAuth();
  bindLogoutButton();

  const session = getSession();
  const topUserName = document.getElementById("topUserName");

  if (session && topUserName) {
    topUserName.textContent = session.nombre || session.correo || "Usuario";
  }

  await renderDynamicTopNav();
});

async function renderDynamicTopNav() {
  const nav = document.getElementById("dynamicTopNav");
  if (!nav) return;

  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/permisos/menu`);
    const result = await response.json();

    if (!response.ok || !result.ok) {
      nav.innerHTML = `<a href="./dashboard.html" class="nav-link active">Dashboard</a>`;
      if (typeof setupNavbarDropdowns === "function") setupNavbarDropdowns();
      return;
    }

    const grouped = {};
    result.data.forEach((item) => {
      if (!grouped[item.strNombreMenu]) grouped[item.strNombreMenu] = [];
      grouped[item.strNombreMenu].push(item);
    });

    let html = `<a href="./dashboard.html" class="nav-link">Dashboard</a>`;

    Object.keys(grouped).forEach((menuName) => {
      html += `
        <div class="nav-group">
          <button class="nav-group-button" type="button">${menuName} ▾</button>
          <div class="nav-group-menu">
            ${grouped[menuName].map((mod) => `
              <a href="${mapBackendRouteToFrontend(mod.strRutaModulo)}">
                ${mod.strNombreModulo}
              </a>
            `).join("")}
          </div>
        </div>
      `;
    });

    nav.innerHTML = html;
    markActiveNavLink();

    if (typeof setupNavbarDropdowns === "function") {
      setupNavbarDropdowns();
    }
  } catch (error) {
    console.error("Error cargando menú:", error);
    nav.innerHTML = `<a href="./dashboard.html" class="nav-link active">Dashboard</a>`;
    if (typeof setupNavbarDropdowns === "function") setupNavbarDropdowns();
  }
}

function mapBackendRouteToFrontend(route) {
  const map = {
    "/seguridad/perfil": "./perfiles.html",
    "/seguridad/perfil-general": "./perfiles.html",
    "/seguridad/modulo": "./modulos.html",
    "/seguridad/permisos-perfil": "./permisos.html",
    "/seguridad/usuario": "./usuarios.html",
    "/principal1/principal-1-1": "./principal-1-1.html",
    "/principal1/principal-1-2": "./principal-1-2.html",
    "/principal2/principal-2-1": "./principal-2-1.html",
    "/principal2/principal-2-2": "./principal-2-2.html",
    "/reportes": "./dashboard.html"
  };

  return map[route] || "./dashboard.html";
}

function markActiveNavLink() {
  const current = window.location.pathname.split("/").pop();
  const links = document.querySelectorAll("#dynamicTopNav a");

  links.forEach((link) => {
    const href = link.getAttribute("href");
    if (href && href.includes(current)) {
      link.classList.add("active");
    }
  });
}