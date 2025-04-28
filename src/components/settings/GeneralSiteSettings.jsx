import React, { useState } from 'react';
import moment from 'moment-timezone';
import Swal from 'sweetalert2';
import Select from 'react-select'; // ✅ React Select added

// Get time zones with UTC offset
const getTimeZones = () => {
  return moment.tz.names().map((zone) => {
    const offset = moment.tz(zone).format('Z');
    return { value: zone, label: `${zone} - UTC${offset}` };
  });
};

const GeneralSiteSettings = () => {
  const initialFormState = {
    siteName: '',
    siteDescription: '',
    contactEmail: '',
    timeZone: 'UTC',
    enableRegistration: false,
    enableProfiles: false,
    enableNotifications: false,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({
    siteName: '',
    contactEmail: '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleTimeZoneChange = (selectedOption) => {
    setFormData({
      ...formData,
      timeZone: selectedOption.value,
    });
  };

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Form submitted:', formData);
      setFormData(initialFormState);
      Swal.fire({
        title: 'Settings Saved!',
        text: 'Your settings have been saved successfully.',
        icon: 'success',
        confirmButtonText: 'Ok',
        timer: 3000,
      });
    }
  };

  const timeZoneOptions = getTimeZones();

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

          {/* Time Zone Dropdown with react-select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="time-zone">
              Time Zone
            </label>
            <Select
              id="time-zone"
              name="timeZone"
              options={timeZoneOptions}
              value={timeZoneOptions.find((opt) => opt.value === formData.timeZone)}
              onChange={handleTimeZoneChange}
              className="text-sm"
              classNamePrefix="react-select"
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: '#d1d5db',
                  boxShadow: 'none',
                  '&:hover': { borderColor: '#9ca3af' },
                }),
              }}
            />
          </div>

          {/* Site Features */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Site Features</label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="enableRegistration"
                  checked={formData.enableRegistration}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-gray-600">Enable user registration</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="enableProfiles"
                  checked={formData.enableProfiles}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-gray-600">Enable public profiles</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
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