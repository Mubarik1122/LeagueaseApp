import { useState } from 'react';
import { X, Trophy, Info, CheckCircle2 } from 'lucide-react';
import { useTournament } from '../hooks/useTournament';
import Swal from 'sweetalert2';
import Modal from './Modal';

export default function CreateTournamentModal({ isOpen, onClose, onSuccess }) {
  const { saveTournament } = useTournament();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tournamentName: '',
    tournamentType: 'Division',
    sequence: 0,
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
        userId: user.userId,
        tournamentName: formData.tournamentName,
        tournamentType: formData.tournamentType,
        sequence: parseInt(formData.sequence, 10) || 0,
        shortCode: formData.shortCode,
        promotionZone: parseInt(formData.promotionZone, 10) || 0,
        relegationZone: parseInt(formData.relegationZone, 10) || 0,
        positionHighlights: formData.positionHighlights,
        hideMatchesFrom: null,
        hideStandings: formData.hideStandings,
        hidePlayers: formData.hidePlayers,
        hideScore: formData.hideScore,
        hideVenue: formData.hideVenue,
        scoringSystem: null,
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
          sequence: 0,
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      innerScroll
      panelClassName="flex max-w-xl flex-col"
      labelledBy="create-tournament-title"
    >
        {/* Header */}
        <div className="shrink-0 bg-gradient-to-r from-[#003366] to-[#004080] px-4 py-4 text-white sm:px-6 sm:py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h2 id="create-tournament-title" className="text-2xl font-bold">
                  Create New Tournament
                </h2>
                <p className="text-blue-100 text-sm mt-0.5">Set up your tournament in minutes</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-100"
              aria-label="Close modal"
            >
              <X size={24} className="text-white" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-1 w-1 rounded-full bg-[#00ADE5]"></div>
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tournament Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="tournamentName"
                    value={formData.tournamentName}
                    onChange={handleChange}
                    required
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00ADE5] focus:ring-2 focus:ring-[#00ADE5]/20 transition-all duration-100 bg-gray-50 hover:bg-white"
                    placeholder="e.g., Premier League 2024"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tournament Type
                  </label>
                  <select
                    name="tournamentType"
                    value={formData.tournamentType}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00ADE5] focus:ring-2 focus:ring-[#00ADE5]/20 transition-all duration-100 bg-gray-50 hover:bg-white cursor-pointer"
                  >
                    <option value="Division">Division</option>
                    <option value="Tournament">Tournament</option>
                    <option value="League">League</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Short Code
                  </label>
                  <input
                    type="text"
                    name="shortCode"
                    value={formData.shortCode}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00ADE5] focus:ring-2 focus:ring-[#00ADE5]/20 transition-all duration-100 bg-gray-50 hover:bg-white"
                    placeholder="e.g., DIV1, PL24"
                  />
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Info size={12} />
                    Used for quick reference
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sequence
                  </label>
                  <input
                    type="number"
                    name="sequence"
                    value={formData.sequence}
                    onChange={handleChange}
                    min="0"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00ADE5] focus:ring-2 focus:ring-[#00ADE5]/20 transition-all duration-100 bg-gray-50 hover:bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">Display order for multiple tournaments</p>
                </div>
              </div>
            </div>

            {/* Promotion & Relegation Section */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-1 w-1 rounded-full bg-[#00ADE5]"></div>
                <h3 className="text-lg font-semibold text-gray-900">Promotion & Relegation</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Promotion Zone
                  </label>
                  <input
                    type="number"
                    name="promotionZone"
                    value={formData.promotionZone}
                    onChange={handleChange}
                    min="0"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00ADE5] focus:ring-2 focus:ring-[#00ADE5]/20 transition-all duration-100 bg-gray-50 hover:bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">Number of teams promoted</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Relegation Zone
                  </label>
                  <input
                    type="number"
                    name="relegationZone"
                    value={formData.relegationZone}
                    onChange={handleChange}
                    min="0"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00ADE5] focus:ring-2 focus:ring-[#00ADE5]/20 transition-all duration-100 bg-gray-50 hover:bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">Number of teams relegated</p>
                </div>
              </div>
            </div>

            {/* Display Settings Section */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-1 w-1 rounded-full bg-[#00ADE5]"></div>
                <h3 className="text-lg font-semibold text-gray-900">Display Settings</h3>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Position Highlights
                </label>
                <select
                  name="positionHighlights"
                  value={formData.positionHighlights}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00ADE5] focus:ring-2 focus:ring-[#00ADE5]/20 transition-all duration-200 bg-gray-50 hover:bg-white cursor-pointer"
                >
                  <option value="auto">Auto</option>
                  <option value="manual">Manual</option>
                </select>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <p className="text-sm font-semibold text-gray-700 mb-2">Visibility Options</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-100 border border-gray-200 hover:border-[#00ADE5]">
                    <input
                      type="checkbox"
                      name="showPromotionRelegation"
                      checked={formData.showPromotionRelegation}
                      onChange={handleChange}
                      className="w-4 h-4 text-[#00ADE5] border-gray-300 rounded focus:ring-[#00ADE5] cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-700">Show Promotion/Relegation</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-100 border border-gray-200 hover:border-[#00ADE5]">
                    <input
                      type="checkbox"
                      name="hideStandings"
                      checked={formData.hideStandings}
                      onChange={handleChange}
                      className="w-4 h-4 text-[#00ADE5] border-gray-300 rounded focus:ring-[#00ADE5] cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-700">Hide Standings</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-100 border border-gray-200 hover:border-[#00ADE5]">
                    <input
                      type="checkbox"
                      name="hidePlayers"
                      checked={formData.hidePlayers}
                      onChange={handleChange}
                      className="w-4 h-4 text-[#00ADE5] border-gray-300 rounded focus:ring-[#00ADE5] cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-700">Hide Players</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-100 border border-gray-200 hover:border-[#00ADE5]">
                    <input
                      type="checkbox"
                      name="hideScore"
                      checked={formData.hideScore}
                      onChange={handleChange}
                      className="w-4 h-4 text-[#00ADE5] border-gray-300 rounded focus:ring-[#00ADE5] cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-700">Hide Scores</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-100 border border-gray-200 hover:border-[#00ADE5]">
                    <input
                      type="checkbox"
                      name="hideVenue"
                      checked={formData.hideVenue}
                      onChange={handleChange}
                      className="w-4 h-4 text-[#00ADE5] border-gray-300 rounded focus:ring-[#00ADE5] cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-700">Hide Venues</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-[#003366] to-[#004080] text-white rounded-xl font-semibold hover:from-[#002244] hover:to-[#003366] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-100 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={20} />
                    Create Tournament
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
    </Modal>
  );
}
