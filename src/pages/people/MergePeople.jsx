import { useState } from 'react';
import { AlertCircle, Search } from 'lucide-react';

export default function MergePeople() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Merge People</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Info Message */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <AlertCircle className="text-blue-400 mr-2" size={20} />
            <p className="text-sm text-blue-700">
              Merge duplicate person records to maintain accurate data.
            </p>
          </div>
        </div>

        {/* Search Section */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for people to merge..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00ade5]"
            />
          </div>
        </div>

        {/* No Results Message */}
        <div className="bg-gray-50 text-center py-8 rounded-lg">
          <p className="text-gray-600">No potential duplicates found</p>
        </div>
      </div>
    </div>
  );
}