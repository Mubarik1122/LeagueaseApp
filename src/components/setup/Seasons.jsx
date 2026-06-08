import { useEffect, useRef, useState } from "react";
import {
  Calendar,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Edit2,
  Plus,
  Star,
  Trash2,
  X,
  Save,
} from "lucide-react";
import Swal from "sweetalert2";
import Modal from "../Modal";
import {
  CountBadgeButton,
  ListViewModal,
} from "./CountViewModal";
import SetupTabHeader, { SetupPrimaryButton } from "./SetupTabHeader";
import { seasonAPI } from "../../services/api";
import { useCompanyContext } from "../../context/CompanyContext";

const EMPTY_FORM = {
  seasonId: null,
  seasonName: "",
  seasonStartDate: "",
  seasonEndDate: "",
  isHidden: false,
  isLocked: false,
};

function getSeasonDetails(season) {
  if (!season) return [];
  return [
    { id: "name", label: "Season Name", value: season.seasonName || "—" },
    {
      id: "start",
      label: "Start Date",
      value: season.seasonStartDate
        ? new Date(season.seasonStartDate).toLocaleDateString()
        : "—",
    },
    {
      id: "end",
      label: "End Date",
      value: season.seasonEndDate
        ? new Date(season.seasonEndDate).toLocaleDateString()
        : "—",
    },
    { id: "hidden", label: "Hidden", value: season.isHidden ? "Yes" : "No" },
    { id: "locked", label: "Locked", value: season.isLocked ? "Yes" : "No" },
    {
      id: "default",
      label: "Default Season",
      value: season.isDefault ? "Yes" : "No",
    },
    {
      id: "current",
      label: "Current Season",
      value: season.isCurrent ? "Yes" : "No",
    },
  ];
}

