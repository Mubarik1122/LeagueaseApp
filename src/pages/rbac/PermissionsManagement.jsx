import { useMemo, useState } from "react";
import {
  CheckCircle2,
  KeyRound,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
import clsx from "clsx";
import Swal from "sweetalert2";
import { permissionAPI } from "../../services/api";
import Modal from "../../components/Modal";
import { useRbacContext } from "../../hooks/useRbacContext";
import { useRbacFetch } from "../../hooks/useRbacFetch";
import {
  RbacPageHeader,
  RbacCard,
  StatCard,
  WorkspaceBanner,
} from "../../components/rbac/RbacContent";
import {
  RbacBadge,
  rbacBtnPrimary,
  rbacBtnSecondary,
  rbacSelect,
} from "../../components/rbac/rbacTheme";

const emptyForm = {
  permissionId: "",
  permissionKey: "",
  permissionName: "",
  description: "",
  isActive: true,
};

function toPermissionKeySlug(name) {
  return String(name || "")
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

function getPermissionId(perm) {
  return perm?.permissionId || perm?._id || perm?.id || "";
}

export default function PermissionsManagement() {
  const { isSuperAdmin } = useRbacContext();
  const [filterActive, setFilterActive] = useState("");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [keyManual, setKeyManual] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(form.permissionId);

  const {
    data: permissions,
    loading,
    reload: loadPermissions,
  } = useRbacFetch(
    async () => {
      const query = {};
      if (filterActive !== "") query.isActive = filterActive;
      const res = await permissionAPI.getPermissions(query);
      return Array.isArray(res.data) ? res.data : [];
    },
    [filterActive],
    { initialData: [] }
  );

  const stats = useMemo(() => {
    const list = permissions || [];
    return {
      total: list.length,
      active: list.filter((p) => p.isActive !== false).length,
      inactive: list.filter((p) => p.isActive === false).length,
    };
  }, [permissions]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return permissions || [];
    return (permissions || []).filter((p) => {
      const name = (p.permissionName || "").toLowerCase();
      const key = (p.permissionKey || p.key || "").toLowerCase();
      const desc = (p.description || "").toLowerCase();
      return name.includes(q) || key.includes(q) || desc.includes(q);
    });
  }, [permissions, search]);

  const openCreate = () => {
    setForm(emptyForm);
    setKeyManual(false);
    setModalOpen(true);
  };

  const openEdit = (perm) => {
    setForm({
      permissionId: getPermissionId(perm),
      permissionKey: perm.permissionKey || perm.key || "",
      permissionName: perm.permissionName || "",
      description: perm.description || "",
      isActive: perm.isActive !== false,
    });
    setKeyManual(true);
    setModalOpen(true);
  };

  const handleNameChange = (e) => {
    const permissionName = e.target.value;
    setForm((prev) => ({
      ...prev,
      permissionName,
      ...(isEdit || keyManual
        ? {}
        : { permissionKey: toPermissionKeySlug(permissionName) }),
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.permissionName.trim() || !form.permissionKey.trim()) {
      Swal.fire({ icon: "warning", title: "Name and key are required" });
      return;
    }

    const payload = {
      permissionKey: form.permissionKey.trim(),
      permissionName: form.permissionName.trim(),
      description: form.description.trim(),
      isActive: Boolean(form.isActive),
    };
    if (form.permissionId) payload.permissionId = form.permissionId;

    setSaving(true);
    try {
      await permissionAPI.upsert(payload);
      setModalOpen(false);
      await loadPermissions();
      Swal.fire({
        icon: "success",
        title: isEdit ? "Permission updated" : "Permission created",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Save failed", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <RbacPageHeader
        title="Permission Management"
        description="Actions that can be granted on each page (view, create, edit, etc.)."
        actions={
          <>
            <button
              type="button"
              onClick={() => loadPermissions()}
              disabled={loading}
              className={rbacBtnSecondary}
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            {isSuperAdmin && (
              <button type="button" onClick={openCreate} className={rbacBtnPrimary}>
                <Plus size={15} />
                Add Permission
              </button>
            )}
          </>
        }
      />

      <div className="space-y-5 p-5 sm:p-6">
        <WorkspaceBanner
          title="Permission directory"
          subtitle="Access control actions"
          initials="PM"
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={KeyRound}
            label="Total permissions"
            value={loading ? "—" : stats.total}
            hint="Available actions"
            accent="navy"
          />
          <StatCard
            icon={CheckCircle2}
            label="Active"
            value={loading ? "—" : stats.active}
            hint="Usable in role config"
            accent="cyan"
          />
          <StatCard
            icon={XCircle}
            label="Inactive"
            value={loading ? "—" : stats.inactive}
            hint="Hidden from role config"
            accent="slate"
          />
        </div>

        <RbacCard className="overflow-hidden">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-gray-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-[#003366]">All permissions</h2>
              <p className="mt-0.5 text-xs text-gray-500">
                {filtered.length} permission{filtered.length === 1 ? "" : "s"}
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
            ) : filtered.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00ADE5]/10">
                  <KeyRound className="text-[#00ADE5]" size={26} strokeWidth={1.75} />
                </div>
                <p className="mt-4 text-sm font-medium text-gray-900">
                  {search ? "No matching permissions" : "No permissions found"}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {search
                    ? "Try a different search term."
                    : "Add a permission to get started."}
                </p>
                {!search && isSuperAdmin && (
                  <button type="button" onClick={openCreate} className={`${rbacBtnPrimary} mt-5`}>
                    <Plus size={15} />
                    Add Permission
                  </button>
                )}
              </div>
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-[#003366] text-white">
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">
                      Permission
                    </th>
                    <th className="hidden px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider md:table-cell">
                      Description
                    </th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">
                      Status
                    </th>
                    {isSuperAdmin && (
                      <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filtered.map((perm, idx) => {
                    const id = getPermissionId(perm);
                    const name = perm.permissionName || "—";
                    const isActive = perm.isActive !== false;

                    return (
                      <tr
                        key={id || name}
                        className={clsx(
                          "transition-colors",
                          idx % 2 === 1 ? "bg-gray-50/40 hover:bg-gray-50" : "hover:bg-gray-50"
                        )}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#00ADE5]/10 text-[#00ADE5]">
                              <KeyRound size={16} />
                            </span>
                            <p className="font-medium text-gray-900">{name}</p>
                          </div>
                        </td>
                        <td className="hidden max-w-[320px] truncate px-4 py-3.5 text-gray-500 md:table-cell">
                          {perm.description || "—"}
                        </td>
                        <td className="px-5 py-3.5">
                          <RbacBadge variant={isActive ? "success" : "muted"}>
                            {isActive ? "Active" : "Inactive"}
                          </RbacBadge>
                        </td>
                        {isSuperAdmin && (
                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-end">
                              <button
                                type="button"
                                onClick={() => openEdit(perm)}
                                aria-label={`Edit ${name}`}
                                title="Edit"
                                className="inline-flex items-center justify-center rounded-lg p-2 text-[#003366] transition hover:bg-gray-100"
                              >
                                <Pencil size={14} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </RbacCard>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} panelClassName="max-w-lg w-full">
        <form onSubmit={handleSave} className="p-6">
          <h3 className="text-lg font-bold text-[#003366]">
            {isEdit ? "Edit Permission" : "Create Permission"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {isEdit
              ? "Update name, description, or status. Key stays the same."
              : "Define an action that can be granted on pages."}
          </p>
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Permission name <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={form.permissionName}
                onChange={handleNameChange}
                className={`${rbacSelect} mt-1`}
                placeholder="e.g. Approve"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Permission key <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={form.permissionKey}
                onChange={(e) => {
                  if (isEdit) return;
                  setKeyManual(true);
                  setForm({ ...form, permissionKey: toPermissionKeySlug(e.target.value) });
                }}
                className={`${rbacSelect} mt-1`}
                placeholder="e.g. approve"
                disabled={isEdit}
              />
              <p className="mt-1.5 text-xs text-gray-400">
                {isEdit
                  ? "Key cannot be changed after create."
                  : "Auto-generated from the name. Used internally."}
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className={`${rbacSelect} mt-1`}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              Active
            </label>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" onClick={() => setModalOpen(false)} className={rbacBtnSecondary}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className={rbacBtnPrimary}>
              {saving ? <Loader2 size={15} className="animate-spin" /> : null}
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
