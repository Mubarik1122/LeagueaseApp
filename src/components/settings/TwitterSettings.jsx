import React, { useState } from 'react';
import Swal from 'sweetalert2'; // Import SweetAlert2 for success alerts

export default function TwitterSettings() {
  // State for the form inputs
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [accessTokenSecret, setAccessTokenSecret] = useState('');
  const [autoTweetMatchResults, setAutoTweetMatchResults] = useState(false);
  const [includeHashtags, setIncludeHashtags] = useState(false);
  const [tweetTournamentUpdates, setTweetTournamentUpdates] = useState(false);
  const [defaultHashtags, setDefaultHashtags] = useState('');

  // State for error messages
  const [errors, setErrors] = useState({
    apiKey: '',
    apiSecret: '',
    accessToken: '',
    accessTokenSecret: '',
  });

  // Form validation function
  const validateForm = () => {
    const newErrors = {};

    // Validate API Key
    if (!apiKey) {
      newErrors.apiKey = 'API Key is required.';
    }

    // Validate API Secret
    if (!apiSecret) {
      newErrors.apiSecret = 'API Secret is required.';
    }

    // Validate Access Token
    if (!accessToken) {
      newErrors.accessToken = 'Access Token is required.';
    }

    // Validate Access Token Secret
    if (!accessTokenSecret) {
      newErrors.accessTokenSecret = 'Access Token Secret is required.';
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
        apiKey,
        apiSecret,
        accessToken,
        accessTokenSecret,
        autoTweetMatchResults,
        includeHashtags,
        tweetTournamentUpdates,
        defaultHashtags,
      };
      console.log(settings); // Here you would save the settings (e.g., API call)

      // Show the success message using SweetAlert
      Swal.fire({
        title: 'Settings Saved!',
        text: 'Your Twitter settings have been saved successfully.',
        icon: 'success',
        confirmButtonText: 'OK',
        timer: 3000, // Auto-close after 3 seconds
      });

      // Reset the form after saving (reload the component state)
      setApiKey('');
      setApiSecret('');
      setAccessToken('');
      setAccessTokenSecret('');
      setAutoTweetMatchResults(false);
      setIncludeHashtags(false);
      setTweetTournamentUpdates(false);
      setDefaultHashtags('');
    }
  };

  // Input field style logic to dynamically add red or green border
  const getInputClassName = (fieldName) => {
    return `w-full px-3 py-2 border ${
      errors[fieldName] ? 'border-red-500' : 'border-gray-300'
    } rounded-md focus:outline-none focus:ring-2 ${
      errors[fieldName] ? 'focus:ring-red-500' : 'focus:ring-green-500'
    }`;
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-medium text-gray-800 mb-4">Twitter Integration Settings</h2>

      <div className="bg-white rounded-lg shadow p-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <input
              type="text"
              className={getInputClassName('apiKey')}
              placeholder="Enter Twitter API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            {errors.apiKey && (
              <p className="text-sm text-red-500 mt-1">{errors.apiKey}</p>
            )}
          </div>

          {/* API Secret */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Secret
            </label>
            <input
              type="password"
              className={getInputClassName('apiSecret')}
              placeholder="Enter Twitter API Secret"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
            />
            {errors.apiSecret && (
              <p className="text-sm text-red-500 mt-1">{errors.apiSecret}</p>
            )}
          </div>

          {/* Access Token */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Access Token
            </label>
            <input
              type="text"
              className={getInputClassName('accessToken')}
              placeholder="Enter Access Token"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
            />
            {errors.accessToken && (
              <p className="text-sm text-red-500 mt-1">{errors.accessToken}</p>
            )}
          </div>

          {/* Access Token Secret */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Access Token Secret
            </label>
            <input
              type="password"
              className={getInputClassName('accessTokenSecret')}
              placeholder="Enter Access Token Secret"
              value={accessTokenSecret}
              onChange={(e) => setAccessTokenSecret(e.target.value)}
            />
            {errors.accessTokenSecret && (
              <p className="text-sm text-red-500 mt-1">{errors.accessTokenSecret}</p>
            )}
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
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  checked={autoTweetMatchResults}
                  onChange={() => setAutoTweetMatchResults(!autoTweetMatchResults)}
                />
                <span className="text-sm text-gray-600">Auto-tweet match results</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  checked={includeHashtags}
                  onChange={() => setIncludeHashtags(!includeHashtags)}
                />
                <span className="text-sm text-gray-600">Include team hashtags</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  checked={tweetTournamentUpdates}
                  onChange={() => setTweetTournamentUpdates(!tweetTournamentUpdates)}
                />
                <span className="text-sm text-gray-600">Tweet tournament updates</span>
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
              className={getInputClassName('defaultHashtags')}
              placeholder="#sports #tournament"
              value={defaultHashtags}
              onChange={(e) => setDefaultHashtags(e.target.value)}
            />
            <p className="mt-1 text-sm text-gray-500">Separate hashtags with spaces</p>
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
                  Ensure your Twitter Developer Account is approved for elevated access.
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