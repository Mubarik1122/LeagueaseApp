import React, { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import clsx from "clsx";
import Swal from "sweetalert2";
import ApprovalAndLocking from "./ApprovalAndLocking";
import MatchOfficialsAndMarks from "./MatchOfficialsAndMarks";
import PlayerRoleActiveDates from "./PlayerRoleActiveDates";
import PeopleDuplication from "./PeopleDuplication";
import PlayerSuspension from "./PlayerSuspension";
import Venues from "./Venues";
import MatchFileUpload from "./MatchFileUpload";

const sideMenuItems = [
  {
    id: "team-admin",
    label: "Team Admin Results and matches options",
  },
  { id: "approval", label: "Approval and Locking" },
  { id: "match-officials", label: "Match officials and marks" },
  { id: "player-role", label: "Player Role Active Dates" },
  {
    id: "people-duplication",
    label: "People duplication and merge default criteria",
  },
  { id: "player-suspension", label: "Player suspension options" },
  { id: "venues", label: "Venues" },
  { id: "match-file", label: "Match File Upload" },
];

export default function LeagueOptions() {
  const [activeMenuItem, setActiveMenuItem] = useState("team-admin");
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    blockTeamAdmins: false,
    allowStatsEntry: false,
    allowDivisionMatches: false,
    homeTeamOptions: {
      changeDate: false,
      changeTime: false,
      changeStatus: false,
      changeVenue: false,
    },
    awayTeamOptions: {
      changeDate: false,
      changeTime: false,
      changeStatus: false,
      changeVenue: false,
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/settings`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await response.json();
        if (result.errorCode === 0 && result.data) {
          setFormData((prev) => ({
            ...prev,
            ...result.data,
          }));
        } else {
          console.warn("Settings not found or error:", result.errorMessage);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };
    fetchSettings();
  }, []);

  const handleCheckboxChange = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleTeamOptionChange = (team, option) => {
    setFormData((prev) => ({
      ...prev,
      [`${team}Options`]: {
        ...prev[`${team}Options`],
        [option]: !prev[`${team}Options`][option],
      },
    }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.userId;

    const tabMapping = {
      "team-admin": "TeamAdminOptions",
      approval: "ApprovalAndLocking",
      "match-officials": "MatchOfficials",
      "player-role": "PlayerRoleActiveDates",
      "people-duplication": "PeopleDuplication",
      "player-suspension": "PlayerSuspension",
      venues: "Venues",
      "match-file": "MatchFileUpload",
    };

    const tab = tabMapping[activeMenuItem];
    if (!tab) return Swal.fire("Invalid Tab", "Invalid tab selected", "warning");

    const data = {
      blockTeamAdmins: formData.blockTeamAdmins,
      allowStatsEntry: formData.allowStatsEntry,
      allowDivisionMatches: formData.allowDivisionMatches,
      homeTeamOptions: { ...formData.homeTeamOptions },
      awayTeamOptions: { ...formData.awayTeamOptions },
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/settings/save`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            tab,
            data,
            userId,
          }),
        }
      );

      const result = await response.json();
      if (response.ok && result.errorCode === 0) {
        Swal.fire("Success", "Settings saved successfully.", "success");
      } else {
        Swal.fire(
          "Failed",
          result.errorMessage || "Something went wrong.",
          "error"
        );
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      Swal.fire("Network Error", "Unable to save settings.", "error");
    }
  };

  const renderContent = () => {
    switch (activeMenuItem) {
      case "approval":
        return <ApprovalAndLocking formData={formData} setFormData={setFormData} />;
      case "match-officials":
        return <MatchOfficialsAndMarks formData={formData} setFormData={setFormData} />;
      case "player-role":
        return <PlayerRoleActiveDates formData={formData} setFormData={setFormData} />;
      case "people-duplication":
        return <PeopleDuplication formData={formData} setFormData={setFormData} />;
      case "player-suspension":
        return <PlayerSuspension formData={formData} setFormData={setFormData} />;
      case "venues":
        return <Venues formData={formData} setFormData={setFormData} />;
      case "match-file":
        return <MatchFileUpload formData={formData} setFormData={setFormData} />;
      case "team-admin":
        return (
          <div className="text-gray-600">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Team Admin Results and matches options
            </h2>
            <div className="space-y-4">
              <label className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  checked={formData.blockTeamAdmins}
                  onChange={() => handleCheckboxChange("blockTeamAdmins")}
                />
                Block Team Admins from changing match status?
              </label>
              <label className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  checked={formData.allowStatsEntry}
                  onChange={() => handleCheckboxChange("allowStatsEntry")}
                />
                Allow stats entry for opposition team?
              </label>
              <label className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  checked={formData.allowDivisionMatches}
                  onChange={() => handleCheckboxChange("allowDivisionMatches")}
                />
                Allow creation of division matches?
              </label>
            </div>

            <div className="mt-6">
              <h3 className="font-medium mb-2">Home / Away Options</h3>
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th>Option</th>
                    <th>Home Team</th>
                    <th>Away Team</th>
                  </tr>
                </thead>
                <tbody>
                  {["changeDate", "changeTime", "changeStatus", "changeVenue"].map(
                    (option) => (
                      <tr key={option}>
                        <td>{option.replace("change", "Change ")}</td>
                        <td>
                          <input
                            type="checkbox"
                            checked={formData.homeTeamOptions[option]}
                            onChange={() => handleTeamOptionChange("homeTeam", option)}
                          />
                        </td>
                        <td>
                          <input
                            type="checkbox"
                            checked={formData.awayTeamOptions[option]}
                            onChange={() => handleTeamOptionChange("awayTeam", option)}
                          />
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Save Settings
              </button>
            </div>
          </div>
        );
      default:
        return <div className="p-4 text-gray-600">Content coming soon...</div>;
    }
  };

  return (
    <div className="flex flex-col md:flex-row">
      <div className="md:hidden p-4 border-b border-gray-200">
        <button
          onClick={() => setIsSideMenuOpen(!isSideMenuOpen)}
          className="flex items-center space-x-2 text-gray-600"
        >
          <Menu size={20} />
          <span>Menu</span>
        </button>
      </div>

      <div
        className={clsx(
          "md:w-64 md:border-r md:border-gray-200 bg-white",
          "transition-all duration-300 ease-in-out",
          isSideMenuOpen ? "block" : "hidden md:block"
        )}
      >
        <div className="p-4 space-y-1">
          {sideMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveMenuItem(item.id);
                setIsSideMenuOpen(false);
              }}
              className={clsx(
                "w-full text-left px-4 py-2 rounded-lg text-sm",
                activeMenuItem === item.id
                  ? "bg-gray-100 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 p-4 md:p-6">{renderContent()}</div>
    </div>
  );
}
