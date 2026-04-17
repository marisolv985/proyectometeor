document.addEventListener("DOMContentLoaded", async () => {
  await renderDashboardCards();
});

async function renderDashboardCards() {
  const container = document.getElementById("dashboardCards");
  if (!container) return;

  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/permisos/menu`);
    const result = await response.json();

    if (!response.ok || !result.ok) {
      container.innerHTML = `<div class="content-card">No se pudo cargar el menú.</div>`;
      return;
    }

    const grouped = {};
    result.data.forEach((item) => {
      if (!grouped[item.strNombreMenu]) grouped[item.strNombreMenu] = [];
      grouped[item.strNombreMenu].push(item);
    });

    container.innerHTML = Object.entries(grouped).map(([menu, mods]) => `
      <div class="info-card">
        <h3>${menu}</h3>
        <p>${mods.map(m => m.strNombreModulo).join(", ")}</p>
        <a class="btn btn-blue" href="${mapBackendRouteToFrontend(mods[0].strRutaModulo)}">Entrar</a>
      </div>
    `).join("");
  } catch (error) {
    console.error(error);
    container.innerHTML = `<div class="content-card">Error cargando dashboard.</div>`;
  }
}