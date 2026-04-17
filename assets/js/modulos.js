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

function renderModulosTable() {
  const tableBody = document.getElementById("modulosTableBody");
  if (!tableBody) return;

  const modulos = getModulos();

  if (modulos.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6">No hay módulos registrados.</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = modulos.map((modulo, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${modulo.nombre}</td>
      <td>${modulo.clave}</td>
      <td>${modulo.ruta}</td>
      <td>${modulo.tipo}</td>
      <td>
        <div class="actions">
          <a class="btn btn-warning" href="./modulo-form.html?id=${modulo.id}">Editar</a>
          <button class="btn btn-danger" onclick="deleteModulo(${modulo.id})">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function deleteModulo(id) {
  const confirmed = confirmDelete("¿Seguro que deseas eliminar este módulo?");
  if (!confirmed) return;

  let modulos = getModulos();
  modulos = modulos.filter((modulo) => modulo.id !== id);
  saveModulos(modulos);
  renderModulosTable();
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
    const modulos = getModulos();
    const modulo = modulos.find((m) => m.id === Number(id));

    if (modulo) {
      formTitle.textContent = "Editar Módulo";
      formTitleBreadcrumb.textContent = "Editar";
      moduloIdInput.value = modulo.id;
      nombreModuloInput.value = modulo.nombre;
      claveModuloInput.value = modulo.clave;
      rutaModuloInput.value = modulo.ruta;
      tipoModuloInput.value = modulo.tipo;
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
      alert("Todos los campos son obligatorios.");
      return;
    }

    const duplicateClave = modulos.find(
      (m) => m.clave.toLowerCase() === clave.toLowerCase() && m.id !== Number(moduloId)
    );

    if (duplicateClave) {
      alert("Ya existe un módulo con esa clave.");
      return;
    }

    if (moduloId) {
      const updatedModulos = modulos.map((m) =>
        m.id === Number(moduloId)
          ? { ...m, nombre, clave, ruta, tipo }
          : m
      );
      saveModulos(updatedModulos);
    } else {
      const newModulo = {
        id: getNextModuloId(modulos),
        nombre,
        clave,
        ruta,
        tipo
      };
      modulos.push(newModulo);
      saveModulos(modulos);
    }

    window.location.href = "./modulos.html";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  requireAuth();
  bindLogoutButton();
  renderModulosTable();
  loadModuloForm();
});