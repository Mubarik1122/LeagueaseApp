import { useState } from "react";
import { Plus, Trash2, Settings, Users, Calendar } from "lucide-react";

const mockCompetitions = [
  {
    id: 1,
    name: "Premier League",
    type: "League",
    season: "2024-2025",
    teams: 8,
    status: "Active",
  },
  {
    id: 2,
    name: "Championship Cup",
    type: "Tournament",
    season: "2024-2025",
    teams: 16,
    status: "Upcoming",
  },
];

export default function Competitions() {
  const [competitions, setCompetitions] = useState(mockCompetitions);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showMatchForm, setShowMatchForm] = useState(false);
  const [managingCompetition, setManagingCompetition] = useState(null);
  const [activeManageTab, setActiveManageTab] = useState("teams");
  const [activeTeamTab, setActiveTeamTab] = useState("existing");
  const [divisionSettingsTab, setDivisionSettingsTab] = useState("settings");

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this competition?")) {
      setCompetitions(competitions.filter((comp) => comp.id !== id));
    }
  };

  const handleManage = (competition) => {
    setManagingCompetition(competition);
  };

  if (managingCompetition) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            {managingCompetition.name}
          </h1>
        </div>

        {/* Main Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveManageTab("teams")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeManageTab === "teams"
                    ? "border-[#009ACB] text-[#009ACB]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Manage Teams
              </button>
              <button
                onClick={() => setActiveManageTab("division")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeManageTab === "division"
                    ? "border-[#009ACB] text-[#009ACB]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Division Settings
              </button>
            </nav>
          </div>
        </div>

        {activeManageTab === "teams" && (
          <div>
            {/* Team Management Tabs */}
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setActiveTeamTab("existing")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTeamTab === "existing"
                        ? "border-[#009ACB] text-[#009ACB]"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Add Existing Teams
                  </button>
                  <button
                    onClick={() => setActiveTeamTab("create")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTeamTab === "create"
                        ? "border-[#009ACB] text-[#009ACB]"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Create New Teams
                  </button>
                </nav>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-1">
                {activeTeamTab === "existing" && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Teams Filter
                        </label>
                        <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                          <option>Teams not in a division</option>
                          <option>Teams in another division</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Registration Campaign
                        </label>
                        <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                          <option>Registration Campaign : All</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm text-gray-600">
                          0 selected...
                        </span>
                        <button className="px-3 py-1 bg-green-500 text-white rounded text-sm">
                          Add to division
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              <input type="checkbox" />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Team
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Venues
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Registration
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Participates In
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          <tr>
                            <td className="px-6 py-4">
                              <input type="checkbox" />
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              <div>Team 1 4SOV</div>
                              <div className="text-gray-500">
                                Short code: 4SOV
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-[#009ACB]">
                              <a href="#" className="hover:underline">
                                Gurnee
                              </a>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              ⚪
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              🏆 Test Tournament
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4">
                              <input type="checkbox" />
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              <div>Team 2 4SOV</div>
                              <div className="text-gray-500">
                                Short code: 2SOV
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-[#009ACB]">
                              <a href="#" className="hover:underline">
                                Lahore
                              </a>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              ⚪
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              🏆 Test Tournament
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-6">
                      <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                        Back
                      </button>
                    </div>
                  </div>
                )}

                {activeTeamTab === "create" && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="mb-6">
                      <div className="flex gap-2 mb-4">
                        <button className="px-4 py-2 bg-[#009ACB] text-white rounded text-sm">
                          DETAILED
                        </button>
                        <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm">
                          QUICK
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">
                              #
                            </th>
                            <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">
                              Team name
                            </th>
                            <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">
                              Short code <span className="text-red-500">*</span>
                            </th>
                            <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">
                              Venue <span className="text-red-500">*</span>
                            </th>
                            <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">
                              Create new venue
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                            <tr key={num} className="border-b">
                              <td className="py-2 px-2">{num}</td>
                              <td className="py-2 px-2">
                                <input
                                  type="text"
                                  placeholder="Team Name"
                                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                />
                              </td>
                              <td className="py-2 px-2">
                                <input
                                  type="text"
                                  placeholder="Short code"
                                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                />
                              </td>
                              <td className="py-2 px-2">
                                <select className="w-full border border-gray-300 rounded px-2 py-1 text-sm">
                                  <option>Select existing venue</option>
                                  <option>Venue 1</option>
                                  <option>Venue 2</option>
                                </select>
                              </td>
                              <td className="py-2 px-2">
                                <input
                                  type="text"
                                  placeholder="Create new venue"
                                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-6 flex gap-2">
                      <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                        ➕ Add more
                      </button>
                    </div>

                    <div className="mt-6 flex gap-2">
                      <button className="px-4 py-2 bg-[#009ACB] text-white rounded hover:bg-[#007a9a]">
                        Create
                      </button>
                      <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                        Back
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Sidebar */}
              <div className="w-80">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    {managingCompetition.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-6 h-6 bg-[#009ACB] rounded-full flex items-center justify-center text-white text-xs">
                      0
                    </div>
                    <span>Teams</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    There are no teams in the division
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeManageTab === "division" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Division Settings
              </h2>
              <button className="px-4 py-2 bg-[#009ACB] text-white rounded hover:bg-[#007a9a] flex items-center gap-2">
                <Trash2 size={16} />
                Delete Division
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Division name
                  </label>
                  <input
                    type="text"
                    defaultValue="test"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sequence
                  </label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option value="3">3</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Code
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scoring system
                  </label>
                  <div className="text-sm text-gray-600">
                    Default Configuration for cricket: (Score for: 1 )
                  </div>
                </div>
              </div>

              {/* Promotion and Relegation */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Promotion and Relegation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zones
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-green-600">Promotion:</span>
                      <select className="border border-gray-300 rounded px-2 py-1 text-sm">
                        <option>Top</option>
                        <option>Bottom</option>
                      </select>
                      <span className="text-sm">teams</span>
                      <span className="text-sm text-red-600 ml-4">
                        Relegation:
                      </span>
                      <select className="border border-gray-300 rounded px-2 py-1 text-sm">
                        <option>Bottom</option>
                        <option>Top</option>
                      </select>
                      <span className="text-sm">teams</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Display the promotion and relegation zones on the
                      standings in the league website for this season
                    </p>
                  </div>
                </div>
              </div>

              {/* Position Highlights */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Position Highlights
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="highlights"
                        value="auto"
                        defaultChecked
                      />
                      <span className="text-sm">Auto</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="highlights" value="manual" />
                      <span className="text-sm">Manual</span>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600">
                    Either allow the system to work out when a team has been
                    confirmed as either champion, promoted or relegated this
                    season or manually set these for this season
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-600">
                      ⚠ You need to add some teams to this division before you
                      can manually create highlights
                    </p>
                  </div>
                </div>
              </div>

              {/* Hide Options */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700 w-32">
                    Hide Matches from
                  </label>
                  <input
                    type="date"
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                  <span className="text-sm text-red-500">📅 Not set</span>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" />
                    <span className="text-sm">
                      Hide the table / standings on the public pages
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" />
                    <span className="text-sm">Hide Players</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" />
                    <span className="text-sm">
                      Automatically hide results on the public pages
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" />
                    <span className="text-sm">
                      Automatically hide venues on the public pages
                    </span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <button className="px-4 py-2 bg-[#009ACB] text-white rounded hover:bg-[#007a9a]">
                  Update
                </button>
                <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                  Finished
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={() => setManagingCompetition(null)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Back to Competitions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Competitions</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#009ACB] text-white rounded hover:bg-[#007a9a]"
          >
            <Plus size={20} />
            Create a Division or Tournament
          </button>
          <button
            onClick={() => setShowMatchForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <Calendar size={20} />
            Create Match
          </button>
        </div>
      </div>

      {/* Create Competition Form */}
      {showCreateForm && (
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Create New Competition
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Competition name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                <option>League</option>
                <option>Tournament</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Season
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="2024-2025"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Teams
              </label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="8"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="px-4 py-2 bg-[#009ACB] text-white rounded hover:bg-[#007a9a]">
              Create
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Create Match Form */}
      {showMatchForm && (
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Create New Match
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Competition
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                <option>Select Competition</option>
                {competitions.map((comp) => (
                  <option key={comp.id} value={comp.id}>
                    {comp.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Home Team
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                <option>Select Home Team</option>
                <option>Team A</option>
                <option>Team B</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Away Team
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                <option>Select Away Team</option>
                <option>Team C</option>
                <option>Team D</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <input
                type="time"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Venue
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                <option>Select Venue</option>
                <option>Stadium A</option>
                <option>Stadium B</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              Create Match
            </button>
            <button
              onClick={() => setShowMatchForm(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Competitions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Season
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teams
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {competitions.map((competition) => (
                <tr key={competition.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {competition.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {competition.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {competition.season}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {competition.teams}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        competition.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {competition.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleManage(competition)}
                        className="flex items-center gap-1 px-3 py-1 bg-[#009ACB] text-white rounded hover:bg-[#007a9a]"
                      >
                        <Settings size={14} />
                        Manage
                      </button>
                      <button
                        onClick={() => handleDelete(competition.id)}
                        className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        <Trash2 size={14} />
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
    </div>
  );
}
