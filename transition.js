const overlay = document.querySelector(".page-transition");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (overlay) {
  requestAnimationFrame(() => {
    setTimeout(() => overlay.classList.add("reveal"), 30);
  });
}

document.querySelectorAll("[data-transition]").forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    if (!href || link.target === "_blank") return;
    if (href === window.location.pathname.split("/").pop()) return;

    event.preventDefault();

    if (overlay) {
      overlay.classList.remove("reveal");
      overlay.classList.add("closing");
      setTimeout(() => {
        window.location.href = href;
      }, reduceMotion ? 20 : 420);
    } else {
      window.location.href = href;
    }
  });
});
