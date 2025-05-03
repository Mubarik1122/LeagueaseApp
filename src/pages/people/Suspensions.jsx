import { useState } from 'react';
import { AlertCircle } from 'lucide-react';

export default function Suspensions() {
  const [status, setStatus] = useState('active');
  const [competition, setCompetition] = useState('all');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Suspensions</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Info Message */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <AlertCircle className="text-blue-400 mr-2" size={20} />
            <p className="text-sm text-blue-700">
              Manage player suspensions and view suspension history.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full md:w-auto border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Competition
            </label>
            <select
              value={competition}
              onChange={(e) => setCompetition(e.target.value)}
              className="w-full md:w-auto border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Competitions</option>
              <option value="div1">Division 1</option>
              <option value="div2">Division 2</option>
            </select>
          </div>
        </div>

        {/* Create New Button */}
        <button className="px-4 py-2 bg-[#00ade5] text-white rounded hover:bg-[#0099cc] mb-6">
          Create New Suspension
        </button>

        {/* No Suspensions Message */}
        <div className="bg-gray-50 text-center py-8 rounded-lg">
          <p className="text-gray-600">No suspensions found</p>
        </div>
      </div>
    </div>
  );
}