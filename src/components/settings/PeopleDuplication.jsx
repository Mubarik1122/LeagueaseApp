import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

const PeopleDuplication = () => {
  const [enabled, setEnabled] = useState(true);
  const [criteria, setCriteria] = useState({
    lastName: true,
    firstName: true,
    dateOfBirth: false,
    zip: false,
  });

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.userId;

  // Fetch settings from backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/settings`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await res.json();

        if (result.errorCode === 0 && result.data) {
          setEnabled(result.data.peopleDuplicationEnabled ?? true);
          setCriteria({
            lastName: result.data.duplicationCriteria?.lastName ?? true,
            firstName: result.data.duplicationCriteria?.firstName ?? true,
            dateOfBirth: result.data.duplicationCriteria?.dateOfBirth ?? false,
            zip: result.data.duplicationCriteria?.zip ?? false,
          });
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      }
    };

    fetchSettings();
  }, []);

  const handleCriteriaChange = (field) => {
    setCriteria((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/settings/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tab: "PeopleDuplication",
          userId,
          data: {
            peopleDuplicationEnabled: enabled,
            duplicationCriteria: {
              lastName: criteria.lastName,
              firstName: criteria.firstName,
              dateOfBirth: criteria.dateOfBirth,
              zip: criteria.zip,
            },
          },
        }),
      });

      const result = await res.json();

      if (res.ok && result.errorCode === 0) {
        Swal.fire("Saved", "Settings saved successfully!", "success");
      } else {
        Swal.fire("Error", result.errorMessage || "Failed to save", "error");
      }
    } catch (err) {
      console.error("Save error:", err);
      Swal.fire("Error", "Network error", "error");
    }
  };

  return (
    <div className="border rounded-lg p-4 mb-6">
      <h2 className="text-xl font-medium text-gray-600 mb-4">
        People duplication and merge default criteria
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
            Do you want alerts to be raised whenever a duplicate person is
            created? Check below the criteria that you classify as a duplicate
            person. Note these values are also the default settings for the
            merge person page.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div className="md:col-span-1 text-right text-gray-600 font-medium">
            Options:
          </div>
          <div className="md:col-span-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={enabled}
                onChange={() => setEnabled(!enabled)}
                className="rounded text-[#00ADE5] focus:ring-[#00ADE5] mr-2"
              />
              <span className="text-gray-700">Enable</span>
            </label>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-gray-600 font-medium mb-4">
            At least one of the following must be checked
          </p>
          <div className="space-y-3 ml-8">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={criteria.lastName}
                onChange={() => handleCriteriaChange("lastName")}
                className="rounded text-[#00ADE5] focus:ring-[#00ADE5] mr-2"
              />
              <span className="text-gray-700">Last name</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={criteria.firstName}
                onChange={() => handleCriteriaChange("firstName")}
                className="rounded text-[#00ADE5] focus:ring-[#00ADE5] mr-2"
              />
              <span className="text-gray-700">First name</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={criteria.dateOfBirth}
                onChange={() => handleCriteriaChange("dateOfBirth")}
                className="rounded text-[#00ADE5] focus:ring-[#00ADE5] mr-2"
              />
              <span className="text-gray-700">Date of birth</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={criteria.zip}
                onChange={() => handleCriteriaChange("zip")}
                className="rounded text-[#00ADE5] focus:ring-[#00ADE5] mr-2"
              />
              <span className="text-gray-700">ZIP</span>
            </label>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#00ADE5] text-white rounded hover:bg-[#009acb] transition"
          >
            Update
          </button>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default PeopleDuplication;
