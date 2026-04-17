let modulosPermissions = null;

document.addEventListener("DOMContentLoaded", async () => {
  modulosPermissions = await getModulePermissions("modulo");

  applyButtonPermissions({
    permissions: modulosPermissions,
    addSelector: "#btnNuevoModulo",
    consultSelector: "#btnRecargarModulos"
  });

  if (modulosPermissions.bitConsulta) {
    await loadModulos();
  } else {
    const tbody = document.getElementById("modulosTableBody");
    if (tbody) tbody.innerHTML = `<tr><td colspan="5">No tienes permiso de consulta.</td></tr>`;
  }

  document.getElementById("btnNuevoModulo")?.addEventListener("click", () => {
    if (!modulosPermissions.bitAgregar) {
      alert("No tienes permiso para agregar.");
      return;
    }
    window.location.href = "./modulo-form.html";
  });

  document.getElementById("btnRecargarModulos")?.addEventListener("click", loadModulos);
});

async function loadModulos() {
  const tbody = document.getElementById("modulosTableBody");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="5">Cargando...</td></tr>`;

  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/modulos`);
    const result = await response.json();

    if (!response.ok || !result.ok) {
      tbody.innerHTML = `<tr><td colspan="5">${result.message || "No se pudieron cargar los módulos."}</td></tr>`;
      return;
    }

    tbody.innerHTML = result.data.map((modulo) => `
      <tr>
        <td>${modulo.strNombreModulo}</td>
        <td>${modulo.strClaveModulo}</td>
        <td>${modulo.strRutaModulo}</td>
        <td>
          <span style="padding:6px 10px; background:${modulo.bitEstatico ? "#DDF5D6" : "#FBE1DE"}; color:${modulo.bitEstatico ? "#2E6D22" : "#A12D25"}; border-radius:999px; font-weight:bold;">
            ${modulo.bitEstatico ? "Sí" : "No"}
          </span>
        </td>
        <td>
          <div class="btn-row">
            ${modulosPermissions.bitEditar ? `<button class="btn btn-blue" onclick="irEditarModulo(${modulo.id})">Editar</button>` : ""}
            ${modulosPermissions.bitEliminar ? `<button class="btn btn-red" onclick="eliminarModulo(${modulo.id})">Eliminar</button>` : ""}
          </div>
        </td>
      </tr>
    `).join("");
  } catch (error) {
    console.error(error);
    tbody.innerHTML = `<tr><td colspan="5">Error cargando módulos.</td></tr>`;
  }
}

function irEditarModulo(id) {
  if (!modulosPermissions.bitEditar) {
    alert("No tienes permiso para editar.");
    return;
  }

  window.location.href = `./modulo-form.html?id=${id}`;
}

async function eliminarModulo(id) {
  if (!modulosPermissions.bitEliminar) {
    alert("No tienes permiso para eliminar.");
    return;
  }

  if (!confirm("¿Eliminar módulo?")) return;

  const response = await fetchWithAuth(`${API_BASE_URL}/modulos/${id}`, {
    method: "DELETE"
  });

  const result = await response.json();
  alert(result.message);
  if (response.ok) loadModulos();
}