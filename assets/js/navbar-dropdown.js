function setupNavbarDropdowns() {
  closeAllDropdowns();

  const groups = document.querySelectorAll(".nav-group");

  groups.forEach((group) => {
    const button = group.querySelector(".nav-group-button");
    const menu = group.querySelector(".nav-group-menu");

    if (!button || !menu) return;

    button.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const isOpen = menu.classList.contains("show");

      closeAllDropdowns();

      if (!isOpen) {
        menu.classList.add("show");
        button.classList.add("open");
      }
    };
  });
}

function closeAllDropdowns() {
  document.querySelectorAll(".nav-group-menu").forEach((menu) => {
    menu.classList.remove("show");
  });

  document.querySelectorAll(".nav-group-button").forEach((button) => {
    button.classList.remove("open");
  });
}

document.addEventListener("click", () => {
  closeAllDropdowns();
});