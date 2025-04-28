import { useState } from "react";
import { Link } from "react-router-dom";
import { RefreshCw } from "lucide-react";
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

export default function ManageMatches() {
  const [selectedMatches, setSelectedMatches] = useState(0);
  const [filters, setFilters] = useState({
    competition: "All",
    date: "All",
    status: "All",
    matchDateStatus: "All",
    team: "All",
    showUnplayedOnly: false,
    showHomeMatchesOnly: false,
    showHomeTeamNote: false,
    showRoadTeamNote: false,
    showGeneralNote: false,
  });

  const matches = [
    {
      id: 1,
      competition: "Division 2",
      dateTime: "Wed 09/04/24 07:00 PM",
      status: "Normal",
      homeTeam: "978 Records",
      roadTeam: "Bay State Snipers",
      note: "",
      finalScore: "47 - 51",
      approved: true,
      locked: true,
    },
    // Add more matches as needed
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Schedule</h1>

      {/* Schedule Navigation */}
      <div className="mb-6 overflow-x-auto">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-4">
            {scheduleNavItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={clsx(
                  "px-3 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap",
                  location.pathname === item.path
                    ? "border-[#00ADE5] text-[#00ADE5]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Competition
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={filters.competition}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    competition: e.target.value,
                  }))
                }
              >
                <option>All</option>
                <option>Division 1</option>
                <option>Division 2</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={filters.date}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, date: e.target.value }))
                }
              >
                <option>All</option>
                <option>Today</option>
                <option>This Week</option>
                <option>This Month</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value }))
                }
              >
                <option>All</option>
                <option>Normal</option>
                <option>Cancelled</option>
                <option>Postponed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Match Date Status
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={filters.matchDateStatus}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    matchDateStatus: e.target.value,
                  }))
                }
              >
                <option>All</option>
                <option>Confirmed</option>
                <option>Unconfirmed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team filter -{" "}
              <span className="text-blue-600">Select multiple teams</span>
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={filters.team}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, team: e.target.value }))
              }
            >
              <option>All</option>
              {/* Add team options */}
            </select>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">More filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.showUnplayedOnly}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      showUnplayedOnly: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-300 text-[#00ADE5] focus:ring-[#00ADE5]"
                />
                <span className="text-sm text-gray-600">
                  Show unplayed matches only
                </span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.showHomeMatchesOnly}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      showHomeMatchesOnly: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-300 text-[#00ADE5] focus:ring-[#00ADE5]"
                />
                <span className="text-sm text-gray-600">
                  Show home matches for selected teams only
                </span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.showHomeTeamNote}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      showHomeTeamNote: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-300 text-[#00ADE5] focus:ring-[#00ADE5]"
                />
                <span className="text-sm text-gray-600">Home team note</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.showRoadTeamNote}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      showRoadTeamNote: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-300 text-[#00ADE5] focus:ring-[#00ADE5]"
                />
                <span className="text-sm text-gray-600">Road team note</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.showGeneralNote}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      showGeneralNote: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-300 text-[#00ADE5] focus:ring-[#00ADE5]"
                />
                <span className="text-sm text-gray-600">General Note</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {selectedMatches} selected...
          </span>
          <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
            Actions ▼
          </button>
        </div>
        <div className="text-sm text-gray-600">163 matches displayed</div>
      </div>

      {/* Matches Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-12 px-6 py-3">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-[#00ADE5] focus:ring-[#00ADE5]"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Competition
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date and time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Home team
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Road team
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Note
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Final Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Approved
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Locked
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {matches.map((match) => (
              <tr key={match.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-[#00ADE5] focus:ring-[#00ADE5]"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {match.competition}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {match.dateTime}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {match.status}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {match.homeTeam}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {match.roadTeam}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {match.note}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {match.finalScore}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {match.approved && <span className="text-green-600">✓</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {match.locked && <span className="text-green-600">✓</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-800">
                      Edit
                    </button>
                    <button className="text-[#00ADE5] hover:text-red-800">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
