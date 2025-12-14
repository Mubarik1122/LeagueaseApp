import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Users, ArrowLeft, Trash2, Edit, MapPin } from "lucide-react";
import Swal from "sweetalert2";
import { teamAPI, tournamentAPI, venueAPI } from "../services/api";

export default function Teams() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("existing");
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState("");
  const [teams, setTeams] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [newTeam, setNewTeam] = useState({
    teamName: "",
    displayName: "",
    shortCode: "",
    logo: null,
    venueIds: [],
    about: "",
    isArchived: false,
  });

  // Get user ID from localStorage
  const getUserId = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.id || user._id || user.userId;
  };

  // Load tournaments and venues on component mount
  useEffect(() => {
    loadTournaments();
    loadVenues();
  }, []);

  // Load teams when tournament is selected
  useEffect(() => {
    if (selectedTournament) {
      loadTeams();
    }
  }, [selectedTournament]);

  const loadTournaments = async () => {
    try {
      const userId = getUserId();
      const response = await tournamentAPI.getByUserId(userId);
      if (response.errorCode === 0 && response.data) {
        setTournaments(response.data);
        if (response.data.length > 0) {
          setSelectedTournament(response.data[0]._id || response.data[0].id);
        }
      }
    } catch (error) {
      console.error("Error loading tournaments:", error);
    }
  };

  const loadVenues = async () => {
    try {
      const userId = getUserId();
      const response = await venueAPI.getDetails(userId);
      if (response.errorCode === 0 && response.data) {
        setVenues(Array.isArray(response.data) ? response.data : [response.data]);
      }
    } catch (error) {
      console.error("Error loading venues:", error);
    }
  };

  const loadTeams = async () => {
    if (!selectedTournament) return;

    setLoading(true);
    try {
      const userId = getUserId();
      const response = await teamAPI.getByUserIdAndTournamentId(userId, selectedTournament);
      if (response.errorCode === 0 && response.data) {
        setTeams(response.data);
      }
    } catch (error) {
      console.error("Error loading teams:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load teams",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();

    if (!selectedTournament) {
      Swal.fire({
        icon: "warning",
        title: "Select Tournament",
        text: "Please select a tournament first",
      });
      return;
    }

    if (!newTeam.venueIds || newTeam.venueIds.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Select Venue",
        text: "Please select at least one venue for the team",
      });
      return;
    }

    setLoading(true);
    try {
      const userId = getUserId();
      const teamData = {
        teamId: null,
        userId: userId,
        tournamentId: selectedTournament,
        ...newTeam,
      };

      const response = await teamAPI.save(teamData);

      if (response.errorCode === 0) {
        Swal.fire({
          icon: "success",
          title: "Team Created",
          text: "Team has been created successfully!",
          timer: 2000,
          showConfirmButton: false,
        });

        // Reset form
        setNewTeam({
          teamName: "",
          displayName: "",
          shortCode: "",
          logo: null,
          venueIds: [],
          about: "",
          isArchived: false,
        });

        // Reload teams
        loadTeams();
        setActiveTab("existing");
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.errorMessage || "Failed to create team",
        });
      }
    } catch (error) {
      console.error("Error creating team:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to create team",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    const confirm = await Swal.fire({
      title: "Delete Team?",
      text: "Are you sure you want to delete this team?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      // Implement delete functionality when API is available
      Swal.fire("Deleted!", "Team has been deleted.", "success");
      loadTeams();
    }
  };

  const filteredTeams = teams.filter((team) =>
    team.teamName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <Users className="mr-2" size={28} />
              Manage Teams
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Add and manage teams for your tournaments
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
          onChange={(e) => setSelectedTournament(e.target.value)}
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

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("existing")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "existing"
                  ? "border-[#009ACB] text-[#009ACB]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Existing Teams ({filteredTeams.length})
            </button>
            <button
              onClick={() => setActiveTab("create")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "create"
                  ? "border-[#009ACB] text-[#009ACB]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Create New Team
            </button>
          </nav>
        </div>
      </div>

      {/* Existing Teams Tab */}
      {activeTab === "existing" && (
        <div className="bg-white rounded-lg shadow">
          {/* Search */}
          <div className="p-4 border-b">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
              />
            </div>
          </div>

          {/* Teams List */}
          <div className="p-4">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading teams...</div>
            ) : filteredTeams.length === 0 ? (
              <div className="text-center py-8">
                <Users size={48} className="mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500">
                  {searchTerm ? "No teams found matching your search" : "No teams added yet"}
                </p>
                <button
                  onClick={() => setActiveTab("create")}
                  className="mt-4 px-4 py-2 bg-[#00ADE5] text-white rounded-md hover:bg-[#008FC5]"
                >
                  <Plus size={16} className="inline mr-1" />
                  Create First Team
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Team Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Display Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Short Code
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeams.map((team) => (
                      <tr key={team._id || team.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{team.teamName}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{team.displayName}</td>
                        <td className="px-4 py-3 text-gray-600">{team.shortCode}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              team.isArchived
                                ? "bg-gray-100 text-gray-600"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {team.isArchived ? "Archived" : "Active"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                // Implement edit functionality
                                Swal.fire("Info", "Edit functionality coming soon", "info");
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteTeam(team._id || team.id)}
                              className="text-red-600 hover:text-red-800"
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
        </div>
      )}

      {/* Create New Team Tab */}
      {activeTab === "create" && (
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleCreateTeam} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Team Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Name *
                </label>
                <input
                  type="text"
                  required
                  value={newTeam.teamName}
                  onChange={(e) => setNewTeam({ ...newTeam, teamName: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
                  placeholder="Enter team name"
                />
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={newTeam.displayName}
                  onChange={(e) => setNewTeam({ ...newTeam, displayName: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
                  placeholder="Enter display name"
                />
              </div>

              {/* Short Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Code *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={newTeam.shortCode}
                  onChange={(e) => setNewTeam({ ...newTeam, shortCode: e.target.value.toUpperCase() })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
                  placeholder="e.g., MUN"
                />
              </div>

              {/* Venue Selection */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Home Venue(s) *
                </label>
                {venues.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <p className="text-sm text-yellow-800">
                      No venues available. Please create a venue first.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate("/admin/venues")}
                      className="mt-2 text-sm text-blue-600 hover:underline"
                    >
                      Go to Venue Management
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {venues.map((venue) => (
                      <label
                        key={venue._id || venue.id}
                        className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={newTeam.venueIds.includes(venue._id || venue.id)}
                          onChange={(e) => {
                            const venueId = venue._id || venue.id;
                            if (e.target.checked) {
                              setNewTeam({
                                ...newTeam,
                                venueIds: [...newTeam.venueIds, venueId],
                              });
                            } else {
                              setNewTeam({
                                ...newTeam,
                                venueIds: newTeam.venueIds.filter((id) => id !== venueId),
                              });
                            }
                          }}
                          className="h-4 w-4 text-[#00ADE5] focus:ring-[#00ADE5] border-gray-300 rounded"
                        />
                        <div className="ml-3">
                          <div className="flex items-center">
                            <MapPin size={16} className="text-gray-400 mr-1" />
                            <span className="text-sm font-medium text-gray-900">
                              {venue.venueName}
                            </span>
                          </div>
                          {venue.townCity && (
                            <span className="text-xs text-gray-500">
                              {venue.townCity}
                            </span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Select one or more venues where this team plays home matches
                </p>
              </div>
            </div>

            {/* About */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                About (Optional)
              </label>
              <textarea
                value={newTeam.about}
                onChange={(e) => setNewTeam({ ...newTeam, about: e.target.value })}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
                placeholder="Enter team description"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setActiveTab("existing")}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-[#00ADE5] text-white rounded-md hover:bg-[#008FC5] disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  "Creating..."
                ) : (
                  <>
                    <Plus size={18} className="mr-1" />
                    Create Team
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
