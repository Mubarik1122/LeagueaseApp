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
import {
  getDatePickerMaxTime,
  getDatePickerMinTime,
  getMinDateForMatchCreate,
  isPastMatchDateTime,
} from "../../utils/matchScheduleDateTime";

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

function mapDivision(t) {
  return {
    id: String(t.divisionOrTournamentId ?? t._id ?? t.id ?? ""),
    name:
      t.divisionOrtournamentName ?? t.tournamentName ?? t.name ?? "Unnamed",
  };
}

function mapTeam(team, divisionContext = null) {
  const id = String(team._id ?? team.id ?? team.teamId ?? "");
  const name = team.teamName ?? team.displayName ?? "Unnamed team";
  const code = team.shortCode ?? name.slice(0, 4).toUpperCase();
  const divisionId =
    divisionContext?.id ??
    String(
      team.tournamentId?._id ??
        team.tournamentId ??
        team.divisionOrTournamentId ??
        ""
    );
  const divisionName =
    divisionContext?.name ??
    team.tournamentName ??
    team.divisionName ??
    "";
  return { id, name, code, divisionId, divisionName };
}

function teamsInDifferentDivisions(teams, homeId, awayId) {
  const home = teams.find((team) => team.id === homeId);
  const away = teams.find((team) => team.id === awayId);
  if (!home?.divisionId || !away?.divisionId) return true;
  return home.divisionId !== away.divisionId;
}

