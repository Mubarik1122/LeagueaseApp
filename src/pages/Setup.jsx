import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";

const tabs = [
  { id: "league", label: "League Options", active: true },
  { id: "roles", label: "Roles" },
  { id: "general", label: "General Site Settings" },
  { id: "facebook", label: "Facebook Settings" },
  { id: "twitter", label: "Twitter Settings" },
  { id: "terminology", label: "Terminology" },
];

const sideMenuItems = [
  {
    id: "team-admin",
    label: "Team Admin Results and matches options",
    active: true,
  },
  { id: "approval", label: "Approval and Locking" },
  { id: "match-officials", label: "Match officials and marks" },
  { id: "player-role", label: "Player Role Active Dates" },
  {
    id: "people-duplication",
    label: "People duplication and merge default criteria",
  },
  { id: "player-suspension", label: "Player suspension options" },
  { id: "venues", label: "Venues" },
  { id: "match-file", label: "Match File Upload" },
];

export default function Setup() {
  const [activeTab, setActiveTab] = useState("league");
  const [activeMenuItem, setActiveMenuItem] = useState("team-admin");
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    blockTeamAdmins: false,
    allowStatsEntry: false,
    allowDivisionMatches: false,
    homeTeamOptions: {
      changeDate: false,
      changeTime: false,
      changeStatus: false,
      changeVenue: false,
    },
    awayTeamOptions: {
      changeDate: false,
      changeTime: false,
      changeStatus: false,
      changeVenue: false,
    },
  });

  const handleCheckboxChange = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleTeamOptionChange = (team, option) => {
    setFormData((prev) => ({
      ...prev,
      [`${team}Options`]: {
        ...prev[`${team}Options`],
        [option]: !prev[`${team}Options`][option],
      },
    }));
  };

  return (
    <div className="p-6">
      {/* Top Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <Link
            to="/setup"
            className={clsx(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px",
              location.pathname === "/setup"
                ? "border-red-500 text-red-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            SETTINGS
          </Link>
          <Link
            to="/setup/competitions"
            className={clsx(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px",
              location.pathname === "/setup/competitions"
                ? "border-red-500 text-red-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            COMPETITIONS
          </Link>
        </nav>
      </div>

      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Settings</h1>

      <div className="bg-white rounded-lg shadow">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  "px-6 py-3 text-sm font-medium",
                  activeTab === tab.id
                    ? "border-b-2 border-red-500 text-red-600"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex">
          {/* Side Menu */}
          <div className="w-64 border-r border-gray-200 p-4">
            {sideMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveMenuItem(item.id)}
                className={clsx(
                  "w-full text-left px-4 py-2 rounded-lg text-sm",
                  activeMenuItem === item.id
                    ? "bg-gray-100 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Team Admin Results and matches options
            </h2>

            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Options:</h3>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.blockTeamAdmins}
                    onChange={() => handleCheckboxChange("blockTeamAdmins")}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-600">
                    Block Team Administrators from changing the match status of
                    a match?
                  </span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.allowStatsEntry}
                    onChange={() => handleCheckboxChange("allowStatsEntry")}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-600">
                    Allow Team Administrators to enter stats for opposition team
                  </span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.allowDivisionMatches}
                    onChange={() =>
                      handleCheckboxChange("allowDivisionMatches")
                    }
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-600">
                    Allow Team Administrators to create division matches
                  </span>
                </label>
              </div>

              <div className="mt-8">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-sm font-medium text-gray-500">
                        Team Admin Options:
                      </th>
                      <th className="text-center py-2 text-sm font-medium text-gray-500">
                        When Home Team
                      </th>
                      <th className="text-center py-2 text-sm font-medium text-gray-500">
                        When Away Team
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: "changeDate", label: "Change match date" },
                      { id: "changeTime", label: "Change match time" },
                      { id: "changeStatus", label: "Change match date status" },
                      { id: "changeVenue", label: "Change match venue" },
                    ].map((option) => (
                      <tr key={option.id} className="border-b border-gray-100">
                        <td className="py-2 text-sm text-gray-600">
                          {option.label}
                        </td>
                        <td className="text-center">
                          <input
                            type="checkbox"
                            checked={formData.homeTeamOptions[option.id]}
                            onChange={() =>
                              handleTeamOptionChange("homeTeam", option.id)
                            }
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                        </td>
                        <td className="text-center">
                          <input
                            type="checkbox"
                            checked={formData.awayTeamOptions[option.id]}
                            onChange={() =>
                              handleTeamOptionChange("awayTeam", option.id)
                            }
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-4 mt-8">
                <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                  Update
                </button>
                <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
