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

function renderPermisosTable() {
  const tableBody = document.getElementById("permisosTableBody");
  if (!tableBody) return;

  const permisos = getPermisos();

  if (permisos.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="9">No hay permisos registrados.</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = permisos.map((permiso, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${permiso.perfil}</td>
      <td>${permiso.modulo}</td>
      <td>${badge(permiso.agregar)}</td>
      <td>${badge(permiso.editar)}</td>
      <td>${badge(permiso.consulta)}</td>
      <td>${badge(permiso.eliminar)}</td>
      <td>${badge(permiso.detalle)}</td>
      <td>
        <div class="actions">
          <button class="btn btn-danger permiso-delete-btn" onclick="deletePermiso(${permiso.id})">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join("");

  protectButtonsByPermission(".permiso-delete-btn", "Permisos Perfil", "eliminar");
}

function deletePermiso(id) {
  if (!hasPermission("Permisos Perfil", "eliminar")) {
    alert("No tienes permiso para eliminar.");
    return;
  }

  const confirmed = confirmDelete("¿Seguro que deseas eliminar este permiso?");
  if (!confirmed) return;

  let permisos = getPermisos();
  permisos = permisos.filter((permiso) => permiso.id !== id);
  savePermisos(permisos);
  renderPermisosTable();
}

function bindPermisoForm() {
  const form = document.getElementById("permisoPerfilForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!hasPermission("Permisos Perfil", "agregar") && !isAdminProfile()) {
      alert("No tienes permiso para guardar.");
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
      alert("Perfil y módulo son obligatorios.");
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
    }

    form.reset();
    renderPermisosTable();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  requireModuleAccess("Permisos Perfil");
  buildMenu();
  loadPermisosSelects();
  bindPermisoForm();
  renderPermisosTable();

  const submitBtn = document.querySelector('#permisoPerfilForm button[type="submit"]');
  protectButtonByPermission(submitBtn, "Permisos Perfil", "agregar");
});