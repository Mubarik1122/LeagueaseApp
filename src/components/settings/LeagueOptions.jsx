import { useState } from 'react';
import { Menu } from 'lucide-react';
import clsx from 'clsx';

const sideMenuItems = [
  { id: 'team-admin', label: 'Team Admin Results and matches options', active: true },
  { id: 'approval', label: 'Approval and Locking' },
  { id: 'match-officials', label: 'Match officials and marks' },
  { id: 'player-role', label: 'Player Role Active Dates' },
  { id: 'people-duplication', label: 'People duplication and merge default criteria' },
  { id: 'player-suspension', label: 'Player suspension options' },
  { id: 'venues', label: 'Venues' },
  { id: 'match-file', label: 'Match File Upload' }
];

export default function LeagueOptions() {
  const [activeMenuItem, setActiveMenuItem] = useState('team-admin');
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    blockTeamAdmins: false,
    allowStatsEntry: false,
    allowDivisionMatches: false,
    homeTeamOptions: {
      changeDate: false,
      changeTime: false,
      changeStatus: false,
      changeVenue: false
    },
    awayTeamOptions: {
      changeDate: false,
      changeTime: false,
      changeStatus: false,
      changeVenue: false
    }
  });

  const handleCheckboxChange = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleTeamOptionChange = (team, option) => {
    setFormData(prev => ({
      ...prev,
      [`${team}Options`]: {
        ...prev[`${team}Options`],
        [option]: !prev[`${team}Options`][option]
      }
    }));
  };

  return (
    <div className="flex flex-col md:flex-row">
      {/* Mobile Menu Button */}
      <div className="md:hidden p-4 border-b border-gray-200">
        <button
          onClick={() => setIsSideMenuOpen(!isSideMenuOpen)}
          className="flex items-center space-x-2 text-gray-600"
        >
          <Menu size={20} />
          <span>Menu</span>
        </button>
      </div>

      {/* Side Menu */}
      <div className={clsx(
        'md:w-64 md:border-r md:border-gray-200 bg-white',
        'transition-all duration-300 ease-in-out',
        isSideMenuOpen ? 'block' : 'hidden md:block'
      )}>
        <div className="p-4 space-y-1">
          {sideMenuItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveMenuItem(item.id);
                setIsSideMenuOpen(false);
              }}
              className={clsx(
                'w-full text-left px-4 py-2 rounded-lg text-sm',
                activeMenuItem === item.id
                  ? 'bg-gray-100 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">
          Team Admin Results and matches options
        </h2>

        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Options:</h3>
            <div className="space-y-3">
              <label className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  checked={formData.blockTeamAdmins}
                  onChange={() => handleCheckboxChange('blockTeamAdmins')}
                  className="mt-1 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-gray-600">
                  Block Team Administrators from changing the match status of a match?
                </span>
              </label>

              <label className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  checked={formData.allowStatsEntry}
                  onChange={() => handleCheckboxChange('allowStatsEntry')}
                  className="mt-1 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-gray-600">
                  Allow Team Administrators to enter stats for opposition team
                </span>
              </label>

              <label className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  checked={formData.allowDivisionMatches}
                  onChange={() => handleCheckboxChange('allowDivisionMatches')}
                  className="mt-1 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-gray-600">
                  Allow Team Administrators to create division matches
                </span>
              </label>
            </div>
          </div>

          <div className="mt-8 overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-sm font-medium text-gray-500">Team Admin Options:</th>
                  <th className="text-center py-2 text-sm font-medium text-gray-500">When Home Team</th>
                  <th className="text-center py-2 text-sm font-medium text-gray-500">When Away Team</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: 'changeDate', label: 'Change match date' },
                  { id: 'changeTime', label: 'Change match time' },
                  { id: 'changeStatus', label: 'Change match date status' },
                  { id: 'changeVenue', label: 'Change match venue' }
                ].map(option => (
                  <tr key={option.id} className="border-b border-gray-100">
                    <td className="py-2 text-sm text-gray-600">{option.label}</td>
                    <td className="text-center">
                      <input
                        type="checkbox"
                        checked={formData.homeTeamOptions[option.id]}
                        onChange={() => handleTeamOptionChange('homeTeam', option.id)}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                    </td>
                    <td className="text-center">
                      <input
                        type="checkbox"
                        checked={formData.awayTeamOptions[option.id]}
                        onChange={() => handleTeamOptionChange('awayTeam', option.id)}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap gap-4 mt-8">
            <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
              Update
            </button>
            <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}