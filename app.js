const kickoffDate = new Date(WC_DATA.tournament.startDate);
const finalDate = new Date(WC_DATA.tournament.finalDate);

function updateTournamentStatus() {
  const now = new Date();

  const countdown = document.getElementById("countdown");
  const label = document.getElementById("hero-label");
  const subtitle = document.getElementById("hero-subtitle");

  if (!countdown) return;

  if (now < kickoffDate) {
    const diff = kickoffDate - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (diff % (1000 * 60 * 60 * 24)) /
      (1000 * 60 * 60)
    );

    if (label) label.innerText = "COUNTDOWN TO KICK-OFF";
    countdown.innerHTML = `${days} ${hours}<span>days / hours</span>`;
    if (subtitle) subtitle.innerText = "11 JUNE 2026";
    return;
  }

  if (now >= kickoffDate && now <= finalDate) {
    if (label) label.innerText = "TOURNAMENT STATUS";
    countdown.innerHTML = `LIVE<span>tournament in progress</span>`;
    if (subtitle) subtitle.innerText = "11 JUNE — 19 JULY 2026";
    return;
  }

  if (label) label.innerText = "TOURNAMENT COMPLETE";
  countdown.innerHTML = `FINAL<span>champion crowned</span>`;
  if (subtitle) subtitle.innerText = "SEE YOU IN 2030";
}

function renderLiveMatches() {
  const container = document.querySelector(".live-games");
  if (!container) return;

  container.innerHTML = WC_DATA.liveMatches.map(match => `
    <div class="live-game">
      <div class="game-meta">
        <span>${match.group}</span>
        <strong>${match.minute}</strong>
      </div>

      <div class="score-row">
        <div>
          <div class="flag">${match.home.flag}</div>
          <p>${match.home.name}</p>
        </div>

        <div class="score">${match.score}</div>

        <div>
          <div class="flag">${match.away.flag}</div>
          <p>${match.away.name}</p>
        </div>
      </div>

      <div class="venue">📍 ${match.venue}</div>
    </div>
  `).join("");
}

function renderTodayMatches() {
  const panel = document.querySelector(".today-panel");
  if (!panel) return;

  panel.querySelectorAll(".fixture").forEach(item => item.remove());

  WC_DATA.todayMatches.forEach(match => {
    panel.insertAdjacentHTML("beforeend", `
      <div class="fixture">
        <span class="time">${match.time}</span>
        <span>${match.home}</span>
        <strong>vs</strong>
        <span>${match.away}</span>
        <em>${match.group}</em>
      </div>
    `);
  });
}

function renderGroupTabs() {
  const tabs = document.querySelector(".tabs");
  if (!tabs) return;

  tabs.innerHTML = Object.keys(WC_DATA.groups).map((group, index) => `
    <span class="${index === 0 ? "active-tab" : ""}" data-group="${group}">
      Group ${group}
    </span>
  `).join("");

  tabs.querySelectorAll("span").forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.querySelectorAll("span").forEach(item => item.classList.remove("active-tab"));
      tab.classList.add("active-tab");
      renderStandings(tab.dataset.group);
      renderTwemoji();
    });
  });
}

function renderStandings(group = "A") {
  const body = document.querySelector(".standings-table tbody");
  if (!body) return;

  body.innerHTML = WC_DATA.groups[group].map((team, index) => `
    <tr>
      <td><b>${index + 1}</b></td>
      <td>${team.flag} ${team.name}</td>
      <td>${team.p}</td>
      <td>${team.gd}</td>
      <td>${team.pts}</td>
    </tr>
  `).join("");
}

function renderAllGroups() {
  const grid = document.querySelector(".group-grid");
  if (!grid) return;

  const styleByIndex = ["green", "green", "orange", "blue", "green", "green", "red", "blue", "green", "orange", "red", "blue"];

  grid.innerHTML = Object.entries(WC_DATA.groups).map(([letter, teams], index) => `
    <div class="group-card ${styleByIndex[index]}">
      <strong>Group ${letter}</strong>
      <span>${teams.map(team => team.flag).join(" ")}</span>
    </div>
  `).join("");
}

function renderScorers() {
  const panel = document.querySelector(".scorers-panel");
  if (!panel) return;

  panel.querySelectorAll(".scorer-row").forEach(item => item.remove());

  WC_DATA.scorers.forEach(player => {
    panel.insertAdjacentHTML("beforeend", `
      <div class="scorer-row">
        <span>${player.rank}</span>
        <strong>${player.player}</strong>
        <em>${player.goals}</em>
      </div>
    `);
  });
}

function renderAlerts() {
  const panel = document.querySelector(".alerts-panel");
  if (!panel) return;

  panel.querySelectorAll(".alert").forEach(item => item.remove());

  WC_DATA.alerts.forEach(alert => {
    panel.insertAdjacentHTML("beforeend", `
      <div class="alert ${alert.type}">
        ${alert.text}
      </div>
    `);
  });
}

function renderResults() {
  const panel = document.querySelector(".results-panel");
  if (!panel) return;

  panel.querySelectorAll(".result-row").forEach(item => item.remove());

  WC_DATA.recentResults.forEach(result => {
    panel.insertAdjacentHTML("beforeend", `
      <div class="result-row">
        <span>${result.home}</span>
        <strong>${result.score}</strong>
        <span>${result.away}</span>
      </div>
    `);
  });
}

function renderTournamentInfo() {
  const infoRows = document.querySelectorAll(".info-panel .info-row");
  if (!infoRows.length) return;

  const info = [
    ["Host Countries", WC_DATA.tournament.hosts.map(host => host.flag).join(" ")],
    ["Start Date", "11 June 2026"],
    ["End Date", "19 July 2026"],
    ["Teams", WC_DATA.tournament.metrics.teams],
    ["Matches", WC_DATA.tournament.metrics.matches]
  ];

  infoRows.forEach((row, index) => {
    const [label, value] = info[index];
    row.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
  });
}

function renderTwemoji() {
  if (window.twemoji) {
    twemoji.parse(document.body, {
      folder: "svg",
      ext: ".svg"
    });
  }
}



function setupNavigation() {
  const navLinks = document.querySelectorAll(".nav a[href^='#'], .panel-header a[href^='#']");

  navLinks.forEach(link => {
    link.addEventListener("click", event => {
      const targetId = link.getAttribute("href");
      const target = document.querySelector(targetId);

      if (!target) return;

      event.preventDefault();

      document.querySelectorAll(".nav a").forEach(item => item.classList.remove("active"));

      const matchingNav = document.querySelector(`.nav a[href="${targetId}"]`);
      if (matchingNav) matchingNav.classList.add("active");

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

      history.replaceState(null, "", targetId);
    });
  });
}

function bootDashboard() {
  updateTournamentStatus();
  renderLiveMatches();
  renderTodayMatches();
  renderGroupTabs();
  renderStandings("A");
  renderAllGroups();
  renderScorers();
  renderAlerts();
  renderResults();
  renderTournamentInfo();
  setupNavigation();

  setTimeout(renderTwemoji, 100);
}

bootDashboard();
setInterval(updateTournamentStatus, 1000);
