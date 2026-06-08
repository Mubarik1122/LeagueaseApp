import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Layers,
  Loader2,
  Save,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import Swal from "sweetalert2";
import clsx from "clsx";
import Modal from "../../components/Modal";
import {
  ListItemCard,
  itemInitials,
} from "../../components/setup/CountViewModal";
import {
  getUserDivisionItems,
  getUserTeamItems,
} from "../../hooks/useUsers";
import { playerAPI } from "../../services/api";

function getTeamDivisionIds(team) {
  const ids = [];
  const seen = new Set();

  const add = (entry) => {
    let id = "";
    if (typeof entry === "object" && entry) {
      id = String(
        entry.divisionOrTournamentId ??
          entry._id ??
          entry.id ??
          entry.tournamentId ??
          ""
      ).trim();
    } else {
      id = String(entry || "").trim();
    }
    if (!id || seen.has(id)) return;
    seen.add(id);
    ids.push(id);
  };

  (team?.divisions || []).forEach((division) => add(division.id));
  if (team?.tournamentId) add(team.tournamentId);
  (team?.tournamentIds || []).forEach(add);
  return ids;
}

export default function AssignPlayerToTeamsModal({
  isOpen,
  user,
  allTeams = [],
  divisionNameById = {},
  onClose,
  onSuccess,
}) {
  const [selectedTeamIds, setSelectedTeamIds] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSelectedTeamIds([]);
    }
  }, [isOpen, user?.userId]);

  const currentTeams = useMemo(
    () => (user ? getUserTeamItems(user) : []),
    [user]
  );
  const currentDivisions = useMemo(
    () => (user ? getUserDivisionItems(user, divisionNameById) : []),
    [user, divisionNameById]
  );

  const currentTeamIds = useMemo(
    () => new Set(currentTeams.map((team) => String(team.id))),
    [currentTeams]
  );

  const availableTeams = useMemo(
    () =>
      allTeams
        .filter((team) => team.id && !currentTeamIds.has(String(team.id)))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [allTeams, currentTeamIds]
  );

  const toggleTeam = (teamId) => {
    const id = String(teamId);
    setSelectedTeamIds((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!user?.userId) return;

    if (selectedTeamIds.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Select a team",
        text: "Choose at least one team to assign this player to.",
      });
      return;
    }

    const divisionIds = new Set();
    for (const teamId of selectedTeamIds) {
      const team = allTeams.find((entry) => String(entry.id) === String(teamId));
      getTeamDivisionIds(team).forEach((id) => divisionIds.add(id));
    }

    const payload = {
      userId: user.userId,
      teamId: selectedTeamIds[0],
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };

    if (selectedTeamIds.length > 1) {
      payload.teamIds = selectedTeamIds.slice(1);
    }

    const divisionList = [...divisionIds];
    if (divisionList.length === 1) {
      payload.tournamentId = divisionList[0];
    } else if (divisionList.length > 1) {
      payload.tournamentIds = divisionList;
    }

    setSaving(true);
    try {
      const response = await playerAPI.save(payload);
      if (Number(response.errorCode) !== 0) {
        throw new Error(response.errorMessage || "Failed to assign player.");
      }

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Player assigned",
        text: `${user.name} added to ${selectedTeamIds.length} team${selectedTeamIds.length === 1 ? "" : "s"}.`,
        timer: 2200,
        showConfirmButton: false,
      });

      setSelectedTeamIds([]);
      onSuccess?.();
      onClose();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Assign failed",
        text: error.message || "Could not assign player to team.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      innerScroll
      panelClassName="flex max-w-2xl flex-col"
      labelledBy="assign-player-teams-title"
    >
      <div className="shrink-0 bg-gradient-to-r from-[#003366] to-[#004080] px-5 py-5 text-white sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 shadow-sm backdrop-blur-sm">
              <UserPlus size={22} />
            </span>
            <div className="min-w-0">
              <h3
                id="assign-player-teams-title"
                className="truncate text-xl font-bold sm:text-2xl"
              >
                Assign to Team
              </h3>
              <p className="mt-1 text-sm text-blue-100/95">{user.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 transition hover:bg-white/20"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Users className="h-4 w-4 text-[#00ADE5]" />
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Current teams ({currentTeams.length})
              </p>
            </div>
            {currentTeams.length > 0 ? (
              <ul className="space-y-2">
                {currentTeams.map((team, index) => (
                  <li key={team.id}>
                    <ListItemCard name={team.name} index={index} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-xl border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-500">
                No teams assigned yet
              </p>
            )}
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#00ADE5]" />
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Current divisions ({currentDivisions.length})
              </p>
            </div>
            {currentDivisions.length > 0 ? (
              <ul className="space-y-2">
                {currentDivisions.map((division, index) => (
                  <li key={division.id}>
                    <ListItemCard name={division.name} index={index} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-xl border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-500">
                No divisions assigned yet
              </p>
            )}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-gray-800">
              Add to team(s)
            </p>
            {selectedTeamIds.length > 0 && (
              <span className="rounded-full bg-[#00ADE5]/10 px-2.5 py-1 text-xs font-semibold text-[#0088cc]">
                {selectedTeamIds.length} selected
              </span>
            )}
          </div>

          {availableTeams.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-slate-50 px-4 py-8 text-center">
              <Users className="mx-auto h-8 w-8 text-gray-300" />
              <p className="mt-3 text-sm font-medium text-gray-700">
                No more teams available
              </p>
              <p className="mt-1 text-xs text-gray-500">
                This player is already assigned to all teams in your league.
              </p>
            </div>
          ) : (
            <ul className="max-h-72 space-y-2 overflow-y-auto">
              {availableTeams.map((team) => {
                const checked = selectedTeamIds.includes(String(team.id));
                return (
                  <li key={team.id}>
                    <button
                      type="button"
                      onClick={() => toggleTeam(team.id)}
                      className={clsx(
                        "flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition",
                        checked
                          ? "border-[#00ADE5]/40 bg-[#00ADE5]/5 shadow-sm"
                          : "border-gray-100 bg-gray-50/80 hover:border-gray-200 hover:bg-white"
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={clsx(
                            "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                            checked
                              ? "bg-[#003366] text-white"
                              : "bg-white text-[#003366] ring-1 ring-gray-200"
                          )}
                        >
                          {itemInitials(team.name)}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-gray-800">
                            {team.name}
                          </span>
                          <span className="mt-0.5 inline-flex items-center gap-1 text-xs text-gray-500">
                            <Layers className="h-3 w-3" />
                            {team.divisionLabel || "No division"}
                          </span>
                        </span>
                      </div>
                      <span
                        className={clsx(
                          "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition",
                          checked
                            ? "border-[#00ADE5] bg-[#00ADE5] text-white"
                            : "border-gray-300 bg-white text-transparent"
                        )}
                      >
                        <Check size={14} />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="flex shrink-0 justify-end gap-2 border-t border-gray-100 bg-white px-5 py-3 sm:px-6">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="rounded-lg border border-gray-200 px-4 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || availableTeams.length === 0}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#003366] to-[#004080] px-4 py-1.5 text-xs font-semibold text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save size={14} />
              Assign
            </>
          )}
        </button>
      </div>
    </Modal>
  );
}
