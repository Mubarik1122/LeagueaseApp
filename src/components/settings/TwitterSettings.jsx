import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function TwitterSettings() {
  const [formData, setFormData] = useState({
    apiKey: "",
    apiSecret: "",
    accessToken: "",
    accessTokenSecret: "",
    autoTweetMatchResults: false,
    includeHashtags: false,
    tweetTournamentUpdates: false,
    defaultHashtags: "",
  });

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

        if (result.errorCode === 0 && result.data?.twitterSettings) {
          setFormData({ ...formData, ...result.data.twitterSettings });
        } else {
          console.warn("Failed to fetch Twitter settings:", result.errorMessage);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://leagueaseappbackend-production.up.railway.app'}/settings/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tab: "TwitterSettings",
          userId,
          data: {
            twitterSettings: formData,
          },
        }),
      });

      const result = await response.json();

      if (response.ok && result.errorCode === 0) {
        Swal.fire({
          title: "Twitter Settings Saved!",
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
        Twitter Integration Settings
      </h2>

      <div className="bg-white rounded-lg shadow p-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <input
              type="text"
              name="apiKey"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter Twitter API Key"
              value={formData.apiKey}
              onChange={handleChange}
            />
          </div>

          {/* API Secret */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Secret
            </label>
            <input
              type="password"
              name="apiSecret"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter Twitter API Secret"
              value={formData.apiSecret}
              onChange={handleChange}
            />
          </div>

          {/* Access Token */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Access Token
            </label>
            <input
              type="text"
              name="accessToken"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter Access Token"
              value={formData.accessToken}
              onChange={handleChange}
            />
          </div>

          {/* Access Token Secret */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Access Token Secret
            </label>
            <input
              type="password"
              name="accessTokenSecret"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter Access Token Secret"
              value={formData.accessTokenSecret}
              onChange={handleChange}
            />
          </div>

          {/* Tweet Options */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Tweet Options
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="autoTweetMatchResults"
                  checked={formData.autoTweetMatchResults}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600"
                />
                <span className="text-sm text-gray-600">
                  Auto-tweet match results
                </span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="includeHashtags"
                  checked={formData.includeHashtags}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600"
                />
                <span className="text-sm text-gray-600">
                  Include team hashtags
                </span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="tweetTournamentUpdates"
                  checked={formData.tweetTournamentUpdates}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600"
                />
                <span className="text-sm text-gray-600">
                  Tweet tournament updates
                </span>
              </label>
            </div>
          </div>

          {/* Default Hashtags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Hashtags
            </label>
            <input
              type="text"
              name="defaultHashtags"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="#sports #tournament"
              value={formData.defaultHashtags}
              onChange={handleChange}
            />
            <p className="mt-1 text-sm text-gray-500">
              Separate hashtags with spaces
            </p>
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
                  Ensure your Twitter Developer Account is approved for elevated access.
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
                  apiKey: "",
                  apiSecret: "",
                  accessToken: "",
                  accessTokenSecret: "",
                  autoTweetMatchResults: false,
                  includeHashtags: false,
                  tweetTournamentUpdates: false,
                  defaultHashtags: "",
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
