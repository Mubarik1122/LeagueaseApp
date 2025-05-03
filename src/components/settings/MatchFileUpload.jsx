import React, { useState } from "react";

const MatchFileUpload = () => {
  const [options, setOptions] = useState({
    allowTeamAdmins: false,
    allowReferees: false,
  });

  const handleOptionChange = (field) => {
    setOptions((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <div className="border rounded-lg p-4 mb-6">
      <h2 className="text-xl font-medium text-gray-600 mb-4">
        Match File Upload
      </h2>

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
            Here you can control who has the ability to upload files when
            entering results, this might be a word document, .pdf, or image that
            is associated with a match, e.g. a photograph of a match sheet.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
        <div className="md:col-span-1 text-right text-gray-600 font-medium">
          Options:
        </div>
        <div className="md:col-span-3 space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={options.allowTeamAdmins}
              onChange={() => handleOptionChange("allowTeamAdmins")}
              className="rounded text-[#00ADE5] focus:ring-[#00ADE5] mr-2"
            />
            <span className="text-gray-700">
              Allow Team Administrators to upload match files
            </span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={options.allowReferees}
              onChange={() => handleOptionChange("allowReferees")}
              className="rounded text-[#00ADE5] focus:ring-[#00ADE5] mr-2"
            />
            <span className="text-gray-700">
              Allow Referees to upload match files
            </span>
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

export default MatchFileUpload;
