let usuarioFormPermissions = null;
let usuarioEditId = null;
let usuarioModo = "nuevo";
let usuarioCatalogos = { perfiles: [], estados: [] };

document.addEventListener("DOMContentLoaded", async () => {
  usuarioFormPermissions = await getModulePermissions("usuario");

  const params = new URLSearchParams(window.location.search);
  usuarioEditId = params.get("id");

  if (usuarioEditId) {
    usuarioModo = "editar";
  }

  configurarVistaUsuarioForm();
  await validarPermisosUsuarioForm();
  await loadCatalogosUsuarioForm();
  await cargarUsuarioSiEsEdicion();

  document.getElementById("usuarioForm")?.addEventListener("submit", guardarUsuario);
});

function configurarVistaUsuarioForm() {
  const title = document.getElementById("usuarioFormTitle");
  const subtitle = document.getElementById("usuarioFormSubtitle");
  const breadcrumb = document.getElementById("usuarioFormBreadcrumb");

  if (usuarioModo === "editar") {
    title.textContent = "Editar Usuario";
    subtitle.textContent = "Modifica la información del usuario seleccionado.";
    breadcrumb.innerHTML = `Inicio / Seguridad / Usuario / <strong>Editar</strong>`;
  } else {
    title.textContent = "Nuevo Usuario";
    subtitle.textContent = "Captura la información del usuario.";
    breadcrumb.innerHTML = `Inicio / Seguridad / Usuario / <strong>Nuevo</strong>`;
  }
}

async function validarPermisosUsuarioForm() {
  if (usuarioModo === "nuevo" && !usuarioFormPermissions.bitAgregar) {
    alert("No tienes permiso para crear usuarios.");
    window.location.href = "./usuarios.html";
    return;
  }

  if (usuarioModo === "editar" && !usuarioFormPermissions.bitEditar) {
    alert("No tienes permiso para editar usuarios.");
    window.location.href = "./usuarios.html";
  }
}

async function loadCatalogosUsuarioForm() {
  const response = await fetchWithAuth(`${API_BASE_URL}/usuarios/catalogos`);
  const result = await response.json();

  if (!response.ok || !result.ok) {
    alert("No se pudieron cargar los catálogos.");
    return;
  }

  usuarioCatalogos = result.data;

  document.getElementById("idPerfil").innerHTML = usuarioCatalogos.perfiles.map((item) => `
    <option value="${item.id}">${item.strNombrePerfil}</option>
  `).join("");

  document.getElementById("idEstadoUsuario").innerHTML = usuarioCatalogos.estados.map((item) => `
    <option value="${item.id}">${item.strNombreEstado}</option>
  `).join("");
}

async function cargarUsuarioSiEsEdicion() {
  if (!usuarioEditId) return;

  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/usuarios/${usuarioEditId}`);
    const result = await response.json();

    if (!response.ok || !result.ok) {
      alert(result.message || "No se pudo cargar el usuario.");
      window.location.href = "./usuarios.html";
      return;
    }

    document.getElementById("strNombreUsuario").value = result.data.strNombreUsuario || "";
    document.getElementById("strCorreo").value = result.data.strCorreo || "";
    document.getElementById("strPwd").value = "123456";
    document.getElementById("strNumeroCelular").value = result.data.strNumeroCelular || "";
    document.getElementById("idPerfil").value = result.data.idPerfil;
    document.getElementById("idEstadoUsuario").value = result.data.idEstadoUsuario;
  } catch (error) {
    console.error(error);
    alert("Error cargando usuario.");
    window.location.href = "./usuarios.html";
  }
}

async function guardarUsuario(e) {
  e.preventDefault();

  const strNombreUsuario = document.getElementById("strNombreUsuario").value.trim();
  const strCorreo = document.getElementById("strCorreo").value.trim();
  const strPwd = document.getElementById("strPwd").value.trim();
  const strNumeroCelular = document.getElementById("strNumeroCelular").value.trim();
  const idPerfil = Number(document.getElementById("idPerfil").value);
  const idEstadoUsuario = Number(document.getElementById("idEstadoUsuario").value);
  const fotoInput = document.getElementById("fotoUsuario");
  const messageBox = document.getElementById("usuarioFormMessage");

  if (!strNombreUsuario || !strCorreo || !strPwd || !idPerfil || !idEstadoUsuario) {
    messageBox.className = "message-box message-error";
    messageBox.textContent = "Completa todos los campos obligatorios.";
    return;
  }

  const url = usuarioModo === "editar"
    ? `${API_BASE_URL}/usuarios/${usuarioEditId}`
    : `${API_BASE_URL}/usuarios`;

  const method = usuarioModo === "editar" ? "PUT" : "POST";

  try {
    const response = await fetchWithAuth(url, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        strNombreUsuario,
        idPerfil,
        strPwd,
        idEstadoUsuario,
        strCorreo,
        strNumeroCelular
      })
    });

    const result = await response.json();

    if (!response.ok) {
      messageBox.className = "message-box message-error";
      messageBox.textContent = result.message || "No se pudo guardar.";
      return;
    }

    const userId = usuarioModo === "editar" ? usuarioEditId : result.data.id;

    if (fotoInput.files.length > 0) {
      const formData = new FormData();
      formData.append("foto", fotoInput.files[0]);

      await fetchWithAuth(`${API_BASE_URL}/usuarios/${userId}/foto`, {
        method: "POST",
        body: formData
      });
    }

    messageBox.className = "message-box message-success";
    messageBox.textContent = result.message || "Guardado correctamente.";

    setTimeout(() => {
      window.location.href = "./usuarios.html";
    }, 700);
  } catch (error) {
    console.error(error);
    messageBox.className = "message-box message-error";
    messageBox.textContent = "Error de conexión con el servidor.";
  }
}