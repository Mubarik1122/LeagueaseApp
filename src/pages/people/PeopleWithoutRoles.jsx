import { useState } from 'react';
import { AlertCircle, Trash2 } from 'lucide-react';

export default function PeopleWithoutRoles() {
  const [selectedPeople, setSelectedPeople] = useState([]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">People Without Roles</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Info Message */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <AlertCircle className="text-blue-400 mr-2" size={20} />
            <p className="text-sm text-blue-700">
              View and manage people who don't have any active roles in your league.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-6">
          <button
            disabled={selectedPeople.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-300"
          >
            <Trash2 size={16} />
            Remove Selected
          </button>
        </div>

        {/* No People Message */}
        <div className="bg-gray-50 text-center py-8 rounded-lg">
          <p className="text-gray-600">No people without roles found</p>
        </div>
      </div>
    </div>
  );
}