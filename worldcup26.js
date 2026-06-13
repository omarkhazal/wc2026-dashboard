// worldcup26.ir integration for the WC 2026 dashboard
// Free, no-key browser API. Primary endpoint tested from GitHub Pages:
// https://worldcup26.ir/get/games -> { games: Array(104) }

(function () {
  const API_BASE = "https://worldcup26.ir/get";
  const CACHE_KEY = "wc2026LastGoodApiData";
  const CACHE_VERSION = 22;
  const LIVE_WORDS = ["live", "in_progress", "in progress", "playing", "halftime", "half-time"];
  const FINISHED_WORDS = ["complete", "completed", "finished", "full_time", "full-time", "ft", "ended"];
  const SCHEDULED_WORDS = ["scheduled", "not_started", "not started", "upcoming", "timed"];

  function getArray(payload, key) {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload[key])) return payload[key];
    if (payload.data && Array.isArray(payload.data[key])) return payload.data[key];
    if (payload.result && Array.isArray(payload.result[key])) return payload.result[key];

    const arrays = Object.values(payload).filter(Array.isArray);
    return arrays.length ? arrays.sort((a, b) => b.length - a.length)[0] : [];
  }

  function makeSnapshot(stats = {}) {
    return {
      version: CACHE_VERSION,
      savedAt: new Date().toISOString(),
      stats,
      allMatches: WC_DATA.allMatches || [],
      todayMatches: WC_DATA.todayMatches || [],
      liveMatches: WC_DATA.liveMatches || [],
      recentResults: WC_DATA.recentResults || [],
      venues: WC_DATA.venues || []
    };
  }

  function saveLastGoodData(stats) {
    try {
      const snapshot = makeSnapshot(stats);
      localStorage.setItem(CACHE_KEY, JSON.stringify(snapshot));
      return true;
    } catch (error) {
      console.warn("Could not save WC API cache:", error);
      return false;
    }
  }

  function loadLastGoodData() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;

      const snapshot = JSON.parse(raw);
      if (!snapshot || snapshot.version !== CACHE_VERSION) return null;

      if (Array.isArray(snapshot.allMatches)) WC_DATA.allMatches = snapshot.allMatches;
      if (Array.isArray(snapshot.todayMatches)) WC_DATA.todayMatches = snapshot.todayMatches;
      if (Array.isArray(snapshot.liveMatches)) WC_DATA.liveMatches = snapshot.liveMatches;
      if (Array.isArray(snapshot.recentResults)) WC_DATA.recentResults = snapshot.recentResults;
      if (Array.isArray(snapshot.venues) && snapshot.venues.length) WC_DATA.venues = snapshot.venues;

      return snapshot;
    } catch (error) {
      console.warn("Could not load WC API cache:", error);
      return null;
    }
  }

  function cacheAgeLabel(savedAt) {
    if (!savedAt) return "earlier";
    const date = new Date(savedAt);
    if (Number.isNaN(date.getTime())) return "earlier";

    return date.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function fetchJson(path, attempts = 3) {
    let lastError;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        const response = await fetch(`${API_BASE}${path}`, {
          cache: "no-store",
          mode: "cors"
        });

        if (!response.ok) {
          throw new Error(`${path}: ${response.status} ${response.statusText}`);
        }

        return response.json();
      } catch (error) {
        lastError = error;
        if (attempt < attempts) {
          await wait(700 * attempt);
        }
      }
    }

    throw lastError;
  }

  function normalizeId(value) {
    if (value === null || value === undefined) return "";
    if (typeof value === "object") return normalizeId(value.id || value._id || value.team_id || value.teamId);
    return String(value);
  }

  function teamId(team) {
    return normalizeId(team?.id || team?._id || team?.team_id || team?.teamId);
  }

  function teamCode(team) {
    return team?.fifa_code || team?.fifaCode || team?.code || team?.tla || team?.abbr || team?.short_code || "";
  }

  function teamName(team) {
    return team?.name_en || team?.name || team?.team_name || team?.teamName || team?.shortName || team?.country || "TBD";
  }

  function groupLetter(value) {
    const raw = String(value || "").toUpperCase().trim();
    const found = raw.match(/[A-L]/);
    return found ? found[0] : "";
  }

  function findLocalTeamByCode(code) {
    if (!code || typeof WC_DATA === "undefined") return null;

    for (const groupTeams of Object.values(WC_DATA.groups || {})) {
      const match = groupTeams.find(team => team.code === code);
      if (match) return match;
    }

    return null;
  }

  function flagForTeam(team) {
    const code = teamCode(team);
    const local = findLocalTeamByCode(code);
    return local?.flag || "";
  }

  function buildTeamIndexes(teams) {
    const byId = {};
    const byCode = {};
    const byName = {};

    teams.forEach(team => {
      const id = teamId(team);
      const code = teamCode(team);
      const name = teamName(team).toLowerCase();

      if (id) byId[id] = team;
      if (code) byCode[code] = team;
      if (name) byName[name] = team;
    });

    return { byId, byCode, byName };
  }

  function getTeamFromGame(game, side, indexes) {
    const direct =
      game[`${side}_team`] ||
      game[`${side}Team`] ||
      game[side];

    if (direct && typeof direct === "object") return direct;

    const id =
      game[`${side}_team_id`] ||
      game[`${side}TeamId`] ||
      game[`${side}_id`] ||
      game[`${side}Id`];

    if (id && indexes.byId[normalizeId(id)]) return indexes.byId[normalizeId(id)];

    const code =
      game[`${side}_team_code`] ||
      game[`${side}TeamCode`] ||
      game[`${side}_code`] ||
      game[`${side}Code`];

    if (code && indexes.byCode[String(code)]) return indexes.byCode[String(code)];

    const name =
      game[`${side}_team_name_en`] ||
      game[`${side}_team_name`] ||
      game[`${side}TeamName`] ||
      game[`${side}_name`] ||
      game[`${side}Name`] ||
      game[`${side}_team_label`] ||
      game[`${side}TeamLabel`];

    if (name) {
      const key = String(name).toLowerCase();
      if (indexes.byName[key]) return indexes.byName[key];

      return { name_en: String(name), fifa_code: "" };
    }

    return { name_en: "TBD", fifa_code: "" };
  }

  function scoreFor(game, side) {
    const keys = side === "home"
      ? ["home_score", "homeScore", "home_goals", "homeGoals", "home_team_score", "homeTeamScore", "score_home"]
      : ["away_score", "awayScore", "away_goals", "awayGoals", "away_team_score", "awayTeamScore", "score_away"];

    for (const key of keys) {
      if (game[key] !== undefined && game[key] !== null && game[key] !== "") return game[key];
    }

    if (game.score && typeof game.score === "object") {
      const nested = side === "home"
        ? (game.score.home ?? game.score.home_score ?? game.score.homeScore)
        : (game.score.away ?? game.score.away_score ?? game.score.awayScore);

      if (nested !== undefined && nested !== null && nested !== "") return nested;
    }

    return null;
  }

  function scoreText(game) {
    const home = scoreFor(game, "home");
    const away = scoreFor(game, "away");

    if (home === null || away === null) return "vs";
    return `${home} - ${away}`;
  }

  function rawStatus(game) {
    return String(
      game.status ||
      game.match_status ||
      game.state ||
      game.status_en ||
      game.game_status ||
      ""
    ).toLowerCase();
  }

  function isLive(game) {
    const status = rawStatus(game);
    return LIVE_WORDS.some(word => status.includes(word));
  }

  function isFinished(game) {
    const status = rawStatus(game);
    if (FINISHED_WORDS.some(word => status.includes(word))) return true;

    return scoreFor(game, "home") !== null && scoreFor(game, "away") !== null && !isLive(game);
  }

  function isScheduled(game) {
    const status = rawStatus(game);
    if (!status) return !isFinished(game);
    return SCHEDULED_WORDS.some(word => status.includes(word));
  }

  function gameDateObject(game) {
    const dateValue =
      game.datetime ||
      game.date_time ||
      game.utcDate ||
      game.kickoff ||
      game.kickoff_at ||
      game.match_datetime ||
      game.matchDateTime;

    if (dateValue) {
      const parsed = new Date(dateValue);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }

    const date =
      game.date ||
      game.match_date ||
      game.matchDate ||
      game.day;

    const time =
      game.time ||
      game.match_time ||
      game.matchTime ||
      game.hour;

    if (date && time) {
      const parsed = new Date(`${date}T${time}`);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }

    if (date) {
      const parsed = new Date(date);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }

    return null;
  }

  function formatTime(date) {
    if (!date) return "--:--";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function stageName(game) {
    const group =
      game.group ||
      game.groups ||
      game.group_name ||
      game.groupName ||
      game.match_group ||
      game.matchGroup;

    const letter = groupLetter(group);
    if (letter) return `Group ${letter}`;

    const type = game.type || game.stage || game.round || game.matchday;
    if (type) return String(type).replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase());

    return "World Cup";
  }

  function teamLabel(team) {
    const flag = flagForTeam(team);
    const name = teamName(team);
    return flag ? `${flag} ${name}` : name;
  }

  function venueName(game, stadiumsById) {
    const direct =
      game.venue ||
      game.stadium ||
      game.stadium_name ||
      game.stadiumName ||
      game.venue_name ||
      game.venueName;

    if (direct && typeof direct === "string") return direct;

    const id = normalizeId(game.stadium_id || game.stadiumId || game.venue_id || game.venueId);
    const stadium = id ? stadiumsById[id] : null;

    if (stadium) {
      return stadium.name_en || stadium.name || stadium.fifa_name || stadium.city_en || "Stadium";
    }

    return stageName(game);
  }

  function setApiAlert(type, message) {
    if (typeof WC_DATA === "undefined") return;

    WC_DATA.alerts = (WC_DATA.alerts || []).filter(alert => !alert.apiSource);
    WC_DATA.alerts.unshift({
      type,
      apiSource: true,
      text: message
    });
  }

  function numericGoalDifference(value) {
    const parsed = Number(String(value ?? "0").replace("+", ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function sortTableRows(rows) {
    return [...rows].sort((a, b) => {
      return (
        (Number(b.pts) || 0) - (Number(a.pts) || 0) ||
        numericGoalDifference(b.gd) - numericGoalDifference(a.gd) ||
        String(a.name).localeCompare(String(b.name))
      );
    });
  }

  function applyTeams(teams) {
    if (!Array.isArray(teams) || !teams.length) return 0;

    // Important:
    // The /teams endpoint is group composition, not live standings.
    // Do NOT overwrite WC_DATA.groups here, because that can reorder standings
    // a few seconds after page load. Standings stay in data.js until a proper
    // standings endpoint/normalizer is connected.
    return teams.length;
  }

  function applyStadiums(stadiums) {
    if (!Array.isArray(stadiums) || !stadiums.length) return { count: 0, byId: {} };

    const byId = {};

    stadiums.forEach(stadium => {
      const id = normalizeId(stadium.id || stadium._id || stadium.stadium_id || stadium.stadiumId);
      if (id) byId[id] = stadium;
    });

    WC_DATA.venues = stadiums.map(stadium => ({
      name: stadium.name_en || stadium.name || stadium.fifa_name || "Stadium",
      city: stadium.city_en || stadium.city || stadium.location || "",
      country: stadium.country_en || stadium.country || "",
      matches: stadium.matches || stadium.match_count || null
    }));

    return { count: stadiums.length, byId };
  }

  function applyGames(games, teams, stadiumsById) {
    if (!Array.isArray(games) || !games.length) return { games: 0, live: 0, today: 0, finished: 0 };

    const indexes = buildTeamIndexes(teams || []);
    const now = new Date();
    const todayKey = now.toISOString().slice(0, 10);

    const enriched = games.map(game => {
      const date = gameDateObject(game);
      const home = getTeamFromGame(game, "home", indexes);
      const away = getTeamFromGame(game, "away", indexes);

      return { game, date, home, away };
    }).sort((a, b) => {
      return (a.date?.getTime() || 0) - (b.date?.getTime() || 0);
    });

    WC_DATA.allMatches = enriched.map(item => ({
      dateISO: item.date ? item.date.toISOString() : "",
      dateLabel: item.date ? item.date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }) : "TBD",
      time: formatTime(item.date),
      home: teamLabel(item.home),
      away: teamLabel(item.away),
      homeName: teamName(item.home),
      awayName: teamName(item.away),
      homeFlag: flagForTeam(item.home),
      awayFlag: flagForTeam(item.away),
      group: stageName(item.game),
      status: isFinished(item.game) ? "FT" : (isLive(item.game) ? "LIVE" : (rawStatus(item.game).toUpperCase() || "Upcoming")),
      score: scoreText(item.game),
      venue: venueName(item.game, stadiumsById),
      isLive: isLive(item.game),
      isFinished: isFinished(item.game)
    }));

    const live = enriched.filter(item => isLive(item.game));
    const today = enriched.filter(item => {
      return item.date && item.date.toISOString().slice(0, 10) === todayKey;
    });
    const upcoming = enriched.filter(item => {
      return item.date && item.date >= now && !isFinished(item.game);
    });
    const finished = enriched.filter(item => isFinished(item.game)).sort((a, b) => {
      return (b.date?.getTime() || 0) - (a.date?.getTime() || 0);
    });

    WC_DATA.liveMatches = live.slice(0, 4).map(item => ({
      group: stageName(item.game),
      minute: item.game.minute || item.game.elapsed || item.game.time_elapsed || rawStatus(item.game).toUpperCase() || "LIVE",
      home: { name: teamName(item.home), flag: flagForTeam(item.home) },
      away: { name: teamName(item.away), flag: flagForTeam(item.away) },
      score: scoreText(item.game),
      venue: venueName(item.game, stadiumsById)
    }));

    const schedule = today.length ? today : upcoming.slice(0, 6);

    WC_DATA.todayMatches = schedule.slice(0, 6).map(item => ({
      time: formatTime(item.date),
      home: teamLabel(item.home),
      away: teamLabel(item.away),
      group: stageName(item.game),
      status: isFinished(item.game) ? scoreText(item.game) : (rawStatus(item.game).toUpperCase() || "Upcoming")
    }));

    if (finished.length) {
      WC_DATA.recentResults = finished.slice(0, 6).map(item => ({
        home: teamLabel(item.home),
        score: scoreText(item.game),
        away: teamLabel(item.away)
      }));
    }

    return {
      games: games.length,
      live: live.length,
      today: schedule.length,
      finished: finished.length
    };
  }

  async function load() {
    try {
      const [gamesPayload, teamsPayload, stadiumsPayload, groupsPayload] = await Promise.all([
        fetchJson("/games", 4),
        fetchJson("/teams", 1).catch(() => ({})),
        fetchJson("/stadiums", 1).catch(() => ({})),
        fetchJson("/groups", 1).catch(() => ({}))
      ]);

      const games = getArray(gamesPayload, "games");
      const teams = getArray(teamsPayload, "teams");
      const stadiums = getArray(stadiumsPayload, "stadiums");

      const stadiumResult = applyStadiums(stadiums);
      const teamCount = applyTeams(teams);
      const gameStats = applyGames(games, teams, stadiumResult.byId);

      const stats = {
        games: gameStats.games,
        live: gameStats.live,
        today: gameStats.today,
        finished: gameStats.finished,
        teams: teamCount,
        stadiums: stadiumResult.count
      };

      saveLastGoodData(stats);

      const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      setApiAlert(
        "info",
        `🟢 Live data synced at ${now}. Games: ${stats.games}. Teams: ${stats.teams}. Stadiums: ${stats.stadiums}. Last-good cache saved.`
      );

      return {
        ok: true,
        source: "worldcup26.ir",
        stats,
        groupsPayload
      };
    } catch (error) {
      const cached = loadLastGoodData();

      if (cached) {
        setApiAlert(
          "warning",
          `🟡 Live API unavailable, using saved data from ${cacheAgeLabel(cached.savedAt)}.`
        );

        return {
          ok: true,
          source: "localStorage cache",
          cached: true,
          stats: cached.stats || {},
          error: error.message || String(error)
        };
      }

      setApiAlert(
        "warning",
        `⚠️ Live API unavailable and no saved API cache exists. Using built-in fallback data.`
      );

      return {
        ok: false,
        source: "data.js fallback",
        error: error.message || String(error)
      };
    }
  }

  window.WorldCup26API = {
    load,
    clearCache() {
      localStorage.removeItem(CACHE_KEY);
      return "WC 2026 API cache cleared";
    },
    getCache() {
      try {
        return JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
      } catch {
        return null;
      }
    }
  };
})();
