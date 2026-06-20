import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowUpDown,
  ChevronDown,
  Layers,
  Plus,
  SlidersHorizontal,
} from "lucide-react";
import { primaryButtonClass, selectClass } from "./resultTheme";

export default function StandingsAdjustments() {
  const [selectedDivision, setSelectedDivision] = useState("Division 1");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#003366] sm:text-xl">
          Standings adjustments
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Apply manual points changes or override team positions on the table.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-[#00ADE5]/20 bg-[#00ADE5]/5 px-4 py-3.5">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#00ADE5]" />
        <p className="text-sm leading-relaxed text-gray-600">
          Create points adjustments for the standings. Change the score for /
          against on the standings, or override a team&apos;s position on the
          table.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="relative">
          <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
            <Layers className="h-3.5 w-3.5 text-[#00ADE5]" />
            Division
          </label>
          <div className="relative">
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className={selectClass}
            >
              <option>Division 1</option>
              <option>Division 2</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div className="flex items-end">
          <Link
            to="/dashboard/standings"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0088cc] transition hover:text-[#003366]"
          >
            <ArrowUpDown className="h-4 w-4 text-[#00ADE5]" />
            Override a team&apos;s position in the standings
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gradient-to-r from-[#003366]/[0.03] to-[#00ADE5]/[0.05] px-5 py-4">
          <div>
            <h3 className="text-sm font-bold text-[#003366]">
              Table adjustments
            </h3>
            <p className="mt-0.5 text-xs text-gray-500">
              {selectedDivision} · manual points and position overrides
            </p>
          </div>
          <button type="button" className={primaryButtonClass}>
            <Plus className="h-4 w-4" />
            Create new
          </button>
        </div>
        <div className="flex flex-col items-center justify-center gap-2 px-5 py-16 text-center">
          <div className="rounded-full bg-[#00ADE5]/10 p-3">
            <SlidersHorizontal className="h-6 w-6 text-[#00ADE5]" />
          </div>
          <p className="text-sm font-semibold text-[#003366]">
            No adjustments yet
          </p>
          <p className="max-w-md text-sm text-gray-500">
            There are no table adjustments to display for this division. Use
            Create new to add a points or position adjustment.
          </p>
        </div>
      </div>
    </div>
  );
}
