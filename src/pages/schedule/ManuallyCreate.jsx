import { useCallback, useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Grid3x3,
  Home,
  Layers,
  List,
  Loader2,
  MapPin,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import Swal from "sweetalert2";
import clsx from "clsx";
import { useCompanyContext } from "../../context/CompanyContext";
import {
  companyAPI,
  tournamentAPI,
  teamAPI,
  venueAPI,
  matchAPI,
  MATCH_DATE_STATUS_OPTIONS,
  formatMatchDateStatusLabel,
} from "../../services/api";
import { mapCompanyMatch } from "../../hooks/useCompanyMatches";

const TABS = [
  { id: "division", label: "Division Matches" },
  { id: "inter-division", label: "Inter-Division Matches" },
  { id: "other", label: "Other Matches" },
  { id: "spreadsheet", label: "Spreadsheet Upload" },
];

const selectClass =
  "w-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-4 pr-10 text-sm font-medium text-gray-800 shadow-sm transition focus:border-[#00ADE5] focus:outline-none focus:ring-2 focus:ring-[#00ADE5]/20";

const datePickerClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 shadow-sm transition focus:border-[#00ADE5] focus:outline-none focus:ring-2 focus:ring-[#00ADE5]/20 md:max-w-sm";

const checkboxClass =
  "h-4 w-4 rounded border-gray-300 text-[#00ADE5] focus:ring-[#00ADE5]/30 disabled:cursor-not-allowed disabled:opacity-40";

const compactSelectClass =
  "w-full min-w-[9rem] appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-2 pr-7 text-xs font-medium text-gray-800 focus:border-[#00ADE5] focus:outline-none focus:ring-2 focus:ring-[#00ADE5]/20";

function mapDivision(t) {
  return {
    id: String(t.divisionOrTournamentId ?? t._id ?? t.id ?? ""),
    name:
      t.divisionOrtournamentName ?? t.tournamentName ?? t.name ?? "Unnamed",
  };
}

function mapTeam(team) {
  const id = String(team._id ?? team.id ?? team.teamId ?? "");
  const name = team.teamName ?? team.displayName ?? "Unnamed team";
  const code = team.shortCode ?? name.slice(0, 4).toUpperCase();
  return { id, name, code };
}

function toDateQueryValue(date) {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getStoredUserId() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return user?.userId || "";
}

function PlaceholderTab({ label }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <p className="text-base font-semibold text-[#003366]">{label}</p>
      <p className="max-w-md text-sm text-gray-500">
        This section is not available yet. Use Division Matches to create fixtures
        within a single division.
      </p>
    </div>
  );
}

function DivisionMatchesTab() {
  const { isSuperAdmin, selectedCompanyId, companiesReady } =
    useCompanyContext();
  const [viewMode, setViewMode] = useState("grid");
  const [divisions, setDivisions] = useState([]);
  const [selectedDivisionId, setSelectedDivisionId] = useState("");
  const [teams, setTeams] = useState([]);
  const [venues, setVenues] = useState([]);
  const [dayMatches, setDayMatches] = useState([]);
  const [matchDateTime, setMatchDateTime] = useState(null);
  const [dateStatus, setDateStatus] = useState("Scheduled");
  const [rowSelections, setRowSelections] = useState({});
  const [rowVenues, setRowVenues] = useState({});
  const [listHomeTeamId, setListHomeTeamId] = useState("");
  const [listAwayTeamId, setListAwayTeamId] = useState("");
  const [listVenueId, setListVenueId] = useState("");
  const [listQueuedMatches, setListQueuedMatches] = useState([]);
  const [loadingDivisions, setLoadingDivisions] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [loadingVenues, setLoadingVenues] = useState(false);
  const [creating, setCreating] = useState(false);

  const userId = getStoredUserId();
  const dateQuery = toDateQueryValue(matchDateTime);

  const teamBookings = useMemo(() => {
    const bookings = {};
    for (const match of dayMatches) {
      const homeId = match.homeTeam?.teamId;
      const awayId = match.awayTeam?.teamId;
      if (!homeId || !awayId) continue;

      bookings[homeId] = {
        opponentId: awayId,
        opponentName: match.awayTeamName,
        opponentCode: match.awayTeam?.shortCode,
        matchId: match.matchId,
        dateStatus: match.dateStatus || match.status,
        venueName: match.venueName,
      };
      bookings[awayId] = {
        opponentId: homeId,
        opponentName: match.homeTeamName,
        opponentCode: match.homeTeam?.shortCode,
        matchId: match.matchId,
        dateStatus: match.dateStatus || match.status,
        venueName: match.venueName,
      };
    }
    return bookings;
  }, [dayMatches]);

  const bookedTeamIds = useMemo(
    () => new Set(Object.keys(teamBookings)),
    [teamBookings]
  );

  const loadDivisions = useCallback(async () => {
    if (!userId) return;
    setLoadingDivisions(true);
    try {
      const res = await tournamentAPI.getByUserId(userId);
      const list = Array.isArray(res.data) ? res.data : res.data ? [res.data] : [];
      const mapped = list.map(mapDivision).filter((d) => d.id);
      setDivisions(mapped);
      setSelectedDivisionId((prev) => {
        if (prev && mapped.some((d) => d.id === prev)) return prev;
        return mapped[0]?.id || "";
      });
    } catch {
      setDivisions([]);
      setSelectedDivisionId("");
    } finally {
      setLoadingDivisions(false);
    }
  }, [userId]);

  const loadVenues = useCallback(async () => {
    if (!userId) return;
    setLoadingVenues(true);
    try {
      const res = await venueAPI.getDetails(userId);
      const list = Array.isArray(res.data) ? res.data : res.data ? [res.data] : [];
      setVenues(
        list
          .map((v) => ({
            id: String(v._id ?? v.id ?? v.venueId ?? ""),
            name: v.venueName ?? v.name ?? "Unnamed venue",
          }))
          .filter((v) => v.id)
      );
    } catch {
      setVenues([]);
    } finally {
      setLoadingVenues(false);
    }
  }, [userId]);

  const loadTeams = useCallback(async () => {
    if (!userId || !selectedDivisionId) {
      setTeams([]);
      return;
    }
    setLoadingTeams(true);
    try {
      const res = await teamAPI.getByUserIdAndTournament(
        userId,
        selectedDivisionId,
        { filter: "" }
      );
      const list = Array.isArray(res.data) ? res.data : res.data ? [res.data] : [];
      setTeams(list.map(mapTeam).filter((t) => t.id));
    } catch {
      setTeams([]);
    } finally {
      setLoadingTeams(false);
    }
  }, [userId, selectedDivisionId]);

  const loadDayMatches = useCallback(async () => {
    if (!selectedDivisionId || !dateQuery) {
      setDayMatches([]);
      return;
    }
    setLoadingMatches(true);
    try {
      const res = await companyAPI.getMatches({
        division: selectedDivisionId,
        dateFrom: dateQuery,
        dateTo: dateQuery,
      });
      if (Number(res.errorCode) === 0) {
        const raw = Array.isArray(res.data?.matches) ? res.data.matches : [];
        setDayMatches(raw.map(mapCompanyMatch));
      } else {
        setDayMatches([]);
      }
    } catch {
      setDayMatches([]);
    } finally {
      setLoadingMatches(false);
    }
  }, [selectedDivisionId, dateQuery]);

  useEffect(() => {
    if (isSuperAdmin && (!companiesReady || !selectedCompanyId)) return;
    loadDivisions();
    loadVenues();
  }, [isSuperAdmin, selectedCompanyId, companiesReady, loadDivisions, loadVenues]);

  useEffect(() => {
    loadTeams();
    setRowSelections({});
    setRowVenues({});
    setListHomeTeamId("");
    setListAwayTeamId("");
    setListVenueId("");
    setListQueuedMatches([]);
  }, [loadTeams]);

  useEffect(() => {
    loadDayMatches();
    setRowSelections({});
    setRowVenues({});
    setListHomeTeamId("");
    setListAwayTeamId("");
    setListVenueId("");
    setListQueuedMatches([]);
  }, [loadDayMatches]);

  const getExistingPairMatch = (homeId, awayId) =>
    dayMatches.find(
      (match) =>
        (match.homeTeam?.teamId === homeId &&
          match.awayTeam?.teamId === awayId) ||
        (match.homeTeam?.teamId === awayId && match.awayTeam?.teamId === homeId)
    );

  const canSelectGridCell = (homeId, awayId) => {
    if (homeId === awayId) return false;
    if (getExistingPairMatch(homeId, awayId)) return false;
    if (bookedTeamIds.has(homeId) || bookedTeamIds.has(awayId)) return false;

    const selectedAwayInRow = rowSelections[homeId];
    if (selectedAwayInRow === awayId) return true;
    if (selectedAwayInRow) return false;
    return true;
  };

  const toggleGridPair = (homeId, awayId) => {
    if (!canSelectGridCell(homeId, awayId) && rowSelections[homeId] !== awayId) {
      return;
    }
    setRowSelections((prev) => {
      const next = { ...prev };
      if (next[homeId] === awayId) {
        delete next[homeId];
        setRowVenues((venues) => {
          const updated = { ...venues };
          delete updated[homeId];
          return updated;
        });
      } else {
        next[homeId] = awayId;
      }
      return next;
    });
  };

  const handleRowVenueChange = (homeId, venue) => {
    setRowVenues((prev) => ({ ...prev, [homeId]: venue }));
  };

  const handleListHomeChange = (teamId) => {
    setListHomeTeamId(teamId);
    if (teamId && teamId === listAwayTeamId) {
      setListAwayTeamId("");
    }
  };

  const handleListAwayChange = (teamId) => {
    if (teamId && teamId === listHomeTeamId) return;
    setListAwayTeamId(teamId);
  };

  const listTeamsConflict =
    Boolean(listHomeTeamId) &&
    Boolean(listAwayTeamId) &&
    listHomeTeamId === listAwayTeamId;

  const teamsInListQueue = useMemo(() => {
    const used = new Set();
    for (const match of listQueuedMatches) {
      used.add(match.homeId);
      used.add(match.awayId);
    }
    return used;
  }, [listQueuedMatches]);

  const isTeamUnavailableForList = (teamId) =>
    bookedTeamIds.has(teamId) || teamsInListQueue.has(teamId);

  const canAddCurrentListMatch = useMemo(() => {
    if (!listHomeTeamId || !listAwayTeamId || !listVenueId) return false;
    if (listTeamsConflict) return false;
    if (getExistingPairMatch(listHomeTeamId, listAwayTeamId)) return false;
    if (isTeamUnavailableForList(listHomeTeamId)) return false;
    if (isTeamUnavailableForList(listAwayTeamId)) return false;
    return !listQueuedMatches.some(
      (match) =>
        match.homeId === listHomeTeamId && match.awayId === listAwayTeamId
    );
  }, [
    listHomeTeamId,
    listAwayTeamId,
    listVenueId,
    listTeamsConflict,
    listQueuedMatches,
    bookedTeamIds,
    teamsInListQueue,
    dayMatches,
  ]);

  const handleAddListMatch = () => {
    if (!canAddCurrentListMatch) {
      Swal.fire({
        icon: "warning",
        title: "Cannot add match",
        text: "Select home, away, and venue. Teams must be available and different.",
      });
      return;
    }

    const id = `${listHomeTeamId}:${listAwayTeamId}`;
    setListQueuedMatches((prev) => [
      ...prev,
      {
        id,
        homeId: listHomeTeamId,
        awayId: listAwayTeamId,
        venueId: listVenueId,
      },
    ]);
    setListHomeTeamId("");
    setListAwayTeamId("");
    setListVenueId("");
  };

  const handleRemoveListMatch = (matchId) => {
    setListQueuedMatches((prev) => prev.filter((match) => match.id !== matchId));
  };

  const pairsToCreate = useMemo(() => {
    if (viewMode === "grid") {
      return Object.entries(rowSelections).map(([homeId, awayId]) => ({
        homeId,
        awayId,
        venueId: rowVenues[homeId] || "",
      }));
    }
    return listQueuedMatches.map((match) => ({
      homeId: match.homeId,
      awayId: match.awayId,
      venueId: match.venueId,
    }));
  }, [viewMode, rowSelections, rowVenues, listQueuedMatches]);

  const allPairsHaveVenue = pairsToCreate.every((pair) => Boolean(pair.venueId));

  const teamNameById = useMemo(
    () => Object.fromEntries(teams.map((t) => [t.id, t.name])),
    [teams]
  );

  const venueNameById = useMemo(
    () => Object.fromEntries(venues.map((v) => [v.id, v.name])),
    [venues]
  );

  const handleCreate = async () => {
    if (!selectedDivisionId) {
      Swal.fire({ icon: "warning", title: "Select a division" });
      return;
    }
    if (!matchDateTime) {
      Swal.fire({ icon: "warning", title: "Select date and time" });
      return;
    }
    if (pairsToCreate.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No matches selected",
        text: "Add matches in the grid or list view before creating.",
      });
      return;
    }
    if (!allPairsHaveVenue) {
      Swal.fire({
        icon: "warning",
        title: "Venue required",
        text: "Each match needs its own venue before creating.",
      });
      return;
    }

    setCreating(true);
    let created = 0;
    const errors = [];

    try {
      for (const { homeId, awayId, venueId: pairVenueId } of pairsToCreate) {
        const result = await matchAPI.save({
          userId,
          homeTeamId: homeId,
          awayTeamId: awayId,
          venueId: pairVenueId,
          dateTime: matchDateTime.toISOString(),
          status:
            dateStatus === "Normal" || dateStatus === "Played"
              ? dateStatus
              : "Scheduled",
          dateStatus,
        });
        if (Number(result.errorCode) === 0) created += 1;
        else errors.push(result.errorMessage || "Failed to create a match.");
      }

      if (created > 0) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: `${created} match${created === 1 ? "" : "es"} created`,
          timer: 2200,
          showConfirmButton: false,
        });
        setRowSelections({});
        setRowVenues({});
        setListHomeTeamId("");
        setListAwayTeamId("");
        setListVenueId("");
        setListQueuedMatches([]);
        await loadDayMatches();
      }

      if (errors.length > 0) {
        Swal.fire({
          icon: errors.length === pairsToCreate.length ? "error" : "warning",
          title: created > 0 ? "Some matches failed" : "Create failed",
          text: errors[0],
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Create failed",
        text: err?.message || "Could not create matches.",
      });
    } finally {
      setCreating(false);
    }
  };

  const tableLoading = loadingTeams || loadingMatches;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="relative">
          <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
            <Layers className="h-3.5 w-3.5 text-[#00ADE5]" />
            Division
          </label>
          <div className="relative">
            <select
              value={selectedDivisionId}
              onChange={(e) => setSelectedDivisionId(e.target.value)}
              disabled={loadingDivisions}
              className={selectClass}
            >
              <option value="">
                {loadingDivisions ? "Loading…" : "Select division"}
              </option>
              {divisions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
            <CalendarClock className="h-3.5 w-3.5 text-[#00ADE5]" />
            Match date & time
          </label>
          <DatePicker
            selected={matchDateTime}
            onChange={(date) => setMatchDateTime(date)}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="MMMM d, yyyy h:mm aa"
            className={datePickerClass}
            placeholderText="Select date and time"
          />
        </div>

        <div className="relative">
          <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#00ADE5]" />
            Date status
          </label>
          <div className="relative">
            <select
              value={dateStatus}
              onChange={(e) => setDateStatus(e.target.value)}
              className={selectClass}
            >
              {MATCH_DATE_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3 rounded-2xl border border-[#00ADE5]/20 bg-[#00ADE5]/5 px-4 py-3.5">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#00ADE5]" />
          <p className="text-sm leading-relaxed text-gray-600">
            Teams with a match on the selected date are shown as booked and
            cannot be paired again. Select pairings and a venue for each match,
            then press{" "}
            <span className="font-semibold text-[#003366]">Create</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1 rounded-xl border border-gray-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={clsx(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold tracking-wide transition",
                viewMode === "grid"
                  ? "bg-gradient-to-r from-[#003366] to-[#004080] text-white shadow-sm"
                  : "text-gray-500 hover:text-[#003366]"
              )}
            >
              <Grid3x3 className="h-3.5 w-3.5" />
              Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={clsx(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold tracking-wide transition",
                viewMode === "list"
                  ? "bg-gradient-to-r from-[#003366] to-[#004080] text-white shadow-sm"
                  : "text-gray-500 hover:text-[#003366]"
              )}
            >
              <List className="h-3.5 w-3.5" />
              List
            </button>
          </div>

          <button
            type="button"
            onClick={handleCreate}
            disabled={
              creating || pairsToCreate.length === 0 || !allPairsHaveVenue
            }
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#003366] to-[#004080] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-60"
          >
            {creating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Create{pairsToCreate.length > 0 ? ` (${pairsToCreate.length})` : ""}
          </button>
        </div>
      </div>

      {!selectedDivisionId ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-14 text-center text-sm text-gray-500">
          Select a division to load teams.
        </div>
      ) : !matchDateTime ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-14 text-center text-sm text-gray-500">
          Select a date and time to see existing fixtures and create new matches.
        </div>
      ) : teams.length === 0 && !tableLoading ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-14 text-center text-sm text-gray-500">
          No teams found in this division.
        </div>
      ) : viewMode === "grid" ? (
        <div className="relative overflow-hidden rounded-2xl border border-gray-200/90">
          {tableLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
              <Loader2 className="h-8 w-8 animate-spin text-[#00ADE5]" />
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="bg-gradient-to-r from-[#003366] to-[#004080] text-white">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                    Home team
                  </th>
                  {teams.map((team) => (
                    <th
                      key={team.id}
                      className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider"
                      title={team.name}
                    >
                      {team.code}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {teams.map((homeTeam) => {
                  const homeBooking = teamBookings[homeTeam.id];
                  const selectedAwayId = rowSelections[homeTeam.id];
                  return (
                    <tr
                      key={homeTeam.id}
                      className={clsx(
                        "transition-colors",
                        homeBooking ? "bg-amber-50/40" : "hover:bg-slate-50/80"
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-[#003366]">
                          {homeTeam.name}
                        </div>
                        {homeBooking && (
                          <div className="mt-0.5 text-xs text-amber-700">
                            vs {homeBooking.opponentName} ·{" "}
                            {formatMatchDateStatusLabel(homeBooking.dateStatus)}
                            {homeBooking.venueName
                              ? ` · ${homeBooking.venueName}`
                              : ""}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {selectedAwayId ? (
                          <div className="relative min-w-[9rem]">
                            <select
                              value={rowVenues[homeTeam.id] || ""}
                              onChange={(e) =>
                                handleRowVenueChange(
                                  homeTeam.id,
                                  e.target.value
                                )
                              }
                              disabled={loadingVenues}
                              className={compactSelectClass}
                            >
                              <option value="">Select venue</option>
                              {venues.map((v) => (
                                <option key={v.id} value={v.id}>
                                  {v.name}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                      {teams.map((awayTeam) => {
                        const existing = getExistingPairMatch(
                          homeTeam.id,
                          awayTeam.id
                        );
                        const isSelected =
                          rowSelections[homeTeam.id] === awayTeam.id;
                        const canSelect = canSelectGridCell(
                          homeTeam.id,
                          awayTeam.id
                        );

                        if (homeTeam.id === awayTeam.id) {
                          return (
                            <td
                              key={awayTeam.id}
                              className="px-3 py-3 text-center text-xs text-gray-300"
                            >
                              —
                            </td>
                          );
                        }

                        if (existing) {
                          return (
                            <td
                              key={awayTeam.id}
                              className="px-3 py-3 text-center"
                            >
                              <span className="inline-flex rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
                                {formatMatchDateStatusLabel(
                                  existing.dateStatus || existing.status
                                )}
                              </span>
                            </td>
                          );
                        }

                        return (
                          <td key={awayTeam.id} className="px-3 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={!canSelect && !isSelected}
                              onChange={() =>
                                toggleGridPair(homeTeam.id, awayTeam.id)
                              }
                              className={checkboxClass}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
          <div className="border-b border-gray-100 bg-gradient-to-r from-[#003366]/[0.03] to-[#00ADE5]/[0.05] px-5 py-4">
            <h3 className="text-sm font-bold text-[#003366]">Select matchup</h3>
            <p className="mt-0.5 text-xs text-gray-500">
              Add multiple matches, then create them all at once
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="relative">
              <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                <Home className="h-3.5 w-3.5 text-[#00ADE5]" />
                Home team
              </label>
              <div className="relative">
                <select
                  value={listHomeTeamId}
                  onChange={(e) => handleListHomeChange(e.target.value)}
                  className={selectClass}
                >
                  <option value="">Select home team</option>
                  {teams.map((team) => {
                    const booking = teamBookings[team.id];
                    return (
                      <option
                        key={team.id}
                        value={team.id}
                        disabled={isTeamUnavailableForList(team.id)}
                      >
                        {team.name}
                        {booking
                          ? ` (vs ${booking.opponentName})`
                          : teamsInListQueue.has(team.id)
                            ? " (queued)"
                            : ""}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="relative">
              <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                <Users className="h-3.5 w-3.5 text-[#00ADE5]" />
                Away team
              </label>
              <div className="relative">
                <select
                  value={listAwayTeamId}
                  onChange={(e) => handleListAwayChange(e.target.value)}
                  className={selectClass}
                >
                  <option value="">Select away team</option>
                  {teams.map((team) => {
                    const booking = teamBookings[team.id];
                    const isHomeTeam = team.id === listHomeTeamId;
                    const unavailable = isTeamUnavailableForList(team.id);
                    return (
                      <option
                        key={team.id}
                        value={team.id}
                        disabled={isHomeTeam || unavailable}
                      >
                        {team.name}
                        {isHomeTeam
                          ? " (same as home)"
                          : booking
                            ? ` (vs ${booking.opponentName})`
                            : teamsInListQueue.has(team.id)
                              ? " (queued)"
                              : ""}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="relative sm:col-span-2 lg:col-span-1">
              <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                <MapPin className="h-3.5 w-3.5 text-[#00ADE5]" />
                Venue
              </label>
              <div className="relative">
                <select
                  value={listVenueId}
                  onChange={(e) => setListVenueId(e.target.value)}
                  disabled={loadingVenues || !listHomeTeamId || !listAwayTeamId}
                  className={selectClass}
                >
                  <option value="">
                    {loadingVenues ? "Loading…" : "Select venue"}
                  </option>
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-4">
            {listTeamsConflict ? (
              <p className="text-sm text-red-600">
                Home and away team cannot be the same.
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                {listQueuedMatches.length} match
                {listQueuedMatches.length === 1 ? "" : "es"} queued
              </p>
            )}
            <button
              type="button"
              onClick={handleAddListMatch}
              disabled={!canAddCurrentListMatch}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-[#00ADE5]/30 bg-white px-4 py-2 text-sm font-semibold text-[#0088cc] transition hover:border-[#00ADE5] hover:bg-[#00ADE5]/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add match
            </button>
          </div>

          {listQueuedMatches.length > 0 && (
            <div className="border-t border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px]">
                  <thead>
                    <tr className="bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      <th className="px-5 py-3">Home</th>
                      <th className="px-5 py-3">Away</th>
                      <th className="px-5 py-3">Venue</th>
                      <th className="px-5 py-3 text-right">Remove</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {listQueuedMatches.map((match) => (
                      <tr key={match.id} className="text-sm text-gray-700">
                        <td className="px-5 py-3 font-semibold text-[#003366]">
                          {teamNameById[match.homeId]}
                        </td>
                        <td className="px-5 py-3 font-semibold text-[#003366]">
                          {teamNameById[match.awayId]}
                        </td>
                        <td className="px-5 py-3">{venueNameById[match.venueId]}</td>
                        <td className="px-5 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveListMatch(match.id)}
                            title="Remove match"
                            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ManuallyCreate() {
  const [activeTab, setActiveTab] = useState("division");

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#00ADE5]">
          Schedule
        </p>
        <h2 className="mt-1 text-xl font-bold tracking-tight text-[#003366] sm:text-2xl">
          Manually Create
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Pick teams and a kick-off time to create fixtures for your league.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
        <nav
          className="flex gap-1 overflow-x-auto border-b border-gray-100 bg-slate-50/60 p-2"
          aria-label="Manual create modes"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "shrink-0 rounded-xl px-4 py-2.5 text-xs font-bold tracking-wide transition",
                activeTab === tab.id
                  ? "bg-gradient-to-r from-[#003366] to-[#004080] text-white shadow-sm"
                  : "text-gray-500 hover:bg-white hover:text-[#003366]"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-5 sm:p-6">
          {activeTab === "division" && <DivisionMatchesTab />}
          {activeTab === "inter-division" && (
            <PlaceholderTab label="Inter-Division Matches" />
          )}
          {activeTab === "other" && <PlaceholderTab label="Other Matches" />}
          {activeTab === "spreadsheet" && (
            <PlaceholderTab label="Spreadsheet Upload" />
          )}
        </div>
      </div>
    </div>
  );
}
