import { useState } from "react";
import { X, Trophy, CheckCircle2, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import { useTournament } from "../hooks/useTournament";
import Modal from "./Modal";

export default function CreateDivisionModal({ isOpen, onClose, onSuccess }) {
  const { saveTournament } = useTournament();
  const [loading, setLoading] = useState(false);
  const [divisionName, setDivisionName] = useState("");
  const [shortCode, setShortCode] = useState("");

  const shortCodeFromName = (name) => {
    const slug = name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 10);
    return slug || "DIV1";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = divisionName.trim();
    const code = shortCode.trim() || shortCodeFromName(name);
    if (!name) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "warning",
        title: "Name Required",
        text: "Please enter a division name.",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user?.userId;
    if (!userId) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Error",
        text: "User ID not found. Please login again.",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    setLoading(true);
    try {
      const result = await saveTournament({
        userId,
        divisionOrTournamentType: "Division",
        divisionOrtournamentName: name,
        sequence: 0,
        shortCode: code,
        scoringSystem: null,
        promotionZone: 0,
        relegationZone: 0,
        positionHighlights: "auto",
        hideMatchesFrom: null,
        hideStandings: false,
        hidePlayers: false,
        hideScore: false,
        hideVenue: false,
      });

      if (result.success) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Created",
          text: "Division created successfully.",
          timer: 2000,
          showConfirmButton: false,
        });

        setDivisionName("");
        setShortCode("");
        onSuccess?.();
        onClose?.();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: result.error || "Failed to create division",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.message || "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      panelClassName="max-w-xl"
      labelledBy="create-division-title"
    >
        <div className="shrink-0 bg-gradient-to-r from-[#003366] to-[#004080] px-4 py-4 text-white sm:px-6 sm:py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <div className="shrink-0 rounded-lg bg-white/20 p-2 backdrop-blur-sm">
                <Trophy className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <h2 id="create-division-title" className="text-xl font-bold sm:text-2xl">
                  Create Division
                </h2>
                <p className="mt-0.5 text-xs text-blue-100 sm:text-sm">
                  Division name enter karein aur create karein
                </p>
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

        <div className="px-4 py-4 sm:px-6 sm:py-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Division name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={divisionName}
                onChange={(e) => setDivisionName(e.target.value)}
                required
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00ADE5] focus:ring-2 focus:ring-[#00ADE5]/20 transition-all duration-100 bg-gray-50 hover:bg-white"
                placeholder="e.g., Division 1"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Short code
              </label>
              <input
                type="text"
                value={shortCode}
                onChange={(e) => setShortCode(e.target.value.toUpperCase())}
                maxLength={20}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:border-[#00ADE5] focus:ring-2 focus:ring-[#00ADE5]/20 transition-all duration-100 bg-gray-50 hover:bg-white"
                placeholder="e.g., DIV1 (auto if empty)"
              />
              <p className="mt-1 text-xs text-gray-500">
                Letters and numbers only; used as a quick reference on schedules
                and standings.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl border-2 border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-all duration-100 hover:border-gray-400 hover:bg-gray-50 sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#003366] to-[#004080] px-6 py-3 font-semibold text-white shadow-lg transition-all duration-100 hover:from-[#002244] hover:to-[#003366] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={20} />
                    Create Division
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
    </Modal>
  );
}

