import { useState } from "react";
import { ClipboardList, Save } from "lucide-react";
import Swal from "sweetalert2";

export default function ScoreEntryOptions() {
  const [config, setConfig] = useState({
    allowScoreEntry: true,
    requireApproval: false,
    allowTeamManagerEntry: true,
    allowPlayerEntry: false,
    requireBothTeamsConfirm: false,
    autoPublishResults: true,
    notifyOnScoreEntry: true,
    allowScoreCorrection: true,
    correctionDeadlineHours: 48,
    showScoresImmediately: true,
    allowLiveScoreUpdates: false,
    requireMatchReport: false,
    allowHalfTimeScores: true,
  });

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      // TODO: Integrate with actual score entry API
      await new Promise(resolve => setTimeout(resolve, 1000));

      Swal.fire({
        icon: "success",
        title: "Saved!",
        text: "Score entry options have been saved successfully",
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
          <ClipboardList className="mr-2" size={24} />
          Score Entry Options
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Configure how match scores are entered and managed
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Entry Permissions</h3>
        <div className="space-y-3 mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.allowScoreEntry}
              onChange={(e) => setConfig({ ...config, allowScoreEntry: e.target.checked })}
              className="h-4 w-4 text-[#00ADE5] focus:ring-[#00ADE5] border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              Allow score entry (if disabled, only admins can enter scores)
            </span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.allowTeamManagerEntry}
              onChange={(e) => setConfig({ ...config, allowTeamManagerEntry: e.target.checked })}
              className="h-4 w-4 text-[#00ADE5] focus:ring-[#00ADE5] border-gray-300 rounded"
              disabled={!config.allowScoreEntry}
            />
            <span className="ml-2 text-sm text-gray-700">
              Allow team managers to enter scores
            </span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.allowPlayerEntry}
              onChange={(e) => setConfig({ ...config, allowPlayerEntry: e.target.checked })}
              className="h-4 w-4 text-[#00ADE5] focus:ring-[#00ADE5] border-gray-300 rounded"
              disabled={!config.allowScoreEntry}
            />
            <span className="ml-2 text-sm text-gray-700">
              Allow players to enter scores
            </span>
          </label>
        </div>

        <h3 className="text-lg font-semibold text-gray-800 mb-4 mt-6">Approval & Verification</h3>
        <div className="space-y-3 mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.requireApproval}
              onChange={(e) => setConfig({ ...config, requireApproval: e.target.checked })}
              className="h-4 w-4 text-[#00ADE5] focus:ring-[#00ADE5] border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              Require admin approval before publishing scores
            </span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.requireBothTeamsConfirm}
              onChange={(e) => setConfig({ ...config, requireBothTeamsConfirm: e.target.checked })}
              className="h-4 w-4 text-[#00ADE5] focus:ring-[#00ADE5] border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              Require both teams to confirm the score
            </span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.allowScoreCorrection}
              onChange={(e) => setConfig({ ...config, allowScoreCorrection: e.target.checked })}
              className="h-4 w-4 text-[#00ADE5] focus:ring-[#00ADE5] border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              Allow score corrections after submission
            </span>
          </label>

          {config.allowScoreCorrection && (
            <div className="ml-6 mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correction deadline (hours after match)
              </label>
              <input
                type="number"
                min="1"
                max="168"
                value={config.correctionDeadlineHours}
                onChange={(e) => setConfig({ ...config, correctionDeadlineHours: parseInt(e.target.value) || 48 })}
                className="w-32 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Set deadline for score corrections (1-168 hours)
              </p>
            </div>
          )}
        </div>

        <h3 className="text-lg font-semibold text-gray-800 mb-4 mt-6">Display & Publishing</h3>
        <div className="space-y-3 mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.autoPublishResults}
              onChange={(e) => setConfig({ ...config, autoPublishResults: e.target.checked })}
              className="h-4 w-4 text-[#00ADE5] focus:ring-[#00ADE5] border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              Automatically publish results after entry
            </span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.showScoresImmediately}
              onChange={(e) => setConfig({ ...config, showScoresImmediately: e.target.checked })}
              className="h-4 w-4 text-[#00ADE5] focus:ring-[#00ADE5] border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              Show scores immediately on public pages
            </span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.allowLiveScoreUpdates}
              onChange={(e) => setConfig({ ...config, allowLiveScoreUpdates: e.target.checked })}
              className="h-4 w-4 text-[#00ADE5] focus:ring-[#00ADE5] border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              Allow live score updates during matches
            </span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.allowHalfTimeScores}
              onChange={(e) => setConfig({ ...config, allowHalfTimeScores: e.target.checked })}
              className="h-4 w-4 text-[#00ADE5] focus:ring-[#00ADE5] border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              Track half-time scores
            </span>
          </label>
        </div>

        <h3 className="text-lg font-semibold text-gray-800 mb-4 mt-6">Notifications</h3>
        <div className="space-y-3 mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.notifyOnScoreEntry}
              onChange={(e) => setConfig({ ...config, notifyOnScoreEntry: e.target.checked })}
              className="h-4 w-4 text-[#00ADE5] focus:ring-[#00ADE5] border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              Send notifications when scores are entered
            </span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.requireMatchReport}
              onChange={(e) => setConfig({ ...config, requireMatchReport: e.target.checked })}
              className="h-4 w-4 text-[#00ADE5] focus:ring-[#00ADE5] border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              Require match report with score submission
            </span>
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
            <ClipboardList className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Tip:</strong> Configure these settings based on your league's level of formality
              and how much control you want over score entry. More controls mean more accuracy but
              potentially slower updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
