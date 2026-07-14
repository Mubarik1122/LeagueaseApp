import { useEffect, useState } from "react";
import { CheckCircle2, Hash, Info, LayoutPanelLeft, Loader2 } from "lucide-react";
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

/** Slug for placement key (e.g. "Side Navigation" → "side_navigation"). */
export function toPlacementKeySlug(name) {
  return String(name || "")
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

export default function MenuPlacementFormDrawer({
  isOpen,
  onClose,
  form,
  setForm,
  onSubmit,
  saving = false,
}) {
  const isEdit = Boolean(form?.placementId || form?._editKey);
  const [keyManual, setKeyManual] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setKeyManual(isEdit);
  }, [isOpen, isEdit]);

  const handleNameChange = (e) => {
    const placementName = e.target.value;
    setForm((prev) => ({
      ...prev,
      placementName,
      ...(keyManual ? {} : { placementKey: toPlacementKeySlug(placementName) }),
    }));
  };

  const handleKeyChange = (e) => {
    setKeyManual(true);
    setForm({
      ...form,
      placementKey: toPlacementKeySlug(e.target.value),
    });
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Menu Placement" : "Add Menu Placement"}
      subtitle={
        isEdit
          ? "Update where pages can appear in the UI"
          : "Define a menu location (sidebar, header, etc.)"
      }
      widthClass="max-w-xl"
      tone="role"
      labelledBy="menu-placement-form-drawer-title"
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
            form="menu-placement-form-drawer"
            disabled={saving}
            className={`${rbacBtnPrimary} flex-1 justify-center py-2.5`}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
            {isEdit ? "Save Changes" : "Create Placement"}
          </button>
        </div>
      }
    >
      <form id="menu-placement-form-drawer" onSubmit={onSubmit} className="space-y-5">
        <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#003366] to-[#004080] text-white shadow-md">
              <LayoutPanelLeft size={22} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#003366]">
                {form.placementName.trim() || (isEdit ? "Edit placement" : "New placement")}
              </p>
              <p className="text-xs text-gray-500">
                Linked to pages via <span className="font-mono">menuPlacement</span>
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <FieldLabel required>Placement name</FieldLabel>
              <input
                required
                value={form.placementName}
                onChange={handleNameChange}
                className={rbacSelect}
                placeholder="e.g. Side Navigation"
                autoFocus
              />
            </div>

            <div>
              <FieldLabel required>Placement key</FieldLabel>
              <input
                required
                value={form.placementKey}
                onChange={handleKeyChange}
                className={rbacSelect}
                placeholder="e.g. side_navigation"
                disabled={isEdit}
              />
              <p className="mt-1.5 text-xs text-gray-400">
                {isEdit
                  ? "Key cannot be changed after create."
                  : 'Auto-generated as a slug (e.g. "side_navigation"). Used on pages as menuPlacement.'}
              </p>
            </div>

            <div>
              <FieldLabel>Description</FieldLabel>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className={rbacSelect}
                placeholder="e.g. Main left sidebar menu"
              />
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

            {isEdit && form.placementId && (
              <div className="rounded-xl border border-gray-100 bg-[#f8fafc] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  Placement ID
                </p>
                <p className="mt-1 flex items-center gap-1.5 font-mono text-xs text-gray-600">
                  <Hash size={12} className="text-gray-400" />
                  {form.placementId}
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
              Pages ask “Where should this appear?” and send this key as menuPlacement
            </li>
            <li className="flex gap-2">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[#00ADE5]" />
              Example: side_navigation for the main left sidebar
            </li>
          </ul>
        </div>
      </form>
    </Drawer>
  );
}
