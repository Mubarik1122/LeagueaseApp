import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import clsx from "clsx";
import {
  Plus,
  Trash2,
  Settings,
  Calendar,
  ArrowLeft,
  Loader2,
  Layers,
  UsersRound,
  Filter,
  Edit2,
  Unlink,
  X,
  Save,
  Shield,
  Sparkles,
} from "lucide-react";
import Swal from "sweetalert2";
import CreateDivisionModal from "../components/CreateDivisionModal";
import CreateMatchModal from "../components/CreateMatchModal";
import Modal from "../components/Modal";
import SetupTabHeader, {
  SetupPrimaryButton,
  SetupSecondaryButton,
} from "../components/setup/SetupTabHeader";
import { useTournament } from "../hooks/useTournament";
import {
  tournamentAPI,
  teamAPI,
  venueAPI,
  pickTournamentFromResponse,
  tournamentToDivisionForm,
} from "../services/api";

const tabBtn =
  "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200";

const TEAM_SUB_VIEWS = [
  {
    id: "existing",
    label: "Teams in division",
    description: "View, filter, and add existing teams to this division",
    icon: UsersRound,
    accent: "from-[#003366] to-[#004080]",
    glow: "shadow-[#003366]/15",
  },
  {
    id: "create",
    label: "Create new teams",
    description: "Register new teams in bulk with venue and short codes",
    icon: Plus,
    accent: "from-[#00ADE5] to-[#0088cc]",
    glow: "shadow-[#00ADE5]/20",
  },
];

const initialDivisionForm = {
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

/** Division/tournament id for API (GET filter + save). Backend may send any of these. */
function divisionIdFromTournamentRow(t) {
  if (!t || typeof t !== "object") return "";
  const raw =
    t.divisionOrTournamentId ??
    t._id ??
    t.id ??
    t.tournamentId;
  return raw != null && String(raw).trim() !== "" ? String(raw).trim() : "";
}

function getManagedDivisionId(comp) {
  if (!comp) return "";
  const fromField = comp.divisionOrTournamentId ?? comp.id;
  return fromField != null && String(fromField).trim() !== ""
    ? String(fromField).trim()
    : "";
}

function emptyBulkTeamRow() {
  return {
    teamName: "",
    displayName: "",
    shortCode: "",
    venueId: "",
  };
}

function emptyTeamEditForm() {
  return {
    teamId: null,
    teamName: "",
    displayName: "",
    shortCode: "",
    venueId: "",
    about: "",
    isArchived: false,
    teamType: "",
    playersAgeCategory: "",
    upcomingSeason: "",
  };
}

function firstVenueIdFromTeam(team) {
  return normalizeVenueIdsForTeamSave(team?.venueIds)[0] ?? "";
}

function teamRecordKey(t, index) {
  const id = t?._id ?? t?.id ?? t?.teamId;
  return id != null ? String(id) : `team-${index}`;
}

function teamRowId(t) {
  const id = t?._id ?? t?.id ?? t?.teamId;
  return id != null ? String(id) : "";
}

const TEAM_AVATAR_GRADIENTS = [
  "from-[#003366] to-[#004080]",
  "from-[#00ADE5] to-[#0088cc]",
  "from-[#004080] to-[#00ADE5]",
  "from-[#002244] to-[#003366]",
  "from-[#0088cc] to-[#003366]",
  "from-[#004080] to-[#005a9e]",
];

function teamInitials(team) {
  const code = team?.shortCode?.trim();
  if (code) return code.slice(0, 2).toUpperCase();
  const name = team?.teamName ?? team?.name ?? "?";
  return name.slice(0, 2).toUpperCase();
}

function teamAvatarGradient(team) {
  const seed = team?.shortCode ?? team?.teamName ?? team?.name ?? "";
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash + seed.charCodeAt(i)) % TEAM_AVATAR_GRADIENTS.length;
  }
  return TEAM_AVATAR_GRADIENTS[hash];
}

/** For saveTeam: API may return populated venue objects; payload needs id strings. */
function normalizeVenueIdsForTeamSave(venueIds) {
  if (!Array.isArray(venueIds)) return [];
  return venueIds
    .map((v) => {
      if (v && typeof v === "object") {
        const oid = v._id ?? v.id;
        return oid != null ? String(oid) : "";
      }
      return String(v ?? "").trim();
    })
    .filter(Boolean);
}

/**
 * Tournament / division label for a team row.
 * API may populate `tournamentId` as `{ _id, tournamentName }` or send a plain id string.
 */
function teamTournamentOrDivisionLabel(t) {
  if (!t || typeof t !== "object") return "—";
  const tid = t.tournamentId;
  if (tid && typeof tid === "object") {
    const name =
      tid.tournamentName ??
      tid.divisionOrtournamentName ??
      tid.divisionOrTournamentName ??
      tid.name;
    if (name != null && String(name).trim() !== "") return String(name).trim();
    const oid = tid._id ?? tid.id;
    if (oid != null && String(oid).trim() !== "") return String(oid).trim();
    return "—";
  }
  const flatName =
    t.divisionOrtournamentName ??
    t.divisionOrTournamentName ??
    t.tournamentName ??
    t.tournamentDisplayName;
  if (flatName != null && String(flatName).trim() !== "")
    return String(flatName).trim();
  if (typeof tid === "string" && tid.trim() !== "") return tid.trim();
  if (tid != null && typeof tid !== "object") return String(tid);
  const divId = t.divisionOrTournamentId ?? t.tournamentID;
  if (divId != null && String(divId).trim() !== "") return String(divId).trim();
  return "—";
}

/** Venue list cell: API may populate `venueIds` as `{ _id, venueName }[]` or string ids. */
function formatTeamVenuesCell(venueIds) {
  if (!Array.isArray(venueIds) || venueIds.length === 0) return "—";
  const parts = venueIds.map((v) => {
    if (v && typeof v === "object") {
      const name = v.venueName ?? v.name;
      const id = v._id ?? v.id;
      if (name != null && String(name).trim() !== "") return String(name).trim();
      if (id != null && String(id).trim() !== "") return String(id).trim();
      return "";
    }
    if (v == null || v === "") return "";
    return String(v);
  }).filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
}

