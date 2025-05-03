import { useState } from 'react';
import { AlertCircle, Download } from 'lucide-react';

export default function PersonDownload() {
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [includeInactive, setIncludeInactive] = useState(false);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Person Download</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Info Message */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <AlertCircle className="text-blue-400 mr-2" size={20} />
            <p className="text-sm text-blue-700">
              Download a spreadsheet containing all people in your league.
            </p>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-medium text-gray-700 mb-2">Select Roles to Include</h2>
            <div className="space-y-2">
              {['Players', 'Administrators', 'Referees', 'Team Managers'].map((role) => (
                <label key={role} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRoles([...selectedRoles, role]);
                      } else {
                        setSelectedRoles(selectedRoles.filter(r => r !== role));
                      }
                    }}
                    className="rounded border-gray-300 text-[#00ade5] focus:ring-[#00ade5]"
                  />
                  <span className="text-sm text-gray-600">{role}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
                className="rounded border-gray-300 text-[#00ade5] focus:ring-[#00ade5]"
              />
              <span className="text-sm text-gray-600">Include inactive people</span>
            </label>
          </div>

          <button
            disabled={selectedRoles.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-[#00ade5] text-white rounded hover:bg-[#0099cc] disabled:bg-gray-300"
          >
            <Download size={16} />
            Download Spreadsheet
          </button>
        </div>
      </div>
    </div>
  );
}