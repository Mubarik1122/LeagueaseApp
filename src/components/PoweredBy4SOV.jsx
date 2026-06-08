const FOUR_SOV_URL = import.meta.env.VITE_4SOV_URL?.trim() || "";

/**
 * @param {{ variant?: 'light' | 'dark', className?: string, href?: string }} props
 */
export default function PoweredBy4SOV({
  variant = "light",
  className = "",
  href = FOUR_SOV_URL,
}) {
  const isDark = variant === "dark";
  const link = href?.trim();

  const labelClass = isDark
    ? "text-gray-500"
    : "text-gray-400";

  const shellClass = [
    "group inline-flex items-center gap-2.5 rounded-full border px-3 py-1.5",
    "transition-all duration-300 ease-out",
    isDark
      ? "border-gray-700/70 bg-gray-800/50 hover:border-[#00ADE5]/35 hover:bg-gray-800/80"
      : "border-gray-200/90 bg-white/80 shadow-sm shadow-gray-200/50 hover:border-[#00ADE5]/30 hover:shadow-md hover:shadow-[#00ADE5]/10",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const chipClass = [
    "inline-flex items-center justify-center rounded-md px-2.5 py-0.5",
    "text-xs font-bold tracking-[0.12em] text-white",
    "bg-gradient-to-r from-[#003366] via-[#004080] to-[#00ADE5]",
    "shadow-sm transition-transform duration-300",
    "group-hover:scale-[1.03]",
    isDark ? "shadow-[#00ADE5]/15" : "shadow-[#003366]/20",
  ].join(" ");

  const inner = (
    <>
      <span
        className={`text-[10px] font-medium uppercase tracking-[0.18em] sm:text-[11px] ${labelClass}`}
      >
        Powered by
      </span>
      <span className={chipClass} aria-hidden>
        4SOV
      </span>
    </>
  );

  if (link) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className={`${shellClass} no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ADE5]/50 focus-visible:ring-offset-2 ${isDark ? "focus-visible:ring-offset-gray-900" : "focus-visible:ring-offset-white"}`}
        aria-label="Powered by 4SOV — opens in a new tab"
      >
        {inner}
      </a>
    );
  }

  return (
    <div className={shellClass} role="note" aria-label="Powered by 4SOV">
      {inner}
    </div>
  );
}
