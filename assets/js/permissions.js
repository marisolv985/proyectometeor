function ensureGlobalUiElements() {
  if (!document.getElementById("globalModal")) {
    const modal = document.createElement("div");
    modal.id = "globalModal";
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="modal-box">
        <div class="modal-header">
          <h3 id="globalModalTitle">Mensaje</h3>
        </div>
        <div class="modal-body" id="globalModalBody"></div>
        <div class="modal-footer" id="globalModalFooter"></div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  if (!document.getElementById("globalAlert")) {
    const alert = document.createElement("div");
    alert.id = "globalAlert";
    alert.className = "alert-floating";
    document.body.appendChild(alert);
  }
}

function escapeHtml(text) {
  return String(text ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showModal({ title = "Mensaje", body = "", actions = [] }) {
  ensureGlobalUiElements();

  const modal = document.getElementById("globalModal");
  const modalTitle = document.getElementById("globalModalTitle");
  const modalBody = document.getElementById("globalModalBody");
  const modalFooter = document.getElementById("globalModalFooter");

  modalTitle.textContent = title;
  modalBody.innerHTML = body;
  modalFooter.innerHTML = "";

  if (actions.length === 0) {
    actions = [
      {
        text: "Cerrar",
        className: "btn btn-secondary",
        onClick: closeModal
      }
    ];
  }

  actions.forEach((action) => {
    const btn = document.createElement("button");
    btn.textContent = action.text;
    btn.className = action.className || "btn btn-secondary";
    btn.addEventListener("click", action.onClick);
    modalFooter.appendChild(btn);
  });

  modal.classList.add("active");
}

function closeModal() {
  const modal = document.getElementById("globalModal");
  if (modal) {
    modal.classList.remove("active");
  }
}

function showAlert(message, type = "info") {
  ensureGlobalUiElements();

  const alert = document.getElementById("globalAlert");
  alert.className = `alert-floating show alert-${type}`;
  alert.textContent = message;

  setTimeout(() => {
    alert.classList.remove("show");
  }, 2500);
}

function confirmDeleteModal(message, onConfirm) {
  showModal({
    title: "Confirmar eliminación",
    body: `<p>${escapeHtml(message)}</p>`,
    actions: [
      {
        text: "Cancelar",
        className: "btn btn-secondary",
        onClick: closeModal
      },
      {
        text: "Eliminar",
        className: "btn btn-danger",
        onClick: () => {
          closeModal();
          onConfirm();
        }
      }
    ]
  });
}

function renderDetailModal(title, dataObject) {
  const body = `
    <div class="detail-list">
      ${Object.entries(dataObject).map(([key, value]) => `
        <div class="detail-item">
          <strong>${escapeHtml(key)}</strong>
          <span>${escapeHtml(value)}</span>
        </div>
      `).join("")}
    </div>
  `;

  showModal({
    title,
    body,
    actions: [
      {
        text: "Cerrar",
        className: "btn btn-secondary",
        onClick: closeModal
      }
    ]
  });
}

function paginateData(data, currentPage = 1, perPage = 5) {
  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const start = (safePage - 1) * perPage;
  const end = start + perPage;

  return {
    items: data.slice(start, end),
    currentPage: safePage,
    totalPages,
    totalItems
  };
}

function renderPagination(containerId, totalItems, currentPage, onPageChangeName, perPage = 5) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

  if (totalItems === 0) {
    container.innerHTML = "";
    return;
  }

  let html = `
    <button onclick="${onPageChangeName}(1)" ${currentPage === 1 ? "disabled" : ""}>Primero</button>
    <button onclick="${onPageChangeName}(${currentPage - 1})" ${currentPage === 1 ? "disabled" : ""}>Anterior</button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    html += `
      <button class="${i === currentPage ? "active" : ""}" onclick="${onPageChangeName}(${i})">${i}</button>
    `;
  }

  html += `
    <button onclick="${onPageChangeName}(${currentPage + 1})" ${currentPage === totalPages ? "disabled" : ""}>Siguiente</button>
    <button onclick="${onPageChangeName}(${totalPages})" ${currentPage === totalPages ? "disabled" : ""}>Último</button>
  `;

  container.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", ensureGlobalUiElements);