import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Grid, List } from "lucide-react";
import clsx from "clsx";

export default function ManuallyCreate() {
  const [activeTab, setActiveTab] = useState("division");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedDivision, setSelectedDivision] = useState("Division 1");
  const [matchDateTime, setMatchDateTime] = useState({
    day: "25",
    month: "March",
    year: "2025",
    hour: "00",
    minute: "00",
  });

  const teams = [
    { id: "GOTC", name: "G.O.T.C [GOTC]" },
    { id: "HH", name: "Halal Hustle [HH]" },
    { id: "JANN", name: "Jannah SSS [JANN]" },
    // Add more teams
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          to="/schedule"
          className="text-blue-600 hover:underline flex items-center gap-2"
        >
          ← Back to Manage Matches
        </Link>
      </div>

      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Manually Create Matches
      </h1>

      {/* Tabs */}
      <div className="bg-gray-100 rounded-t-lg border border-gray-200 mb-6">
        <div className="flex">
          {[
            { id: "division", label: "Division Matches" },
            { id: "inter-division", label: "Inter-Division Matches" },
            { id: "other", label: "Other Matches" },
            { id: "spreadsheet", label: "Spreadsheet Upload" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "px-6 py-3 text-sm font-medium",
                activeTab === tab.id
                  ? "bg-white border-t-2 border-[#00ADE5] text-gray-900"
                  : "text-gray-600 hover:text-gray-800"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Division Selector */}
        <div className="mb-6">
          <select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            className="w-full md:w-auto border border-gray-300 rounded-md px-3 py-2"
          >
            <option>Division 1</option>
            <option>Division 2</option>
          </select>
        </div>

        {/* Info Message */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <AlertCircle className="text-blue-400 mr-2" size={20} />
            <p className="text-sm text-blue-700">
              To create matches for your selected date either select a checkbox
              in the grid for the teams you wish to play or select the teams
              from the lists below then press the create button.
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setViewMode("grid")}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded",
              viewMode === "grid"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            <Grid size={16} />
            GRID
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded",
              viewMode === "list"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            <List size={16} />
            LIST
          </button>
        </div>

        {/* Date/Time Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Matches to take place on date and time:
          </label>
          <div className="flex gap-2">
            <select
              value={matchDateTime.day}
              onChange={(e) =>
                setMatchDateTime((prev) => ({ ...prev, day: e.target.value }))
              }
              className="border border-gray-300 rounded-md px-2 py-1"
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
            <select
              value={matchDateTime.month}
              onChange={(e) =>
                setMatchDateTime((prev) => ({ ...prev, month: e.target.value }))
              }
              className="border border-gray-300 rounded-md px-2 py-1"
            >
              {[
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ].map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
            <select
              value={matchDateTime.year}
              onChange={(e) =>
                setMatchDateTime((prev) => ({ ...prev, year: e.target.value }))
              }
              className="border border-gray-300 rounded-md px-2 py-1"
            >
              <option>2025</option>
              <option>2026</option>
            </select>
            <select
              value={matchDateTime.hour}
              onChange={(e) =>
                setMatchDateTime((prev) => ({ ...prev, hour: e.target.value }))
              }
              className="border border-gray-300 rounded-md px-2 py-1"
            >
              {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                <option key={hour} value={hour.toString().padStart(2, "0")}>
                  {hour.toString().padStart(2, "0")}
                </option>
              ))}
            </select>
            <span className="text-gray-500">:</span>
            <select
              value={matchDateTime.minute}
              onChange={(e) =>
                setMatchDateTime((prev) => ({
                  ...prev,
                  minute: e.target.value,
                }))
              }
              className="border border-gray-300 rounded-md px-2 py-1"
            >
              {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                <option key={minute} value={minute.toString().padStart(2, "0")}>
                  {minute.toString().padStart(2, "0")}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button className="px-4 py-2 bg-[#003366] text-white rounded hover:bg-[#003366]">
          Create
        </button>

        {/* Match Grid/List will be shown here based on viewMode */}
        {viewMode === "grid" ? (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border-b border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-500">
                    Home team
                  </th>
                  {teams.map((team) => (
                    <th
                      key={team.id}
                      className="border-b border-gray-200 px-4 py-2 text-center text-sm font-medium text-gray-500"
                    >
                      {team.id}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {teams.map((homeTeam) => (
                  <tr key={homeTeam.id}>
                    <td className="border-b border-gray-200 px-4 py-2 text-sm text-gray-900">
                      {homeTeam.name}
                    </td>
                    {teams.map((awayTeam) => (
                      <td
                        key={awayTeam.id}
                        className="border-b border-gray-200 px-4 py-2 text-center"
                      >
                        {homeTeam.id !== awayTeam.id && (
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-[#00ADE5] focus:ring-[#00ADE5]"
                          />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* List view implementation */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Home Teams
              </h3>
              <div className="space-y-2">
                {teams.map((team) => (
                  <label key={team.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-[#00ADE5] focus:ring-[#00ADE5]"
                    />
                    <span className="text-sm text-gray-900">{team.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Away Teams
              </h3>
              <div className="space-y-2">
                {teams.map((team) => (
                  <label key={team.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-[#00ADE5] focus:ring-[#00ADE5]"
                    />
                    <span className="text-sm text-gray-900">{team.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
