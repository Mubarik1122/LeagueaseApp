import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, Settings, Save, BarChart3 } from "lucide-react";
import Swal from "sweetalert2";
import { tournamentAPI } from "../services/api";

export default function Standings() {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState("");
  const [loading, setLoading] = useState(false);

  const [standingsConfig, setStandingsConfig] = useState({
    scoringSystem: "3-1-0", // 3 points for win, 1 for draw, 0 for loss
    promotionZone: 0,
    relegationZone: 0,
    showPromotionRelegation: true,
    positionHighlights: "auto",
    hideStandings: false,
    hideMatchesFrom: null,
    hidePlayers: false,
    hideScore: false,
    hideVenue: false,
  });

  // Get user ID from localStorage
  const getUserId = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.id || user._id || user.userId;
  };

  // Load tournaments on component mount
  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      const userId = getUserId();
      const response = await tournamentAPI.getByUserId(userId);
      if (response.errorCode === 0 && response.data) {
        setTournaments(response.data);
        if (response.data.length > 0) {
          const firstTournament = response.data[0];
          setSelectedTournament(firstTournament._id || firstTournament.id);

          // Load existing config if available
          if (firstTournament.scoringSystem) {
            setStandingsConfig({
              scoringSystem: firstTournament.scoringSystem || "3-1-0",
              promotionZone: firstTournament.promotionZone || 0,
              relegationZone: firstTournament.relegationZone || 0,
              showPromotionRelegation: firstTournament.showPromotionRelegation ?? true,
              positionHighlights: firstTournament.positionHighlights || "auto",
              hideStandings: firstTournament.hideStandings || false,
              hideMatchesFrom: firstTournament.hideMatchesFrom || null,
              hidePlayers: firstTournament.hidePlayers || false,
              hideScore: firstTournament.hideScore || false,
              hideVenue: firstTournament.hideVenue || false,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error loading tournaments:", error);
    }
  };

  const handleTournamentChange = (tournamentId) => {
    setSelectedTournament(tournamentId);
    const tournament = tournaments.find(t => (t._id || t.id) === tournamentId);

    if (tournament) {
      setStandingsConfig({
        scoringSystem: tournament.scoringSystem || "3-1-0",
        promotionZone: tournament.promotionZone || 0,
        relegationZone: tournament.relegationZone || 0,
        showPromotionRelegation: tournament.showPromotionRelegation ?? true,
        positionHighlights: tournament.positionHighlights || "auto",
        hideStandings: tournament.hideStandings || false,
        hideMatchesFrom: tournament.hideMatchesFrom || null,
        hidePlayers: tournament.hidePlayers || false,
        hideScore: tournament.hideScore || false,
        hideVenue: tournament.hideVenue || false,
      });
    }
  };

  const handleSaveConfig = async () => {
    if (!selectedTournament) {
      Swal.fire({
        icon: "warning",
        title: "Select Tournament",
        text: "Please select a tournament first",
      });
      return;
    }

    setLoading(true);
    try {
      const userId = getUserId();
      const tournament = tournaments.find(t => (t._id || t.id) === selectedTournament);

      const updateData = {
        tournamentId: selectedTournament,
        userId: userId,
        tournamentName: tournament?.tournamentName,
        tournamentType: tournament?.tournamentType,
        sequence: tournament?.sequence || 0,
        shortCode: tournament?.shortCode,
        ...standingsConfig,
      };

      const response = await tournamentAPI.save(updateData);

      if (response.errorCode === 0) {
        Swal.fire({
          icon: "success",
          title: "Saved!",
          text: "Standings configuration has been saved successfully!",
          timer: 2000,
          showConfirmButton: false,
        });
        loadTournaments();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.errorMessage || "Failed to save configuration",
        });
      }
    } catch (error) {
      console.error("Error saving config:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save configuration",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/admin/setup/competitions")}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 flex items-center">
              <BarChart3 className="mr-2" size={28} />
              Standings Setup
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Configure how standings are calculated and displayed
            </p>
          </div>
        </div>
      </div>

      {/* Tournament Selector */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Tournament/Division
        </label>
        <select
          value={selectedTournament}
          onChange={(e) => handleTournamentChange(e.target.value)}
          className="w-full md:w-1/2 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
        >
          <option value="">Choose a tournament...</option>
          {tournaments.map((tournament) => (
            <option key={tournament._id || tournament.id} value={tournament._id || tournament.id}>
              {tournament.tournamentName}
            </option>
          ))}
        </select>
      </div>

      {/* Configuration Form */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <Settings className="mr-2" size={20} />
            Standings Configuration
          </h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Scoring System */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Points Scoring System
            </label>
            <select
              value={standingsConfig.scoringSystem}
              onChange={(e) =>
                setStandingsConfig({ ...standingsConfig, scoringSystem: e.target.value })
              }
              className="w-full md:w-1/2 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
            >
              <option value="3-1-0">3 points for win, 1 for draw, 0 for loss (Standard)</option>
              <option value="2-1-0">2 points for win, 1 for draw, 0 for loss</option>
              <option value="3-0-0">3 points for win, 0 for draw/loss (Win Only)</option>
              <option value="custom">Custom Scoring</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Choose how points are awarded for match results
            </p>
          </div>

          {/* Promotion/Relegation Zones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Promotion Zone (Top positions)
              </label>
              <input
                type="number"
                min="0"
                value={standingsConfig.promotionZone}
                onChange={(e) =>
                  setStandingsConfig({ ...standingsConfig, promotionZone: parseInt(e.target.value) || 0 })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Number of teams in promotion zone (highlighted green)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relegation Zone (Bottom positions)
              </label>
              <input
                type="number"
                min="0"
                value={standingsConfig.relegationZone}
                onChange={(e) =>
                  setStandingsConfig({ ...standingsConfig, relegationZone: parseInt(e.target.value) || 0 })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Number of teams in relegation zone (highlighted red)
              </p>
            </div>
          </div>

          {/* Position Highlights */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Position Highlights
            </label>
            <select
              value={standingsConfig.positionHighlights}
              onChange={(e) =>
                setStandingsConfig({ ...standingsConfig, positionHighlights: e.target.value })
              }
              className="w-full md:w-1/2 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
            >
              <option value="auto">Automatic (based on zones)</option>
              <option value="none">None</option>
              <option value="custom">Custom Colors</option>
            </select>
          </div>

          {/* Visibility Toggles */}
          <div className="border-t pt-6">
            <h3 className="text-md font-semibold text-gray-800 mb-4">Visibility Settings</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={standingsConfig.showPromotionRelegation}
                  onChange={(e) =>
                    setStandingsConfig({
                      ...standingsConfig,
                      showPromotionRelegation: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-[#00ADE5] focus:ring-[#00ADE5] border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Show promotion/relegation indicators
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={standingsConfig.hideStandings}
                  onChange={(e) =>
                    setStandingsConfig({ ...standingsConfig, hideStandings: e.target.checked })
                  }
                  className="h-4 w-4 text-[#00ADE5] focus:ring-[#00ADE5] border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Hide standings table from public view
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={standingsConfig.hideScore}
                  onChange={(e) =>
                    setStandingsConfig({ ...standingsConfig, hideScore: e.target.checked })
                  }
                  className="h-4 w-4 text-[#00ADE5] focus:ring-[#00ADE5] border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Hide match scores
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={standingsConfig.hidePlayers}
                  onChange={(e) =>
                    setStandingsConfig({ ...standingsConfig, hidePlayers: e.target.checked })
                  }
                  className="h-4 w-4 text-[#00ADE5] focus:ring-[#00ADE5] border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Hide player statistics
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={standingsConfig.hideVenue}
                  onChange={(e) =>
                    setStandingsConfig({ ...standingsConfig, hideVenue: e.target.checked })
                  }
                  className="h-4 w-4 text-[#00ADE5] focus:ring-[#00ADE5] border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Hide venue information
                </span>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="border-t pt-6 flex justify-end">
            <button
              onClick={handleSaveConfig}
              disabled={loading || !selectedTournament}
              className="px-6 py-2 bg-[#00ADE5] text-white rounded-md hover:bg-[#008FC5] disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                "Saving..."
              ) : (
                <>
                  <Save size={18} className="mr-1" />
                  Save Configuration
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <Trophy className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Tip:</strong> Standings are automatically calculated based on match results.
              Configure promotion/relegation zones to highlight important positions in your league table.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
