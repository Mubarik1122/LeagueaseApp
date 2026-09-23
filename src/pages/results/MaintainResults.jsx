import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import clsx from "clsx";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Swal from "sweetalert2";
import { selectClass } from "./resultTheme";
import { useCompanyContext } from "../../context/CompanyContext";
import { useTournament } from "../../hooks/useTournament";
import { matchAPI } from "../../services/api";
import {
  normalizePointType,
  sortPointTypes,
} from "../../hooks/usePointTypes";

const MODE_OPTIONS = [
  { id: "all_results", label: "All results" },
  { id: "missing_result", label: "Missing result" },
  { id: "missing_stats", label: "Missing stats" },
  { id: "missing_home_stats", label: "Missing home stats" },
  { id: "missing_road_stats", label: "Missing road stats" },
  { id: "approved", label: "Approved" },
  { id: "not_approved", label: "Not approved" },
  { id: "cancelled", label: "Cancelled" },
];

const STATUS_OPTIONS = [
  { id: "Normal", label: "Normal" },
  { id: "Cancelled", label: "Cancelled" },
  { id: "Postponed", label: "Postponed" },
  { id: "HomeWalkover", label: "Home walkover" },
  { id: "RoadWalkover", label: "Road walkover" },
  { id: "HomeWinPenalties", label: "Home win penalties" },
  { id: "RoadWinPenalties", label: "Road win penalties" },
  { id: "Abandoned", label: "Abandoned" },
  { id: "Void", label: "Void" },
];

function normalizeStatusValue(value) {
  const raw = String(value || "Normal").trim();
  if (!raw) return "Normal";
  const lower = raw.toLowerCase().replace(/[\s_-]+/g, "");
  const map = {
    normal: "Normal",
    scheduled: "Normal",
    cancelled: "Cancelled",
    canceled: "Cancelled",
    postponed: "Postponed",
    homewalkover: "HomeWalkover",
    roadwalkover: "RoadWalkover",
    awaywalkover: "RoadWalkover",
    homewinpenalties: "HomeWinPenalties",
    roadwinpenalties: "RoadWinPenalties",
    awaywinpenalties: "RoadWinPenalties",
    abandoned: "Abandoned",
    void: "Void",
  };
  return map[lower] || raw;
}

const AUTO_APPEARANCES_LABEL = "__auto_calculate_appearances__";

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

