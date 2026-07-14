import { useEffect, useState } from "react";
import {
  Building2,
  Check,
  CheckCircle2,
  FileText,
  FolderTree,
  Hash,
  Info,
  LayoutPanelLeft,
  Loader2,
  PanelTop,
} from "lucide-react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import Drawer from "../Drawer";
import { rbacBtnPrimary, rbacBtnSecondary, rbacSelect } from "./rbacTheme";

function FieldLabel({ children, required }) {
  return (
    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

/** Path-style slug: "Dashboard" → "/dashboard" */
export function toPageSlug(name) {
  const base = String(name || "")
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base ? `/${base}` : "";
}

export function normalizePageSlug(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "";
  const withoutSlash = raw.replace(/^\/+/, "");
  const cleaned = withoutSlash
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9/-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned ? `/${cleaned}` : "";
}

function getCompanyId(company) {
  return company?.companyId || company?._id || company?.id || "";
}

function companyInitials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "CO";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function getPlacementKey(placement) {
  return placement?.placementKey || placement?.key || placement?.menuPlacement || "";
}

function placementIcon(key) {
  const k = String(key || "").toLowerCase();
  if (k.includes("top") || k.includes("header")) return PanelTop;
  return LayoutPanelLeft;
}

export default function PageFormDrawer({
  isOpen,
  onClose,
  form,
  setForm,
  onSubmit,
  saving = false,
  mode = "page",
  platformName = "",
  parentPages = [],
  companies = [],
  placements = [],
}) {
  const isEdit = Boolean(form?.pageId);
  const isCategory = mode === "category";
  const [slugManual, setSlugManual] = useState(false);
  const selectedIds = new Set((form.companyIds || []).map(String));
  const selectedPlacement = (placements || []).find(
    (p) => getPlacementKey(p) === form.menuPlacement
  );
  const selectedPlacementName =
    selectedPlacement?.placementName ||
    selectedPlacement?.name ||
    form.menuPlacement ||
    "";

  useEffect(() => {
    if (!isOpen) return;
    setSlugManual(isEdit);
  }, [isOpen, isEdit]);

  const handleNameChange = (e) => {
    const pageName = e.target.value;
    setForm((prev) => ({
      ...prev,
      pageName,
      ...(slugManual || isEdit ? {} : { pageSlug: toPageSlug(pageName) }),
    }));
  };

  const handleSlugChange = (e) => {
    if (isEdit) return;
    setSlugManual(true);
    setForm({
      ...form,
      pageSlug: normalizePageSlug(e.target.value),
    });
  };

  const toggleCompany = (companyId) => {
    const id = String(companyId);
    const current = (form.companyIds || []).map(String);
    const next = selectedIds.has(id)
      ? current.filter((c) => c !== id)
      : [...current, id];
    setForm({ ...form, companyIds: next });
  };

  const selectAllCompanies = () => {
    setForm({
      ...form,
      companyIds: companies.map(getCompanyId).filter(Boolean).map(String),
    });
  };

  const clearCompanies = () => {
    setForm({ ...form, companyIds: [] });
  };

  const title = isCategory
    ? isEdit
      ? "Edit Category"
      : "Add Category"
    : isEdit
      ? "Edit Page"
      : "Add Page";

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={
        platformName
          ? `${isCategory ? "Category" : "Page"} · ${platformName}`
          : isCategory
            ? "Top-level category for grouping pages"
            : "Child page under a parent category"
      }
      widthClass="max-w-xl"
      tone="role"
      labelledBy="page-form-drawer-title"
      footer={
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className={`${rbacBtnSecondary} min-w-[120px] justify-center`}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="page-form-drawer"
            disabled={saving}
            className={`${rbacBtnPrimary} flex-1 justify-center py-2.5`}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
            {isEdit ? "Save Changes" : isCategory ? "Create Category" : "Create Page"}
          </button>
        </div>
      }
    >
      <form id="page-form-drawer" onSubmit={onSubmit} className="space-y-5">
        <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#003366] to-[#004080] text-white shadow-md">
              {isCategory ? <FolderTree size={22} /> : <FileText size={22} />}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#003366]">
                {form.pageName.trim() || (isCategory ? "New category" : "New page")}
              </p>
              <p className="text-xs text-gray-500">
                {isCategory ? "Parent / category page" : "Child page under a category"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <FieldLabel required>{isCategory ? "Category name" : "Page name"}</FieldLabel>
              <input
                required
                value={form.pageName}
                onChange={handleNameChange}
                className={rbacSelect}
                placeholder={isCategory ? "e.g. Dashboard" : "e.g. Leagues"}
                autoFocus
              />
            </div>

            <div>
              <FieldLabel required>{isCategory ? "Category slug" : "Page slug"}</FieldLabel>
              <input
                required
                value={form.pageSlug || ""}
                onChange={handleSlugChange}
                className={rbacSelect}
                placeholder="e.g. /leagues"
                disabled={isEdit}
              />
              <p className="mt-1.5 text-xs text-gray-400">
                {isEdit
                  ? "Slug cannot be changed after create."
                  : 'Auto-generated as a path (e.g. "/leagues"). You can edit it.'}
              </p>
            </div>

            <div>
              <FieldLabel required>Company access</FieldLabel>
              <div className="overflow-hidden rounded-2xl border border-[#003366]/10 bg-gradient-to-br from-[#003366]/5 via-white to-[#00ADE5]/5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#003366]/8 bg-gradient-to-r from-[#003366] to-[#004080] px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
                      Organizations
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-white">
                      {selectedIds.size === 0
                        ? "No companies selected"
                        : `${selectedIds.size} of ${companies.length} selected`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={selectAllCompanies}
                      disabled={companies.length === 0}
                      className="rounded-lg bg-white/15 px-2.5 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm transition hover:bg-white/25 disabled:opacity-40"
                    >
                      Select all
                    </button>
                    <button
                      type="button"
                      onClick={clearCompanies}
                      disabled={selectedIds.size === 0}
                      className="rounded-lg bg-white/10 px-2.5 py-1.5 text-[11px] font-semibold text-white/80 transition hover:bg-white/20 disabled:opacity-40"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="max-h-56 space-y-2 overflow-y-auto p-3">
                  {companies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center px-3 py-8 text-center">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#003366]/8 text-[#003366]/50">
                        <Building2 size={20} />
                      </span>
                      <p className="mt-3 text-sm font-medium text-gray-600">No companies available</p>
                      <p className="mt-1 text-xs text-gray-400">
                        Add companies in Company Management first.
                      </p>
                    </div>
                  ) : (
                    companies.map((company) => {
                      const id = getCompanyId(company);
                      const name = company.companyName || company.name || id;
                      const domain = company.domain || company.companyDomain || "";
                      const checked = selectedIds.has(String(id));
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => toggleCompany(id)}
                          className={clsx(
                            "flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition",
                            checked
                              ? "border-[#00ADE5]/40 bg-gradient-to-r from-[#00ADE5]/10 to-white shadow-sm ring-1 ring-[#00ADE5]/20"
                              : "border-gray-200/80 bg-white hover:border-[#003366]/20 hover:bg-[#f8fafc]"
                          )}
                        >
                          <span
                            className={clsx(
                              "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold tracking-wide",
                              checked
                                ? "bg-gradient-to-br from-[#003366] to-[#004080] text-white shadow-md"
                                : "bg-[#003366]/8 text-[#003366]"
                            )}
                          >
                            {companyInitials(name)}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-gray-900">
                              {name}
                            </span>
                            {domain ? (
                              <span className="mt-0.5 block truncate text-xs text-gray-400">
                                {domain}
                              </span>
                            ) : (
                              <span className="mt-0.5 block truncate font-mono text-[11px] text-gray-400">
                                {id}
                              </span>
                            )}
                          </span>
                          <span
                            className={clsx(
                              "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition",
                              checked
                                ? "bg-[#00ADE5] text-white shadow-sm"
                                : "border border-gray-300 bg-white text-transparent"
                            )}
                          >
                            <Check size={13} strokeWidth={3} />
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
              <p className="mt-1.5 text-xs text-gray-400">
                Only selected companies will have access to this page.
              </p>
            </div>

            <div>
              <FieldLabel required>Menu location</FieldLabel>
              <div className="overflow-hidden rounded-2xl border border-[#003366]/10 bg-gradient-to-br from-[#003366]/5 via-white to-[#00ADE5]/5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#003366]/8 bg-gradient-to-r from-[#003366] to-[#004080] px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
                      Placement
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-white">
                      {selectedPlacementName || "No location selected"}
                    </p>
                  </div>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-white">
                    <LayoutPanelLeft size={16} />
                  </span>
                </div>

                <div className="max-h-52 space-y-2 overflow-y-auto p-3">
                  {placements.length === 0 ? (
                    <div className="flex flex-col items-center justify-center px-3 py-8 text-center">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#003366]/8 text-[#003366]/50">
                        <LayoutPanelLeft size={20} />
                      </span>
                      <p className="mt-3 text-sm font-medium text-gray-600">No menu locations</p>
                      <p className="mt-1 text-xs text-gray-400">
                        Add a placement first (e.g. Side Navigation).
                      </p>
                      <Link
                        to="/dashboard/rbac/menu-placements"
                        className="mt-3 inline-flex text-xs font-semibold text-[#00ADE5] hover:underline"
                      >
                        Open Menu Placement →
                      </Link>
                    </div>
                  ) : (
                    placements.map((placement) => {
                      const key = getPlacementKey(placement);
                      const name =
                        placement.placementName || placement.name || key || "Placement";
                      const desc = placement.description || "";
                      const selected = form.menuPlacement === key;
                      const Icon = placementIcon(key);
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setForm({ ...form, menuPlacement: key })}
                          className={clsx(
                            "flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition",
                            selected
                              ? "border-[#00ADE5]/40 bg-gradient-to-r from-[#00ADE5]/10 to-white shadow-sm ring-1 ring-[#00ADE5]/20"
                              : "border-gray-200/80 bg-white hover:border-[#003366]/20 hover:bg-[#f8fafc]"
                          )}
                        >
                          <span
                            className={clsx(
                              "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                              selected
                                ? "bg-gradient-to-br from-[#003366] to-[#004080] text-white shadow-md"
                                : "bg-[#003366]/8 text-[#003366]"
                            )}
                          >
                            <Icon size={16} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-gray-900">
                              {name}
                            </span>
                            {desc ? (
                              <span className="mt-0.5 block truncate text-xs text-gray-400">
                                {desc}
                              </span>
                            ) : (
                              <span className="mt-0.5 block truncate font-mono text-[11px] text-gray-400">
                                {key}
                              </span>
                            )}
                          </span>
                          <span
                            className={clsx(
                              "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition",
                              selected
                                ? "bg-[#00ADE5] text-white shadow-sm"
                                : "border border-gray-300 bg-white text-transparent"
                            )}
                          >
                            <Check size={13} strokeWidth={3} />
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
              <p className="mt-1.5 text-xs text-gray-400">
                Where this {isCategory ? "category" : "page"} appears in the app menu.
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

            {isEdit && form.pageId && (
              <div className="rounded-xl border border-gray-100 bg-[#f8fafc] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  {isCategory ? "Category ID" : "Page ID"}
                </p>
                <p className="mt-1 flex items-center gap-1.5 font-mono text-xs text-gray-600">
                  <Hash size={12} className="text-gray-400" />
                  {form.pageId}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-[#00ADE5]/25 bg-gradient-to-br from-[#00ADE5]/8 to-white p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#003366]">
            <Info size={14} className="text-[#00ADE5]" />
            Tips
          </div>
          <ul className="space-y-2 text-xs leading-relaxed text-gray-600">
            <li className="flex gap-2">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[#00ADE5]" />
              Super Admin always has access to every page
            </li>
            <li className="flex gap-2">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[#00ADE5]" />
              Pick where this appears (sidebar, header, etc.)
            </li>
            <li className="flex gap-2">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[#00ADE5]" />
              Assign companies to control which orgs can use this page
            </li>
          </ul>
        </div>
      </form>
    </Drawer>
  );
}
