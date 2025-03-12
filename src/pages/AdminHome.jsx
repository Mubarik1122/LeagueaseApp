import { AlertTriangle } from 'lucide-react';
import CompetitionTable from '../components/CompetitionTable';

const competitions = [
  {
    name: '4sov tournament',
    teams: 0,
    matches: 0,
    results: 0,
    conflicts: 2,
    shortCode: '4SOV'
  }
];

export default function AdminHome() {
  return (
    <div className="p-6 space-y-6">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <div className="flex items-center">
          <AlertTriangle className="text-yellow-400 mr-2" size={20} />
          <p className="text-yellow-700">
            Some of your tournaments do not have enough teams, try adding some teams to{' '}
            <a href="/tournament/4sov" className="font-medium underline">4sov tournament</a>
          </p>
        </div>
      </div>

      <CompetitionTable competitions={competitions} />
    </div>
  );
}