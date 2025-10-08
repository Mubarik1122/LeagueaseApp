import { Link, useLocation } from "react-router-dom";
import { AlertCircle, Clock } from "lucide-react";
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

export default function SchedulerTools() {
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

      <div className="space-y-6">
        {/* Multi Division Scheduler */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-red-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                new - try this first
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-800 mb-2">
                  Multi Division Scheduler
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <Clock size={16} />
                  <span>5 mins approx</span>
                </div>
                <p className="text-gray-600 mb-4">
                  Please check out the new scheduler that we are introducing in
                  Beta stage. It will schedule divisions of different sizes
                  having them all complete as soon as possible. For example, if
                  you have a 10 team division meeting twice it will be completed
                  in 18 weeks and an 8 team division meeting twice in 14 weeks.
                  It accommodates venue sharing between the divisions.
                </p>
                <button className="px-4 py-2 bg-[#003366] text-white rounded hover:bg-[#003366]0">
                  Go →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Template Scheduler */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div>
                <h2 className="text-lg font-medium text-gray-800 mb-2">
                  Template scheduler
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <Clock size={16} />
                  <span>5 mins approx</span>
                </div>
                <p className="text-gray-600 mb-4">
                  Use this scheduler for single or similar size divisions.
                  Matches will complete at the same time as the largest
                  division. Supports venue sharing across divisions and
                  inter-division matches.
                </p>
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                    Go →
                  </button>
                  <Link
                    to="/admin/help/scheduler"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <AlertCircle size={16} />
                    Find out more
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
