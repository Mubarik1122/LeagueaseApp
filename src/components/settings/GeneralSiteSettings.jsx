import React, { useState } from 'react';
import moment from 'moment-timezone';
import Swal from 'sweetalert2'; // Import SweetAlert2

// Utility function to get time zones with their UTC offsets
const getTimeZones = () => {
  return moment.tz.names().map((zone) => {
    const offset = moment.tz(zone).format('Z');
    return { zone, offset };
  });
};

const GeneralSiteSettings = () => {
  // Initial form state
  const initialFormState = {
    siteName: '',
    siteDescription: '',
    contactEmail: '',
    timeZone: 'UTC',
    enableRegistration: false,
    enableProfiles: false,
    enableNotifications: false,
  };

  // State to store form data
  const [formData, setFormData] = useState(initialFormState);
  
  // State to store validation errors
  const [errors, setErrors] = useState({
    siteName: '',
    contactEmail: '',
  });

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Validate form fields
  const validateForm = () => {
    let valid = true;
    const newErrors = { siteName: '', contactEmail: '' };

    if (!formData.siteName) {
      newErrors.siteName = 'Site Name is required';
      valid = false;
    }

    if (!formData.contactEmail) {
      newErrors.contactEmail = 'Contact Email is required';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // Handle form submission (Save Settings)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Form submitted:', formData);
      // Simulate saving settings
      setFormData(initialFormState); // Reset to initial state after saving

      // Use SweetAlert2 to show the success message
      Swal.fire({
        title: 'Settings Saved!',
        text: 'Your settings have been saved successfully.',
        icon: 'success', // The icon for success
        confirmButtonText: 'Ok',
        timer: 3000, // Optional: auto-close after 3 seconds
      });
    }
  };

  const timeZones = getTimeZones();

  return (
    <div className="p-6">
      <h2 className="text-lg font-medium text-gray-800 mb-4">General Site Settings</h2>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Site Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="site-name">
              Site Name
            </label>
            <input
              type="text"
              id="site-name"
              name="siteName"
              value={formData.siteName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter site name"
            />
            {errors.siteName && <p className="text-sm text-red-600 mt-2">{errors.siteName}</p>}
          </div>

          {/* Site Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="site-description">
              Site Description
            </label>
            <textarea
              id="site-description"
              name="siteDescription"
              value={formData.siteDescription}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              rows="4"
              placeholder="Enter site description"
            />
          </div>

          {/* Contact Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="contact-email">
              Contact Email
            </label>
            <input
              type="email"
              id="contact-email"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter contact email"
            />
            {errors.contactEmail && <p className="text-sm text-red-600 mt-2">{errors.contactEmail}</p>}
          </div>

          {/* Time Zone Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="time-zone">
              Time Zone
            </label>
            <select
              id="time-zone"
              name="timeZone"
              value={formData.timeZone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {timeZones.map(({ zone, offset }) => (
                <option key={zone} value={zone}>
                  {zone} - {offset}
                </option>
              ))}
            </select>
          </div>

          {/* Site Features */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700" htmlFor="site-features">
              Site Features
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2" htmlFor="user-registration">
                <input
                  type="checkbox"
                  id="user-registration"
                  name="enableRegistration"
                  checked={formData.enableRegistration}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-gray-600">Enable user registration</span>
              </label>
              <label className="flex items-center space-x-2" htmlFor="public-profiles">
                <input
                  type="checkbox"
                  id="public-profiles"
                  name="enableProfiles"
                  checked={formData.enableProfiles}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-gray-600">Enable public profiles</span>
              </label>
              <label className="flex items-center space-x-2" htmlFor="notifications">
                <input
                  type="checkbox"
                  id="notifications"
                  name="enableNotifications"
                  checked={formData.enableNotifications}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-gray-600">Enable notifications</span>
              </label>
            </div>
          </div>

          {/* Buttons */}
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
              onClick={() => setFormData(initialFormState)} // Reset to initial state on cancel
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
