import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, MapPin, ArrowLeft, Trash2, Edit, Save } from "lucide-react";
import Swal from "sweetalert2";
import { venueAPI } from "../services/api";

export default function VenueManagement() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("list");
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingVenue, setEditingVenue] = useState(null);

  const [venueForm, setVenueForm] = useState({
    venueId: null,
    venueName: "",
    addressLine1: "",
    addressLine2: "",
    addressLine3: "",
    townCity: "",
    county: "",
    state: "",
    postcode: "",
    telephone: "",
    mapLink: "",
    numberOfSubVenues: 0,
    directions: "",
    showOnVenuesPage: true,
  });

  // Get user ID from localStorage
  const getUserId = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.id || user._id || user.userId;
  };

  // Load venues on component mount
  useEffect(() => {
    loadVenues();
  }, []);

  const loadVenues = async () => {
    setLoading(true);
    try {
      const userId = getUserId();
      const response = await venueAPI.getDetails(userId);
      if (response.errorCode === 0 && response.data) {
        setVenues(Array.isArray(response.data) ? response.data : [response.data]);
      }
    } catch (error) {
      console.error("Error loading venues:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load venues",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVenue = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userId = getUserId();
      const venueData = {
        ...venueForm,
        userId: userId,
        venueId: editingVenue ? venueForm.venueId : null,
      };

      const response = await venueAPI.save(venueData);

      if (response.errorCode === 0) {
        Swal.fire({
          icon: "success",
          title: editingVenue ? "Venue Updated" : "Venue Created",
          text: `Venue has been ${editingVenue ? "updated" : "created"} successfully!`,
          timer: 2000,
          showConfirmButton: false,
        });

        // Reset form
        resetForm();
        setActiveTab("list");
        loadVenues();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.errorMessage || "Failed to save venue",
        });
      }
    } catch (error) {
      console.error("Error saving venue:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save venue",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditVenue = (venue) => {
    setVenueForm({
      venueId: venue._id || venue.id,
      venueName: venue.venueName || "",
      addressLine1: venue.addressLine1 || "",
      addressLine2: venue.addressLine2 || "",
      addressLine3: venue.addressLine3 || "",
      townCity: venue.townCity || "",
      county: venue.county || "",
      state: venue.state || "",
      postcode: venue.postcode || "",
      telephone: venue.telephone || "",
      mapLink: venue.mapLink || "",
      numberOfSubVenues: venue.numberOfSubVenues || 0,
      directions: venue.directions || "",
      showOnVenuesPage: venue.showOnVenuesPage ?? true,
    });
    setEditingVenue(venue);
    setActiveTab("form");
  };

  const handleDeleteVenue = async (venueId) => {
    const confirm = await Swal.fire({
      title: "Delete Venue?",
      text: "Are you sure you want to delete this venue? Teams using this venue may be affected.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      // Note: Add delete API when available
      Swal.fire({
        icon: "info",
        title: "Delete API Not Available",
        text: "Venue delete functionality will be available soon.",
      });
    }
  };

  const resetForm = () => {
    setVenueForm({
      venueId: null,
      venueName: "",
      addressLine1: "",
      addressLine2: "",
      addressLine3: "",
      townCity: "",
      county: "",
      state: "",
      postcode: "",
      telephone: "",
      mapLink: "",
      numberOfSubVenues: 0,
      directions: "",
      showOnVenuesPage: true,
    });
    setEditingVenue(null);
  };

  const filteredVenues = venues.filter((venue) =>
    venue.venueName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venue.townCity?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/admin/setup")}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 flex items-center">
              <MapPin className="mr-2" size={28} />
              Venue Management
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Create and manage venues for your league
            </p>
          </div>
        </div>
        {activeTab === "list" && (
          <button
            onClick={() => {
              resetForm();
              setActiveTab("form");
            }}
            className="px-4 py-2 bg-[#00ADE5] text-white rounded-md hover:bg-[#008FC5] flex items-center"
          >
            <Plus size={18} className="mr-1" />
            Add New Venue
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("list")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "list"
                  ? "border-[#009ACB] text-[#009ACB]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              All Venues ({filteredVenues.length})
            </button>
            <button
              onClick={() => {
                resetForm();
                setActiveTab("form");
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "form"
                  ? "border-[#009ACB] text-[#009ACB]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {editingVenue ? "Edit Venue" : "Add New Venue"}
            </button>
          </nav>
        </div>
      </div>

      {/* Venues List Tab */}
      {activeTab === "list" && (
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
                placeholder="Search venues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
              />
            </div>
          </div>

          {/* Venues List */}
          <div className="p-4">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading venues...</div>
            ) : filteredVenues.length === 0 ? (
              <div className="text-center py-8">
                <MapPin size={48} className="mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500">
                  {searchTerm ? "No venues found matching your search" : "No venues created yet"}
                </p>
                <button
                  onClick={() => setActiveTab("form")}
                  className="mt-4 px-4 py-2 bg-[#00ADE5] text-white rounded-md hover:bg-[#008FC5]"
                >
                  <Plus size={16} className="inline mr-1" />
                  Create First Venue
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVenues.map((venue) => (
                  <div
                    key={venue._id || venue.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <MapPin className="text-[#00ADE5] mr-2" size={20} />
                        <h3 className="font-semibold text-gray-900">{venue.venueName}</h3>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditVenue(venue)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteVenue(venue._id || venue.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      {venue.addressLine1 && <p>{venue.addressLine1}</p>}
                      {venue.townCity && <p>{venue.townCity}</p>}
                      {venue.postcode && <p>{venue.postcode}</p>}
                      {venue.telephone && (
                        <p className="flex items-center text-gray-500 mt-2">
                          📞 {venue.telephone}
                        </p>
                      )}
                    </div>

                    {venue.showOnVenuesPage && (
                      <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Visible on public page
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Venue Form Tab */}
      {activeTab === "form" && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-6">
            {editingVenue ? "Edit Venue" : "Create New Venue"}
          </h2>
          <form onSubmit={handleCreateVenue} className="space-y-6">
            {/* Venue Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Venue Name *
              </label>
              <input
                type="text"
                required
                value={venueForm.venueName}
                onChange={(e) => setVenueForm({ ...venueForm, venueName: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
                placeholder="Enter venue name"
              />
            </div>

            {/* Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Line 1
                </label>
                <input
                  type="text"
                  value={venueForm.addressLine1}
                  onChange={(e) => setVenueForm({ ...venueForm, addressLine1: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
                  placeholder="Street address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Line 2
                </label>
                <input
                  type="text"
                  value={venueForm.addressLine2}
                  onChange={(e) => setVenueForm({ ...venueForm, addressLine2: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
                  placeholder="Apartment, suite, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Town/City
                </label>
                <input
                  type="text"
                  value={venueForm.townCity}
                  onChange={(e) => setVenueForm({ ...venueForm, townCity: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
                  placeholder="City name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State/County
                </label>
                <input
                  type="text"
                  value={venueForm.state}
                  onChange={(e) => setVenueForm({ ...venueForm, state: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
                  placeholder="State or county"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postcode/ZIP
                </label>
                <input
                  type="text"
                  value={venueForm.postcode}
                  onChange={(e) => setVenueForm({ ...venueForm, postcode: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
                  placeholder="Postal code"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telephone
                </label>
                <input
                  type="tel"
                  value={venueForm.telephone}
                  onChange={(e) => setVenueForm({ ...venueForm, telephone: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
                  placeholder="Contact number"
                />
              </div>
            </div>

            {/* Map Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Map Link (Google Maps URL)
              </label>
              <input
                type="url"
                value={venueForm.mapLink}
                onChange={(e) => setVenueForm({ ...venueForm, mapLink: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
                placeholder="https://maps.google.com/..."
              />
            </div>

            {/* Directions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Directions
              </label>
              <textarea
                value={venueForm.directions}
                onChange={(e) => setVenueForm({ ...venueForm, directions: e.target.value })}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
                placeholder="How to get to the venue..."
              />
            </div>

            {/* Options */}
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={venueForm.showOnVenuesPage}
                  onChange={(e) =>
                    setVenueForm({ ...venueForm, showOnVenuesPage: e.target.checked })
                  }
                  className="h-4 w-4 text-[#00ADE5] focus:ring-[#00ADE5] border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Show this venue on public venues page
                </span>
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-4 border-t">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setActiveTab("list");
                }}
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
                  "Saving..."
                ) : (
                  <>
                    <Save size={18} className="mr-1" />
                    {editingVenue ? "Update Venue" : "Create Venue"}
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
