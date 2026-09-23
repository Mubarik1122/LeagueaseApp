import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import clsx from "clsx";
import {
  ArrowLeft,
  ClipboardList,
  Loader2,
  Save,
  Users,
} from "lucide-react";
import Swal from "sweetalert2";
import { companyAPI, matchAPI, playerAPI } from "../../services/api";
import {
  mapCompanyMatch,
} from "../../hooks/useCompanyMatches";
import {
  normalizePointType,
  sortPointTypes,
} from "../../hooks/usePointTypes";
import { useCompanyContext } from "../../context/CompanyContext";
import RequirePageAccess from "../../components/RequirePageAccess";

const AUTO_APPEARANCES_LABEL = "__auto_calculate_appearances__";

/** Map point-type labels → API stats object keys */
const STAT_KEY_BY_LABEL = {
  points: "points",
  "field goal made": "fieldGoalMade",
  "field goal attempted": "fieldGoalAttempted",
  "three pointers": "threePointers",
  "3 pointers": "threePointers",
  "3pt field goal attempted": "threePtFieldGoalAttempted",
  "3 pt field goal attempted": "threePtFieldGoalAttempted",
  "free throw made": "freeThrowsMade",
  "free throws made": "freeThrowsMade",
  "free throw attempted": "freeThrowsAttempted",
  "free throws attempted": "freeThrowsAttempted",
  turnovers: "turnovers",
  rebounds: "rebounds",
  assists: "assists",
  steals: "steals",
  blocks: "blockedShots",
  "blocked shots": "blockedShots",
};

function toStatKey(pointType) {
  const explicit =
    pointType?.statKey || pointType?.key || pointType?.code || pointType?.slug;
  if (explicit) return String(explicit).trim();

  const label = String(pointType?.label || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
  if (STAT_KEY_BY_LABEL[label]) return STAT_KEY_BY_LABEL[label];

  return label
    .replace(/[^a-z0-9]+([a-z0-9])/g, (_, c) => c.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, "")
    .replace(/^[A-Z]/, (c) => c.toLowerCase());
}

function parseStatValue(value) {
  if (value === true || value === "1" || value === 1) return 1;
  if (value === "" || value == null || value === false) return 0;
  const num = Number(value);
  return Number.isNaN(num) ? 0 : num;
}

function resolveUserId() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.userId || user._id || user.id || null;
  } catch {
    return null;
  }
}

function teamIdFrom(team) {
  if (!team) return "";
  if (typeof team === "string") return team;
  return String(team.teamId ?? team._id ?? team.id ?? "");
}

function playerIdFrom(player) {
  return String(player?._id ?? player?.id ?? player?.playerId ?? "");
}

function playerNameFrom(player) {
  const full = [player?.firstName, player?.lastName].filter(Boolean).join(" ");
  return (
    player?.playerName ||
    player?.displayName ||
    player?.name ||
    full ||
    "Unnamed player"
  );
}

