export default function Roles() {
  return (
    <div className="p-6">
      <h2 className="text-lg font-medium text-gray-800 mb-4">
        Role Management
      </h2>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-md font-medium text-gray-700 mb-2">
              Available Roles
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center justify-between">
                <span className="text-gray-600">League Administrator</span>
                <button className="text-blue-600 hover:text-blue-800">
                  Edit
                </button>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-gray-600">Team Manager</span>
                <button className="text-blue-600 hover:text-blue-800">
                  Edit
                </button>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-gray-600">Player</span>
                <button className="text-blue-600 hover:text-blue-800">
                  Edit
                </button>
              </li>
            </ul>
          </div>

          <div>
            <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              Add New Role
            </button>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-md font-medium text-gray-700 mb-2">
              Role Permissions
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="manageTeams"
                  className="rounded border-gray-300 text-[#00ADE5] focus:ring-[#00ADE5]"
                />
                <label htmlFor="manageTeams" className="text-sm text-gray-600">
                  Can manage teams
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="manageMatches"
                  className="rounded border-gray-300 text-[#00ADE5] focus:ring-[#00ADE5]"
                />
                <label
                  htmlFor="manageMatches"
                  className="text-sm text-gray-600"
                >
                  Can manage matches
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="viewReports"
                  className="rounded border-gray-300 text-[#00ADE5] focus:ring-[#00ADE5]"
                />
                <label htmlFor="viewReports" className="text-sm text-gray-600">
                  Can view reports
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button className="px-4 py-2 bg-[#003366] text-white rounded hover:bg-[#003366]">
              Save Changes
            </button>
            <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
