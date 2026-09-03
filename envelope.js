(() => {
  const envelopeOverlay = document.getElementById("envelope-overlay");
  const scene = document.getElementById("scene");
  const envelope = document.getElementById("envelope");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let opened = false;

  function openEnvelope() {
    if (opened) return;
    opened = true;

    scene.classList.add("opened");
    envelope.classList.add("open");

    const openDelay = reduceMotion ? 150 : 1650;
    const leaveDelay = reduceMotion ? 50 : 500;

    setTimeout(() => {
      envelopeOverlay.classList.add("leaving");
      document.body.classList.remove("pre-open");
      setTimeout(() => {
        envelopeOverlay.classList.add("hidden");
      }, leaveDelay);
    }, openDelay);
  }

  envelope.addEventListener("click", openEnvelope);
  envelope.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openEnvelope();
    }
  });
})();
