import clsx from "clsx";

export function RbacPageHeader({ title, description, actions }) {
  return (
    <div className="border-b border-gray-100 bg-white px-6 py-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-[#003366]">{title}</h1>
          {description && (
            <p className="mt-1 max-w-2xl text-sm text-gray-500">{description}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function RbacCard({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-gray-200/90 bg-white shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, hint, accent = "cyan" }) {
  const accents = {
    cyan: "from-[#00ADE5]/12 to-white text-[#00ADE5]",
    navy: "from-[#003366]/10 to-white text-[#003366]",
    emerald: "from-emerald-50 to-white text-emerald-600",
    slate: "from-slate-100 to-white text-slate-600",
  };

  return (
    <RbacCard className="overflow-hidden">
      <div className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-gray-900">
            {value}
          </p>
          {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
        </div>
        <span
          className={clsx(
            "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br",
            accents[accent] || accents.cyan
          )}
        >
          <Icon size={20} strokeWidth={2} />
        </span>
      </div>
    </RbacCard>
  );
}

export function WorkspaceBanner({ title, subtitle, initials }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#003366] via-[#003d73] to-[#004080] text-white shadow-lg shadow-[#003366]/20">
      <div className="flex flex-wrap items-center gap-4 px-6 py-5">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-base font-bold backdrop-blur-sm">
          {initials}
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
            {subtitle}
          </p>
          <h2 className="mt-1 truncate text-lg font-semibold">{title}</h2>
        </div>
      </div>
    </div>
  );
}
