import { NavLink, Outlet } from "react-router-dom";
import { CalendarDays } from "lucide-react";
import clsx from "clsx";
import { SCHEDULE_NAV_ITEMS } from "./scheduleNav";

export default function ScheduleLayout() {
  return (
    <div className="space-y-5 py-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#003366] to-[#004080] text-white shadow-sm">
              <CalendarDays size={22} />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
              <p className="mt-0.5 text-sm text-gray-500">
                Manage matches, create fixtures, and run scheduling tools
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
        <nav
          className="flex gap-1 overflow-x-auto p-2"
          aria-label="Schedule sections"
        >
          {SCHEDULE_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                clsx(
                  "shrink-0 rounded-xl px-4 py-2.5 text-xs font-bold tracking-wide transition",
                  isActive
                    ? "bg-gradient-to-r from-[#003366] to-[#004080] text-white shadow-sm"
                    : "text-gray-500 hover:bg-slate-50 hover:text-[#003366]"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <Outlet />
    </div>
  );
}
