let moduloFormPermissions = null;
let moduloEditId = null;
let moduloModo = "nuevo";
let moduloCatalogos = { menus: [] };

document.addEventListener("DOMContentLoaded", async () => {
  moduloFormPermissions = await getModulePermissions("modulo");

  const params = new URLSearchParams(window.location.search);
  moduloEditId = params.get("id");

  if (moduloEditId) {
    moduloModo = "editar";
  }

  configurarVistaModuloForm();
  await validarPermisosModuloForm();
  await loadCatalogosModuloForm();
  await cargarModuloSiEsEdicion();

  document.getElementById("moduloForm")?.addEventListener("submit", guardarModulo);
});

function configurarVistaModuloForm() {
  const title = document.getElementById("moduloFormTitle");
  const subtitle = document.getElementById("moduloFormSubtitle");
  const breadcrumb = document.getElementById("moduloFormBreadcrumb");

  if (moduloModo === "editar") {
    title.textContent = "Editar Módulo";
    subtitle.textContent = "Modifica la información del módulo seleccionado.";
    breadcrumb.innerHTML = `Inicio / Seguridad / Módulo / <strong>Editar</strong>`;
  } else {
    title.textContent = "Nuevo Módulo";
    subtitle.textContent = "Captura la información del módulo.";
    breadcrumb.innerHTML = `Inicio / Seguridad / Módulo / <strong>Nuevo</strong>`;
  }
}

async function validarPermisosModuloForm() {
  if (moduloModo === "nuevo" && !moduloFormPermissions.bitAgregar) {
    alert("No tienes permiso para crear módulos.");
    window.location.href = "./modulos.html";
    return;
  }

  if (moduloModo === "editar" && !moduloFormPermissions.bitEditar) {
    alert("No tienes permiso para editar módulos.");
    window.location.href = "./modulos.html";
  }
}

async function loadCatalogosModuloForm() {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/modulos/catalogos`);
    const result = await response.json();

    if (!response.ok || !result.ok) {
      alert("No se pudieron cargar los menús.");
      return;
    }

    moduloCatalogos = result.data;

    document.getElementById("idMenu").innerHTML = moduloCatalogos.menus.map((menu) => `
      <option value="${menu.id}">${menu.strNombreMenu}</option>
    `).join("");
  } catch (error) {
    console.error(error);
    alert("Error cargando menús.");
  }
}

async function cargarModuloSiEsEdicion() {
  if (!moduloEditId) return;

  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/modulos/${moduloEditId}`);
    const result = await response.json();

    if (!response.ok || !result.ok) {
      alert(result.message || "No se pudo cargar el módulo.");
      window.location.href = "./modulos.html";
      return;
    }

    document.getElementById("strNombreModulo").value = result.data.strNombreModulo || "";
    document.getElementById("strClaveModulo").value = result.data.strClaveModulo || "";
    document.getElementById("strRutaModulo").value = result.data.strRutaModulo || "";
    document.getElementById("bitEstatico").value = String(result.data.bitEstatico);
    document.getElementById("idMenu").value = result.data.idMenu || "";
  } catch (error) {
    console.error(error);
    alert("Error cargando el módulo.");
    window.location.href = "./modulos.html";
  }
}

async function guardarModulo(e) {
  e.preventDefault();

  const strNombreModulo = document.getElementById("strNombreModulo").value.trim();
  const strClaveModulo = document.getElementById("strClaveModulo").value.trim();
  const strRutaModulo = document.getElementById("strRutaModulo").value.trim();
  const bitEstatico = document.getElementById("bitEstatico").value === "true";
  const idMenu = Number(document.getElementById("idMenu").value);
  const messageBox = document.getElementById("moduloFormMessage");

  if (!strNombreModulo || !strClaveModulo || !strRutaModulo || !idMenu) {
    messageBox.className = "message-box message-error";
    messageBox.textContent = "Todos los campos son obligatorios.";
    return;
  }

  const url = moduloModo === "editar"
    ? `${API_BASE_URL}/modulos/${moduloEditId}`
    : `${API_BASE_URL}/modulos`;

  const method = moduloModo === "editar" ? "PUT" : "POST";

  try {
    const response = await fetchWithAuth(url, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        strNombreModulo,
        strClaveModulo,
        strRutaModulo,
        bitEstatico,
        idMenu
      })
    });

    const result = await response.json();

    if (!response.ok) {
      messageBox.className = "message-box message-error";
      messageBox.textContent = result.message || "No se pudo guardar.";
      return;
    }

    messageBox.className = "message-box message-success";
    messageBox.textContent = result.message || "Guardado correctamente.";

    setTimeout(() => {
      window.location.href = "./modulos.html";
    }, 700);
  } catch (error) {
    console.error(error);
    messageBox.className = "message-box message-error";
    messageBox.textContent = "Error de conexión con el servidor.";
  }
}