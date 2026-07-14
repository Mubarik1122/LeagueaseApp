/** Shared Access Control UI tokens — restrained, enterprise-style */

export const rbacTabClass = (isActive) =>
  isActive
    ? "border-[#003366] text-[#003366] bg-white"
    : "border-transparent text-gray-500 hover:border-gray-200 hover:text-gray-800";

export const rbacTabBase =
  "shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors";

export const rbacSubTabClass = (isActive) =>
  isActive
    ? "border-[#003366] text-[#003366] bg-slate-50/80"
    : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50/80";

export const rbacSubTabBase =
  "shrink-0 rounded-t-lg border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors";

export const rbacBtnPrimary =
  "inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#003366] to-[#004080] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-95 disabled:opacity-60";

export const rbacBtnSecondary =
  "inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-60";

export const rbacSelect =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition focus:border-[#003366] focus:outline-none focus:ring-2 focus:ring-[#003366]/10";

export const rbacTableHead =
  "bg-gray-50/80 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500";

export const rbacBadge = {
  neutral: "bg-gray-100 text-gray-600 ring-gray-200/80",
  primary: "bg-slate-100 text-slate-700 ring-slate-200/80",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200/60",
  muted: "bg-gray-50 text-gray-400 ring-gray-200/60",
};

export function RbacBadge({ children, variant = "neutral" }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${rbacBadge[variant] || rbacBadge.neutral}`}
    >
      {children}
    </span>
  );
}
