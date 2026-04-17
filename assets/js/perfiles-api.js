let perfilesPermissions = null;

document.addEventListener("DOMContentLoaded", async () => {
  perfilesPermissions = await getModulePermissions("perfil_general");

  applyButtonPermissions({
    permissions: perfilesPermissions,
    addSelector: "#btnNuevoPerfil",
    consultSelector: "#btnRecargarPerfiles"
  });

  if (perfilesPermissions.bitConsulta) {
    await loadPerfiles();
  } else {
    const tbody = document.getElementById("perfilesTableBody");
    if (tbody) tbody.innerHTML = `<tr><td colspan="3">No tienes permiso de consulta.</td></tr>`;
  }

  document.getElementById("btnNuevoPerfil")?.addEventListener("click", () => {
    if (!perfilesPermissions.bitAgregar) {
      alert("No tienes permiso para agregar.");
      return;
    }
    window.location.href = "./perfil-form.html";
  });

  document.getElementById("btnRecargarPerfiles")?.addEventListener("click", loadPerfiles);
});

async function loadPerfiles() {
  const tbody = document.getElementById("perfilesTableBody");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="3">Cargando...</td></tr>`;

  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/perfiles`);
    const result = await response.json();

    if (!response.ok || !result.ok) {
      tbody.innerHTML = `<tr><td colspan="3">${result.message || "No se pudieron cargar los perfiles."}</td></tr>`;
      return;
    }

    tbody.innerHTML = result.data.map((perfil) => `
      <tr>
        <td>${perfil.strNombrePerfil}</td>
        <td>
          <span style="padding:6px 10px; background:${perfil.bitAdministrador ? "#DDF5D6" : "#FBE1DE"}; color:${perfil.bitAdministrador ? "#2E6D22" : "#A12D25"}; border-radius:999px; font-weight:bold;">
            ${perfil.bitAdministrador ? "Sí" : "No"}
          </span>
        </td>
        <td>
          <div class="btn-row">
            ${perfilesPermissions.bitEditar ? `<button class="btn btn-blue" onclick="irEditarPerfil(${perfil.id})">Editar</button>` : ""}
            ${perfilesPermissions.bitEliminar ? `<button class="btn btn-red" onclick="eliminarPerfil(${perfil.id})">Eliminar</button>` : ""}
          </div>
        </td>
      </tr>
    `).join("");
  } catch (error) {
    console.error(error);
    tbody.innerHTML = `<tr><td colspan="3">Error cargando perfiles.</td></tr>`;
  }
}

function irEditarPerfil(id) {
  if (!perfilesPermissions.bitEditar) {
    alert("No tienes permiso para editar.");
    return;
  }

  window.location.href = `./perfil-form.html?id=${id}`;
}

async function eliminarPerfil(id) {
  if (!perfilesPermissions.bitEliminar) {
    alert("No tienes permiso para eliminar.");
    return;
  }

  if (!confirm("¿Eliminar perfil?")) return;

  const response = await fetchWithAuth(`${API_BASE_URL}/perfiles/${id}`, {
    method: "DELETE"
  });

  const result = await response.json();
  alert(result.message);
  if (response.ok) loadPerfiles();
}