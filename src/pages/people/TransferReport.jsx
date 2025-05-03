import { useState } from 'react';
import { AlertCircle, Download } from 'lucide-react';

export default function TransferReport() {
  const [dateRange, setDateRange] = useState('all');
  const [competition, setCompetition] = useState('all');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Transfer Report</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Info Message */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <AlertCircle className="text-blue-400 mr-2" size={20} />
            <p className="text-sm text-blue-700">
              View and export reports of all player transfers within your league.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full md:w-auto border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Time</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="season">This Season</option>
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

        {/* Export Button */}
        <button className="flex items-center gap-2 px-4 py-2 bg-[#00ade5] text-white rounded hover:bg-[#0099cc] mb-6">
          <Download size={16} />
          Export Report
        </button>

        {/* No Transfers Message */}
        <div className="bg-gray-50 text-center py-8 rounded-lg">
          <p className="text-gray-600">No transfers found for the selected criteria</p>
        </div>
      </div>
    </div>
  );
}