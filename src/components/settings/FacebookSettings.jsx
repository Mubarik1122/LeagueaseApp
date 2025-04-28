import React, { useState } from 'react';
import Swal from 'sweetalert2'; // Import SweetAlert2 for success alerts

export default function FacebookSettings() {
  // State for the form inputs
  const [facebookAppId, setFacebookAppId] = useState('');
  const [facebookAppSecret, setFacebookAppSecret] = useState('');
  const [pageId, setPageId] = useState('');
  const [autoPostMatchResults, setAutoPostMatchResults] = useState(false);
  const [autoPostTournamentUpdates, setAutoPostTournamentUpdates] = useState(false);
  const [includeTeamStandings, setIncludeTeamStandings] = useState(false);

  // State for error messages
  const [errors, setErrors] = useState({
    facebookAppId: '',
    facebookAppSecret: '',
    pageId: '',
  });

  // Form validation function
  const validateForm = () => {
    const newErrors = {};

    // Validate Facebook App ID
    if (!facebookAppId) {
      newErrors.facebookAppId = 'Facebook App ID is required.';
    }

    // Validate Facebook App Secret
    if (!facebookAppSecret) {
      newErrors.facebookAppSecret = 'Facebook App Secret is required.';
    }

    // Validate Page ID
    if (!pageId) {
      newErrors.pageId = 'Page ID is required.';
    }

    // If there are any errors, return false, otherwise return true
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }

    // Clear previous errors if everything is valid
    setErrors({});
    return true;
  };

  // Form submission handler
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form before submitting
    if (validateForm()) {
      // You can process the form data here
      const settings = {
        facebookAppId,
        facebookAppSecret,
        pageId,
        autoPostMatchResults,
        autoPostTournamentUpdates,
        includeTeamStandings,
      };
      console.log(settings);
      // Save settings logic (e.g., API call, localStorage, etc.)

      // After saving, show the success message using SweetAlert
      Swal.fire({
        title: 'Facebook Settings Saved!',
        text: 'Your settings have been saved successfully.',
        icon: 'success',
        confirmButtonText: 'OK',
        timer: 3000, // Auto-close after 3 seconds
      });

      // Optionally reset the form after saving
      setFacebookAppId('');
      setFacebookAppSecret('');
      setPageId('');
      setAutoPostMatchResults(false);
      setAutoPostTournamentUpdates(false);
      setIncludeTeamStandings(false);
    }
  };

  // Input field style logic to add green outline when errors are fixed
  const getInputClassName = (fieldName) => {
    return `w-full px-3 py-2 border ${
      errors[fieldName] ? 'border-red-500' : 'border-gray-300'
    } rounded-md focus:outline-none focus:ring-2 ${
      errors[fieldName] ? 'focus:ring-red-500' : 'focus:ring-green-500'
    }`;
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-medium text-gray-800 mb-4">Facebook Integration Settings</h2>

      <div className="bg-white rounded-lg shadow p-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Facebook App ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facebook App ID
            </label>
            <input
              type="text"
              className={getInputClassName('facebookAppId')}
              placeholder="Enter Facebook App ID"
              value={facebookAppId}
              onChange={(e) => setFacebookAppId(e.target.value)}
            />
            {errors.facebookAppId && (
              <p className="text-sm text-red-500 mt-1">{errors.facebookAppId}</p>
            )}
          </div>

          {/* Facebook App Secret */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facebook App Secret
            </label>
            <input
              type="password"
              className={getInputClassName('facebookAppSecret')}
              placeholder="Enter Facebook App Secret"
              value={facebookAppSecret}
              onChange={(e) => setFacebookAppSecret(e.target.value)}
            />
            {errors.facebookAppSecret && (
              <p className="text-sm text-red-500 mt-1">{errors.facebookAppSecret}</p>
            )}
          </div>

          {/* Page ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page ID
            </label>
            <input
              type="text"
              className={getInputClassName('pageId')}
              placeholder="Enter Facebook Page ID"
              value={pageId}
              onChange={(e) => setPageId(e.target.value)}
            />
            {errors.pageId && (
              <p className="text-sm text-red-500 mt-1">{errors.pageId}</p>
            )}
          </div>

          {/* Posting Options */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Posting Options
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  checked={autoPostMatchResults}
                  onChange={() => setAutoPostMatchResults(!autoPostMatchResults)}
                />
                <span className="text-sm text-gray-600">Auto-post match results</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  checked={autoPostTournamentUpdates}
                  onChange={() => setAutoPostTournamentUpdates(!autoPostTournamentUpdates)}
                />
                <span className="text-sm text-gray-600">Auto-post tournament updates</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  checked={includeTeamStandings}
                  onChange={() => setIncludeTeamStandings(!includeTeamStandings)}
                />
                <span className="text-sm text-gray-600">Include team standings</span>
              </label>
            </div>
          </div>

          {/* Information Banner */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Make sure to configure your Facebook App settings in the Facebook Developers Console.
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
              Save Settings
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}