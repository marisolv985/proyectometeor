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

function renderUsuariosTable() {
  const tableBody = document.getElementById("usuariosTableBody");
  if (!tableBody) return;

  const usuarios = getUsuarios();

  if (usuarios.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6">No hay usuarios registrados.</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = usuarios.map((usuario, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${usuario.nombre}</td>
      <td>${usuario.correo}</td>
      <td>${usuario.perfil}</td>
      <td>${usuario.estado}</td>
      <td>
        <div class="actions">
          <a class="btn btn-warning" href="./usuario-form.html?id=${usuario.id}">Editar</a>
          <button class="btn btn-danger" onclick="deleteUsuario(${usuario.id})">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function deleteUsuario(id) {
  const confirmed = confirmDelete("¿Seguro que deseas eliminar este usuario?");
  if (!confirmed) return;

  let usuarios = getUsuarios();
  usuarios = usuarios.filter((usuario) => usuario.id !== id);
  saveUsuarios(usuarios);
  renderUsuariosTable();
}

function loadPerfilesSelect() {
  const perfilSelect = document.getElementById("perfilUsuario");
  if (!perfilSelect) return;

  const perfiles = getPerfilesUsuarios();

  perfilSelect.innerHTML = `
    <option value="">Selecciona un perfil</option>
    ${perfiles.map((perfil) => `
      <option value="${perfil.nombre}">${perfil.nombre}</option>
    `).join("")}
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
    const usuarios = getUsuarios();
    const usuario = usuarios.find((u) => u.id === Number(id));

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
      alert("Todos los campos son obligatorios.");
      return;
    }

    const duplicateCorreo = usuarios.find(
      (u) => u.correo.toLowerCase() === correo && u.id !== Number(usuarioId)
    );

    if (duplicateCorreo) {
      alert("Ya existe un usuario con ese correo.");
      return;
    }

    if (usuarioId) {
      const updatedUsuarios = usuarios.map((u) =>
        u.id === Number(usuarioId)
          ? { ...u, nombre, correo, password, perfil, estado }
          : u
      );
      saveUsuarios(updatedUsuarios);
    } else {
      const newUsuario = {
        id: getNextUsuarioId(usuarios),
        nombre,
        correo,
        password,
        perfil,
        estado
      };
      usuarios.push(newUsuario);
      saveUsuarios(usuarios);
    }

    window.location.href = "./usuarios.html";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  requireAuth();
  bindLogoutButton();
  renderUsuariosTable();
  loadUsuarioForm();
});