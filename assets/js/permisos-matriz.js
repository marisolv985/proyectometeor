function getPerfiles() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.PERFILES)) || [];
}

function getModulos() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.MODULOS)) || [];
}

function getPermisos() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.PERMISOS)) || [];
}

function savePermisos(permisos) {
  localStorage.setItem(STORAGE_KEYS.PERMISOS, JSON.stringify(permisos));
}

function cargarPerfilesFiltro() {
  const select = document.getElementById("perfilFiltroPermisos");
  if (!select) return;

  const perfiles = getPerfiles();

  select.innerHTML = perfiles.map((perfil) => `
    <option value="${perfil.nombre}">${perfil.nombre}</option>
  `).join("");
}

function obtenerPermiso(perfil, modulo) {
  const permisos = getPermisos();
  return permisos.find((p) => p.perfil === perfil && p.modulo === modulo);
}

function crearCheckbox(checked, action, modulo) {
  return `
    <input
      type="checkbox"
      class="perm-checkbox"
      data-action="${action}"
      data-modulo="${modulo}"
      ${checked ? "checked" : ""}
    />
  `;
}

function renderizarMatrizPermisos() {
  const body = document.getElementById("permissionsMatrixBody");
  const perfil = document.getElementById("perfilFiltroPermisos")?.value;

  if (!body || !perfil) return;

  const modulos = getModulos()
    .filter((m) => m.nombre !== "Dashboard")
    .sort((a, b) => b.id - a.id);

  body.innerHTML = modulos.map((modulo) => {
    const permiso = obtenerPermiso(perfil, modulo.nombre) || {
      agregar: false,
      editar: false,
      eliminar: false,
      consulta: false,
      detalle: false
    };

    return `
      <tr>
        <td><strong>${modulo.nombre}</strong></td>
        <td>${crearCheckbox(permiso.agregar, "agregar", modulo.nombre)}</td>
        <td>${crearCheckbox(permiso.editar, "editar", modulo.nombre)}</td>
        <td>${crearCheckbox(permiso.eliminar, "eliminar", modulo.nombre)}</td>
        <td>${crearCheckbox(permiso.consulta, "consulta", modulo.nombre)}</td>
        <td>${crearCheckbox(permiso.detalle, "detalle", modulo.nombre)}</td>
      </tr>
    `;
  }).join("");
}

function guardarMatrizPermisos() {
  const perfil = document.getElementById("perfilFiltroPermisos")?.value;
  if (!perfil) return;

  let permisos = getPermisos();
  const modulos = getModulos().filter((m) => m.nombre !== "Dashboard");

  modulos.forEach((modulo) => {
    const agregar = document.querySelector(`.perm-checkbox[data-action="agregar"][data-modulo="${modulo.nombre}"]`)?.checked || false;
    const editar = document.querySelector(`.perm-checkbox[data-action="editar"][data-modulo="${modulo.nombre}"]`)?.checked || false;
    const eliminar = document.querySelector(`.perm-checkbox[data-action="eliminar"][data-modulo="${modulo.nombre}"]`)?.checked || false;
    const consulta = document.querySelector(`.perm-checkbox[data-action="consulta"][data-modulo="${modulo.nombre}"]`)?.checked || false;
    const detalle = document.querySelector(`.perm-checkbox[data-action="detalle"][data-modulo="${modulo.nombre}"]`)?.checked || false;

    const index = permisos.findIndex((p) => p.perfil === perfil && p.modulo === modulo.nombre);

    if (index >= 0) {
      permisos[index] = {
        ...permisos[index],
        agregar,
        editar,
        eliminar,
        consulta,
        detalle
      };
    } else {
      permisos.push({
        id: permisos.length ? Math.max(...permisos.map((p) => p.id)) + 1 : 1,
        perfil,
        modulo: modulo.nombre,
        agregar,
        editar,
        eliminar,
        consulta,
        detalle
      });
    }
  });

  savePermisos(permisos);
  alert("Permisos guardados correctamente.");
}

document.addEventListener("DOMContentLoaded", () => {
  if (typeof requireAuth === "function") requireAuth();
  if (typeof bindLogoutButton === "function") bindLogoutButton();

  cargarPerfilesFiltro();
  renderizarMatrizPermisos();

  document.getElementById("btnBuscarPermisos")?.addEventListener("click", renderizarMatrizPermisos);
  document.getElementById("btnGuardarPermisos")?.addEventListener("click", guardarMatrizPermisos);
  document.getElementById("btnCancelarPermisos")?.addEventListener("click", renderizarMatrizPermisos);
}); 