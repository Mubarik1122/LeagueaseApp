import { useState } from 'react';
import { AlertCircle } from 'lucide-react';

export default function TransferPlayers() {
  const [fromTeam, setFromTeam] = useState('');
  const [toTeam, setToTeam] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState([]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Transfer Players</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Info Message */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <AlertCircle className="text-blue-400 mr-2" size={20} />
            <p className="text-sm text-blue-700">
              Transfer players between teams while maintaining their history and statistics.
            </p>
          </div>
        </div>

        {/* Transfer Form */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Team
            </label>
            <select
              value={fromTeam}
              onChange={(e) => setFromTeam(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Select team...</option>
              <option value="team1">Team A</option>
              <option value="team2">Team B</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Team
            </label>
            <select
              value={toTeam}
              onChange={(e) => setToTeam(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Select team...</option>
              <option value="team1">Team A</option>
              <option value="team2">Team B</option>
            </select>
          </div>

          {fromTeam && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Players to Transfer
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-2">
                {/* Sample players - replace with actual data */}
                {['Player 1', 'Player 2', 'Player 3'].map((player) => (
                  <label key={player} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedPlayers.includes(player)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPlayers([...selectedPlayers, player]);
                        } else {
                          setSelectedPlayers(selectedPlayers.filter(p => p !== player));
                        }
                      }}
                      className="rounded border-gray-300 text-[#00ade5] focus:ring-[#00ade5]"
                    />
                    <span className="text-sm text-gray-700">{player}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <button
            disabled={!fromTeam || !toTeam || selectedPlayers.length === 0}
            className="w-full px-4 py-2 bg-[#00ade5] text-white rounded hover:bg-[#0099cc] disabled:bg-gray-300"
          >
            Transfer Selected Players
          </button>
        </div>
      </div>
    </div>
  );
}