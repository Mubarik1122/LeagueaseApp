import React, { useState, useEffect } from "react";
import moment from "moment-timezone";
import Swal from "sweetalert2";
import Select from "react-select";

// Get time zones with UTC offset
const getTimeZones = () => {
  return moment.tz.names().map((zone) => {
    const offset = moment.tz(zone).format("Z");
    return { value: zone, label: `${zone} - UTC${offset}` };
  });
};

const GeneralSiteSettings = () => {
  const initialFormState = {
    siteName: "",
    siteDescription: "",
    contactEmail: "",
    timeZone: "UTC",
    enableRegistration: false,
    enableProfiles: false,
    enableNotifications: false,
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    const fetchSettings = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/settings`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (result.errorCode === 0 && result.data.generalSettings) {
          setFormData((prev) => ({
            ...prev,
            ...result.data.generalSettings,
          }));
        } else {
          console.warn("Failed to fetch settings:", result.errorMessage);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleTimeZoneChange = (selectedOption) => {
    setFormData({
      ...formData,
      timeZone: selectedOption?.value || "UTC",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.userId;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/settings/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tab: "GeneralSiteSettings",
          userId,
          data: {
            generalSettings: formData, // ✅ wrap in generalSettings
          },
        }),
      });

      const result = await response.json();

      if (response.ok && result.errorCode === 0) {
        Swal.fire({
          title: "Settings Saved!",
          text: "Your settings have been saved successfully.",
          icon: "success",
          confirmButtonText: "Ok",
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

  const timeZoneOptions = getTimeZones();

  return (
    <div className="p-6">
      <h2 className="text-lg font-medium text-gray-800 mb-4">
        General Site Settings
      </h2>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Site Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Name
            </label>
            <input
              type="text"
              name="siteName"
              value={formData.siteName || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter site name"
            />
          </div>

          {/* Site Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Description
            </label>
            <textarea
              name="siteDescription"
              value={formData.siteDescription || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows="4"
              placeholder="Enter site description"
            />
          </div>

          {/* Contact Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Email
            </label>
            <input
              type="email"
              name="contactEmail"
              value={formData.contactEmail || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter contact email"
            />
          </div>

          {/* Time Zone Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Zone
            </label>
            <Select
              name="timeZone"
              options={timeZoneOptions}
              value={timeZoneOptions.find(
                (opt) => opt.value === formData.timeZone
              )}
              onChange={handleTimeZoneChange}
              className="text-sm"
              classNamePrefix="react-select"
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: "#d1d5db",
                  boxShadow: "none",
                  "&:hover": { borderColor: "#9ca3af" },
                }),
              }}
            />
          </div>

          {/* Feature Toggles */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Site Features
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="enableRegistration"
                  checked={formData.enableRegistration || false}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600"
                />
                <span className="text-sm text-gray-600">Enable user registration</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="enableProfiles"
                  checked={formData.enableProfiles || false}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600"
                />
                <span className="text-sm text-gray-600">Enable public profiles</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="enableNotifications"
                  checked={formData.enableNotifications || false}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600"
                />
                <span className="text-sm text-gray-600">Enable notifications</span>
              </label>
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
              onClick={() => setFormData(initialFormState)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GeneralSiteSettings;
