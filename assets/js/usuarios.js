let usuariosCurrentPage = 1;
let usuariosSearchTerm = "";

function getUsuarios() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
}

function saveUsuarios(usuarios) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(usuarios));
}

function getPerfilesUsuarios() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.PERFILES)) || [];
}

function getNextUsuarioId(usuarios) {
  if (usuarios.length === 0) return 1;
  return Math.max(...usuarios.map((u) => u.id)) + 1;
}

function getFilteredUsuarios() {
  const usuarios = getUsuarios();
  return usuarios.filter((usuario) =>
    [usuario.nombre, usuario.correo, usuario.perfil, usuario.estado]
      .join(" ")
      .toLowerCase()
      .includes(usuariosSearchTerm.toLowerCase())
  );
}

function renderUsuariosTable() {
  const tableBody = document.getElementById("usuariosTableBody");
  if (!tableBody) return;

  const filtered = getFilteredUsuarios();
  const paginated = paginateData(filtered, usuariosCurrentPage, 5);
  usuariosCurrentPage = paginated.currentPage;

  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">No hay usuarios registrados.</td>
      </tr>
    `;
    renderPagination("usuariosPagination", 0, 1, "setUsuariosPage", 5);
    return;
  }

  tableBody.innerHTML = paginated.items.map((usuario, index) => `
    <tr>
      <td>${(paginated.currentPage - 1) * 5 + index + 1}</td>
      <td>${escapeHtml(usuario.nombre)}</td>
      <td>${escapeHtml(usuario.correo)}</td>
      <td>${escapeHtml(usuario.perfil)}</td>
      <td>${usuario.estado === "Activo" ? '<span class="badge-active">Activo</span>' : '<span class="badge-inactive">Inactivo</span>'}</td>
      <td>
        <div class="actions">
          <button class="btn btn-info usuario-detail-btn" onclick="showUsuarioDetail(${usuario.id})">Detalle</button>
          <a class="btn btn-warning usuario-edit-btn" href="./usuario-form.html?id=${usuario.id}">Editar</a>
          <button class="btn btn-danger usuario-delete-btn" onclick="deleteUsuario(${usuario.id})">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join("");

  renderPagination("usuariosPagination", filtered.length, usuariosCurrentPage, "setUsuariosPage", 5);

  protectButtonsByPermission(".usuario-detail-btn", "Usuarios", "detalle");
  protectButtonsByPermission(".usuario-edit-btn", "Usuarios", "editar");
  protectButtonsByPermission(".usuario-delete-btn", "Usuarios", "eliminar");
}

function setUsuariosPage(page) {
  usuariosCurrentPage = page;
  renderUsuariosTable();
}

function showUsuarioDetail(id) {
  if (!hasPermission("Usuarios", "detalle")) {
    showAlert("No tienes permiso para ver detalle.", "error");
    return;
  }

  const usuario = getUsuarios().find((u) => u.id === id);
  if (!usuario) return;

  renderDetailModal("Detalle del Usuario", {
    "ID": usuario.id,
    "Nombre": usuario.nombre,
    "Correo": usuario.correo,
    "Perfil": usuario.perfil,
    "Estado": usuario.estado
  });
}

function deleteUsuario(id) {
  if (!hasPermission("Usuarios", "eliminar")) {
    showAlert("No tienes permiso para eliminar.", "error");
    return;
  }

  confirmDeleteModal("¿Seguro que deseas eliminar este usuario?", () => {
    let usuarios = getUsuarios();
    usuarios = usuarios.filter((usuario) => usuario.id !== id);
    saveUsuarios(usuarios);
    renderUsuariosTable();
    showAlert("Usuario eliminado correctamente.", "success");
  });
}

function loadPerfilesSelect() {
  const perfilSelect = document.getElementById("perfilUsuario");
  if (!perfilSelect) return;

  const perfiles = getPerfilesUsuarios();
  perfilSelect.innerHTML = `
    <option value="">Selecciona un perfil</option>
    ${perfiles.map((perfil) => `<option value="${perfil.nombre}">${perfil.nombre}</option>`).join("")}
  `;
}

function loadUsuarioForm() {
  const form = document.getElementById("usuarioForm");
  if (!form) return;

  loadPerfilesSelect();

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const formTitle = document.getElementById("usuarioFormTitle");
  const formTitleBreadcrumb = document.getElementById("usuarioFormTitleBreadcrumb");

  const usuarioIdInput = document.getElementById("usuarioId");
  const nombreUsuarioInput = document.getElementById("nombreUsuario");
  const correoUsuarioInput = document.getElementById("correoUsuario");
  const passwordUsuarioInput = document.getElementById("passwordUsuario");
  const perfilUsuarioInput = document.getElementById("perfilUsuario");
  const estadoUsuarioInput = document.getElementById("estadoUsuario");

  if (id) {
    if (!hasPermission("Usuarios", "editar")) {
      window.location.href = "./error-403.html";
      return;
    }

    const usuario = getUsuarios().find((u) => u.id === Number(id));
    if (usuario) {
      formTitle.textContent = "Editar Usuario";
      formTitleBreadcrumb.textContent = "Editar";
      usuarioIdInput.value = usuario.id;
      nombreUsuarioInput.value = usuario.nombre;
      correoUsuarioInput.value = usuario.correo;
      passwordUsuarioInput.value = usuario.password;
      perfilUsuarioInput.value = usuario.perfil;
      estadoUsuarioInput.value = usuario.estado;
    }
  } else {
    if (!hasPermission("Usuarios", "agregar")) {
      window.location.href = "./error-403.html";
      return;
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const usuarios = getUsuarios();
    const usuarioId = usuarioIdInput.value;
    const nombre = nombreUsuarioInput.value.trim();
    const correo = correoUsuarioInput.value.trim().toLowerCase();
    const password = passwordUsuarioInput.value.trim();
    const perfil = perfilUsuarioInput.value;
    const estado = estadoUsuarioInput.value;

    if (!nombre || !correo || !password || !perfil || !estado) {
      showAlert("Todos los campos son obligatorios.", "error");
      return;
    }

    const duplicateCorreo = usuarios.find(
      (u) => u.correo.toLowerCase() === correo && u.id !== Number(usuarioId)
    );

    if (duplicateCorreo) {
      showAlert("Ya existe un usuario con ese correo.", "error");
      return;
    }

    if (usuarioId) {
      const updatedUsuarios = usuarios.map((u) =>
        u.id === Number(usuarioId)
          ? { ...u, nombre, correo, password, perfil, estado }
          : u
      );
      saveUsuarios(updatedUsuarios);
      showAlert("Usuario actualizado correctamente.", "success");
    } else {
      usuarios.push({
        id: getNextUsuarioId(usuarios),
        nombre,
        correo,
        password,
        perfil,
        estado
      });
      saveUsuarios(usuarios);
      showAlert("Usuario creado correctamente.", "success");
    }

    setTimeout(() => {
      window.location.href = "./usuarios.html";
    }, 700);
  });
}

function bindUsuarioSearch() {
  const input = document.getElementById("usuarioSearch");
  if (!input) return;

  input.addEventListener("input", (e) => {
    usuariosSearchTerm = e.target.value.trim();
    usuariosCurrentPage = 1;
    renderUsuariosTable();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  requireModuleAccess("Usuarios");
  buildMenu();
  renderUsuariosTable();
  loadUsuarioForm();
  bindUsuarioSearch();

  const newButton = document.getElementById("btnNuevoUsuario");
  protectButtonByPermission(newButton, "Usuarios", "agregar");
});