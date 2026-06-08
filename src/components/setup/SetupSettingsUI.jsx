import clsx from "clsx";
import { Info, Loader2, Save } from "lucide-react";
import SetupTabHeader from "./SetupTabHeader";

export function ToggleSwitch({ checked, onChange, disabled = false, id }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={clsx(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#00ADE5]/40 focus:ring-offset-2",
        checked ? "bg-[#00ADE5]" : "bg-gray-200",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <span
        className={clsx(
          "inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}

export function SettingsRow({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
  disabled = false,
}) {
  return (
    <div
      className={clsx(
        "flex items-start justify-between gap-4 py-4 sm:items-center",
        disabled && "opacity-60"
      )}
    >
      <div className="flex min-w-0 flex-1 gap-3">
        {Icon && (
          <span
            className={clsx(
              "mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg sm:mt-0",
              checked
                ? "bg-[#00ADE5]/10 text-[#00ADE5]"
                : "bg-slate-100 text-gray-400"
            )}
          >
            <Icon size={16} strokeWidth={2} />
          </span>
        )}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-gray-900">{title}</p>
            {checked && !disabled && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                On
              </span>
            )}
          </div>
          {description && (
            <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
              {description}
            </p>
          )}
        </div>
      </div>
      <ToggleSwitch
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}

export function SettingsSection({
  icon: Icon,
  title,
  subtitle,
  enabledCount,
  totalCount,
  onEnableAll,
  onDisableAll,
  children,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#003366]/5 text-[#003366]">
            <Icon size={18} strokeWidth={2} />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            {subtitle && (
              <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 pl-[52px] sm:pl-0">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-gray-600">
            {enabledCount}/{totalCount} active
          </span>
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={onEnableAll}
              className="font-semibold text-[#00ADE5] transition hover:text-[#0097c9]"
            >
              Enable all
            </button>
            <span className="text-gray-300">|</span>
            <button
              type="button"
              onClick={onDisableAll}
              className="font-semibold text-gray-500 transition hover:text-gray-700"
            >
              Disable all
            </button>
          </div>
        </div>
      </div>
      <div className="divide-y divide-gray-100 px-5 sm:px-6">{children}</div>
    </div>
  );
}

export function SetupPageHeader({ title, description, stats = [], children }) {
  return (
    <SetupTabHeader title={title} description={description} stats={stats}>
      {children}
    </SetupTabHeader>
  );
}

export function SetupFooter({ onSave, loading, label = "Save configuration" }) {
  return (
    <div className="sticky bottom-0 z-10 mt-6 overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
      <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-xs text-gray-500">
          Changes apply league-wide after you save.
        </p>
        <button
          type="button"
          onClick={onSave}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#003366] to-[#004080] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-[#002244] hover:to-[#003366] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Save size={18} />
          )}
          {loading ? "Saving..." : label}
        </button>
      </div>
    </div>
  );
}

export function SetupTip({ children }) {
  return (
    <div className="mt-6 rounded-2xl border border-[#00ADE5]/15 bg-gradient-to-r from-[#00ADE5]/5 to-white p-4 sm:p-5">
      <div className="flex gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#00ADE5]/10 text-[#00ADE5]">
          <Info size={18} />
        </span>
        <p className="text-sm leading-relaxed text-gray-600">{children}</p>
      </div>
    </div>
  );
}

export function InlineNumberField({ label, hint, value, onChange, min, max }) {
  return (
    <div className="mt-4 rounded-xl border border-gray-200 bg-slate-50/80 p-4 sm:p-5">
      <label className="block text-sm font-semibold text-gray-800">{label}</label>
      {hint && <p className="mt-0.5 text-xs text-gray-500">{hint}</p>}
      <div className="mt-3 flex items-center gap-3">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={onChange}
          className="w-24 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
        />
        <span className="text-sm text-gray-500">hours</span>
      </div>
    </div>
  );
}
