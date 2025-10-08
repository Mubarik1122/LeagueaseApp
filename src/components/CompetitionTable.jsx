import { ChevronRight, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import CreateTournamentModal from "./CreateTournamentModal";

export default function CompetitionTable({ competitions }) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateSuccess = () => {
    // Refresh the page or trigger a re-fetch of competitions
    window.location.reload();
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Competitions
            </h3>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
            >
              Create a Division or Tournament
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
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
            <tbody className="divide-y divide-gray-200">
              {competitions.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No competitions found. Create your first tournament to get
                    started.
                  </td>
                </tr>
              ) : (
                competitions.map((comp, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-gray-900 font-medium">
                          {comp.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to="/admin/teams"
                        className="text-blue-600 hover:underline"
                      >
                        Add Teams
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-500">{comp.matches}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-500">{comp.results}</span>
                    </td>
                    <td className="px-6 py-4">
                      {comp.conflicts > 0 ? (
                        <div className="flex items-center text-yellow-600">
                          <AlertTriangle size={16} className="mr-1" />
                          <span>{comp.conflicts}</span>
                        </div>
                      ) : (
                        "0"
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to="/admin/standings"
                        className="text-blue-600 hover:underline"
                      >
                        Setup
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-500">{comp.shortCode}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-gray-400 hover:text-gray-600">
                        <ChevronRight size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateTournamentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
}
