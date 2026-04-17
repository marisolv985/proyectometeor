let perfilesCache = [];
let permisosCache = [];
let permisosModulePermissions = null;

document.addEventListener("DOMContentLoaded", async () => {
  try {
    permisosModulePermissions = await getModulePermissions("permisos_perfil");

    applyButtonPermissions({
      permissions: permisosModulePermissions,
      consultSelector: "#btnBuscarPermisos",
      editSelector: "#btnGuardarPermisos"
    });

    if (!permisosModulePermissions.bitConsulta) {
      const tbody = document.getElementById("permissionsMatrixBody");
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="6">No tienes permiso de consulta.</td></tr>`;
      }

      const select = document.getElementById("perfilFiltroPermisos");
      if (select) select.disabled = true;

      return;
    }

    await loadPerfilesForPermisos();

    document.getElementById("btnBuscarPermisos")?.addEventListener("click", loadPermisosMatrix);
    document.getElementById("btnGuardarPermisos")?.addEventListener("click", savePermisosMatrix);
    document.getElementById("btnCancelarPermisos")?.addEventListener("click", loadPermisosMatrix);
  } catch (error) {
    console.error("Error iniciando permisos:", error);
    const tbody = document.getElementById("permissionsMatrixBody");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="6">Error cargando permisos.</td></tr>`;
    }
  }
});

async function loadPerfilesForPermisos() {
  const select = document.getElementById("perfilFiltroPermisos");
  if (!select) return;

  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/perfiles`);
    const result = await response.json();

    if (!response.ok || !result.ok) {
      select.innerHTML = `<option value="">No se pudieron cargar perfiles</option>`;
      return;
    }

    perfilesCache = result.data || [];

    if (!perfilesCache.length) {
      select.innerHTML = `<option value="">No hay perfiles registrados</option>`;
      return;
    }

    select.innerHTML = perfilesCache.map((perfil) => `
      <option value="${perfil.id}">${perfil.strNombrePerfil}</option>
    `).join("");

    await loadPermisosMatrix();
  } catch (error) {
    console.error("Error cargando perfiles para permisos:", error);
    select.innerHTML = `<option value="">Error de conexión</option>`;
  }
}

async function loadPermisosMatrix() {
  if (!permisosModulePermissions?.bitConsulta) {
    alert("No tienes permiso de consulta.");
    return;
  }

  const tbody = document.getElementById("permissionsMatrixBody");
  const perfilId = document.getElementById("perfilFiltroPermisos")?.value;

  if (!tbody) return;

  if (!perfilId) {
    tbody.innerHTML = `<tr><td colspan="6">Selecciona un perfil.</td></tr>`;
    return;
  }

  tbody.innerHTML = `<tr><td colspan="6">Cargando...</td></tr>`;

  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/permisos/perfil/${perfilId}`);
    const result = await response.json();

    if (!response.ok || !result.ok) {
      tbody.innerHTML = `<tr><td colspan="6">${result.message || "No se pudo cargar la matriz."}</td></tr>`;
      return;
    }

    permisosCache = result.data || [];

    if (!permisosCache.length) {
      tbody.innerHTML = `<tr><td colspan="6">No hay módulos disponibles.</td></tr>`;
      return;
    }

    tbody.innerHTML = permisosCache.map((item) => `
      <tr>
        <td>${item.strNombreModulo}</td>
        <td><input type="checkbox" data-idmodulo="${item.id}" data-field="bitAgregar" ${item.bitAgregar ? "checked" : ""} ${permisosModulePermissions.bitEditar ? "" : "disabled"}></td>
        <td><input type="checkbox" data-idmodulo="${item.id}" data-field="bitEditar" ${item.bitEditar ? "checked" : ""} ${permisosModulePermissions.bitEditar ? "" : "disabled"}></td>
        <td><input type="checkbox" data-idmodulo="${item.id}" data-field="bitEliminar" ${item.bitEliminar ? "checked" : ""} ${permisosModulePermissions.bitEditar ? "" : "disabled"}></td>
        <td><input type="checkbox" data-idmodulo="${item.id}" data-field="bitConsulta" ${item.bitConsulta ? "checked" : ""} ${permisosModulePermissions.bitEditar ? "" : "disabled"}></td>
        <td><input type="checkbox" data-idmodulo="${item.id}" data-field="bitDetalle" ${item.bitDetalle ? "checked" : ""} ${permisosModulePermissions.bitEditar ? "" : "disabled"}></td>
      </tr>
    `).join("");
  } catch (error) {
    console.error("Error cargando matriz:", error);
    tbody.innerHTML = `<tr><td colspan="6">Error cargando matriz.</td></tr>`;
  }
}

async function savePermisosMatrix() {
  if (!permisosModulePermissions?.bitEditar) {
    alert("No tienes permiso para guardar permisos.");
    return;
  }

  const perfilId = Number(document.getElementById("perfilFiltroPermisos")?.value);
  if (!perfilId) {
    alert("Selecciona un perfil.");
    return;
  }

  const payload = permisosCache.map((item) => ({
    idModulo: item.id,
    bitAgregar: document.querySelector(`input[data-idmodulo="${item.id}"][data-field="bitAgregar"]`)?.checked || false,
    bitEditar: document.querySelector(`input[data-idmodulo="${item.id}"][data-field="bitEditar"]`)?.checked || false,
    bitEliminar: document.querySelector(`input[data-idmodulo="${item.id}"][data-field="bitEliminar"]`)?.checked || false,
    bitConsulta: document.querySelector(`input[data-idmodulo="${item.id}"][data-field="bitConsulta"]`)?.checked || false,
    bitDetalle: document.querySelector(`input[data-idmodulo="${item.id}"][data-field="bitDetalle"]`)?.checked || false
  }));

  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/permisos/guardar-matriz`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        idPerfil: perfilId,
        permisos: payload
      })
    });

    const result = await response.json();
    alert(result.message || "Operación realizada.");

    if (response.ok) {
      await loadPermisosMatrix();
    }
  } catch (error) {
    console.error("Error guardando matriz:", error);
    alert("Error guardando permisos.");
  }
}