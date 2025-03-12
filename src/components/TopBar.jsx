import { Search, ChevronDown } from 'lucide-react';

export default function TopBar() {
  return (
    <div className="bg-white border-b border-gray-200 h-16 fixed top-0 right-0 left-0 z-30 lg:left-64">
      <div className="h-full px-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Admin Home</h2>

        <div className="flex items-center gap-6">
          <div className="relative">
            <label className="text-sm text-gray-600 mr-2">Season</label>
            <select className="appearance-none bg-white border border-gray-300 rounded px-3 py-1 pr-8 focus:outline-none focus:border-red-500">
              <option>2024-2025</option>
              <option>2023-2024</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search competitions..."
              className="pl-10 pr-4 py-2 w-64 rounded-lg border border-gray-300 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}