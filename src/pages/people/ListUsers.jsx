import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Edit2,
  Filter,
  Layers,
  Loader2,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Shield,
  Trash2,
  UserPlus,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";
import Swal from "sweetalert2";
import {
  buildDivisionNameMap,
  enrichUserDivisionLabels,
  getUserDivisionItems,
  getUserTeamItems,
  mapCompanyUser,
  useUsers,
  userHasPlayerRole,
} from "../../hooks/useUsers";
import { companyAPI } from "../../services/api";
import { useCompanyContext } from "../../context/CompanyContext";
import { tournamentAPI, teamAPI } from "../../services/api";
import {
  CountBadgeButton,
  ListItemCard,
  ListViewModal,
} from "../../components/setup/CountViewModal";
import {
  DEFAULT_USER_FILTERS,
  USER_ROLE_FILTER_OPTIONS,
  hasActiveUserFilters,
} from "../../utils/companyUserFilters";
import CreateUser from "./CreateUser";
import AssignPlayerToTeamsModal from "./AssignPlayerToTeamsModal";

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

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ListUsers() {
  const { users, companyMeta, loading, error, fetchUsers, deleteUser } =
    useUsers();
  const { isSuperAdmin, selectedCompanyId, companiesReady } =
    useCompanyContext();
  const [view, setView] = useState("list");
  const [editingUser, setEditingUser] = useState(null);
  const [loadingEditUser, setLoadingEditUser] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ ...DEFAULT_USER_FILTERS });
  const [divisions, setDivisions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [teamRecords, setTeamRecords] = useState([]);
  const [assignUser, setAssignUser] = useState(null);
  const [divisionsViewUser, setDivisionsViewUser] = useState(null);
  const [teamsViewUser, setTeamsViewUser] = useState(null);

  const loadFilterOptions = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.userId) return;

    try {
      const [tournamentRes, teamsInDivRes, teamsUnassignedRes] =
        await Promise.all([
          tournamentAPI.getByUserId(user.userId),
          teamAPI.getByUserIdAndTournament(user.userId, "", {
            filter: "other_division",
          }),
          teamAPI.getByUserIdAndTournament(user.userId, "", {
            filter: "not_in_division",
          }),
        ]);

      const tournamentList = Array.isArray(tournamentRes.data)
        ? tournamentRes.data
        : tournamentRes.data
          ? [tournamentRes.data]
          : [];

      const divisionOptions = tournamentList.map((t) => ({
        id: t.divisionOrTournamentId ?? t._id ?? t.id ?? "",
        name:
          t.divisionOrtournamentName ??
          t.tournamentName ??
          t.name ??
          "Unnamed",
      }));

      setDivisions(divisionOptions);

      const divisionNameById = Object.fromEntries(
        divisionOptions.map((division) => [division.id, division.name])
      );

      const getDivisionIdFromEntry = (entry) => {
        if (typeof entry === "object" && entry) {
          return String(
            entry.divisionOrTournamentId ??
              entry._id ??
              entry.id ??
              entry.tournamentId ??
              ""
          ).trim();
        }
        return String(entry || "").trim();
      };

      const getDivisionNameFromEntry = (entry) => {
        const id = getDivisionIdFromEntry(entry);
        if (typeof entry === "object" && entry) {
          return (
            entry.divisionOrtournamentName ??
            entry.tournamentName ??
            entry.name ??
            divisionNameById[id] ??
            "Unnamed division"
          );
        }
        return divisionNameById[id] || id || "Unnamed division";
      };

      const getTeamDivisionEntries = (team) => {
        const divisions = [];
        const seen = new Set();
        const add = (entry) => {
          const divisionId = getDivisionIdFromEntry(entry);
          if (!divisionId || seen.has(divisionId)) return;
          seen.add(divisionId);
          divisions.push({
            id: divisionId,
            name: getDivisionNameFromEntry(entry),
          });
        };

        (team.tournamentIds || []).forEach(add);
        if (team.tournamentId) add(team.tournamentId);
        return divisions;
      };

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

            const divisionEntries = getTeamDivisionEntries(t);
            const divisionLabel = divisionEntries.length
              ? divisionEntries.map((division) => division.name).join(", ")
              : "No division";

            map.set(id, {
              id,
              name: t.teamName ?? t.displayName ?? "Unnamed team",
              tournamentId: divisionEntries[0]?.id ?? null,
              tournamentIds: divisionEntries.map((division) => division.id),
              divisions: divisionEntries,
              divisionLabel,
            });
          }
        }
        return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
      };

      const mergedTeams = mergeTeams(teamsInDivRes, teamsUnassignedRes);
      setTeams(mergedTeams.map(({ id, name }) => ({ id, name })));
      setTeamRecords(mergedTeams);
    } catch {
      setDivisions([]);
      setTeams([]);
      setTeamRecords([]);
    }
  };

  const refreshUsers = () => {
    fetchUsers({
      ...filters,
      search: searchQuery.trim() || undefined,
    });
  };

  useEffect(() => {
    if (isSuperAdmin && (!companiesReady || !selectedCompanyId)) return;
    loadFilterOptions();
    refreshUsers();
  }, [isSuperAdmin, selectedCompanyId, companiesReady]);

  const divisionNameById = useMemo(
    () => buildDivisionNameMap(divisions),
    [divisions]
  );

  const filteredUsers = useMemo(
    () => users.map((user) => enrichUserDivisionLabels(user, divisionNameById)),
    [users, divisionNameById]
  );

  const hasActiveFilters = hasActiveUserFilters(filters, searchQuery);

  const resetFilters = () => {
    setSearchQuery("");
    setFilters({ ...DEFAULT_USER_FILTERS });
    fetchUsers({ ...DEFAULT_USER_FILTERS });
  };

  const handleEditUser = async (user) => {
    setLoadingEditUser(true);
    try {
      const response = await companyAPI.getUsers({
        userId: user.userId,
        status: "All",
      });
      const freshUser = response.data?.users?.[0];
      setEditingUser(
        freshUser ? mapCompanyUser(freshUser) : user
      );
      setView("edit");
    } catch {
      setEditingUser(user);
      setView("edit");
    } finally {
      setLoadingEditUser(false);
    }
  };

  const openAssignTeamsModal = async (user) => {
    try {
      const response = await companyAPI.getUsers({
        userId: user.userId,
        status: "All",
      });
      const freshUser = response.data?.users?.[0];
      setAssignUser(
        enrichUserDivisionLabels(
          freshUser ? mapCompanyUser(freshUser) : user,
          divisionNameById
        )
      );
    } catch {
      setAssignUser(enrichUserDivisionLabels(user, divisionNameById));
    }
  };

  const handleDeleteUser = async (user) => {
    if (!user?.userId) {
      Swal.fire({
        icon: "error",
        title: "Cannot delete",
        text: "Missing user information.",
      });
      return;
    }

    const confirmation = await Swal.fire({
      icon: "warning",
      title: "Delete user?",
      html: `Deactivate <strong>${user.name}</strong>?<br/>They will be marked inactive and hidden from the active user list.`,
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (!confirmation.isConfirmed) return;

    setDeletingUserId(user.userId);
    try {
      const result = await deleteUser(user.userId);
      if (result.success) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "User deleted",
          text: `"${user.name}" is now inactive.`,
          timer: 2200,
          showConfirmButton: false,
        });
        refreshUsers();
      } else {
        Swal.fire({
          icon: "error",
          title: "Delete failed",
          text: result.error,
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Delete failed",
        text: err?.message || "Could not delete user.",
      });
    } finally {
      setDeletingUserId(null);
    }
  };

  if (loadingEditUser) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white">
        <Loader2 className="h-9 w-9 animate-spin text-[#00ADE5]" />
        <p className="text-sm font-semibold text-[#003366]">Loading user…</p>
      </div>
    );
  }

  if (view === "create" || view === "edit") {
    return (
      <CreateUser
        editUser={view === "edit" ? editingUser : null}
        onBack={() => {
          setView("list");
          setEditingUser(null);
        }}
        onSuccess={() => {
          setView("list");
          setEditingUser(null);
          refreshUsers();
        }}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">User List</h2>
          <p className="text-sm text-gray-500">
            {companyMeta?.companyName
              ? `${companyMeta.companyName} · ${companyMeta.totalUsers ?? users.length} user${(companyMeta.totalUsers ?? users.length) === 1 ? "" : "s"}`
              : "Filter and manage users in your league"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setView("create")}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#003366] to-[#004080] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
          >
            <Plus className="h-4 w-4" />
            Create User
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gradient-to-r from-[#003366]/[0.03] to-[#00ADE5]/[0.05] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#003366]/10">
              <Filter className="h-4 w-4 text-[#003366]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Filter Users</h3>
              <p className="text-xs text-gray-500">
                Filter by status, role, division, team, user ID or search
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#00ADE5]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && refreshUsers()}
                placeholder="Search by name, email or username…"
                className="w-full rounded-xl border border-gray-200 bg-slate-50/50 py-3 pl-11 pr-4 text-sm shadow-sm transition focus:border-[#00ADE5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00ADE5]/20"
              />
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={resetFilters}
                disabled={loading}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 disabled:opacity-60 lg:flex-none"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
              <button
                type="button"
                onClick={refreshUsers}
                disabled={loading}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#003366] to-[#004080] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-60 lg:flex-none"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                Apply Filters
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <FilterField icon={CheckCircle2} label="Status">
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, status: e.target.value }))
                }
                className={selectClass}
              >
                <option>Active</option>
                <option>Inactive</option>
                <option>All</option>
              </select>
            </FilterField>

            <FilterField icon={Shield} label="Role">
              <select
                value={filters.role}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, role: e.target.value }))
                }
                className={selectClass}
              >
                {USER_ROLE_FILTER_OPTIONS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </FilterField>

            <FilterField icon={Layers} label="Division">
              <select
                value={filters.division}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, division: e.target.value }))
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

            <FilterField icon={Users} label="Team">
              <select
                value={filters.team}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, team: e.target.value }))
                }
                className={selectClass}
              >
                <option value="All">All teams</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </FilterField>

            <FilterField icon={UserRound} label="User ID" showCaret={false}>
              <input
                type="text"
                value={filters.userId}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, userId: e.target.value }))
                }
                placeholder="24-char user _id"
                className={`${selectClass} pr-3`}
              />
            </FilterField>
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
              <span className="text-xs font-semibold text-gray-500">
                Active:
              </span>
              {searchQuery.trim() && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#00ADE5]/10 px-2.5 py-1 text-xs font-medium text-[#0088cc]">
                  Search: {searchQuery.trim()}
                </span>
              )}
              {filters.status !== DEFAULT_USER_FILTERS.status && (
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                  Status: {filters.status}
                </span>
              )}
              {filters.role !== DEFAULT_USER_FILTERS.role && (
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                  Role: {filters.role}
                </span>
              )}
              {filters.division !== DEFAULT_USER_FILTERS.division && (
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                  Division:{" "}
                  {divisions.find((d) => d.id === filters.division)?.name ||
                    filters.division}
                </span>
              )}
              {filters.team !== DEFAULT_USER_FILTERS.team && (
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                  Team:{" "}
                  {teams.find((t) => t.id === filters.team)?.name ||
                    filters.team}
                </span>
              )}
              {filters.userId?.trim() && (
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                  User ID: {filters.userId.trim()}
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

      {/* Table */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/80 backdrop-blur-[2px]">
            <Loader2 className="h-9 w-9 animate-spin text-[#00ADE5]" />
            <p className="text-sm font-semibold text-[#003366]">
              Loading users…
            </p>
          </div>
        )}
        <div
          className={`overflow-x-auto transition-opacity duration-200 ${
            loading ? "pointer-events-none opacity-40" : "opacity-100"
          }`}
        >
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="bg-gradient-to-r from-[#003366] to-[#004080] text-white">
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                  Name
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                  Role
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                  Divisions
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                  Teams
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                  Email
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                  Date of Birth
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                  Has Login?
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                  Verified Email?
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="10" className="h-52" />
                </tr>
              ) : !loading && filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-6 py-14 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00ADE5]/10">
                        <UserRound className="h-7 w-7 text-[#00ADE5]" />
                      </div>
                      <p className="text-base font-semibold text-gray-800">
                        No users found
                      </p>
                      <p className="text-sm text-gray-500">
                        Adjust filters or create a new user.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.userId}
                    className="transition-colors hover:bg-slate-50/80"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900">{user.name}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-[#00ADE5]/10 px-2.5 py-1 text-xs font-semibold text-[#0088cc]">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {userHasPlayerRole(user) ? (
                        <CountBadgeButton
                          count={getUserDivisionItems(user, divisionNameById).length}
                          icon={Layers}
                          title="View divisions"
                          onClick={() => setDivisionsViewUser(user)}
                        />
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {userHasPlayerRole(user) ? (
                        <CountBadgeButton
                          count={getUserTeamItems(user).length}
                          icon={Users}
                          title="View teams"
                          onClick={() => setTeamsViewUser(user)}
                        />
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {formatDate(user.dateOfBirth)}
                    </td>
                    <td className="px-5 py-4">
                      {user.hasLogin ? (
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600">
                          <CheckCircle2 className="h-4 w-4" />
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-sm text-gray-400">
                          <XCircle className="h-4 w-4" />
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {user.verifiedEmail ? (
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600">
                          <CheckCircle2 className="h-4 w-4" />
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-sm text-gray-400">
                          <XCircle className="h-4 w-4" />
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          user.status === "Active"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {userHasPlayerRole(user) && (
                          <button
                            type="button"
                            onClick={() => openAssignTeamsModal(user)}
                            title="Assign to team"
                            className="rounded-lg p-2 text-[#00ADE5] transition hover:bg-[#00ADE5]/10"
                          >
                            <UserPlus size={18} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleEditUser(user)}
                          disabled={loadingEditUser}
                          title="Edit user"
                          className="rounded-lg p-2 text-[#003366] transition hover:bg-[#003366]/10 disabled:opacity-50"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(user)}
                          disabled={
                            deletingUserId === user.userId ||
                            user.status === "Inactive"
                          }
                          title={
                            user.status === "Inactive"
                              ? "User is already inactive"
                              : "Delete user"
                          }
                          className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          {deletingUserId === user.userId ? (
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

      <ListViewModal
        isOpen={Boolean(divisionsViewUser)}
        onClose={() => setDivisionsViewUser(null)}
        title={divisionsViewUser?.name || "Player divisions"}
        subtitle={
          divisionsViewUser
            ? `${getUserDivisionItems(divisionsViewUser, divisionNameById).length} division${
                getUserDivisionItems(divisionsViewUser, divisionNameById).length === 1
                  ? ""
                  : "s"
              } assigned`
            : ""
        }
        labelledBy="user-divisions-title"
        items={
          divisionsViewUser
            ? getUserDivisionItems(divisionsViewUser, divisionNameById)
            : []
        }
        emptyIcon={Layers}
        emptyTitle="No divisions assigned"
        emptyHint="Assign this player to a team linked to a division."
        renderItem={(division, index) => (
          <ListItemCard name={division.name} index={index} />
        )}
      />

      <ListViewModal
        isOpen={Boolean(teamsViewUser)}
        onClose={() => setTeamsViewUser(null)}
        title={teamsViewUser?.name || "Player teams"}
        subtitle={
          teamsViewUser
            ? `${getUserTeamItems(teamsViewUser).length} team${
                getUserTeamItems(teamsViewUser).length === 1 ? "" : "s"
              } assigned`
            : ""
        }
        labelledBy="user-teams-title"
        items={teamsViewUser ? getUserTeamItems(teamsViewUser) : []}
        emptyIcon={Users}
        emptyTitle="No teams assigned"
        emptyHint="Use Assign to Team to add this player to a squad."
        renderItem={(team, index) => (
          <ListItemCard name={team.name} index={index} />
        )}
      />

      <AssignPlayerToTeamsModal
        isOpen={Boolean(assignUser)}
        user={assignUser}
        allTeams={teamRecords}
        divisionNameById={divisionNameById}
        onClose={() => setAssignUser(null)}
        onSuccess={refreshUsers}
      />
    </div>
  );
}
