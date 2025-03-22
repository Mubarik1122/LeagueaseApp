import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Select from 'react-select';
import { RefreshCw } from 'lucide-react';
import clsx from 'clsx';
import Swal from 'sweetalert2';

const tabs = [
  { id: 'list', label: 'List by Role', active: true },
  { id: 'search', label: 'Search' }
];

const mockPeople = [
  {
    name: 'Akbar, Mubarik',
    role: '4sov tournament: League Administrator',
    email: 'hehapi1436@evasud.com',
    dateOfBirth: '',
    hasLogin: true,
    lastLoggedIn: 'Wed 12 Mar 2025 07:48 PM',
    verifiedEmail: true
  }
];

export default function People() {
  const [activeTab, setActiveTab] = useState('list');
  const [filters, setFilters] = useState({
    status: 'Active',
    role: null,
    season: '2024-2025',
    division: null,
    team: null,
    fromDate: { day: '26', month: 'October', year: '2024' },
    toDate: { day: '10', month: 'December', year: '2024' }
  });

  const [roles, setRoles] = useState([]);
  const [teams, setTeams] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [months, setMonths] = useState([]);
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Fetch roles, teams, divisions from API
    Promise.all([
      fetch('/api/roles').then((res) => res.json()),
      fetch('/api/teams').then((res) => res.json()),
      fetch('/api/divisions').then((res) => res.json())
    ])
      .then(([rolesData, teamsData, divisionsData]) => {
        setRoles(rolesData);
        setTeams(teamsData);
        setDivisions(divisionsData);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleRefresh = () => {
    setFilters({
      status: 'Active',
      role: roles[0] || null,
      season: '2024-2025',
      division: divisions[0] || null,
      team: teams[0] || null,
      fromDate: { day: '26', month: 'October', year: '2024' },
      toDate: { day: '10', month: 'December', year: '2024' }
    });
  };

  const handleCreateNew = () => {
    Swal.fire({
      title: 'Success!',
      text: 'New person created successfully!',
      icon: 'success',
      confirmButtonText: 'OK'
    });
  };

  const validateFilters = () => {
    if (
      !filters.role ||
      !filters.division ||
      !filters.team ||
      !filters.fromDate.day ||
      !filters.fromDate.month ||
      !filters.fromDate.year ||
      !filters.toDate.day ||
      !filters.toDate.month ||
      !filters.toDate.year
    ) {
      Swal.fire({
        title: 'Error!',
        text: 'Please fill out all required fields.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return false;
    }
    return true;
  };

  if (loading) {
    return <div>Loading...</div>; // Loading state while the data is being fetched
  }

  // Static data for days, months, and years
  const staticDays = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  const staticMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const staticYears = ['2024', '2025'];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">People</h1>

      {/* Tabs */}
      <div className="bg-gray-100 rounded-t-lg border border-gray-200">
        <div className="flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'px-6 py-3 text-sm font-medium rounded-t-lg',
                activeTab === tab.id
                  ? 'bg-white border-t-2 border-red-500'
                  : 'text-gray-600 hover:text-gray-800'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border-x border-b border-gray-200 rounded-b-lg p-6">
        {/* Role Types Link */}
        <div className="mb-6">
          <Link to="/role-types" className="text-blue-600 hover:underline">
            To review and select role types specific to your league click here
          </Link>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Role</label>
            <Select
              options={roles.map((role) => ({ value: role.id, label: role.name }))}
              value={filters.role ? { value: filters.role.id, label: filters.role.name } : null}
              onChange={(selected) => setFilters(prev => ({ ...prev, role: selected }))}
              className="w-full"
              placeholder="Select a role"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Season</label>
            <select
              value={filters.season}
              onChange={(e) => setFilters(prev => ({ ...prev, season: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option>2024-2025</option>
              <option>2023-2024</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Division</label>
            <Select
              options={divisions.map((division) => ({ value: division.id, label: division.name }))}
              value={filters.division ? { value: filters.division.id, label: filters.division.name } : null}
              onChange={(selected) => setFilters(prev => ({ ...prev, division: selected }))}
              className="w-full"
              placeholder="Select a division"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Team</label>
            <Select
              options={teams.map((team) => ({ value: team.id, label: team.name }))}
              value={filters.team ? { value: filters.team.id, label: filters.team.name } : null}
              onChange={(selected) => setFilters(prev => ({ ...prev, team: selected }))}
              className="w-full"
              placeholder="Select a team"
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="flex flex-wrap gap-6 mb-6">
          <div>
            <label className="block text-sm text-gray-700 mb-1">From</label>
            <div className="flex gap-2">
              <Select
                options={staticDays.map((day) => ({ value: day, label: day }))}
                value={{ label: filters.fromDate.day, value: filters.fromDate.day }}
                onChange={(selected) =>
                  setFilters(prev => ({ ...prev, fromDate: { ...prev.fromDate, day: selected.value } }))
                }
                className="w-full"
              />
              <Select
                options={staticMonths.map((month) => ({ value: month, label: month }))}
                value={{ label: filters.fromDate.month, value: filters.fromDate.month }}
                onChange={(selected) =>
                  setFilters(prev => ({ ...prev, fromDate: { ...prev.fromDate, month: selected.value } }))
                }
                className="w-full"
              />
              <Select
                options={staticYears.map((year) => ({ value: year, label: year }))}
                value={{ label: filters.fromDate.year, value: filters.fromDate.year }}
                onChange={(selected) =>
                  setFilters(prev => ({ ...prev, fromDate: { ...prev.fromDate, year: selected.value } }))
                }
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">To</label>
            <div className="flex gap-2">
              <Select
                options={staticDays.map((day) => ({ value: day, label: day }))}
                value={{ label: filters.toDate.day, value: filters.toDate.day }}
                onChange={(selected) =>
                  setFilters(prev => ({ ...prev, toDate: { ...prev.toDate, day: selected.value } }))
                }
                className="w-full"
              />
              <Select
                options={staticMonths.map((month) => ({ value: month, label: month }))}
                value={{ label: filters.toDate.month, value: filters.toDate.month }}
                onChange={(selected) =>
                  setFilters(prev => ({ ...prev, toDate: { ...prev.toDate, month: selected.value } }))
                }
                className="w-full"
              />
              <Select
                options={staticYears.map((year) => ({ value: year, label: year }))}
                value={{ label: filters.toDate.year, value: filters.toDate.year }}
                onChange={(selected) =>
                  setFilters(prev => ({ ...prev, toDate: { ...prev.toDate, year: selected.value } }))
                }
                className="w-full"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => {
              if (validateFilters()) handleCreateNew();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Create new
          </button>
          <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
            Back
          </button>
        </div>

        {/* People Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Of Birth</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Has Login?</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verified Email?</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockPeople.map((person, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{person.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{person.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{person.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{person.dateOfBirth}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {person.hasLogin && (
                      <div>
                        <span className="text-green-600">✓ Yes</span>
                        <div className="text-xs text-gray-500">Last logged in: {person.lastLoggedIn}</div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {person.verifiedEmail && <span className="text-green-600">✓ Yes</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                        Edit
                      </button>
                      <button className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
