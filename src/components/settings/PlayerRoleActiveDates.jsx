import React, { useState } from 'react';

const PlayerRoleActiveDates = () => {
  const [activeFromOption, setActiveFromOption] = useState('doNotSetFrom');
  const [activeToOption, setActiveToOption] = useState('doNotSetTo');

  return (
    <div className="border rounded-lg p-4 mb-6">
      <h2 className="text-xl font-medium text-gray-600 mb-4">Player Role Active Dates</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 items-start">
        <div className="md:col-span-1 text-right text-gray-600 font-medium">
          Active from date:
        </div>
        <div className="md:col-span-3">
          <div className="flex flex-col space-y-2">
            <label className="flex items-start">
              <input 
                type="radio" 
                name="activeFromOption" 
                value="doNotSetFrom"
                className="mt-1 text-[#00ADE5] focus:ring-[#00ADE5] mr-2"
                checked={activeFromOption === 'doNotSetFrom'}
                onChange={() => setActiveFromOption('doNotSetFrom')} 
              />
              <span className="text-gray-700">Do not automatically set the date</span>
            </label>
            
            <label className="flex items-start">
              <input 
                type="radio" 
                name="activeFromOption" 
                value="setToSeasonStart"
                className="mt-1 text-[#00ADE5] focus:ring-[#00ADE5] mr-2"
                checked={activeFromOption === 'setToSeasonStart'}
                onChange={() => setActiveFromOption('setToSeasonStart')} 
              />
              <span className="text-gray-700">Automatically set to the date to the selected season start date</span>
            </label>
            
            <label className="flex items-start">
              <input 
                type="radio" 
                name="activeFromOption" 
                value="setToCurrentDate"
                className="mt-1 text-[#00ADE5] focus:ring-[#00ADE5] mr-2"
                checked={activeFromOption === 'setToCurrentDate'}
                onChange={() => setActiveFromOption('setToCurrentDate')} 
              />
              <span className="text-gray-700">Automatically set to the date to the current date</span>
            </label>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 items-start">
        <div className="md:col-span-1 text-right text-gray-600 font-medium">
          Active to date:
        </div>
        <div className="md:col-span-3">
          <div className="flex flex-col space-y-2">
            <label className="flex items-start">
              <input 
                type="radio" 
                name="activeToOption" 
                value="doNotSetTo"
                className="mt-1 text-[#00ADE5] focus:ring-[#00ADE5] mr-2"
                checked={activeToOption === 'doNotSetTo'}
                onChange={() => setActiveToOption('doNotSetTo')} 
              />
              <span className="text-gray-700">Do not automatically set the date</span>
            </label>
            
            <label className="flex items-start">
              <input 
                type="radio" 
                name="activeToOption" 
                value="setToSeasonEnd"
                className="mt-1 text-[#00ADE5] focus:ring-[#00ADE5] mr-2"
                checked={activeToOption === 'setToSeasonEnd'}
                onChange={() => setActiveToOption('setToSeasonEnd')} 
              />
              <span className="text-gray-700">Automatically set the date to the selected season end date</span>
            </label>
            
            <p className="text-sm text-gray-500 ml-6 mt-1">
              It is not recommended to close the "Active To Date" for each season except for in the case of youth leagues.
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex gap-2">
        <button 
          className="px-4 py-2 bg-[#00ADE5] text-white rounded hover:bg-[#009acb] transition"
          type="button"
        >
          Update
        </button>
        <button 
          className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition"
          type="button"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default PlayerRoleActiveDates;