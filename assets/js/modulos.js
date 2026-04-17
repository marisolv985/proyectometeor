let modulosCurrentPage = 1;
let modulosSearchTerm = "";

function getModulos() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.MODULOS)) || [];
}

function saveModulos(modulos) {
  localStorage.setItem(STORAGE_KEYS.MODULOS, JSON.stringify(modulos));
}

function getNextModuloId(modulos) {
  if (modulos.length === 0) return 1;
  return Math.max(...modulos.map((m) => m.id)) + 1;
}

function getFilteredModulos() {
  const modulos = getModulos();
  return modulos.filter((modulo) =>
    [modulo.nombre, modulo.clave, modulo.ruta, modulo.tipo]
      .join(" ")
      .toLowerCase()
      .includes(modulosSearchTerm.toLowerCase())
  );
}

function renderModulosTable() {
  const tableBody = document.getElementById("modulosTableBody");
  if (!tableBody) return;

  const filtered = getFilteredModulos();
  const paginated = paginateData(filtered, modulosCurrentPage, 5);
  modulosCurrentPage = paginated.currentPage;

  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">No hay módulos registrados.</td>
      </tr>
    `;
    renderPagination("modulosPagination", 0, 1, "setModulosPage", 5);
    return;
  }

  tableBody.innerHTML = paginated.items.map((modulo, index) => `
    <tr>
      <td>${(paginated.currentPage - 1) * 5 + index + 1}</td>
      <td>${escapeHtml(modulo.nombre)}</td>
      <td>${escapeHtml(modulo.clave)}</td>
      <td>${escapeHtml(modulo.ruta)}</td>
      <td>${escapeHtml(modulo.tipo)}</td>
      <td>
        <div class="actions">
          <button class="btn btn-info modulo-detail-btn" onclick="showModuloDetail(${modulo.id})">Detalle</button>
          <a class="btn btn-warning modulo-edit-btn" href="./modulo-form.html?id=${modulo.id}">Editar</a>
          <button class="btn btn-danger modulo-delete-btn" onclick="deleteModulo(${modulo.id})">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join("");

  renderPagination("modulosPagination", filtered.length, modulosCurrentPage, "setModulosPage", 5);

  protectButtonsByPermission(".modulo-detail-btn", "Módulos", "detalle");
  protectButtonsByPermission(".modulo-edit-btn", "Módulos", "editar");
  protectButtonsByPermission(".modulo-delete-btn", "Módulos", "eliminar");
}

function setModulosPage(page) {
  modulosCurrentPage = page;
  renderModulosTable();
}

function showModuloDetail(id) {
  if (!hasPermission("Módulos", "detalle")) {
    showAlert("No tienes permiso para ver detalle.", "error");
    return;
  }

  const modulo = getModulos().find((m) => m.id === id);
  if (!modulo) return;

  renderDetailModal("Detalle del Módulo", {
    "ID": modulo.id,
    "Nombre": modulo.nombre,
    "Clave": modulo.clave,
    "Ruta": modulo.ruta,
    "Tipo": modulo.tipo
  });
}

function deleteModulo(id) {
  if (!hasPermission("Módulos", "eliminar")) {
    showAlert("No tienes permiso para eliminar.", "error");
    return;
  }

  confirmDeleteModal("¿Seguro que deseas eliminar este módulo?", () => {
    let modulos = getModulos();
    modulos = modulos.filter((modulo) => modulo.id !== id);
    saveModulos(modulos);
    renderModulosTable();
    showAlert("Módulo eliminado correctamente.", "success");
  });
}

function loadModuloForm() {
  const form = document.getElementById("moduloForm");
  if (!form) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const formTitle = document.getElementById("moduloFormTitle");
  const formTitleBreadcrumb = document.getElementById("moduloFormTitleBreadcrumb");

  const moduloIdInput = document.getElementById("moduloId");
  const nombreModuloInput = document.getElementById("nombreModulo");
  const claveModuloInput = document.getElementById("claveModulo");
  const rutaModuloInput = document.getElementById("rutaModulo");
  const tipoModuloInput = document.getElementById("tipoModulo");

  if (id) {
    if (!hasPermission("Módulos", "editar")) {
      window.location.href = "./error-403.html";
      return;
    }

    const modulo = getModulos().find((m) => m.id === Number(id));
    if (modulo) {
      formTitle.textContent = "Editar Módulo";
      formTitleBreadcrumb.textContent = "Editar";
      moduloIdInput.value = modulo.id;
      nombreModuloInput.value = modulo.nombre;
      claveModuloInput.value = modulo.clave;
      rutaModuloInput.value = modulo.ruta;
      tipoModuloInput.value = modulo.tipo;
    }
  } else {
    if (!hasPermission("Módulos", "agregar")) {
      window.location.href = "./error-403.html";
      return;
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const modulos = getModulos();
    const moduloId = moduloIdInput.value;
    const nombre = nombreModuloInput.value.trim();
    const clave = claveModuloInput.value.trim().toUpperCase();
    const ruta = rutaModuloInput.value.trim();
    const tipo = tipoModuloInput.value;

    if (!nombre || !clave || !ruta || !tipo) {
      showAlert("Todos los campos son obligatorios.", "error");
      return;
    }

    const duplicateClave = modulos.find(
      (m) => m.clave.toLowerCase() === clave.toLowerCase() && m.id !== Number(moduloId)
    );

    if (duplicateClave) {
      showAlert("Ya existe un módulo con esa clave.", "error");
      return;
    }

    if (moduloId) {
      const updatedModulos = modulos.map((m) =>
        m.id === Number(moduloId) ? { ...m, nombre, clave, ruta, tipo } : m
      );
      saveModulos(updatedModulos);
      showAlert("Módulo actualizado correctamente.", "success");
    } else {
      modulos.push({
        id: getNextModuloId(modulos),
        nombre,
        clave,
        ruta,
        tipo
      });
      saveModulos(modulos);
      showAlert("Módulo creado correctamente.", "success");
    }

    setTimeout(() => {
      window.location.href = "./modulos.html";
    }, 700);
  });
}

function bindModuloSearch() {
  const input = document.getElementById("moduloSearch");
  if (!input) return;

  input.addEventListener("input", (e) => {
    modulosSearchTerm = e.target.value.trim();
    modulosCurrentPage = 1;
    renderModulosTable();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  requireModuleAccess("Módulos");
  buildMenu();
  renderModulosTable();
  loadModuloForm();
  bindModuloSearch();

  const newButton = document.getElementById("btnNuevoModulo");
  protectButtonByPermission(newButton, "Módulos", "agregar");
});