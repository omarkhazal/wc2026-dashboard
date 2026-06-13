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
    panel.hidden = true;
    return;
  }

  panel.hidden = false;

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

function renderDataPanel() {
  const panel = document.querySelector(".data-panel-body");
  if (!panel) return;

  const meta = WC_DATA.apiMeta || {
    mode: "boot",
    source: "loading",
    games: (WC_DATA.allMatches || []).length || WC_DATA.tournament.metrics.matches,
    teams: WC_DATA.tournament.metrics.teams,
    stadiums: WC_DATA.tournament.metrics.venues,
    cache: "waiting"
  };

  const modeLabel = {
    live: "Live API",
    cache: "Saved cache",
    fallback: "Fallback",
    boot: "Starting"
  }[meta.mode] || meta.mode;

  const statusClass = meta.mode === "live" ? "live" : meta.mode === "cache" ? "cache" : "fallback";
  const syncLabel = meta.syncedAt
    ? new Date(meta.syncedAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    : "waiting";

  panel.innerHTML = `
    <div class="data-status-card ${statusClass}">
      <div>
        <strong>${modeLabel}</strong>
        <span>${meta.source}</span>
      </div>
      <em>${syncLabel}</em>
    </div>

    <div class="data-metrics">
      <span><b>${meta.games || 0}</b> games</span>
      <span><b>${meta.teams || 0}</b> teams</span>
      <span><b>${meta.stadiums || 0}</b> venues</span>
    </div>

    <div class="data-coverage-list">
      <p><span>Matches</span><strong>${meta.mode === "live" || meta.mode === "cache" ? "Connected" : "Fallback"}</strong></p>
      <p><span>Teams</span><strong>Connected</strong></p>
      <p><span>Stadiums</span><strong>Connected</strong></p>
      <p><span>Standings</span><strong>Local safe mode</strong></p>
      <p><span>Lineups / events</span><strong>Pending</strong></p>
      <p><span>Player stats</span><strong>Pending</strong></p>
    </div>
  `;
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

const FAVORITE_TEAM_KEY = "wc2026FavoriteTeamCode";

function getFavoriteTeam() {
  try {
    const code = localStorage.getItem(FAVORITE_TEAM_KEY);
    return getAllTeams().find(team => team.code === code) || null;
  } catch {
    return null;
  }
}

function setFavoriteTeam(code) {
  if (!code) return null;
  try {
    localStorage.setItem(FAVORITE_TEAM_KEY, code);
  } catch {}
  renderFavoriteTeamChip();
  if (typeof renderFavoritePanel === "function") renderFavoritePanel();
  return getFavoriteTeam();
}

function renderFavoriteTeamChip() {
  const chip = document.getElementById("favorite-chip");
  if (!chip) return;

  const favorite = getFavoriteTeam();
  if (!favorite) {
    chip.innerHTML = "☆ Pick favorite team";
    chip.classList.remove("has-favorite");
    return;
  }

  chip.innerHTML = `${favorite.flag} ${favorite.name}`;
  chip.classList.add("has-favorite");
}

function getSelectedTeam() {
  const teams = getAllTeams();
  const selectedCode = window.WC_SELECTED_TEAM_CODE;
  return teams.find(team => team.code === selectedCode) || getFavoriteTeam() || teams[0] || null;
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
    score: match.status && String(match.status).includes("-") ? match.status : "vs",
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

function getTeamMatches(team) {
  if (!team) return [];
  const name = String(team.name || "").toLowerCase();
  const code = String(team.code || "").toLowerCase();

  return getAllMatches().filter(match => {
    const text = [
      match.home,
      match.away,
      match.homeName,
      match.awayName
    ].filter(Boolean).join(" ").toLowerCase();

    return text.includes(name) || text.includes(code);
  });
}

function getFeaturedMatch() {
  const matches = getAllMatches();
  return matches.find(match => match.isLive) ||
    matches.find(match => !match.isFinished) ||
    matches[0] ||
    null;
}

function getSelectedMatch() {
  const matches = getAllMatches();
  const selected = Number(window.WC_SELECTED_MATCH_INDEX);

  if (Number.isInteger(selected) && matches[selected]) {
    return { match: matches[selected], index: selected };
  }

  const fallback = getFeaturedMatch();
  return { match: fallback, index: fallback ? matches.indexOf(fallback) : -1 };
}

function attachMatchOpeners(root, openView) {
  root.querySelectorAll("[data-match-index]").forEach(button => {
    button.addEventListener("click", () => {
      window.WC_SELECTED_MATCH_INDEX = Number(button.dataset.matchIndex);
      openView("matchcenter");
    });
  });
}

function attachTeamOpeners(root, openView) {
  root.querySelectorAll("[data-team-code]").forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      window.WC_SELECTED_TEAM_CODE = button.dataset.teamCode;
      openView("teamcenter");
    });
  });
}

