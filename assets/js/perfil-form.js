let perfilFormPermissions = null;
let perfilEditId = null;
let perfilModo = "nuevo";

document.addEventListener("DOMContentLoaded", async () => {
  perfilFormPermissions = await getModulePermissions("perfil_general");

  const params = new URLSearchParams(window.location.search);
  perfilEditId = params.get("id");

  if (perfilEditId) {
    perfilModo = "editar";
  }

  configurarVistaFormulario();
  await validarPermisosFormulario();
  await cargarPerfilSiEsEdicion();

  document.getElementById("perfilForm")?.addEventListener("submit", guardarPerfil);
});

function configurarVistaFormulario() {
  const title = document.getElementById("perfilFormTitle");
  const subtitle = document.getElementById("perfilFormSubtitle");
  const breadcrumb = document.getElementById("perfilFormBreadcrumb");

  if (perfilModo === "editar") {
    title.textContent = "Editar Perfil";
    subtitle.textContent = "Modifica la información del perfil seleccionado.";
    breadcrumb.innerHTML = `Inicio / Seguridad / Perfil / <strong>Editar</strong>`;
  } else {
    title.textContent = "Nuevo Perfil";
    subtitle.textContent = "Captura la información del perfil.";
    breadcrumb.innerHTML = `Inicio / Seguridad / Perfil / <strong>Nuevo</strong>`;
  }
}

async function validarPermisosFormulario() {
  if (perfilModo === "nuevo" && !perfilFormPermissions.bitAgregar) {
    alert("No tienes permiso para crear perfiles.");
    window.location.href = "./perfiles.html";
    return;
  }

  if (perfilModo === "editar" && !perfilFormPermissions.bitEditar) {
    alert("No tienes permiso para editar perfiles.");
    window.location.href = "./perfiles.html";
  }
}

async function cargarPerfilSiEsEdicion() {
  if (!perfilEditId) return;

  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/perfiles/${perfilEditId}`);
    const result = await response.json();

    if (!response.ok || !result.ok) {
      alert(result.message || "No se pudo cargar el perfil.");
      window.location.href = "./perfiles.html";
      return;
    }

    document.getElementById("strNombrePerfil").value = result.data.strNombrePerfil || "";
    document.getElementById("bitAdministrador").value = String(result.data.bitAdministrador);
  } catch (error) {
    console.error(error);
    alert("Error cargando el perfil.");
    window.location.href = "./perfiles.html";
  }
}

async function guardarPerfil(e) {
  e.preventDefault();

  const nombre = document.getElementById("strNombrePerfil").value.trim();
  const bitAdministrador = document.getElementById("bitAdministrador").value === "true";
  const messageBox = document.getElementById("perfilFormMessage");

  if (!nombre) {
    messageBox.className = "message-box message-error";
    messageBox.textContent = "El nombre del perfil es obligatorio.";
    return;
  }

  const url = perfilModo === "editar"
    ? `${API_BASE_URL}/perfiles/${perfilEditId}`
    : `${API_BASE_URL}/perfiles`;

  const method = perfilModo === "editar" ? "PUT" : "POST";

  try {
    const response = await fetchWithAuth(url, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        strNombrePerfil: nombre,
        bitAdministrador
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
      window.location.href = "./perfiles.html";
    }, 700);
  } catch (error) {
    console.error(error);
    messageBox.className = "message-box message-error";
    messageBox.textContent = "Error de conexión con el servidor.";
  }
}