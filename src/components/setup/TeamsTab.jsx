import { useEffect, useMemo, useRef, useState } from "react";
import Select from "react-select";
import {
  Users,
  Plus,
  Save,
  X,
  MapPin,
  Loader2,
  Layers,
  Edit2,
  Trash2,
  Unlink,
  UserRound,
  KeyRound,
  Shield,
} from "lucide-react";
import Swal from "sweetalert2";
import Modal from "../Modal";
import {
  CountBadgeButton,
  ListViewModal,
  ListItemCard,
  itemInitials,
  ITEM_AVATAR_GRADIENTS,
} from "./CountViewModal";
import clsx from "clsx";
import { teamAPI, tournamentAPI, venueAPI, playerAPI } from "../../services/api";
import { useCompanyContext } from "../../context/CompanyContext";
import FieldAvailabilityHint, {
  getFieldCheckInputClass,
} from "../FieldAvailabilityHint";
import { useCompanyUserFieldCheck } from "../../hooks/useCompanyUserFieldCheck";
import SetupTabHeader, { SetupPrimaryButton } from "./SetupTabHeader";

const divisionSelectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: 42,
    borderRadius: 8,
    borderColor: state.isFocused ? "#00ADE5" : "#d1d5db",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(0, 173, 229, 0.2)" : "none",
    "&:hover": { borderColor: "#00ADE5" },
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "rgba(0, 173, 229, 0.1)",
    borderRadius: 6,
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "#005f82",
    fontWeight: 600,
    fontSize: 12,
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "#005f82",
    ":hover": {
      backgroundColor: "rgba(0, 173, 229, 0.2)",
      color: "#003366",
    },
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 110,
  }),
};

const EMPTY_FORM = {
  teamId: null,
  teamName: "",
  displayName: "",
  shortCode: "",
  divisionIds: [],
  venueIds: [],
  about: "",
};

const EMPTY_PLAYER_FORM = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  email: "",
  username: "",
};

const todayIso = new Date().toISOString().slice(0, 10);

const bulkPlayerCellClass =
  "w-full min-w-0 rounded-lg border border-gray-300 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00ADE5]";

function createPlayerRow() {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    ...EMPTY_PLAYER_FORM,
  };
}

function isPlayerRowEmpty(row) {
  return (
    !row.firstName.trim() &&
    !row.lastName.trim() &&
    !row.dateOfBirth &&
    !row.email.trim() &&
    !row.username.trim()
  );
}

function validatePlayerRow(row, rowNum) {
  if (isPlayerRowEmpty(row)) return null;

  if (!row.firstName.trim()) return `Row ${rowNum}: First name is required.`;
  if (!row.lastName.trim()) return `Row ${rowNum}: Last name is required.`;
  if (!row.dateOfBirth) return `Row ${rowNum}: Date of birth is required.`;
  if (!row.email.trim()) return `Row ${rowNum}: Email is required.`;
  if (!row.username.trim()) return `Row ${rowNum}: Username is required.`;
  return null;
}

function syncPlayerFieldChecks(rows, field, { scheduleCheck, setLocalCheck, clearCheck }) {
  const counts = new Map();

  for (const row of rows) {
    const value =
      field === "email"
        ? row.email.trim().toLowerCase()
        : row.username.trim().toLowerCase();
    if (!value) continue;
    counts.set(value, (counts.get(value) || 0) + 1);
  }

  for (const row of rows) {
    const key = `${row.id}-${field}`;
    const rawValue = field === "email" ? row.email : row.username;
    const trimmed = rawValue.trim();

    if (!trimmed) {
      clearCheck(key);
      continue;
    }

    const normalized = trimmed.toLowerCase();
    if ((counts.get(normalized) || 0) > 1) {
      setLocalCheck(
        key,
        "taken",
        field === "email"
          ? "Duplicate email in this batch."
          : "Duplicate username in this batch."
      );
      continue;
    }

    scheduleCheck(key, field, trimmed);
  }
}

function getPlayerRolePayload(teamName) {
  const year = new Date().getFullYear();
  return [
    {
      role: "Player",
      organisation: teamName,
      from: `${year}-01-01`,
      to: `${year}-12-31`,
    },
  ];
}

function getUserId() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return user?.userId || user?._id || user?.id || null;
}

function shortCodeFromName(name) {
  const slug = String(name || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);
  return slug || "TEAM";
}

function getDivisionId(division) {
  return (
    division?.divisionOrTournamentId ??
    division?._id ??
    division?.id ??
    division?.tournamentId ??
    ""
  );
}

function getTeamId(team) {
  return team?._id || team?.id || team?.teamId || "";
}

function getPlayerId(player) {
  return player?._id || player?.id || player?.playerId || "";
}

function getTeamTournamentIds(team) {
  const ids = [];
  const seen = new Set();

  const add = (value) => {
    const normalized = String(value || "").trim();
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    ids.push(normalized);
  };

  (team?.tournamentIds || []).forEach((entry) => {
    if (typeof entry === "object" && entry) {
      add(getDivisionId(entry));
    } else {
      add(entry);
    }
  });

  if (team?.tournamentId) {
    if (typeof team.tournamentId === "object") {
      add(getDivisionId(team.tournamentId));
    } else {
      add(team.tournamentId);
    }
  }

  return ids;
}

