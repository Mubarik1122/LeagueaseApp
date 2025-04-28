import React, { useState } from 'react';
import Swal from 'sweetalert2'; // Import SweetAlert2

export default function Terminology() {
  // Define initial form state with default values
  const initialFormState = {
    teamLabel: 'Team',
    playerLabel: 'Player',
    matchLabel: 'Match',
    tournamentLabel: 'Tournament',
    divisionLabel: 'Division',
    seasonLabel: 'Season',
  };

  // State to store form data
  const [formData, setFormData] = useState(initialFormState);

  // State to store validation errors
  const [errors, setErrors] = useState({
    teamLabel: '',
    playerLabel: '',
    matchLabel: '',
    tournamentLabel: '',
    divisionLabel: '',
    seasonLabel: '',
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Validate the form
  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };

    // Check if any field is empty and show appropriate message
    Object.keys(formData).forEach((key) => {
      if (!formData[key]) {
        newErrors[key] = `${key.replace(/([A-Z])/g, ' $1').replace('Label', '')} field is required`;
        valid = false;
      } else {
        newErrors[key] = '';
      }
    });

    setErrors(newErrors);
    return valid;
  };

  // Handle form submission (Save Changes)
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Show success popup using SweetAlert2
      Swal.fire({
        title: 'Changes Saved!',
        text: 'Your terminology changes have been saved successfully.',
        icon: 'success',
        confirmButtonText: 'Ok',
        timer: 3000, // Optional: auto-close after 3 seconds
      });

      // After success, reset the form to initial state
      setFormData(initialFormState);
    }
  };

  // Reset form to default values
  const handleReset = () => {
    setFormData(initialFormState);
    setErrors({}); // Reset errors to hide the error messages
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-medium text-gray-800 mb-4">Terminology Settings</h2>
      
      <div className="bg-white rounded-lg shadow p-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Team Label */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Team Label</label>
              <input
                type="text"
                name="teamLabel"
                value={formData.teamLabel}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              {errors.teamLabel && <p className="mt-1 text-sm text-red-600">{errors.teamLabel}</p>}
              <p className="mt-1 text-sm text-gray-500">Default: "Team"</p>
            </div>

            {/* Player Label */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Player Label</label>
              <input
                type="text"
                name="playerLabel"
                value={formData.playerLabel}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              {errors.playerLabel && <p className="mt-1 text-sm text-red-600">{errors.playerLabel}</p>}
              <p className="mt-1 text-sm text-gray-500">Default: "Player"</p>
            </div>

            {/* Match Label */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Match Label</label>
              <input
                type="text"
                name="matchLabel"
                value={formData.matchLabel}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              {errors.matchLabel && <p className="mt-1 text-sm text-red-600">{errors.matchLabel}</p>}
              <p className="mt-1 text-sm text-gray-500">Default: "Match"</p>
            </div>

            {/* Tournament Label */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tournament Label</label>
              <input
                type="text"
                name="tournamentLabel"
                value={formData.tournamentLabel}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              {errors.tournamentLabel && <p className="mt-1 text-sm text-red-600">{errors.tournamentLabel}</p>}
              <p className="mt-1 text-sm text-gray-500">Default: "Tournament"</p>
            </div>

            {/* Division Label */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Division Label</label>
              <input
                type="text"
                name="divisionLabel"
                value={formData.divisionLabel}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              {errors.divisionLabel && <p className="mt-1 text-sm text-red-600">{errors.divisionLabel}</p>}
              <p className="mt-1 text-sm text-gray-500">Default: "Division"</p>
            </div>

            {/* Season Label */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Season Label</label>
              <input
                type="text"
                name="seasonLabel"
                value={formData.seasonLabel}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              {errors.seasonLabel && <p className="mt-1 text-sm text-red-600">{errors.seasonLabel}</p>}
              <p className="mt-1 text-sm text-gray-500">Default: "Season"</p>
            </div>
          </div>

          {/* Alert box */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Changing terminology will affect how these terms appear throughout the application.
                  Make sure to review all sections after making changes.
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Save Changes
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              onClick={handleReset} // Reset form to default values
            >
              Reset to Defaults
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