function toDateQueryValue(date) {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const MATCH_TIME_BUFFER_MINUTES = 48;
const MATCH_TIME_BUFFER_MS = MATCH_TIME_BUFFER_MINUTES * 60 * 1000;

function hasMatchTimeConflict(selectedDateTime, existingDateTime) {
  if (!selectedDateTime || !existingDateTime) return false;
  const selected = new Date(selectedDateTime).getTime();
  const existing = new Date(existingDateTime).getTime();
  if (Number.isNaN(selected) || Number.isNaN(existing)) return false;
  return Math.abs(selected - existing) <= MATCH_TIME_BUFFER_MS;
}

function formatMatchTimeLabel(dateTime) {
  if (!dateTime) return "";
  const date = new Date(dateTime);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function normalizeTeamId(id) {
  if (id == null || id === "") return "";
  return String(id);
}

function getTeamIdFromRef(teamRef) {
  if (!teamRef) return "";
  return normalizeTeamId(teamRef.teamId ?? teamRef._id ?? teamRef.id);
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

function ManualMatchesPanel({ mode = "division" }) {
  const isDivision = mode === "division";
  const isInterDivision = mode === "inter-division";
  const isOther = mode === "other";
  const hideDivisionPicker = !isDivision;
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
  const [sharedVenueId, setSharedVenueId] = useState("");
  const [rowSelections, setRowSelections] = useState({});
  const [listHomeTeamId, setListHomeTeamId] = useState("");
  const [listAwayTeamId, setListAwayTeamId] = useState("");
  const [listQueuedMatches, setListQueuedMatches] = useState([]);
  const [loadingDivisions, setLoadingDivisions] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [loadingVenues, setLoadingVenues] = useState(false);
  const [creating, setCreating] = useState(false);

  const userId = getStoredUserId();
  const dateQuery = toDateQueryValue(matchDateTime);

  const independentTeamIds = useMemo(
    () => (isOther ? new Set(teams.map((team) => team.id)) : null),
    [isOther, teams]
  );

  const teamBookings = useMemo(() => {
    if (!matchDateTime) return {};
    const bookings = {};
    for (const match of dayMatches) {
      if (!hasMatchTimeConflict(matchDateTime, match.dateTime)) continue;

      const homeId = getTeamIdFromRef(match.homeTeam);
      const awayId = getTeamIdFromRef(match.awayTeam);
      if (!homeId || !awayId) continue;

      bookings[homeId] = {
        opponentId: awayId,
        opponentName: match.awayTeamName,
        opponentCode: match.awayTeam?.shortCode,
        matchId: match.matchId,
        dateTime: match.dateTime,
        dateStatus: match.dateStatus || match.status,
        venueName: match.venueName,
      };
      bookings[awayId] = {
        opponentId: homeId,
        opponentName: match.homeTeamName,
        opponentCode: match.homeTeam?.shortCode,
        matchId: match.matchId,
        dateTime: match.dateTime,
        dateStatus: match.dateStatus || match.status,
        venueName: match.venueName,
      };
    }
    return bookings;
  }, [dayMatches, matchDateTime]);

  const bookedTeamIds = useMemo(
    () => new Set(Object.keys(teamBookings).map(normalizeTeamId)),
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
    if (!userId) {
      setTeams([]);
      return;
    }
    if (isDivision && !selectedDivisionId) {
      setTeams([]);
      return;
    }
    if (isInterDivision && divisions.length === 0) {
      setTeams([]);
      return;
    }

    setLoadingTeams(true);
    try {
      if (isOther) {
        const res = await teamAPI.getByUserIdAndTournament(userId, "", {
          filter: "not_in_division",
        });
        const list = Array.isArray(res.data)
          ? res.data
          : res.data
            ? [res.data]
            : [];
        const mapped = list.map((team) => mapTeam(team)).filter((team) => team.id);
        mapped.sort((a, b) => a.name.localeCompare(b.name));
        setTeams(mapped);
      } else if (isInterDivision) {
        const merged = [];
        const seen = new Set();
        for (const division of divisions) {
          const res = await teamAPI.getByUserIdAndTournament(
            userId,
            division.id,
            { filter: "" }
          );
          const list = Array.isArray(res.data)
            ? res.data
            : res.data
              ? [res.data]
              : [];
          for (const team of list) {
            const mapped = mapTeam(team, division);
            if (!mapped.id || seen.has(mapped.id)) continue;
            seen.add(mapped.id);
            merged.push(mapped);
          }
        }
        merged.sort((a, b) => a.name.localeCompare(b.name));
        setTeams(merged);
      } else {
        const res = await teamAPI.getByUserIdAndTournament(
          userId,
          selectedDivisionId,
          { filter: "" }
        );
        const list = Array.isArray(res.data) ? res.data : res.data ? [res.data] : [];
        setTeams(
          list
            .map((team) => mapTeam(team, divisions.find((d) => d.id === selectedDivisionId)))
            .filter((t) => t.id)
        );
      }
    } catch {
      setTeams([]);
    } finally {
      setLoadingTeams(false);
    }
  }, [userId, selectedDivisionId, divisions, isDivision, isInterDivision, isOther]);

  const loadDayMatches = useCallback(async () => {
    if (!dateQuery) {
      setDayMatches([]);
      return;
    }
    if (isDivision && !selectedDivisionId) {
      setDayMatches([]);
      return;
    }
    if (isOther && teams.length === 0) {
      setDayMatches([]);
      return;
    }
    setLoadingMatches(true);
    try {
      const res = await companyAPI.getMatches({
        ...(isDivision ? { division: selectedDivisionId } : {}),
        dateFrom: dateQuery,
        dateTo: dateQuery,
      });
      if (Number(res.errorCode) === 0) {
        const raw = Array.isArray(res.data?.matches) ? res.data.matches : [];
        let mapped = raw.map(mapCompanyMatch);
        if (isOther && independentTeamIds) {
          mapped = mapped.filter((match) => {
            const homeId = getTeamIdFromRef(match.homeTeam);
            const awayId = getTeamIdFromRef(match.awayTeam);
            return (
              independentTeamIds.has(homeId) && independentTeamIds.has(awayId)
            );
          });
        }
        setDayMatches(mapped);
      } else {
        setDayMatches([]);
      }
    } catch {
      setDayMatches([]);
    } finally {
      setLoadingMatches(false);
    }
  }, [
    selectedDivisionId,
    dateQuery,
    isDivision,
    isOther,
    teams,
    independentTeamIds,
  ]);

  useEffect(() => {
    if (isSuperAdmin && (!companiesReady || !selectedCompanyId)) return;
    if (!isOther) loadDivisions();
    loadVenues();
  }, [
    isSuperAdmin,
    selectedCompanyId,
    companiesReady,
    loadDivisions,
    loadVenues,
    isOther,
  ]);

  useEffect(() => {
    if (isInterDivision && divisions.length === 0) return;
    loadTeams();
    setRowSelections({});
    setListHomeTeamId("");
    setListAwayTeamId("");
    setListQueuedMatches([]);
  }, [loadTeams, isInterDivision, isOther, divisions.length]);

  useEffect(() => {
    loadDayMatches();
    setRowSelections({});
    setListHomeTeamId("");
    setListAwayTeamId("");
    setListQueuedMatches([]);
  }, [loadDayMatches]);

  const getExistingPairMatch = useCallback(
    (homeId, awayId) => {
      const normalizedHomeId = normalizeTeamId(homeId);
      const normalizedAwayId = normalizeTeamId(awayId);
      return dayMatches.find((match) => {
        const matchHomeId = getTeamIdFromRef(match.homeTeam);
        const matchAwayId = getTeamIdFromRef(match.awayTeam);
        const isPair =
          (matchHomeId === normalizedHomeId &&
            matchAwayId === normalizedAwayId) ||
          (matchHomeId === normalizedAwayId &&
            matchAwayId === normalizedHomeId);
        if (!isPair) return false;
        if (!matchDateTime) return true;
        return hasMatchTimeConflict(matchDateTime, match.dateTime);
      });
    },
    [dayMatches, matchDateTime]
  );

  const isTeamBookedAtSelectedTime = useCallback(
    (teamId) => bookedTeamIds.has(normalizeTeamId(teamId)),
    [bookedTeamIds]
  );

  const canSelectGridCell = (homeId, awayId) => {
    if (homeId === awayId) return false;
    if (isInterDivision && !teamsInDifferentDivisions(teams, homeId, awayId)) {
      return false;
    }
    if (getExistingPairMatch(homeId, awayId)) return false;
    if (
      isTeamBookedAtSelectedTime(homeId) ||
      isTeamBookedAtSelectedTime(awayId)
    ) {
      return false;
    }

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
      } else {
        next[homeId] = awayId;
      }
      return next;
    });
  };

  const handleListHomeChange = (teamId) => {
    setListHomeTeamId(teamId);
    if (teamId && teamId === listAwayTeamId) {
      setListAwayTeamId("");
    }
  };

  const handleListAwayChange = (teamId) => {
    if (teamId && teamId === listHomeTeamId) return;
    if (
      teamId &&
      listHomeTeamId &&
      isInterDivision &&
      !teamsInDifferentDivisions(teams, listHomeTeamId, teamId)
    ) {
      return;
    }
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
    isTeamBookedAtSelectedTime(teamId) || teamsInListQueue.has(teamId);

  const canAddCurrentListMatch = useMemo(() => {
    if (!listHomeTeamId || !listAwayTeamId || !sharedVenueId) return false;
    if (listTeamsConflict) return false;
    if (
      isInterDivision &&
      !teamsInDifferentDivisions(teams, listHomeTeamId, listAwayTeamId)
    ) {
      return false;
    }
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
    sharedVenueId,
    listTeamsConflict,
    listQueuedMatches,
    bookedTeamIds,
    teamsInListQueue,
    dayMatches,
    matchDateTime,
    isInterDivision,
    teams,
  ]);

  const handleAddListMatch = () => {
    if (!canAddCurrentListMatch) {
      Swal.fire({
        icon: "warning",
        title: "Cannot add match",
        text: "Select home, away teams and a venue from the filters above.",
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
      },
    ]);
    setListHomeTeamId("");
    setListAwayTeamId("");
  };

  const handleRemoveListMatch = (matchId) => {
    setListQueuedMatches((prev) => prev.filter((match) => match.id !== matchId));
  };

  const pairsToCreate = useMemo(() => {
    const base =
      viewMode === "grid"
        ? Object.entries(rowSelections).map(([homeId, awayId]) => ({
            homeId,
            awayId,
          }))
        : listQueuedMatches.map((match) => ({
            homeId: match.homeId,
            awayId: match.awayId,
          }));

    return base.map((pair) => ({ ...pair, venueId: sharedVenueId }));
  }, [viewMode, rowSelections, listQueuedMatches, sharedVenueId]);

  const hasPairTimeConflict = useCallback(
    (homeId, awayId) =>
      Boolean(getExistingPairMatch(homeId, awayId)) ||
      isTeamBookedAtSelectedTime(homeId) ||
      isTeamBookedAtSelectedTime(awayId),
    [getExistingPairMatch, isTeamBookedAtSelectedTime]
  );

  const canCreateMatches =
    pairsToCreate.length > 0 &&
    Boolean(sharedVenueId) &&
    pairsToCreate.every(
      ({ homeId, awayId }) => !hasPairTimeConflict(homeId, awayId)
    );

  const teamNameById = useMemo(
    () => Object.fromEntries(teams.map((t) => [t.id, t.name])),
    [teams]
  );

  const handleCreate = async () => {
    if (isDivision && !selectedDivisionId) {
      Swal.fire({ icon: "warning", title: "Select a division" });
      return;
    }
    if (!matchDateTime) {
      Swal.fire({ icon: "warning", title: "Select date and time" });
      return;
    }
    if (isPastMatchDateTime(matchDateTime)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid date & time",
        text: "Cannot schedule a match in the past.",
      });
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
    if (!sharedVenueId) {
      Swal.fire({
        icon: "warning",
        title: "Venue required",
        text: "Select a venue from the filters above.",
      });
      return;
    }

    const conflictingPair = pairsToCreate.find(({ homeId, awayId }) =>
      hasPairTimeConflict(homeId, awayId)
    );
    if (conflictingPair) {
      Swal.fire({
        icon: "warning",
        title: "Time conflict",
        text: `A team already has a match within ${MATCH_TIME_BUFFER_MINUTES} minutes of the selected time, or this pairing already exists on this date.`,
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
        setListHomeTeamId("");
        setListAwayTeamId("");
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
      <div
        className={clsx(
          "grid grid-cols-1 gap-4",
          hideDivisionPicker ? "md:grid-cols-3" : "md:grid-cols-2 xl:grid-cols-4"
        )}
      >
        {isDivision && (
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
        )}

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
            minDate={getMinDateForMatchCreate()}
            minTime={getDatePickerMinTime(matchDateTime)}
            maxTime={getDatePickerMaxTime(matchDateTime)}
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

        <div className="relative">
          <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
            <MapPin className="h-3.5 w-3.5 text-[#00ADE5]" />
            Venue
          </label>
          <div className="relative">
            <select
              value={sharedVenueId}
              onChange={(e) => setSharedVenueId(e.target.value)}
              disabled={loadingVenues}
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

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3 rounded-2xl border border-[#00ADE5]/20 bg-[#00ADE5]/5 px-4 py-3.5">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#00ADE5]" />
          <p className="text-sm leading-relaxed text-gray-600">
            {isInterDivision
              ? `Pair teams from different divisions only. Existing matches from any division within ${MATCH_TIME_BUFFER_MINUTES} minutes of the selected time block those teams.`
              : isOther
                ? `Independent teams only — not assigned to any division. Teams with a match within ${MATCH_TIME_BUFFER_MINUTES} minutes of the selected time cannot be paired again.`
                : `Teams with a match within ${MATCH_TIME_BUFFER_MINUTES} minutes of the selected time cannot be paired again.`}{" "}
            Select pairings, choose a venue above, then press{" "}
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
            disabled={creating || !canCreateMatches}
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

      {isDivision && !selectedDivisionId ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-14 text-center text-sm text-gray-500">
          Select a division to load teams.
        </div>
      ) : isInterDivision && loadingDivisions ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-14 text-center text-sm text-gray-500">
          <Loader2 className="mx-auto mb-2 h-7 w-7 animate-spin text-[#00ADE5]" />
          Loading divisions and teams…
        </div>
      ) : isOther && loadingTeams && teams.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-14 text-center text-sm text-gray-500">
          <Loader2 className="mx-auto mb-2 h-7 w-7 animate-spin text-[#00ADE5]" />
          Loading independent teams…
        </div>
      ) : !matchDateTime ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-14 text-center text-sm text-gray-500">
          Select a date and time to see existing fixtures and create new matches.
        </div>
      ) : teams.length === 0 && !tableLoading ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-14 text-center text-sm text-gray-500">
          {isInterDivision
            ? "No teams found across divisions."
            : isOther
              ? "No independent teams found. Create teams under Setup that are not assigned to a division."
              : "No teams found in this division."}
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
                      title={
                        isInterDivision
                          ? `${team.name} (${team.divisionName})`
                          : team.name
                      }
                    >
                      {team.code}
                      {isInterDivision && team.divisionName && (
                        <span className="mx-auto mt-1 block max-w-[5.5rem] text-[10px] font-normal normal-case leading-tight opacity-90 whitespace-normal">
                          {team.divisionName}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {teams.map((homeTeam) => {
                  const homeBooking = teamBookings[normalizeTeamId(homeTeam.id)];
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
                        {isInterDivision && homeTeam.divisionName && (
                          <div className="mt-0.5 text-xs text-gray-500">
                            {homeTeam.divisionName}
                          </div>
                        )}
                        {homeBooking && (
                          <div className="mt-0.5 text-xs text-amber-700">
                            vs {homeBooking.opponentName} ·{" "}
                            {formatMatchTimeLabel(homeBooking.dateTime)}
                            {homeBooking.venueName
                              ? ` · ${homeBooking.venueName}`
                              : ""}
                          </div>
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

                        if (
                          isInterDivision &&
                          homeTeam.divisionId === awayTeam.divisionId
                        ) {
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
              {isInterDivision
                ? "Home and away must be from different divisions"
                : isOther
                  ? "Pair independent teams, then create them all at once"
                  : "Add multiple matches, then create them all at once"}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
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
                    const booking = teamBookings[normalizeTeamId(team.id)];
                    const divisionLabel = isInterDivision && team.divisionName
                      ? ` · ${team.divisionName}`
                      : "";
                    return (
                      <option
                        key={team.id}
                        value={team.id}
                        disabled={isTeamUnavailableForList(team.id)}
                      >
                        {team.name}
                        {divisionLabel}
                        {booking
                          ? ` (vs ${booking.opponentName} · ${formatMatchTimeLabel(booking.dateTime)})`
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
                    const booking = teamBookings[normalizeTeamId(team.id)];
                    const isHomeTeam = team.id === listHomeTeamId;
                    const unavailable = isTeamUnavailableForList(team.id);
                    const sameDivision =
                      isInterDivision &&
                      listHomeTeamId &&
                      !teamsInDifferentDivisions(teams, listHomeTeamId, team.id);
                    const divisionLabel = isInterDivision && team.divisionName
                      ? ` · ${team.divisionName}`
                      : "";
                    return (
                      <option
                        key={team.id}
                        value={team.id}
                        disabled={isHomeTeam || unavailable || sameDivision}
                      >
                        {team.name}
                        {divisionLabel}
                        {isHomeTeam
                          ? " (same as home)"
                          : sameDivision
                            ? " (same division)"
                            : booking
                              ? ` (vs ${booking.opponentName} · ${formatMatchTimeLabel(booking.dateTime)})`
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
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-4">
            {listTeamsConflict ? (
              <p className="text-sm text-red-600">
                Home and away team cannot be the same.
              </p>
            ) : isInterDivision &&
              listHomeTeamId &&
              listAwayTeamId &&
              !teamsInDifferentDivisions(teams, listHomeTeamId, listAwayTeamId) ? (
              <p className="text-sm text-red-600">
                Home and away must be from different divisions.
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
          {activeTab === "division" && <ManualMatchesPanel mode="division" />}
          {activeTab === "inter-division" && (
            <ManualMatchesPanel mode="inter-division" />
          )}
          {activeTab === "other" && <ManualMatchesPanel mode="other" />}
          {activeTab === "spreadsheet" && (
            <PlaceholderTab label="Spreadsheet Upload" />
          )}
        </div>
      </div>
    </div>
  );
}
