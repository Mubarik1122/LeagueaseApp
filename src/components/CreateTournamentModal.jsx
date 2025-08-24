import { useState } from 'react';
import { X } from 'lucide-react';
import { useTournament } from '../hooks/useTournament';
import Swal from 'sweetalert2';

export default function CreateTournamentModal({ isOpen, onClose, onSuccess }) {
  const { saveTournament } = useTournament();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tournamentName: '',
    tournamentType: 'Division',
    sequence: 1,
    shortCode: '',
    promotionZone: 0,
    relegationZone: 0,
    showPromotionRelegation: true,
    positionHighlights: 'auto',
    hideStandings: false,
    hidePlayers: false,
    hideScore: false,
    hideVenue: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const tournamentData = {
        ...formData,
        userId: user.userId,
        sequence: parseInt(formData.sequence),
        promotionZone: parseInt(formData.promotionZone),
        relegationZone: parseInt(formData.relegationZone),
        bestPossibleResult: {
          teamScore: 0,
          opponentScore: 0
        },
        hideMatchesFrom: new Date().toISOString(),
      };

      const result = await saveTournament(tournamentData);
      
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Tournament Created!',
          text: 'Your tournament has been created successfully.',
          timer: 2000,
          showConfirmButton: false,
        });
        
        setFormData({
          tournamentName: '',
          tournamentType: 'Division',
          sequence: 1,
          shortCode: '',
          promotionZone: 0,
          relegationZone: 0,
          showPromotionRelegation: true,
          positionHighlights: 'auto',
          hideStandings: false,
          hidePlayers: false,
          hideScore: false,
          hideVenue: false,
        });
        
        onSuccess?.();
        onClose();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.error || 'Failed to create tournament',
        });
      }
    } catch (error) {
      console.error('Error creating tournament:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An unexpected error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Create New Tournament</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tournament Name *
              </label>
              <input
                type="text"
                name="tournamentName"
                value={formData.tournamentName}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ade5]"
                placeholder="Enter tournament name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tournament Type
              </label>
              <select
                name="tournamentType"
                value={formData.tournamentType}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ade5]"
              >
                <option value="Division">Division</option>
                <option value="Tournament">Tournament</option>
                <option value="League">League</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short Code
              </label>
              <input
                type="text"
                name="shortCode"
                value={formData.shortCode}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ade5]"
                placeholder="e.g., DIV1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sequence
              </label>
              <input
                type="number"
                name="sequence"
                value={formData.sequence}
                onChange={handleChange}
                min="1"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ade5]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Promotion Zone
              </label>
              <input
                type="number"
                name="promotionZone"
                value={formData.promotionZone}
                onChange={handleChange}
                min="0"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ade5]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relegation Zone
              </label>
              <input
                type="number"
                name="relegationZone"
                value={formData.relegationZone}
                onChange={handleChange}
                min="0"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ade5]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Position Highlights
            </label>
            <select
              name="positionHighlights"
              value={formData.positionHighlights}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ade5]"
            >
              <option value="auto">Auto</option>
              <option value="manual">Manual</option>
            </select>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Display Options</h3>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="showPromotionRelegation"
                  checked={formData.showPromotionRelegation}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-[#00ade5] focus:ring-[#00ade5]"
                />
                <span className="text-sm text-gray-600">Show Promotion/Relegation</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="hideStandings"
                  checked={formData.hideStandings}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-[#00ade5] focus:ring-[#00ade5]"
                />
                <span className="text-sm text-gray-600">Hide Standings</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="hidePlayers"
                  checked={formData.hidePlayers}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-[#00ade5] focus:ring-[#00ade5]"
                />
                <span className="text-sm text-gray-600">Hide Players</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="hideScore"
                  checked={formData.hideScore}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-[#00ade5] focus:ring-[#00ade5]"
                />
                <span className="text-sm text-gray-600">Hide Scores</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="hideVenue"
                  checked={formData.hideVenue}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-[#00ade5] focus:ring-[#00ade5]"
                />
                <span className="text-sm text-gray-600">Hide Venues</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#00ade5] text-white rounded-md hover:bg-[#0099cc] disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Tournament'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}