function attachFavoriteButtons(root, rerender) {
  root.querySelectorAll("[data-favorite-team]").forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      setFavoriteTeam(button.dataset.favoriteTeam);
      if (typeof rerender === "function") rerender();
    });
  });
}



function renderStatusPill(status) {
  const value = String(status || "Upcoming");
  const kind = value.includes("LIVE") ? "live" : value.includes("FT") ? "done" : "upcoming";
  return `<span class="status-pill ${kind}">${value}</span>`;
}

function setupNavigation() {
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
    "#teamcenter": "teamcenter",
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
    if (location.hash !== "#dashboard") history.replaceState(null, "", "#dashboard");
  }

  function openView(view) {
    if (!view || view === "dashboard") {
      openDashboard();
      return;
    }

    if (topRow) topRow.style.display = "none";
    if (dashboardGrid) dashboardGrid.style.display = "none";
    if (!detailView) return;

    try {
      detailView.innerHTML = renderDetailView(view);
    } catch (error) {
      console.error(`Failed to open ${view}:`, error);
      detailView.innerHTML = `
        <div class="view-header">
          <div><h2>Page error</h2><p>${view} could not render.</p></div>
          <button class="view-back" type="button">← Dashboard</button>
        </div>
        <div class="view-card full"><h3>Open the browser console for details.</h3></div>
      `;
    }

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

    attachMatchOpeners(detailView, openView);
    attachTeamOpeners(detailView, openView);
    attachFavoriteButtons(detailView, () => openView(view));

    const backButton = detailView.querySelector(".view-back");
    if (backButton) backButton.addEventListener("click", openDashboard);

    if (main) main.scrollTo({ top: 0, behavior: "smooth" });
    if (location.hash !== `#${view}`) history.replaceState(null, "", `#${view}`);
    setTimeout(renderTwemoji, 50);
  }

  window.WC_OPEN_VIEW = openView;

  if (!window.WC_NAVIGATION_DELEGATE_BOUND) {
    window.WC_NAVIGATION_DELEGATE_BOUND = true;

    document.addEventListener("click", event => {
      const trigger = event.target.closest(".nav a[data-view], .panel-header a[href^='#'], [data-view-target]");
      if (!trigger) return;

      const href = trigger.getAttribute("href");
      const view = trigger.dataset.view || trigger.dataset.viewTarget || routeMap[href];
      if (!view) return;

      event.preventDefault();
      openView(view);
    }, true);

    document.addEventListener("keydown", event => {
      const trigger = event.target.closest?.("[data-view-target]");
      if (!trigger) return;
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openView(trigger.dataset.viewTarget);
    });

    window.addEventListener("hashchange", () => {
      const view = routeMap[location.hash];
      if (view) openView(view);
    });
  }

  const favoriteChip = document.getElementById("favorite-chip");
  if (favoriteChip && !favoriteChip.dataset.bound) {
    favoriteChip.dataset.bound = "true";
    favoriteChip.addEventListener("click", () => {
      const favorite = getFavoriteTeam();
      if (!favorite) return openView("teams");
      window.WC_SELECTED_TEAM_CODE = favorite.code;
      openView("teamcenter");
    });
  }

  const startingView = routeMap[location.hash];
  if (startingView && startingView !== "dashboard") openView(startingView);
}