const toDateInputValue = (value) => {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

export default function Seasons() {
  const { isSuperAdmin, selectedCompanyId, companiesReady } =
    useCompanyContext();
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create | edit
  const [form, setForm] = useState(EMPTY_FORM);
  const [viewSeason, setViewSeason] = useState(null);
  const loadRequestIdRef = useRef(0);

  const normalizeSeason = (season) => ({
    _id: season?._id || season?.seasonId || "",
    seasonName: season?.seasonName || "",
    seasonStartDate: toDateInputValue(
      season?.startDate || season?.seasonStartDate || ""
    ),
    seasonEndDate: toDateInputValue(
      season?.endDate || season?.seasonEndDate || ""
    ),
    isHidden: season?.hidden ?? season?.isHidden ?? false,
    isLocked: season?.locked ?? season?.isLocked ?? false,
    isDefault: season?.isDefault ?? false,
    isCurrent: season?.isCurrent ?? false,
  });

  useEffect(() => {
    if (isSuperAdmin && (!companiesReady || !selectedCompanyId)) {
      return;
    }

    const requestId = ++loadRequestIdRef.current;
    let cancelled = false;

    const loadSeasons = async () => {
      setLoading(true);
      try {
        const response = await seasonAPI.getAll();
        if (cancelled || requestId !== loadRequestIdRef.current) return;

        const list = Array.isArray(response?.data) ? response.data : [];
        setSeasons(list.map(normalizeSeason));
      } catch (error) {
        if (cancelled || requestId !== loadRequestIdRef.current) return;
        console.error("Error loading seasons:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load seasons",
        });
      } finally {
        if (!cancelled && requestId === loadRequestIdRef.current) {
          setLoading(false);
        }
      }
    };

    loadSeasons();

    return () => {
      cancelled = true;
    };
  }, [isSuperAdmin, selectedCompanyId, companiesReady]);

  const reloadSeasons = async () => {
    const requestId = ++loadRequestIdRef.current;
    setLoading(true);
    try {
      const response = await seasonAPI.getAll();
      if (requestId !== loadRequestIdRef.current) return;

      const list = Array.isArray(response?.data) ? response.data : [];
      setSeasons(list.map(normalizeSeason));
    } catch (error) {
      if (requestId !== loadRequestIdRef.current) return;
      console.error("Error loading seasons:", error);
      Swal.fire({ icon: "error", title: "Error", text: "Failed to load seasons" });
    } finally {
      if (requestId === loadRequestIdRef.current) {
        setLoading(false);
      }
    }
  };

  const openCreateModal = () => {
    setModalMode("create");
    setForm(EMPTY_FORM);
    setShowSeasonModal(true);
  };

  const openEditModal = async (season) => {
    setModalMode("edit");
    setShowSeasonModal(true);
    setLoading(true);
    try {
      const response = await seasonAPI.getById(season._id);
      const details = normalizeSeason(response?.data || season);
      setForm({
        seasonId: details._id,
        seasonName: details.seasonName,
        seasonStartDate: details.seasonStartDate,
        seasonEndDate: details.seasonEndDate,
        isHidden: details.isHidden,
        isLocked: details.isLocked,
      });
    } catch {
      setForm({
        seasonId: season._id,
        seasonName: season.seasonName,
        seasonStartDate: season.seasonStartDate,
        seasonEndDate: season.seasonEndDate,
        isHidden: season.isHidden,
        isLocked: season.isLocked,
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!form.seasonName.trim()) {
      Swal.fire({ icon: "warning", title: "Validation Error", text: "Season name is required" });
      return false;
    }
    if (!form.seasonStartDate || !form.seasonEndDate) {
      Swal.fire({ icon: "warning", title: "Validation Error", text: "Start and end dates are required" });
      return false;
    }
    if (new Date(form.seasonStartDate) >= new Date(form.seasonEndDate)) {
      Swal.fire({ icon: "warning", title: "Validation Error", text: "End date must be after start date" });
      return false;
    }
    return true;
  };

  const submitSeason = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await seasonAPI.save({
        ...(form.seasonId ? { seasonId: form.seasonId } : {}),
        seasonName: form.seasonName.trim(),
        startDate: form.seasonStartDate,
        endDate: form.seasonEndDate,
        hidden: form.isHidden,
        locked: form.isLocked,
      });

      await reloadSeasons();
      setShowSeasonModal(false);
      setForm(EMPTY_FORM);

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: modalMode === "create" ? "Created" : "Updated",
        text:
          modalMode === "create"
            ? "Season created successfully"
            : "Season updated successfully",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error saving season:", error);
      Swal.fire({ icon: "error", title: "Error", text: "Failed to save season" });
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (seasonId, field) => {
    const season = seasons.find((s) => s._id === seasonId);
    if (!season) return;

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
      await seasonAPI.save({
        seasonId,
        seasonName: season.seasonName,
        startDate: season.seasonStartDate,
        endDate: season.seasonEndDate,
        hidden: field === "isHidden" ? !season.isHidden : season.isHidden,
        locked: field === "isLocked" ? !season.isLocked : season.isLocked,
      });
      await reloadSeasons();
    } catch (error) {
      console.error("Error updating status:", error);
      Swal.fire({ icon: "error", title: "Error", text: "Failed to update status" });
    } finally {
      setLoading(false);
    }
  };

  const setAsDefault = async (seasonId) => {
    setSeasons((prev) =>
      prev.map((s) => ({
        ...s,
        isDefault: s._id === seasonId,
      }))
    );
  };

  const handleDeleteSeason = async (seasonId) => {
    const confirmation = await Swal.fire({
      icon: "warning",
      title: "Delete Season?",
      text: "This action cannot be undone.",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#dc2626",
    });
    if (!confirmation.isConfirmed) return;

    setLoading(true);
    try {
      await seasonAPI.deleteById(seasonId);
      await reloadSeasons();
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Deleted",
        text: "Season deleted successfully.",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error deleting season:", error);
      Swal.fire({ icon: "error", title: "Error", text: "Failed to delete season" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <SetupTabHeader
        title="Seasons"
        description="Define league seasons with start and end dates. Control visibility, locking, and which season is active for your competitions."
      >
        <SetupPrimaryButton onClick={openCreateModal} icon={Plus}>
          Create season
        </SetupPrimaryButton>
      </SetupTabHeader>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading seasons...</div>
        ) : seasons.length === 0 ? (
          <div className="p-8 text-center">
            <span className="mx-auto mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#00ADE5]/10">
              <Calendar className="text-[#00ADE5]" size={28} />
            </span>
            <p className="font-medium text-gray-700">No seasons found</p>
            <button onClick={openCreateModal} className="mt-3 text-sm font-semibold text-[#00ADE5] hover:underline">
              Create your first season
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Season Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">End Date</th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Default</th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Details</th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {seasons.map((season) => (
                  <tr key={season._id} className={season.isCurrent ? "bg-blue-50/60" : "hover:bg-slate-50"}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-sm font-semibold text-gray-900">{season.seasonName}</span>
                        {season.isCurrent && (
                          <span className="ml-2 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                            Current
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {new Date(season.seasonStartDate).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {new Date(season.seasonEndDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => toggleStatus(season._id, "isHidden")}
                          className={`rounded p-1 hover:bg-gray-100 ${season.isHidden ? "text-orange-600" : "text-gray-400"}`}
                        >
                          {season.isHidden ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <button
                          onClick={() => toggleStatus(season._id, "isLocked")}
                          disabled={season.isCurrent && season.isLocked}
                          className={`rounded p-1 hover:bg-gray-100 ${season.isLocked ? "text-red-600" : "text-gray-400"} ${season.isCurrent && season.isLocked ? "cursor-not-allowed opacity-50" : ""}`}
                        >
                          {season.isLocked ? <Lock size={18} /> : <Unlock size={18} />}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {season.isDefault ? (
                        <Star className="inline-block text-yellow-500" size={18} fill="currentColor" />
                      ) : (
                        <button onClick={() => setAsDefault(season._id)} className="text-gray-400 hover:text-yellow-500">
                          <Star size={18} />
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <CountBadgeButton
                        count={getSeasonDetails(season).length}
                        icon={Calendar}
                        title="View season details"
                        allowZeroClick
                        onClick={() => setViewSeason(season)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => openEditModal(season)} className="rounded-md p-1 text-blue-600 hover:bg-blue-50">
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteSeason(season._id)}
                          className="rounded-md p-1 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={showSeasonModal}
        onClose={() => {
          setShowSeasonModal(false);
          setForm(EMPTY_FORM);
        }}
        panelClassName="max-w-xl"
        labelledBy="season-modal-title"
      >
            <div className="shrink-0 bg-gradient-to-r from-[#003366] to-[#004080] px-4 py-4 text-white sm:px-6 sm:py-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/20 sm:h-10 sm:w-10">
                    <Calendar size={20} />
                  </span>
                  <div className="min-w-0">
                    <h3 id="season-modal-title" className="text-lg font-bold sm:text-xl">
                      {modalMode === "create" ? "Create Season" : "Edit Season"}
                    </h3>
                    <p className="text-xs text-blue-100">
                      Add and manage season details in one place.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowSeasonModal(false);
                    setForm(EMPTY_FORM);
                  }}
                  className="rounded-lg p-2 text-white hover:bg-white/20"
                  aria-label="Close season modal"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="border-b bg-slate-50 px-4 py-3 sm:px-6">
              <h4 className="text-sm font-semibold text-gray-700">
                Season Information
              </h4>
            </div>

            <div className="grid grid-cols-1 gap-4 px-4 py-4 sm:px-6 sm:py-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Season Name *</label>
                <input
                  type="text"
                  value={form.seasonName}
                  onChange={(e) => setForm((prev) => ({ ...prev, seasonName: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
                  placeholder="e.g., Spring Season"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Start Date *</label>
                  <input
                    type="date"
                    value={form.seasonStartDate}
                    onChange={(e) => setForm((prev) => ({ ...prev, seasonStartDate: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">End Date *</label>
                  <input
                    type="date"
                    value={form.seasonEndDate}
                    onChange={(e) => setForm((prev) => ({ ...prev, seasonEndDate: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.isHidden}
                    onChange={(e) => setForm((prev) => ({ ...prev, isHidden: e.target.checked }))}
                  />
                  Hidden
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.isLocked}
                    onChange={(e) => setForm((prev) => ({ ...prev, isLocked: e.target.checked }))}
                  />
                  Locked
                </label>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                onClick={() => {
                  setShowSeasonModal(false);
                  setForm(EMPTY_FORM);
                }}
                className="w-full rounded-xl border-2 border-gray-300 px-5 py-2.5 font-semibold text-gray-700 hover:bg-gray-50 sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={submitSeason}
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#003366] to-[#004080] px-5 py-2.5 font-semibold text-white hover:from-[#002244] hover:to-[#003366] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                <Save size={16} />
                {modalMode === "create" ? "Create Season" : "Save Changes"}
              </button>
            </div>
      </Modal>

      <ListViewModal
        isOpen={Boolean(viewSeason)}
        onClose={() => setViewSeason(null)}
        title={viewSeason?.seasonName || "Season details"}
        subtitle="Season configuration overview"
        labelledBy="season-details-title"
        items={viewSeason ? getSeasonDetails(viewSeason) : []}
        emptyIcon={Calendar}
        emptyTitle="No season details"
        tableMode
        tableHeaders={["Property", "Value"]}
        renderItem={(row) => (
          <>
            <td className="px-4 py-3 font-medium text-gray-600">{row.label}</td>
            <td className="px-4 py-3 text-gray-900">{row.value}</td>
          </>
        )}
      />
    </div>
  );
}
