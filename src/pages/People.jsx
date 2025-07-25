import { useState } from "react";
import { Link, useLocation, Routes, Route } from "react-router-dom";
import { RefreshCw, Search as SearchIcon } from "lucide-react";
import clsx from "clsx";

// Import all people-related components
import Registrations from "./people/Registrations";
import DataProtection from "./people/DataProtection";
import MergePeople from "./people/MergePeople";
import ActiveDates from "./people/ActiveDates";
import Suspensions from "./people/Suspensions";
import AgeConflicts from "./people/AgeConflicts";
import SpreadsheetUpload from "./people/SpreadsheetUpload";
import TransferPlayers from "./people/TransferPlayers";
import TransferReport from "./people/TransferReport";
import PersonDownload from "./people/PersonDownload";
import PeopleWithoutRoles from "./people/PeopleWithoutRoles";

const topTabs = [
  { id: "list-people", label: "LIST PEOPLE", path: "/people" },
  {
    id: "registrations",
    label: "REGISTRATIONS",
    path: "/people/registrations",
  },
  {
    id: "data-protection",
    label: "DATA PROTECTION",
    path: "/people/data-protection",
  },
  { id: "merge-people", label: "MERGE PEOPLE", path: "/people/merge-people" },
  { id: "active-dates", label: "ACTIVE DATES", path: "/people/active-dates" },
  { id: "suspensions", label: "SUSPENSIONS", path: "/people/suspensions" },
  {
    id: "age-conflicts",
    label: "AGE CONFLICTS",
    path: "/people/age-conflicts",
  },
  {
    id: "spreadsheet-upload",
    label: "SPREADSHEET UPLOAD",
    path: "/people/spreadsheet-upload",
  },
  {
    id: "transfer-players",
    label: "TRANSFER PLAYERS",
    path: "/people/transfer-players",
  },
  {
    id: "transfer-report",
    label: "TRANSFER REPORT",
    path: "/people/transfer-report",
  },
  {
    id: "person-download",
    label: "PERSON DOWNLOAD",
    path: "/people/person-download",
  },
  {
    id: "people-without-roles",
    label: "PEOPLE WITHOUT ROLES",
    path: "/people/people-without-roles",
  },
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

function ListPeople() {
  const [activeTab, setActiveTab] = useState("list");
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
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab("list")}
            className={clsx(
              "px-6 py-3 text-sm font-medium rounded-tl-lg",
              activeTab === "list"
                ? "bg-white border-t-2 border-[#00ade5] text-gray-900"
                : "text-gray-600 hover:text-gray-800"
            )}
          >
            List by Role
          </button>
          <button
            onClick={() => setActiveTab("search")}
            className={clsx(
              "px-6 py-3 text-sm font-medium",
              activeTab === "search"
                ? "bg-white border-t-2 border-[#00ade5] text-gray-900"
                : "text-gray-600 hover:text-gray-800"
            )}
          >
            Search
          </button>
        </div>

        <div className="p-6">
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
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00ade5]"
                  />
                  <SearchIcon
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                </div>
              </div>

              <button className="px-4 py-2 bg-[#00ade5] text-white rounded hover:bg-[#0099cc]">
                Search
              </button>
            </div>
          ) : (
            // List by Role Tab Content
            <>
              <div className="mb-6">
                <Link
                  to="/role-types"
                  className="text-[#00ade5] hover:underline"
                >
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
                      setFilters((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
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
                      setFilters((prev) => ({
                        ...prev,
                        season: e.target.value,
                      }))
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
                  <label className="block text-sm text-gray-700 mb-1">
                    Team
                  </label>
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
                  <label className="block text-sm text-gray-700 mb-1">
                    From
                  </label>
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
                  <button className="flex items-center gap-2 px-4 py-2 bg-[#00ade5] text-white rounded hover:bg-[#0099cc]">
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
                <button className="px-4 py-2 bg-[#00ade5] text-white rounded hover:bg-[#0099cc]">
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
    </div>
  );
}

export default function People() {
  const location = useLocation();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">People</h1>

      {/* Top Navigation Tabs */}
      <div className="mb-6 overflow-x-auto">
        <div className="border-b border-gray-200 whitespace-nowrap">
          <nav className="flex space-x-4">
            {topTabs.map((tab) => (
              <Link
                key={tab.id}
                to={tab.path}
                className={clsx(
                  "px-3 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap",
                  location.pathname === tab.path
                    ? "border-[#00ade5] text-[#00ade5]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Routes */}
      <Routes>
        <Route index element={<ListPeople />} />
        <Route path="registrations" element={<Registrations />} />
        <Route path="data-protection" element={<DataProtection />} />
        <Route path="merge-people" element={<MergePeople />} />
        <Route path="active-dates" element={<ActiveDates />} />
        <Route path="suspensions" element={<Suspensions />} />
        <Route path="age-conflicts" element={<AgeConflicts />} />
        <Route path="spreadsheet-upload" element={<SpreadsheetUpload />} />
        <Route path="transfer-players" element={<TransferPlayers />} />
        <Route path="transfer-report" element={<TransferReport />} />
        <Route path="person-download" element={<PersonDownload />} />
        <Route path="people-without-roles" element={<PeopleWithoutRoles />} />
      </Routes>
    </div>
  );
}
