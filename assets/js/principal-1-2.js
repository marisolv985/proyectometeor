document.addEventListener("DOMContentLoaded", async () => {
  const permissions = await getModulePermissions("principal_1_2");

  applyButtonPermissions({
    permissions,
    addSelector: "#btnP12Nuevo",
    consultSelector: "#btnP12Consultar",
    editSelector: "#btnP12Editar",
    deleteSelector: "#btnP12Eliminar",
    detailSelector: "#btnP12Detalle"
  });

  if (!permissions.bitConsulta) {
    const content = document.getElementById("principal12Content");
    if (content) {
      content.innerHTML = `<div class="message-box message-error" style="display:block;">No tienes permiso para consultar este módulo.</div>`;
    }
  }
});