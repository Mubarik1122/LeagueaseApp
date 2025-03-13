export default function GeneralSiteSettings() {
  return (
    <div className="p-6">
      <h2 className="text-lg font-medium text-gray-800 mb-4">General Site Settings</h2>
      
      <div className="bg-white rounded-lg shadow p-6">
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter site name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Description
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              rows="4"
              placeholder="Enter site description"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Email
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter contact email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Zone
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
              <option>UTC</option>
              <option>EST</option>
              <option>PST</option>
              <option>GMT</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Site Features
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-gray-600">Enable user registration</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-gray-600">Enable public profiles</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-gray-600">Enable notifications</span>
              </label>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Save Settings
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}