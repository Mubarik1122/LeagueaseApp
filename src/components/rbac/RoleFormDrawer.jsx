import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  FolderOpen,
  FolderTree,
  Info,
  Loader2,
  Lock,
  Pencil,
  Plus,
  Shield,
  Trash2,
  UserCog,
} from "lucide-react";
import clsx from "clsx";
import Swal from "sweetalert2";
import Drawer from "../Drawer";
import { roleAPI } from "../../services/api";
import { useRbacContext } from "../../hooks/useRbacContext";
import { useRbacFetch } from "../../hooks/useRbacFetch";
import { rbacBtnPrimary, rbacBtnSecondary, rbacSelect } from "./rbacTheme";
import { PLATFORM_TABS, PERMISSION_CARD_META } from "../../pages/rbac/rbacNav";
import {
  buildColumnPermissionMap,
  buildPagePermMapFromSelection,
  buildPlatformPagePermMapsFromRole,
  buildPlatformPermissionsPayload,
  deriveSelectionFromPagePermMap,
  filterPagesByPlatform,
  getEntityId,
  getPlatformPageTree,
  normalizePlatform,
  PAGE_ACTION_COLUMNS,
  parseAccessMatrix,
  platformMapHasAccess,
  platformMapHasPages,
} from "./rolePermissions";

const NAME_MAX = 30;
const DESC_MAX = 1000;

const PERMISSION_ICONS = {
  view: Eye,
  add: Plus,
  edit: Pencil,
  delete: Trash2,
};

const emptyForm = {
  roleId: "",
  roleName: "",
  description: "",
  isSystemRole: false,
  isActive: true,
  targetCompanyId: "",
};

