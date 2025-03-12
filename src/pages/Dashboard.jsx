import DataTable from '../components/DataTable';

const columns = [
  { header: 'Competition', accessor: 'competition' },
  { header: 'Teams', accessor: 'teams' },
  { header: 'Matches', accessor: 'matches' },
  { header: 'Results', accessor: 'results' },
];

const data = [
  {
    competition: '4sov tournament',
    teams: '12',
    matches: '24',
    results: '18',
  },
  // Add more data as needed
];

export default function Dashboard() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Welcome to your admin dashboard</p>
      </div>

      <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
        {['Total Teams', 'Active Tournaments', 'Completed Matches', 'Pending Results'].map((title) => (
          <div key={title} className="p-4 bg-white rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">{title}</h3>
            <p className="text-2xl font-bold">24</p>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Recent Competitions</h2>
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
}