import { useState } from "react";
import { AlertCircle, CalendarRange, ChevronDown, Layers } from "lucide-react";
import clsx from "clsx";
import { selectClass } from "./resultTheme";

export default function ResultSummary() {
  const [selectedCompetition, setSelectedCompetition] = useState("All");
  const [dateFilter, setDateFilter] = useState("last14");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#003366] sm:text-xl">
          Result summary by date
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Approve and lock match results before they appear on public pages.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="relative">
          <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
            <Layers className="h-3.5 w-3.5 text-[#00ADE5]" />
            Competition
          </label>
          <div className="relative">
            <select
              value={selectedCompetition}
              onChange={(e) => setSelectedCompetition(e.target.value)}
              className={selectClass}
            >
              <option value="All">All competitions</option>
              <option value="div1">Division 1</option>
              <option value="div2">Division 2</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div className="md:col-span-2 xl:col-span-2">
          <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
            <CalendarRange className="h-3.5 w-3.5 text-[#00ADE5]" />
            Date range
          </label>
          <div className="flex flex-wrap gap-1 rounded-xl border border-gray-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setDateFilter("last14")}
              className={clsx(
                "rounded-lg px-4 py-2 text-xs font-bold tracking-wide transition",
                dateFilter === "last14"
                  ? "bg-gradient-to-r from-[#003366] to-[#004080] text-white shadow-sm"
                  : "text-gray-500 hover:text-[#003366]"
              )}
            >
              Last 14 days onwards
            </button>
            <button
              type="button"
              onClick={() => setDateFilter("all")}
              className={clsx(
                "rounded-lg px-4 py-2 text-xs font-bold tracking-wide transition",
                dateFilter === "all"
                  ? "bg-gradient-to-r from-[#003366] to-[#004080] text-white shadow-sm"
                  : "text-gray-500 hover:text-[#003366]"
              )}
            >
              All dates
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-[#00ADE5]/20 bg-[#00ADE5]/5 px-4 py-3.5">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#00ADE5]" />
        <p className="text-sm leading-relaxed text-gray-600">
          Approve the result of a match to make the result and stats appear on
          the public pages. Lock stats to prevent them from being changed by
          administrators.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gradient-to-r from-[#003366]/[0.03] to-[#00ADE5]/[0.05] px-5 py-4">
          <h3 className="text-sm font-bold text-[#003366]">Match results</h3>
          <p className="mt-0.5 text-xs text-gray-500">
            Results matching your current filters will appear here
          </p>
        </div>
        <div className="flex flex-col items-center justify-center gap-2 px-5 py-16 text-center">
          <div className="rounded-full bg-[#00ADE5]/10 p-3">
            <CalendarRange className="h-6 w-6 text-[#00ADE5]" />
          </div>
          <p className="text-sm font-semibold text-[#003366]">No matches found</p>
          <p className="max-w-md text-sm text-gray-500">
            There are no matches to display for your current filter choice.
            Try changing the competition or date range.
          </p>
        </div>
      </div>
    </div>
  );
}
