import { Link, useLocation } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import clsx from "clsx";

const scheduleNavItems = [
  { id: "manage-matches", label: "MANAGE MATCHES", path: "/admin/schedule" },
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

export default function MassDelete() {
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
        {/* Warning Message */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <AlertCircle className="text-yellow-400 mr-2" size={20} />
            <p className="text-sm text-yellow-700">
              Warning: This will permanently delete matches. This action cannot
              be undone.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Competition
            </label>
            <select className="w-full md:w-auto border border-gray-300 rounded-md px-3 py-2">
              <option>All</option>
              <option>Division 1</option>
              <option>Division 2</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <div className="flex flex-wrap gap-4">
              <input
                type="date"
                className="border border-gray-300 rounded-md px-3 py-2"
              />
              <span className="self-center">to</span>
              <input
                type="date"
                className="border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Match Status
            </label>
            <select className="w-full md:w-auto border border-gray-300 rounded-md px-3 py-2">
              <option>All Matches</option>
              <option>Unplayed Matches Only</option>
              <option>Played Matches Only</option>
            </select>
          </div>

          <button className="px-4 py-2 bg-[#003366] text-white rounded hover:bg-[#003366]0">
            Delete Matches
          </button>
        </div>
      </div>
    </div>
  );
}
