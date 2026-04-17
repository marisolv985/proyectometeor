let perfilesCurrentPage = 1;
let perfilesSearchTerm = "";

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

function getFilteredPerfiles() {
  const perfiles = getPerfiles();
  return perfiles.filter((perfil) =>
    perfil.nombre.toLowerCase().includes(perfilesSearchTerm.toLowerCase())
  );
}

function renderPerfilesTable() {
  const tableBody = document.getElementById("perfilesTableBody");
  if (!tableBody) return;

  const filtered = getFilteredPerfiles();
  const paginated = paginateData(filtered, perfilesCurrentPage, 5);
  perfilesCurrentPage = paginated.currentPage;

  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" class="empty-state">No hay perfiles registrados.</td>
      </tr>
    `;
    renderPagination("perfilesPagination", 0, 1, "setPerfilesPage", 5);
    return;
  }

  tableBody.innerHTML = paginated.items.map((perfil, index) => `
    <tr>
      <td>${(paginated.currentPage - 1) * 5 + index + 1}</td>
      <td>${escapeHtml(perfil.nombre)}</td>
      <td>${perfil.administrador ? '<span class="badge-yes">Sí</span>' : '<span class="badge-no">No</span>'}</td>
      <td>
        <div class="actions">
          <button class="btn btn-info perfil-detail-btn" onclick="showPerfilDetail(${perfil.id})">Detalle</button>
          <a class="btn btn-warning perfil-edit-btn" href="./perfil-form.html?id=${perfil.id}">Editar</a>
          <button class="btn btn-danger perfil-delete-btn" onclick="deletePerfil(${perfil.id})">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join("");

  renderPagination("perfilesPagination", filtered.length, perfilesCurrentPage, "setPerfilesPage", 5);

  protectButtonsByPermission(".perfil-detail-btn", "Perfiles", "detalle");
  protectButtonsByPermission(".perfil-edit-btn", "Perfiles", "editar");
  protectButtonsByPermission(".perfil-delete-btn", "Perfiles", "eliminar");
}

function setPerfilesPage(page) {
  perfilesCurrentPage = page;
  renderPerfilesTable();
}

function showPerfilDetail(id) {
  if (!hasPermission("Perfiles", "detalle")) {
    showAlert("No tienes permiso para ver detalle.", "error");
    return;
  }

  const perfil = getPerfiles().find((p) => p.id === id);
  if (!perfil) return;

  renderDetailModal("Detalle del Perfil", {
    "ID": perfil.id,
    "Nombre": perfil.nombre,
    "Administrador": perfil.administrador ? "Sí" : "No"
  });
}

function deletePerfil(id) {
  if (!hasPermission("Perfiles", "eliminar")) {
    showAlert("No tienes permiso para eliminar.", "error");
    return;
  }

  confirmDeleteModal("¿Seguro que deseas eliminar este perfil?", () => {
    let perfiles = getPerfiles();
    perfiles = perfiles.filter((perfil) => perfil.id !== id);
    savePerfiles(perfiles);
    renderPerfilesTable();
    showAlert("Perfil eliminado correctamente.", "success");
  });
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

    const perfil = getPerfiles().find((p) => p.id === Number(id));
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
      showAlert("El nombre del perfil es obligatorio.", "error");
      return;
    }

    const duplicate = perfiles.find(
      (p) => p.nombre.toLowerCase() === nombre.toLowerCase() && p.id !== Number(perfilId)
    );

    if (duplicate) {
      showAlert("Ya existe un perfil con ese nombre.", "error");
      return;
    }

    if (perfilId) {
      const updatedPerfiles = perfiles.map((p) =>
        p.id === Number(perfilId) ? { ...p, nombre, administrador } : p
      );
      savePerfiles(updatedPerfiles);
      showAlert("Perfil actualizado correctamente.", "success");
    } else {
      perfiles.push({
        id: getNextPerfilId(perfiles),
        nombre,
        administrador
      });
      savePerfiles(perfiles);
      showAlert("Perfil creado correctamente.", "success");
    }

    setTimeout(() => {
      window.location.href = "./perfiles.html";
    }, 700);
  });
}

function bindPerfilSearch() {
  const input = document.getElementById("perfilSearch");
  if (!input) return;

  input.addEventListener("input", (e) => {
    perfilesSearchTerm = e.target.value.trim();
    perfilesCurrentPage = 1;
    renderPerfilesTable();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  requireModuleAccess("Perfiles");
  buildMenu();
  renderPerfilesTable();
  loadPerfilForm();
  bindPerfilSearch();

  const newButton = document.getElementById("btnNuevoPerfil");
  protectButtonByPermission(newButton, "Perfiles", "agregar");
});