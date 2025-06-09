import { useState } from 'react';
import { AlertCircle } from 'lucide-react';

export default function AgeConflicts() {
  const [competition, setCompetition] = useState('all');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Age Conflicts</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Info Message */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <AlertCircle className="text-blue-400 mr-2" size={20} />
            <p className="text-sm text-blue-700">
              Review and resolve age-related conflicts for players in age-restricted competitions.
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Competition
          </label>
          <select
            value={competition}
            onChange={(e) => setCompetition(e.target.value)}
            className="w-full md:w-auto border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="all">All Competitions</option>
            <option value="u18">Under 18</option>
            <option value="u16">Under 16</option>
            <option value="u14">Under 14</option>
          </select>
        </div>

        {/* No Conflicts Message */}
        <div className="bg-gray-50 text-center py-8 rounded-lg">
          <p className="text-gray-600">No age conflicts found</p>
        </div>
      </div>
    </div>
  );
}