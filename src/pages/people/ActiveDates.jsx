import { useState } from 'react';
import { AlertCircle } from 'lucide-react';

export default function ActiveDates() {
  const [filters, setFilters] = useState({
    role: 'Player',
    division: 'Division 1',
    team: 'G.O.T.C',
    fromDate: {
      day: '31',
      month: 'August',
      year: '2024'
    },
    toDate: {
      day: '31',
      month: 'December',
      year: '2024'
    },
    activeFrom: {
      day: '',
      month: '',
      year: ''
    },
    activeTo: {
      day: '',
      month: '',
      year: ''
    },
    dontModifyFrom: false,
    dontModifyTo: false
  });

  const [selectedPeople, setSelectedPeople] = useState([
    { id: 1, name: 'Abrar, Faiz', dateOfBirth: '', from: '', to: '' },
    { id: 2, name: 'Assaf, Muhammad', dateOfBirth: '', from: '', to: '' },
    { id: 3, name: 'Bey, Kamali', dateOfBirth: '', from: '', to: '' },
    { id: 4, name: 'Moghni, Aamir', dateOfBirth: '', from: '', to: '' },
    { id: 5, name: 'Nasseri, Armon', dateOfBirth: '', from: '', to: '' },
    { id: 6, name: 'Okunlawon, Ade', dateOfBirth: '', from: '', to: '' },
    { id: 7, name: 'Okunlawon, Dami', dateOfBirth: '', from: '', to: '' },
    { id: 8, name: 'Pinto, Xavier', dateOfBirth: '', from: 'Aug 30, 2023', to: '' },
    { id: 9, name: 'Siddiqui, Taha', dateOfBirth: '', from: 'Aug 30, 2023', to: '' },
    { id: 10, name: 'Siddiqui, Yahya', dateOfBirth: '', from: '', to: '' },
    { id: 11, name: 'Wadud, Rahy', dateOfBirth: '', from: '', to: '' }
  ]);

  const handleUpdate = () => {
    // Handle update logic
    console.log('Updating active dates...');
  };

  const handleCreate = () => {
    // Handle create logic
    console.log('Creating new records...');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Mass Change Active Dates For Roles of People</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Info Message */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <AlertCircle className="text-blue-400 mr-2" size={20} />
            <div className="text-sm text-blue-700">
              <p>This page will change / create multiple active from / to dates for the roles of a people.</p>
              <p>Select the filters to find the roles for people you wish to change. (Note this structure is for the selected season)</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role:</label>
            <select 
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option>Player</option>
              <option>Administrator</option>
              <option>Coach</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Division:</label>
            <select 
              value={filters.division}
              onChange={(e) => setFilters(prev => ({ ...prev, division: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option>Division 1</option>
              <option>Division 2</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team:</label>
            <select 
              value={filters.team}
              onChange={(e) => setFilters(prev => ({ ...prev, team: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option>G.O.T.C</option>
              <option>Other Team</option>
            </select>
          </div>
        </div>

        {/* Date Range Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From:</label>
            <div className="flex gap-2">
              <select 
                value={filters.fromDate.day}
                onChange={(e) => setFilters(prev => ({ ...prev, fromDate: { ...prev.fromDate, day: e.target.value }}))}
                className="w-20 border border-gray-300 rounded-md px-2 py-2"
              >
                {Array.from({ length: 31 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
              <select 
                value={filters.fromDate.month}
                onChange={(e) => setFilters(prev => ({ ...prev, fromDate: { ...prev.fromDate, month: e.target.value }}))}
                className="border border-gray-300 rounded-md px-2 py-2"
              >
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
              <select 
                value={filters.fromDate.year}
                onChange={(e) => setFilters(prev => ({ ...prev, fromDate: { ...prev.fromDate, year: e.target.value }}))}
                className="w-28 border border-gray-300 rounded-md px-2 py-2"
              >
                <option>2024</option>
                <option>2025</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To:</label>
            <div className="flex gap-2">
              <select 
                value={filters.toDate.day}
                onChange={(e) => setFilters(prev => ({ ...prev, toDate: { ...prev.toDate, day: e.target.value }}))}
                className="w-20 border border-gray-300 rounded-md px-2 py-2"
              >
                {Array.from({ length: 31 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
              <select 
                value={filters.toDate.month}
                onChange={(e) => setFilters(prev => ({ ...prev, toDate: { ...prev.toDate, month: e.target.value }}))}
                className="border border-gray-300 rounded-md px-2 py-2"
              >
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
              <select 
                value={filters.toDate.year}
                onChange={(e) => setFilters(prev => ({ ...prev, toDate: { ...prev.toDate, year: e.target.value }}))}
                className="w-28 border border-gray-300 rounded-md px-2 py-2"
              >
                <option>2024</option>
                <option>2025</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Active From:</label>
            <div className="flex items-center gap-2">
              <select className="w-20 border border-gray-300 rounded-md px-2 py-2">
                <option value="">Day</option>
                {Array.from({ length: 31 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
              <select className="border border-gray-300 rounded-md px-2 py-2">
                <option value="">Month</option>
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
              <select className="w-28 border border-gray-300 rounded-md px-2 py-2">
                <option value="">Year</option>
                <option>2024</option>
                <option>2025</option>
              </select>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.dontModifyFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dontModifyFrom: e.target.checked }))}
                  className="rounded border-gray-300 text-[#009ACB] focus:ring-[#009ACB]"
                />
                <span className="text-sm text-gray-600">When updating do not modify "from" dates</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Active To:</label>
            <div className="flex items-center gap-2">
              <select className="w-20 border border-gray-300 rounded-md px-2 py-2">
                <option value="">Day</option>
                {Array.from({ length: 31 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
              <select className="border border-gray-300 rounded-md px-2 py-2">
                <option value="">Month</option>
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
              <select className="w-28 border border-gray-300 rounded-md px-2 py-2">
                <option value="">Year</option>
                <option>2024</option>
                <option>2025</option>
              </select>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.dontModifyTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dontModifyTo: e.target.checked }))}
                  className="rounded border-gray-300 text-[#009ACB] focus:ring-[#009ACB]"
                />
                <span className="text-sm text-gray-600">When updating do not modify "to" dates</span>
              </label>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="space-y-2 text-sm text-blue-700">
            <p>On clicking "Update", the active dates for the selected people (checked) will be amended. If new dates have been applied that fall outside of the range of the "From" and "To" date filters then you will need to change these filters to see them.</p>
            <p>On clicking "Create", new player records will appear in addition to the existing ones (that are checked). If the dates applied fall outside of the range of the "From" and "To" date filters then you will need to change these filters to see the new player records.</p>
          </div>
        </div>

        {/* People Table */}
        <div className="overflow-x-auto">
          <div className="mb-2">
            <span className="text-sm text-gray-600">Number in list: {selectedPeople.length}</span>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-12 px-6 py-3">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-[#009ACB] focus:ring-[#009ACB]"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of birth</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {selectedPeople.map((person) => (
                <tr key={person.id}>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-[#009ACB] focus:ring-[#009ACB]"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{person.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{person.dateOfBirth}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{person.from}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{person.to}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-[#009ACB] hover:text-[#007da8]">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={handleUpdate}
            className="px-4 py-2 bg-[#009ACB] text-white rounded hover:bg-[#007da8]"
          >
            Update
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-[#009ACB] text-white rounded hover:bg-[#007da8]"
          >
            Create
          </button>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}