import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

const MatchOfficialsAndMarks = () => {
  const [enableRefereeMarks, setEnableRefereeMarks] = useState(false);
  const [allowAssistantMarks, setAllowAssistantMarks] = useState(false);
  const [maxOfficials, setMaxOfficials] = useState("3");

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.userId;

  // ✅ Fetch settings on mount
  useEffect(() => {
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
          setEnableRefereeMarks(result.data.enableRefereeMarks ?? false);
          setAllowAssistantMarks(result.data.allowAssistantMarks ?? false);
          setMaxOfficials(result.data.maxOfficials?.toString() ?? "3");
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      }
    };

    fetchSettings();
  }, []);

  // ✅ Save handler
  const handleSave = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/settings/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tab: "MatchOfficials", // this should match your backend tab identifier
          userId,
          data: {
            enableRefereeMarks,
            allowAssistantMarks,
            maxOfficials: Number(maxOfficials),
          },
        }),
      });

      const result = await res.json();

      if (res.ok && result.errorCode === 0) {
        Swal.fire("Saved", "Settings saved successfully!", "success");
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
        Match officials and marks
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 items-start">
        <div className="md:col-span-1 text-right text-gray-600 font-medium">
          Do you want to assign referees / officials to matches?
        </div>
        <div className="md:col-span-3">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center">
              <div className="h-4 w-4 rounded-full bg-[#00ADE5] mr-2 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-white"></div>
              </div>
              <span className="text-gray-700">Currently disabled</span>
            </div>
            <a href="#" className="text-red-500 hover:underline">
              To enable or disable please check or uncheck the referee role in
              the roles maintenance page
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 items-center">
        <div className="md:col-span-1 text-right text-gray-600 font-medium">
          Maximum number of match officials per match
        </div>
        <div className="md:col-span-3">
          <select
            className="rounded-md border-gray-300 shadow-sm focus:border-[#00ADE5] focus:ring focus:ring-[#00ADE5] focus:ring-opacity-50"
            value={maxOfficials}
            onChange={(e) => setMaxOfficials(e.target.value)}
          >
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-gray-600 font-medium mb-4">Referee Marks</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 items-start">
        <div className="md:col-span-1 text-right text-gray-600 font-medium">
          Record referee marks
        </div>
        <div className="md:col-span-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded text-[#00ADE5] focus:ring-[#00ADE5] mr-2"
              checked={enableRefereeMarks}
              onChange={(e) => setEnableRefereeMarks(e.target.checked)}
            />
            <span className="text-gray-700">Enable referee marks system</span>
          </label>
          <p className="text-sm text-gray-500 ml-6">
            Referee marks can be entered to track the quality of referees in
            matches
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 items-start">
        <div className="md:col-span-1 text-right text-gray-600 font-medium">
          Record marks for assistant referees
        </div>
        <div className="md:col-span-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded text-[#00ADE5] focus:ring-[#00ADE5] mr-2"
              checked={allowAssistantMarks}
              onChange={(e) => setAllowAssistantMarks(e.target.checked)}
            />
            <span className="text-gray-700">
              Allow marks for assistant referees
            </span>
          </label>
          <p className="text-sm text-gray-500 ml-6">
            Marks to be entered for up to three assistant referees if these
            officials have been assigned to the match
          </p>
        </div>
      </div>

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

export default MatchOfficialsAndMarks;
