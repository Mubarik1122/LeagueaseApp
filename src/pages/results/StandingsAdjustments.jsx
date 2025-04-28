import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";

export default function StandingsAdjustments() {
  const [selectedDivision, setSelectedDivision] = useState("Division 1");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Standings Adjustments
      </h1>

      <div className="space-y-6">
        {/* Info Message */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <AlertCircle className="text-blue-400 mr-2" size={20} />
            <p className="text-sm text-blue-700">
              Create points adjustments for the standings. Change the score for
              / against on the standings / Override a team's position on the
              standings.
            </p>
          </div>
        </div>

        {/* Division Selector */}
        <div>
          <select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            className="w-full md:w-auto border border-gray-300 rounded-md px-3 py-2"
          >
            <option>Division 1</option>
            <option>Division 2</option>
          </select>
        </div>

        {/* Override Link */}
        <div>
          <Link
            to="/standings/override"
            className="text-blue-600 hover:underline"
          >
            Click here to override a team's position in the standings.
          </Link>
        </div>

        {/* No Adjustments Message */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <p className="text-sm text-yellow-700">
            There are no table adjustments to display
          </p>
        </div>

        {/* Create New Button */}
        <div>
          <button className="px-4 py-2 bg-[#003366] text-white rounded hover:bg-[#003366]">
            Create new
          </button>
        </div>
      </div>
    </div>
  );
}
