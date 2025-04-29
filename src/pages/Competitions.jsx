import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ChevronRight } from "lucide-react";

export default function Competitions() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const competitions = [
    {
      id: 1,
      name: "4sov tournament",
      teams: 0,
      matches: 0,
      results: 0,
      conflicts: 0,
      shortCode: "4SOV",
    },
  ];

  if (showCreateForm) {
    return (
      <div className="p-6">
        {/* Top Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <Link
              to="/setup"
              className="px-4 py-2 text-sm font-medium border-b-2 -mb-px border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              SETTINGS
            </Link>
            <Link
              to="/setup/competitions"
              className="px-4 py-2 text-sm font-medium border-b-2 -mb-px border-[#00ade5] text-[#00ade5]"
            >
              COMPETITIONS
            </Link>
          </nav>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Create a Division or Tournament
          </h1>
          <button
            onClick={() => setShowCreateForm(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Competition Name *
              </label>
              <input
                type="text"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ade5] focus:border-[#00ade5]"
                placeholder="Enter competition name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Competition Type *
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ade5] focus:border-[#00ade5]">
                <option>Division (Round Robin)</option>
                <option>Tournament (Knockout)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short Code *
              </label>
              <input
                type="text"
                required
                maxLength={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ade5] focus:border-[#00ade5]"
                placeholder="Enter 4 character code"
              />
              <p className="mt-1 text-sm text-gray-500">
                This will be used as a prefix for team codes in this competition
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age Group
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ade5] focus:border-[#00ade5]">
                <option>Open Age</option>
                <option>Under 18</option>
                <option>Under 16</option>
                <option>Under 14</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ade5] focus:border-[#00ade5]">
                <option>Mixed</option>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-[#00ade5] text-white rounded hover:bg-[#0099cc]"
              >
                Create Competition
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Top Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <Link
            to="/setup"
            className="px-4 py-2 text-sm font-medium border-b-2 -mb-px border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          >
            SETTINGS
          </Link>
          <Link
            to="/setup/competitions"
            className="px-4 py-2 text-sm font-medium border-b-2 -mb-px border-[#00ade5] text-[#00ade5]"
          >
            COMPETITIONS
          </Link>
        </nav>
      </div>

      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Competitions
      </h1>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-700">
            Manage your divisions, cups and teams
          </h2>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-[#00ade5] text-white rounded-lg hover:bg-[#0099cc]"
          >
            Create a Division or Tournament
          </button>
        </div>

        {/* Warning Message */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex items-center">
            <AlertTriangle className="text-yellow-400 mr-2" size={20} />
            <p className="text-yellow-700">
              Some of your tournaments do not have enough teams, try adding some
              teams to{" "}
              <Link to="/tournament/4sov" className="text-yellow-700 underline">
                4sov tournament
              </Link>
            </p>
          </div>
        </div>

        {/* Competitions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Competition
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teams
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Matches
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Results
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conflicts 60 Days
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Standings Setup
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Short Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {competitions.map((comp) => (
                <tr key={comp.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-gray-900 font-medium">
                        {comp.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to={`/teams/${comp.id}`}
                      className="text-[#00ade5] hover:underline"
                    >
                      Add Teams
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {comp.matches}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {comp.results}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {comp.conflicts}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to={`/standings/${comp.id}`}
                      className="text-[#00ade5] hover:underline"
                    >
                      Setup
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {comp.shortCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="px-3 py-1 bg-[#00ade5] bg-opacity-10 text-[#00ade5] rounded hover:bg-opacity-20">
                      Manage
                    </button>
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
