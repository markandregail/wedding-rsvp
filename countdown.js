function updateCountdown(el) {
  const target = new Date(el.dataset.countdownTarget);
  const doneMessage = el.dataset.countdownDone || "The day has arrived!";
  const now = new Date();
  const diff = target - now;

  if (diff <= 0) {
    el.innerHTML = `<div class="unit"><span class="label">${doneMessage}</span></div>`;
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);

  el.innerHTML = `
    <div class="unit"><span class="num">${days}</span><span class="label">Days</span></div>
    <div class="unit"><span class="num">${hours}</span><span class="label">Hours</span></div>
    <div class="unit"><span class="num">${minutes}</span><span class="label">Minutes</span></div>
  `;
}

function updateAllCountdowns() {
  document.querySelectorAll("[data-countdown-target]").forEach(updateCountdown);
}

updateAllCountdowns();
setInterval(updateAllCountdowns, 60000);
