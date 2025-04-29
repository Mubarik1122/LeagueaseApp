import { Link, useLocation } from "react-router-dom";
import { AlertCircle, RefreshCw } from "lucide-react";
import clsx from "clsx";

const scheduleNavItems = [
  { id: "manage-matches", label: "MANAGE MATCHES", path: "/schedule" },
  {
    id: "scheduler-tools",
    label: "SCHEDULER TOOLS",
    path: "/schedule/scheduler-tools",
  },
  {
    id: "manually-create",
    label: "MANUALLY CREATE",
    path: "/schedule/manually-create",
  },
  { id: "mass-delete", label: "MASS DELETE", path: "/schedule/mass-delete" },
  { id: "conflicts", label: "CONFLICTS", path: "/schedule/conflicts" },
  { id: "download", label: "DOWNLOAD", path: "/schedule/download" },
];

export default function Conflicts() {
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
              View and manage scheduling conflicts between teams and venues.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                Team
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                <option>All Teams</option>
                <option>Team A</option>
                <option>Team B</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Venue
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                <option>All Venues</option>
                <option>Venue A</option>
                <option>Venue B</option>
              </select>
            </div>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-[#003366]0 text-white rounded hover:bg-red-700">
            <RefreshCw size={16} />
            Check Conflicts
          </button>
        </div>

        {/* Results Table */}
        <div className="mt-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="text-sm text-yellow-700">
              No conflicts found for the selected criteria.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
