import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Building2,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  UserCog,
} from "lucide-react";
import clsx from "clsx";
import Swal from "sweetalert2";
import { roleAPI } from "../../../services/api";
import { useCompanyContext } from "../../../context/CompanyContext";
import { useRbacContext } from "../../../hooks/useRbacContext";
import { useRbacFetch } from "../../../hooks/useRbacFetch";
import RoleFormDrawer from "../../../components/rbac/RoleFormDrawer";
import {
  RbacPageHeader,
  RbacCard,
  StatCard,
  WorkspaceBanner,
} from "../../../components/rbac/RbacContent";
import {
  RbacBadge,
  rbacBtnPrimary,
  rbacBtnSecondary,
  rbacSelect,
} from "../../../components/rbac/rbacTheme";

function roleInitials(name) {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function companyInitials(name) {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function CompanyRolesList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { needsCompany, companiesReady, user, isSuperAdmin } = useRbacContext();
  const { selectedCompany } = useCompanyContext();

  const [filterActive, setFilterActive] = useState("");
  const [search, setSearch] = useState("");
  const [removingId, setRemovingId] = useState(null);

  const drawerRoleId = searchParams.get("roleId");
  const drawerCreate = searchParams.get("create") === "true";
  const drawerOpen = drawerCreate || Boolean(drawerRoleId);

  const fetchEnabled = companiesReady && !needsCompany;

  const companyName =
    selectedCompany?.companyName || selectedCompany?.name || user?.companyName || "Company";

  const {
    data: roles,
    loading,
    reload: loadRoles,
  } = useRbacFetch(
    async () => {
      const query = {};
      if (filterActive !== "") query.isActive = filterActive;
      const res = await roleAPI.getCompanyRoles(query);
      return Array.isArray(res.data) ? res.data : [];
    },
    [filterActive],
    { enabled: fetchEnabled, initialData: [] }
  );

  const stats = useMemo(() => {
    const list = roles || [];
    return {
      total: list.length,
      active: list.filter((r) => r.isActive !== false).length,
      system: list.filter((r) => r.isSystemRole).length,
      company: list.filter((r) => !r.isSystemRole).length,
    };
  }, [roles]);

  const filteredRoles = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return roles || [];
    return (roles || []).filter((r) => {
      const name = (r.roleName || "").toLowerCase();
      const desc = (r.description || r.companyDescription || "").toLowerCase();
      return name.includes(q) || desc.includes(q);
    });
  }, [roles, search]);

  const openCreateDrawer = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("roleId");
    next.set("create", "true");
    setSearchParams(next, { replace: true });
  };

  const openEditDrawer = (role) => {
    if (role.isSystemRole && !isSuperAdmin) {
      Swal.fire({
        icon: "info",
        title: "System role",
        text: "Only Super Admin can edit system roles.",
      });
      return;
    }
    const roleId = role.roleId || role._id || role.id;
    const next = new URLSearchParams(searchParams);
    next.delete("create");
    next.set("roleId", roleId);
    setSearchParams(next, { replace: true });
  };

  const closeDrawer = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("roleId");
    next.delete("create");
    setSearchParams(next, { replace: true });
  };

  const canManageRole = (role) => !role.isSystemRole || isSuperAdmin;

  const handleDelete = async (role) => {
    if (!canManageRole(role)) {
      Swal.fire({
        icon: "info",
        title: "System role",
        text: "Only Super Admin can delete system roles.",
      });
      return;
    }

    const roleId = role.roleId || role._id || role.id;
    const isSystem = Boolean(role.isSystemRole);
    const confirm = await Swal.fire({
      title: isSystem ? "Delete system role?" : "Delete role?",
      text: isSystem
        ? `"${role.roleName}" is a system role and will be permanently deleted.`
        : `"${role.roleName}" will be removed from this company.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
    });
    if (!confirm.isConfirmed) return;

    setRemovingId(roleId);
    try {
      if (isSystem) {
        await roleAPI.delete(roleId);
      } else {
        await roleAPI.unmapFromCompany({ roleId });
      }
      await loadRoles();
      Swal.fire({
        icon: "success",
        title: "Role deleted",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Unable to delete role", text: err.message });
    } finally {
      setRemovingId(null);
    }
  };

  if (needsCompany) {
    return (
      <>
        <RbacPageHeader
          title="Role Management"
          description="Create roles and define page-level permissions for your company."
        />
        <div className="p-5 sm:p-6">
          <RbacCard className="px-5 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#00ADE5]/10">
              <Building2 className="text-[#00ADE5]" size={30} strokeWidth={1.75} />
            </div>
            <p className="mt-4 text-base font-semibold text-gray-900">Select a company first</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
              Go to Company Management and select a workspace before managing roles.
            </p>
          </RbacCard>
        </div>
      </>
    );
  }

  return (
    <>
      <RbacPageHeader
        title="Role Management"
        description="Create roles and define View, Add, Edit, and Delete access for each page."
        actions={
          <>
            <button
              type="button"
              onClick={() => loadRoles()}
              disabled={loading}
              className={rbacBtnSecondary}
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button type="button" onClick={openCreateDrawer} className={rbacBtnPrimary}>
              <Plus size={15} />
              New Role
            </button>
          </>
        }
      />

      <div className="space-y-5 p-5 sm:p-6">
        <WorkspaceBanner
          title={companyName}
          subtitle="Managing roles for"
          initials={companyInitials(companyName)}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={Shield}
            label="Total roles"
            value={loading ? "—" : stats.total}
            hint={`${stats.active} active`}
            accent="navy"
          />
          <StatCard
            icon={UserCog}
            label="System roles"
            value={loading ? "—" : stats.system}
            hint="Platform defaults"
            accent="slate"
          />
          <StatCard
            icon={Building2}
            label="Company roles"
            value={loading ? "—" : stats.company}
            hint="Custom roles"
            accent="cyan"
          />
        </div>

        <RbacCard className="overflow-hidden">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-gray-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-[#003366]">All roles</h2>
              <p className="mt-0.5 text-xs text-gray-500">
                {filteredRoles.length} role{filteredRoles.length === 1 ? "" : "s"}
                {search ? " matching search" : ""}
              </p>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <div className="w-40">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </label>
                <select
                  value={filterActive}
                  onChange={(e) => setFilterActive(e.target.value)}
                  className={rbacSelect}
                >
                  <option value="">All</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div className="relative w-full sm:w-64">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name…"
                  className={`${rbacSelect} pl-9`}
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-[#00ADE5]" size={32} />
              </div>
            ) : filteredRoles.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00ADE5]/10">
                  <UserCog className="text-[#00ADE5]" size={26} strokeWidth={1.75} />
                </div>
                <p className="mt-4 text-sm font-medium text-gray-900">
                  {search ? "No matching roles" : "No roles found"}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {search
                    ? "Try a different search term."
                    : "Create a role and set page permissions."}
                </p>
                {!search && (
                  <button type="button" onClick={openCreateDrawer} className={`${rbacBtnPrimary} mt-5`}>
                    <Plus size={15} />
                    New Role
                  </button>
                )}
              </div>
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-[#003366] text-white">
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">
                      Status
                    </th>
                    <th className="hidden px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider lg:table-cell">
                      Description
                    </th>
                    <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredRoles.map((role, idx) => {
                    const id = role.roleId || role._id || role.id;
                    const description = role.description || role.companyDescription;
                    const isActive = role.isActive !== false;
                    const isRemoving = removingId === id;

                    return (
                      <tr
                        key={id}
                        className={clsx(
                          "transition-colors",
                          idx % 2 === 1 ? "bg-gray-50/40 hover:bg-gray-50" : "hover:bg-gray-50"
                        )}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <span
                              className={clsx(
                                "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                                role.isSystemRole
                                  ? "bg-[#003366]/10 text-[#003366]"
                                  : "bg-[#00ADE5]/10 text-[#00ADE5]"
                              )}
                            >
                              {roleInitials(role.roleName)}
                            </span>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-medium text-gray-900">{role.roleName}</p>
                                {role.isSystemRole && (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-[#00ADE5]/35 bg-[#00ADE5]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#003366]">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#00ADE5]" />
                                    System Role
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <RbacBadge variant={isActive ? "success" : "muted"}>
                            {isActive ? "Active" : "Inactive"}
                          </RbacBadge>
                        </td>
                        <td className="hidden max-w-[220px] truncate px-4 py-3.5 text-gray-500 lg:table-cell">
                          {description || "—"}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-0.5">
                            {canManageRole(role) ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => openEditDrawer(role)}
                                  aria-label={`Edit ${role.roleName}`}
                                  title="Edit"
                                  className="inline-flex items-center justify-center rounded-lg p-2 text-[#003366] transition hover:bg-gray-100"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(role)}
                                  disabled={isRemoving}
                                  aria-label={`Delete ${role.roleName}`}
                                  title="Delete"
                                  className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                >
                                  {isRemoving ? (
                                    <Loader2 size={15} className="animate-spin" />
                                  ) : (
                                    <Trash2 size={15} />
                                  )}
                                </button>
                              </>
                            ) : (
                              <span
                                className="px-2 text-xs text-gray-400"
                                title="Only Super Admin can manage system roles"
                              >
                                —
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </RbacCard>
      </div>

      <RoleFormDrawer
        isOpen={drawerOpen}
        onClose={closeDrawer}
        roleId={drawerCreate ? null : drawerRoleId}
        onSaved={() => {
          window.location.reload();
        }}
      />
    </>
  );
}
