const kickoffDate = new Date("2026-06-11T19:00:00");

function updateCountdown() {
  const now = new Date();
  const diff = kickoffDate - now;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (diff % (1000 * 60 * 60 * 24))
    / (1000 * 60 * 60)
  );

  document.getElementById("countdown").innerText =
    `${days} days ${hours} hours`;
}

updateCountdown();
setInterval(updateCountdown, 1000);