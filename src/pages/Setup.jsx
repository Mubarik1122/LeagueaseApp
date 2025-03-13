import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';

// Import all settings components
import LeagueOptions from '../components/settings/LeagueOptions';
import Roles from '../components/settings/Roles';
import GeneralSiteSettings from '../components/settings/GeneralSiteSettings';
import FacebookSettings from '../components/settings/FacebookSettings';
import TwitterSettings from '../components/settings/TwitterSettings';
import Terminology from '../components/settings/Terminology';

const tabs = [
  { id: 'league', label: 'League Options', component: LeagueOptions },
  { id: 'roles', label: 'Roles', component: Roles },
  { id: 'general', label: 'General Site Settings', component: GeneralSiteSettings },
  { id: 'facebook', label: 'Facebook Settings', component: FacebookSettings },
  { id: 'twitter', label: 'Twitter Settings', component: TwitterSettings },
  { id: 'terminology', label: 'Terminology', component: Terminology }
];

export default function Setup() {
  const [activeTab, setActiveTab] = useState('league');
  const [isTabsOpen, setIsTabsOpen] = useState(false);
  const location = useLocation();

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || LeagueOptions;
  const activeTabLabel = tabs.find(tab => tab.id === activeTab)?.label;

  return (
    <div className="p-4 md:p-6">
      {/* Top Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-4 md:space-x-8">
          <Link
            to="/setup"
            className={clsx(
              'px-3 md:px-4 py-2 text-sm font-medium border-b-2 -mb-px',
              location.pathname === '/setup'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            SETTINGS
          </Link>
          <Link
            to="/setup/competitions"
            className={clsx(
              'px-3 md:px-4 py-2 text-sm font-medium border-b-2 -mb-px',
              location.pathname === '/setup/competitions'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            COMPETITIONS
          </Link>
        </nav>
      </div>

      <h1 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6">Settings</h1>
      
      <div className="bg-white rounded-lg shadow">
        {/* Mobile Tabs Dropdown */}
        <div className="md:hidden border-b border-gray-200 p-4">
          <button
            onClick={() => setIsTabsOpen(!isTabsOpen)}
            className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg"
          >
            <span className="text-sm font-medium text-gray-700">{activeTabLabel}</span>
            <ChevronDown className={clsx(
              "w-5 h-5 text-gray-500 transition-transform",
              isTabsOpen && "transform rotate-180"
            )} />
          </button>
          {isTabsOpen && (
            <div className="mt-2 py-2 bg-white rounded-lg shadow-lg border border-gray-200">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsTabsOpen(false);
                  }}
                  className={clsx(
                    'w-full text-left px-4 py-2 text-sm',
                    activeTab === tab.id
                      ? 'text-red-600 bg-red-50'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Tabs */}
        <div className="hidden md:block border-b border-gray-200">
          <div className="flex">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'px-6 py-3 text-sm font-medium',
                  activeTab === tab.id
                    ? 'border-b-2 border-red-500 text-red-600'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <ActiveComponent />
      </div>
    </div>
  );
}