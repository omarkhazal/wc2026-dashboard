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

function renderFavoritePanel() {
  const panel = document.querySelector(".favorite-panel-body");
  const wrapper = document.querySelector(".favorite-panel");
  if (!panel || !wrapper) return;

  const favorite = getFavoriteTeam();

  if (!favorite) {
    panel.innerHTML = "";
    wrapper.hidden = true;
    return;
  }

  wrapper.hidden = false;

  const matches = getTeamMatches(favorite);
  const next = matches.find(match => !match.isFinished) || matches[0];

  panel.innerHTML = `
    <div class="favorite-dashboard-card">
      <div class="favorite-dashboard-head">
        <span>${favorite.flag}</span>
        <div>
          <strong>${favorite.name}</strong>
          <small>Group ${favorite.group} · ${favorite.code}</small>
        </div>
      </div>

      <div class="favorite-dashboard-stats">
        <span>P ${favorite.p}</span>
        <span>GD ${favorite.gd}</span>
        <span>PTS ${favorite.pts}</span>
      </div>

      ${next ? `
        <div class="favorite-next-match">
          <small>${next.dateLabel || "TBD"} · ${next.time || "--:--"} · ${next.group || "World Cup"}</small>
          <strong>${next.home} ${next.score || "vs"} ${next.away}</strong>
          <em>${next.status || "Upcoming"}</em>
        </div>
      ` : `
        <div class="favorite-next-match">
          <small>Fixtures pending</small>
          <strong>No matched fixtures yet</strong>
          <em>API data will fill this</em>
        </div>
      `}

      <div class="favorite-dashboard-actions">
        <button data-open-favorite-team type="button">Open Team Center</button>
        <button data-view-target="matches" type="button">Matches</button>
      </div>
    </div>
  `;

  panel.querySelector("[data-open-favorite-team]")?.addEventListener("click", () => {
    window.WC_SELECTED_TEAM_CODE = favorite.code;
    window.WC_OPEN_VIEW?.("teamcenter");
  });

  panel.querySelector("[data-view-target='matches']")?.addEventListener("click", () => {
    window.WC_OPEN_VIEW?.("matches");
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



function getAllTeams() {
  return Object.entries(WC_DATA.groups || {}).flatMap(([group, teams]) =>
    teams.map(team => ({ ...team, group }))
  );
}

function getAllMatches() {
  if (Array.isArray(WC_DATA.allMatches) && WC_DATA.allMatches.length) {
    return WC_DATA.allMatches;
  }

  const upcoming = (WC_DATA.todayMatches || []).map(match => ({
    dateLabel: "Today",
    time: match.time || "--:--",
    home: match.home,
    away: match.away,
    group: match.group || "World Cup",
    status: match.status || "Upcoming",
    score: match.status && match.status.includes("-") ? match.status : "vs",
    venue: "",
    isLive: false,
    isFinished: false
  }));

  const recent = (WC_DATA.recentResults || []).map(match => ({
    dateLabel: "Recent",
    time: "FT",
    home: match.home,
    away: match.away,
    group: "Result",
    status: "FT",
    score: match.score,
    venue: "",
    isLive: false,
    isFinished: true
  }));

  return [...upcoming, ...recent];
}

function getFeaturedMatch() {
  const matches = getAllMatches();
  return matches.find(match => match.isLive) ||
    matches.find(match => !match.isFinished) ||
    matches[0] ||
    null;
}

function renderStatusPill(status) {
  const value = String(status || "Upcoming");
  const kind = value.includes("LIVE") ? "live" : value.includes("FT") ? "done" : "upcoming";
  return `<span class="status-pill ${kind}">${value}</span>`;
}

function setupNavigation() {
  const links = document.querySelectorAll(".nav a[data-view], .panel-header a[href^='#']");
  const topRow = document.querySelector(".top-row");
  const dashboardGrid = document.querySelector(".dashboard-grid");
  const detailView = document.getElementById("detail-view");
  const main = document.querySelector(".main");

  const routeMap = {
    "#matches": "matches",
    "#matchcenter": "matchcenter",
    "#groups": "groups",
    "#bracket": "bracket",
    "#teams": "teams",
    "#players": "players",
    "#stats": "players",
    "#venues": "venues",
    "#alerts": "alerts",
    "#dashboard": "dashboard",
    "#live": "matches",
    "#today": "matches"
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

    detailView.querySelectorAll("[data-view-target]").forEach(button => {
      button.addEventListener("click", () => openView(button.dataset.viewTarget));
    });

    detailView.querySelectorAll("[data-open-group]").forEach(card => {
      card.addEventListener("click", () => {
        renderStandings(card.dataset.openGroup);
        openView("teams");
      });
    });

    const backButton = detailView.querySelector(".view-back");
    if (backButton) backButton.addEventListener("click", openDashboard);

    if (main) main.scrollTo({ top: 0, behavior: "smooth" });
    history.replaceState(null, "", `#${view}`);
    setTimeout(renderTwemoji, 50);
  }

  window.WC_OPEN_VIEW = openView;

  links.forEach(link => {
    link.addEventListener("click", event => {
      const href = link.getAttribute("href");
      const view = link.dataset.view || routeMap[href];
      if (!view) return;
      event.preventDefault();
      openView(view);
    });
  });

  const favoriteChip = document.getElementById("favorite-chip");
  if (favoriteChip) {
    favoriteChip.addEventListener("click", () => {
      const favorite = getFavoriteTeam();
      if (!favorite) {
        openView("teams");
        return;
      }

      window.WC_SELECTED_TEAM_CODE = favorite.code;
      openView("teamcenter");
    });
  }

  const startingHash = window.location.hash.replace("#", "");
  if (startingHash && routeMap[`#${startingHash}`] && startingHash !== "dashboard") {
    openView(routeMap[`#${startingHash}`]);
  }
}

function renderDetailView(view) {
  const titles = {
    matches: ["Matches", "FotMob-style match list with date, status, score, group, and venue."],
    matchcenter: ["Match Center", "Focused match hub inspired by SofaScore/FotMob match pages."],
    groups: ["Groups", "All 12 groups with compact tables and clickable group cards."],
    bracket: ["Bracket", "Expanded knockout map inspired by tournament bracket pages."],
    teams: ["Teams", "Team hub for all 48 teams, grouped and sortable later."],
    players: ["Players", "Player stats page prepared for scorers, assists, cards, and ratings."],
    venues: ["Venues", "Host city and stadium overview for the 16 World Cup venues."],
    alerts: ["Alerts", "Forza-style high-signal tournament updates only."]
  };

  const [title, subtitle] = titles[view] || titles.matches;

  return `
    <div class="view-header app-view-header">
      <div>
        <span class="view-kicker">World Cup 2026</span>
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
    case "matches":
      return renderMatchesPage();
    case "matchcenter":
      return renderMatchCenterPage();
    case "groups":
      return renderGroupsPage();
    case "bracket":
      return renderBracketPage();
    case "teams":
      return renderTeamsPage();
    case "players":
      return renderPlayersPage();
    case "venues":
      return renderVenuesPage();
    case "alerts":
      return renderAlertsPage();
    default:
      return renderMatchesPage();
  }
}

function renderMatchesPage() {
  const matches = getAllMatches();
  const live = matches.filter(match => match.isLive);
  const upcoming = matches.filter(match => !match.isFinished && !match.isLive).slice(0, 18);
  const finished = matches.filter(match => match.isFinished).slice(0, 10);
  const list = [...live, ...upcoming, ...finished].slice(0, 32);

  return `
    <div class="view-toolbar">
      <span>${matches.length || 0} matches loaded</span>
      <span>${live.length} live</span>
      <span>${finished.length} finished</span>
      <button data-view-target="matchcenter" type="button">Open Match Center</button>
    </div>

    <div class="match-list-page">
      ${list.map(match => `
        <button class="match-row-card" data-view-target="matchcenter" type="button">
          <div class="match-date">
            <strong>${match.dateLabel || "TBD"}</strong>
            <span>${match.time || "--:--"}</span>
          </div>
          <div class="match-teams">
            <span>${match.home}</span>
            <b>${match.score || "vs"}</b>
            <span>${match.away}</span>
          </div>
          <div class="match-side">
            ${renderStatusPill(match.status)}
            <small>${match.group || "World Cup"}</small>
          </div>
        </button>
      `).join("")}
    </div>
  `;
}

function renderMatchCenterPage() {
  const match = getFeaturedMatch();

  if (!match) {
    return `
      <div class="view-card full">
        <h3>No match selected</h3>
        <p>Once match data is available, this page becomes the detailed match hub.</p>
      </div>
    `;
  }

  return `
    <div class="match-center-hero">
      <div>
        <span class="view-pill">${match.group || "World Cup"}</span>
        <h2>${match.home} <strong>${match.score || "vs"}</strong> ${match.away}</h2>
        <p>${match.dateLabel || "TBD"} · ${match.time || "--:--"} · ${match.venue || "Venue pending"}</p>
      </div>
      ${renderStatusPill(match.status)}
    </div>

    <div class="match-center-grid">
      <div class="view-card wide">
        <h3>Timeline</h3>
        <div class="empty-state"><strong>Timeline ready.</strong><br>Goals, cards, VAR and substitutions will appear here when the API provides events.</div>
      </div>

      <div class="view-card wide">
        <h3>Lineups</h3>
        <div class="lineup-preview">
          <span>${match.home}</span>
          <em>Lineups unlock near kickoff</em>
          <span>${match.away}</span>
        </div>
      </div>

      <div class="view-card wide">
        <h3>Match stats</h3>
        <div class="stat-bars">
          <p><span>Possession</span><b>—</b></p>
          <p><span>Shots</span><b>—</b></p>
          <p><span>xG</span><b>—</b></p>
          <p><span>Corners</span><b>—</b></p>
        </div>
      </div>

      <div class="view-card wide">
        <h3>Group impact</h3>
        <p>This panel will show how the result changes qualification once standings data is reliable.</p>
      </div>
    </div>
  `;
}

function renderGroupsPage() {
  return `
    <div class="view-grid">
      ${Object.entries(WC_DATA.groups).map(([letter, teams]) => `
        <button class="full-group-card group-page-card" data-open-group="${letter}" type="button">
          <h3>Group ${letter}</h3>
          <table class="mini-table">
            <tbody>
              ${teams.map((team, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${team.flag} ${team.name}</td>
                  <td>${team.pts}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </button>
      `).join("")}
    </div>
  `;
}

function renderTeamsPage() {
  const teams = getAllTeams();

  return `
    <div class="view-toolbar">
      <span>${teams.length} teams</span>
      <span>12 groups</span>
      <span>Click team pages later</span>
    </div>
    <div class="team-grid-page">
      ${teams.map(team => `
        <div class="team-card-page">
          <div class="team-card-main">
            <span>${team.flag}</span>
            <div>
              <strong>${team.name}</strong>
              <small>Group ${team.group} · ${team.code}${getFavoriteTeam()?.code === team.code ? " · Favorite" : ""}</small>
            </div>
          </div>
          <div class="team-card-stats">
            <span>P ${team.p}</span>
            <span>GD ${team.gd}</span>
            <span>PTS ${team.pts}</span>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function renderBracketPage() {
  const columns = [
    ["Round of 32", "1A vs 2B", "1C vs 2D", "1E vs 2F", "1G vs 2H", "1I vs 2J", "1K vs 2L"],
    ["Round of 16", "Winner path", "Winner path", "Winner path", "Winner path"],
    ["Quarter-finals", "QF 1", "QF 2", "QF 3", "QF 4"],
    ["Semi-finals", "SF 1", "SF 2"],
    ["Final", "🏆 19 July 2026"]
  ];

  return `
    <div class="view-card full">
      <div class="bracket-detail app-bracket">
        ${columns.map(column => `
          <div class="bracket-column">
            <h3>${column[0]}</h3>
            ${column.slice(1).map(slot => `<div class="bracket-slot">${slot}</div>`).join("")}
          </div>
        `).join("")}
      </div>
      <div class="route-note">Bracket seeding stays placeholder until group qualification is mathematically known.</div>
    </div>
  `;
}

function renderPlayersPage() {
  const scorersBlock = WC_DATA.scorers.length
    ? `
      <table class="view-table">
        <thead><tr><th>#</th><th>Player</th><th>Goals</th></tr></thead>
        <tbody>
          ${WC_DATA.scorers.map(player => `
            <tr><td>${player.rank}</td><td>${player.player}</td><td><strong>${player.goals}</strong></td></tr>
          `).join("")}
        </tbody>
      </table>
    `
    : `<div class="empty-state"><strong>No player stats yet.</strong><br>Scorers, assists, cards and ratings will appear when the API provides player-level data.</div>`;

  return `
    <div class="view-grid">
      <div class="view-card wide"><h3>Top scorers</h3>${scorersBlock}</div>
      <div class="view-card wide"><h3>Assists</h3><div class="empty-state">Prepared for assist leaders.</div></div>
      <div class="view-card wide"><h3>Cards</h3><div class="empty-state">Prepared for yellow/red card leaders.</div></div>
      <div class="view-card wide"><h3>Ratings</h3><div class="empty-state">Prepared for player ratings if connected later.</div></div>
    </div>
  `;
}

function renderVenuesPage() {
  return `
    <div class="view-grid">
      ${WC_DATA.venues.map(venue => `
        <div class="view-card venue-page-card">
          <h3>${venue.name}</h3>
          <p>${venue.city || "Host city pending"}${venue.country ? `, ${venue.country}` : ""}</p>
          <span class="view-pill">${venue.matches ? `${venue.matches} matches` : "World Cup venue"}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function renderAlertsPage() {
  return `
    <div class="view-grid">
      ${WC_DATA.alerts.map(alert => `
        <div class="view-card wide alert-page-card ${alert.type}">
          <h3>${alert.type.toUpperCase()}</h3>
          <p>${alert.text}</p>
        </div>
      `).join("")}
    </div>
  `;
}

async function bootDashboard() {
  updateTournamentStatus();

  // Render immediately from local data.js so the dashboard never sits blank.
  renderLiveMatches();
  renderTodayMatches();
  renderGroupTabs();
  renderStandings("A");
  renderAllGroups();
  renderScorers();
  renderAlerts();
  renderResults();
  renderTournamentInfo();
  renderFavoritePanel();
  setupNavigation();
  renderFavoriteTeamChip();

  document.body.classList.add("dashboard-ready");
  setTimeout(renderTwemoji, 100);

  // Then load the free API in the background and re-render once when it finishes.
  if (window.WorldCup26API) {
    WorldCup26API.load()
      .then(() => {
        renderLiveMatches();
        renderTodayMatches();
        renderGroupTabs();
        renderStandings("A");
        renderAllGroups();
        renderScorers();
        renderAlerts();
        renderResults();
        renderTournamentInfo();
        renderFavoritePanel();
        renderFavoriteTeamChip();

        const activeView = document.querySelector(".nav a.active")?.dataset.view;
        const detailView = document.getElementById("detail-view");
        if (activeView && activeView !== "dashboard" && detailView?.classList.contains("active")) {
          detailView.innerHTML = renderDetailView(activeView);
          detailView.querySelector(".view-back")?.addEventListener("click", () => {
            document.querySelector('.nav a[data-view="dashboard"]')?.click();
          });
          detailView.querySelectorAll("[data-view-target]").forEach(button => {
            button.addEventListener("click", () => {
              document.querySelector(`.nav a[data-view="${button.dataset.viewTarget}"]`)?.click();
            });
          });
        }

        setTimeout(renderTwemoji, 100);
      })
      .catch(error => {
        console.warn("WorldCup26 API background load failed:", error);
      });
  }
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
