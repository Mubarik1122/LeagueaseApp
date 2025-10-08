import { Link, useLocation } from "react-router-dom";
import { AlertCircle, Download as DownloadIcon } from "lucide-react";
import clsx from "clsx";

const scheduleNavItems = [
  { id: "manage-matches", label: "MANAGE MATCHES", path: "/schedule" },
  {
    id: "scheduler-tools",
    label: "SCHEDULER TOOLS",
    path: "/admin/schedule/scheduler-tools",
  },
  {
    id: "manually-create",
    label: "MANUALLY CREATE",
    path: "/admin/schedule/manually-create",
  },
  {
    id: "mass-delete",
    label: "MASS DELETE",
    path: "/admin/schedule/mass-delete",
  },
  { id: "conflicts", label: "CONFLICTS", path: "/admin/schedule/conflicts" },
  { id: "download", label: "DOWNLOAD", path: "/admin/schedule/download" },
];

export default function Download() {
  const location = useLocation();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Schedule</h1>

      {/* Schedule Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex flex-wrap">
          {scheduleNavItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={clsx(
                "px-4 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap",
                location.pathname === item.path
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Info Message */}
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <AlertCircle className="text-red-400 mr-2" size={20} />
            <p className="text-sm text-red-700">
              Download your schedule in various formats for offline use or
              importing into other applications.
            </p>
          </div>
        </div>

        {/* Download Options */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Competition
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                <option>All</option>
                <option>Division 1</option>
                <option>Division 2</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                <option>All Dates</option>
                <option>Next 7 Days</option>
                <option>Next 30 Days</option>
                <option>Custom Range</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Format
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                <option>Excel (.xlsx)</option>
                <option>CSV (.csv)</option>
                <option>PDF (.pdf)</option>
                <option>iCal (.ics)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-red-500"
              />
              <span className="text-sm text-gray-600">
                Include match officials
              </span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-red-500"
              />
              <span className="text-sm text-gray-600">
                Include venue details
              </span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-red-500"
              />
              <span className="text-sm text-gray-600">
                Include team contacts
              </span>
            </label>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-[#003366] text-white rounded hover:bg-[#003366]0">
            <DownloadIcon size={16} />
            Download Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
