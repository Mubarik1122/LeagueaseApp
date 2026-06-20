import { NavLink, Outlet } from "react-router-dom";
import { BarChart3 } from "lucide-react";
import clsx from "clsx";
import { RESULTS_NAV_ITEMS } from "./resultsNav";

export default function ResultsLayout() {
  return (
    <div className="space-y-5 py-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#003366] to-[#004080] text-white shadow-sm">
            <BarChart3 size={22} />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#00ADE5]">
              League
            </p>
            <h1 className="text-2xl font-bold text-[#003366]">Results</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Review match results, adjust standings, and export statistics
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
        <nav
          className="flex gap-1 overflow-x-auto border-b border-gray-100 bg-slate-50/60 p-2"
          aria-label="Results sections"
        >
          {RESULTS_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                clsx(
                  "shrink-0 rounded-xl px-4 py-2.5 text-xs font-bold tracking-wide transition",
                  isActive
                    ? "bg-gradient-to-r from-[#003366] to-[#004080] text-white shadow-sm"
                    : "text-gray-500 hover:bg-white hover:text-[#003366]"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-5 sm:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