function renderDetailView(view) {
  const titles = {
    matches: ["Matches", "FotMob-style match list with date, status, score, group, and venue."],
    matchcenter: ["Match Center", "Focused match hub inspired by SofaScore/FotMob match pages."],
    groups: ["Groups", "All 12 groups with compact tables and clickable group cards."],
    bracket: ["Bracket", "Expanded knockout map inspired by tournament bracket pages."],
    teams: ["Teams", "Team hub for all 48 teams with clickable team cards."],
    teamcenter: ["Team Center", "Focused team page with group table, fixtures, results, and team status."],
    players: ["Stats", "Tournament metrics and player-stat modules, without fake data."],
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
    case "teamcenter":
      return renderTeamCenterPage();
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
  const favorite = getFavoriteTeam();

  return `
    <div class="view-toolbar team-toolbar">
      <span>${teams.length} teams</span>
      <span>12 groups</span>
      <span>Click a team for Team Center</span>
    </div>
    <div class="team-grid-page">
      ${teams.map(team => `
        <button class="team-card-page clickable-team-card ${favorite?.code === team.code ? "favorite-team-card" : ""}" data-team-code="${team.code}" type="button">
          <div class="team-card-main">
            <span>${team.flag}</span>
            <div>
              <strong>${team.name}</strong>
              <small>Group ${team.group} · ${team.code}${favorite?.code === team.code ? " · Favorite" : ""}</small>
            </div>
          </div>
          <div class="team-card-stats">
            <span>P ${team.p}</span>
            <span>GD ${team.gd}</span>
            <span>PTS ${team.pts}</span>
          </div>
        </button>
      `).join("")}
    </div>
  `;
}

function renderTeamCenterPage() {
  const team = getSelectedTeam();

  if (!team) {
    return `
      <div class="view-card full">
        <h3>No team selected</h3>
        <p>Open the Teams page and choose a team.</p>
      </div>
    `;
  }

  const teamMatches = getTeamMatches(team);
  const groupRows = WC_DATA.groups[team.group] || [];
  const favorite = getFavoriteTeam();

  return `
    <div class="team-center-hero">
      <div class="team-center-main">
        <span>${team.flag}</span>
        <div>
          <h2>${team.name}</h2>
          <p>Group ${team.group} · ${team.code}</p>
        </div>
      </div>
      <div class="team-center-actions">
        <button class="${favorite?.code === team.code ? "is-favorite" : ""}" data-favorite-team="${team.code}" type="button">
          ${favorite?.code === team.code ? "★ Favorite team" : "☆ Set favorite"}
        </button>
        <div class="team-center-record">
          <div><strong>${team.p}</strong><span>Played</span></div>
          <div><strong>${team.gd}</strong><span>GD</span></div>
          <div><strong>${team.pts}</strong><span>Points</span></div>
        </div>
      </div>
    </div>

    <div class="match-subnav">
      <button data-view-target="teams" type="button">← All teams</button>
      <button data-view-target="groups" type="button">Group ${team.group}</button>
      <button data-view-target="matches" type="button">All matches →</button>
    </div>

    <div class="match-center-grid">
      <div class="view-card wide">
        <h3>Group ${team.group} table</h3>
        <table class="view-table">
          <thead><tr><th>#</th><th>Team</th><th>P</th><th>GD</th><th>PTS</th></tr></thead>
          <tbody>
            ${groupRows.map((row, index) => `
              <tr class="${row.code === team.code ? "highlight-row" : ""}">
                <td>${index + 1}</td>
                <td>${row.flag} ${row.name}</td>
                <td>${row.p}</td>
                <td>${row.gd}</td>
                <td><strong>${row.pts}</strong></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>

      <div class="view-card wide">
        <h3>Team matches</h3>
        ${teamMatches.length ? teamMatches.slice(0, 8).map(match => `
          <button class="team-match-row" data-match-index="${getAllMatches().indexOf(match)}" type="button">
            <span>${match.dateLabel || "TBD"} · ${match.time || "--:--"}</span>
            <strong>${match.home} ${match.score || "vs"} ${match.away}</strong>
            <em>${match.status || match.group}</em>
          </button>
        `).join("") : `
          <div class="empty-state">No team-specific fixtures matched yet. This will fill as normalized match names stabilize.</div>
        `}
      </div>

      <div class="view-card wide">
        <h3>Qualification watch</h3>
        <p>This will later show required result, advancement probability, and elimination scenarios for ${team.name}.</p>
      </div>

      <div class="view-card wide">
        <h3>Team alerts</h3>
        <p>No high-signal team alerts right now.</p>
      </div>
    </div>
  `;
}

function renderBracketPage() {
  const rounds = [
    {
      title: "Round of 32",
      subtitle: "16 matches",
      slots: [
        "1A vs 2B", "1C vs 2D", "1E vs 2F", "1G vs 2H",
        "1I vs 2J", "1K vs 2L", "1B vs 3rd", "1D vs 3rd",
        "1F vs 3rd", "1H vs 3rd", "1J vs 3rd", "1L vs 3rd",
        "2A vs 2C", "2E vs 2G", "2I vs 2K", "Best remaining"
      ]
    },
    {
      title: "Round of 16",
      subtitle: "8 matches",
      slots: Array.from({ length: 8 }, (_, index) => `R16 ${index + 1}`)
    },
    {
      title: "Quarter-finals",
      subtitle: "4 matches",
      slots: Array.from({ length: 4 }, (_, index) => `QF ${index + 1}`)
    },
    {
      title: "Semi-finals",
      subtitle: "2 matches",
      slots: ["SF 1", "SF 2"]
    },
    {
      title: "Finals",
      subtitle: "2 matches",
      slots: ["🥉 Third-place match", "🏆 Final · 19 July 2026"]
    }
  ];

  return `
    <div class="view-toolbar bracket-toolbar">
      <span>Expanded knockout map</span>
      <span>Round of 32 → Final</span>
      <span>Teams fill after group stage</span>
    </div>

    <div class="bracket-shell">
      ${rounds.map(round => `
        <section class="bracket-stage">
          <div class="bracket-stage-head">
            <h3>${round.title}</h3>
            <span>${round.subtitle}</span>
          </div>

          <div class="bracket-slot-list">
            ${round.slots.map((slot, index) => `
              <div class="bracket-match-slot">
                <small>${round.title === "Finals" ? "Match" : `Match ${index + 1}`}</small>
                <strong>${slot}</strong>
                <em>Pending</em>
              </div>
            `).join("")}
          </div>
        </section>
      `).join("")}
    </div>

    <div class="view-grid bracket-info-grid">
      <div class="view-card wide">
        <h3>How this will work</h3>
        <p>The bracket stays as seeded placeholders until group qualification is known. Once the source has knockout match data, these slots can become real match cards.</p>
      </div>
      <div class="view-card wide">
        <h3>What comes next</h3>
        <p>We can later add path highlighting for your favorite team, host country badges, venue names, and winner connectors.</p>
      </div>
    </div>
  `;
}

function renderPlayersPage() {
  const hasScorers = WC_DATA.scorers.length > 0;
  const apiAlert = (WC_DATA.alerts || []).find(alert => alert.apiSource);
  const metrics = WC_DATA.tournament.metrics;

  const scorersBlock = hasScorers
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
    : `
      <div class="stat-pending-box">
        <strong>Player-level stats are not connected yet.</strong>
        <p>No fake scorer, assist, card, or rating data is shown.</p>
      </div>
    `;

  return `
    <div class="stats-command-grid">
      <div><strong>${metrics.teams}</strong><span>Teams</span></div>
      <div><strong>${metrics.matches}</strong><span>Matches</span></div>
      <div><strong>${metrics.groups}</strong><span>Groups</span></div>
      <div><strong>${metrics.venues}</strong><span>Venues</span></div>
    </div>

    <div class="view-grid">
      <div class="view-card wide">
        <h3>Top scorers</h3>
        ${scorersBlock}
      </div>

      <div class="view-card wide">
        <h3>Data status</h3>
        <p>${apiAlert ? apiAlert.text : "Using local fallback data. Live API status will appear here after sync."}</p>
      </div>

      <div class="view-card wide stat-module-card muted">
        <h3>Team stats</h3>
        <p>Prepared for goals for/against, clean sheets, shots, possession, and cards when available.</p>
      </div>

      <div class="view-card wide stat-module-card muted">
        <h3>Player stats</h3>
        <p>Prepared for scorers, assists, cards, minutes, and ratings once a player-stat source is connected.</p>
      </div>
    </div>
  `;
}

function renderVenuesPage() {
  const venues = WC_DATA.venues || [];
  const countries = venues.reduce((acc, venue) => {
    const key = venue.country || "Host country pending";
    if (!acc[key]) acc[key] = [];
    acc[key].push(venue);
    return acc;
  }, {});

  const hostFlags = {
    Canada: "🇨🇦",
    Mexico: "🇲🇽",
    USA: "🇺🇸",
    "United States": "🇺🇸"
  };

  return `
    <div class="venue-summary-grid">
      ${Object.entries(countries).map(([country, list]) => `
        <div class="venue-summary-card">
          <span>${hostFlags[country] || "🏟"}</span>
          <div>
            <strong>${country}</strong>
            <small>${list.length} venues</small>
          </div>
        </div>
      `).join("")}
    </div>

    <div class="view-grid venue-grid-polished">
      ${venues.map(venue => `
        <div class="view-card venue-page-card polished-venue-card">
          <div class="venue-card-top">
            <span>${hostFlags[venue.country] || "🏟"}</span>
            <div>
              <h3>${venue.name}</h3>
              <p>${venue.city || "Host city pending"}${venue.country ? `, ${venue.country}` : ""}</p>
            </div>
          </div>

          <div class="venue-card-meta">
            <span>${venue.matches ? `${venue.matches} matches listed` : "Match count pending"}</span>
            <span>World Cup venue</span>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function renderAlertsPage() {
  const alerts = WC_DATA.alerts || [];
  const apiAlert = alerts.find(alert => alert.apiSource);
  const cleanAlerts = alerts.filter(alert => !alert.apiSource);

  return `
    <div class="alert-command-strip">
      <div>
        <strong>${alerts.length}</strong>
        <span>Total alerts</span>
      </div>
      <div>
        <strong>${apiAlert ? "Online" : "Fallback"}</strong>
        <span>Data status</span>
      </div>
      <div>
        <strong>${cleanAlerts.length}</strong>
        <span>Tournament notes</span>
      </div>
    </div>

    <div class="view-grid">
      ${alerts.map(alert => `
        <div class="view-card wide alert-page-card ${alert.type}">
          <div class="alert-card-head">
            <span>${alert.type === "warning" ? "⚠️" : "ℹ️"}</span>
            <h3>${alert.apiSource ? "DATA STATUS" : alert.type.toUpperCase()}</h3>
          </div>
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
        renderDataPanel();
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

setupNavigation();
bootDashboard();
setInterval(updateTournamentStatus, 1000);
// API data loads once on page load. Auto-refresh disabled to prevent visual jumping.
