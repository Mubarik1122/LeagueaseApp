import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function Terminology() {
  const initialFormState = {
    teamLabel: "",
    playerLabel: "",
    matchLabel: "",
    tournamentLabel: "",
    divisionLabel: "",
    seasonLabel: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    const fetchSettings = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://leagueaseappbackend-production.up.railway.app'}/settings`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (result.errorCode === 0 && result.data?.terminologySettings) {
          setFormData((prev) => ({
            ...prev,
            ...result.data.terminologySettings,
          }));
        }
      } catch (error) {
        console.error("Failed to load terminology settings", error);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.userId;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://leagueaseappbackend-production.up.railway.app'}/settings/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tab: "TerminologySettings",
          userId,
          data: {
            terminologySettings: formData,
          },
        }),
      });

      const result = await response.json();

      if (result.errorCode === 0) {
        Swal.fire({
          title: "Changes Saved!",
          text: "Your terminology settings have been saved.",
          icon: "success",
          timer: 3000,
        });
      } else {
        Swal.fire("Error", result.errorMessage || "Save failed.", "error");
      }
    } catch (err) {
      console.error("Error saving terminology settings:", err);
      Swal.fire("Error", "Network error occurred while saving.", "error");
    }
  };

  const handleReset = () => {
    setFormData(initialFormState);
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-medium text-gray-800 mb-4">
        Terminology Settings
      </h2>

      <div className="bg-white rounded-lg shadow p-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(formData).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {key.replace("Label", " Label").replace(/([A-Z])/g, " $1").trim()}
                </label>
                <input
                  type="text"
                  name={key}
                  value={value}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Default: "{key.replace("Label", "")}"
                </p>
              </div>
            ))}
          </div>

          {/* Alert Info */}
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
                  Changing terminology will affect how these terms appear across the application.
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              className="px-4 py-2 bg-[#003366] text-white rounded hover:bg-[#002244]"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={handleReset}
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