function formatWhen(dateTime) {
  if (!dateTime) return "";
  const d = new Date(dateTime);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function buildDraft(match) {
  return {
    matchId: match.matchId,
    dateTime: match.dateTime,
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    homeTeamName: match.homeTeamName,
    awayTeamName: match.awayTeamName,
    divisionLabel: match.divisionLabel || "",
    venueId: match.venueId,
    status: match.status,
    resultApproved: match.resultApproved,
    homeStatsLocked: match.homeStatsLocked,
    awayStatsLocked: match.awayStatsLocked,
    homeStatsEntered: match.homeStatsEntered,
    awayStatsEntered: match.awayStatsEntered,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    note: match.note,
    displayNote: match.displayNote,
    dirty: false,
  };
}

function resolveDivisionLabel(item, divisionNameById = {}) {
  if (!item) return "";
  if (typeof item.divisionName === "string" && item.divisionName.trim()) {
    return item.divisionName.trim();
  }
  if (typeof item.competitionName === "string" && item.competitionName.trim()) {
    return item.competitionName.trim();
  }
  if (typeof item.tournamentName === "string" && item.tournamentName.trim()) {
    return item.tournamentName.trim();
  }
  if (Array.isArray(item.divisions) && item.divisions.length > 0) {
    const names = item.divisions
      .map(
        (d) =>
          d?.divisionName ||
          d?.name ||
          d?.tournamentName ||
          divisionNameById[String(d?.divisionId ?? d?.id ?? "")]
      )
      .filter(Boolean);
    if (names.length) return names.join(", ");
  }
  if (item.division && typeof item.division === "object") {
    return (
      item.division.divisionName ||
      item.division.name ||
      item.division.tournamentName ||
      divisionNameById[
        String(item.division.divisionId ?? item.division.id ?? "")
      ] ||
      ""
    );
  }
  const id = String(
    item.divisionId ?? item.tournamentId ?? item.competitionId ?? ""
  );
  if (id && divisionNameById[id]) return divisionNameById[id];
  if (typeof item.division === "string" && item.division.trim()) {
    return divisionNameById[item.division.trim()] || item.division.trim();
  }
  return "";
}

/** Normalize GET /match/day-results payload → drafts + teamStats */
function parseDayResults(data, pointTypes, divisionNameById = {}) {
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.matches)
      ? data.matches
      : Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data?.items)
          ? data.items
          : [];

  const drafts = [];
  const teamStats = {};
  const teamMap = new Map();

  for (const item of list) {
    const home = item?.homeTeam || item?.home || {};
    const away = item?.awayTeam || item?.away || {};
    const matchId = String(
      item?.matchId ?? item?._id ?? item?.id ?? ""
    );
    if (!matchId) continue;

    const homeName =
      home.teamName || item.homeTeamName || home.name || "Home";
    const awayName =
      away.teamName || item.awayTeamName || away.name || "Away";
    const homeId = teamIdFrom(home);
    const awayId = teamIdFrom(away);

    const draft = buildDraft({
      matchId,
      dateTime: item.dateTime || item.date || item.matchDateTime,
      homeTeam: home,
      awayTeam: away,
      homeTeamName: homeName,
      awayTeamName: awayName,
      divisionLabel: resolveDivisionLabel(item, divisionNameById),
      venueId:
        item.venueId ??
        item.venue?.venueId ??
        item.venue?._id ??
        item.venue?.id ??
        "",
      status: normalizeStatusValue(item.dateStatus || item.status || "Normal"),
      resultApproved: Boolean(
        item.resultApproved ?? item.approved ?? item.isApproved
      ),
      homeStatsLocked: Boolean(
        item.homeStatsLocked ?? home.statsLocked ?? home.homeStatsLocked
      ),
      awayStatsLocked: Boolean(
        item.awayStatsLocked ??
          away.statsLocked ??
          away.awayStatsLocked ??
          item.roadStatsLocked
      ),
      homeStatsEntered: Boolean(
        item.homeStatsEntered ??
          home.hasStats ??
          (Array.isArray(home.teamTotals) && home.teamTotals.length > 0)
      ),
      awayStatsEntered: Boolean(
        item.awayStatsEntered ??
          away.hasStats ??
          (Array.isArray(away.teamTotals) && away.teamTotals.length > 0)
      ),
      homeScore: item.homeScore ?? home.score ?? home.homeScore ?? "",
      awayScore: item.awayScore ?? away.score ?? away.awayScore ?? "",
      note: item.note || "",
      displayNote: Boolean(item.displayNote),
    });

    drafts.push(draft);
    teamStats[matchId] = {
      home: totalsToPointMap(
        home.teamTotals ? home : item.homeTeamStats || home,
        pointTypes
      ),
      away: totalsToPointMap(
        away.teamTotals ? away : item.awayTeamStats || away,
        pointTypes
      ),
    };

    if (homeId) teamMap.set(homeId, { id: homeId, name: homeName });
    if (awayId) teamMap.set(awayId, { id: awayId, name: awayName });
  }

  return {
    drafts,
    teamStats,
    teams: Array.from(teamMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    ),
  };
}

function emptyTeamStats(pointTypes) {
  const row = {};
  for (const pt of pointTypes) {
    row[String(pt.id)] = "";
  }
  return row;
}

/** Map API teamTotals / player list / flat stats → { [pointId]: valueString } */
function totalsToPointMap(teamBlock, pointTypes) {
  const base = emptyTeamStats(pointTypes);
  if (!teamBlock) return base;

  const labelIndex = {};
  for (const pt of pointTypes) {
    const id = String(pt.id);
    labelIndex[id] = id;
    const label = String(pt.label || "")
      .trim()
      .toLowerCase();
    if (label) labelIndex[label] = id;
    const key = String(pt.statKey || pt.key || "")
      .trim()
      .toLowerCase();
    if (key) labelIndex[key] = id;
  }

  const applyItem = (item) => {
    if (!item || typeof item !== "object") return;
    const key = String(
      item.pointTypeName ||
        item.label ||
        item.pointId ||
        item.pointTypeId ||
        item.key ||
        item.name ||
        ""
    )
      .trim()
      .toLowerCase();
    const pointId =
      labelIndex[key] ||
      labelIndex[String(item.pointId || item.pointTypeId || "")];
    if (!pointId) return;
    const val = item.totalValue ?? item.value ?? item.count ?? item.amount;
    if (val == null || val === "") return;
    base[pointId] = String(Number(val) || val);
  };

  // teamTotals / stats as array
  const totals = Array.isArray(teamBlock.teamTotals)
    ? teamBlock.teamTotals
    : Array.isArray(teamBlock.totals)
      ? teamBlock.totals
      : Array.isArray(teamBlock.stats)
        ? teamBlock.stats
        : Array.isArray(teamBlock)
          ? teamBlock
          : null;

  if (totals) {
    for (const item of totals) applyItem(item);
    return base;
  }

  // Flat stats object: { points: 6, assists: 2 }
  if (
    teamBlock.stats &&
    typeof teamBlock.stats === "object" &&
    !Array.isArray(teamBlock.stats)
  ) {
    for (const [k, v] of Object.entries(teamBlock.stats)) {
      const pointId = labelIndex[String(k).toLowerCase()] || labelIndex[k];
      if (!pointId || v == null || v === "") continue;
      base[pointId] = String(Number(v) || v);
    }
    return base;
  }

  // Fallback: sum player stats
  const players = Array.isArray(teamBlock.players) ? teamBlock.players : [];
  for (const player of players) {
    const stats = Array.isArray(player.stats) ? player.stats : null;
    if (stats) {
      for (const item of stats) {
        const key = String(
          item.pointTypeName || item.label || item.pointId || item.key || ""
        )
          .trim()
          .toLowerCase();
        const pointId =
          labelIndex[key] || labelIndex[String(item.pointId || "")];
        if (!pointId) continue;
        const add = Number(item.value ?? item.totalValue ?? 0) || 0;
        const prev = Number(base[pointId]) || 0;
        base[pointId] = String(prev + add);
      }
      continue;
    }
    if (player.stats && typeof player.stats === "object") {
      for (const [k, v] of Object.entries(player.stats)) {
        const pointId = labelIndex[String(k).toLowerCase()] || labelIndex[k];
        if (!pointId) continue;
        const add = Number(v) || 0;
        const prev = Number(base[pointId]) || 0;
        base[pointId] = String(prev + add);
      }
    }
  }

  return base;
}

