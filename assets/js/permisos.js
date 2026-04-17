let permisosCurrentPage = 1;
let permisosSearchTerm = "";

function getPerfilesPermisos() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.PERFILES)) || [];
}

function getModulosPermisos() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.MODULOS)) || [];
}

function getPermisos() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.PERMISOS)) || [];
}

function savePermisos(permisos) {
  localStorage.setItem(STORAGE_KEYS.PERMISOS, JSON.stringify(permisos));
}

function getNextPermisoId(permisos) {
  if (permisos.length === 0) return 1;
  return Math.max(...permisos.map((p) => p.id)) + 1;
}

function loadPermisosSelects() {
  const perfilSelect = document.getElementById("perfilPermiso");
  const moduloSelect = document.getElementById("moduloPermiso");

  if (!perfilSelect || !moduloSelect) return;

  const perfiles = getPerfilesPermisos();
  const modulos = getModulosPermisos();

  perfilSelect.innerHTML = `
    <option value="">Selecciona un perfil</option>
    ${perfiles.map((perfil) => `<option value="${perfil.nombre}">${perfil.nombre}</option>`).join("")}
  `;

  moduloSelect.innerHTML = `
    <option value="">Selecciona un módulo</option>
    ${modulos.map((modulo) => `<option value="${modulo.nombre}">${modulo.nombre}</option>`).join("")}
  `;
}

function badge(value) {
  return value
    ? `<span class="badge-yes">Sí</span>`
    : `<span class="badge-no">No</span>`;
}

function getFilteredPermisos() {
  const permisos = getPermisos();
  return permisos.filter((permiso) =>
    [permiso.perfil, permiso.modulo]
      .join(" ")
      .toLowerCase()
      .includes(permisosSearchTerm.toLowerCase())
  );
}

function renderPermisosTable() {
  const tableBody = document.getElementById("permisosTableBody");
  if (!tableBody) return;

  const filtered = getFilteredPermisos();
  const paginated = paginateData(filtered, permisosCurrentPage, 5);
  permisosCurrentPage = paginated.currentPage;

  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="9" class="empty-state">No hay permisos registrados.</td>
      </tr>
    `;
    renderPagination("permisosPagination", 0, 1, "setPermisosPage", 5);
    return;
  }

  tableBody.innerHTML = paginated.items.map((permiso, index) => `
    <tr>
      <td>${(paginated.currentPage - 1) * 5 + index + 1}</td>
      <td>${escapeHtml(permiso.perfil)}</td>
      <td>${escapeHtml(permiso.modulo)}</td>
      <td>${badge(permiso.agregar)}</td>
      <td>${badge(permiso.editar)}</td>
      <td>${badge(permiso.consulta)}</td>
      <td>${badge(permiso.eliminar)}</td>
      <td>${badge(permiso.detalle)}</td>
      <td>
        <div class="actions">
          <button class="btn btn-info permiso-detail-btn" onclick="showPermisoDetail(${permiso.id})">Detalle</button>
          <button class="btn btn-danger permiso-delete-btn" onclick="deletePermiso(${permiso.id})">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join("");

  renderPagination("permisosPagination", filtered.length, permisosCurrentPage, "setPermisosPage", 5);

  protectButtonsByPermission(".permiso-detail-btn", "Permisos Perfil", "detalle");
  protectButtonsByPermission(".permiso-delete-btn", "Permisos Perfil", "eliminar");
}

function setPermisosPage(page) {
  permisosCurrentPage = page;
  renderPermisosTable();
}

function showPermisoDetail(id) {
  if (!hasPermission("Permisos Perfil", "detalle")) {
    showAlert("No tienes permiso para ver detalle.", "error");
    return;
  }

  const permiso = getPermisos().find((p) => p.id === id);
  if (!permiso) return;

  renderDetailModal("Detalle del Permiso", {
    "ID": permiso.id,
    "Perfil": permiso.perfil,
    "Módulo": permiso.modulo,
    "Agregar": permiso.agregar ? "Sí" : "No",
    "Editar": permiso.editar ? "Sí" : "No",
    "Consulta": permiso.consulta ? "Sí" : "No",
    "Eliminar": permiso.eliminar ? "Sí" : "No",
    "Detalle": permiso.detalle ? "Sí" : "No"
  });
}

function deletePermiso(id) {
  if (!hasPermission("Permisos Perfil", "eliminar")) {
    showAlert("No tienes permiso para eliminar.", "error");
    return;
  }

  confirmDeleteModal("¿Seguro que deseas eliminar este permiso?", () => {
    let permisos = getPermisos();
    permisos = permisos.filter((permiso) => permiso.id !== id);
    savePermisos(permisos);
    renderPermisosTable();
    showAlert("Permiso eliminado correctamente.", "success");
  });
}

function bindPermisoForm() {
  const form = document.getElementById("permisoPerfilForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!hasPermission("Permisos Perfil", "agregar") && !isAdminProfile()) {
      showAlert("No tienes permiso para guardar.", "error");
      return;
    }

    const perfil = document.getElementById("perfilPermiso").value;
    const modulo = document.getElementById("moduloPermiso").value;
    const agregar = document.getElementById("permAgregar").checked;
    const editar = document.getElementById("permEditar").checked;
    const consulta = document.getElementById("permConsulta").checked;
    const eliminar = document.getElementById("permEliminar").checked;
    const detalle = document.getElementById("permDetalle").checked;

    if (!perfil || !modulo) {
      showAlert("Perfil y módulo son obligatorios.", "error");
      return;
    }

    const permisos = getPermisos();
    const existing = permisos.find((p) => p.perfil === perfil && p.modulo === modulo);

    if (existing) {
      const updatedPermisos = permisos.map((p) =>
        p.perfil === perfil && p.modulo === modulo
          ? { ...p, agregar, editar, consulta, eliminar, detalle }
          : p
      );
      savePermisos(updatedPermisos);
      showAlert("Permiso actualizado correctamente.", "success");
    } else {
      permisos.push({
        id: getNextPermisoId(permisos),
        perfil,
        modulo,
        agregar,
        editar,
        consulta,
        eliminar,
        detalle
      });
      savePermisos(permisos);
      showAlert("Permiso creado correctamente.", "success");
    }

    form.reset();
    renderPermisosTable();
  });
}

function bindPermisoSearch() {
  const input = document.getElementById("permisoSearch");
  if (!input) return;

  input.addEventListener("input", (e) => {
    permisosSearchTerm = e.target.value.trim();
    permisosCurrentPage = 1;
    renderPermisosTable();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  requireModuleAccess("Permisos Perfil");
  buildMenu();
  loadPermisosSelects();
  bindPermisoForm();
  renderPermisosTable();
  bindPermisoSearch();

  const submitBtn = document.getElementById("btnGuardarPermiso");
  protectButtonByPermission(submitBtn, "Permisos Perfil", "agregar");
});