function normalizeVenueIds(team) {
  if (!Array.isArray(team?.venueIds)) return [];
  return team.venueIds
    .map((venue) => {
      if (typeof venue === "object" && venue) {
        return String(venue._id || venue.id || venue.venueId || "");
      }
      return String(venue || "");
    })
    .filter(Boolean);
}

function getDivisionName(division) {
  return (
    division?.divisionOrtournamentName ??
    division?.tournamentName ??
    division?.name ??
    "Unnamed division"
  );
}

function getTeamVenues(team, venuesList = []) {
  return normalizeVenueIds(team).map((id) => {
    const venue = venuesList.find(
      (entry) => String(entry._id || entry.id || entry.venueId) === id
    );
    return {
      id,
      name: venue?.venueName || venue?.name || id,
    };
  });
}

function formatPlayerName(player) {
  const lastName = player?.lastName ? String(player.lastName).trim() : "";
  const firstName = player?.firstName ? String(player.firstName).trim() : "";
  if (lastName && firstName) return `${lastName}, ${firstName}`;
  return lastName || firstName || player?.email || "Unnamed player";
}

function formatPlayerDob(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getTeamDivisions(team) {
  const divisions = [];
  const seen = new Set();

  const add = (id, name) => {
    const normalizedId = String(id || "").trim();
    const normalizedName = String(name || "").trim() || "Unnamed division";
    if (!normalizedId || seen.has(normalizedId)) return;
    seen.add(normalizedId);
    divisions.push({ id: normalizedId, name: normalizedName });
  };

  (team?.tournamentIds || []).forEach((entry) => {
    if (typeof entry === "object" && entry) {
      add(getDivisionId(entry), getDivisionName(entry));
    } else {
      add(entry, entry);
    }
  });

  if (team?.tournamentId) {
    if (typeof team.tournamentId === "object") {
      add(getDivisionId(team.tournamentId), getDivisionName(team.tournamentId));
    } else {
      add(team.tournamentId, team.tournamentId);
    }
  }

  return divisions;
}

export default function TeamsTab() {
  const { isSuperAdmin, selectedCompanyId, companiesReady } =
    useCompanyContext();
  const [teams, setTeams] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [detachingKey, setDetachingKey] = useState(null);
  const [divisionsViewTeam, setDivisionsViewTeam] = useState(null);
  const [venuesViewTeam, setVenuesViewTeam] = useState(null);
  const [playersViewTeam, setPlayersViewTeam] = useState(null);
  const [teamPlayers, setTeamPlayers] = useState([]);
  const [playersLoading, setPlayersLoading] = useState(false);
  const [playerCounts, setPlayerCounts] = useState({});
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [playerRows, setPlayerRows] = useState([createPlayerRow()]);
  const [playerSaving, setPlayerSaving] = useState(false);
  const [playerSaveProgress, setPlayerSaveProgress] = useState({ current: 0, total: 0 });
  const [removingPlayerId, setRemovingPlayerId] = useState(null);
  const {
    scheduleCheck,
    setLocalCheck,
    getCheck,
    clearCheck,
    hasSaveBlockingChecks,
    clearChecks,
  } = useCompanyUserFieldCheck();
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [form, setForm] = useState(EMPTY_FORM);
  const loadRequestIdRef = useRef(0);

  const divisionOptions = useMemo(
    () =>
      divisions
        .map((division) => {
          const id = String(getDivisionId(division));
          if (!id) return null;
          return { value: id, label: getDivisionName(division) };
        })
        .filter(Boolean),
    [divisions]
  );

  const selectedDivisionOptions = useMemo(
    () =>
      divisionOptions.filter((option) =>
        form.divisionIds.includes(option.value)
      ),
    [divisionOptions, form.divisionIds]
  );

  useEffect(() => {
    if (divisionsViewTeam) {
      const updated = teams.find(
        (team) => String(getTeamId(team)) === String(getTeamId(divisionsViewTeam))
      );
      setDivisionsViewTeam(updated || null);
    }
    if (venuesViewTeam) {
      const updated = teams.find(
        (team) => String(getTeamId(team)) === String(getTeamId(venuesViewTeam))
      );
      setVenuesViewTeam(updated || null);
    }
    if (playersViewTeam) {
      const updated = teams.find(
        (team) => String(getTeamId(team)) === String(getTeamId(playersViewTeam))
      );
      setPlayersViewTeam(updated || null);
    }
  }, [teams]);

  const refreshPlayerCounts = async (teamsList) => {
    const entries = await Promise.all(
      teamsList.map(async (team) => {
        const teamId = getTeamId(team);
        if (!teamId) return [teamId, 0];
        try {
          const response = await playerAPI.getByTeam(teamId);
          const count = Array.isArray(response.data) ? response.data.length : 0;
          return [String(teamId), count];
        } catch {
          return [String(teamId), 0];
        }
      })
    );
    setPlayerCounts(Object.fromEntries(entries.filter(([id]) => id)));
  };

  const loadPlayersForTeam = async (team) => {
    const teamId = getTeamId(team);
    if (!teamId) return;

    setPlayersLoading(true);
    try {
      const response = await playerAPI.getByTeam(teamId);
      const players = Array.isArray(response.data) ? response.data : [];
      setTeamPlayers(players);
      setPlayerCounts((prev) => ({ ...prev, [String(teamId)]: players.length }));
    } catch (error) {
      console.error("Error loading players:", error);
      setTeamPlayers([]);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to load players.",
      });
    } finally {
      setPlayersLoading(false);
    }
  };

  const openPlayersView = async (team) => {
    setPlayersViewTeam(team);
    await loadPlayersForTeam(team);
  };

  const handleRemovePlayerFromTeam = async (player) => {
    const playerId = getPlayerId(player);
    const teamId = playersViewTeam ? getTeamId(playersViewTeam) : null;
    const userId = getUserId();
    const displayName = formatPlayerName(player);

    if (!playerId || !teamId || !userId) {
      Swal.fire({
        icon: "error",
        title: "Cannot remove",
        text: "Missing player or team information.",
      });
      return;
    }

    const confirmation = await Swal.fire({
      icon: "warning",
      title: "Remove player?",
      html: `Remove <strong>${displayName}</strong> from this team?<br/>This removes the player from the roster only.`,
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Remove",
      cancelButtonText: "Cancel",
    });

    if (!confirmation.isConfirmed) return;

    setRemovingPlayerId(String(playerId));
    try {
      const result = await playerAPI.removeFromTeam(playerId, teamId, userId);
      if (result.errorCode !== 0) {
        throw new Error(result.errorMessage || "Failed to remove player.");
      }

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Removed",
        text: `${displayName} removed from team.`,
        timer: 2000,
        showConfirmButton: false,
      });

      await loadPlayersForTeam(playersViewTeam);
    } catch (error) {
      console.error("Error removing player:", error);
      Swal.fire({
        icon: "error",
        title: "Remove failed",
        text: error.message || "Could not remove player from team.",
      });
    } finally {
      setRemovingPlayerId(null);
    }
  };

  const closePlayerModal = () => {
    setShowPlayerModal(false);
    setPlayerRows([createPlayerRow()]);
    setPlayerSaveProgress({ current: 0, total: 0 });
    clearChecks();
  };

  const openAddPlayerModal = () => {
    clearChecks();
    setPlayerRows([createPlayerRow(), createPlayerRow(), createPlayerRow()]);
    setShowPlayerModal(true);
  };

  const addPlayerRow = () => {
    setPlayerRows((prev) => [...prev, createPlayerRow()]);
  };

  const removePlayerRow = (rowId) => {
    setPlayerRows((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((row) => row.id !== rowId);
      clearCheck(`${rowId}-email`);
      clearCheck(`${rowId}-username`);
      syncPlayerFieldChecks(next, "email", {
        scheduleCheck,
        setLocalCheck,
        clearCheck,
      });
      syncPlayerFieldChecks(next, "username", {
        scheduleCheck,
        setLocalCheck,
        clearCheck,
      });
      return next;
    });
  };

  const updatePlayerRow = (rowId, field, value) => {
    setPlayerRows((prev) => {
      const next = prev.map((row) =>
        row.id === rowId ? { ...row, [field]: value } : row
      );

      if (field === "email" || field === "username") {
        syncPlayerFieldChecks(next, field, {
          scheduleCheck,
          setLocalCheck,
          clearCheck,
        });
      }

      return next;
    });
  };

  const loadTeams = async (userId) => {
    const [unassignedRes, assignedRes] = await Promise.all([
      teamAPI.getByUserIdAndTournament(userId, "", {
        filter: "not_in_division",
      }),
      teamAPI.getByUserIdAndTournament(userId, "", {
        filter: "other_division",
      }),
    ]);

    const merged = new Map();
    const addTeam = (team) => {
      const id = team?._id || team?.id || team?.teamId;
      if (id) merged.set(String(id), team);
    };

    (unassignedRes?.data || []).forEach(addTeam);
    (assignedRes?.data || []).forEach(addTeam);

    return [...merged.values()];
  };

  useEffect(() => {
    if (isSuperAdmin && (!companiesReady || !selectedCompanyId)) {
      return;
    }

    const userId = getUserId();
    if (!userId) return;

    const requestId = ++loadRequestIdRef.current;
    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      try {
        const [teamsList, tournamentRes, venueRes] = await Promise.all([
          loadTeams(userId),
          tournamentAPI.getByUserId(userId),
          venueAPI.getDetails(userId),
        ]);

        if (cancelled || requestId !== loadRequestIdRef.current) return;

        setTeams(teamsList);
        refreshPlayerCounts(teamsList);

        const divisionList = Array.isArray(tournamentRes?.data)
          ? tournamentRes.data
          : tournamentRes?.data
            ? [tournamentRes.data]
            : [];
        setDivisions(divisionList);

        const venueList = Array.isArray(venueRes?.data)
          ? venueRes.data
          : venueRes?.data
            ? [venueRes.data]
            : [];
        setVenues(venueList);
      } catch (error) {
        if (cancelled || requestId !== loadRequestIdRef.current) return;
        console.error("Error loading teams tab:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load teams data.",
        });
      } finally {
        if (!cancelled && requestId === loadRequestIdRef.current) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [isSuperAdmin, selectedCompanyId, companiesReady]);

  const reloadTeams = async () => {
    const userId = getUserId();
    if (!userId) return;
    setLoading(true);
    try {
      const teamsList = await loadTeams(userId);
      setTeams(teamsList);
      refreshPlayerCounts(teamsList);
    } catch (error) {
      console.error("Error reloading teams:", error);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalMode("create");
    setForm(EMPTY_FORM);
  };

  const openCreateModal = () => {
    setForm(EMPTY_FORM);
    setModalMode("create");
    setShowModal(true);
  };

  const openEditModal = (team) => {
    const teamId = getTeamId(team);
    if (!teamId) return;

    setForm({
      teamId: String(teamId),
      teamName: team.teamName || "",
      displayName: team.displayName || "",
      shortCode: team.shortCode || "",
      divisionIds: getTeamTournamentIds(team),
      venueIds: normalizeVenueIds(team),
      about: team.about || "",
    });
    setModalMode("edit");
    setShowModal(true);
  };

  const handleDetachDivision = async (team, tournamentId, divisionName) => {
    const teamId = getTeamId(team);
    const userId = getUserId();
    const teamName = team.teamName || "this team";

    if (!teamId || !userId || !tournamentId) {
      Swal.fire({
        icon: "error",
        title: "Cannot detach",
        text: "Missing team, user, or division information.",
      });
      return;
    }

    const confirmation = await Swal.fire({
      icon: "warning",
      title: "Detach division?",
      html: `Remove <strong>${teamName}</strong> from <strong>${divisionName}</strong>?<br/>The team record will remain in your league.`,
      showCancelButton: true,
      confirmButtonText: "Detach",
      confirmButtonColor: "#dc2626",
      cancelButtonText: "Cancel",
    });

    if (!confirmation.isConfirmed) return;

    const key = `${teamId}-${tournamentId}`;
    setDetachingKey(key);
    try {
      const result = await teamAPI.detachFromDivision(
        teamId,
        userId,
        tournamentId
      );
      if (result.errorCode !== 0) {
        throw new Error(result.errorMessage || "Failed to detach division.");
      }

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Detached",
        text: `${teamName} removed from ${divisionName}.`,
        timer: 2000,
        showConfirmButton: false,
      });

      await reloadTeams();
    } catch (error) {
      console.error("Error detaching division:", error);
      Swal.fire({
        icon: "error",
        title: "Detach failed",
        text: error.message || "Could not detach division.",
      });
    } finally {
      setDetachingKey(null);
    }
  };

  const handleDeleteTeam = async (team) => {
    const teamId = getTeamId(team);
    const userId = getUserId();
    const teamName = team.teamName || "this team";

    if (!teamId || !userId) {
      Swal.fire({
        icon: "error",
        title: "Cannot delete",
        text: "Missing team or user information.",
      });
      return;
    }

    const confirmation = await Swal.fire({
      icon: "warning",
      title: "Delete team?",
      html: `Permanently delete <strong>${teamName}</strong>?<br/>This action cannot be undone.`,
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Delete team",
      cancelButtonText: "Cancel",
    });

    if (!confirmation.isConfirmed) return;

    setDeletingId(String(teamId));
    try {
      const result = await teamAPI.delete(teamId, userId);
      if (result.errorCode !== 0) {
        throw new Error(result.errorMessage || "Failed to delete team.");
      }

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Deleted",
        text: `"${teamName}" has been removed.`,
        timer: 2000,
        showConfirmButton: false,
      });

      await reloadTeams();
    } catch (error) {
      console.error("Error deleting team:", error);
      Swal.fire({
        icon: "error",
        title: "Delete failed",
        text: error.message || "Could not delete team.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const toggleVenue = (venueId) => {
    const id = String(venueId);
    setForm((prev) => ({
      ...prev,
      venueIds: prev.venueIds.includes(id)
        ? prev.venueIds.filter((v) => v !== id)
        : [...prev.venueIds, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const teamName = form.teamName.trim();
    if (!teamName) {
      Swal.fire({
        icon: "warning",
        title: "Team name required",
        text: "Please enter a team name.",
      });
      return;
    }

    const userId = getUserId();
    if (!userId) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "User not found. Please login again.",
      });
      return;
    }

    setSaving(true);
    try {
      const isEdit = modalMode === "edit" && form.teamId;
      const existingTeam = isEdit
        ? teams.find((t) => String(getTeamId(t)) === String(form.teamId))
        : null;

      const payload = {
        userId,
        teamName,
        displayName: form.displayName.trim() || teamName,
        shortCode: form.shortCode.trim() || shortCodeFromName(teamName),
        venueIds: form.venueIds,
        about: form.about.trim() || null,
        isArchived: existingTeam?.isArchived ?? false,
        tournamentIds: form.divisionIds,
      };

      if (isEdit) {
        payload.teamId = form.teamId;
      }

      if (form.divisionIds.length > 0) {
        payload.tournamentId = form.divisionIds[0];
      }

      const response = await teamAPI.save(payload);

      if (response.errorCode !== 0) {
        throw new Error(
          response.errorMessage ||
            (isEdit ? "Failed to update team" : "Failed to create team")
        );
      }

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: isEdit ? "Team updated" : "Team created",
        text: isEdit
          ? "Team details saved successfully."
          : form.divisionIds.length > 0
            ? `Team created and linked to ${form.divisionIds.length} division${form.divisionIds.length > 1 ? "s" : ""}.`
            : "Team created without a division.",
        timer: 2000,
        showConfirmButton: false,
      });

      closeModal();
      await reloadTeams();
    } catch (error) {
      console.error("Error creating team:", error);
      Swal.fire({
        icon: "error",
        title: "Create failed",
        text: error.message || "Failed to create team.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePlayers = async (e) => {
    e.preventDefault();

    const teamId = playersViewTeam ? getTeamId(playersViewTeam) : null;
    const userId = getUserId();
    const teamName = playersViewTeam?.teamName || "Team";

    if (!teamId || !userId) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Team or user information is missing.",
      });
      return;
    }

    const rowsToSave = playerRows.filter((row) => !isPlayerRowEmpty(row));

    if (rowsToSave.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No players to add",
        text: "Fill in at least one player row before saving.",
      });
      return;
    }

    if (hasSaveBlockingChecks()) {
      Swal.fire({
        icon: "warning",
        title: "Availability check required",
        text: "Fix duplicate, invalid, or unavailable email/username values before saving.",
      });
      return;
    }

    for (let index = 0; index < rowsToSave.length; index += 1) {
      const validationError = validatePlayerRow(rowsToSave[index], index + 1);
      if (validationError) {
        Swal.fire({
          icon: "warning",
          title: "Incomplete row",
          text: validationError,
        });
        return;
      }
    }

    const emails = rowsToSave.map((row) => row.email.trim().toLowerCase());
    const usernames = rowsToSave.map((row) => row.username.trim().toLowerCase());
    if (new Set(emails).size !== emails.length) {
      Swal.fire({
        icon: "warning",
        title: "Duplicate email",
        text: "Each player must have a unique email in this batch.",
      });
      return;
    }
    if (new Set(usernames).size !== usernames.length) {
      Swal.fire({
        icon: "warning",
        title: "Duplicate username",
        text: "Each player must have a unique username in this batch.",
      });
      return;
    }

    setPlayerSaving(true);
    setPlayerSaveProgress({ current: 0, total: rowsToSave.length });

    const successes = [];
    const failures = [];

    try {
      for (let index = 0; index < rowsToSave.length; index += 1) {
        const row = rowsToSave[index];
        setPlayerSaveProgress({ current: index + 1, total: rowsToSave.length });

        try {
          const response = await playerAPI.save({
            firstName: row.firstName.trim(),
            lastName: row.lastName.trim(),
            dateOfBirth: row.dateOfBirth,
            email: row.email.trim(),
            username: row.username.trim(),
            userId,
            teamId,
            sendLoginInvite: false,
            registrationStatus: "Active",
            roles: getPlayerRolePayload(teamName),
          });

          if (Number(response.errorCode) !== 0) {
            throw new Error(response.errorMessage || "Failed to add player.");
          }

          successes.push(`${row.firstName.trim()} ${row.lastName.trim()}`);
        } catch (error) {
          failures.push({
            name: `${row.firstName.trim()} ${row.lastName.trim()}`.trim() || row.email,
            error: error.message || "Could not add player.",
          });
        }
      }

      if (successes.length > 0) {
        await loadPlayersForTeam(playersViewTeam);
      }

      if (failures.length === 0) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title:
            successes.length === 1 ? "Player added" : `${successes.length} players added`,
          text: `${successes.length} player${successes.length === 1 ? "" : "s"} joined ${teamName}.`,
          timer: 2400,
          showConfirmButton: false,
        });
        closePlayerModal();
      } else if (successes.length === 0) {
        Swal.fire({
          icon: "error",
          title: "Bulk add failed",
          html: failures
            .map((item) => `<div><strong>${item.name}:</strong> ${item.error}</div>`)
            .join(""),
        });
      } else {
        Swal.fire({
          icon: "warning",
          title: "Partially added",
          html: `<p><strong>${successes.length}</strong> added, <strong>${failures.length}</strong> failed.</p>${failures
            .map((item) => `<div class="mt-1 text-sm"><strong>${item.name}:</strong> ${item.error}</div>`)
            .join("")}`,
        });
        closePlayerModal();
      }
    } finally {
      setPlayerSaving(false);
      setPlayerSaveProgress({ current: 0, total: 0 });
    }
  };

  return (
    <div className="space-y-6">
      <SetupTabHeader
        title="Teams"
        description="Create and manage squads across your league. Assign divisions, venues, and players to build each team roster."
      >
        <SetupPrimaryButton onClick={openCreateModal} icon={Plus}>
          Create team
        </SetupPrimaryButton>
      </SetupTabHeader>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading teams...</div>
        ) : teams.length === 0 ? (
          <div className="p-8 text-center">
            <Users size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="font-medium text-gray-700">No teams yet</p>
            <p className="mt-1 text-sm text-gray-500">
              Create your first team — division assignment is optional.
            </p>
            <button
              type="button"
              onClick={openCreateModal}
              className="mt-4 text-sm font-semibold text-[#00ADE5] hover:underline"
            >
              Create team
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Team
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Short Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Divisions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Venues
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Players
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {teams.map((team) => {
                  const teamId = getTeamId(team);
                  const teamDivisions = getTeamDivisions(team);
                  const teamVenues = getTeamVenues(team, venues);
                  const isDeleting = deletingId === String(teamId);

                  return (
                    <tr key={teamId} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {team.teamName}
                        </div>
                        {team.displayName &&
                          team.displayName !== team.teamName && (
                            <div className="text-xs text-gray-500">
                              {team.displayName}
                            </div>
                          )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {team.shortCode || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <CountBadgeButton
                          count={teamDivisions.length}
                          icon={Layers}
                          title="View divisions"
                          onClick={() => setDivisionsViewTeam(team)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <CountBadgeButton
                          count={teamVenues.length}
                          icon={MapPin}
                          title="View venues"
                          onClick={() => setVenuesViewTeam(team)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <CountBadgeButton
                          count={playerCounts[String(teamId)] ?? 0}
                          icon={UserRound}
                          title="View players"
                          allowZeroClick
                          onClick={() => openPlayersView(team)}
                        />
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(team)}
                            disabled={isDeleting}
                            className="rounded-md p-1.5 text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Edit team"
                            aria-label={`Edit ${team.teamName || "team"}`}
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTeam(team)}
                            disabled={isDeleting}
                            className="rounded-md p-1.5 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Delete team"
                            aria-label={`Delete ${team.teamName || "team"}`}
                          >
                            {isDeleting ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={closeModal}
        innerScroll
        panelClassName="flex max-w-2xl flex-col"
        labelledBy="team-modal-title"
      >
        <div className="shrink-0 bg-gradient-to-r from-[#003366] to-[#004080] px-4 py-4 text-white sm:px-6 sm:py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/20 sm:h-10 sm:w-10">
                <Users size={20} />
              </span>
              <div className="min-w-0">
                <h3 id="team-modal-title" className="text-lg font-bold sm:text-xl">
                  {modalMode === "edit" ? "Edit Team" : "Create Team"}
                </h3>
                <p className="text-xs text-blue-100">
                  {modalMode === "edit"
                    ? "Update team details and save changes."
                    : "Select one or more divisions (optional)."}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg p-2 text-white hover:bg-white/20"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-0 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Team Name *
              </label>
              <input
                type="text"
                value={form.teamName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, teamName: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
                placeholder="e.g., Manchester United FC"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Display Name
              </label>
              <input
                type="text"
                value={form.displayName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, displayName: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Short Code
              </label>
              <input
                type="text"
                value={form.shortCode}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    shortCode: e.target.value.toUpperCase(),
                  }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
                placeholder="Auto-generated if empty"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 flex items-center justify-between text-sm font-medium text-gray-700">
                <span className="flex items-center gap-1.5">
                  <Layers size={14} />
                  Divisions <span className="text-gray-400">(optional)</span>
                </span>
                {form.divisionIds.length > 0 && (
                  <span className="text-xs font-semibold text-[#00ADE5]">
                    {form.divisionIds.length} selected
                  </span>
                )}
              </label>

              {divisionOptions.length === 0 ? (
                <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500">
                  No divisions available. Create one under Competitions first.
                </p>
              ) : (
                <Select
                  isMulti
                  options={divisionOptions}
                  value={selectedDivisionOptions}
                  onChange={(selected) =>
                    setForm((prev) => ({
                      ...prev,
                      divisionIds: (selected || []).map((item) => item.value),
                    }))
                  }
                  placeholder="Search and select divisions..."
                  isClearable
                  closeMenuOnSelect={false}
                  classNamePrefix="react-select"
                  styles={divisionSelectStyles}
                  menuPortalTarget={
                    typeof document !== "undefined" ? document.body : null
                  }
                  menuPosition="fixed"
                />
              )}
            </div>

            {venues.length > 0 && (
              <div className="sm:col-span-2">
                <label className="mb-2 flex items-center gap-1 text-sm font-medium text-gray-700">
                  <MapPin size={14} />
                  Home Venues <span className="text-gray-400">(optional)</span>
                </label>
                <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-3">
                  {venues.map((venue) => {
                    const venueId = venue._id || venue.id || venue.venueId;
                    return (
                      <label
                        key={venueId}
                        className="flex cursor-pointer items-center gap-2 text-sm text-gray-700"
                      >
                        <input
                          type="checkbox"
                          checked={form.venueIds.includes(String(venueId))}
                          onChange={() => toggleVenue(venueId)}
                        />
                        {venue.venueName || venue.name || "Unnamed venue"}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                About
              </label>
              <textarea
                value={form.about}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, about: e.target.value }))
                }
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
                placeholder="Optional team description"
              />
            </div>
          </div>
          </div>

          <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-4 sm:px-6">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeModal}
                className="w-full rounded-xl border-2 border-gray-300 px-5 py-2.5 font-semibold text-gray-700 hover:bg-gray-50 sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#003366] to-[#004080] px-5 py-2.5 font-semibold text-white hover:from-[#002244] hover:to-[#003366] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {modalMode === "edit" ? "Save Changes" : "Create Team"}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      <ListViewModal
        isOpen={Boolean(divisionsViewTeam)}
        onClose={() => setDivisionsViewTeam(null)}
        title={divisionsViewTeam?.teamName || "Team divisions"}
        subtitle={
          divisionsViewTeam
            ? `${getTeamDivisions(divisionsViewTeam).length} division${
                getTeamDivisions(divisionsViewTeam).length === 1 ? "" : "s"
              } assigned`
            : ""
        }
        labelledBy="team-divisions-title"
        items={divisionsViewTeam ? getTeamDivisions(divisionsViewTeam) : []}
        emptyIcon={Layers}
        emptyTitle="No divisions assigned"
        emptyHint="Edit this team to link divisions."
        tableMode
        tableHeaders={["Division", "Action"]}
        renderItem={(division) => (
          <>
            <td className="px-4 py-3 font-medium text-gray-800">
              {division.name}
            </td>
            <td className="px-4 py-3 text-right">
              <button
                type="button"
                onClick={() =>
                  handleDetachDivision(
                    divisionsViewTeam,
                    division.id,
                    division.name
                  )
                }
                disabled={
                  detachingKey ===
                  `${getTeamId(divisionsViewTeam)}-${division.id}`
                }
                className="inline-flex rounded-md p-1.5 text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
                title={`Detach from ${division.name}`}
                aria-label={`Detach from ${division.name}`}
              >
                {detachingKey ===
                `${getTeamId(divisionsViewTeam)}-${division.id}` ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Unlink size={18} />
                )}
              </button>
            </td>
          </>
        )}
      />

      <ListViewModal
        isOpen={Boolean(playersViewTeam)}
        onClose={() => {
          setPlayersViewTeam(null);
          setTeamPlayers([]);
        }}
        title={playersViewTeam?.teamName || "Team players"}
        subtitle={
          playersViewTeam
            ? `${teamPlayers.length} player${teamPlayers.length === 1 ? "" : "s"} on roster`
            : ""
        }
        labelledBy="team-players-title"
        panelClassName="flex max-w-3xl flex-col"
        headerIcon={Users}
        enhancedTable
        items={teamPlayers}
        emptyIcon={UserRound}
        emptyTitle={
          playersLoading && teamPlayers.length === 0
            ? "Loading players…"
            : "No players yet"
        }
        emptyHint={
          playersLoading && teamPlayers.length === 0
            ? "Please wait while roster loads."
            : "Add players to build your team roster."
        }
        tableMode
        tableHeaders={["Player", "Email", "Date of Birth", "Status", ""]}
        footerLabel="Close"
        renderItem={(player, index) => {
          const displayName = formatPlayerName(player);
          const isActive = (player.registrationStatus || "Active") === "Active";

          return (
            <>
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <span
                    className={clsx(
                      "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-xs font-bold text-white shadow-sm",
                      ITEM_AVATAR_GRADIENTS[index % ITEM_AVATAR_GRADIENTS.length]
                    )}
                  >
                    {itemInitials(displayName)}
                  </span>
                  <p className="font-semibold text-gray-900">{displayName}</p>
                </div>
              </td>
              <td className="px-4 py-4 text-sm text-gray-600">
                {player.email || "—"}
              </td>
              <td className="px-4 py-4 text-sm text-gray-600">
                {formatPlayerDob(player.dateOfBirth)}
              </td>
              <td className="px-4 py-4">
                <span
                  className={clsx(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
                    isActive
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                      : "bg-gray-100 text-gray-600 ring-1 ring-gray-200"
                  )}
                >
                  <span
                    className={clsx(
                      "h-1.5 w-1.5 rounded-full",
                      isActive ? "bg-emerald-500" : "bg-gray-400"
                    )}
                  />
                  {player.registrationStatus || "Active"}
                </span>
              </td>
              <td className="px-4 py-4 text-right">
                <button
                  type="button"
                  onClick={() => handleRemovePlayerFromTeam(player)}
                  disabled={
                    removingPlayerId === String(getPlayerId(player)) ||
                    playersLoading
                  }
                  className="inline-flex rounded-md p-1.5 text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
                  title={`Detach ${displayName} from team`}
                  aria-label={`Detach ${displayName} from team`}
                >
                  {removingPlayerId === String(getPlayerId(player)) ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Unlink size={18} />
                  )}
                </button>
              </td>
            </>
          );
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-600">
            Manage your squad and register new players.
          </p>
          <div className="flex items-center gap-2">
            {playersLoading && (
              <span className="inline-flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin text-[#00ADE5]" />
                Refreshing…
              </span>
            )}
            <button
              type="button"
              onClick={openAddPlayerModal}
              disabled={playersLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00ADE5] to-[#0097c9] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:shadow-lg disabled:opacity-60"
            >
              <Plus size={16} />
              Add Players
            </button>
          </div>
        </div>
      </ListViewModal>

      <Modal
        isOpen={showPlayerModal}
        onClose={closePlayerModal}
        innerScroll
        panelClassName="flex max-w-6xl flex-col"
        labelledBy="add-player-title"
      >
        <div className="shrink-0 bg-gradient-to-r from-[#003366] to-[#004080] px-4 py-4 text-white sm:px-6 sm:py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/20 sm:h-10 sm:w-10">
                <UserRound size={20} />
              </span>
              <div className="min-w-0">
                <h3 id="add-player-title" className="text-lg font-bold sm:text-xl">
                  Add Players
                </h3>
                <p className="text-sm text-blue-100/95">
                  {playersViewTeam?.teamName
                    ? `Register players for ${playersViewTeam.teamName}`
                    : "Add players to your team roster"}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    <KeyRound className="h-3.5 w-3.5 text-blue-100" />
                    Password matches email
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    <Shield className="h-3.5 w-3.5 text-blue-100" />
                    Player role assigned
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={closePlayerModal}
              className="rounded-lg p-2 text-white hover:bg-white/20"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSavePlayers} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm text-gray-500">
                Fill in player details below. Empty rows are skipped on save.
              </p>
              <button
                type="button"
                onClick={addPlayerRow}
                disabled={playerSaving}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#00ADE5] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0097c9] disabled:opacity-60"
              >
                <Plus size={16} />
                Add Row
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-[920px] w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      #
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      First Name *
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Last Name *
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      DOB *
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Email *
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Username *
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Remove
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {playerRows.map((row, index) => (
                    <tr key={row.id} className="align-top">
                      <td className="px-3 py-3 text-sm font-semibold text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="text"
                          value={row.firstName}
                          onChange={(e) =>
                            updatePlayerRow(row.id, "firstName", e.target.value)
                          }
                          className={bulkPlayerCellClass}
                          placeholder="Muhammad"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="text"
                          value={row.lastName}
                          onChange={(e) =>
                            updatePlayerRow(row.id, "lastName", e.target.value)
                          }
                          className={bulkPlayerCellClass}
                          placeholder="Muaz"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="date"
                          value={row.dateOfBirth}
                          max={todayIso}
                          onChange={(e) =>
                            updatePlayerRow(row.id, "dateOfBirth", e.target.value)
                          }
                          className={`${bulkPlayerCellClass} [color-scheme:light]`}
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="email"
                          value={row.email}
                          onChange={(e) =>
                            updatePlayerRow(row.id, "email", e.target.value)
                          }
                          className={getFieldCheckInputClass(
                            bulkPlayerCellClass,
                            getCheck(`${row.id}-email`)
                          )}
                          placeholder="player@example.com"
                        />
                        <FieldAvailabilityHint check={getCheck(`${row.id}-email`)} />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="text"
                          value={row.username}
                          onChange={(e) =>
                            updatePlayerRow(row.id, "username", e.target.value)
                          }
                          className={getFieldCheckInputClass(
                            bulkPlayerCellClass,
                            getCheck(`${row.id}-username`)
                          )}
                          placeholder="username"
                        />
                        <FieldAvailabilityHint
                          check={getCheck(`${row.id}-username`)}
                        />
                      </td>
                      <td className="px-3 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => removePlayerRow(row.id)}
                          disabled={playerSaving || playerRows.length <= 1}
                          className="rounded-md p-1.5 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                          title="Remove row"
                          aria-label={`Remove player row ${index + 1}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

          <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-4 sm:px-6">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-500">
                {playerRows.filter((row) => !isPlayerRowEmpty(row)).length} player
                {playerRows.filter((row) => !isPlayerRowEmpty(row)).length === 1
                  ? ""
                  : "s"}{" "}
                ready to save
              </p>
              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={closePlayerModal}
                  className="w-full rounded-xl border-2 border-gray-300 px-5 py-2.5 font-semibold text-gray-700 hover:bg-gray-50 sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={playerSaving}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#003366] to-[#004080] px-5 py-2.5 font-semibold text-white hover:from-[#002244] hover:to-[#003366] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {playerSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      {playerSaveProgress.total > 0
                        ? `Saving ${playerSaveProgress.current} of ${playerSaveProgress.total}…`
                        : "Saving..."}
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Players
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </Modal>

      <ListViewModal
        isOpen={Boolean(venuesViewTeam)}
        onClose={() => setVenuesViewTeam(null)}
        title={venuesViewTeam?.teamName || "Team venues"}
        subtitle={
          venuesViewTeam
            ? `${getTeamVenues(venuesViewTeam, venues).length} home venue${
                getTeamVenues(venuesViewTeam, venues).length === 1 ? "" : "s"
              }`
            : ""
        }
        labelledBy="team-venues-title"
        items={venuesViewTeam ? getTeamVenues(venuesViewTeam, venues) : []}
        emptyIcon={MapPin}
        emptyTitle="No venues linked"
        emptyHint="Edit this team to assign home venues."
        renderItem={(venue, index) => (
          <ListItemCard name={venue.name} index={index} />
        )}
      />
    </div>
  );
}
