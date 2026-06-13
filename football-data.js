// football-data.org integration for the WC 2026 dashboard
// Token storage:
// - Token is stored in this browser only via localStorage.
// - Token is NOT committed to GitHub.
// - Use the dashboard alert button, or run:
//   localStorage.setItem("footballDataToken", "YOUR_TOKEN_HERE"); location.reload();

(function () {
  const STORAGE_KEY = "footballDataToken";
  const API_BASE = "https://api.football-data.org/v4";
  const LIVE_STATUSES = new Set(["IN_PLAY", "PAUSED", "LIVE"]);
  const FINISHED_STATUSES = new Set(["FINISHED", "AWARDED"]);
  const UPCOMING_STATUSES = new Set(["SCHEDULED", "TIMED", "POSTPONED"]);

  function getToken() {
    return localStorage.getItem(STORAGE_KEY) || "";
  }

  function saveToken(token) {
    if (!token || !token.trim()) return;
    localStorage.setItem(STORAGE_KEY, token.trim());
  }

  function clearToken() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function promptForToken() {
    const token = window.prompt("Paste your free football-data.org API token:");
    if (!token) return;
    saveToken(token);
    window.location.reload();
  }

  function findTeamByCode(code) {
    if (!code || !window.WC_DATA || !WC_DATA.groups) return null;

    for (const teams of Object.values(WC_DATA.groups)) {
      const match = teams.find(team => team.code === code);
      if (match) return match;
    }

    return null;
  }

  function flagForTeam(team) {
    const code = team?.tla || team?.code;
    const local = findTeamByCode(code);
    return local?.flag || "";
  }

  function teamName(team) {
    if (!team) return "TBD";
    return team.shortName || team.name || team.tla || "TBD";
  }

  function teamLabel(team) {
    const flag = flagForTeam(team);
    const name = teamName(team);
    return flag ? `${flag} ${name}` : name;
  }

  function matchGroup(match) {
    if (match.group) return String(match.group).replace("_", " ");
    if (match.stage) return String(match.stage).replace("_", " ");
    if (match.matchday) return `Matchday ${match.matchday}`;
    return "World Cup";
  }

  function formatTime(utcDate) {
    if (!utcDate) return "--:--";
    return new Date(utcDate).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function scoreValue(score, side) {
    return score?.fullTime?.[side] ?? score?.regularTime?.[side] ?? null;
  }

  function scoreText(match) {
    const home = scoreValue(match.score, "home");
    const away = scoreValue(match.score, "away");

    if (home === null || away === null) return "vs";
    return `${home} - ${away}`;
  }

  function setApiAlert(type, message) {
    if (!window.WC_DATA) return;

    WC_DATA.alerts = (WC_DATA.alerts || []).filter(alert => !alert.apiSource);
    WC_DATA.alerts.unshift({
      type,
      apiSource: true,
      text: message
    });
  }

  async function fdFetch(path, token) {
    const response = await fetch(`${API_BASE}${path}`, {
      cache: "no-store",
      headers: {
        "X-Auth-Token": token
      }
    });

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  function applyMatches(matches) {
    if (!Array.isArray(matches) || !matches.length) return { matches: 0 };

    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    const sorted = [...matches].sort((a, b) => {
      return new Date(a.utcDate || 0) - new Date(b.utcDate || 0);
    });

    const live = sorted.filter(match => LIVE_STATUSES.has(match.status));
    const todayMatches = sorted.filter(match => {
      return match.utcDate && String(match.utcDate).slice(0, 10) === today;
    });
    const upcoming = sorted.filter(match => {
      return match.utcDate && new Date(match.utcDate) >= now && !FINISHED_STATUSES.has(match.status);
    });
    const finished = sorted
      .filter(match => FINISHED_STATUSES.has(match.status))
      .sort((a, b) => new Date(b.utcDate || 0) - new Date(a.utcDate || 0));

    WC_DATA.liveMatches = live.slice(0, 4).map(match => ({
      group: matchGroup(match),
      minute: match.status,
      home: {
        name: teamName(match.homeTeam),
        flag: flagForTeam(match.homeTeam)
      },
      away: {
        name: teamName(match.awayTeam),
        flag: flagForTeam(match.awayTeam)
      },
      score: scoreText(match),
      venue: match.venue || matchGroup(match)
    }));

    const scheduleSource = todayMatches.length ? todayMatches : upcoming.slice(0, 5);

    WC_DATA.todayMatches = scheduleSource.slice(0, 6).map(match => ({
      time: formatTime(match.utcDate),
      home: teamLabel(match.homeTeam),
      away: teamLabel(match.awayTeam),
      group: matchGroup(match),
      status: match.status === "FINISHED" ? scoreText(match) : (match.status || matchGroup(match))
    }));

    if (finished.length) {
      WC_DATA.recentResults = finished.slice(0, 6).map(match => ({
        home: teamLabel(match.homeTeam),
        score: scoreText(match),
        away: teamLabel(match.awayTeam)
      }));
    }

    return {
      matches: matches.length,
      live: live.length,
      today: scheduleSource.length,
      finished: finished.length
    };
  }

  function applyTeams(teams) {
    if (!Array.isArray(teams) || !teams.length) return { teams: 0 };

    // Keep existing group ordering/flags from data.js for now.
    // football-data.org teams are still useful for endpoint health and future detail pages.
    return { teams: teams.length };
  }

  function groupLetterFromStanding(standing) {
    const value = String(standing.group || standing.stage || standing.type || "").toUpperCase();

    if (value.includes("GROUP_")) return value.split("GROUP_").pop().slice(0, 1);
    const found = value.match(/\bGROUP\s+([A-L])\b/) || value.match(/\b([A-L])\b/);

    return found ? found[1] : null;
  }

  function applyStandings(standings) {
    if (!Array.isArray(standings) || !standings.length) return { standings: 0 };

    let updatedGroups = 0;

    standings.forEach(standing => {
      const letter = groupLetterFromStanding(standing);
      if (!letter || !WC_DATA.groups[letter] || !Array.isArray(standing.table)) return;

      WC_DATA.groups[letter] = standing.table.map(row => {
        const code = row.team?.tla;
        const local = findTeamByCode(code);

        return {
          code: code || local?.code || "",
          name: row.team?.shortName || row.team?.name || local?.name || "Unknown",
          flag: local?.flag || "",
          p: row.playedGames ?? row.played ?? 0,
          gd: row.goalDifference > 0 ? `+${row.goalDifference}` : String(row.goalDifference ?? 0),
          pts: row.points ?? 0
        };
      });

      updatedGroups += 1;
    });

    return { standings: updatedGroups };
  }

  async function loadFootballData() {
    const token = getToken();

    if (!token) {
      setApiAlert(
        "warning",
        `🔐 football-data.org token not set. <button class="api-token-button" onclick="FootballDataOrg.promptForToken()">Add free token</button>`
      );
      return { ok: false, reason: "missing token" };
    }

    try {
      const [matchesResult, standingsResult, teamsResult] = await Promise.allSettled([
        fdFetch("/competitions/WC/matches", token),
        fdFetch("/competitions/WC/standings", token),
        fdFetch("/competitions/WC/teams", token)
      ]);

      const stats = {
        matches: 0,
        standings: 0,
        teams: 0,
        live: 0,
        today: 0,
        finished: 0
      };

      if (matchesResult.status === "fulfilled") {
        Object.assign(stats, applyMatches(matchesResult.value.matches || []));
      }

      if (standingsResult.status === "fulfilled") {
        Object.assign(stats, applyStandings(standingsResult.value.standings || []));
      }

      if (teamsResult.status === "fulfilled") {
        Object.assign(stats, applyTeams(teamsResult.value.teams || []));
      }

      const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      setApiAlert(
        "info",
        `🟢 football-data.org connected at ${now}. Matches: ${stats.matches}. Teams: ${stats.teams}. Standings groups: ${stats.standings}.`
      );

      return { ok: true, stats };
    } catch (error) {
      setApiAlert(
        "warning",
        `⚠️ football-data.org failed, using local fallback data. <button class="api-token-button" onclick="FootballDataOrg.promptForToken()">Update token</button>`
      );

      return { ok: false, reason: error.message };
    }
  }

  window.FootballDataOrg = {
    load: loadFootballData,
    promptForToken,
    saveToken,
    clearToken,
    getToken
  };
})();
