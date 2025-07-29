import { AlertTriangle } from 'lucide-react';
import CompetitionTable from '../components/CompetitionTable';
import { useTournament } from '../hooks/useTournament';
import { useEffect } from 'react';


export default function AdminHome() {
  const { tournaments, loading, error, fetchTournaments } = useTournament();
  
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.userId) {
      fetchTournaments(user.userId);
    }
  }, []);

  const competitions = tournaments.map(tournament => ({
    name: tournament.tournamentName || 'Unnamed Tournament',
    teams: 0, // This would need to be fetched from teams API
    matches: 0, // This would need to be fetched from matches API
    results: 0, // This would need to be calculated
    conflicts: 0, // This would need to be calculated
    shortCode: tournament.shortCode || 'N/A'
  }));
  return (
    <div className="p-6 space-y-6">
      {loading && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <p className="text-blue-700">Loading tournaments...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <p className="text-red-700">Error loading tournaments: {error}</p>
        </div>
      )}
      
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <div className="flex items-center">
          <AlertTriangle className="text-yellow-400 mr-2" size={20} />
          <p className="text-yellow-700">
            {competitions.length === 0 
              ? "No tournaments found. Create your first tournament to get started."
              : "Some of your tournaments do not have enough teams, try adding some teams."
            }
          </p>
        </div>
      </div>

      <CompetitionTable competitions={competitions} />
    </div>
  );
}