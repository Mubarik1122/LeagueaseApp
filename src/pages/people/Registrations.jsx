import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export default function Registrations() {
  const [activeTab, setActiveTab] = useState('campaigns');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Registrations</h1>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === 'campaigns'
                ? 'border-[#009ACB] text-[#009ACB]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Registration Campaigns
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === 'payments'
                ? 'border-[#009ACB] text-[#009ACB]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Payments Report
          </button>
          <button
            onClick={() => setActiveTab('stripe')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === 'stripe'
                ? 'border-[#009ACB] text-[#009ACB]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Stripe Settings
          </button>
        </nav>
      </div>

      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-800">Manage Registration Campaigns</h2>
            <button className="px-4 py-2 bg-[#009ACB] text-white rounded hover:bg-[#0088b3]">
              Create New Campaign
            </button>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-base font-medium text-blue-900 mb-4">
              What are registration campaigns?
            </h3>
            <div className="space-y-3 text-sm text-blue-800">
              <p>
                A registration campaign allows people to register themselves or their team for divisions and competitions in your league.
              </p>
              <p>
                Get people and money in to your league easily. All they have to do is click on a link on your league site and they will then be able to register online.
              </p>
              <p>
                They will then create a LeagueRepublic account or sign in, register themselves or their team.
              </p>
              <p>
                You can then easily accept or decline these registrations and add them to your league divisions and competitions.
              </p>
            </div>
          </div>

          {/* Payments Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="mt-1">
                <svg className="w-5 h-5 text-[#009ACB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-900">Collect Payments Online</h3>
                <p className="mt-1 text-sm text-gray-600">
                  If you connect your league with Stripe, our payment processing partner, you can allow people to register and pay via debit or credit card online in one easy step. The money goes directly in to your bank account, safely and securely.
                </p>
                <Link to="/stripe-setup" className="mt-2 inline-block text-sm text-[#009ACB] hover:underline">
                  Find out more about collecting payments online
                </Link>
              </div>
            </div>
          </div>

          {/* No Campaigns Message */}
          <div className="bg-gray-50 text-center py-12 rounded-lg">
            <p className="text-gray-600">No registration campaigns found</p>
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Payments Report</h2>
          <p className="text-gray-600">View and export payment reports for all registration campaigns.</p>
        </div>
      )}

      {activeTab === 'stripe' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Stripe Settings</h2>
          <p className="text-gray-600">Configure your Stripe integration for online payments.</p>
        </div>
      )}
    </div>
  );
}