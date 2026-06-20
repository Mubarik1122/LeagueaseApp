import { AlertCircle, Download, FileSpreadsheet } from "lucide-react";
import { primaryButtonClass } from "./resultTheme";

export default function StatisticsDownload() {
  const handleDownload = () => {
    console.log("Downloading statistics...");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#003366] sm:text-xl">
          Statistics download
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Export all entered player and team statistics for the season.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-[#00ADE5]/20 bg-[#00ADE5]/5 px-4 py-3.5">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#00ADE5]" />
        <p className="text-sm leading-relaxed text-gray-600">
          Download a spreadsheet containing all statistics entered for the
          season. The file includes every approved stat type configured in your
          league setup.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gradient-to-r from-[#003366]/[0.03] to-[#00ADE5]/[0.05] px-5 py-4">
          <h3 className="text-sm font-bold text-[#003366]">Season export</h3>
          <p className="mt-0.5 text-xs text-gray-500">
            Full statistics workbook · CSV / Excel compatible
          </p>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 px-5 py-16 text-center">
          <div className="rounded-2xl border border-[#00ADE5]/20 bg-gradient-to-br from-[#003366]/5 to-[#00ADE5]/10 p-5">
            <FileSpreadsheet className="mx-auto h-10 w-10 text-[#00ADE5]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#003366]">
              Ready to export
            </p>
            <p className="mt-1 max-w-md text-sm text-gray-500">
              Generate a file with all recorded statistics for your league
              season.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownload}
            className={primaryButtonClass}
          >
            <Download className="h-4 w-4" />
            Download the file
          </button>
        </div>
      </div>
    </div>
  );
}
