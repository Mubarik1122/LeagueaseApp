import { Building2, CheckCircle2, Hash, Info, Loader2 } from "lucide-react";
import clsx from "clsx";
import Drawer from "../Drawer";
import { rbacBtnPrimary, rbacBtnSecondary, rbacSelect } from "./rbacTheme";

const STATUS_OPTIONS = [
  { val: "Active", label: "Active" },
  { val: "Inactive", label: "Inactive" },
];

function FieldLabel({ children, required }) {
  return (
    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
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

export default function CompanyFormDrawer({
  isOpen,
  onClose,
  form,
  setForm,
  onSubmit,
  saving = false,
}) {
  const isEdit = Boolean(form?.companyId);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Company" : "Add Company"}
      subtitle={
        isEdit
          ? "Update company workspace details"
          : "Create a new company workspace for access control"
      }
      widthClass="max-w-xl"
      tone="role"
      labelledBy="company-form-drawer-title"
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
            form="company-form-drawer"
            disabled={saving}
            className={`${rbacBtnPrimary} flex-1 justify-center py-2.5`}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
            {isEdit ? "Save Changes" : "Create Company"}
          </button>
        </div>
      }
    >
      <form id="company-form-drawer" onSubmit={onSubmit} className="space-y-5">
        <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#003366] to-[#004080] text-sm font-bold text-white shadow-md">
              {companyInitials(form.companyName)}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#003366]">
                {form.companyName.trim() || (isEdit ? "Edit company" : "New company")}
              </p>
              <p className="text-xs text-gray-500">
                {isEdit ? "Update existing workspace" : "Fill in the details below"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <FieldLabel required>Company name</FieldLabel>
              <input
                required
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                className={rbacSelect}
                placeholder="e.g. 4SOV Sports"
                autoFocus
              />
            </div>

            <div>
              <FieldLabel>Domain</FieldLabel>
              <input
                value={form.domain}
                onChange={(e) => setForm({ ...form, domain: e.target.value })}
                className={rbacSelect}
                placeholder="e.g. 4sov-league"
              />
              <p className="mt-1.5 text-xs text-gray-400">
                Used for workspace identification and branding.
              </p>
            </div>

            <div>
              <FieldLabel required>Status</FieldLabel>
              <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1">
                {STATUS_OPTIONS.map(({ val, label }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setForm({ ...form, status: val })}
                    className={clsx(
                      "rounded-lg px-4 py-1.5 text-xs font-semibold transition",
                      form.status === val
                        ? "bg-[#00ADE5] text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {isEdit && form.companyId && (
              <div className="rounded-xl border border-gray-100 bg-[#f8fafc] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  Company ID
                </p>
                <p className="mt-1 flex items-center gap-1.5 font-mono text-xs text-gray-600">
                  <Hash size={12} className="text-gray-400" />
                  {form.companyId}
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
              Company name is required and shown across Access Control
            </li>
            <li className="flex gap-2">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[#00ADE5]" />
              Inactive companies can still be selected but marked clearly
            </li>
            <li className="flex gap-2">
              <Building2 size={14} className="mt-0.5 shrink-0 text-[#00ADE5]" />
              Select the company after creating it to manage roles and users
            </li>
          </ul>
        </div>
      </form>
    </Drawer>
  );
}
