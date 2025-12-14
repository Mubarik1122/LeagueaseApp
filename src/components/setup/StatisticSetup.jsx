import { useState } from "react";
import { BarChart3, Save } from "lucide-react";
import Swal from "sweetalert2";

export default function StatisticSetup() {
  const [config, setConfig] = useState({
    trackGoals: true,
    trackAssists: true,
    trackYellowCards: true,
    trackRedCards: true,
    trackCleanSheets: true,
    trackPlayerOfMatch: true,
    trackAttendance: false,
    trackPossession: false,
    trackShots: false,
    trackShotsOnTarget: false,
    trackCorners: false,
    trackFouls: false,
    customStats: [],
  });

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      // TODO: Integrate with actual statistics API
      await new Promise(resolve => setTimeout(resolve, 1000));

      Swal.fire({
        icon: "success",
        title: "Saved!",
        text: "Statistics configuration has been saved successfully",
        timer: 2000,
        showConfirmButton: false,
      });
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
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <BarChart3 className="mr-2" size={24} />
          Statistic Setup
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Configure which statistics to track for your league
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Player Statistics</h3>
        <div className="space-y-3 mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.trackGoals}
              onChange={(e) => setConfig({ ...config, trackGoals: e.target.checked })}
              className="h-4 w-4 text-[#00ADE5] focus:ring-[#00ADE5] border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Track Goals</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.trackAssists}
              onChange={(e) => setConfig({ ...config, trackAssists: e.target.checked })}
              className="h-4 w-4 text-[#00ADE5] focus:ring-[#00ADE5] border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Track Assists</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.trackYellowCards}
              onChange={(e) => setConfig({ ...config, trackYellowCards: e.target.checked })}
              className="h-4 w-4 text-[#00ADE5] focus:ring-[#00ADE5] border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Track Yellow Cards</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.trackRedCards}
              onChange={(e) => setConfig({ ...config, trackRedCards: e.target.checked })}
              className="h-4 w-4 text-[#00ADE5] focus:ring-[#00ADE5] border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Track Red Cards</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.trackCleanSheets}
              onChange={(e) => setConfig({ ...config, trackCleanSheets: e.target.checked })}
              className="h-4 w-4 text-[#00ADE5] focus:ring-[#00ADE5] border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Track Clean Sheets (Goalkeepers)</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.trackPlayerOfMatch}
              onChange={(e) => setConfig({ ...config, trackPlayerOfMatch: e.target.checked })}
              className="h-4 w-4 text-[#00ADE5] focus:ring-[#00ADE5] border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Track Player of the Match</span>
          </label>
        </div>

        <h3 className="text-lg font-semibold text-gray-800 mb-4 mt-6">Match Statistics</h3>
        <div className="space-y-3 mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.trackAttendance}
              onChange={(e) => setConfig({ ...config, trackAttendance: e.target.checked })}
              className="h-4 w-4 text-[#00ADE5] focus:ring-[#00ADE5] border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Track Attendance</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.trackPossession}
              onChange={(e) => setConfig({ ...config, trackPossession: e.target.checked })}
              className="h-4 w-4 text-[#00ADE5] focus:ring-[#00ADE5] border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Track Possession (%)</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.trackShots}
              onChange={(e) => setConfig({ ...config, trackShots: e.target.checked })}
              className="h-4 w-4 text-[#00ADE5] focus:ring-[#00ADE5] border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Track Total Shots</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.trackShotsOnTarget}
              onChange={(e) => setConfig({ ...config, trackShotsOnTarget: e.target.checked })}
              className="h-4 w-4 text-[#00ADE5] focus:ring-[#00ADE5] border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Track Shots on Target</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.trackCorners}
              onChange={(e) => setConfig({ ...config, trackCorners: e.target.checked })}
              className="h-4 w-4 text-[#00ADE5] focus:ring-[#00ADE5] border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Track Corners</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.trackFouls}
              onChange={(e) => setConfig({ ...config, trackFouls: e.target.checked })}
              className="h-4 w-4 text-[#00ADE5] focus:ring-[#00ADE5] border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Track Fouls</span>
          </label>
        </div>

        <div className="border-t pt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-[#00ADE5] text-white rounded-md hover:bg-[#008FC5] disabled:bg-gray-400 flex items-center"
          >
            <Save size={18} className="mr-1" />
            {loading ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <BarChart3 className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Tip:</strong> Enable only the statistics that are relevant to your league.
              Too many statistics can make data entry more time-consuming.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
