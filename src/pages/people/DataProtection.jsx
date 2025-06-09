import { useState } from "react";
import { AlertCircle, Download } from "lucide-react";

export default function DataProtection() {
  const [selectedPerson, setSelectedPerson] = useState("");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Data Protection
      </h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Info Message */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <AlertCircle className="text-blue-400 mr-2" size={20} />
            <p className="text-sm text-blue-700">
              Download personal data for GDPR compliance or remove inactive
              people from the system.
            </p>
          </div>
        </div>

        {/* Data Export Section */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-800 mb-4">
            Export Personal Data
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Person
              </label>
              <select
                value={selectedPerson}
                onChange={(e) => setSelectedPerson(e.target.value)}
                className="w-full md:w-auto border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Select a person...</option>
                <option value="1">John Doe</option>
                <option value="2">Jane Smith</option>
              </select>
            </div>

            <button
              disabled={!selectedPerson}
              className="flex items-center gap-2 px-4 py-2 bg-[#00ade5] text-white rounded hover:bg-[#0099cc] disabled:bg-gray-300"
            >
              <Download size={16} />
              Export Data
            </button>
          </div>
        </div>

        {/* Data Removal Section */}
        <div>
          <h2 className="text-lg font-medium text-gray-800 mb-4">
            Remove Inactive People
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            This will permanently remove people who have been inactive for more
            than 24 months.
          </p>
          <button className="px-4 py-2 bg-[#009ACB] text-white rounded hover:bg-[#0088b3]">
            Remove Inactive People
          </button>
        </div>
      </div>
    </div>
  );
}
