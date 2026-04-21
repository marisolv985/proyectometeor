document.addEventListener("DOMContentLoaded", async () => {
  const permissions = await getModulePermissions("principal_2_1");

  applyButtonPermissions({
    permissions,
    addSelector: "#btnP21Nuevo",
    consultSelector: "#btnP21Consultar",
    editSelector: "#btnP21Editar",
    deleteSelector: "#btnP21Eliminar"
  });

  if (!permissions.bitConsulta) {
    const content = document.getElementById("principal21Content");
    if (content) {
      content.innerHTML = `<div class="message-box message-error" style="display:block;">No tienes permiso para consultar este módulo.</div>`;
    }
  }
});