import { useMemo, useState } from "react";
import {
  CheckCircle2,
  LayoutPanelLeft,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
import clsx from "clsx";
import Swal from "sweetalert2";
import { menuPlacementAPI } from "../../services/api";
import { useRbacContext } from "../../hooks/useRbacContext";
import { useRbacFetch } from "../../hooks/useRbacFetch";
import MenuPlacementFormDrawer from "../../components/rbac/MenuPlacementFormDrawer";
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
  placementId: "",
  placementKey: "",
  placementName: "",
  description: "",
  isActive: true,
  _editKey: "",
};

function getPlacementId(placement) {
  return placement?.placementId || placement?._id || placement?.id || "";
}

function getPlacementKey(placement) {
  return placement?.placementKey || placement?.key || "";
}

export default function MenuPlacementManagement() {
  const { isSuperAdmin } = useRbacContext();
  const [filterActive, setFilterActive] = useState("");
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const {
    data: placements,
    loading,
    reload: loadPlacements,
  } = useRbacFetch(
    async () => {
      const res = await menuPlacementAPI.getPlacements();
      return Array.isArray(res.data) ? res.data : [];
    },
    [],
    { initialData: [] }
  );

  const stats = useMemo(() => {
    const list = placements || [];
    return {
      total: list.length,
      active: list.filter((p) => p.isActive !== false).length,
      inactive: list.filter((p) => p.isActive === false).length,
    };
  }, [placements]);

  const filtered = useMemo(() => {
    let list = placements || [];
    if (filterActive === "true") {
      list = list.filter((p) => p.isActive !== false);
    } else if (filterActive === "false") {
      list = list.filter((p) => p.isActive === false);
    }
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((p) => {
      const name = (p.placementName || p.name || "").toLowerCase();
      const key = getPlacementKey(p).toLowerCase();
      const desc = (p.description || "").toLowerCase();
      return name.includes(q) || key.includes(q) || desc.includes(q);
    });
  }, [placements, search, filterActive]);

  const openCreate = () => {
    setForm(emptyForm);
    setDrawerOpen(true);
  };

  const openEdit = (placement) => {
    const key = getPlacementKey(placement);
    setForm({
      placementId: getPlacementId(placement),
      placementKey: key,
      placementName: placement.placementName || placement.name || "",
      description: placement.description || "",
      isActive: placement.isActive !== false,
      _editKey: key,
    });
    setDrawerOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.placementName.trim() || !form.placementKey.trim()) {
      Swal.fire({ icon: "warning", title: "Name and key are required" });
      return;
    }

    const payload = {
      placementKey: form.placementKey.trim(),
      placementName: form.placementName.trim(),
      description: form.description.trim(),
      isActive: Boolean(form.isActive),
    };
    if (form.placementId) payload.placementId = form.placementId;

    setSaving(true);
    try {
      await menuPlacementAPI.upsert(payload);
      setDrawerOpen(false);
      await loadPlacements();
      Swal.fire({
        icon: "success",
        title: form._editKey ? "Placement updated" : "Placement created",
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
        title="Menu Placement"
        description="Define where pages appear in the UI (side navigation, header, etc.)."
        actions={
          <>
            <button
              type="button"
              onClick={() => loadPlacements()}
              disabled={loading}
              className={rbacBtnSecondary}
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            {isSuperAdmin && (
              <button type="button" onClick={openCreate} className={rbacBtnPrimary}>
                <Plus size={15} />
                Add Placement
              </button>
            )}
          </>
        }
      />

      <div className="space-y-5 p-5 sm:p-6">
        <WorkspaceBanner
          title="Menu locations"
          subtitle="Used when creating pages"
          initials="MP"
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={LayoutPanelLeft}
            label="Total placements"
            value={loading ? "—" : stats.total}
            hint="Menu locations"
            accent="navy"
          />
          <StatCard
            icon={CheckCircle2}
            label="Active"
            value={loading ? "—" : stats.active}
            hint="Shown in page form"
            accent="cyan"
          />
          <StatCard
            icon={XCircle}
            label="Inactive"
            value={loading ? "—" : stats.inactive}
            hint="Hidden from page form"
            accent="slate"
          />
        </div>

        <RbacCard className="overflow-hidden">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-gray-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-[#003366]">All placements</h2>
              <p className="mt-0.5 text-xs text-gray-500">
                {filtered.length} placement{filtered.length === 1 ? "" : "s"}
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
                  placeholder="Search by name or key…"
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
                  <LayoutPanelLeft className="text-[#00ADE5]" size={26} strokeWidth={1.75} />
                </div>
                <p className="mt-4 text-sm font-medium text-gray-900">
                  {search ? "No matching placements" : "No menu placements yet"}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {search
                    ? "Try a different search term."
                    : 'Add "Side Navigation" or other locations pages can appear in.'}
                </p>
                {!search && isSuperAdmin && (
                  <button type="button" onClick={openCreate} className={`${rbacBtnPrimary} mt-5`}>
                    <Plus size={15} />
                    Add Placement
                  </button>
                )}
              </div>
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-[#003366] text-white">
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">
                      Placement
                    </th>
                    <th className="hidden px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider md:table-cell">
                      Key
                    </th>
                    <th className="hidden px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider lg:table-cell">
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
                  {filtered.map((placement, idx) => {
                    const id = getPlacementId(placement);
                    const name = placement.placementName || placement.name || "—";
                    const key = getPlacementKey(placement) || "—";
                    const isActive = placement.isActive !== false;

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
                              <LayoutPanelLeft size={16} />
                            </span>
                            <p className="font-medium text-gray-900">{name}</p>
                          </div>
                        </td>
                        <td className="hidden px-4 py-3.5 font-mono text-xs text-gray-500 md:table-cell">
                          {key}
                        </td>
                        <td className="hidden max-w-[280px] truncate px-4 py-3.5 text-gray-500 lg:table-cell">
                          {placement.description || "—"}
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
                                onClick={() => openEdit(placement)}
                                aria-label="Edit placement"
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

      <MenuPlacementFormDrawer
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
