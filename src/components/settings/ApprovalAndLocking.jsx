import React, { useEffect, useState, useRef } from "react";
import { Info } from "lucide-react";
import Swal from "sweetalert2";

const ApprovalAndLocking = () => {
  const [formData, setFormData] = useState({
    lockMatchStats: false,
    approvalOption: "manualApproveAutoLock",
    enableLiveResults: false,
  });

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.userId;
  const hasFetched = useRef(false);

  // Fetch settings on component load
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      const fetchSettings = async () => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/settings`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const result = await res.json();

          if (result.errorCode === 0 && result.data) {
            // Pull flat values directly from settings object
            setFormData({
              lockMatchStats: result.data.lockMatchStats ?? false,
              approvalOption: result.data.approvalOption ?? "manualApproveAutoLock",
              enableLiveResults: result.data.enableLiveResults ?? false,
            });
          }
        } catch (err) {
          console.error("Error fetching settings:", err);
        }
      };

      fetchSettings();
    }
  }, []);

  // Save to backend
  const handleSave = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/settings/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tab: "ApprovalAndLocking",
          data: formData,
          userId,
        }),
      });

      const result = await res.json();

      if (res.ok && result.errorCode === 0) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Saved",
          text: "Settings saved successfully!",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire("Error", result.errorMessage || "Failed to save", "error");
      }
    } catch (err) {
      console.error("Save error:", err);
      Swal.fire("Error", "Network error", "error");
    }
  };

  return (
    <div className="border rounded-lg p-4 mb-6">
      <h2 className="text-xl font-medium text-gray-600 mb-4">
        Approval and Locking
      </h2>

      <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4">
        <div className="flex gap-3">
          <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center text-red-500">
            <Info size={20} strokeWidth={2} aria-hidden />
          </span>
          <p className="text-sm leading-relaxed text-gray-700">
            When a result is reported (scoreline and statistics) leagues have control over whether the result appears automatically or needs approval, and whether the stats can be locked.
          </p>
        </div>
      </div>

      {/* Lock Match Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 items-center">
        <div className="md:col-span-1 text-right text-gray-600 font-medium">
          Locking Match Statistics
        </div>
        <div className="md:col-span-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.lockMatchStats}
              onChange={(e) =>
                setFormData({ ...formData, lockMatchStats: e.target.checked })
              }
              className="mr-2 text-[#00ADE5]"
            />
            Allow match statistics to be locked - prevents further updates by Team Admins
          </label>
        </div>
      </div>

      <hr className="my-6" />

      {/* Approval Options */}
      <h3 className="text-gray-600 font-medium mb-4">
        Approval and Locking Scorelines (Match Statistics may be locked separately)
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2 items-start">
        <div className="md:col-span-1 text-right text-gray-600 font-medium">
          Options:
        </div>
        <div className="md:col-span-3 space-y-2">
          {[
            { value: "manualApproveAutoLock", label: "Manually approve scores, which also auto-locks scores" },
            { value: "manualApproveSeparateLock", label: "Manually approve scores, scores are locked separately" },
            { value: "autoApproveNoLock", label: "Auto-approve scores / cannot be locked" },
            { value: "autoApproveCanLock", label: "Auto-approve scores / can be locked" },
          ].map((opt) => (
            <label key={opt.value} className="flex items-start">
              <input
                type="radio"
                name="approvalOption"
                value={opt.value}
                checked={formData.approvalOption === opt.value}
                onChange={() =>
                  setFormData({ ...formData, approvalOption: opt.value })
                }
                className="mt-1 mr-2 text-[#00ADE5]"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {/* Live Results */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 items-center mt-4">
        <div className="md:col-span-1 text-right text-gray-600 font-medium">
          Live Results
        </div>
        <div className="md:col-span-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.enableLiveResults}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  enableLiveResults: e.target.checked,
                })
              }
              className="mr-2 text-[#00ADE5]"
            />
            Enable Live Results
          </label>
          <p className="text-sm text-gray-500 ml-6">
            Display live results on your site
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex gap-2">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-[#00ADE5] text-white rounded hover:bg-[#009acb] transition"
        >
          Update
        </button>
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default ApprovalAndLocking;
