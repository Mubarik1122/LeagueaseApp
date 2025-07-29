import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function FacebookSettings() {
  const [formData, setFormData] = useState({
    facebookAppId: "",
    facebookAppSecret: "",
    pageId: "",
    autoPostMatchResults: false,
    autoPostTournamentUpdates: false,
    includeTeamStandings: false,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || 'https://leagueaseappbackend-production.up.railway.app'}/settings`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const result = await response.json();

        if (result.errorCode === 0 && result.data?.facebookSettings) {
          setFormData({ ...formData, ...result.data.facebookSettings });
        } else {
          console.warn("Failed to fetch Facebook settings:", result.errorMessage);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.userId;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'https://leagueaseappbackend-production.up.railway.app'}/settings/save`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            tab: "FacebookSettings",
            userId,
            data: {
              facebookSettings: formData,
            },
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.errorCode === 0) {
        Swal.fire({
          title: "Facebook Settings Saved!",
          text: "Your settings have been saved successfully.",
          icon: "success",
          confirmButtonText: "OK",
          timer: 3000,
        });
      } else {
        Swal.fire("Failed", result.errorMessage || "Save failed.", "error");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      Swal.fire("Error", "Network error while saving.", "error");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-medium text-gray-800 mb-4">
        Facebook Integration Settings
      </h2>

      <div className="bg-white rounded-lg shadow p-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Facebook App ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facebook App ID
            </label>
            <input
              type="text"
              name="facebookAppId"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter Facebook App ID"
              value={formData.facebookAppId}
              onChange={handleChange}
            />
          </div>

          {/* Facebook App Secret */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facebook App Secret
            </label>
            <input
              type="password"
              name="facebookAppSecret"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter Facebook App Secret"
              value={formData.facebookAppSecret}
              onChange={handleChange}
            />
          </div>

          {/* Page ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page ID
            </label>
            <input
              type="text"
              name="pageId"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter Facebook Page ID"
              value={formData.pageId}
              onChange={handleChange}
            />
          </div>

          {/* Checkboxes */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Posting Options
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="autoPostMatchResults"
                checked={formData.autoPostMatchResults}
                onChange={handleChange}
                className="rounded border-gray-300 text-blue-600"
              />
              <span className="text-sm text-gray-600">
                Auto-post match results
              </span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="autoPostTournamentUpdates"
                checked={formData.autoPostTournamentUpdates}
                onChange={handleChange}
                className="rounded border-gray-300 text-blue-600"
              />
              <span className="text-sm text-gray-600">
                Auto-post tournament updates
              </span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="includeTeamStandings"
                checked={formData.includeTeamStandings}
                onChange={handleChange}
                className="rounded border-gray-300 text-blue-600"
              />
              <span className="text-sm text-gray-600">
                Include team standings
              </span>
            </label>
          </div>

          {/* Info Alert */}
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  Make sure to configure your Facebook App settings in the
                  Facebook Developers Console.
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
              Save Settings
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              onClick={() =>
                setFormData({
                  facebookAppId: "",
                  facebookAppSecret: "",
                  pageId: "",
                  autoPostMatchResults: false,
                  autoPostTournamentUpdates: false,
                  includeTeamStandings: false,
                })
              }
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