function FieldLabel({ children, required }) {
  return (
    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

function normalizePlatformList(list = []) {
  return list
    .map((p) => ({
      id: p.platformKey || p.key || p.platformId || p._id || p.id,
      label: p.platformName || p.name || p.platformKey || "Platform",
      platformId: p.platformId || p._id || p.id || "",
      sortOrder: Number(p.sortOrder ?? 0),
    }))
    .filter((p) => p.id)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

function SelectableCard({ checked, onClick, disabled, locked, icon, title, subtitle }) {
  return (
    <button
      type="button"
      disabled={disabled || locked}
      onClick={onClick}
      className={clsx(
        "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition",
        (disabled || locked) && "cursor-not-allowed",
        disabled && "opacity-40",
        locked && !disabled && "opacity-95",
        checked
          ? "border-[#00ADE5]/40 bg-gradient-to-r from-[#00ADE5]/10 to-white shadow-sm ring-1 ring-[#00ADE5]/20"
          : "border-gray-200/80 bg-white hover:border-[#003366]/20 hover:bg-[#f8fafc]"
      )}
    >
      <span
        className={clsx(
          "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          checked
            ? "bg-gradient-to-br from-[#003366] to-[#004080] text-white"
            : "bg-[#00ADE5]/10 text-[#00ADE5]"
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="block truncate text-sm font-semibold text-gray-900">{title}</span>
          {locked ? <Lock size={12} className="shrink-0 text-[#00ADE5]" /> : null}
        </span>
        {subtitle ? (
          <span className="mt-0.5 block truncate text-[11px] text-gray-400">{subtitle}</span>
        ) : null}
      </span>
      <span
        className={clsx(
          "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition",
          checked
            ? "bg-[#00ADE5] text-white"
            : "border border-gray-300 bg-white text-transparent"
        )}
      >
        <Check size={11} strokeWidth={3} />
      </span>
    </button>
  );
}

export default function RoleFormDrawer({ isOpen, onClose, roleId = null, onSaved }) {
  const { isSuperAdmin, companyId, companiesReady } = useRbacContext();
  const fetchEnabled = isOpen && companiesReady;
  const hydratedRef = useRef("");
  const tabsRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [activePlatform, setActivePlatform] = useState("");
  const [platformPermMaps, setPlatformPermMaps] = useState({});
  const [selectedPageIds, setSelectedPageIds] = useState(new Set());
  const [selectedColIds, setSelectedColIds] = useState(new Set());

  const isEdit = Boolean(roleId);
  const isSystemLocked = isEdit && form.isSystemRole && !isSuperAdmin;

  const { data, loading, error } = useRbacFetch(
    async () => {
      const companyQuery = companyId ? { companyId } : {};

      // Edit: only get-role-access (tree + grants + permissions)
      if (roleId) {
        const roleRes = await roleAPI.getRoleAccess(roleId, companyQuery);
        const roleData = roleRes.data || {};
        const parsed = parseAccessMatrix(roleData);
        return {
          pages: parsed.pages,
          permissions: parsed.permissions,
          platforms: parsed.platforms,
          treeByPlatform: parsed.treeByPlatform,
          roleData,
        };
      }

      // Create: only get-access-matrix
      const matrixRes = await roleAPI.getAccessMatrix(companyQuery);
      const matrix = parseAccessMatrix(matrixRes.data || {});
      return {
        pages: matrix.pages,
        permissions: matrix.permissions,
        platforms: matrix.platforms,
        treeByPlatform: matrix.treeByPlatform,
        roleData: null,
      };
    },
    [roleId, companyId],
    {
      enabled: fetchEnabled,
      initialData: {
        pages: [],
        permissions: [],
        platforms: [],
        treeByPlatform: {},
        roleData: null,
      },
    }
  );

  const pages = data?.pages ?? [];
  const columnPermissionMap = buildColumnPermissionMap(data?.permissions ?? []);

  const platformTabs = useMemo(() => {
    const fromApi = normalizePlatformList(data?.platforms || []);
    if (fromApi.length > 0) return fromApi;
    return PLATFORM_TABS.map((t) => ({ id: t.id, label: t.label, sortOrder: 0 }));
  }, [data?.platforms]);

  const platformTree = useMemo(() => {
    const fromTree = getPlatformPageTree(data?.treeByPlatform, activePlatform);
    if (fromTree.items?.length > 0 || fromTree.categories.length > 0 || fromTree.topLevelPages.length > 0) {
      return fromTree;
    }
    const topLevelPages = [...filterPagesByPlatform(pages, activePlatform)].sort(
      (a, b) =>
        (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0) ||
        String(a.pageName || "").localeCompare(String(b.pageName || ""))
    );
    return {
      categories: [],
      topLevelPages,
      items: topLevelPages.map((page) => ({
        type: "page",
        sortOrder: Number(page.sortOrder) || 0,
        page,
      })),
    };
  }, [data?.treeByPlatform, activePlatform, pages]);

  const platformPages = useMemo(() => {
    const fromCats = platformTree.categories.flatMap((c) => c.pages || []);
    const all = [...fromCats, ...platformTree.topLevelPages];
    const seen = new Set();
    return all.filter((p) => {
      const id = getEntityId(p);
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [platformTree]);

  const treeItems = platformTree.items?.length
    ? platformTree.items
    : [
        ...platformTree.categories.map((category) => ({
          type: "category",
          sortOrder: Number(category.sortOrder) || 0,
          category,
        })),
        ...platformTree.topLevelPages.map((page) => ({
          type: "page",
          sortOrder: Number(page.sortOrder) || 0,
          page,
        })),
      ].sort((a, b) => a.sortOrder - b.sortOrder);

  useEffect(() => {
    if (!isOpen) {
      hydratedRef.current = "";
      return;
    }
    const permMapKey = Object.entries(columnPermissionMap)
      .map(([k, v]) => `${k}:${v || ""}`)
      .join("|");
    const hydrateKey = `${roleId || "new"}:${companyId || ""}:${data?.roleData?.roleName || ""}:${platformTabs.map((t) => t.id).join(",")}:${permMapKey}`;
    if (!fetchEnabled || !data || hydratedRef.current === hydrateKey) return;
    if (platformTabs.length === 0) return;

    const defaultKey = platformTabs[0].id;

    if (data.roleData && roleId) {
      const roleData = data.roleData;
      const maps = buildPlatformPagePermMapsFromRole(
        roleData,
        platformTabs.map((t) => t.id),
        columnPermissionMap
      );

      setForm({
        roleId: roleData.roleId || roleId,
        roleName: roleData.roleName || "",
        description: roleData.description || roleData.companyDescription || "",
        isSystemRole: Boolean(roleData.isSystemRole),
        isActive: roleData.isActive !== false,
        targetCompanyId: roleData.companyId || companyId || "",
      });

      // Prefer platform that actually has granted pages (e.g. web over empty mobile)
      const firstWithAccess =
        platformTabs.find((t) => platformMapHasPages(maps[t.id]))?.id ||
        platformTabs.find((t) => {
          const plat = (roleData.platforms || []).find(
            (p) => normalizePlatform(p.platformKey) === normalizePlatform(t.id)
          );
          return plat?.hasAccess === true || plat?.isEnabled === true;
        })?.id ||
        defaultKey;

      setActivePlatform(firstWithAccess);

      const activeMap = maps[firstWithAccess] || {};
      const { selectedPageIds: pIds, selectedColIds: cIds } = deriveSelectionFromPagePermMap(
        activeMap,
        columnPermissionMap
      );
      const cols = new Set(cIds);
      if (pIds.size > 0 && columnPermissionMap.view) {
        cols.add("view");
        const viewId = columnPermissionMap.view;
        Object.keys(maps).forEach((platformKey) => {
          Object.keys(maps[platformKey] || {}).forEach((pageId) => {
            const set = new Set(maps[platformKey][pageId] || []);
            set.add(viewId);
            maps[platformKey][pageId] = set;
          });
        });
      }
      setSelectedPageIds(pIds);
      setSelectedColIds(cols);
      setPlatformPermMaps({ ...maps });
    } else {
      setForm({ ...emptyForm, targetCompanyId: companyId || "" });
      const empty = {};
      platformTabs.forEach((t) => {
        empty[t.id] = {};
      });
      setPlatformPermMaps(empty);
      setActivePlatform(defaultKey);
      setSelectedPageIds(new Set());
      setSelectedColIds(new Set());
    }

    hydratedRef.current = hydrateKey;
  }, [data, roleId, companyId, fetchEnabled, isOpen, columnPermissionMap, platformTabs]);

  useEffect(() => {
    if (error) {
      Swal.fire({ icon: "error", title: "Unable to load role", text: error.message });
    }
  }, [error]);

  const syncSelectionFromPlatform = (platform, maps) => {
    const { selectedPageIds: pIds, selectedColIds: cIds } = deriveSelectionFromPagePermMap(
      maps[platform] || {},
      columnPermissionMap
    );
    const cols = ensureRequiredView(pIds, cIds);
    setSelectedPageIds(pIds);
    setSelectedColIds(cols);
  };

  /** Any selected page always gets View; View cannot be removed while pages are selected. */
  const ensureRequiredView = (pageIds, colIds) => {
    const next = new Set(colIds);
    if (pageIds.size > 0 && columnPermissionMap.view) {
      next.add("view");
    }
    return next;
  };

  const updatePlatformMap = (platform, pageIds, colIds) => {
    const cols = ensureRequiredView(pageIds, colIds);
    const map = buildPagePermMapFromSelection(pageIds, cols, columnPermissionMap);
    setPlatformPermMaps((prev) => ({ ...prev, [platform]: map }));
    return cols;
  };

  const handlePlatformTab = (platformId) => {
    const cols = ensureRequiredView(selectedPageIds, selectedColIds);
    const nextMap = buildPagePermMapFromSelection(
      selectedPageIds,
      cols,
      columnPermissionMap
    );
    const nextMaps = { ...platformPermMaps, [activePlatform]: nextMap };
    setPlatformPermMaps(nextMaps);
    setActivePlatform(platformId);
    syncSelectionFromPlatform(platformId, nextMaps);
  };

  const togglePage = (pageId) => {
    const next = new Set(selectedPageIds);
    if (next.has(pageId)) next.delete(pageId);
    else next.add(pageId);
    setSelectedPageIds(next);
    const cols = updatePlatformMap(activePlatform, next, selectedColIds);
    setSelectedColIds(cols);
  };

  const toggleCol = (colId) => {
    // View is locked while any page is selected
    if (colId === "view" && selectedPageIds.size > 0 && selectedColIds.has("view")) {
      return;
    }
    const next = new Set(selectedColIds);
    if (next.has(colId)) next.delete(colId);
    else next.add(colId);
    const cols = ensureRequiredView(selectedPageIds, next);
    setSelectedColIds(cols);
    updatePlatformMap(activePlatform, selectedPageIds, cols);
  };

  const toggleAllPages = (checked) => {
    const next = checked
      ? new Set(platformPages.map((p) => getEntityId(p)))
      : new Set();
    setSelectedPageIds(next);
    const cols = updatePlatformMap(activePlatform, next, selectedColIds);
    setSelectedColIds(cols);
  };

  const toggleAllCols = (checked) => {
    let next;
    if (checked) {
      next = new Set(
        PAGE_ACTION_COLUMNS.map((c) => c.id).filter((id) => columnPermissionMap[id])
      );
    } else {
      next = new Set();
      // Keep View locked if pages remain selected
      if (selectedPageIds.size > 0 && columnPermissionMap.view) next.add("view");
    }
    const cols = ensureRequiredView(selectedPageIds, next);
    setSelectedColIds(cols);
    updatePlatformMap(activePlatform, selectedPageIds, cols);
  };

  const scrollTabs = (dir) => {
    tabsRef.current?.scrollBy({ left: dir * 160, behavior: "smooth" });
  };

  const requirements = useMemo(() => {
    const nameOk = form.roleName.trim().length >= 3;
    const descOk = form.description.trim().length >= 3;
    const platformOk = Object.values(platformPermMaps).some(platformMapHasAccess);
    return { nameOk, descOk, platformOk };
  }, [form, platformPermMaps]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSystemLocked) {
      Swal.fire({
        icon: "info",
        title: "System role",
        text: "Only Super Admin can edit system roles.",
      });
      return;
    }
    if (!requirements.nameOk) {
      Swal.fire({ icon: "warning", title: "Role name must be at least 3 characters" });
      return;
    }
    if (!requirements.platformOk) {
      Swal.fire({
        icon: "warning",
        title: "Select pages and permissions on at least one platform",
      });
      return;
    }

    const currentCols = ensureRequiredView(selectedPageIds, selectedColIds);
    const currentMap = buildPagePermMapFromSelection(
      selectedPageIds,
      currentCols,
      columnPermissionMap
    );
    const finalMaps = { ...platformPermMaps, [activePlatform]: currentMap };

    const platformPermissions = buildPlatformPermissionsPayload(
      finalMaps,
      platformTabs.map((t) => t.id)
    );

    if (platformPermissions.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Select pages and permissions on at least one platform",
      });
      return;
    }

    const payload = {
      ...(form.roleId || roleId ? { roleId: form.roleId || roleId } : {}),
      roleName: form.roleName.trim(),
      description: form.description.trim(),
      isActive: form.isActive,
      platformPermissions,
    };

    if (isSuperAdmin && form.isSystemRole) payload.isSystemRole = true;
    // companyId: withCompanyId() on API also fills this; set explicitly when known
    const cid = form.targetCompanyId || companyId;
    if (cid) payload.companyId = cid;

    setSaving(true);
    try {
      await roleAPI.upsert(payload);
      await Swal.fire({
        icon: "success",
        title: isEdit ? "Role updated" : "Role created",
        timer: 1400,
        showConfirmButton: false,
      });
      onSaved?.();
      onClose();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Save failed", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const allPagesSelected =
    platformPages.length > 0 &&
    platformPages.every((p) => selectedPageIds.has(getEntityId(p)));
  const allColsSelected =
    PAGE_ACTION_COLUMNS.filter((c) => columnPermissionMap[c.id]).length > 0 &&
    PAGE_ACTION_COLUMNS.every(
      (c) => !columnPermissionMap[c.id] || selectedColIds.has(c.id)
    );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Role" : "Add New Role"}
      subtitle={
        isEdit
          ? "Update role details and page permissions"
          : "Define access across platforms and pages"
      }
      widthClass="max-w-5xl"
      tone="role"
      labelledBy="role-form-drawer-title"
      footer={
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className={`${rbacBtnSecondary} min-w-[130px] justify-center`}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="role-form-drawer"
            disabled={saving || loading || isSystemLocked}
            className={`${rbacBtnPrimary} flex-1 justify-center py-3 text-[15px]`}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
            {isEdit ? "Save Changes" : "Create Role"}
          </button>
        </div>
      }
    >
      {loading ? (
        <div className="flex justify-center py-28">
          <Loader2 className="animate-spin text-[#00ADE5]" size={36} />
        </div>
      ) : (
        <form id="role-form-drawer" onSubmit={handleSubmit} className="space-y-5">
          {isSystemLocked && (
            <div className="rounded-xl border border-[#003366]/15 bg-gradient-to-r from-[#003366]/5 to-[#00ADE5]/5 px-4 py-3 text-sm text-[#003366]">
              This is a system role. Only Super Admin can edit or delete it.
            </div>
          )}
          <fieldset disabled={isSystemLocked} className="min-w-0 space-y-5 disabled:opacity-80">
            <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#003366] to-[#004080] text-white shadow-md">
                  <UserCog size={22} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#003366]">
                    {form.roleName.trim() || (isEdit ? "Edit role" : "New role")}
                  </p>
                  <p className="text-xs text-gray-500">
                    {form.isSystemRole ? "System role · Super Admin only" : "Company role"}
                  </p>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
                <div className="space-y-4">
                  <div>
                    <FieldLabel required>Role name</FieldLabel>
                    <input
                      value={form.roleName}
                      maxLength={NAME_MAX}
                      onChange={(e) =>
                        setForm({ ...form, roleName: e.target.value.slice(0, NAME_MAX) })
                      }
                      className={rbacSelect}
                      placeholder="e.g. Manager"
                      autoFocus
                    />
                    <p className="mt-1 text-right text-[11px] text-gray-400">
                      {form.roleName.length}/{NAME_MAX}
                    </p>
                  </div>

                  <div>
                    <FieldLabel required>Status</FieldLabel>
                    <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1">
                      {[
                        { val: false, label: "Inactive" },
                        { val: true, label: "Active" },
                      ].map(({ val, label }) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => setForm({ ...form, isActive: val })}
                          className={clsx(
                            "rounded-lg px-4 py-1.5 text-xs font-semibold transition",
                            form.isActive === val
                              ? "bg-[#00ADE5] text-white shadow-sm"
                              : "text-gray-500 hover:text-gray-700"
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <FieldLabel required>Description</FieldLabel>
                    <textarea
                      value={form.description}
                      maxLength={DESC_MAX}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          description: e.target.value.slice(0, DESC_MAX),
                        })
                      }
                      rows={3}
                      className={rbacSelect}
                      placeholder="A brief role description..."
                    />
                    <p className="mt-1 text-right text-[11px] text-gray-400">
                      {form.description.length}/{DESC_MAX}
                    </p>
                  </div>

                  {isSuperAdmin && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, isSystemRole: !form.isSystemRole })}
                      className={clsx(
                        "flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition",
                        form.isSystemRole
                          ? "border-[#00ADE5]/40 bg-gradient-to-r from-[#00ADE5]/10 to-white ring-1 ring-[#00ADE5]/20"
                          : "border-gray-200 bg-white hover:border-[#003366]/20 hover:bg-[#f8fafc]"
                      )}
                    >
                      <span
                        className={clsx(
                          "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                          form.isSystemRole
                            ? "bg-gradient-to-br from-[#003366] to-[#004080] text-white"
                            : "bg-[#003366]/8 text-[#003366]"
                        )}
                      >
                        <Shield size={16} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-gray-900">
                          System role
                        </span>
                        <span className="mt-0.5 block text-xs text-gray-500">
                          Only Super Admin can edit or delete
                        </span>
                      </span>
                      <span
                        className={clsx(
                          "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition",
                          form.isSystemRole
                            ? "bg-[#00ADE5] text-white"
                            : "border border-gray-300 bg-white text-transparent"
                        )}
                      >
                        <Check size={13} strokeWidth={3} />
                      </span>
                    </button>
                  )}
                </div>

                <div className="rounded-xl border border-[#00ADE5]/25 bg-gradient-to-br from-[#00ADE5]/8 to-white p-4">
                  <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#003366]">
                    <Info size={14} className="text-[#00ADE5]" />
                    Requirements
                  </div>
                  <ul className="space-y-2 text-xs leading-relaxed text-gray-600">
                    <li className="flex gap-2">
                      <CheckCircle2
                        size={14}
                        className={clsx(
                          "mt-0.5 shrink-0",
                          requirements.nameOk ? "text-[#00ADE5]" : "text-red-400"
                        )}
                      />
                      <span className={requirements.nameOk ? "" : "text-red-500"}>
                        Role name (min 3 chars)
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2
                        size={14}
                        className={clsx(
                          "mt-0.5 shrink-0",
                          requirements.descOk ? "text-[#00ADE5]" : "text-red-400"
                        )}
                      />
                      <span className={requirements.descOk ? "" : "text-red-500"}>
                        Description (min 3 chars)
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2
                        size={14}
                        className={clsx(
                          "mt-0.5 shrink-0",
                          requirements.platformOk ? "text-[#00ADE5]" : "text-red-400"
                        )}
                      />
                      <span className={requirements.platformOk ? "" : "text-red-500"}>
                        1 page &amp; 1 permission on at least 1 platform
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
              <div className="flex items-center gap-1 border-b border-[#003366]/8 bg-gradient-to-r from-[#003366] to-[#004080] px-3 py-2">
                <button
                  type="button"
                  onClick={() => scrollTabs(-1)}
                  className="shrink-0 rounded-lg bg-white/10 p-2 text-white/80 transition hover:bg-white/20 hover:text-white"
                >
                  <ChevronLeft size={16} />
                </button>
                <div ref={tabsRef} className="flex flex-1 gap-1 overflow-x-auto">
                  {platformTabs.map((tab) => {
                    const hasConfig = platformMapHasPages(platformPermMaps[tab.id]);
                    const isActive = activePlatform === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => handlePlatformTab(tab.id)}
                        className={clsx(
                          "shrink-0 rounded-lg px-4 py-2 text-[11px] font-bold uppercase tracking-wide transition",
                          isActive
                            ? "bg-white text-[#003366] shadow-sm"
                            : "text-white/70 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        {tab.label}
                        {hasConfig && (
                          <span
                            className={clsx(
                              "ml-1.5 inline-block h-1.5 w-1.5 rounded-full",
                              isActive ? "bg-[#00ADE5]" : "bg-[#00ADE5]/80"
                            )}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => scrollTabs(1)}
                  className="shrink-0 rounded-lg bg-white/10 p-2 text-white/80 transition hover:bg-white/20 hover:text-white"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="grid gap-0 lg:grid-cols-2">
                {/* Platform Pages — left */}
                <div className="border-b border-gray-100 lg:border-b-0 lg:border-r">
                  <div className="flex items-center justify-between border-b border-gray-100 bg-[#f8fafc] px-4 py-3">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-[#003366]">
                      <FolderOpen size={16} className="text-[#00ADE5]" />
                      Platform Pages
                    </h3>
                    <label className="flex items-center gap-2 text-xs font-semibold text-[#003366]">
                      <input
                        type="checkbox"
                        checked={allPagesSelected}
                        onChange={(e) => toggleAllPages(e.target.checked)}
                        className="rounded border-gray-300 text-[#00ADE5]"
                      />
                      Select All
                    </label>
                  </div>
                  <div className="max-h-80 space-y-3 overflow-y-auto p-3">
                    {platformPages.length === 0 ? (
                      <div className="px-3 py-10 text-center">
                        <FolderOpen className="mx-auto text-gray-300" size={28} />
                        <p className="mt-2 text-sm text-gray-400">No pages for this platform.</p>
                      </div>
                    ) : (
                      treeItems.map((item) => {
                        if (item.type === "category") {
                          const category = item.category;
                          return (
                            <div key={`cat-${category.pageId}`} className="space-y-1.5">
                              <div className="flex items-center gap-2 px-1 py-1">
                                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#003366]/8 text-[#003366]">
                                  <FolderTree size={14} />
                                </span>
                                <div className="min-w-0">
                                  <p className="truncate text-xs font-bold uppercase tracking-wide text-[#003366]">
                                    {category.pageName}
                                  </p>
                                  <p className="text-[10px] text-gray-400">
                                    {category.pages.length} page
                                    {category.pages.length === 1 ? "" : "s"}
                                  </p>
                                </div>
                              </div>
                              <div className="ml-3 space-y-1.5 border-l-2 border-[#003366]/10 pl-2.5">
                                {category.pages.map((page) => {
                                  const pageId = getEntityId(page);
                                  return (
                                    <SelectableCard
                                      key={pageId}
                                      checked={selectedPageIds.has(pageId)}
                                      onClick={() => togglePage(pageId)}
                                      icon={<FileText size={15} />}
                                      title={page.pageName}
                                      subtitle={page.pageSlug || `/${page.pageKey}`}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          );
                        }

                        const page = item.page;
                        const pageId = getEntityId(page);
                        return (
                          <SelectableCard
                            key={`page-${pageId}`}
                            checked={selectedPageIds.has(pageId)}
                            onClick={() => togglePage(pageId)}
                            icon={<FileText size={15} />}
                            title={page.pageName}
                            subtitle={page.pageSlug || `/${page.pageKey}`}
                          />
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Permissions — right (same card style as pages) */}
                <div>
                  <div className="flex items-center justify-between border-b border-gray-100 bg-[#f8fafc] px-4 py-3">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-[#003366]">
                      <Shield size={16} className="text-[#00ADE5]" />
                      Permissions
                    </h3>
                    <label className="flex items-center gap-2 text-xs font-semibold text-[#003366]">
                      <input
                        type="checkbox"
                        checked={allColsSelected}
                        onChange={(e) => toggleAllCols(e.target.checked)}
                        className="rounded border-gray-300 text-[#00ADE5]"
                      />
                      Select All
                    </label>
                  </div>
                  <div className="max-h-80 space-y-2 overflow-y-auto p-3">
                    {PAGE_ACTION_COLUMNS.map((col) => {
                      const meta = PERMISSION_CARD_META[col.id];
                      const Icon = PERMISSION_ICONS[col.id] || Shield;
                      const available = Boolean(columnPermissionMap[col.id]);
                      const viewLocked =
                        col.id === "view" &&
                        selectedPageIds.size > 0 &&
                        selectedColIds.has("view");
                      return (
                        <SelectableCard
                          key={col.id}
                          checked={selectedColIds.has(col.id)}
                          disabled={!available}
                          locked={viewLocked}
                          onClick={() => available && !viewLocked && toggleCol(col.id)}
                          icon={<Icon size={15} />}
                          title={meta?.label || col.label}
                          subtitle={
                            viewLocked
                              ? "Auto-granted for selected pages (required)"
                              : meta?.description
                          }
                        />
                      );
                    })}
                    {!PAGE_ACTION_COLUMNS.some((c) => columnPermissionMap[c.id]) && (
                      <p className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
                        View, Add, Edit, Delete permissions are missing — run System Setup
                        first.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </fieldset>
        </form>
      )}
    </Drawer>
  );
}
