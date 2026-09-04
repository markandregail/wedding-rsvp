(() => {
  const envelopeOverlay = document.getElementById("envelope-overlay");
  const scene = document.getElementById("scene");
  const envelope = document.getElementById("envelope");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let opened = false;
  let leaving = false;

  function leaveScene() {
    if (leaving) return;
    leaving = true;

    const leaveDelay = reduceMotion ? 50 : 500;

    envelopeOverlay.classList.add("leaving");
    document.body.classList.remove("pre-open");
    setTimeout(() => {
      envelopeOverlay.classList.add("hidden");
    }, leaveDelay);
  }

  function openEnvelope() {
    if (opened) return;
    opened = true;

    scene.classList.add("opened");
    envelope.classList.add("open");

    // Give the open animation time to finish revealing the card, then let
    // the guest read it — either they tap anywhere to move on right away,
    // or after 10s we advance for them automatically.
    const revealDelay = reduceMotion ? 150 : 1650;
    const readTime = 10000;

    setTimeout(() => {
      envelopeOverlay.addEventListener("click", leaveScene);
      setTimeout(leaveScene, readTime);
    }, revealDelay);
  }

  envelope.addEventListener("click", openEnvelope);
  envelope.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openEnvelope();
    }
  });
})();
