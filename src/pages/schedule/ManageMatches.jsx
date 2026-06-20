import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  CalendarRange,
  CheckCircle2,
  Edit2,
  Filter,
  Home,
  Layers,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  RotateCcw,
  Trash2,
  Users,
} from "lucide-react";
import Swal from "sweetalert2";
import clsx from "clsx";
import CreateMatchModal from "../../components/CreateMatchModal";
import { useCompanyMatches } from "../../hooks/useCompanyMatches";
import { useCompanyContext } from "../../context/CompanyContext";
import {
  tournamentAPI,
  teamAPI,
  venueAPI,
  matchAPI,
  formatMatchDateStatusLabel,
} from "../../services/api";
import {
  DEFAULT_MATCH_FILTERS,
  MATCH_STATUS_OPTIONS,
  hasActiveMatchFilters,
} from "../../utils/companyMatchFilters";

const selectClass =
  "w-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-9 text-sm font-medium text-gray-800 shadow-sm transition focus:border-[#00ADE5] focus:outline-none focus:ring-2 focus:ring-[#00ADE5]/20";

function FilterField({ icon: Icon, label, children, showCaret = true }) {
  return (
    <div className="relative">
      <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
        <Icon className="h-3.5 w-3.5 text-[#00ADE5]" />
        {label}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        {children}
        {showCaret && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            ▾
          </span>
        )}
      </div>
    </div>
  );
}

function formatMatchDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const datePart = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timePart = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${datePart}, ${timePart}`;
}

function formatScore(homeScore, awayScore) {
  if (homeScore == null || awayScore == null) return "—";
  return `${homeScore} – ${awayScore}`;
}

function DateStatusBadge({ dateStatus, status }) {
  const value = dateStatus || status || "Scheduled";
  const normalized = value === "Normal" ? "Scheduled" : String(value);
  const label = formatMatchDateStatusLabel(normalized);

  const styles =
    normalized === "Cancelled"
      ? "bg-red-50 text-red-700 ring-red-100"
      : normalized === "Confirmed" || normalized === "Played"
        ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
        : normalized === "ToBeConfirmed"
          ? "bg-amber-50 text-amber-700 ring-amber-100"
          : "bg-[#00ADE5]/10 text-[#0088cc] ring-[#00ADE5]/20";

  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        styles
      )}
    >
      {label}
    </span>
  );
}

export default function ManageMatches() {
  const { matches, companyMeta, loading, error, fetchMatches } =
    useCompanyMatches();
  const { isSuperAdmin, selectedCompanyId, companiesReady } =
    useCompanyContext();
  const [filters, setFilters] = useState({ ...DEFAULT_MATCH_FILTERS });
  const [divisions, setDivisions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [venues, setVenues] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const [deletingMatchId, setDeletingMatchId] = useState(null);

  const divisionNameById = useMemo(
    () => Object.fromEntries(divisions.map((d) => [d.id, d.name])),
    [divisions]
  );

  const loadFilterOptions = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.userId) return;

    try {
      const [tournamentRes, teamsInDivRes, teamsUnassignedRes, venueRes] =
        await Promise.all([
          tournamentAPI.getByUserId(user.userId),
          teamAPI.getByUserIdAndTournament(user.userId, "", {
            filter: "other_division",
          }),
          teamAPI.getByUserIdAndTournament(user.userId, "", {
            filter: "not_in_division",
          }),
          venueAPI.getDetails(user.userId),
        ]);

      const tournamentList = Array.isArray(tournamentRes.data)
        ? tournamentRes.data
        : tournamentRes.data
          ? [tournamentRes.data]
          : [];

      setDivisions(
        tournamentList.map((t) => ({
          id: t.divisionOrTournamentId ?? t._id ?? t.id ?? "",
          name:
            t.divisionOrtournamentName ??
            t.tournamentName ??
            t.name ??
            "Unnamed",
        }))
      );

      const mergeTeams = (...responses) => {
        const map = new Map();
        for (const res of responses) {
          const list = Array.isArray(res.data)
            ? res.data
            : res.data
              ? [res.data]
              : [];
          for (const t of list) {
            const id = String(t._id ?? t.id ?? t.teamId ?? "");
            if (!id) continue;
            map.set(id, {
              id,
              name: t.teamName ?? t.displayName ?? "Unnamed team",
            });
          }
        }
        return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
      };

      setTeams(mergeTeams(teamsInDivRes, teamsUnassignedRes));

      const venueList = Array.isArray(venueRes.data)
        ? venueRes.data
        : venueRes.data
          ? [venueRes.data]
          : [];
      setVenues(
        venueList
          .map((v) => ({
            id: String(v._id ?? v.id ?? v.venueId ?? ""),
            name: v.venueName ?? v.name ?? "Unnamed venue",
          }))
          .filter((v) => v.id)
          .sort((a, b) => a.name.localeCompare(b.name))
      );
    } catch {
      setDivisions([]);
      setTeams([]);
      setVenues([]);
    }
  };

  const refreshMatches = () => {
    fetchMatches(filters);
  };

  useEffect(() => {
    if (isSuperAdmin && (!companiesReady || !selectedCompanyId)) return;
    loadFilterOptions();
    refreshMatches();
  }, [isSuperAdmin, selectedCompanyId, companiesReady]);

  const resetFilters = () => {
    setFilters({ ...DEFAULT_MATCH_FILTERS });
    fetchMatches({ ...DEFAULT_MATCH_FILTERS });
  };

  const hasActiveFilters = hasActiveMatchFilters(filters);

  const competitionOptions = useMemo(
    () =>
      divisions.map((d) => ({
        id: d.id,
        name: d.name,
        divisionOrTournamentId: d.id,
      })),
    [divisions]
  );

  const handleDeleteMatch = async (match) => {
    if (!match?.matchId) return;

    const confirmation = await Swal.fire({
      icon: "warning",
      title: "Delete match?",
      html: `Remove <strong>${match.homeTeamName}</strong> vs <strong>${match.awayTeamName}</strong>?<br/>This can only be done before the scheduled kick-off.`,
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Delete match",
      cancelButtonText: "Cancel",
    });

    if (!confirmation.isConfirmed) return;

    setDeletingMatchId(match.matchId);
    try {
      const result = await matchAPI.delete(match.matchId);
      if (Number(result.errorCode) !== 0) {
        throw new Error(result.errorMessage || "Failed to delete match.");
      }

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Match deleted",
        text: result.data?.message || "Match removed successfully.",
        timer: 2200,
        showConfirmButton: false,
      });
      refreshMatches();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Delete failed",
        text: err?.message || "Could not delete match.",
      });
    } finally {
      setDeletingMatchId(null);
    }
  };

  const resolveDivisionLabel = (match) => {
    const names = (match.divisions || [])
      .map(
        (division) =>
          division.divisionName ||
          divisionNameById[division.divisionId] ||
          null
      )
      .filter(Boolean);
    if (names.length > 0) return names.join(", ");
    return match.divisionNamesLabel || "—";
  };

  return (
    <div className="space-y-5">
      {companyMeta?.companyName && (
        <p className="text-sm text-gray-500">
          {companyMeta.companyName} · {companyMeta.totalMatches ?? matches.length}{" "}
          match{(companyMeta.totalMatches ?? matches.length) === 1 ? "" : "es"}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gradient-to-r from-[#003366]/[0.03] to-[#00ADE5]/[0.05] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#003366]/10">
              <Filter className="h-4 w-4 text-[#003366]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Filter Matches</h3>
              <p className="text-xs text-gray-500">
                Filter by date range, division, venue, home team and away team
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <FilterField icon={CalendarRange} label="Date from" showCaret={false}>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))
                }
                className={`${selectClass} pr-3`}
              />
            </FilterField>

            <FilterField icon={CalendarRange} label="Date to" showCaret={false}>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
                }
                className={`${selectClass} pr-3`}
              />
            </FilterField>

            <FilterField icon={CheckCircle2} label="Status">
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value }))
                }
                className={selectClass}
              >
                {MATCH_STATUS_OPTIONS.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </FilterField>

            <FilterField icon={Layers} label="Division">
              <select
                value={filters.division}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, division: e.target.value }))
                }
                className={selectClass}
              >
                <option value="All">All divisions</option>
                {divisions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </FilterField>

            <FilterField icon={MapPin} label="Venue">
              <select
                value={filters.venue}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, venue: e.target.value }))
                }
                className={selectClass}
              >
                <option value="All">All venues</option>
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </FilterField>

            <FilterField icon={Home} label="Home team">
              <select
                value={filters.homeTeam}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, homeTeam: e.target.value }))
                }
                className={selectClass}
              >
                <option value="All">All home teams</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </FilterField>

            <FilterField icon={Users} label="Away team">
              <select
                value={filters.awayTeam}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, awayTeam: e.target.value }))
                }
                className={selectClass}
              >
                <option value="All">All away teams</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </FilterField>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={resetFilters}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 disabled:opacity-60"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
            <button
              type="button"
              onClick={refreshMatches}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#003366] to-[#004080] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Apply Filters
            </button>
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
              <span className="text-xs font-semibold text-gray-500">Active:</span>
              {filters.dateFrom && (
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                  From: {filters.dateFrom}
                </span>
              )}
              {filters.dateTo && (
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                  To: {filters.dateTo}
                </span>
              )}
              {filters.status !== DEFAULT_MATCH_FILTERS.status && (
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                  Status: {filters.status}
                </span>
              )}
              {filters.division !== DEFAULT_MATCH_FILTERS.division && (
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                  Division:{" "}
                  {divisions.find((d) => d.id === filters.division)?.name ||
                    filters.division}
                </span>
              )}
              {filters.venue !== DEFAULT_MATCH_FILTERS.venue && (
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                  Venue:{" "}
                  {venues.find((v) => v.id === filters.venue)?.name ||
                    filters.venue}
                </span>
              )}
              {filters.homeTeam !== DEFAULT_MATCH_FILTERS.homeTeam && (
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                  Home:{" "}
                  {teams.find((t) => t.id === filters.homeTeam)?.name ||
                    filters.homeTeam}
                </span>
              )}
              {filters.awayTeam !== DEFAULT_MATCH_FILTERS.awayTeam && (
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                  Away:{" "}
                  {teams.find((t) => t.id === filters.awayTeam)?.name ||
                    filters.awayTeam}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="relative overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gradient-to-r from-[#003366]/[0.03] to-[#00ADE5]/[0.05] px-5 py-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Match Schedule</h3>
            <p className="text-xs text-gray-500">
              View, add, edit, or delete matches for your league
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingMatch(null);
              setShowCreateModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#003366] to-[#004080] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            Add Match
          </button>
        </div>

        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/80 backdrop-blur-[2px]">
            <Loader2 className="h-9 w-9 animate-spin text-[#00ADE5]" />
            <p className="text-sm font-semibold text-[#003366]">
              Loading matches…
            </p>
          </div>
        )}

        <div
          className={clsx(
            "overflow-x-auto transition-opacity duration-200",
            loading ? "pointer-events-none opacity-40" : "opacity-100"
          )}
        >
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="bg-gradient-to-r from-[#003366] to-[#004080] text-white">
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                  Date Status
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                  Division
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                  Home Team
                </th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider">
                  Score
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                  Away Team
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                  Venue
                </th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && matches.length === 0 ? (
                <tr>
                  <td colSpan="8" className="h-52" />
                </tr>
              ) : !loading && matches.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-14 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00ADE5]/10">
                        <Calendar className="h-7 w-7 text-[#00ADE5]" />
                      </div>
                      <p className="text-base font-semibold text-gray-800">
                        No matches found
                      </p>
                      <p className="text-sm text-gray-500">
                        Adjust filters or add a new match.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingMatch(null);
                          setShowCreateModal(true);
                        }}
                        className="mt-1 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#003366] to-[#004080] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
                      >
                        <Plus className="h-4 w-4" />
                        Add Match
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                matches.map((match) => (
                  <tr
                    key={match.matchId}
                    className="transition-colors hover:bg-slate-50/80"
                  >
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">
                      {formatMatchDateTime(match.dateTime)}
                    </td>
                    <td className="px-5 py-4">
                      <DateStatusBadge
                        dateStatus={match.dateStatus}
                        status={match.status}
                      />
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {resolveDivisionLabel(match)}
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                      {match.homeTeamName}
                    </td>
                    <td className="px-5 py-4 text-center text-sm font-bold text-[#003366]">
                      {formatScore(match.homeScore, match.awayScore)}
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                      {match.awayTeamName}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {match.venueName}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setShowCreateModal(false);
                            setEditingMatch(match);
                          }}
                          title="Edit match"
                          className="rounded-lg p-2 text-[#003366] transition hover:bg-[#003366]/10"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMatch(match)}
                          disabled={deletingMatchId === match.matchId}
                          title="Delete match"
                          className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          {deletingMatchId === match.matchId ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateMatchModal
        isOpen={showCreateModal || Boolean(editingMatch)}
        editMatch={editingMatch}
        competitions={competitionOptions}
        onClose={() => {
          setShowCreateModal(false);
          setEditingMatch(null);
        }}
        onSuccess={() => {
          setShowCreateModal(false);
          setEditingMatch(null);
          refreshMatches();
        }}
      />
    </div>
  );
}