function formatMatchDate(dateTime) {
  if (!dateTime) return "";
  const d = new Date(dateTime);
  if (Number.isNaN(d.getTime())) return String(dateTime);
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function emptyStatsForPlayers(players, pointTypeIds) {
  const next = {};
  for (const player of players) {
    const pid = playerIdFrom(player);
    if (!pid) continue;
    next[pid] = {};
    for (const pointId of pointTypeIds) {
      next[pid][pointId] = "";
    }
  }
  return next;
}

function playersFromTeamBlock(teamBlock) {
  if (!teamBlock) return [];
  if (Array.isArray(teamBlock.players)) return teamBlock.players;
  return [];
}

/** Parse GET /match/player-stats `data` into home/away player rows */
function splitMatchPlayerStats(data) {
  if (!data) {
    return { homePlayers: [], awayPlayers: [] };
  }

  // New shape: { matchId, homeTeam: { players }, awayTeam: { players } }
  if (data.homeTeam || data.awayTeam) {
    return {
      homePlayers: playersFromTeamBlock(data.homeTeam),
      awayPlayers: playersFromTeamBlock(data.awayTeam),
    };
  }

  // Legacy shapes
  if (Array.isArray(data)) {
    return { homePlayers: data, awayPlayers: data };
  }
  if (Array.isArray(data.players)) {
    return { homePlayers: data.players, awayPlayers: data.players };
  }
  if (Array.isArray(data.playerStats)) {
    return { homePlayers: data.playerStats, awayPlayers: data.playerStats };
  }

  return { homePlayers: [], awayPlayers: [] };
}

function formatCellValue(value, isCheckbox) {
  if (value == null || value === "") return "";
  if (isCheckbox) {
    return value === true || value === 1 || value === "1" ? "1" : "";
  }
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return String(num);
}

function buildPointKeyIndex(pointTypes) {
  const keyToPointId = {};
  for (const pt of pointTypes) {
    const pointId = String(pt.id);
    keyToPointId[pointId] = pointId;

    const key = toStatKey(pt);
    if (key) {
      keyToPointId[key] = pointId;
      keyToPointId[key.toLowerCase()] = pointId;
    }

    const label = String(pt.label || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
    if (label) keyToPointId[label] = pointId;

    // teamTotals / player stats use pointTypeName
    const name = String(pt.pointTypeName || pt.name || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
    if (name) keyToPointId[name] = pointId;
  }
  return keyToPointId;
}

function resolvePointIdForStatKey(key, keyToPointId) {
  if (!key) return null;
  const raw = String(key);
  return (
    keyToPointId[raw] ||
    keyToPointId[raw.toLowerCase()] ||
    keyToPointId[raw.replace(/\s+/g, " ").toLowerCase()] ||
    null
  );
}

function applyStatArrayItems(base, pid, items, pointTypes, keyToPointId) {
  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const pointId = resolvePointIdForStatKey(
      item.pointId ??
        item.pointTypeId ??
        item.pointTypeName ??
        item.key ??
        item.label ??
        item.name,
      keyToPointId
    );
    if (!pointId) continue;
    const pt = pointTypes.find((p) => String(p.id) === pointId);
    base[pid][pointId] = formatCellValue(
      item.value ?? item.totalValue ?? item.count ?? item.amount,
      Boolean(pt?.isCheckbox)
    );
  }
}

function applyFetchedStats(players, pointTypes, fetchedList) {
  const pointIds = pointTypes.map((p) => String(p.id));
  const base = emptyStatsForPlayers(players, pointIds);
  const keyToPointId = buildPointKeyIndex(pointTypes);

  const playerIdMap = {};
  const playerNameMap = {};
  for (const player of players) {
    const canonical = playerIdFrom(player);
    if (!canonical) continue;
    for (const candidate of [
      player?._id,
      player?.id,
      player?.playerId,
      canonical,
    ]) {
      if (candidate != null && String(candidate).trim() !== "") {
        playerIdMap[String(candidate)] = canonical;
      }
    }
    const name = String(playerNameFrom(player)).trim().toLowerCase();
    if (name) playerNameMap[name] = canonical;
  }

  for (const row of fetchedList) {
    const rawPid = String(
      row?.playerId ??
        row?._id ??
        row?.id ??
        row?.player?._id ??
        row?.player?.id ??
        row?.player?.playerId ??
        ""
    );
    let pid = playerIdMap[rawPid];
    if (!pid) {
      const name = String(row?.playerName ?? row?.name ?? "")
        .trim()
        .toLowerCase();
      pid = name ? playerNameMap[name] : null;
    }
    if (!pid || !base[pid]) continue;

    if (Array.isArray(row?.stats)) {
      applyStatArrayItems(base, pid, row.stats, pointTypes, keyToPointId);
      continue;
    }

    let statsObj = null;
    if (row?.stats && typeof row.stats === "object") {
      statsObj = row.stats;
    } else if (
      row?.playerStats &&
      typeof row.playerStats === "object" &&
      !Array.isArray(row.playerStats)
    ) {
      statsObj = row.playerStats;
    } else if (row && typeof row === "object") {
      statsObj = row;
    }

    if (!statsObj || typeof statsObj !== "object") continue;

    for (const [key, rawValue] of Object.entries(statsObj)) {
      if (
        [
          "playerId",
          "_id",
          "id",
          "stats",
          "playerStats",
          "player",
          "teamId",
          "matchId",
          "playerName",
          "name",
          "side",
        ].includes(key)
      ) {
        continue;
      }
      const pointId = resolvePointIdForStatKey(key, keyToPointId);
      if (!pointId) continue;
      const pt = pointTypes.find((p) => String(p.id) === pointId);
      base[pid][pointId] = formatCellValue(rawValue, Boolean(pt?.isCheckbox));
    }
  }

  return base;
}

/** Prefer roster API; fall back to players embedded in player-stats response */
function mergeRosterWithStatsPlayers(rosterList, statsPlayers) {
  if (Array.isArray(rosterList) && rosterList.length > 0) return rosterList;
  return (statsPlayers || []).map((p) => ({
    _id: p.playerId || p._id || p.id,
    id: p.playerId || p._id || p.id,
    playerId: p.playerId || p._id || p.id,
    playerName: p.playerName || p.name,
    firstName: p.firstName,
    lastName: p.lastName,
  }));
}

async function fetchPlayersForTeam(userId, teamId) {
  if (!teamId) return [];
  try {
    const res = await playerAPI.getByTeam(teamId);
    const list = Array.isArray(res?.data)
      ? res.data
      : res?.data
        ? [res.data]
        : [];
    if (list.length) return list;

    if (userId) {
      const fallback = await playerAPI.getByUserIdAndTeam(userId, teamId);
      return Array.isArray(fallback?.data)
        ? fallback.data
        : fallback?.data
          ? [fallback.data]
          : [];
    }
    return [];
  } catch {
    if (!userId) return [];
    try {
      const fallback = await playerAPI.getByUserIdAndTeam(userId, teamId);
      return Array.isArray(fallback?.data)
        ? fallback.data
        : fallback?.data
          ? [fallback.data]
          : [];
    } catch {
      return [];
    }
  }
}

/** Survives React StrictMode remount (useRef resets on remount). */
const matchStatsLoadCache = new Map();

export default function MatchStatistics() {
  const { matchId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isSuperAdmin, selectedCompanyId, companiesReady } =
    useCompanyContext();

  const matchFromNavRef = useRef(location.state?.match || null);

  const [match, setMatch] = useState(() => location.state?.match || null);
  const [activeSide, setActiveSide] = useState("home");
  const [pointTypes, setPointTypes] = useState([]);
  const [homePlayers, setHomePlayers] = useState([]);
  const [awayPlayers, setAwayPlayers] = useState([]);
  const [homeStats, setHomeStats] = useState({});
  const [awayStats, setAwayStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const userId = resolveUserId();

  useEffect(() => {
    if (!matchId) return;
    if (isSuperAdmin && (!companiesReady || !selectedCompanyId)) return;

    const loadKey = `${matchId}:${isSuperAdmin ? selectedCompanyId : "self"}:${userId || ""}`;
    let cancelled = false;

    setLoading(true);
    setError(null);

    let promise = matchStatsLoadCache.get(loadKey);

    if (!promise) {
      promise = (async () => {
        let currentMatch = matchFromNavRef.current || null;
        if (
          !currentMatch ||
          String(currentMatch.matchId) !== String(matchId)
        ) {
          const matchesRes = await companyAPI.getMatches({});
          const raw = Array.isArray(matchesRes?.data?.matches)
            ? matchesRes.data.matches
            : [];
          currentMatch =
            raw
              .map(mapCompanyMatch)
              .find((m) => String(m.matchId) === String(matchId)) || null;
        }

        if (!currentMatch) {
          throw new Error("Match not found.");
        }

        const homeId = teamIdFrom(currentMatch.homeTeam);
        const awayId = teamIdFrom(currentMatch.awayTeam);
        const statsTeamId = homeId || awayId;

        // Home + away = 2 get-players-by-team calls (different teamId).
        // Shared via dedupedGet so StrictMode does not double the same team.
        const [pointsRes, homeList, awayList, statsRes] = await Promise.all([
          matchAPI.getAllPointTypes(userId),
          fetchPlayersForTeam(userId, homeId),
          fetchPlayersForTeam(userId, awayId),
          statsTeamId
            ? matchAPI.getPlayerStats({ matchId, teamId: statsTeamId })
            : Promise.resolve(null),
        ]);

        const points = sortPointTypes(
          (Array.isArray(pointsRes?.data) ? pointsRes.data : [])
            .map(normalizePointType)
            .filter(
              (p) =>
                !p.isArchived &&
                String(p.label || "").trim() !== AUTO_APPEARANCES_LABEL
            )
        );

        const { homePlayers: homeStatPlayers, awayPlayers: awayStatPlayers } =
          splitMatchPlayerStats(statsRes?.data);

        return {
          currentMatch,
          points,
          homeList: mergeRosterWithStatsPlayers(homeList, homeStatPlayers),
          awayList: mergeRosterWithStatsPlayers(awayList, awayStatPlayers),
          homeStatPlayers,
          awayStatPlayers,
        };
      })();

      matchStatsLoadCache.set(loadKey, promise);
      promise.finally(() => {
        if (matchStatsLoadCache.get(loadKey) === promise) {
          matchStatsLoadCache.delete(loadKey);
        }
      });
    }

    (async () => {
      try {
        const result = await promise;
        if (cancelled) return;

        setMatch(result.currentMatch);
        setPointTypes(result.points);
        setHomePlayers(result.homeList);
        setAwayPlayers(result.awayList);
        setHomeStats(
          applyFetchedStats(
            result.homeList,
            result.points,
            result.homeStatPlayers
          )
        );
        setAwayStats(
          applyFetchedStats(
            result.awayList,
            result.points,
            result.awayStatPlayers
          )
        );
      } catch (err) {
        if (cancelled) return;
        setError(err.message || "Could not load match statistics.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    matchId,
    userId,
    isSuperAdmin,
    selectedCompanyId,
    companiesReady,
  ]);

  const players = activeSide === "home" ? homePlayers : awayPlayers;
  const stats = activeSide === "home" ? homeStats : awayStats;
  const setStats = activeSide === "home" ? setHomeStats : setAwayStats;
  const teamName =
    activeSide === "home"
      ? match?.homeTeamName || "Home team"
      : match?.awayTeamName || "Away team";

  const totals = useMemo(() => {
    const result = {};
    for (const pt of pointTypes) {
      const pid = String(pt.id);
      let sum = 0;
      let hasNumber = false;
      for (const player of players) {
        const value = stats[playerIdFrom(player)]?.[pid];
        const num = Number(value);
        if (value !== "" && value != null && !Number.isNaN(num)) {
          sum += num;
          hasNumber = true;
        }
      }
      result[pid] = hasNumber ? sum : "—";
    }
    return result;
  }, [pointTypes, players, stats]);

  const updateCell = (playerId, pointId, value) => {
    setStats((prev) => ({
      ...prev,
      [playerId]: {
        ...(prev[playerId] || {}),
        [pointId]: value,
      },
    }));
  };

  const handleUpdate = async () => {
    if (!match?.matchId || !userId) {
      Swal.fire({
        icon: "warning",
        title: "Missing data",
        text: "Match or user information is missing.",
      });
      return;
    }

    const team =
      activeSide === "home" ? match.homeTeam : match.awayTeam;
    const teamId = teamIdFrom(team);
    if (!teamId) {
      Swal.fire({
        icon: "warning",
        title: "Missing team",
        text: "Could not resolve team id for this side.",
      });
      return;
    }

    if (isSuperAdmin && !selectedCompanyId) {
      Swal.fire({
        icon: "warning",
        title: "Select a company",
        text: "Choose a company before saving team statistics.",
      });
      return;
    }

    const playersPayload = players
      .map((player) => {
        const playerId = playerIdFrom(player);
        if (!playerId) return null;

        const row = stats[playerId] || {};
        const playerStats = {};
        for (const pt of pointTypes) {
          const key = toStatKey(pt);
          if (!key) continue;
          playerStats[key] = parseStatValue(row[String(pt.id)]);
        }

        return { playerId, stats: playerStats };
      })
      .filter(Boolean);

    if (playersPayload.length === 0) {
      Swal.fire({
        icon: "info",
        title: "No players",
        text: "There are no players to save for this team.",
      });
      return;
    }

    setSaving(true);
    try {
      await matchAPI.saveTeamStats({
        userId,
        matchId: String(match.matchId),
        teamId,
        updateMatchScore: true,
        players: playersPayload,
      });

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Statistics updated",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Update failed",
        text: err.message || "Could not save statistics.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <RequirePageAccess pageKey="results">
      <div className="space-y-5 py-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => navigate("/dashboard/schedule")}
              className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#00ADE5] hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Schedule
            </button>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#003366] to-[#004080] text-white shadow-sm">
                <ClipboardList size={22} />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#00ADE5]">
                  Match statistics
                </p>
                <h1 className="truncate text-xl font-bold text-[#003366] sm:text-2xl">
                  {match
                    ? `${formatMatchDate(match.dateTime)} — ${match.homeTeamName} v ${match.awayTeamName}`
                    : "Statistics"}
                </h1>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleUpdate}
            disabled={saving || loading || Boolean(error)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#003366] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#004080] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Saving..." : "Update"}
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-gray-200 bg-white">
            <Loader2 className="h-8 w-8 animate-spin text-[#00ADE5]" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-8 text-center">
            <p className="text-sm font-semibold text-red-700">{error}</p>
            <Link
              to="/dashboard/schedule"
              className="mt-3 inline-block text-sm font-semibold text-[#003366] hover:underline"
            >
              Back to schedule
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-4 py-3 sm:px-5">
              <div className="inline-flex max-w-full flex-wrap rounded-xl border border-gray-200 bg-slate-50 p-1">
                {[
                  {
                    id: "home",
                    label: "Home",
                    name: match?.homeTeamName,
                  },
                  {
                    id: "away",
                    label: "Road",
                    name: match?.awayTeamName,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveSide(tab.id)}
                    className={clsx(
                      "max-w-[220px] truncate rounded-lg px-3.5 py-2 text-sm font-semibold transition",
                      activeSide === tab.id
                        ? "bg-[#003366] text-white shadow-sm"
                        : "text-gray-500 hover:text-[#003366]"
                    )}
                    title={`${tab.label}: ${tab.name || ""}`}
                  >
                    {tab.label}
                    {tab.name ? ` · ${tab.name}` : ""}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#00ADE5]" />
                  <h2 className="text-base font-bold text-[#003366]">
                    {teamName}
                  </h2>
                </div>
                <p className="text-xs text-gray-500">
                  {players.length} player{players.length === 1 ? "" : "s"} ·{" "}
                  {pointTypes.length} stat
                  {pointTypes.length === 1 ? "" : "s"}
                </p>
              </div>

              {players.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-slate-50 px-4 py-10 text-center text-sm text-gray-500">
                  No players found for this team.
                </div>
              ) : pointTypes.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-slate-50 px-4 py-10 text-center text-sm text-gray-500">
                  No point types configured. Add stats in Setup → Statistic
                  Setup.
                </div>
              ) : (
                <div className="w-full overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full table-fixed border-separate border-spacing-0 text-sm">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="sticky left-0 z-[2] w-[160px] border-b border-gray-200 bg-slate-50 px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wide text-[#003366]">
                          Player
                        </th>
                        {pointTypes.map((pt) => (
                          <th
                            key={pt.id}
                            title={pt.label}
                            className="h-36 border-b border-l border-gray-200 bg-slate-50 p-0 align-bottom"
                          >
                            <div className="relative mx-auto h-32 w-full overflow-hidden">
                              <span
                                className="absolute bottom-2 left-1/2 block max-h-[7.5rem] overflow-hidden whitespace-nowrap text-[10px] font-semibold leading-tight text-gray-600"
                                style={{
                                  writingMode: "vertical-rl",
                                  transform: "translateX(-50%) rotate(180deg)",
                                }}
                              >
                                {pt.label}
                              </span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {players.map((player, rowIndex) => {
                        const pid = playerIdFrom(player);
                        return (
                          <tr
                            key={pid || rowIndex}
                            className={
                              rowIndex % 2 === 1
                                ? "bg-slate-50/60"
                                : "bg-white"
                            }
                          >
                            <td className="sticky left-0 z-[1] w-[160px] border-b border-gray-100 bg-inherit px-4 py-2 font-semibold text-gray-800">
                              {playerNameFrom(player)}
                            </td>
                            {pointTypes.map((pt) => {
                              const pointId = String(pt.id);
                              const value = stats[pid]?.[pointId] ?? "";
                              return (
                                <td
                                  key={`${pid}-${pointId}`}
                                  className="border-b border-l border-gray-100 px-1.5 py-2 text-center"
                                >
                                  {pt.isCheckbox ? (
                                    <input
                                      type="checkbox"
                                      checked={
                                        value === true ||
                                        value === "1" ||
                                        value === 1
                                      }
                                      onChange={(e) =>
                                        updateCell(
                                          pid,
                                          pointId,
                                          e.target.checked ? "1" : ""
                                        )
                                      }
                                      className="h-4 w-4 rounded border-gray-300 text-[#00ADE5] focus:ring-[#00ADE5]"
                                    />
                                  ) : (
                                    <input
                                      type="number"
                                      min="0"
                                      value={value}
                                      onChange={(e) =>
                                        updateCell(
                                          pid,
                                          pointId,
                                          e.target.value
                                        )
                                      }
                                      className="mx-auto block w-full min-w-0 max-w-[4.5rem] rounded-md border border-gray-200 bg-white px-1 py-1.5 text-center text-xs font-medium text-[#003366] focus:border-[#00ADE5] focus:outline-none focus:ring-1 focus:ring-[#00ADE5]/30"
                                    />
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {pointTypes.length > 0 && players.length > 0 && (
                <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
                  <div className="border-b border-[#00264d] bg-[#003366] px-5 py-3.5">
                    <h3 className="text-sm font-semibold text-white">
                      Total match cumulative team stats
                    </h3>
                    <p className="mt-0.5 text-xs text-white/70">
                      Aggregated totals for {teamName}
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full table-fixed border-collapse text-sm">
                      <colgroup>
                        <col className="w-1/2" />
                        <col className="w-1/2" />
                      </colgroup>
                      <thead>
                        <tr>
                          <th className="border border-[#00264d] bg-[#003366] px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-white">
                            Statistic
                          </th>
                          <th className="border border-[#00264d] bg-[#003366] px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-white">
                            Value
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {pointTypes.map((pt) => {
                          const value = totals[String(pt.id)];
                          return (
                            <tr key={`total-${pt.id}`}>
                              <td className="border border-gray-200 bg-white px-5 py-2.5 font-medium text-gray-800">
                                {pt.label}
                              </td>
                              <td
                                className={clsx(
                                  "border border-gray-200 bg-white px-5 py-2.5 text-left tabular-nums font-semibold",
                                  value === "—"
                                    ? "text-gray-400"
                                    : "text-[#003366]"
                                )}
                              >
                                {value}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </RequirePageAccess>
  );
}
