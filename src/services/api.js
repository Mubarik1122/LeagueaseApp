import { getActiveCompanyId } from "../utils/companySelection";
import { buildCompanyUserQuery } from "../utils/companyUserFilters";
import { buildCompanyMatchQuery } from "../utils/companyMatchFilters";

// Base API configuration
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://leagueaseappbackend-production.up.railway.app/api";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

function withCompanyId(payload = {}) {
  const companyId = getActiveCompanyId();
  if (!companyId || payload.companyId != null) {
    return payload;
  }
  return { ...payload, companyId };
}

function appendCompanyIdToParams(params) {
  const companyId = getActiveCompanyId();
  if (companyId) {
    params.append("companyId", companyId);
  }
  return params;
}

function buildApiUrl(path, query = {}) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value != null && String(value) !== "") {
      params.append(key, String(value));
    }
  });
  appendCompanyIdToParams(params);
  const queryString = params.toString();
  return `${API_BASE_URL}${path}${queryString ? `?${queryString}` : ""}`;
}

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      data.errorMessage || `HTTP error! status: ${response.status}`
    );
  }
  if (data.errorCode !== undefined && data.errorCode !== 0) {
    throw new Error(data.errorMessage || "API request failed");
  }

  return data;
};

// Auth API functions
export const authAPI = {
  requestOTP: async (email) => {
    const response = await fetch(`${API_BASE_URL}/auth/request-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return handleResponse(response);
  },

  verifyOTP: async (email, otp) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    return handleResponse(response);
  },

  verifyUsername: async (username) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-username`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    return handleResponse(response);
  },

  signup: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(withCompanyId(userData)),
    });
    return handleResponse(response);
  },

  login: async (identifier, password, leagueId = null) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password, leagueId }),
    });
    return handleResponse(response);
  },

  forgotPassword: async (email, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, newPassword }),
    });
    return handleResponse(response);
  },

  createLeague: async (leagueData) => {
    const response = await fetch(`${API_BASE_URL}/auth/create-league`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(withCompanyId(leagueData)),
    });
    return handleResponse(response);
  },

};

