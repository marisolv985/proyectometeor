async function getModulePermissions(moduloClave) {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/permisos/modulo/${moduloClave}`);
    const result = await response.json();

    if (!response.ok || !result.ok) {
      return {
        bitAgregar: false,
        bitEditar: false,
        bitConsulta: false,
        bitEliminar: false,
        bitDetalle: false
      };
    }

    return result.data;
  } catch (error) {
    console.error("Error obteniendo permisos del módulo:", error);
    return {
      bitAgregar: false,
      bitEditar: false,
      bitConsulta: false,
      bitEliminar: false,
      bitDetalle: false
    };
  }
}

function applyButtonPermissions(config) {
  const {
    permissions,
    addSelector,
    editSelector,
    deleteSelector,
    detailSelector,
    consultSelector
  } = config;

  if (addSelector) {
    document.querySelectorAll(addSelector).forEach(el => {
      el.style.display = permissions.bitAgregar ? "" : "none";
    });
  }

  if (editSelector) {
    document.querySelectorAll(editSelector).forEach(el => {
      el.style.display = permissions.bitEditar ? "" : "none";
    });
  }

  if (deleteSelector) {
    document.querySelectorAll(deleteSelector).forEach(el => {
      el.style.display = permissions.bitEliminar ? "" : "none";
    });
  }

  if (detailSelector) {
    document.querySelectorAll(detailSelector).forEach(el => {
      el.style.display = permissions.bitDetalle ? "" : "none";
    });
  }

  if (consultSelector) {
    document.querySelectorAll(consultSelector).forEach(el => {
      el.style.display = permissions.bitConsulta ? "" : "none";
    });
  }
}
