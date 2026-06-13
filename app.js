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

  if (!WC_DATA.liveMatches.length) {
    container.innerHTML = `
      <div class="empty-state">
        <strong>No live matches right now.</strong><br>
        This panel is ready for the live-score API connection.
      </div>
    `;
    return;
  }

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

  panel.querySelectorAll(".fixture, .empty-state").forEach(item => item.remove());

  if (!WC_DATA.todayMatches.length) {
    panel.insertAdjacentHTML("beforeend", `
      <div class="empty-state">
        <strong>No fixtures loaded for today.</strong><br>
        The schedule view is ready for the next fixture-data pass.
      </div>
    `);
    return;
  }

  WC_DATA.todayMatches.forEach(match => {
    panel.insertAdjacentHTML("beforeend", `
      <div class="fixture">
        <span class="time">${match.time}</span>
        <span>${match.home}</span>
        <strong>vs</strong>
        <span>${match.away}</span>
        <em class="status">${match.status || match.group}</em>
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

  panel.querySelectorAll(".scorer-row, .empty-state").forEach(item => item.remove());

  if (!WC_DATA.scorers.length) {
    panel.insertAdjacentHTML("beforeend", `
      <div class="empty-state">
        <strong>Top scorers will appear here.</strong><br>
        No fake player stats are shown in the clean-data version.
      </div>
    `);
    return;
  }

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
  const links = document.querySelectorAll(".nav a[data-view], .panel-header a[href^='#']");
  const topRow = document.querySelector(".top-row");
  const dashboardGrid = document.querySelector(".dashboard-grid");
  const detailView = document.getElementById("detail-view");
  const main = document.querySelector(".main");

  const routeMap = {
    "#live": "live",
    "#today": "today",
    "#groups": "groups",
    "#teams": "teams",
    "#bracket": "bracket",
    "#stats": "stats",
    "#venues": "venues",
    "#alerts": "alerts",
    "#dashboard": "dashboard"
  };

  function setActive(view) {
    document.querySelectorAll(".nav a").forEach(item => item.classList.remove("active"));
    const active = document.querySelector(`.nav a[data-view="${view}"]`);
    if (active) active.classList.add("active");
  }

  function openDashboard() {
    if (topRow) topRow.style.display = "";
    if (dashboardGrid) dashboardGrid.style.display = "";
    if (detailView) {
      detailView.classList.remove("active");
      detailView.innerHTML = "";
    }
    setActive("dashboard");
    if (main) main.scrollTo({ top: 0, behavior: "smooth" });
    history.replaceState(null, "", "#dashboard");
  }

  function openView(view) {
    if (view === "dashboard") {
      openDashboard();
      return;
    }

    if (topRow) topRow.style.display = "none";
    if (dashboardGrid) dashboardGrid.style.display = "none";
    if (!detailView) return;

    detailView.innerHTML = renderDetailView(view);
    detailView.classList.add("active");
    setActive(view);

    const backButton = detailView.querySelector(".view-back");
    if (backButton) {
      backButton.addEventListener("click", openDashboard);
    }

    if (view === "groups") {
      detailView.querySelectorAll("[data-open-group]").forEach(card => {
        card.addEventListener("click", () => {
          renderStandings(card.dataset.openGroup);
          openView("teams");
        });
      });
    }

    if (main) main.scrollTo({ top: 0, behavior: "smooth" });
    history.replaceState(null, "", `#${view}`);
    setTimeout(renderTwemoji, 50);
  }

  links.forEach(link => {
    link.addEventListener("click", event => {
      const href = link.getAttribute("href");
      const view = link.dataset.view || routeMap[href];

      if (!view) return;

      event.preventDefault();
      openView(view);
    });
  });

  const startingHash = window.location.hash.replace("#", "");
  if (startingHash && routeMap[`#${startingHash}`] && startingHash !== "dashboard") {
    openView(startingHash);
  }
}

function renderDetailView(view) {
  const titles = {
    live: ["Live Matches", "Dedicated live match center for matches currently in progress."],
    today: ["Today's Matches", "Full match list for the selected day."],
    groups: ["All Groups", "Every group in the tournament, shown as dedicated group cards."],
    teams: ["Group Standings", "Full standings view for all tournament groups."],
    bracket: ["Knockout Bracket", "Expanded knockout view. Teams fill in as the group stage advances."],
    stats: ["Stats", "Top scorers and tournament statistics."],
    venues: ["Venues", "Host city and stadium overview."],
    alerts: ["Tournament Alerts", "High-signal tournament updates only."]
  };

  const [title, subtitle] = titles[view] || titles.live;

  return `
    <div class="view-header">
      <div>
        <h2>${title}</h2>
        <p>${subtitle}</p>
      </div>
      <button class="view-back" type="button">← Dashboard</button>
    </div>
    ${renderDetailContent(view)}
  `;
}

function renderDetailContent(view) {
  switch (view) {
    case "live":
      return renderLiveDetail();
    case "today":
      return renderTodayDetail();
    case "groups":
      return renderGroupsDetail();
    case "teams":
      return renderTeamsDetail();
    case "bracket":
      return renderBracketDetail();
    case "stats":
      return renderStatsDetail();
    case "venues":
      return renderVenuesDetail();
    case "alerts":
      return renderAlertsDetail();
    default:
      return renderLiveDetail();
  }
}

function renderLiveDetail() {
  if (!WC_DATA.liveMatches.length) {
    return `
      <div class="view-card full">
        <h3>No live matches right now</h3>
        <p>This is intentional in v9. We removed fake live scores and prepared this view for the live-score API connection.</p>
      </div>
    `;
  }

  const live = WC_DATA.liveMatches.map(match => `
    <div class="view-card wide">
      <h3><span class="view-pill">${match.group}</span> ${match.minute}</h3>
      <div class="score-row">
        <div><div class="flag">${match.home.flag}</div><p>${match.home.name}</p></div>
        <div class="score">${match.score}</div>
        <div><div class="flag">${match.away.flag}</div><p>${match.away.name}</p></div>
      </div>
      <p class="venue">📍 ${match.venue}</p>
    </div>
  `).join("");

  return `<div class="view-grid">${live}</div>`;
}

function renderTodayDetail() {
  if (!WC_DATA.todayMatches.length) {
    return `
      <div class="view-card full">
        <h3>No fixtures loaded</h3>
        <p>The fixture list is ready for the next fixture-data pass.</p>
      </div>
    `;
  }

  return `
    <div class="view-card full">
      <h3>Match schedule</h3>
      ${WC_DATA.todayMatches.map(match => `
        <div class="view-match">
          <span class="time">${match.time}</span>
          <span>${match.home}</span>
          <strong>vs</strong>
          <span>${match.away}</span>
          <em>${match.status || match.group}</em>
        </div>
      `).join("")}
    </div>
  `;
}

function renderGroupsDetail() {
  return `
    <div class="view-grid">
      ${Object.entries(WC_DATA.groups).map(([letter, teams]) => `
        <button class="full-group-card" data-open-group="${letter}" type="button">
          <h3>Group ${letter}</h3>
          ${teams.map(team => `
            <div class="team-chip">
              <span>${team.flag} ${team.name}</span>
              <strong>${team.code}</strong>
            </div>
          `).join("")}
        </button>
      `).join("")}
    </div>
    <div class="route-note">Tip: click a group card to open that group inside the standings view.</div>
  `;
}

function renderTeamsDetail() {
  return `
    <div class="view-grid">
      ${Object.entries(WC_DATA.groups).map(([letter, teams]) => `
        <div class="view-card wide">
          <h3>Group ${letter}</h3>
          <table class="view-table">
            <thead>
              <tr><th>#</th><th>Team</th><th>P</th><th>GD</th><th>PTS</th></tr>
            </thead>
            <tbody>
              ${teams.map((team, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${team.flag} ${team.name}</td>
                  <td>${team.p}</td>
                  <td>${team.gd}</td>
                  <td><strong>${team.pts}</strong></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `).join("")}
    </div>
  `;
}

function renderBracketDetail() {
  return `
    <div class="view-card full">
      <div class="bracket-detail">
        <div class="bracket-column">
          <h3>Round of 32</h3>
          ${Array.from({ length: 8 }, (_, i) => `<div class="bracket-slot">Match ${i + 1}</div>`).join("")}
        </div>
        <div class="bracket-column">
          <h3>Round of 16</h3>
          ${Array.from({ length: 4 }, (_, i) => `<div class="bracket-slot">Winner ${i + 1}</div>`).join("")}
        </div>
        <div class="bracket-column">
          <h3>Quarter-finals</h3>
          ${Array.from({ length: 2 }, (_, i) => `<div class="bracket-slot">QF ${i + 1}</div>`).join("")}
        </div>
        <div class="bracket-column">
          <h3>Semi-finals</h3>
          <div class="bracket-slot">SF 1</div>
          <div class="bracket-slot">SF 2</div>
        </div>
        <div class="bracket-column">
          <h3>Final</h3>
          <div class="bracket-slot">🏆 19 July 2026</div>
        </div>
      </div>
      <div class="route-note">The bracket is a real dedicated page now, but teams cannot be filled until knockout qualifiers are known.</div>
    </div>
  `;
}

function renderStatsDetail() {
  const scorersBlock = WC_DATA.scorers.length
    ? `
      <table class="view-table">
        <thead><tr><th>#</th><th>Player</th><th>Goals</th></tr></thead>
        <tbody>
          ${WC_DATA.scorers.map(player => `
            <tr>
              <td>${player.rank}</td>
              <td>${player.player}</td>
              <td><strong>${player.goals}</strong></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `
    : `
      <div class="empty-state">
        <strong>No scorer table yet.</strong><br>
        This avoids showing fake Golden Boot data before a live/stat feed is connected.
      </div>
    `;

  return `
    <div class="view-grid">
      <div class="view-card wide">
        <h3>Top scorers</h3>
        ${scorersBlock}
      </div>
      <div class="view-card wide">
        <h3>Tournament totals</h3>
        <p>${WC_DATA.tournament.metrics.teams} teams · ${WC_DATA.tournament.metrics.matches} matches · ${WC_DATA.tournament.metrics.groups} groups · ${WC_DATA.tournament.metrics.venues} venues</p>
      </div>
    </div>
  `;
}

function renderVenuesDetail() {
  return `
    <div class="view-grid">
      ${WC_DATA.venues.map(venue => `
        <div class="view-card">
          <h3>${venue.name}</h3>
          <p>${venue.city}, ${venue.country}</p>
          <p>${venue.matches ? `${venue.matches} matches listed` : "Match count pending in data layer"}</p>
        </div>
      `).join("")}
    </div>
  `;
}

function renderAlertsDetail() {
  return `
    <div class="view-grid">
      ${WC_DATA.alerts.map(alert => `
        <div class="view-card wide">
          <h3>${alert.type.toUpperCase()}</h3>
          <p>${alert.text}</p>
        </div>
      `).join("")}
    </div>
  `;
}

async function bootDashboard() {
  updateTournamentStatus();

  if (window.WorldCup26API) {
    await WorldCup26API.load();
  }

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

  document.body.classList.add("dashboard-ready");
  setTimeout(renderTwemoji, 100);
}

async function refreshDashboardData() {
  if (window.WorldCup26API) {
    await WorldCup26API.load();
    renderLiveMatches();
    renderTodayMatches();
    renderStandings("A");
    renderAllGroups();
    renderScorers();
    renderAlerts();
    renderResults();
    renderTournamentInfo();
    setTimeout(renderTwemoji, 100);
  }
}

bootDashboard();
setInterval(updateTournamentStatus, 1000);
// API data loads once on page load. Auto-refresh disabled to prevent visual jumping.
