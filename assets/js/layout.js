function bindAccordionMenu() {
  const groups = document.querySelectorAll(".accordion-group");

  groups.forEach((group) => {
    const header = group.querySelector(".accordion-header");
    if (!header) return;

    header.addEventListener("click", () => {
      group.classList.toggle("open");
    });
  });
}

function setActiveSidebarLink() {
  const current = window.location.pathname.split("/").pop();
  const links = document.querySelectorAll(".sidebar-link");

  links.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;

    if (href.includes(current)) {
      link.classList.add("active");

      const parentGroup = link.closest(".accordion-group");
      if (parentGroup) parentGroup.classList.add("open");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bindAccordionMenu();
  setActiveSidebarLink();
});