export const companyAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/company/get-all`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getMyContext: async () => {
    const response = await fetch(`${API_BASE_URL}/company/me`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  /**
   * GET /company/get-users
   * Query: status, role, division, team, userId, search (+ companyId for Super Admin)
   */
  getUsers: async (filters = {}) => {
    const response = await fetch(
      buildApiUrl("/company/get-users", buildCompanyUserQuery(filters)),
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  updateUser: async (payload) => {
    const response = await fetch(`${API_BASE_URL}/company/update-user`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(withCompanyId(payload)),
    });
    return handleResponse(response);
  },

  deleteUser: async (userId) => {
    const response = await fetch(
      buildApiUrl(`/company/delete-user/${userId}`),
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  /**
   * POST /company/check-user-exists
   * Body: { email } OR { username } (+ optional userId to exclude on edit, companyId for Super Admin via withCompanyId)
   */
  /**
   * GET /company/get-matches
   * Query: status, dateFrom, dateTo, division, venue, homeTeam, awayTeam (+ companyId for Super Admin)
   */
  getMatches: async (filters = {}) => {
    const response = await fetch(
      buildApiUrl("/company/get-matches", buildCompanyMatchQuery(filters)),
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  checkUserExists: async (payload = {}) => {
    const response = await fetch(`${API_BASE_URL}/company/check-user-exists`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(withCompanyId(payload)),
    });
    return handleResponse(response);
  },
};

// League API functions
export const leagueAPI = {
  getLeagueByIdentifier: async (identifier) => {
    const response = await fetch(
      `${API_BASE_URL}/leaguease/get-leaguease-by-identifier`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      }
    );
    return handleResponse(response);
  },
};

/**
 * Body for POST /tournament/save (create or update division/tournament).
 * Backend uses divisionOrtournamentName (capital O in "Or").
 */
export function buildTournamentSavePayload(input = {}) {
  const name =
    input.divisionOrtournamentName ??
    input.tournamentName ??
    input.name ??
    "";

  const rawId =
    input.divisionOrTournamentId ??
    input.tournamentId ??
    input._id ??
    input.id;
  const divisionOrTournamentId =
    rawId !== undefined && rawId !== null && rawId !== "" ? rawId : null;

  return {
    divisionOrTournamentId,
    divisionOrtournamentName: name,
    userId: input.userId,
    divisionOrTournamentType:
      input.divisionOrTournamentType ?? input.tournamentType ?? "Division",
    sequence: Number(input.sequence ?? 0) || 0,
    shortCode: input.shortCode != null ? String(input.shortCode) : "",
    scoringSystem:
      input.scoringSystem !== undefined ? input.scoringSystem : null,
    promotionZone: Number(input.promotionZone ?? 0) || 0,
    relegationZone: Number(input.relegationZone ?? 0) || 0,
    positionHighlights: input.positionHighlights ?? "auto",
    hideMatchesFrom:
      input.hideMatchesFrom !== undefined &&
      input.hideMatchesFrom !== null &&
      input.hideMatchesFrom !== ""
        ? input.hideMatchesFrom
        : null,
    hideStandings: Boolean(input.hideStandings),
    hidePlayers: Boolean(input.hidePlayers),
    hideScore: Boolean(input.hideScore),
    hideVenue: Boolean(input.hideVenue),
  };
}

/**
 * Normalizes GET /tournament/get-tournament-by-User-Id `data` into one record.
 * When `divisionOrTournamentId` is set, prefers the matching item in an array.
 */
export function pickTournamentFromResponse(responseData, divisionOrTournamentId) {
  const d = responseData;
  if (d == null) return null;
  if (Array.isArray(d)) {
    if (divisionOrTournamentId != null && String(divisionOrTournamentId) !== "") {
      const want = String(divisionOrTournamentId);
      const found = d.find(
        (x) =>
          String(
            x?.divisionOrTournamentId ??
              x?._id ??
              x?.id ??
              x?.tournamentId
          ) === want
      );
      return found ?? d[0] ?? null;
    }
    return d[0] ?? null;
  }
  if (typeof d === "object") return d;
  return null;
}

/** Maps API tournament object to division settings form state */
export function tournamentToDivisionForm(t) {
  if (!t || typeof t !== "object") {
    return {
      divisionOrtournamentName: "",
      divisionOrTournamentType: "Division",
      sequence: 0,
      shortCode: "",
      scoringSystem: null,
      promotionZone: 0,
      relegationZone: 0,
      positionHighlights: "auto",
      hideMatchesFrom: "",
      hideStandings: false,
      hidePlayers: false,
      hideScore: false,
      hideVenue: false,
    };
  }
  const rawDate = t.hideMatchesFrom;
  let hideMatchesFrom = "";
  if (rawDate != null && rawDate !== "") {
    const s = String(rawDate);
    hideMatchesFrom = s.includes("T") ? s.slice(0, 10) : s.slice(0, 10);
  }
  return {
    divisionOrtournamentName:
      t.divisionOrtournamentName ?? t.tournamentName ?? t.name ?? "",
    divisionOrTournamentType:
      t.divisionOrTournamentType ?? t.tournamentType ?? "Division",
    sequence: Number(t.sequence ?? 0) || 0,
    shortCode: t.shortCode != null ? String(t.shortCode) : "",
    scoringSystem: t.scoringSystem ?? null,
    promotionZone: Number(t.promotionZone ?? 0) || 0,
    relegationZone: Number(t.relegationZone ?? 0) || 0,
    positionHighlights:
      t.positionHighlights === "manual" ? "manual" : "auto",
    hideMatchesFrom,
    hideStandings: Boolean(t.hideStandings),
    hidePlayers: Boolean(t.hidePlayers),
    hideScore: Boolean(t.hideScore),
    hideVenue: Boolean(t.hideVenue),
  };
}

// Tournament API functions
export const tournamentAPI = {
  save: async (tournamentData) => {
    const payload = withCompanyId(buildTournamentSavePayload(tournamentData));
    const response = await fetch(`${API_BASE_URL}/tournament/save`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },

  /**
   * @param {string} userId
   * @param {{ divisionOrTournamentId?: string }} [options] — optional filter for one division/tournament
   */
  getByUserId: async (userId, options = {}) => {
    const params = new URLSearchParams({ userId: String(userId) });
    const { divisionOrTournamentId } = options;
    if (
      divisionOrTournamentId != null &&
      String(divisionOrTournamentId) !== ""
    ) {
      params.append(
        "divisionOrTournamentId",
        String(divisionOrTournamentId)
      );
    }
    appendCompanyIdToParams(params);
    const response = await fetch(
      `${API_BASE_URL}/tournament/get-tournament-by-User-Id?${params.toString()}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },
};

