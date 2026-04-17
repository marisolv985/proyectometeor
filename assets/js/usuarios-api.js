let catalogosUsuarios = { perfiles: [], estados: [] };
let usuariosPermissions = null;

document.addEventListener("DOMContentLoaded", async () => {
  usuariosPermissions = await getModulePermissions("usuario");

  applyButtonPermissions({
    permissions: usuariosPermissions,
    addSelector: "#btnNuevoUsuario",
    consultSelector: "#btnRecargarUsuarios"
  });

  if (usuariosPermissions.bitConsulta) {
    await loadCatalogosUsuarios();
    await loadUsuarios();
  } else {
    const tbody = document.getElementById("usuariosTableBody");
    if (tbody) tbody.innerHTML = `<tr><td colspan="7">No tienes permiso de consulta.</td></tr>`;
  }

  document.getElementById("btnNuevoUsuario")?.addEventListener("click", () => {
    if (!usuariosPermissions.bitAgregar) {
      alert("No tienes permiso para agregar.");
      return;
    }
    window.location.href = "./usuario-form.html";
  });

  document.getElementById("btnRecargarUsuarios")?.addEventListener("click", loadUsuarios);
});

async function loadCatalogosUsuarios() {
  const response = await fetchWithAuth(`${API_BASE_URL}/usuarios/catalogos`);
  const result = await response.json();
  if (response.ok && result.ok) {
    catalogosUsuarios = result.data;
  }
}

async function loadUsuarios() {
  const tbody = document.getElementById("usuariosTableBody");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="7">Cargando...</td></tr>`;

  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/usuarios`);
    const result = await response.json();

    if (!response.ok || !result.ok) {
      tbody.innerHTML = `<tr><td colspan="7">${result.message || "No se pudieron cargar los usuarios."}</td></tr>`;
      return;
    }

    tbody.innerHTML = result.data.map((usuario) => `
      <tr>
        <td>
          <img src="${usuario.strFotoPerfil ? `http://localhost:3000${usuario.strFotoPerfil}` : 'https://via.placeholder.com/48'}"
               alt="usuario"
               style="width:48px; height:48px; border-radius:50%; object-fit:cover;" />
        </td>
        <td>${usuario.strNombreUsuario}</td>
        <td>${usuario.strNombrePerfil}</td>
        <td>
          <span style="padding:6px 10px; background:${usuario.strNombreEstado === "Activo" ? "#DDF5D6" : "#FBE1DE"}; color:${usuario.strNombreEstado === "Activo" ? "#2E6D22" : "#A12D25"}; border-radius:999px; font-weight:bold;">
            ${usuario.strNombreEstado}
          </span>
        </td>
        <td>${usuario.strCorreo}</td>
        <td>${usuario.strNumeroCelular || ""}</td>
        <td>
          <div class="btn-row">
            ${usuariosPermissions.bitEditar ? `<button class="btn btn-blue" onclick="irEditarUsuario(${usuario.id})">Editar</button>` : ""}
            ${usuariosPermissions.bitEliminar ? `<button class="btn btn-red" onclick="eliminarUsuario(${usuario.id})">Eliminar</button>` : ""}
          </div>
        </td>
      </tr>
    `).join("");
  } catch (error) {
    console.error(error);
    tbody.innerHTML = `<tr><td colspan="7">Error cargando usuarios.</td></tr>`;
  }
}

function irEditarUsuario(id) {
  if (!usuariosPermissions.bitEditar) {
    alert("No tienes permiso para editar.");
    return;
  }

  window.location.href = `./usuario-form.html?id=${id}`;
}

async function eliminarUsuario(id) {
  if (!usuariosPermissions.bitEliminar) {
    alert("No tienes permiso para eliminar.");
    return;
  }

  if (!confirm("¿Eliminar usuario?")) return;

  const response = await fetchWithAuth(`${API_BASE_URL}/usuarios/${id}`, {
    method: "DELETE"
  });

  const result = await response.json();
  alert(result.message);
  if (response.ok) loadUsuarios();
}