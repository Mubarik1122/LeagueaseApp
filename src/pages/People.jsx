import { useState } from "react";
import { Link } from "react-router-dom";
import { RefreshCw, Search as SearchIcon } from "lucide-react";
import clsx from "clsx";

const tabs = [
  { id: "list", label: "List by Role" },
  { id: "search", label: "Search" },
];

const topTabs = [
  { id: "list-people", label: "LIST PEOPLE" },
  { id: "registrations", label: "REGISTRATIONS" },
  { id: "data-protection", label: "DATA PROTECTION" },
  { id: "search", label: "SEARCH" },
  { id: "merge-people", label: "MERGE PEOPLE" },
  { id: "active-dates", label: "ACTIVE DATES" },
  { id: "suspensions", label: "SUSPENSIONS" },
  { id: "age-conflicts", label: "AGE CONFLICTS" },
  { id: "spreadsheet-upload", label: "SPREADSHEET UPLOAD" },
  { id: "transfer-players", label: "TRANSFER PLAYERS" },
  { id: "transfer-report", label: "TRANSFER REPORT" },
  { id: "person-download", label: "PERSON DOWNLOAD" },
  { id: "people-without-roles", label: "PEOPLE WITHOUT ROLES" },
];

const mockPeople = [
  {
    name: "Akbar, Mubarik",
    role: "4sov tournament: League Administrator",
    email: "hehapi1436@evasud.com",
    dateOfBirth: "",
    hasLogin: true,
    lastLoggedIn: "Wed 12 Mar 2025 07:48 PM",
    verifiedEmail: true,
  },
];

export default function People() {
  const [activeTab, setActiveTab] = useState("list");
  const [activeTopTab, setActiveTopTab] = useState("list-people");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "Active",
    role: "League Administrator",
    season: "2024-2025",
    division: "All",
    team: "All",
    fromDate: {
      day: "26",
      month: "October",
      year: "2024",
    },
    toDate: {
      day: "10",
      month: "December",
      year: "2024",
    },
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">People</h1>

      {/* Top Navigation Tabs */}
      <div className="mb-6 overflow-x-auto">
        <div className="border-b border-gray-200 whitespace-nowrap">
          <nav className="flex space-x-4">
            {topTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTopTab(tab.id)}
                className={clsx(
                  "px-3 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap",
                  activeTopTab === tab.id
                    ? "border-[#00ADE5] text-[#00ADE5]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="bg-gray-100 rounded-t-lg border border-gray-200">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "px-6 py-3 text-sm font-medium rounded-t-lg",
                activeTab === tab.id
                  ? "bg-white border-t-2 border-[#00ADE5]"
                  : "text-gray-600 hover:text-gray-800"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border-x border-b border-gray-200 rounded-b-lg p-6">
        {activeTab === "search" ? (
          // Search Tab Content
          <div className="space-y-6">
            <div className="max-w-2xl">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by entering the first part of first name, last name or email address e.g. 'Pete' would return 'Peter Black', 'John Peters' and 'peterkgfdssyn2009@hotmail.com'"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
                />
                <SearchIcon
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
              </div>
            </div>

            <button className="px-4 py-2 bg-[#003366] text-white rounded hover:bg-[#003366]">
              Search
            </button>
          </div>
        ) : (
          // List by Role Tab Content
          <>
            <div className="mb-6">
              <Link to="/role-types" className="text-blue-600 hover:underline">
                To review and select role types specific to your league click
                here
              </Link>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Role
                  <span className="text-gray-500 text-xs ml-2">
                    After changing wait for screen to refresh
                  </span>
                </label>
                <select
                  value={filters.role}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, role: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option>League Administrator</option>
                  <option>Team Manager</option>
                  <option>Player</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Season
                </label>
                <select
                  value={filters.season}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, season: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option>2024-2025</option>
                  <option>2023-2024</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Division
                </label>
                <select
                  value={filters.division}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      division: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option>All</option>
                  <option>Division 1</option>
                  <option>Division 2</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Team</label>
                <select
                  value={filters.team}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, team: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option>All</option>
                  <option>Team A</option>
                  <option>Team B</option>
                </select>
              </div>
            </div>

            {/* Date Range */}
            <div className="flex flex-wrap gap-6 mb-6">
              <div>
                <label className="block text-sm text-gray-700 mb-1">From</label>
                <div className="flex gap-2">
                  <select className="border border-gray-300 rounded-md px-2 py-2">
                    <option>26</option>
                  </select>
                  <select className="border border-gray-300 rounded-md px-2 py-2">
                    <option>October</option>
                  </select>
                  <select className="border border-gray-300 rounded-md px-2 py-2">
                    <option>2024</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">To</label>
                <div className="flex gap-2">
                  <select className="border border-gray-300 rounded-md px-2 py-2">
                    <option>10</option>
                  </select>
                  <select className="border border-gray-300 rounded-md px-2 py-2">
                    <option>December</option>
                  </select>
                  <select className="border border-gray-300 rounded-md px-2 py-2">
                    <option>2024</option>
                  </select>
                </div>
              </div>

              <div className="flex items-end">
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  <RefreshCw size={16} />
                  Refresh
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-6">
              Changing these dates overrides the season start and end dates
            </p>

            {/* Action Buttons */}
            <div className="flex gap-2 mb-6">
              <button className="px-4 py-2 bg-[#003366] text-white rounded hover:bg-[#003366]">
                Create new
              </button>
              <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                Back
              </button>
            </div>

            {/* People Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date Of Birth
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Has Login?
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Verified Email?
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockPeople.map((person, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {person.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {person.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {person.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {person.dateOfBirth}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {person.hasLogin && (
                          <div>
                            <span className="text-green-600">✓ Yes</span>
                            <div className="text-xs text-gray-500">
                              Last logged in: {person.lastLoggedIn}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {person.verifiedEmail && (
                          <span className="text-green-600">✓ Yes</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                            Edit
                          </button>
                          <button className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
