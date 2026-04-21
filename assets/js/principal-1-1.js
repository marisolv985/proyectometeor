document.addEventListener("DOMContentLoaded", async () => {
  const permissions = await getModulePermissions("principal_1_1");

  applyButtonPermissions({
    permissions,
    addSelector: "#btnP11Nuevo",
    consultSelector: "#btnP11Consultar",
    editSelector: "#btnP11Editar",
    deleteSelector: "#btnP11Eliminar",
    detailSelector: "#btnP11Detalle"
  });

  if (!permissions.bitConsulta) {
    const content = document.getElementById("principal11Content");
    if (content) {
      content.innerHTML = `<div class="message-box message-error" style="display:block;">No tienes permiso para consultar este módulo.</div>`;
    }
  }
});