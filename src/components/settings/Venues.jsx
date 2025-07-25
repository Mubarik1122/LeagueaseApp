import React, { useState } from "react";

const Venues = () => {
  const [disableVenues, setDisableVenues] = useState(true);

  return (
    <div className="border rounded-lg p-4 mb-6">
      <h2 className="text-xl font-medium text-gray-600 mb-4">Venues</h2>

      <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
        <div className="flex items-start">
          <div className="text-red-500 mr-2 mt-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </div>
          <p className="text-sm text-gray-700">
            If you disable venues then you don't need to set up a venue for each
            team and they won't be required for matches. Venues won't be seen on
            the public pages or in the admin system. The advanced scheduler and
            conflict checker won't be available as these programs require the
            use of venues.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div className="md:col-span-1 text-right text-gray-600 font-medium">
          Options:
        </div>
        <div className="md:col-span-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={disableVenues}
              onChange={() => setDisableVenues(!disableVenues)}
              className="rounded text-[#00ADE5] focus:ring-[#00ADE5] mr-2"
            />
            <span className="text-gray-700">Disable Venues</span>
          </label>
        </div>
      </div>

      <div className="flex gap-2 mt-6">
        <button className="px-4 py-2 bg-[#00ADE5] text-white rounded hover:bg-[#009acb] transition">
          Update
        </button>
        <button className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition">
          Back
        </button>
      </div>
    </div>
  );
};

export default Venues;
