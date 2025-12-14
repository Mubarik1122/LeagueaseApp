import { useState, useEffect } from "react";
import { Calendar, Lock, Unlock, Eye, EyeOff, Edit2, Save, X, Plus, Star } from "lucide-react";
import Swal from "sweetalert2";

export default function Seasons() {
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editForm, setEditForm] = useState({
    seasonId: null,
    seasonName: "",
    seasonStartDate: "",
    seasonEndDate: "",
    isHidden: false,
    isLocked: false,
    isDefault: false,
  });

  // Get user ID from localStorage
  const getUserId = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.id || user._id || user.userId;
  };

  // Load seasons on component mount
  useEffect(() => {
    loadSeasons();
  }, []);

  const loadSeasons = async () => {
    setLoading(true);
    try {
      const userId = getUserId();
      // TODO: Replace with actual season API when available
      // For now, using mock data
      const mockSeasons = [
        {
          _id: "1",
          seasonName: "2024/2025 Season",
          seasonStartDate: "2024-09-01",
          seasonEndDate: "2025-06-30",
          isHidden: false,
          isLocked: false,
          isDefault: true,
          isCurrent: true,
        },
        {
          _id: "2",
          seasonName: "2023/2024 Season",
          seasonStartDate: "2023-09-01",
          seasonEndDate: "2024-06-30",
          isHidden: false,
          isLocked: true,
          isDefault: false,
          isCurrent: false,
        },
      ];
      setSeasons(mockSeasons);
    } catch (error) {
      console.error("Error loading seasons:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load seasons",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (season) => {
    setEditingId(season._id);
    setEditForm({
      seasonId: season._id,
      seasonName: season.seasonName,
      seasonStartDate: season.seasonStartDate,
      seasonEndDate: season.seasonEndDate,
      isHidden: season.isHidden,
      isLocked: season.isLocked,
      isDefault: season.isDefault,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({
      seasonId: null,
      seasonName: "",
      seasonStartDate: "",
      seasonEndDate: "",
      isHidden: false,
      isLocked: false,
      isDefault: false,
    });
  };

  const handleSaveEdit = async () => {
    if (!editForm.seasonName.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Season name is required",
      });
      return;
    }

    if (!editForm.seasonStartDate || !editForm.seasonEndDate) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Start and end dates are required",
      });
      return;
    }

    if (new Date(editForm.seasonStartDate) >= new Date(editForm.seasonEndDate)) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "End date must be after start date",
      });
      return;
    }

    setLoading(true);
    try {
      const userId = getUserId();
      // TODO: Replace with actual season API when available
      // const response = await seasonAPI.save({ ...editForm, userId });

      // Mock update
      setSeasons(seasons.map(s =>
        s._id === editForm.seasonId
          ? { ...s, ...editForm }
          : editForm.isDefault && s.isDefault
            ? { ...s, isDefault: false }
            : s
      ));

      Swal.fire({
        icon: "success",
        title: "Saved!",
        text: "Season has been updated successfully",
        timer: 2000,
        showConfirmButton: false,
      });

      handleCancelEdit();
    } catch (error) {
      console.error("Error saving season:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save season",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSeason = async () => {
    if (!editForm.seasonName.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Season name is required",
      });
      return;
    }

    if (!editForm.seasonStartDate || !editForm.seasonEndDate) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Start and end dates are required",
      });
      return;
    }

    if (new Date(editForm.seasonStartDate) >= new Date(editForm.seasonEndDate)) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "End date must be after start date",
      });
      return;
    }

    setLoading(true);
    try {
      const userId = getUserId();
      // TODO: Replace with actual season API when available
      // const response = await seasonAPI.save({ ...editForm, userId });

      // Mock create
      const newSeason = {
        _id: Date.now().toString(),
        ...editForm,
        isCurrent: false,
      };

      setSeasons([...seasons.map(s =>
        editForm.isDefault ? { ...s, isDefault: false } : s
      ), newSeason]);

      Swal.fire({
        icon: "success",
        title: "Created!",
        text: "Season has been created successfully",
        timer: 2000,
        showConfirmButton: false,
      });

      setShowCreateForm(false);
      setEditForm({
        seasonId: null,
        seasonName: "",
        seasonStartDate: "",
        seasonEndDate: "",
        isHidden: false,
        isLocked: false,
        isDefault: false,
      });
    } catch (error) {
      console.error("Error creating season:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to create season",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (seasonId, field) => {
    const season = seasons.find(s => s._id === seasonId);

    // Prevent unlocking current season
    if (field === "isLocked" && season.isCurrent && season.isLocked) {
      Swal.fire({
        icon: "warning",
        title: "Cannot Unlock",
        text: "Cannot unlock the current season",
      });
      return;
    }

    setLoading(true);
    try {
      // TODO: Replace with actual season API when available
      // await seasonAPI.updateStatus({ seasonId, field, value: !season[field] });

      setSeasons(seasons.map(s =>
        s._id === seasonId ? { ...s, [field]: !s[field] } : s
      ));

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Status has been updated successfully",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update status",
      });
    } finally {
      setLoading(false);
    }
  };

  const setAsDefault = async (seasonId) => {
    setLoading(true);
    try {
      // TODO: Replace with actual season API when available
      // await seasonAPI.setDefault({ seasonId });

      setSeasons(seasons.map(s => ({
        ...s,
        isDefault: s._id === seasonId,
      })));

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Default season has been updated",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error setting default:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to set default season",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <Calendar className="mr-2" size={24} />
            Season Management
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage your league seasons, dates, and settings
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-[#00ADE5] text-white rounded-md hover:bg-[#008FC5] flex items-center"
        >
          <Plus size={18} className="mr-1" />
          Create Season
        </button>
      </div>

      {/* Create Season Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Season</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Season Name *
              </label>
              <input
                type="text"
                value={editForm.seasonName}
                onChange={(e) => setEditForm({ ...editForm, seasonName: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
                placeholder="e.g., 2024/2025 Season"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                value={editForm.seasonStartDate}
                onChange={(e) => setEditForm({ ...editForm, seasonStartDate: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                value={editForm.seasonEndDate}
                onChange={(e) => setEditForm({ ...editForm, seasonEndDate: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={editForm.isDefault}
                onChange={(e) => setEditForm({ ...editForm, isDefault: e.target.checked })}
                className="h-4 w-4 text-[#00ADE5] focus:ring-[#00ADE5] border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Set as default season</label>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => {
                setShowCreateForm(false);
                setEditForm({
                  seasonId: null,
                  seasonName: "",
                  seasonStartDate: "",
                  seasonEndDate: "",
                  isHidden: false,
                  isLocked: false,
                  isDefault: false,
                });
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateSeason}
              disabled={loading}
              className="px-4 py-2 bg-[#00ADE5] text-white rounded-md hover:bg-[#008FC5] disabled:bg-gray-400"
            >
              Create Season
            </button>
          </div>
        </div>
      )}

      {/* Seasons Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading && !editingId ? (
          <div className="p-8 text-center">
            <div className="text-gray-500">Loading seasons...</div>
          </div>
        ) : seasons.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-500">No seasons found</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 text-[#00ADE5] hover:underline"
            >
              Create your first season
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Season Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Default
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {seasons.map((season) => (
                  <tr key={season._id} className={season.isCurrent ? "bg-blue-50" : ""}>
                    {editingId === season._id ? (
                      <>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={editForm.seasonName}
                            onChange={(e) => setEditForm({ ...editForm, seasonName: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="date"
                            value={editForm.seasonStartDate}
                            onChange={(e) => setEditForm({ ...editForm, seasonStartDate: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="date"
                            value={editForm.seasonEndDate}
                            onChange={(e) => setEditForm({ ...editForm, seasonEndDate: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => setEditForm({ ...editForm, isHidden: !editForm.isHidden })}
                              className={`p-1 rounded ${editForm.isHidden ? "text-orange-600" : "text-gray-400"}`}
                              title={editForm.isHidden ? "Hidden" : "Visible"}
                            >
                              {editForm.isHidden ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                            <button
                              onClick={() => {
                                if (!season.isCurrent) {
                                  setEditForm({ ...editForm, isLocked: !editForm.isLocked });
                                }
                              }}
                              className={`p-1 rounded ${editForm.isLocked ? "text-red-600" : "text-gray-400"} ${season.isCurrent && editForm.isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
                              title={editForm.isLocked ? "Locked" : "Unlocked"}
                              disabled={season.isCurrent && editForm.isLocked}
                            >
                              {editForm.isLocked ? <Lock size={18} /> : <Unlock size={18} />}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={editForm.isDefault}
                            onChange={(e) => setEditForm({ ...editForm, isDefault: e.target.checked })}
                            className="h-4 w-4 text-[#00ADE5] focus:ring-[#00ADE5] border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={handleSaveEdit}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="Save"
                            >
                              <Save size={18} />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Cancel"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900">
                              {season.seasonName}
                            </span>
                            {season.isCurrent && (
                              <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                Current
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(season.seasonStartDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(season.seasonEndDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => toggleStatus(season._id, "isHidden")}
                              className={`p-1 rounded hover:bg-gray-100 ${season.isHidden ? "text-orange-600" : "text-gray-400"}`}
                              title={season.isHidden ? "Hidden - Click to show" : "Visible - Click to hide"}
                            >
                              {season.isHidden ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                            <button
                              onClick={() => toggleStatus(season._id, "isLocked")}
                              className={`p-1 rounded hover:bg-gray-100 ${season.isLocked ? "text-red-600" : "text-gray-400"} ${season.isCurrent && season.isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
                              title={
                                season.isCurrent && season.isLocked
                                  ? "Current season cannot be unlocked"
                                  : season.isLocked
                                    ? "Locked - Click to unlock"
                                    : "Unlocked - Click to lock"
                              }
                              disabled={season.isCurrent && season.isLocked}
                            >
                              {season.isLocked ? <Lock size={18} /> : <Unlock size={18} />}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {season.isDefault ? (
                            <Star className="inline-block text-yellow-500" size={18} fill="currentColor" />
                          ) : (
                            <button
                              onClick={() => setAsDefault(season._id)}
                              className="text-gray-400 hover:text-yellow-500"
                              title="Set as default"
                            >
                              <Star size={18} />
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <button
                              onClick={() => handleEdit(season)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="Edit"
                            >
                              <Edit2 size={18} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <Calendar className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> The current season cannot be unlocked. Hidden seasons won't appear
              in public views. Locked seasons prevent modifications to their data. Only one season can
              be set as the default.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