// Role API functions
export const roleAPI = {
  getRoles: async () => {
    const response = await fetch(`${API_BASE_URL}/role/get-roles`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Settings API functions
export const settingsAPI = {
  getSettings: async () => {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  saveSettings: async (tab, data, userId) => {
    const response = await fetch(`${API_BASE_URL}/settings/save`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        tab,
        data,
        userId,
      }),
    });
    return handleResponse(response);
  },
};

function normalizeVenueIdEntry(v) {
  if (v && typeof v === "object") {
    const oid = v._id ?? v.id ?? v.venueId;
    return oid != null ? String(oid).trim() : "";
  }
  return String(v ?? "").trim();
}

function normalizeTournamentIdValue(value) {
  if (value == null) return "";
  if (typeof value === "object") {
    const oid = value._id ?? value.id ?? value.tournamentId;
    return oid != null ? String(oid).trim() : "";
  }
  return String(value).trim();
}

/** Collect division/tournament ids already linked to a team (for saveTeam tournamentIds). */
export function collectTeamTournamentIds(team = {}, addTournamentId = null) {
  const ids = new Set();
  const add = (value) => {
    const id = normalizeTournamentIdValue(value);
    if (id) ids.add(id);
  };

  if (Array.isArray(team.tournamentIds)) {
    team.tournamentIds.forEach((id) => add(id));
  }

  add(team.tournamentId);
  add(team.divisionOrTournamentId);

  const extra = normalizeTournamentIdValue(addTournamentId);
  if (extra) ids.add(extra);

  return [...ids];
}

/**
 * Body for POST /tournament/saveTeam (create or update team in a tournament).
 * Matches latest API: tournamentId + tournamentIds[], venueIds[], etc.
 */
export function buildTeamSavePayload(input = {}) {
  const rawTeamId = input.teamId ?? input._id ?? input.id;
  const teamId =
    rawTeamId !== undefined && rawTeamId !== null && String(rawTeamId) !== ""
      ? String(rawTeamId)
      : null;

  let venueIds = [];
  if (Array.isArray(input.venueIds)) {
    venueIds = input.venueIds.map(normalizeVenueIdEntry).filter(Boolean);
  } else if (input.venueId != null && String(input.venueId).trim() !== "") {
    venueIds = [String(input.venueId).trim()];
  }

  const teamName = (input.teamName ?? input.name ?? "").trim();
  const displayNameRaw = input.displayName;
  const displayName =
    displayNameRaw != null && String(displayNameRaw).trim() !== ""
      ? String(displayNameRaw).trim()
      : teamName;

  const tournamentId = normalizeTournamentIdValue(input.tournamentId) || null;

  let tournamentIds = [];
  if (Array.isArray(input.tournamentIds) && input.tournamentIds.length > 0) {
    tournamentIds = input.tournamentIds
      .map((id) => normalizeTournamentIdValue(id))
      .filter(Boolean);
  } else {
    tournamentIds = collectTeamTournamentIds(input, tournamentId);
  }

  if (tournamentId && !tournamentIds.includes(tournamentId)) {
    tournamentIds = [tournamentId, ...tournamentIds];
  }

  tournamentIds = [...new Set(tournamentIds)];

  const logoRaw = input.logo;
  const logo =
    logoRaw !== undefined && logoRaw !== null && String(logoRaw).trim() !== ""
      ? String(logoRaw).trim()
      : null;

  return {
    teamId,
    userId: input.userId,
    tournamentId,
    tournamentIds,
    teamName,
    displayName,
    shortCode:
      input.shortCode != null ? String(input.shortCode).trim().toUpperCase() : "",
    logo,
    venueIds,
    about:
      input.about !== undefined && input.about !== null
        ? String(input.about)
        : null,
    isArchived: Boolean(input.isArchived),
    teamType:
      input.teamType !== undefined && input.teamType !== null
        ? String(input.teamType)
        : null,
    playersAgeCategory:
      input.playersAgeCategory !== undefined &&
      input.playersAgeCategory !== null
        ? String(input.playersAgeCategory)
        : null,
    upcomingSeason:
      input.upcomingSeason !== undefined && input.upcomingSeason !== null
        ? String(input.upcomingSeason)
        : null,
  };
}

/**
 * @param {string} userId
 * @param {string} tournamentId — current division / tournament context
 * @param {{ filter?: '' | 'not_in_division' | 'other_division' }} [options]
 *   '' (default): teams assigned to this division
 *   not_in_division: teams not assigned to any division
 *   other_division: teams assigned to a different division than tournamentId
 */
async function fetchTeamsByUserAndTournament(userId, tournamentId, options = {}) {
  const filter =
    options.filter !== undefined && options.filter !== null
      ? String(options.filter)
      : "";
  const params = new URLSearchParams({
    userId: String(userId),
    tournamentId: String(tournamentId),
    filter,
  });
  appendCompanyIdToParams(params);
  const response = await fetch(
    `${API_BASE_URL}/tournament/get-team-by-User-Id-and-tournament-Id?${params.toString()}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );
  return handleResponse(response);
}

// Team API functions
export const teamAPI = {
  save: async (teamData) => {
    const payload = withCompanyId(buildTeamSavePayload(teamData));
    const response = await fetch(`${API_BASE_URL}/tournament/saveTeam`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },

  getByUserIdAndTournament: fetchTeamsByUserAndTournament,

  /** @deprecated use getByUserIdAndTournament — same endpoint */
  getByUserIdAndTournamentId: (userId, tournamentId, options) =>
    fetchTeamsByUserAndTournament(userId, tournamentId, options),

  detachFromDivision: async (teamId, userId, tournamentId) => {
    const params = new URLSearchParams({
      userId: String(userId),
      tournamentId: String(tournamentId),
    });
    const response = await fetch(
      `${API_BASE_URL}/tournament/detach-team-from-division/${teamId}?${params.toString()}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  /** DELETE /tournament/delete-team/{teamId}?userId= */
  delete: async (teamId, userId) => {
    const params = new URLSearchParams({
      userId: String(userId),
    });
    appendCompanyIdToParams(params);
    const response = await fetch(
      `${API_BASE_URL}/tournament/delete-team/${teamId}?${params.toString()}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },
};

/**
 * DELETE /tournament/delete-division/{divisionId}?userId=
 */
tournamentAPI.deleteById = async (tournamentId, userId) => {
  const response = await fetch(
    `${API_BASE_URL}/tournament/delete-division/${tournamentId}?userId=${encodeURIComponent(String(userId))}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );
  const result = await handleResponse(response);
  return {
    ...result,
    data: {
      ...(result?.data && typeof result.data === "object" ? result.data : {}),
    },
  };
};

// Player API functions
export const playerAPI = {
  save: async (playerData) => {
    const response = await fetch(`${API_BASE_URL}/tournament/savePlayer`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(withCompanyId(playerData)),
    });
    return handleResponse(response);
  },

  getByUserIdAndTeam: async (userId, teamId) => {
    const response = await fetch(
      `${API_BASE_URL}/tournament/get-players-by-userId-and-team?userId=${userId}&teamId=${teamId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  getByTeam: async (teamId) => {
    const response = await fetch(
      buildApiUrl("/tournament/get-players-by-team", { teamId }),
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  /** DELETE /tournament/remove-player-from-team/{playerId}?teamId=&userId= */
  removeFromTeam: async (playerId, teamId, userId) => {
    const params = new URLSearchParams({
      teamId: String(teamId),
      userId: String(userId),
    });
    appendCompanyIdToParams(params);
    const response = await fetch(
      `${API_BASE_URL}/tournament/remove-player-from-team/${playerId}?${params.toString()}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },
};

function toMatchDateTimeISO(dateStr, timeStr) {
  const [year, month, day] = String(dateStr).split("-").map(Number);
  const timeParts = String(timeStr).split(":").map(Number);
  const hours = timeParts[0] ?? 0;
  const minutes = timeParts[1] ?? 0;
  const seconds = timeParts[2] ?? 0;
  return new Date(year, month - 1, day, hours, minutes, seconds).toISOString();
}

export const MATCH_DATE_STATUS_OPTIONS = [
  { value: "Scheduled", label: "Normal / scheduled" },
  { value: "ToBeConfirmed", label: "To be confirmed" },
  { value: "Confirmed", label: "Confirmed" },
  { value: "Cancelled", label: "Cancelled" },
];

export function formatMatchDateStatusLabel(value) {
  const normalized = String(value || "Scheduled");
  const found = MATCH_DATE_STATUS_OPTIONS.find(
    (option) => option.value === normalized
  );
  if (found) return found.label;
  if (normalized === "Normal") return "Normal / scheduled";
  return normalized;
}

/** POST /match/saveMatch */
export function buildMatchSavePayload(input = {}) {
  const dateTime =
    input.dateTime ??
    (input.date && input.time
      ? toMatchDateTimeISO(input.date, input.time)
      : null);

  const payload = {
    userId: String(input.userId ?? ""),
    homeTeamId: String(input.homeTeamId ?? ""),
    awayTeamId: String(input.awayTeamId ?? ""),
    venueId: input.venueId ? String(input.venueId) : "",
    dateTime,
    status: input.status ?? "Scheduled",
    dateStatus: input.dateStatus ?? "Scheduled",
    note: input.note ?? "",
    displayNote: Boolean(input.displayNote ?? false),
    homeTeamNote: input.homeTeamNote ?? "",
    awayTeamNote: input.awayTeamNote ?? "",
    scoreLocked: Boolean(input.scoreLocked ?? false),
    homeStatsLocked: Boolean(input.homeStatsLocked ?? false),
    awayStatsLocked: Boolean(input.awayStatsLocked ?? false),
  };

  if (input.matchId) {
    payload.matchId = String(input.matchId);
  }

  if (input.homeScore != null && input.homeScore !== "") {
    payload.homeScore = Number(input.homeScore);
  }
  if (input.awayScore != null && input.awayScore !== "") {
    payload.awayScore = Number(input.awayScore);
  }

  return payload;
}

// Match API functions
export const matchAPI = {
  save: async (matchData) => {
    const payload = withCompanyId(buildMatchSavePayload(matchData));
    const response = await fetch(`${API_BASE_URL}/match/saveMatch`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },

  /** DELETE /match/delete-match/{matchId}?companyId= */
  delete: async (matchId) => {
    const response = await fetch(
      buildApiUrl(`/match/delete-match/${matchId}`),
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },
};

let venueDetailsInflight = null;

// Venue API functions
export const venueAPI = {
  getDetails: async (userId, venueId = null) => {
    const scopeKey = `${userId || ""}:${venueId || ""}:${
      getActiveCompanyId() || ""
    }`;

    if (venueDetailsInflight?.key === scopeKey) {
      return venueDetailsInflight.promise;
    }

    const promise = (async () => {
      const url = buildApiUrl("/venue/get-venue-details", {
        userId,
        ...(venueId ? { venueId } : {}),
      });
      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    })();

    venueDetailsInflight = { key: scopeKey, promise };

    try {
      return await promise;
    } finally {
      if (venueDetailsInflight?.promise === promise) {
        venueDetailsInflight = null;
      }
    }
  },

  getNamesByUserId: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/venue/get-venue-names/${userId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  save: async (venueData) => {
    const response = await fetch(`${API_BASE_URL}/venue/saveVenue`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(withCompanyId(venueData)),
    });
    return handleResponse(response);
  },

  deleteById: async (venueId, userId) => {
    const response = await fetch(
      `${API_BASE_URL}/venue/deleteVenue/${venueId}?userId=${userId}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },
};

let seasonsGetAllInflight = null;

// Season API functions
export const seasonAPI = {
  save: async (seasonData) => {
    const response = await fetch(`${API_BASE_URL}/season/save`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(withCompanyId(seasonData)),
    });
    return handleResponse(response);
  },

  getAll: async () => {
    const scopeKey = getActiveCompanyId() || "__default__";

    if (seasonsGetAllInflight?.key === scopeKey) {
      return seasonsGetAllInflight.promise;
    }

    const promise = (async () => {
      const response = await fetch(buildApiUrl("/season"), {
        method: "GET",
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    })();

    seasonsGetAllInflight = { key: scopeKey, promise };

    try {
      return await promise;
    } finally {
      if (seasonsGetAllInflight?.promise === promise) {
        seasonsGetAllInflight = null;
      }
    }
  },

  getById: async (seasonId) => {
    const response = await fetch(`${API_BASE_URL}/season/${seasonId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  deleteById: async (seasonId) => {
    const response = await fetch(`${API_BASE_URL}/season/${seasonId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};
