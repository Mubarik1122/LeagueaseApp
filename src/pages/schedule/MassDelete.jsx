import { AlertCircle } from "lucide-react";

export default function MassDelete() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Warning Message */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <AlertCircle className="text-yellow-400 mr-2" size={20} />
            <p className="text-sm text-yellow-700">
              Warning: This will permanently delete matches. This action cannot
              be undone.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Competition
            </label>
            <select className="w-full md:w-auto border border-gray-300 rounded-md px-3 py-2">
              <option>All</option>
              <option>Division 1</option>
              <option>Division 2</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <div className="flex flex-wrap gap-4">
              <input
                type="date"
                className="border border-gray-300 rounded-md px-3 py-2"
              />
              <span className="self-center">to</span>
              <input
                type="date"
                className="border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Match Status
            </label>
            <select className="w-full md:w-auto border border-gray-300 rounded-md px-3 py-2">
              <option>All Matches</option>
              <option>Unplayed Matches Only</option>
              <option>Played Matches Only</option>
            </select>
          </div>

          <button className="px-4 py-2 bg-[#003366] text-white rounded hover:bg-[#003366]0">
            Delete Matches
          </button>
        </div>
    </div>
  );
}
