import { Layers } from "lucide-react";

export function SetupPrimaryButton({
  onClick,
  icon: Icon,
  children,
  type = "button",
  disabled = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00ADE5] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#00ADE5]/25 transition hover:bg-[#0099c7] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {Icon && <Icon className="h-5 w-5" strokeWidth={2.25} />}
      {children}
    </button>
  );
}

export function SetupSecondaryButton({
  onClick,
  icon: Icon,
  children,
  type = "button",
  disabled = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#003366]/15 bg-white px-5 py-2.5 text-sm font-semibold text-[#003366] shadow-sm transition hover:border-[#00ADE5] hover:bg-[#00ADE5]/5 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {Icon && <Icon className="h-5 w-5 text-[#00ADE5]" strokeWidth={2} />}
      {children}
    </button>
  );
}

export default function SetupTabHeader({
  title,
  description,
  children,
  stats = [],
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
      <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[#00ADE5]">
            <Layers className="h-5 w-5 shrink-0" strokeWidth={2} />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em]">
              League setup
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#003366] sm:text-3xl">
            {title}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-600">
            {description}
          </p>
        </div>
        {children ? (
          <div className="flex shrink-0 flex-wrap gap-3">{children}</div>
        ) : null}
      </div>
      {stats.length > 0 && (
        <div className="grid grid-cols-2 divide-x divide-gray-100 border-t border-gray-100 bg-slate-50/60 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="px-4 py-3.5 sm:px-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {stat.label}
              </p>
              <p className="mt-0.5 text-lg font-bold text-[#003366]">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
