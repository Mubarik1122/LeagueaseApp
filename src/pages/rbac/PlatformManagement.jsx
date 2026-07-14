import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Laptop,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import clsx from "clsx";
import Swal from "sweetalert2";
import { platformAPI } from "../../services/api";
import { useRbacContext } from "../../hooks/useRbacContext";
import { useRbacFetch } from "../../hooks/useRbacFetch";
import PlatformFormDrawer from "../../components/rbac/PlatformFormDrawer";
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
  platformId: "",
  platformKey: "",
  platformName: "",
  description: "",
  isActive: true,
};

function getPlatformId(platform) {
  return platform?.platformId || platform?._id || platform?.id || "";
}

export default function PlatformManagement() {
  const { isSuperAdmin } = useRbacContext();
  const [filterActive, setFilterActive] = useState("");
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const {
    data: platforms,
    loading,
    reload: loadPlatforms,
  } = useRbacFetch(
    async () => {
      const query = {};
      if (filterActive !== "") query.isActive = filterActive;
      const res = await platformAPI.getPlatforms(query);
      return Array.isArray(res.data) ? res.data : [];
    },
    [filterActive],
    { initialData: [] }
  );

  const stats = useMemo(() => {
    const list = platforms || [];
    return {
      total: list.length,
      active: list.filter((p) => p.isActive !== false).length,
      inactive: list.filter((p) => p.isActive === false).length,
    };
  }, [platforms]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return platforms || [];
    return (platforms || []).filter((p) => {
      const name = (p.platformName || p.name || "").toLowerCase();
      const key = (p.platformKey || p.key || "").toLowerCase();
      const desc = (p.description || "").toLowerCase();
      return name.includes(q) || key.includes(q) || desc.includes(q);
    });
  }, [platforms, search]);

  const openCreate = () => {
    setForm(emptyForm);
    setDrawerOpen(true);
  };

  const openEdit = (platform) => {
    setForm({
      platformId: getPlatformId(platform),
      platformKey: platform.platformKey || platform.key || "",
      platformName: platform.platformName || platform.name || "",
      description: platform.description || "",
      isActive: platform.isActive !== false,
    });
    setDrawerOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.platformName.trim() || !form.platformKey.trim()) {
      Swal.fire({ icon: "warning", title: "Name and key are required" });
      return;
    }

    const payload = {
      platformName: form.platformName.trim(),
      platformKey: form.platformKey.trim(),
      description: form.description.trim(),
      isActive: form.isActive,
    };
    if (form.platformId) payload.platformId = form.platformId;

    setSaving(true);
    try {
      await platformAPI.upsert(payload);
      setDrawerOpen(false);
      await loadPlatforms();
      Swal.fire({
        icon: "success",
        title: form.platformId ? "Platform updated" : "Platform created",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Save failed", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (platform) => {
    const key = platform.platformKey || platform.key || "";
    const name = platform.platformName || platform.name || "this platform";
    if (!key) {
      Swal.fire({ icon: "error", title: "Delete failed", text: "Platform key is missing." });
      return;
    }

    const confirm = await Swal.fire({
      title: "Delete platform?",
      text: `"${name}" will be permanently removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
    });
    if (!confirm.isConfirmed) return;

    setDeletingId(key);
    try {
      await platformAPI.delete(key);
      await loadPlatforms();
      Swal.fire({
        icon: "success",
        title: "Platform deleted",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Delete failed", text: err.message });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <RbacPageHeader
        title="Platform Management"
        description="Manage platforms used for role page access across Website, Mobile, and more."
        actions={
          <>
            <button
              type="button"
              onClick={() => loadPlatforms()}
              disabled={loading}
              className={rbacBtnSecondary}
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            {isSuperAdmin && (
              <button type="button" onClick={openCreate} className={rbacBtnPrimary}>
                <Plus size={15} />
                Add Platform
              </button>
            )}
          </>
        }
      />

      <div className="space-y-5 p-5 sm:p-6">
        <WorkspaceBanner
          title="Platform directory"
          subtitle="Access control platforms"
          initials="PL"
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={Laptop}
            label="Total platforms"
            value={loading ? "—" : stats.total}
            hint="Registered platforms"
            accent="navy"
          />
          <StatCard
            icon={CheckCircle2}
            label="Active"
            value={loading ? "—" : stats.active}
            hint="Available in role tabs"
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
              <h2 className="text-sm font-semibold text-[#003366]">All platforms</h2>
              <p className="mt-0.5 text-xs text-gray-500">
                {filtered.length} platform{filtered.length === 1 ? "" : "s"}
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
                  <Laptop className="text-[#00ADE5]" size={26} strokeWidth={1.75} />
                </div>
                <p className="mt-4 text-sm font-medium text-gray-900">
                  {search ? "No matching platforms" : "No platforms found"}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {search
                    ? "Try a different search term."
                    : "Add a platform to get started."}
                </p>
                {!search && isSuperAdmin && (
                  <button type="button" onClick={openCreate} className={`${rbacBtnPrimary} mt-5`}>
                    <Plus size={15} />
                    Add Platform
                  </button>
                )}
              </div>
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-[#003366] text-white">
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">
                      Platform
                    </th>
                    <th className="hidden px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider md:table-cell">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">
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
                  {filtered.map((platform, idx) => {
                    const id = getPlatformId(platform);
                    const name = platform.platformName || platform.name || "—";
                    const key = platform.platformKey || platform.key || "—";
                    const isActive = platform.isActive !== false;
                    const isDeleting = deletingId === key;

                    return (
                      <tr
                        key={id || key}
                        className={clsx(
                          "transition-colors",
                          idx % 2 === 1 ? "bg-gray-50/40 hover:bg-gray-50" : "hover:bg-gray-50"
                        )}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#00ADE5]/10 text-[#00ADE5]">
                              <Laptop size={16} />
                            </span>
                            <p className="font-medium text-gray-900">{name}</p>
                          </div>
                        </td>
                        <td className="hidden max-w-[280px] truncate px-4 py-3.5 text-gray-500 md:table-cell">
                          {platform.description || "—"}
                        </td>
                        <td className="px-4 py-3.5">
                          <RbacBadge variant={isActive ? "success" : "muted"}>
                            {isActive ? "Active" : "Inactive"}
                          </RbacBadge>
                        </td>
                        {isSuperAdmin && (
                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => openEdit(platform)}
                                aria-label="Edit platform"
                                title="Edit"
                                className="inline-flex items-center justify-center rounded-lg p-2 text-[#003366] transition hover:bg-gray-100"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(platform)}
                                disabled={isDeleting}
                                className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                aria-label={`Delete ${name}`}
                              >
                                {isDeleting ? (
                                  <Loader2 size={15} className="animate-spin" />
                                ) : (
                                  <Trash2 size={15} />
                                )}
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

      <PlatformFormDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        form={form}
        setForm={setForm}
        onSubmit={handleSave}
        saving={saving}
      />
    </>
  );
}
