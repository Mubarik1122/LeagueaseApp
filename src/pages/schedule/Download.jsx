import {
  AlertCircle,
  CalendarRange,
  ChevronDown,
  Download as DownloadIcon,
  FileSpreadsheet,
  Layers,
} from "lucide-react";

const selectClass =
  "w-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-4 pr-10 text-sm font-medium text-gray-800 shadow-sm transition focus:border-[#00ADE5] focus:outline-none focus:ring-2 focus:ring-[#00ADE5]/20";

const checkboxClass =
  "h-4 w-4 rounded border-gray-300 text-[#00ADE5] focus:ring-[#00ADE5]/30";

const EXPORT_OPTIONS = [
  { id: "officials", label: "Include match officials" },
  { id: "venue", label: "Include venue details" },
  { id: "contacts", label: "Include team contacts" },
];

function FilterSelect({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
        <Icon className="h-3.5 w-3.5 text-[#00ADE5]" />
        {label}
      </label>
      <div className="relative">
        {children}
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>
    </div>
  );
}

export default function Download() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#00ADE5]">
          Schedule
        </p>
        <h2 className="mt-1 text-xl font-bold tracking-tight text-[#003366] sm:text-2xl">
          Download
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Export your fixture list for offline use or import into other
          applications.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
        <div className="flex items-center gap-2.5 border-b border-gray-100 bg-gradient-to-r from-[#003366]/[0.03] to-[#00ADE5]/[0.05] px-5 py-4">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#003366]/10">
            <DownloadIcon className="h-4 w-4 text-[#003366]" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Export schedule</h3>
            <p className="text-xs text-gray-500">
              Choose competition, date range, and file format
            </p>
          </div>
        </div>

        <div className="space-y-6 p-5 sm:p-6">
          <div className="flex items-start gap-3 rounded-2xl border border-[#00ADE5]/20 bg-[#00ADE5]/5 px-4 py-3.5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#00ADE5]" />
            <p className="text-sm leading-relaxed text-gray-600">
              Download your schedule in various formats for offline use or
              importing into spreadsheets, calendars, and other tools.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <FilterSelect label="Competition" icon={Layers}>
              <select className={selectClass}>
                <option>All</option>
                <option>Division 1</option>
                <option>Division 2</option>
              </select>
            </FilterSelect>

            <FilterSelect label="Date range" icon={CalendarRange}>
              <select className={selectClass}>
                <option>All dates</option>
                <option>Next 7 days</option>
                <option>Next 30 days</option>
                <option>Custom range</option>
              </select>
            </FilterSelect>

            <FilterSelect label="Format" icon={FileSpreadsheet}>
              <select className={selectClass}>
                <option>Excel (.xlsx)</option>
                <option>CSV (.csv)</option>
                <option>PDF (.pdf)</option>
                <option>iCal (.ics)</option>
              </select>
            </FilterSelect>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200/90">
            <div className="border-b border-gray-100 bg-slate-50/60 px-4 py-3">
              <h3 className="text-sm font-bold text-[#003366]">
                Include in export
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-1 p-3 sm:grid-cols-3">
              {EXPORT_OPTIONS.map((option) => (
                <label
                  key={option.id}
                  className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-slate-50"
                >
                  <input type="checkbox" className={checkboxClass} />
                  <span className="text-sm font-medium text-gray-700">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#003366] to-[#004080] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
            >
              <DownloadIcon className="h-4 w-4" />
              Download schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
