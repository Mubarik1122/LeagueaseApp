import React, { useState, useEffect, useRef } from "react";
import { Menu, Lock, Shield, Users, ClipboardList, Calendar, MapPin } from "lucide-react";
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
    icon: Users,
  },
  { id: "approval", label: "Approval and Locking", icon: Lock },
  { id: "match-officials", label: "Match officials and marks", icon: ClipboardList },
  { id: "player-role", label: "Player Role Active Dates", icon: Calendar },
  {
    id: "people-duplication",
    label: "People duplication and merge default criteria",
    icon: Users,
  },
  { id: "player-suspension", label: "Player suspension options", icon: Shield },
  { id: "venues", label: "Venues", icon: MapPin },
  { id: "match-file", label: "Match File Upload", icon: ClipboardList },
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
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
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
    }
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
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Success",
          text: "Settings saved successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
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
          "md:w-72 bg-white md:border-r md:border-gray-200",
          "transition-all duration-300 ease-in-out",
          isSideMenuOpen ? "block" : "hidden md:block"
        )}
      >
        <div className="p-5 space-y-3">
          <div>
            <div className="text-sm font-semibold text-gray-900">
              League Options
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              Configure how your league behaves
            </div>
          </div>
          {sideMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveMenuItem(item.id);
                setIsSideMenuOpen(false);
              }}
              className={clsx(
                "w-full text-left px-4 py-2.5 rounded-xl text-sm border transition-all duration-150",
                activeMenuItem === item.id
                  ? "bg-[#00ADE5]/10 text-[#00ADE5] border-[#00ADE5]/30 font-semibold"
                  : "bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-200 border-transparent"
              )}
            >
              <span className="flex items-center gap-3">
                {item.icon
                  ? React.createElement(item.icon, {
                      size: 16,
                      className: "shrink-0",
                    })
                  : null}
                <span className="leading-snug">{item.label}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 p-4 md:p-6">{renderContent()}</div>
    </div>
  );
}
