import React, { useState } from 'react';

const PlayerSuspension = () => {
  const [options, setOptions] = useState({
    enableSystem: true,
    displayDivision: true,
    displayTeam: true,
    displayMatch: true
  });

  const handleOptionChange = (field) => {
    setOptions(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="border rounded-lg p-4 mb-6">
      <h2 className="text-xl font-medium text-gray-600 mb-4">Player suspension options</h2>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
          <div className="md:col-span-1 text-right text-gray-600 font-medium">
            Options:
          </div>
          <div className="md:col-span-3 space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.enableSystem}
                onChange={() => handleOptionChange('enableSystem')}
                className="rounded text-[#00ADE5] focus:ring-[#00ADE5] mr-2"
              />
              <span className="text-gray-700">Enable player suspension system</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.displayDivision}
                onChange={() => handleOptionChange('displayDivision')}
                className="rounded text-[#00ADE5] focus:ring-[#00ADE5] mr-2"
              />
              <span className="text-gray-700">Display on division home page</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.displayTeam}
                onChange={() => handleOptionChange('displayTeam')}
                className="rounded text-[#00ADE5] focus:ring-[#00ADE5] mr-2"
              />
              <span className="text-gray-700">Display on display team page</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.displayMatch}
                onChange={() => handleOptionChange('displayMatch')}
                className="rounded text-[#00ADE5] focus:ring-[#00ADE5] mr-2"
              />
              <span className="text-gray-700">Display on match page</span>
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
    </div>
  );
};

export default PlayerSuspension;