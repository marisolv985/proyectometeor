function getPerfiles() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.PERFILES)) || [];
}

function savePerfiles(perfiles) {
  localStorage.setItem(STORAGE_KEYS.PERFILES, JSON.stringify(perfiles));
}

function getNextPerfilId(perfiles) {
  if (perfiles.length === 0) return 1;
  return Math.max(...perfiles.map((p) => p.id)) + 1;
}

function renderPerfilesTable() {
  const tableBody = document.getElementById("perfilesTableBody");
  if (!tableBody) return;

  const perfiles = getPerfiles();

  if (perfiles.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="4">No hay perfiles registrados.</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = perfiles.map((perfil, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${perfil.nombre}</td>
      <td>${perfil.administrador ? "Sí" : "No"}</td>
      <td>
        <div class="actions">
          <a class="btn btn-warning perfil-edit-btn" href="./perfil-form.html?id=${perfil.id}">Editar</a>
          <button class="btn btn-danger perfil-delete-btn" onclick="deletePerfil(${perfil.id})">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join("");

  protectButtonsByPermission(".perfil-edit-btn", "Perfiles", "editar");
  protectButtonsByPermission(".perfil-delete-btn", "Perfiles", "eliminar");
}

function deletePerfil(id) {
  if (!hasPermission("Perfiles", "eliminar")) {
    alert("No tienes permiso para eliminar.");
    return;
  }

  const confirmed = confirmDelete("¿Seguro que deseas eliminar este perfil?");
  if (!confirmed) return;

  let perfiles = getPerfiles();
  perfiles = perfiles.filter((perfil) => perfil.id !== id);
  savePerfiles(perfiles);
  renderPerfilesTable();
}

function loadPerfilForm() {
  const form = document.getElementById("perfilForm");
  if (!form) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const formTitle = document.getElementById("formTitle");
  const formTitleBreadcrumb = document.getElementById("formTitleBreadcrumb");
  const perfilIdInput = document.getElementById("perfilId");
  const nombrePerfilInput = document.getElementById("nombrePerfil");
  const bitAdministradorInput = document.getElementById("bitAdministrador");

  if (id) {
    if (!hasPermission("Perfiles", "editar")) {
      window.location.href = "./error-403.html";
      return;
    }

    const perfiles = getPerfiles();
    const perfil = perfiles.find((p) => p.id === Number(id));

    if (perfil) {
      formTitle.textContent = "Editar Perfil";
      formTitleBreadcrumb.textContent = "Editar";
      perfilIdInput.value = perfil.id;
      nombrePerfilInput.value = perfil.nombre;
      bitAdministradorInput.checked = perfil.administrador;
    }
  } else {
    if (!hasPermission("Perfiles", "agregar")) {
      window.location.href = "./error-403.html";
      return;
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const perfiles = getPerfiles();
    const perfilId = perfilIdInput.value;
    const nombre = nombrePerfilInput.value.trim();
    const administrador = bitAdministradorInput.checked;

    if (!nombre) {
      alert("El nombre del perfil es obligatorio.");
      return;
    }

    const duplicate = perfiles.find(
      (p) =>
        p.nombre.toLowerCase() === nombre.toLowerCase() &&
        p.id !== Number(perfilId)
    );

    if (duplicate) {
      alert("Ya existe un perfil con ese nombre.");
      return;
    }

    if (perfilId) {
      const updatedPerfiles = perfiles.map((p) =>
        p.id === Number(perfilId)
          ? { ...p, nombre, administrador }
          : p
      );
      savePerfiles(updatedPerfiles);
    } else {
      const newPerfil = {
        id: getNextPerfilId(perfiles),
        nombre,
        administrador
      };
      perfiles.push(newPerfil);
      savePerfiles(perfiles);
    }

    window.location.href = "./perfiles.html";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  requireModuleAccess("Perfiles");
  buildMenu();
  renderPerfilesTable();
  loadPerfilForm();

  const newButton = document.querySelector('a[href="./perfil-form.html"]');
  protectButtonByPermission(newButton, "Perfiles", "agregar");
});