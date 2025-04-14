export default function Terminology() {
  return (
    <div className="p-6">
      <h2 className="text-lg font-medium text-gray-800 mb-4">
        Terminology Settings
      </h2>

      <div className="bg-white rounded-lg shadow p-6">
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team Label
              </label>
              <input
                type="text"
                defaultValue="Team"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
              />
              <p className="mt-1 text-sm text-gray-500">Default: "Team"</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Player Label
              </label>
              <input
                type="text"
                defaultValue="Player"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
              />
              <p className="mt-1 text-sm text-gray-500">Default: "Player"</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Match Label
              </label>
              <input
                type="text"
                defaultValue="Match"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
              />
              <p className="mt-1 text-sm text-gray-500">Default: "Match"</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tournament Label
              </label>
              <input
                type="text"
                defaultValue="Tournament"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
              />
              <p className="mt-1 text-sm text-gray-500">
                Default: "Tournament"
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Division Label
              </label>
              <input
                type="text"
                defaultValue="Division"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
              />
              <p className="mt-1 text-sm text-gray-500">Default: "Division"</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Season Label
              </label>
              <input
                type="text"
                defaultValue="Season"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
              />
              <p className="mt-1 text-sm text-gray-500">Default: "Season"</p>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Changing terminology will affect how these terms appear
                  throughout the application. Make sure to review all sections
                  after making changes.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="px-4 py-2 bg-[#003366] text-white rounded hover:bg-[#003366]"
            >
              Save Changes
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Reset to Defaults
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
