import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";

export default function ResultSummary() {
  const [selectedCompetition, setSelectedCompetition] = useState("All");
  const [dateFilter, setDateFilter] = useState("last14");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Result summary by date
      </h1>

      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <select
            value={selectedCompetition}
            onChange={(e) => setSelectedCompetition(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="All">Competition: All</option>
            <option value="div1">Division 1</option>
            <option value="div2">Division 2</option>
          </select>

          <div className="flex gap-2">
            <button
              onClick={() => setDateFilter("last14")}
              className={`px-4 py-2 rounded ${
                dateFilter === "last14"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              LAST 14 DAYS ONWARDS
            </button>
            <button
              onClick={() => setDateFilter("all")}
              className={`px-4 py-2 rounded ${
                dateFilter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              ALL DATES
            </button>
          </div>
        </div>

        {/* Info Message */}
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <AlertCircle className="text-red-400 mr-2" size={20} />
            <p className="text-sm text-red-700">
              Approve the result of a match to make the result and stats appear
              on the public pages. Lock stats to prevent them from being changed
              by administrators.
            </p>
          </div>
        </div>

        {/* No Results Message */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <p className="text-sm text-yellow-700">
            There are no matches to display for your current filter choice
          </p>
        </div>

        {/* Back Button */}
        <div>
          <Link
            to="/results"
            className="inline-block px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
          >
            Back
          </Link>
        </div>
      </div>
    </div>
  );
}