function Field({ label, children }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs font-semibold text-gray-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function TeamStatsGrid({
  pointTypes,
  homeName,
  awayName,
  homeStats,
  awayStats,
}) {
  if (!pointTypes.length) {
    return (
      <p className="text-xs text-gray-500">
        No point types configured in Statistic Setup.
      </p>
    );
  }

  const rows = [
    {
      side: "home",
      name: homeName,
      stats: homeStats,
    },
    {
      side: "away",
      name: awayName,
      stats: awayStats,
    },
  ];

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full table-fixed border-separate border-spacing-0 text-sm">
        <thead>
          <tr className="bg-slate-50">
            <th className="sticky left-0 z-[2] w-[150px] border-b border-[#00264d] bg-[#003366] px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wide text-white">
              Team
            </th>
            {pointTypes.map((pt) => (
              <th
                key={pt.id}
                title={pt.label}
                className="h-32 border-b border-l border-[#00264d] bg-[#003366] p-0 align-bottom"
              >
                <div className="relative mx-auto h-28 w-full overflow-hidden">
                  <span
                    className="absolute bottom-2 left-1/2 block max-h-[6.5rem] overflow-hidden whitespace-nowrap text-[10px] font-semibold leading-tight text-white/90"
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
          {rows.map((row, rowIndex) => (
            <tr
              key={row.side}
              className={rowIndex % 2 === 1 ? "bg-slate-50/60" : "bg-white"}
            >
              <td className="sticky left-0 z-[1] w-[150px] border-b border-gray-100 bg-inherit px-3 py-2 font-semibold text-gray-800">
                {row.name}
              </td>
              {pointTypes.map((pt) => {
                const pointId = String(pt.id);
                const value = row.stats?.[pointId] ?? "";
                const display =
                  value === "" || value == null ? "—" : String(value);
                return (
                  <td
                    key={`${row.side}-${pointId}`}
                    className="border-b border-l border-gray-100 px-1.5 py-2 text-center"
                  >
                    <span className="mx-auto flex h-8 w-full max-w-[4.5rem] items-center justify-center rounded-md border border-gray-100 bg-slate-50 text-xs font-medium tabular-nums text-[#003366]">
                      {display}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MaintainResults() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isSuperAdmin, selectedCompanyId, companiesReady } =
    useCompanyContext();
  const { tournaments, fetchTournaments } = useTournament();

  const dateParam = searchParams.get("date") || "";
  const userId = resolveUserId();

  const [mode, setMode] = useState("all_results");
  const [selectedDate, setSelectedDate] = useState(dateParam);
  const [competition, setCompetition] = useState("All");
  const [teamFilter, setTeamFilter] = useState("All");
  const [drafts, setDrafts] = useState([]);
  const [teams, setTeams] = useState([]);
  const [pointTypes, setPointTypes] = useState([]);
  const [teamStats, setTeamStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (dateParam) setSelectedDate(dateParam);
  }, [dateParam]);

  useEffect(() => {
    if (!userId) return;
    if (isSuperAdmin && (!companiesReady || !selectedCompanyId)) return;
    fetchTournaments(userId, {
      companyId: isSuperAdmin ? selectedCompanyId : null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, isSuperAdmin, selectedCompanyId, companiesReady]);

  const divisions = useMemo(() => {
    if (!Array.isArray(tournaments)) return [];
    return tournaments
      .map((t, index) => {
        const id = String(
          t.divisionOrTournamentId ?? t._id ?? t.id ?? `row-${index}`
        );
        const name =
          t.divisionOrtournamentName ??
          t.tournamentName ??
          t.name ??
          "Unnamed division";
        return { id, name };
      })
      .filter((d) => d.id)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [tournaments]);

  const loadPage = useCallback(async () => {
    if (isSuperAdmin && (!companiesReady || !selectedCompanyId)) return;
    if (!selectedDate) {
      setDrafts([]);
      setTeamStats({});
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [dayRes, pointsRes] = await Promise.all([
        matchAPI.getDayResults({
          date: selectedDate,
          show: mode || "all_results",
          divisionId: competition !== "All" ? competition : undefined,
          teamId: teamFilter !== "All" ? teamFilter : undefined,
        }),
        userId
          ? matchAPI.getAllPointTypes(userId).catch(() => null)
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
      setPointTypes(points);

      const divisionNameById = Object.fromEntries(
        divisions.map((d) => [String(d.id), d.name])
      );
      const parsed = parseDayResults(dayRes?.data, points, divisionNameById);
      setDrafts(parsed.drafts);
      setTeamStats(parsed.teamStats);
      setTeams(parsed.teams);
    } catch (err) {
      setError(err.message || "Could not load day results.");
      setDrafts([]);
      setTeamStats({});
      setTeams([]);
    } finally {
      setLoading(false);
    }
  }, [
    selectedDate,
    competition,
    teamFilter,
    mode,
    userId,
    isSuperAdmin,
    selectedCompanyId,
    companiesReady,
    divisions,
  ]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  const visibleDrafts = drafts;

  const dirtyCount = drafts.filter((d) => d.dirty).length;

  const updateDraft = (matchId, patch) => {
    setDrafts((prev) =>
      prev.map((d) =>
        String(d.matchId) === String(matchId)
          ? { ...d, ...patch, dirty: true }
          : d
      )
    );
  };

  const applyDate = () => {
    if (!selectedDate) return;
    setSearchParams({ date: selectedDate });
  };

  const handleUpdate = async () => {
    const dirty = drafts.filter((d) => d.dirty);
    if (dirty.length === 0) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "info",
        title: "Nothing to save",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    setSaving(true);
    try {
      await Promise.all(
        dirty.map((d) =>
          matchAPI.saveResult({
            matchId: String(d.matchId),
            homeScore:
              d.homeScore === "" || d.homeScore == null
                ? null
                : Number(d.homeScore),
            awayScore:
              d.awayScore === "" || d.awayScore == null
                ? null
                : Number(d.awayScore),
            approved: Boolean(d.resultApproved),
            lockHome: Boolean(d.homeStatsLocked),
            lockRoad: Boolean(d.awayStatsLocked),
          })
        )
      );
      setDrafts((prev) => prev.map((d) => ({ ...d, dirty: false })));
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Saved",
        timer: 1600,
        showConfirmButton: false,
      });
      await loadPage();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Update failed",
        text: err.message || "Could not save results.",
      });
    } finally {
      setSaving(false);
    }
  };

  const openPlayerStats = (draft) => {
    navigate(`/dashboard/results/match/${encodeURIComponent(draft.matchId)}`, {
      state: {
        match: {
          matchId: draft.matchId,
          dateTime: draft.dateTime,
          homeTeam: draft.homeTeam,
          awayTeam: draft.awayTeam,
          homeTeamName: draft.homeTeamName,
          awayTeamName: draft.awayTeamName,
          homeScore: draft.homeScore,
          awayScore: draft.awayScore,
          status: draft.status,
        },
      },
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            to="/dashboard/results"
            className="mb-1 inline-flex items-center gap-1.5 text-sm font-semibold text-[#00ADE5] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <h2 className="text-xl font-bold text-[#003366]">Maintain Results</h2>
        </div>
        <button
          type="button"
          onClick={handleUpdate}
          disabled={saving || loading || dirtyCount === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-[#003366] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#004080] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {dirtyCount > 0 ? `Save (${dirtyCount})` : "Save"}
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Date">
            <div className="flex gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={`${selectClass} pr-3`}
              />
              <button
                type="button"
                onClick={applyDate}
                className="shrink-0 rounded-xl border border-gray-200 px-3 text-sm font-semibold text-[#003366] hover:bg-slate-50"
              >
                Go
              </button>
            </div>
          </Field>
          <Field label="Show">
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className={selectClass}
            >
              {MODE_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Competition">
            <select
              value={competition}
              onChange={(e) => setCompetition(e.target.value)}
              className={selectClass}
            >
              <option value="All">All</option>
              {divisions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Team">
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className={selectClass}
            >
              <option value="All">All</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <p className="mt-3 text-xs text-gray-500">
          {visibleDrafts.length} match
          {visibleDrafts.length === 1 ? "" : "es"}
          {selectedDate ? ` · ${selectedDate}` : ""}
        </p>
      </div>

      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-[#00ADE5]" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-6 text-center text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : visibleDrafts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 px-4 py-12 text-center text-sm text-gray-500">
          No matches for this filter.
        </div>
      ) : (
        <div className="max-h-[calc(10*22rem)] space-y-4 overflow-y-auto pr-0.5">
          {visibleDrafts.map((draft) => {
            const mid = String(draft.matchId);
            const stats = teamStats[mid] || {
              home: emptyTeamStats(pointTypes),
              away: emptyTeamStats(pointTypes),
            };

            return (
              <div
                key={mid}
                className={clsx(
                  "overflow-hidden rounded-xl border bg-white transition",
                  draft.dirty
                    ? "border-[#00ADE5]/50 shadow-sm"
                    : "border-gray-200"
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-2 bg-[#003366] px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white">
                      {draft.homeTeamName}{" "}
                      <span className="font-medium text-white/60">v</span>{" "}
                      {draft.awayTeamName}
                    </p>
                    <p className="mt-0.5 text-xs text-white/70">
                      {formatWhen(draft.dateTime)}
                    </p>
                    {draft.divisionLabel ? (
                      <p className="mt-1 inline-flex rounded-md bg-white/15 px-2 py-0.5 text-[11px] font-semibold text-white">
                        Division: {draft.divisionLabel}
                      </p>
                    ) : null}
                  </div>
                  <select
                    value={draft.status}
                    onChange={(e) =>
                      updateDraft(mid, { status: e.target.value })
                    }
                    className="rounded-lg border border-white/20 bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white"
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.id} value={o.id} className="text-gray-800">
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3 p-4">
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-xl bg-slate-50 px-3 py-3 sm:gap-5 sm:px-5">
                  <div className="min-w-0 text-right">
                    <p className="truncate text-sm font-semibold text-gray-800">
                      {draft.homeTeamName}
                    </p>
                    <p className="text-[11px] text-gray-400">Home</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={draft.homeScore}
                      onChange={(e) =>
                        updateDraft(mid, { homeScore: e.target.value })
                      }
                      className="w-14 rounded-lg border border-gray-200 bg-white py-2 text-center text-lg font-bold text-[#003366] focus:border-[#00ADE5] focus:outline-none sm:w-16"
                    />
                    <span className="text-sm font-bold text-gray-300">–</span>
                    <input
                      type="number"
                      min="0"
                      value={draft.awayScore}
                      onChange={(e) =>
                        updateDraft(mid, { awayScore: e.target.value })
                      }
                      className="w-14 rounded-lg border border-gray-200 bg-white py-2 text-center text-lg font-bold text-[#003366] focus:border-[#00ADE5] focus:outline-none sm:w-16"
                    />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="truncate text-sm font-semibold text-gray-800">
                      {draft.awayTeamName}
                    </p>
                    <p className="text-[11px] text-gray-400">Road</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={draft.resultApproved}
                      onChange={(e) =>
                        updateDraft(mid, {
                          resultApproved: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-[#003366]"
                    />
                    Approved
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={draft.homeStatsLocked}
                      onChange={(e) =>
                        updateDraft(mid, {
                          homeStatsLocked: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-[#003366]"
                    />
                    Lock home
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={draft.awayStatsLocked}
                      onChange={(e) =>
                        updateDraft(mid, {
                          awayStatsLocked: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-[#003366]"
                    />
                    Lock road
                  </label>
                </div>

                <div>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Team statistics (sum of players)
                    </p>
                    <button
                      type="button"
                      onClick={() => openPlayerStats(draft)}
                      className="rounded-lg bg-[#00ADE5] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0099cc]"
                    >
                      Edit on match page
                    </button>
                  </div>
                  <TeamStatsGrid
                    pointTypes={pointTypes}
                    homeName={draft.homeTeamName}
                    awayName={draft.awayTeamName}
                    homeStats={stats.home}
                    awayStats={stats.away}
                  />
                </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
