import { useEffect, useState } from "react";
import { X, Calendar, CheckCircle2, Loader2, Swords } from "lucide-react";
import Swal from "sweetalert2";
import {
  teamAPI,
  venueAPI,
  matchAPI,
  MATCH_DATE_STATUS_OPTIONS,
} from "../services/api";
import Modal from "./Modal";

const inputClass =
  "w-full min-w-0 rounded-xl border-2 border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 transition-all duration-100 hover:bg-white focus:border-[#00ADE5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00ADE5]/20 sm:px-4 sm:py-3";
const selectClass = inputClass;
const labelClass = "mb-2 block text-sm font-semibold text-gray-700";

function teamOptionId(team) {
  const id = team?._id ?? team?.id ?? team?.teamId;
  return id != null ? String(id) : "";
}

function teamOptionLabel(team) {
  const name = team?.teamName ?? team?.displayName ?? team?.name;
  const code = team?.shortCode;
  if (name && code) return `${name} [${code}]`;
  return name || code || "Unnamed team";
}

function venueOptionId(venue) {
  return venue?._id ?? venue?.id ?? venue?.venueId ?? "";
}

function venueOptionLabel(venue) {
  return venue?.venueName ?? venue?.name ?? venue?.title ?? "Venue";
}

function toDateInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function toTimeInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

const initialForm = {
  competitionId: "",
  homeTeamId: "",
  awayTeamId: "",
  date: "",
  time: "",
  venueId: "",
  dateStatus: "Scheduled",
};

