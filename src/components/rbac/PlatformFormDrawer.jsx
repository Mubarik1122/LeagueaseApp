import { useEffect, useState } from "react";
import { CheckCircle2, Hash, Info, Laptop, Loader2 } from "lucide-react";
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

/** Slug for platform key from display name (e.g. "Website Portal" → "website_portal"). */
function toPlatformKeySlug(name) {
  return String(name || "")
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

export default function PlatformFormDrawer({
  isOpen,
  onClose,
  form,
  setForm,
  onSubmit,
  saving = false,
}) {
  const isEdit = Boolean(form?.platformId);
  /** Once the user edits Key manually, stop overwriting it from Name. */
  const [keyManual, setKeyManual] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    // Edit: keep existing key unless user changes it. Create: follow name until key is edited.
    setKeyManual(isEdit);
  }, [isOpen, isEdit]);

  const handleNameChange = (e) => {
    const platformName = e.target.value;
    setForm((prev) => ({
      ...prev,
      platformName,
      ...(keyManual ? {} : { platformKey: toPlatformKeySlug(platformName) }),
    }));
  };

  const handleKeyChange = (e) => {
    setKeyManual(true);
    setForm({
      ...form,
      platformKey: toPlatformKeySlug(e.target.value),
    });
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Platform" : "Add Platform"}
      subtitle={
        isEdit
          ? "Update platform details"
          : "Register a new platform for role page access"
      }
      widthClass="max-w-xl"
      tone="role"
      labelledBy="platform-form-drawer-title"
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
            form="platform-form-drawer"
            disabled={saving}
            className={`${rbacBtnPrimary} flex-1 justify-center py-2.5`}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
            {isEdit ? "Save Changes" : "Create Platform"}
          </button>
        </div>
      }
    >
      <form id="platform-form-drawer" onSubmit={onSubmit} className="space-y-5">
        <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#003366] to-[#004080] text-white shadow-md">
              <Laptop size={22} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#003366]">
                {form.platformName.trim() || (isEdit ? "Edit platform" : "New platform")}
              </p>
              <p className="text-xs text-gray-500">
                {isEdit ? "Update existing platform" : "Fill in the details below"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <FieldLabel required>Platform name</FieldLabel>
              <input
                required
                value={form.platformName}
                onChange={handleNameChange}
                className={rbacSelect}
                placeholder="e.g. Website Portal"
                autoFocus
              />
            </div>

            <div>
              <FieldLabel required>Platform key</FieldLabel>
              <input
                required
                value={form.platformKey}
                onChange={handleKeyChange}
                className={rbacSelect}
                placeholder="e.g. website_portal"
              />
              <p className="mt-1.5 text-xs text-gray-400">
                Auto-generated from the name as a slug. You can edit it anytime.
              </p>
            </div>

            <div>
              <FieldLabel>Description</FieldLabel>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className={rbacSelect}
                placeholder="Brief description of this platform..."
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

            {isEdit && form.platformId && (
              <div className="rounded-xl border border-gray-100 bg-[#f8fafc] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  Platform ID
                </p>
                <p className="mt-1 flex items-center gap-1.5 font-mono text-xs text-gray-600">
                  <Hash size={12} className="text-gray-400" />
                  {form.platformId}
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
              Platforms appear as tabs when creating or editing roles
            </li>
            <li className="flex gap-2">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[#00ADE5]" />
              Each platform can have its own pages and permissions
            </li>
          </ul>
        </div>
      </form>
    </Drawer>
  );
}