function teamNameInitials(name) {
  const parts = String(name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

function TeamCountButton({ competition, onViewTeams }) {
  const count = Number(competition.teams) || 0;

  return (
    <button
      type="button"
      onClick={() => onViewTeams(competition)}
      title="View teams in this division"
      className="group/count inline-flex items-center gap-1.5 rounded-lg border border-[#003366]/10 bg-white px-2 py-1 text-xs font-semibold text-[#003366] shadow-sm transition hover:border-[#00ADE5]/35 hover:bg-[#00ADE5]/5 focus:outline-none focus:ring-2 focus:ring-[#00ADE5]/20"
    >
      <UsersRound
        className="h-3.5 w-3.5 text-[#00ADE5] transition group-hover/count:text-[#003366]"
        strokeWidth={2.25}
      />
      <span>{count}</span>
    </button>
  );
}

function DivisionTeamsModal({ competition, onClose }) {
  if (!competition) return null;

  const names = competition.teamNames ?? [];
  const count = Number(competition.teams) || names.length;

  return (
    <Modal
      isOpen={Boolean(competition)}
      onClose={onClose}
      panelClassName="max-w-md"
      labelledBy="division-teams-title"
    >
      <div className="bg-gradient-to-r from-[#003366] to-[#004080] px-5 py-4 text-white sm:px-6 sm:py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 id="division-teams-title" className="truncate text-xl font-bold">
              {competition.name}
            </h3>
            <p className="mt-1 text-sm text-blue-100">
              {count} {count === 1 ? "team" : "teams"} in this division
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 transition hover:bg-white/20"
            aria-label="Close teams list"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="max-h-[min(50dvh,320px)] overflow-y-auto px-5 py-4 sm:px-6">
        {names.length > 0 ? (
          <ul className="space-y-2">
            {names.map((teamName, index) => (
              <li
                key={`${competition.id}-popup-team-${index}`}
                className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-2.5"
              >
                <span
                  className={clsx(
                    "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-xs font-bold text-white",
                    TEAM_AVATAR_GRADIENTS[index % TEAM_AVATAR_GRADIENTS.length]
                  )}
                >
                  {teamNameInitials(teamName)}
                </span>
                <span className="min-w-0 text-sm font-semibold text-gray-800">
                  {teamName}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center">
            <UsersRound className="mx-auto h-8 w-8 text-gray-300" />
            <p className="mt-2 text-sm font-medium text-gray-600">
              No teams assigned yet
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Use Manage to add teams to this division.
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 px-5 py-4 sm:px-6">
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}

/** Must match backend `filter` query param */
const TEAM_FILTER = {
  /** Default list: API uses empty `filter` query value */
  IN_DIVISION: "",
  NOT_IN_DIVISION: "not_in_division",
  OTHER_DIVISION: "other_division",
};

export default function Competitions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const manageDivisionId = searchParams.get("manage");
  const { tournaments, loading, error, fetchTournaments, saveTournament } =
    useTournament();
  const [competitions, setCompetitions] = useState([]);
  const [showCreateDivisionModal, setShowCreateDivisionModal] = useState(false);
  const [showMatchForm, setShowMatchForm] = useState(false);
  const [teamsViewCompetition, setTeamsViewCompetition] = useState(null);
  const [managingCompetition, setManagingCompetition] = useState(null);
  const [activeManageTab, setActiveManageTab] = useState("teams");
  const [activeTeamTab, setActiveTeamTab] = useState("existing");
  const [divisionForm, setDivisionForm] = useState(() => ({
    ...initialDivisionForm,
  }));
  const [divisionDetailLoading, setDivisionDetailLoading] = useState(false);
  const [divisionDetailError, setDivisionDetailError] = useState(null);
  const [divisionSaving, setDivisionSaving] = useState(false);
  const [divisionDeleting, setDivisionDeleting] = useState(false);
  const [divisionTeams, setDivisionTeams] = useState([]);
  const [summaryDivisionTeams, setSummaryDivisionTeams] = useState([]);
  const [divisionTeamsLoading, setDivisionTeamsLoading] = useState(false);
  const [summaryTeamsLoading, setSummaryTeamsLoading] = useState(false);
  const [divisionTeamsError, setDivisionTeamsError] = useState(null);
  const [bulkTeamRows, setBulkTeamRows] = useState(() => [emptyBulkTeamRow()]);
  const [bulkTeamsSaving, setBulkTeamsSaving] = useState(false);
  const [venueOptions, setVenueOptions] = useState([]);
  const [venuesLoading, setVenuesLoading] = useState(false);
  const [teamListFilter, setTeamListFilter] = useState(TEAM_FILTER.IN_DIVISION);
  const [selectedTeamIds, setSelectedTeamIds] = useState([]);
  const [addTeamsToDivisionLoading, setAddTeamsToDivisionLoading] =
    useState(false);
  const [showTeamEditModal, setShowTeamEditModal] = useState(false);
  const [teamEditForm, setTeamEditForm] = useState(emptyTeamEditForm);
  const [teamEditSaving, setTeamEditSaving] = useState(false);
  const [teamDetachLoadingId, setTeamDetachLoadingId] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.userId) fetchTournaments(user.userId);
  }, []);

  useEffect(() => {
    if (!Array.isArray(tournaments)) return;

    setCompetitions(
      tournaments.map((tournament, index) => {
        const divisionOrTournamentId = divisionIdFromTournamentRow(tournament);
        return {
          id: divisionOrTournamentId || `row-${index}`,
          divisionOrTournamentId,
          name:
            tournament.tournamentName ||
            tournament.divisionOrtournamentName ||
            tournament.name ||
            "Unnamed",
          shortCode:
            tournament.shortCode != null
              ? String(tournament.shortCode).trim()
              : "",
          type:
            tournament.tournamentType ||
            tournament.divisionOrTournamentType ||
            tournament.type ||
            "Division",
          season: tournament.season || "N/A",
          teams:
            tournament.teamCount ??
            tournament.teamsCount ??
            tournament.teams ??
            0,
          teamNames: Array.isArray(tournament.teamNames)
            ? tournament.teamNames.filter(
                (name) => name != null && String(name).trim() !== ""
              )
            : [],
          status: tournament.status || "Active",
        };
      })
    );
  }, [tournaments]);

  const handleCreateSuccess = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.userId) fetchTournaments(user.userId);
  };

  const handleDeleteDivision = async (competition = managingCompetition) => {
    if (!competition) return;

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user.userId;
    const divisionId = getManagedDivisionId(competition);
    const divisionName =
      competition.name ??
      competition.tournamentName ??
      divisionForm.divisionOrtournamentName ??
      "this division";

    if (!userId || !divisionId) {
      Swal.fire({
        icon: "error",
        title: "Cannot delete",
        text: "Missing user or division id. Refresh and try again.",
      });
      return;
    }

    const confirmation = await Swal.fire({
      icon: "warning",
      title: "Delete division?",
      text: `Are you sure you want to delete "${divisionName}"?`,
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#dc2626",
      cancelButtonText: "Cancel",
    });
    if (!confirmation.isConfirmed) return;

    setDivisionDeleting(true);
    try {
      await tournamentAPI.deleteById(divisionId, userId);

      setCompetitions((prev) =>
        prev.filter(
          (c) =>
            String(c.divisionOrTournamentId ?? c.id ?? "") !== String(divisionId)
        )
      );
      await fetchTournaments(userId, { force: true });
      setManagingCompetition(null);
      setActiveManageTab("teams");
      setActiveTeamTab("existing");

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Deleted",
        text: "Division deleted successfully.",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "Delete failed",
        text: e?.message || "Could not delete division.",
      });
    } finally {
      setDivisionDeleting(false);
    }
  };

  const openManageCompetition = useCallback((competition) => {
    const divId = getManagedDivisionId(competition);
    if (!divId) return false;
    setManagingCompetition(competition);
    setActiveManageTab("teams");
    setActiveTeamTab("existing");
    setDivisionForm({ ...initialDivisionForm });
    setDivisionDetailError(null);
    setBulkTeamRows([emptyBulkTeamRow()]);
    setDivisionTeams([]);
    setSummaryDivisionTeams([]);
    setDivisionTeamsError(null);
    setTeamListFilter(TEAM_FILTER.IN_DIVISION);
    setSelectedTeamIds([]);
    return true;
  }, []);

  const handleManage = (competition) => {
    if (!openManageCompetition(competition)) {
      Swal.fire({
        icon: "warning",
        title: "Missing division ID",
        text: "This row has no division id from the server. Refresh the list or check the API response.",
      });
    }
  };

  useEffect(() => {
    if (!manageDivisionId || managingCompetition || competitions.length === 0) {
      return;
    }
    const match = competitions.find(
      (competition) =>
        String(getManagedDivisionId(competition)) === String(manageDivisionId)
    );
    if (!match) return;

    openManageCompetition(match);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("manage");
    setSearchParams(nextParams, { replace: true });
  }, [
    manageDivisionId,
    managingCompetition,
    competitions,
    openManageCompetition,
    searchParams,
    setSearchParams,
  ]);

  const managingDivisionId = managingCompetition
    ? getManagedDivisionId(managingCompetition)
    : "";

  const showTournamentColumn =
    teamListFilter === TEAM_FILTER.IN_DIVISION;
  const showTeamDivisionColumn =
    teamListFilter !== TEAM_FILTER.IN_DIVISION;
  const showTeamActions = teamListFilter === TEAM_FILTER.IN_DIVISION;
  const teamTableColSpan = showTeamActions ? 8 : 7;

  useEffect(() => {
    setSelectedTeamIds([]);
  }, [teamListFilter]);

  const loadTeamsInDivision = useCallback(async () => {
    if (!managingDivisionId) return;
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const uid = user.userId;
    if (!uid) return;
    setDivisionTeamsLoading(true);
    setDivisionTeamsError(null);
    try {
      const res = await teamAPI.getByUserIdAndTournament(
        uid,
        managingDivisionId,
        { filter: teamListFilter }
      );
      if (res.errorCode === 0) {
        const raw = res.data;
        setDivisionTeams(
          Array.isArray(raw) ? raw : raw != null ? [raw] : []
        );
      } else {
        setDivisionTeamsError(
          res.errorMessage || "Could not load teams for this division."
        );
        setDivisionTeams([]);
      }
    } catch (e) {
      setDivisionTeamsError(
        e?.message || "Could not load teams for this division."
      );
      setDivisionTeams([]);
    } finally {
      setDivisionTeamsLoading(false);
    }
  }, [managingDivisionId, teamListFilter]);

  const loadSummaryDivisionTeams = useCallback(async () => {
    if (!managingDivisionId) return;
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const uid = user.userId;
    if (!uid) return;
    setSummaryTeamsLoading(true);
    try {
      const res = await teamAPI.getByUserIdAndTournament(
        uid,
        managingDivisionId,
        { filter: TEAM_FILTER.IN_DIVISION }
      );
      if (res.errorCode === 0) {
        const raw = res.data;
        setSummaryDivisionTeams(
          Array.isArray(raw) ? raw : raw != null ? [raw] : []
        );
      } else {
        setSummaryDivisionTeams([]);
      }
    } catch {
      setSummaryDivisionTeams([]);
    } finally {
      setSummaryTeamsLoading(false);
    }
  }, [managingDivisionId]);

  const refreshDivisionTeamLists = useCallback(async () => {
    await Promise.all([loadTeamsInDivision(), loadSummaryDivisionTeams()]);
  }, [loadTeamsInDivision, loadSummaryDivisionTeams]);

  useEffect(() => {
    if (!managingDivisionId || activeManageTab !== "teams") return;
    loadTeamsInDivision();
    loadSummaryDivisionTeams();
  }, [
    managingDivisionId,
    activeManageTab,
    loadTeamsInDivision,
    loadSummaryDivisionTeams,
  ]);

  useEffect(() => {
    if (!managingDivisionId || activeManageTab !== "teams") return;
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const uid = user.userId;
    if (!uid) return;
    let cancelled = false;
    (async () => {
      setVenuesLoading(true);
      try {
        const res = await venueAPI.getDetails(uid);
        if (cancelled) return;
        if (res.errorCode === 0) {
          const data = res.data;
          setVenueOptions(
            Array.isArray(data) ? data : data ? [data] : []
          );
        } else {
          setVenueOptions([]);
        }
      } catch {
        if (!cancelled) setVenueOptions([]);
      } finally {
        if (!cancelled) setVenuesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [managingDivisionId, activeManageTab]);

  useEffect(() => {
    if (!managingDivisionId || activeManageTab !== "division") return;
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user.userId;
    if (!userId) return;

    let cancelled = false;
    (async () => {
      setDivisionDetailLoading(true);
      setDivisionDetailError(null);
      try {
        const res = await tournamentAPI.getByUserId(userId, {
          divisionOrTournamentId: managingDivisionId,
        });
        if (cancelled) return;
        if (res.errorCode === 0) {
          const row = pickTournamentFromResponse(
            res.data,
            managingDivisionId
          );
          setDivisionForm(tournamentToDivisionForm(row));
        } else {
          setDivisionDetailError(
            res.errorMessage || "Could not load division details."
          );
        }
      } catch (e) {
        if (!cancelled) {
          setDivisionDetailError(
            e?.message || "Could not load division details."
          );
        }
      } finally {
        if (!cancelled) setDivisionDetailLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [managingDivisionId, activeManageTab]);

  const setDivisionField = (field, value) => {
    setDivisionForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleDivisionSave = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user.userId;
    const divisionId = getManagedDivisionId(managingCompetition);
    if (!userId || !divisionId) {
      Swal.fire({
        icon: "error",
        title: "Session",
        text: !userId
          ? "User not found. Please sign in again."
          : "Division id missing. Go back and open Manage again.",
      });
      return;
    }

    const name = divisionForm.divisionOrtournamentName?.trim();
    if (!name) {
      Swal.fire({
        icon: "warning",
        title: "Name required",
        text: "Please enter a division name.",
      });
      return;
    }

    const dateStr = divisionForm.hideMatchesFrom?.trim();
    const hideMatchesFrom =
      dateStr === "" || dateStr == null
        ? null
        : dateStr.includes("T")
          ? dateStr
          : `${dateStr}T00:00:00.000Z`;

    setDivisionSaving(true);
    try {
      const result = await saveTournament({
        userId,
        divisionOrTournamentId: divisionId,
        divisionOrtournamentName: name,
        divisionOrTournamentType: divisionForm.divisionOrTournamentType,
        sequence: divisionForm.sequence,
        shortCode: divisionForm.shortCode?.trim() ?? "",
        scoringSystem: divisionForm.scoringSystem,
        promotionZone: divisionForm.promotionZone,
        relegationZone: divisionForm.relegationZone,
        positionHighlights: divisionForm.positionHighlights,
        hideMatchesFrom,
        hideStandings: divisionForm.hideStandings,
        hidePlayers: divisionForm.hidePlayers,
        hideScore: divisionForm.hideScore,
        hideVenue: divisionForm.hideVenue,
      });

      if (result.success) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Saved",
          text: "Division settings updated.",
          timer: 2000,
          showConfirmButton: false,
        });
        await fetchTournaments(userId);
      } else {
        Swal.fire({
          icon: "error",
          title: "Save failed",
          text: result.error || "Could not save division.",
        });
      }
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: e?.message || "Could not save division.",
      });
    } finally {
      setDivisionSaving(false);
    }
  };

  const updateBulkTeamRow = (index, patch) => {
    setBulkTeamRows((rows) =>
      rows.map((r, i) => (i === index ? { ...r, ...patch } : r))
    );
  };

  const addBulkTeamRow = () =>
    setBulkTeamRows((rows) => [...rows, emptyBulkTeamRow()]);

  const removeBulkTeamRow = (index) =>
    setBulkTeamRows((rows) =>
      rows.length <= 1 ? rows : rows.filter((_, i) => i !== index)
    );

  const handleBulkSaveTeams = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user.userId;
    const tournamentId = managingDivisionId;
    if (!userId || !tournamentId) {
      Swal.fire({
        icon: "error",
        title: "Session",
        text: "Missing user or division.",
      });
      return;
    }

    const filled = bulkTeamRows.filter(
      (r) => r.teamName?.trim() && r.shortCode?.trim()
    );
    if (filled.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Add at least one team",
        text: "Enter team name and short code for each row you want to create.",
      });
      return;
    }

    if (filled.some((r) => !r.venueId?.trim())) {
      Swal.fire({
        icon: "warning",
        title: "Venue required",
        text: "Select a venue for each new team.",
      });
      return;
    }

    setBulkTeamsSaving(true);
    try {
      for (const row of filled) {
        await teamAPI.save({
          teamId: null,
          userId,
          tournamentId,
          tournamentIds: [tournamentId],
          teamName: row.teamName.trim(),
          displayName: (row.displayName || row.teamName).trim(),
          shortCode: row.shortCode.trim(),
          venueIds: [row.venueId.trim()],
          logo: null,
          about: null,
          isArchived: false,
          teamType: null,
          playersAgeCategory: null,
          upcomingSeason: null,
        });
      }
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Teams saved",
        text: `${filled.length} team(s) added to this division.`,
        timer: 2200,
        showConfirmButton: false,
      });
      setBulkTeamRows([emptyBulkTeamRow()]);
      await refreshDivisionTeamLists();
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "Save failed",
        text: e?.message || "Could not save one or more teams.",
      });
    } finally {
      setBulkTeamsSaving(false);
    }
  };

  const teamCheckboxesEnabled =
    teamListFilter !== TEAM_FILTER.IN_DIVISION;

  const toggleTeamRowSelected = (t) => {
    const id = teamRowId(t);
    if (!id) return;
    setSelectedTeamIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAddSelectedTeamsToDivision = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user.userId;
    const tournamentId = managingDivisionId;
    if (!userId || !tournamentId || selectedTeamIds.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Cannot add",
        text: "Missing user, division, or no teams selected.",
      });
      return;
    }
    const teamsToAdd = divisionTeams.filter((t) =>
      selectedTeamIds.includes(teamRowId(t))
    );
    if (teamsToAdd.length === 0) return;

    setAddTeamsToDivisionLoading(true);
    try {
      for (const t of teamsToAdd) {
        const tid = teamRowId(t);
        await teamAPI.save({
          ...t,
          teamId: tid,
          userId,
          tournamentId,
          venueIds: normalizeVenueIdsForTeamSave(t.venueIds),
        });
      }
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Teams updated",
        text: `${teamsToAdd.length} team(s) added to ${managingCompetition?.name ?? "this division"}.`,
        timer: 2200,
        showConfirmButton: false,
      });
      setSelectedTeamIds([]);
      await refreshDivisionTeamLists();
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "Save failed",
        text: e?.message || "Could not add teams to this division.",
      });
    } finally {
      setAddTeamsToDivisionLoading(false);
    }
  };

  const openEditTeam = (team) => {
    const id = teamRowId(team);
    if (!id) return;
    setTeamEditForm({
      teamId: id,
      teamName: team.teamName ?? team.name ?? "",
      displayName: team.displayName ?? "",
      shortCode: team.shortCode ?? "",
      venueId: firstVenueIdFromTeam(team),
      about: team.about ?? "",
      isArchived: Boolean(team.isArchived),
      teamType: team.teamType ?? "",
      playersAgeCategory: team.playersAgeCategory ?? "",
      upcomingSeason: team.upcomingSeason ?? "",
    });
    setShowTeamEditModal(true);
  };

  const closeEditTeam = () => {
    setShowTeamEditModal(false);
    setTeamEditForm(emptyTeamEditForm());
  };

  const handleSaveTeamEdit = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user.userId;
    const tournamentId = managingDivisionId;

    if (!userId || !tournamentId || !teamEditForm.teamId) {
      Swal.fire({
        icon: "error",
        title: "Cannot save",
        text: "Missing user, division, or team.",
      });
      return;
    }

    if (!teamEditForm.teamName?.trim() || !teamEditForm.shortCode?.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Validation",
        text: "Team name and short code are required.",
      });
      return;
    }

    if (!teamEditForm.venueId?.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Venue required",
        text: "Please select a venue for this team.",
      });
      return;
    }

    setTeamEditSaving(true);
    try {
      const result = await teamAPI.save({
        teamId: teamEditForm.teamId,
        userId,
        tournamentId,
        teamName: teamEditForm.teamName.trim(),
        displayName: (teamEditForm.displayName || teamEditForm.teamName).trim(),
        shortCode: teamEditForm.shortCode.trim(),
        venueIds: [teamEditForm.venueId.trim()],
        logo: null,
        about: teamEditForm.about?.trim() || null,
        isArchived: teamEditForm.isArchived,
        teamType: teamEditForm.teamType?.trim() || null,
        playersAgeCategory: teamEditForm.playersAgeCategory?.trim() || null,
        upcomingSeason: teamEditForm.upcomingSeason?.trim() || null,
      });

      if (result.errorCode !== 0) {
        throw new Error(result.errorMessage || "Failed to update team.");
      }

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Updated",
        text: "Team updated successfully.",
        timer: 2000,
        showConfirmButton: false,
      });
      closeEditTeam();
      await refreshDivisionTeamLists();
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "Save failed",
        text: e?.message || "Could not update team.",
      });
    } finally {
      setTeamEditSaving(false);
    }
  };

  const handleDetachTeam = async (team) => {
    const teamId = teamRowId(team);
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user.userId;
    const tournamentId = managingDivisionId;
    const teamName = team.teamName ?? team.name ?? "this team";

    if (!teamId || !userId || !tournamentId) {
      Swal.fire({
        icon: "error",
        title: "Cannot detach",
        text: "Missing user, division, or team id.",
      });
      return;
    }

    const confirmation = await Swal.fire({
      icon: "warning",
      title: "Detach team?",
      text: `Remove "${teamName}" from ${managingCompetition?.name ?? "this division"}? The team record will remain in your league.`,
      showCancelButton: true,
      confirmButtonText: "Detach",
      confirmButtonColor: "#dc2626",
      cancelButtonText: "Cancel",
    });
    if (!confirmation.isConfirmed) return;

    setTeamDetachLoadingId(teamId);
    try {
      const result = await teamAPI.detachFromDivision(
        teamId,
        userId,
        tournamentId
      );
      if (result.errorCode !== 0) {
        throw new Error(result.errorMessage || "Failed to detach team.");
      }

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Detached",
        text: `${teamName} removed from this division.`,
        timer: 2000,
        showConfirmButton: false,
      });
      await refreshDivisionTeamLists();
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "Detach failed",
        text: e?.message || "Could not detach team from division.",
      });
    } finally {
      setTeamDetachLoadingId(null);
    }
  };

  const venueOptionValue = (v) =>
    v?._id ?? v?.id ?? v?.venueId ?? "";
  const venueOptionLabel = (v) =>
    v?.name ?? v?.venueName ?? v?.title ?? "Venue";

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm transition focus:border-[#00ADE5] focus:outline-none focus:ring-2 focus:ring-[#00ADE5]/20";
  const selectClass = inputClass;
  const labelClass = "mb-2 block text-sm font-semibold text-gray-700";

  if (managingCompetition) {
    return (
      <div className="space-y-6">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#003366] via-[#004080] to-[#003366] shadow-lg shadow-[#003366]/25">
          <div className="relative px-6 py-6 sm:px-8 sm:py-8">
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#00ADE5]/20 blur-3xl" />
            <button
              type="button"
              onClick={() => {
                setManagingCompetition(null);
                setActiveManageTab("teams");
                setActiveTeamTab("existing");
              }}
              className="relative mb-5 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
              Back to competitions
            </button>
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00ADE5]">
                Managing competition
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {managingCompetition.name}
              </h1>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium text-white/95 backdrop-blur-sm">
                  {managingCompetition.type}
                </span>
                <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium text-white/95 backdrop-blur-sm">
                  Season {managingCompetition.season}
                </span>
                <span
                  className={clsx(
                    "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-sm",
                    managingCompetition.status === "Active"
                      ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-100"
                      : "border-amber-400/40 bg-amber-500/20 text-amber-100"
                  )}
                >
                  {managingCompetition.status}
                </span>
                {managingDivisionId ? (
                  <span
                    className="inline-flex max-w-full items-center rounded-full border border-[#00ADE5]/40 bg-black/20 px-3 py-1 font-mono text-[11px] font-medium text-[#00e5ff] backdrop-blur-sm sm:text-xs"
                    title="divisionOrTournamentId sent to API"
                  >
                    ID {managingDivisionId}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200/90 bg-gray-50/80 p-1.5 shadow-sm">
          <nav
            className="flex flex-wrap gap-1.5 sm:gap-2"
            aria-label="Competition management"
          >
            <button
              type="button"
              onClick={() => setActiveManageTab("teams")}
              className={clsx(
                tabBtn,
                activeManageTab === "teams"
                  ? "bg-white text-[#003366] shadow-sm ring-1 ring-gray-200/80"
                  : "text-gray-600 hover:bg-white/70 hover:text-gray-900"
              )}
            >
              <UsersRound className="h-4 w-4 text-[#00ADE5]" />
              Manage teams
            </button>
            <button
              type="button"
              onClick={() => setActiveManageTab("division")}
              className={clsx(
                tabBtn,
                activeManageTab === "division"
                  ? "bg-white text-[#003366] shadow-sm ring-1 ring-gray-200/80"
                  : "text-gray-600 hover:bg-white/70 hover:text-gray-900"
              )}
            >
              <Settings className="h-4 w-4 text-[#00ADE5]" />
              Division settings
            </button>
          </nav>
        </div>

        {activeManageTab === "teams" && (
          <div className="space-y-5">
            <nav
              aria-label="Team management views"
              className="grid grid-cols-1 gap-3 sm:grid-cols-2"
            >
              {TEAM_SUB_VIEWS.map((view) => {
                const Icon = view.icon;
                const isActive = activeTeamTab === view.id;
                return (
                  <button
                    key={view.id}
                    type="button"
                    onClick={() => setActiveTeamTab(view.id)}
                    aria-pressed={isActive}
                    className={clsx(
                      "group relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300",
                      isActive
                        ? clsx(
                            "border-transparent bg-white shadow-lg",
                            view.glow
                          )
                        : "border-gray-200/90 bg-white hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
                    )}
                  >
                    {isActive && (
                      <div
                        className={clsx(
                          "pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br opacity-[0.07]",
                          view.accent
                        )}
                        aria-hidden
                      />
                    )}
                    {isActive && (
                      <span
                        className={clsx(
                          "absolute right-4 top-4 h-2.5 w-2.5 rounded-full bg-gradient-to-br",
                          view.accent
                        )}
                        aria-hidden
                      />
                    )}
                    <div className="relative flex items-start gap-4">
                      <span
                        className={clsx(
                          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md transition-transform duration-300 group-hover:scale-105",
                          view.accent,
                          isActive ? "scale-105" : "opacity-90"
                        )}
                      >
                        <Icon className="h-5 w-5" strokeWidth={2.25} />
                      </span>
                      <div className="min-w-0 pt-0.5">
                        <p
                          className={clsx(
                            "text-base font-bold tracking-tight",
                            isActive ? "text-[#003366]" : "text-gray-800"
                          )}
                        >
                          {view.label}
                        </p>
                        <p className="mt-1 text-sm leading-snug text-gray-500">
                          {view.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>

            <div className="flex flex-col gap-6 lg:flex-row">
              <div className="min-w-0 flex-1">
                {activeTeamTab === "existing" && (
                  <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-gray-100 bg-gradient-to-r from-gray-50/80 to-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-[#003366]">
                          {teamListFilter === TEAM_FILTER.IN_DIVISION &&
                            "Teams in this division"}
                          {teamListFilter === TEAM_FILTER.NOT_IN_DIVISION &&
                            "Teams not in a division"}
                          {teamListFilter === TEAM_FILTER.OTHER_DIVISION &&
                            "Teams in another division"}
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                          Context:{" "}
                          <span className="font-medium text-gray-800">
                            {managingCompetition.name}
                          </span>
                          . Use the team filter below to change which list the
                          API returns.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => refreshDivisionTeamLists()}
                        disabled={divisionTeamsLoading}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-[#003366] shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
                      >
                        {divisionTeamsLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : null}
                        Refresh
                      </button>
                    </div>
                    <div className="p-6">
                      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div className="min-w-0 flex-1 sm:max-w-md">
                          <label
                            className={`${labelClass} flex items-center gap-2`}
                          >
                            <Filter className="h-4 w-4 text-[#00ADE5]" />
                            Team filter
                          </label>
                          <select
                            className={selectClass}
                            value={teamListFilter}
                            onChange={(e) =>
                              setTeamListFilter(e.target.value)
                            }
                          >
                            <option value={TEAM_FILTER.IN_DIVISION}>
                              Teams in this division
                            </option>
                            <option value={TEAM_FILTER.NOT_IN_DIVISION}>
                              Teams not in a division
                            </option>
                            <option value={TEAM_FILTER.OTHER_DIVISION}>
                              Teams in another division
                            </option>
                          </select>
                          <p className="mt-1.5 text-xs leading-snug text-gray-500">
                            {teamListFilter === TEAM_FILTER.IN_DIVISION &&
                              "Only teams assigned to this division (same as before)."}
                            {teamListFilter === TEAM_FILTER.NOT_IN_DIVISION &&
                              "Teams that are not linked to any division yet."}
                            {teamListFilter === TEAM_FILTER.OTHER_DIVISION &&
                              "Teams linked to other divisions, not this one."}
                          </p>
                        </div>
                      </div>

                      {teamCheckboxesEnabled && selectedTeamIds.length > 0 ? (
                        <div className="mb-4 flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            onClick={handleAddSelectedTeamsToDivision}
                            disabled={
                              addTeamsToDivisionLoading ||
                              selectedTeamIds.length === 0
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#003366] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#003366]/20 transition hover:bg-[#00264d] disabled:opacity-50"
                          >
                            {addTeamsToDivisionLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : null}
                            Add to division
                          </button>
                          <span className="text-sm text-gray-600">
                            {selectedTeamIds.length} team
                            {selectedTeamIds.length === 1 ? "" : "s"} selected
                          </span>
                        </div>
                      ) : null}

                      {divisionTeamsError && (
                        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                          {divisionTeamsError}
                        </div>
                      )}
                      <div className="overflow-x-auto rounded-xl border border-gray-100">
                        <table className="min-w-full divide-y divide-gray-100">
                          <thead className="bg-[#003366]/[0.04]">
                            <tr>
                              <th
                                scope="col"
                                className="w-12 px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-[#003366] sm:px-4"
                              >
                                <span className="sr-only">Select</span>
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-[#003366] sm:px-6">
                                Team
                              </th>
                              {showTournamentColumn ? (
                                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-[#003366] sm:px-6">
                                  Tournament
                                </th>
                              ) : null}
                              {showTeamDivisionColumn ? (
                                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-[#003366] sm:px-6">
                                  Division / assignment
                                </th>
                              ) : null}
                              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-[#003366] sm:px-6">
                                Display name
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-[#003366] sm:px-6">
                                Short code
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-[#003366] sm:px-6">
                                Venues
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-[#003366] sm:px-6">
                                Status
                              </th>
                              {showTeamActions ? (
                                <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-[#003366] sm:px-6">
                                  Actions
                                </th>
                              ) : null}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 bg-white">
                            {divisionTeamsLoading && divisionTeams.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={teamTableColSpan}
                                  className="px-6 py-12 text-center text-sm text-gray-500"
                                >
                                  <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-[#00ADE5]" />
                                  Loading teams…
                                </td>
                              </tr>
                            ) : divisionTeams.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={teamTableColSpan}
                                  className="px-6 py-10 text-center text-sm text-gray-600"
                                >
                                  {teamListFilter === TEAM_FILTER.IN_DIVISION && (
                                    <>
                                      No teams in this division yet. Use{" "}
                                      <span className="font-semibold">
                                        Create new teams
                                      </span>{" "}
                                      to add some.
                                    </>
                                  )}
                                  {teamListFilter ===
                                    TEAM_FILTER.NOT_IN_DIVISION && (
                                    <>
                                      No unassigned teams returned. Try another
                                      filter or refresh.
                                    </>
                                  )}
                                  {teamListFilter ===
                                    TEAM_FILTER.OTHER_DIVISION && (
                                    <>
                                      No teams from other divisions returned.
                                      Try another filter or refresh.
                                    </>
                                  )}
                                </td>
                              </tr>
                            ) : (
                              divisionTeams.map((t, idx) => {
                                const rowId = teamRowId(t);
                                const canCheck =
                                  teamCheckboxesEnabled && Boolean(rowId);
                                return (
                                  <tr
                                    key={teamRecordKey(t, idx)}
                                    className="transition hover:bg-gray-50/80"
                                  >
                                    <td className="w-12 px-3 py-3 sm:px-4">
                                      <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-[#003366] focus:ring-[#00ADE5] disabled:cursor-not-allowed disabled:opacity-40"
                                        disabled={!canCheck}
                                        checked={
                                          canCheck &&
                                          selectedTeamIds.includes(rowId)
                                        }
                                        onChange={() =>
                                          toggleTeamRowSelected(t)
                                        }
                                        aria-label={`Select ${t.teamName ?? t.name ?? "team"}`}
                                      />
                                    </td>
                                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 sm:px-6">
                                      {t.teamName ?? t.name ?? "—"}
                                    </td>
                                    {showTournamentColumn ? (
                                      <td className="max-w-xs px-4 py-3 text-sm text-gray-700 sm:px-6">
                                        {teamTournamentOrDivisionLabel(t)}
                                      </td>
                                    ) : null}
                                    {showTeamDivisionColumn ? (
                                      <td className="max-w-xs px-4 py-3 text-sm text-gray-700 sm:px-6">
                                        {teamTournamentOrDivisionLabel(t)}
                                      </td>
                                    ) : null}
                                    <td className="px-4 py-3 text-sm text-gray-700 sm:px-6">
                                      {t.displayName ?? "—"}
                                    </td>
                                    <td className="px-4 py-3 font-mono text-sm text-gray-600 sm:px-6">
                                      {t.shortCode ?? "—"}
                                    </td>
                                    <td className="max-w-xs px-4 py-3 text-xs text-gray-600 sm:px-6">
                                      {formatTeamVenuesCell(t.venueIds)}
                                    </td>
                                    <td className="px-4 py-3 sm:px-6">
                                      {t.isArchived ? (
                                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
                                          Archived
                                        </span>
                                      ) : (
                                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                                          Active
                                        </span>
                                      )}
                                    </td>
                                    {showTeamActions ? (
                                      <td className="px-4 py-3 sm:px-6">
                                        <div className="flex justify-center gap-1">
                                          <button
                                            type="button"
                                            onClick={() => openEditTeam(t)}
                                            className="rounded-md p-1.5 text-blue-600 transition hover:bg-blue-50"
                                            title="Edit team"
                                            aria-label={`Edit ${t.teamName ?? t.name ?? "team"}`}
                                          >
                                            <Edit2 size={18} />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleDetachTeam(t)}
                                            disabled={teamDetachLoadingId === rowId}
                                            className="rounded-md p-1.5 text-amber-700 transition hover:bg-amber-50 disabled:opacity-50"
                                            title="Detach from division"
                                            aria-label={`Detach ${t.teamName ?? t.name ?? "team"}`}
                                          >
                                            {teamDetachLoadingId === rowId ? (
                                              <Loader2
                                                size={18}
                                                className="animate-spin"
                                              />
                                            ) : (
                                              <Unlink size={18} />
                                            )}
                                          </button>
                                        </div>
                                      </td>
                                    ) : null}
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {activeTeamTab === "create" && (
                  <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
                    <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50/80 to-white px-6 py-4">
                      <h2 className="text-lg font-bold text-[#003366]">
                        Create teams in bulk
                      </h2>
                      <p className="mt-1 text-sm text-gray-600">
                        Team name, short code, and venue are required for each
                        row you want to create. Venues come from Setup → Venues.
                      </p>
                      {venuesLoading && (
                        <p className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Loading venues…
                        </p>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="overflow-x-auto rounded-xl border border-gray-100">
                        <table className="min-w-full divide-y divide-gray-100">
                          <thead className="bg-[#003366]/[0.04]">
                            <tr>
                              <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-[#003366]">
                                #
                              </th>
                              <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-[#003366]">
                                Team name{" "}
                                <span className="text-red-500">*</span>
                              </th>
                              <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-[#003366]">
                                Display name
                              </th>
                              <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-[#003366]">
                                Short code{" "}
                                <span className="text-red-500">*</span>
                              </th>
                              <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-[#003366]">
                                Venue <span className="text-red-500">*</span>
                              </th>
                              <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-[#003366] w-24">
                                {" "}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {bulkTeamRows.map((row, index) => (
                              <tr
                                key={`bulk-${index}`}
                                className="transition hover:bg-gray-50/80"
                              >
                                <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">
                                  {index + 1}
                                </td>
                                <td className="min-w-[140px] px-3 py-2">
                                  <input
                                    type="text"
                                    value={row.teamName}
                                    onChange={(e) =>
                                      updateBulkTeamRow(index, {
                                        teamName: e.target.value,
                                      })
                                    }
                                    placeholder="Full team name"
                                    className={inputClass}
                                  />
                                </td>
                                <td className="min-w-[120px] px-3 py-2">
                                  <input
                                    type="text"
                                    value={row.displayName}
                                    onChange={(e) =>
                                      updateBulkTeamRow(index, {
                                        displayName: e.target.value,
                                      })
                                    }
                                    placeholder="Shorter label"
                                    className={inputClass}
                                  />
                                </td>
                                <td className="min-w-[100px] px-3 py-2">
                                  <input
                                    type="text"
                                    value={row.shortCode}
                                    onChange={(e) =>
                                      updateBulkTeamRow(index, {
                                        shortCode: e.target.value.toUpperCase(),
                                      })
                                    }
                                    placeholder="e.g. TEAM01"
                                    className={`${inputClass} font-mono text-sm`}
                                  />
                                </td>
                                <td className="min-w-[180px] px-3 py-2">
                                  <select
                                    className={selectClass}
                                    value={row.venueId}
                                    onChange={(e) =>
                                      updateBulkTeamRow(index, {
                                        venueId: e.target.value,
                                      })
                                    }
                                  >
                                    <option value="">
                                      {venueOptions.length === 0
                                        ? "No venues — add in Setup → Venues"
                                        : "Select venue"}
                                    </option>
                                    {venueOptions.map((v) => {
                                      const vid = venueOptionValue(v);
                                      if (!vid) return null;
                                      return (
                                        <option key={vid} value={vid}>
                                          {venueOptionLabel(v)}
                                        </option>
                                      );
                                    })}
                                  </select>
                                </td>
                                <td className="px-3 py-2">
                                  <button
                                    type="button"
                                    onClick={() => removeBulkTeamRow(index)}
                                    disabled={bulkTeamRows.length <= 1}
                                    className="text-sm font-semibold text-red-600 hover:text-red-800 disabled:opacity-30"
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={addBulkTeamRow}
                          className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
                        >
                          <Plus className="h-4 w-4" />
                          Add row
                        </button>
                      </div>

                      <div className="mt-6 flex flex-wrap gap-3 border-t border-gray-100 pt-6">
                        <button
                          type="button"
                          disabled={bulkTeamsSaving}
                          onClick={handleBulkSaveTeams}
                          className="inline-flex items-center gap-2 rounded-xl bg-[#00ADE5] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#00ADE5]/25 transition hover:bg-[#0099c7] disabled:opacity-50"
                        >
                          {bulkTeamsSaving ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Saving…
                            </>
                          ) : (
                            "Create teams"
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setManagingCompetition(null)}
                          className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <aside className="w-full shrink-0 lg:w-80 xl:w-[22rem]">
                <div className="sticky top-4 overflow-hidden rounded-2xl border border-gray-200/90 shadow-lg shadow-[#003366]/10">
                  <div className="relative overflow-hidden bg-gradient-to-br from-[#003366] via-[#004080] to-[#003366] px-5 py-5 text-white">
                    <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#00ADE5]/25 blur-2xl" />
                    <div className="pointer-events-none absolute -bottom-6 left-4 h-20 w-20 rounded-full bg-white/10 blur-xl" />
                    <div className="relative flex items-start gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm">
                        <Shield className="h-5 w-5 text-[#00ADE5]" strokeWidth={2.25} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#00ADE5]">
                          <Sparkles className="h-3 w-3" />
                          Division roster
                        </p>
                        <h3 className="mt-1 truncate text-lg font-bold leading-tight">
                          {managingCompetition.name}
                        </h3>
                      </div>
                    </div>
                    <div className="relative mt-4 flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
                        <span
                          className="absolute inset-0 rounded-full border-2 border-[#00ADE5]/40"
                          aria-hidden
                        />
                        <span className="text-xl font-bold tabular-nums">
                          {summaryTeamsLoading && summaryDivisionTeams.length === 0
                            ? "—"
                            : summaryDivisionTeams.length}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {summaryDivisionTeams.length === 1
                            ? "Team assigned"
                            : "Teams assigned"}
                        </p>
                        <p className="text-xs text-white/70">
                          Live roster · edit or detach anytime
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-b from-slate-50/90 to-white p-4">
                    {summaryTeamsLoading && summaryDivisionTeams.length === 0 ? (
                      <div className="space-y-3 py-2">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="flex animate-pulse items-center gap-3 rounded-xl border border-gray-100 bg-white p-3"
                          >
                            <div className="h-10 w-10 rounded-xl bg-gray-200" />
                            <div className="flex-1 space-y-2">
                              <div className="h-3 w-3/4 rounded bg-gray-200" />
                              <div className="h-2 w-1/3 rounded bg-gray-100" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : summaryDivisionTeams.length === 0 ? (
                      <div className="flex flex-col items-center rounded-2xl border border-dashed border-[#00ADE5]/30 bg-[#00ADE5]/[0.04] px-4 py-10 text-center">
                        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#003366]/10 to-[#00ADE5]/20">
                          <UsersRound className="h-7 w-7 text-[#00ADE5]" />
                        </span>
                        <p className="mt-4 text-sm font-bold text-[#003366]">
                          No teams yet
                        </p>
                        <p className="mt-1 max-w-[14rem] text-xs leading-relaxed text-gray-500">
                          Add from the left panel or create new teams — they&apos;ll
                          appear here instantly.
                        </p>
                      </div>
                    ) : (
                      <ul className="max-h-[min(58vh,26rem)] space-y-2.5 overflow-y-auto pr-0.5 [scrollbar-width:thin]">
                        {summaryDivisionTeams.map((t, idx) => {
                          const rowId = teamRowId(t);
                          const teamName =
                            t.teamName ?? t.name ?? "Unnamed team";
                          const isDetaching = teamDetachLoadingId === rowId;
                          return (
                            <li
                              key={teamRecordKey(t, idx)}
                              className="group relative overflow-hidden rounded-xl border border-gray-100/90 bg-white p-3 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#00ADE5]/25 hover:shadow-md hover:shadow-[#00ADE5]/10"
                            >
                              <div
                                className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#003366] to-[#00ADE5] opacity-0 transition group-hover:opacity-100"
                                aria-hidden
                              />
                              <div className="flex items-center gap-3">
                                <span
                                  className={clsx(
                                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-xs font-bold text-white shadow-sm",
                                    teamAvatarGradient(t)
                                  )}
                                >
                                  {teamInitials(t)}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-bold text-[#003366]">
                                    {teamName}
                                  </p>
                                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                    <span className="inline-flex rounded-md bg-[#003366]/[0.06] px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-[#003366]">
                                      {t.shortCode ?? "—"}
                                    </span>
                                    {t.isArchived ? (
                                      <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600">
                                        Archived
                                      </span>
                                    ) : (
                                      <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                                        Active
                                      </span>
                                    )}
                                  </div>
                                  {t.displayName &&
                                  t.displayName !== teamName ? (
                                    <p className="mt-1 truncate text-[11px] text-gray-500">
                                      {t.displayName}
                                    </p>
                                  ) : null}
                                </div>
                                <div className="flex shrink-0 flex-col gap-1 rounded-xl border border-gray-100 bg-gray-50/80 p-1 opacity-90 transition group-hover:border-[#00ADE5]/20 group-hover:bg-white">
                                  <button
                                    type="button"
                                    onClick={() => openEditTeam(t)}
                                    className="rounded-lg p-1.5 text-[#0088cc] transition hover:bg-[#00ADE5]/10 hover:text-[#003366]"
                                    title="Edit team"
                                    aria-label={`Edit ${teamName}`}
                                  >
                                    <Edit2 size={15} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDetachTeam(t)}
                                    disabled={isDetaching}
                                    className="rounded-lg p-1.5 text-amber-600 transition hover:bg-amber-50 hover:text-amber-800 disabled:opacity-50"
                                    title="Detach from division"
                                    aria-label={`Detach ${teamName}`}
                                  >
                                    {isDetaching ? (
                                      <Loader2
                                        size={15}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <Unlink size={15} />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        )}

        {activeManageTab === "division" && (
          <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-gray-100 bg-gradient-to-r from-gray-50/80 to-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#003366]">
                  Division settings
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Details load when you open this tab; save to apply changes to
                  your league site.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteDivision()}
                disabled={divisionDeleting || divisionDetailLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {divisionDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete division
              </button>
            </div>

            {divisionDetailError && (
              <div className="border-b border-red-100 bg-red-50 px-6 py-3 text-sm text-red-800">
                {divisionDetailError}
              </div>
            )}

            <div className="relative p-6 sm:p-8">
              {divisionDetailLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Loader2 className="h-8 w-8 animate-spin text-[#00ADE5]" />
                    <span className="text-sm font-medium">Loading division…</span>
                  </div>
                </div>
              )}

              <div className="space-y-8">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>Division name</label>
                    <input
                      type="text"
                      value={divisionForm.divisionOrtournamentName}
                      onChange={(e) =>
                        setDivisionField(
                          "divisionOrtournamentName",
                          e.target.value
                        )
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Type</label>
                    <select
                      className={selectClass}
                      value={divisionForm.divisionOrTournamentType}
                      onChange={(e) =>
                        setDivisionField(
                          "divisionOrTournamentType",
                          e.target.value
                        )
                      }
                    >
                      <option value="Division">Division</option>
                      <option value="Tournament">Tournament</option>
                      <option value="League">League</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Sequence</label>
                    <input
                      type="number"
                      min={0}
                      value={divisionForm.sequence}
                      onChange={(e) =>
                        setDivisionField(
                          "sequence",
                          Number(e.target.value) || 0
                        )
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Short code</label>
                    <input
                      type="text"
                      value={divisionForm.shortCode}
                      onChange={(e) =>
                        setDivisionField("shortCode", e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Scoring system</label>
                    <div className="rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3 text-sm text-gray-600">
                      {divisionForm.scoringSystem == null ||
                      divisionForm.scoringSystem === ""
                        ? "Default / not set (null in API)"
                        : typeof divisionForm.scoringSystem === "object"
                          ? JSON.stringify(divisionForm.scoringSystem)
                          : String(divisionForm.scoringSystem)}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5 sm:p-6">
                  <h3 className="text-base font-bold text-[#003366]">
                    Promotion and relegation
                  </h3>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>Promotion zone (count)</label>
                      <input
                        type="number"
                        min={0}
                        value={divisionForm.promotionZone}
                        onChange={(e) =>
                          setDivisionField(
                            "promotionZone",
                            Number(e.target.value) || 0
                          )
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Relegation zone (count)</label>
                      <input
                        type="number"
                        min={0}
                        value={divisionForm.relegationZone}
                        onChange={(e) =>
                          setDivisionField(
                            "relegationZone",
                            Number(e.target.value) || 0
                          )
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Shown on public standings for this season when configured.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#003366]">
                    Position highlights
                  </h3>
                  <div className="mt-4 space-y-3">
                    <div className="flex flex-wrap gap-6">
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="radio"
                          name="positionHighlights"
                          checked={divisionForm.positionHighlights === "auto"}
                          onChange={() =>
                            setDivisionField("positionHighlights", "auto")
                          }
                          className="border-gray-300 text-[#00ADE5] focus:ring-[#00ADE5]"
                        />
                        <span className="text-sm font-medium text-gray-800">
                          Auto
                        </span>
                      </label>
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="radio"
                          name="positionHighlights"
                          checked={divisionForm.positionHighlights === "manual"}
                          onChange={() =>
                            setDivisionField("positionHighlights", "manual")
                          }
                          className="border-gray-300 text-[#00ADE5] focus:ring-[#00ADE5]"
                        />
                        <span className="text-sm font-medium text-gray-800">
                          Manual
                        </span>
                      </label>
                    </div>
                    <p className="text-sm leading-relaxed text-gray-600">
                      Let the system detect champion / promoted / relegated teams,
                      or set them manually for this season.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 rounded-2xl border border-gray-100 p-5 sm:p-6">
                  <h3 className="text-base font-bold text-[#003366]">
                    Visibility on public site
                  </h3>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <label className="text-sm font-semibold text-gray-700 sm:w-40">
                      Hide matches from
                    </label>
                    <input
                      type="date"
                      value={divisionForm.hideMatchesFrom}
                      onChange={(e) =>
                        setDivisionField("hideMatchesFrom", e.target.value)
                      }
                      className={`${inputClass} sm:max-w-xs`}
                    />
                    {!divisionForm.hideMatchesFrom && (
                      <span className="text-sm text-amber-700">Not set</span>
                    )}
                  </div>
                  <div className="space-y-3 border-t border-gray-100 pt-4">
                    {[
                      {
                        key: "hideStandings",
                        label: "Hide the table / standings on the public pages",
                      },
                      { key: "hidePlayers", label: "Hide players" },
                      {
                        key: "hideScore",
                        label: "Automatically hide results on the public pages",
                      },
                      {
                        key: "hideVenue",
                        label: "Automatically hide venues on the public pages",
                      },
                    ].map(({ key, label }) => (
                      <label
                        key={key}
                        className="flex cursor-pointer items-start gap-3 rounded-lg p-2 transition hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={divisionForm[key]}
                          onChange={(e) =>
                            setDivisionField(key, e.target.checked)
                          }
                          className="mt-0.5 rounded border-gray-300 text-[#00ADE5] focus:ring-[#00ADE5]"
                        />
                        <span className="text-sm text-gray-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-6">
                  <button
                    type="button"
                    disabled={divisionSaving || divisionDetailLoading}
                    onClick={handleDivisionSave}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#00ADE5] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#00ADE5]/25 transition hover:bg-[#0099c7] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {divisionSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      "Save changes"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setManagingCompetition(null)}
                    className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <Modal
          isOpen={showTeamEditModal}
          onClose={closeEditTeam}
          innerScroll
          panelClassName="flex max-w-2xl flex-col"
          labelledBy="edit-team-title"
        >
              <div className="shrink-0 bg-gradient-to-r from-[#003366] to-[#004080] px-4 py-4 text-white sm:px-6 sm:py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 id="edit-team-title" className="text-xl font-bold">
                      Edit team
                    </h3>
                    <p className="text-xs text-blue-100">
                      Update team details for this division
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeEditTeam}
                    className="rounded-lg p-2 text-white hover:bg-white/20"
                    aria-label="Close edit team"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={labelClass}>
                    Team name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={teamEditForm.teamName}
                    onChange={(e) =>
                      setTeamEditForm((prev) => ({
                        ...prev,
                        teamName: e.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Display name</label>
                  <input
                    type="text"
                    value={teamEditForm.displayName}
                    onChange={(e) =>
                      setTeamEditForm((prev) => ({
                        ...prev,
                        displayName: e.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Short code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={teamEditForm.shortCode}
                    onChange={(e) =>
                      setTeamEditForm((prev) => ({
                        ...prev,
                        shortCode: e.target.value.toUpperCase(),
                      }))
                    }
                    className={`${inputClass} font-mono`}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>
                    Venue <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={selectClass}
                    value={teamEditForm.venueId}
                    onChange={(e) =>
                      setTeamEditForm((prev) => ({
                        ...prev,
                        venueId: e.target.value,
                      }))
                    }
                  >
                    <option value="">
                      {venueOptions.length === 0
                        ? "No venues — add in Setup → Venues"
                        : "Select venue"}
                    </option>
                    {venueOptions.map((v) => {
                      const vid = venueOptionValue(v);
                      if (!vid) return null;
                      return (
                        <option key={vid} value={vid}>
                          {venueOptionLabel(v)}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Team type</label>
                  <input
                    type="text"
                    value={teamEditForm.teamType}
                    onChange={(e) =>
                      setTeamEditForm((prev) => ({
                        ...prev,
                        teamType: e.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Players age category</label>
                  <input
                    type="text"
                    value={teamEditForm.playersAgeCategory}
                    onChange={(e) =>
                      setTeamEditForm((prev) => ({
                        ...prev,
                        playersAgeCategory: e.target.value,
                      }))
                    }
                    placeholder="e.g. Under 13"
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Upcoming season</label>
                  <input
                    type="text"
                    value={teamEditForm.upcomingSeason}
                    onChange={(e) =>
                      setTeamEditForm((prev) => ({
                        ...prev,
                        upcomingSeason: e.target.value,
                      }))
                    }
                    placeholder="e.g. 2025/2026"
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>About</label>
                  <textarea
                    rows={3}
                    value={teamEditForm.about}
                    onChange={(e) =>
                      setTeamEditForm((prev) => ({
                        ...prev,
                        about: e.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700 sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={teamEditForm.isArchived}
                    onChange={(e) =>
                      setTeamEditForm((prev) => ({
                        ...prev,
                        isArchived: e.target.checked,
                      }))
                    }
                  />
                  Archived
                </label>
              </div>

              <div className="flex shrink-0 justify-end gap-3 border-t px-4 py-4 sm:px-6">
                <button
                  type="button"
                  onClick={closeEditTeam}
                  className="rounded-xl border-2 border-gray-300 px-5 py-2.5 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveTeamEdit}
                  disabled={teamEditSaving}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#003366] to-[#004080] px-5 py-2.5 font-semibold text-white hover:from-[#002244] hover:to-[#003366] disabled:opacity-50"
                >
                  {teamEditSaving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  Save changes
                </button>
              </div>
        </Modal>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SetupTabHeader
        title="Competitions"
        description="Divisions and tournaments for your season. Create a competition, then use Manage to add teams and fine-tune how it appears on your site."
      >
        <SetupPrimaryButton
          onClick={() => setShowCreateDivisionModal(true)}
          icon={Plus}
        >
          Create division
        </SetupPrimaryButton>
        <SetupSecondaryButton
          onClick={() => setShowMatchForm(true)}
          icon={Calendar}
        >
          Create match
        </SetupSecondaryButton>
      </SetupTabHeader>

      {error && (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {error}
        </div>
      )}

      <CreateDivisionModal
        isOpen={showCreateDivisionModal}
        onClose={() => setShowCreateDivisionModal(false)}
        onSuccess={handleCreateSuccess}
      />

      <CreateMatchModal
        isOpen={showMatchForm}
        onClose={() => setShowMatchForm(false)}
        competitions={competitions}
      />

      <DivisionTeamsModal
        competition={teamsViewCompetition}
        onClose={() => setTeamsViewCompetition(null)}
      />

      <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
        <div className="flex flex-col gap-1 border-b border-gray-100 bg-gradient-to-r from-[#003366]/[0.06] to-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-bold text-[#003366]">Your competitions</h2>
          <p className="text-xs text-gray-500">
            Manage teams, standings, and division rules per row.
          </p>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-500">
              <Loader2 className="h-9 w-9 animate-spin text-[#00ADE5]" />
              <span className="text-sm font-medium">Loading competitions…</span>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr className="bg-[#003366]/[0.04] text-left">
                  <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wide text-[#003366]">
                    Name
                  </th>
                  <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wide text-[#003366]">
                    Type
                  </th>
                  <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wide text-[#003366]">
                    Season
                  </th>
                  <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wide text-[#003366]">
                    Teams
                  </th>
                  <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wide text-[#003366]">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wide text-[#003366]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {competitions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="mx-auto max-w-md">
                        <p className="text-base font-semibold text-gray-900">
                          No competitions yet
                        </p>
                        <p className="mt-2 text-sm text-gray-600">
                          Create your first division or tournament to start
                          scheduling matches and assigning teams.
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowCreateDivisionModal(true)}
                          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#00ADE5] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#00ADE5]/20 transition hover:bg-[#0099c7]"
                        >
                          <Plus className="h-4 w-4" />
                          Create division
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  competitions.map((competition) => (
                    <tr
                      key={competition.id}
                      className="group transition hover:bg-[#003366]/[0.02]"
                    >
                      <td className="max-w-xs px-6 py-5">
                        <div className="flex items-start gap-3">
                          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#003366] to-[#004080] text-xs font-bold text-white shadow-lg shadow-[#003366]/20 transition group-hover:scale-105">
                            {(competition.shortCode || competition.name || "—")
                              .slice(0, 3)
                              .toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-gray-900">
                              {competition.name}
                            </div>
                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                              {competition.shortCode ? (
                                <span className="inline-flex rounded-md border border-[#00ADE5]/20 bg-[#00ADE5]/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-[#003366]">
                                  {competition.shortCode}
                                </span>
                              ) : null}
                              {competition.divisionOrTournamentId ? (
                                <span
                                  className="truncate font-mono text-[10px] text-gray-400"
                                  title={competition.divisionOrTournamentId}
                                >
                                  {competition.divisionOrTournamentId.slice(0, 8)}…
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-5">
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#003366]/10 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#003366] shadow-sm">
                          <Layers className="h-3.5 w-3.5 text-[#00ADE5]" />
                          {competition.type}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-5">
                        <span className="inline-flex rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-600 ring-1 ring-gray-100">
                          {competition.season}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-5">
                        <TeamCountButton
                          competition={competition}
                          onViewTeams={setTeamsViewCompetition}
                        />
                      </td>
                      <td className="whitespace-nowrap px-6 py-5">
                        <span
                          className={clsx(
                            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
                            competition.status === "Active"
                              ? "bg-[#00ADE5]/15 text-[#003366] ring-1 ring-[#00ADE5]/25"
                              : "bg-amber-50 text-amber-800 ring-1 ring-amber-200"
                          )}
                        >
                          <span
                            className={clsx(
                              "h-1.5 w-1.5 rounded-full",
                              competition.status === "Active"
                                ? "bg-[#00ADE5]"
                                : "bg-amber-500"
                            )}
                          />
                          {competition.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-5 text-right align-top">
                        <div className="flex flex-wrap justify-end gap-2">
                          <button
                            type="button"
                            disabled={!competition.divisionOrTournamentId}
                            title={
                              competition.divisionOrTournamentId
                                ? `Manage division ${competition.divisionOrTournamentId}`
                                : "No division id from server"
                            }
                            onClick={() => handleManage(competition)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#003366] px-3.5 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#004080] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Settings className="h-3.5 w-3.5" />
                            Manage
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteDivision(competition)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