export default function CreateMatchModal({
  isOpen,
  onClose,
  competitions = [],
  editMatch = null,
  onSuccess,
}) {
  const isEditMode = Boolean(editMatch?.matchId);
  const [form, setForm] = useState(initialForm);
  const [teams, setTeams] = useState([]);
  const [venues, setVenues] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [venuesLoading, setVenuesLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (editMatch) {
      setForm({
        competitionId: "",
        homeTeamId: editMatch.homeTeam?.teamId || "",
        awayTeamId: editMatch.awayTeam?.teamId || "",
        date: toDateInputValue(editMatch.dateTime),
        time: toTimeInputValue(editMatch.dateTime),
        venueId: editMatch.venue?.venueId || "",
        dateStatus:
          editMatch.dateStatus === "Normal"
            ? "Scheduled"
            : editMatch.dateStatus || editMatch.status || "Scheduled",
      });
    } else {
      setForm(initialForm);
    }
    setTeams([]);

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user?.userId;
    if (!userId) return;

    let cancelled = false;
    (async () => {
      setVenuesLoading(true);
      try {
        const res = await venueAPI.getDetails(userId);
        if (cancelled) return;
        if (res.errorCode === 0) {
          const data = res.data;
          setVenues(Array.isArray(data) ? data : data ? [data] : []);
        } else {
          setVenues([]);
        }
      } catch {
        if (!cancelled) setVenues([]);
      } finally {
        if (!cancelled) setVenuesLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, editMatch]);

  useEffect(() => {
    if (!isOpen) return;
    if (!isEditMode && !form.competitionId) {
      setTeams([]);
      return;
    }

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user?.userId;
    if (!userId) return;

    let cancelled = false;
    (async () => {
      setTeamsLoading(true);
      try {
        if (isEditMode) {
          const [inDivRes, unassignedRes] = await Promise.all([
            teamAPI.getByUserIdAndTournament(userId, "", {
              filter: "other_division",
            }),
            teamAPI.getByUserIdAndTournament(userId, "", {
              filter: "not_in_division",
            }),
          ]);
          if (cancelled) return;
          const map = new Map();
          for (const res of [inDivRes, unassignedRes]) {
            const list = Array.isArray(res.data)
              ? res.data
              : res.data
                ? [res.data]
                : [];
            for (const team of list) {
              const id = teamOptionId(team);
              if (id) map.set(id, team);
            }
          }
          setTeams([...map.values()]);
        } else {
          const res = await teamAPI.getByUserIdAndTournament(
            userId,
            form.competitionId,
            { filter: "" }
          );
          if (cancelled) return;
          if (res.errorCode === 0) {
            const raw = res.data;
            setTeams(Array.isArray(raw) ? raw : raw != null ? [raw] : []);
          } else {
            setTeams([]);
          }
        }
      } catch {
        if (!cancelled) setTeams([]);
      } finally {
        if (!cancelled) setTeamsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, form.competitionId, isEditMode]);

  const teamsConflict =
    Boolean(form.homeTeamId) &&
    Boolean(form.awayTeamId) &&
    form.homeTeamId === form.awayTeamId;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "competitionId") {
        next.homeTeamId = "";
        next.awayTeamId = "";
      }
      if (name === "homeTeamId" && value && value === prev.awayTeamId) {
        next.awayTeamId = "";
      }
      if (name === "awayTeamId" && value && value === prev.homeTeamId) {
        next.homeTeamId = "";
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEditMode && !form.competitionId) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "warning",
        title: "Competition required",
        text: "Please select a competition.",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    if (!form.homeTeamId || !form.awayTeamId) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "warning",
        title: "Teams required",
        text: "Please select home and away teams.",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    if (form.homeTeamId === form.awayTeamId) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "warning",
        title: "Invalid teams",
        text: "Home and away teams must be different.",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    if (!form.date || !form.time) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "warning",
        title: "Date & time required",
        text: "Please set when the match will take place.",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    if (!form.venueId) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "warning",
        title: "Venue required",
        text: "Please select a venue for this match.",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user?.userId;
    if (!userId) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Error",
        text: "User ID not found. Please login again.",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    setSubmitting(true);
    try {
      const result = await matchAPI.save({
        ...(isEditMode ? { matchId: editMatch.matchId } : {}),
        userId,
        homeTeamId: form.homeTeamId,
        awayTeamId: form.awayTeamId,
        venueId: form.venueId,
        date: form.date,
        time: form.time,
        status:
          form.dateStatus === "Normal" || form.dateStatus === "Played"
            ? form.dateStatus
            : "Scheduled",
        dateStatus: form.dateStatus,
      });

      if (result.errorCode === 0) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: isEditMode ? "Updated" : "Created",
          text: isEditMode
            ? "Match updated successfully."
            : "Match created successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
        onSuccess?.(result.data);
        onClose?.();
      } else {
        Swal.fire({
          icon: "error",
          title: isEditMode ? "Update failed" : "Create failed",
          text: result.errorMessage || "Could not save match.",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: isEditMode ? "Update failed" : "Create failed",
        text: err?.message || "Could not save match.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      innerScroll
      panelClassName="flex max-w-2xl flex-col"
      labelledBy="create-match-title"
    >
          <div className="shrink-0 bg-gradient-to-r from-[#003366] to-[#004080] px-4 py-4 text-white sm:px-6 sm:py-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <div className="shrink-0 rounded-lg bg-white/20 p-2 backdrop-blur-sm">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0">
                  <h2
                    id="create-match-title"
                    className="text-xl font-bold sm:text-2xl"
                  >
                    {isEditMode ? "Edit Match" : "Create Match"}
                  </h2>
                  <p className="mt-0.5 text-xs text-blue-100 sm:text-sm">
                    {isEditMode
                      ? "Update teams, schedule, and match status"
                      : "Choose competition, teams, date, and venue"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-lg p-2 transition-colors duration-100 hover:bg-white/20"
                aria-label="Close modal"
              >
                <X size={22} className="text-white sm:h-6 sm:w-6" />
              </button>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-6">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-[#00ADE5]" />
                <h3 className="text-base font-semibold text-gray-900 sm:text-lg">
                  Match details
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {!isEditMode && (
                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      Competition <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="competitionId"
                      value={form.competitionId}
                      onChange={handleChange}
                      className={selectClass}
                      required
                    >
                      <option value="">Select competition</option>
                      {competitions.map((comp) => {
                        const id =
                          comp.divisionOrTournamentId ?? comp.id ?? "";
                        return (
                          <option key={id} value={id}>
                            {comp.name}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                <div>
                  <label className={labelClass}>
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={form.time}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Date status</label>
                  <select
                    name="dateStatus"
                    value={form.dateStatus}
                    onChange={handleChange}
                    className={selectClass}
                  >
                    {MATCH_DATE_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>
                    Venue <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="venueId"
                    value={form.venueId}
                    onChange={handleChange}
                    className={selectClass}
                    disabled={venuesLoading}
                    required
                  >
                    <option value="">
                      {venuesLoading ? "Loading venues…" : "Select venue"}
                    </option>
                    {venues.map((venue) => {
                      const id = venueOptionId(venue);
                      return (
                        <option key={id} value={id}>
                          {venueOptionLabel(venue)}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-[#00ADE5]" />
                <h3 className="text-base font-semibold text-gray-900 sm:text-lg">
                  Teams
                </h3>
              </div>

              <div className="relative grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-end">
                <div className="min-w-0">
                  <label className={labelClass}>
                    Home team <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="homeTeamId"
                    value={form.homeTeamId}
                    onChange={handleChange}
                    className={selectClass}
                    disabled={(!isEditMode && !form.competitionId) || teamsLoading}
                    required
                  >
                    <option value="">
                      {!isEditMode && !form.competitionId
                        ? "Select competition first"
                        : teamsLoading
                          ? "Loading teams…"
                          : teams.length === 0
                            ? "No teams in division"
                            : "Select home team"}
                    </option>
                    {teams.map((team) => {
                      const id = teamOptionId(team);
                      if (id && id === form.awayTeamId) return null;
                      return (
                        <option key={id} value={id}>
                          {teamOptionLabel(team)}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="flex justify-center py-1 md:pb-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#003366]/[0.08] text-[#003366] sm:h-10 sm:w-10">
                    <Swords className="h-4 w-4" strokeWidth={2.25} />
                  </span>
                </div>

                <div className="min-w-0">
                  <label className={labelClass}>
                    Away team <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="awayTeamId"
                    value={form.awayTeamId}
                    onChange={handleChange}
                    className={selectClass}
                    disabled={(!isEditMode && !form.competitionId) || teamsLoading}
                    required
                  >
                    <option value="">
                      {!isEditMode && !form.competitionId
                        ? "Select competition first"
                        : teamsLoading
                          ? "Loading teams…"
                          : teams.length === 0
                            ? "No teams in division"
                            : "Select away team"}
                    </option>
                    {teams.map((team) => {
                      const id = teamOptionId(team);
                      if (id && id === form.homeTeamId) return null;
                      return (
                        <option key={id} value={id}>
                          {teamOptionLabel(team)}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {teamsConflict && (
                <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  Home team and away team must be different.
                </p>
              )}
            </div>
            </div>

            <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-gray-200 px-4 py-4 sm:flex-row sm:justify-end sm:px-6 sm:py-5">
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl border-2 border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition-all duration-100 hover:border-gray-400 hover:bg-gray-50 sm:w-auto sm:px-6"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || teamsConflict}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#003366] to-[#004080] px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-100 hover:from-[#002244] hover:to-[#003366] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-6"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {isEditMode ? "Saving…" : "Creating…"}
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={20} />
                    {isEditMode ? "Save Changes" : "Create Match"}
                  </>
                )}
              </button>
            </div>
          </form>
    </Modal>
  );
}
