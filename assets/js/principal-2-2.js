document.addEventListener("DOMContentLoaded", async () => {
  const permissions = await getModulePermissions("principal_2_2");

  applyButtonPermissions({
    permissions,
    addSelector: "#btnP22Nuevo",
    consultSelector: "#btnP22Consultar",
    editSelector: "#btnP22Editar",
    deleteSelector: "#btnP22Eliminar"
  });

  if (!permissions.bitConsulta) {
    const content = document.getElementById("principal22Content");
    if (content) {
      content.innerHTML = `<div class="message-box message-error" style="display:block;">No tienes permiso para consultar este módulo.</div>`;
      return;
    }
  }

  const guardarBtn = document.getElementById("btnP22Guardar");
  if (guardarBtn) {
    guardarBtn.style.display = permissions.bitEditar || permissions.bitAgregar ? "" : "none";
  }
});