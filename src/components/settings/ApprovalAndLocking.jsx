import React from 'react';

const ApprovalAndLocking = ({ formData, setFormData }) => {
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Approval and Locking Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.requireApproval || false}
                onChange={(e) => handleInputChange('requireApproval', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700">Require approval for new registrations</span>
            </label>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.lockResults || false}
                onChange={(e) => handleInputChange('lockResults', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700">Lock match results after submission</span>
            </label>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.autoApprove || false}
                onChange={(e) => handleInputChange('autoApprove', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700">Auto-approve returning players</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Approval notification email
            </label>
            <input
              type="email"
              value={formData.approvalEmail || ''}
              onChange={(e) => handleInputChange('approvalEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lock results after (hours)
            </label>
            <input
              type="number"
              value={formData.lockResultsAfter || 24}
              onChange={(e) => handleInputChange('lockResultsAfter', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              min="1"
              max="168"
            />
            <p className="mt-1 text-sm text-gray-500">Results will be automatically locked after this many hours</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalAndLocking;