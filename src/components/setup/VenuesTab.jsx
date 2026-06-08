import { useEffect, useRef, useState } from "react";
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Users,
} from "lucide-react";
import Swal from "sweetalert2";
import Modal from "../Modal";
import {
  CountBadgeButton,
  ListViewModal,
  ListItemCard,
} from "./CountViewModal";
import SetupTabHeader, { SetupPrimaryButton } from "./SetupTabHeader";
import { useVenue } from "../../hooks/useVenue";
import { venueAPI } from "../../services/api";
import { useCompanyContext } from "../../context/CompanyContext";

function getVenueTeams(venue) {
  if (!venue || typeof venue !== "object") return [];
  const raw =
    venue.teamsPlayingAtVenue ??
    venue.teamsUsuallyPlayingAtVenue ??
    venue.usualTeams ??
    venue.teamsPlayingHere ??
    venue.teamsAtVenue;

  if (raw == null || raw === "") return [];

  if (Array.isArray(raw)) {
    return raw
      .map((team, index) => {
        if (typeof team === "string") {
          const name = team.trim();
          return name ? { id: `${index}-${name}`, name } : null;
        }
        const name = team?.teamName ?? team?.name ?? "";
        const id = team?._id ?? team?.id ?? team?.teamId ?? `${index}-${name}`;
        return name ? { id: String(id), name: String(name) } : null;
      })
      .filter(Boolean);
  }

  return String(raw)
    .split(",")
    .map((name, index) => {
      const trimmed = name.trim();
      return trimmed ? { id: `${index}-${trimmed}`, name: trimmed } : null;
    })
    .filter(Boolean);
}

function formatTeamsUsuallyPlayingAtVenue(venue) {
  const teams = getVenueTeams(venue);
  return teams.length ? teams.map((team) => team.name).join(", ") : "—";
}

function isGoogleMapsSetUp(venue) {
  const link = String(venue?.mapLink ?? venue?.googleMapsLink ?? "").trim();
  return link.length > 0;
}

function formatAddress(venue) {
  if (!venue) return "—";
  const parts = [
    venue.addressLine1,
    venue.addressLine2,
    venue.addressLine3,
    venue.townCity,
    venue.county,
    venue.state,
    venue.postcode,
  ]
    .map((p) => (p != null ? String(p).trim() : ""))
    .filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
}

function DetailRow({ label, value, className = "" }) {
  const display =
    value == null || value === "" ? (
      <span className="text-gray-400">—</span>
    ) : (
      value
    );
  return (
    <div className={className}>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-sm text-gray-900 break-words">{display}</p>
    </div>
  );
}

export default function VenuesTab() {
  const { isSuperAdmin, selectedCompanyId, companiesReady } =
    useCompanyContext();
  const { venues, loading, fetchVenues, saveVenue, deleteVenue } = useVenue();
  const autocompleteServiceRef = useRef(null);
  const debounceRef = useRef(null);
  const loadRequestIdRef = useRef(0);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewVenue, setViewVenue] = useState(null);
  const [teamsViewVenue, setTeamsViewVenue] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [mode, setMode] = useState("create"); // create | edit
  const [mapsReady, setMapsReady] = useState(false);
  const [venueSuggestions, setVenueSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [form, setForm] = useState({
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
    teamsPlayingAtVenue: "",
    showOnVenuesPage: true,
  });

  const getUserId = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user?.userId || user?._id || user?.id;
  };

  useEffect(() => {
    if (isSuperAdmin && (!companiesReady || !selectedCompanyId)) {
      return;
    }

    const userId = getUserId();
    if (!userId) return;

    const requestId = ++loadRequestIdRef.current;
    let cancelled = false;

    const loadVenues = async () => {
      await fetchVenues(userId);
      if (cancelled || requestId !== loadRequestIdRef.current) return;
    };

    loadVenues();

    return () => {
      cancelled = true;
    };
  }, [isSuperAdmin, selectedCompanyId, companiesReady]);

  useEffect(() => {
    if (!showModal) return;

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return;

    const initializeAutocomplete = () => {
      if (
        window.google?.maps?.places?.AutocompleteService &&
        !autocompleteServiceRef.current
      ) {
        autocompleteServiceRef.current =
          new window.google.maps.places.AutocompleteService();
      }
      if (window.google?.maps?.places?.AutocompleteService) {
        setMapsReady(true);
      }
    };

    if (window.google?.maps?.places) {
      initializeAutocomplete();
      return;
    }

    const existingScript = document.getElementById("google-maps-places-script");
    if (existingScript) {
      existingScript.addEventListener("load", initializeAutocomplete);
      return () =>
        existingScript.removeEventListener("load", initializeAutocomplete);
    }

    const script = document.createElement("script");
    script.id = "google-maps-places-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", initializeAutocomplete);
    document.body.appendChild(script);

    return () => {
      script.removeEventListener("load", initializeAutocomplete);
    };
  }, [showModal]);

  useEffect(() => {
    if (!showModal || !mapsReady) return;
    const input = form.venueName?.trim();

    if (!input || input.length < 2) {
      setVenueSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      autocompleteServiceRef.current?.getPlacePredictions(
        {
          input,
          types: ["establishment"],
        },
        (predictions, status) => {
          const isOk = status === window.google?.maps?.places?.PlacesServiceStatus?.OK;
          if (!isOk || !Array.isArray(predictions)) {
            setVenueSuggestions([]);
            setShowSuggestions(false);
            return;
          }
          setVenueSuggestions(predictions.slice(0, 6));
          setShowSuggestions(true);
        }
      );
    }, 250);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [form.venueName, mapsReady, showModal]);

  const resetForm = () => {
    setForm({
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
      teamsPlayingAtVenue: "",
      showOnVenuesPage: true,
    });
  };

  const openCreate = () => {
    setMode("create");
    resetForm();
    setShowModal(true);
    setVenueSuggestions([]);
    setShowSuggestions(false);
  };

  const openView = async (venue) => {
    const venueId = venue._id || venue.venueId;
    const userId = getUserId();
    setShowViewModal(true);
    setViewVenue(venue);
    setViewLoading(true);

    if (venueId && userId) {
      try {
        const response = await venueAPI.getDetails(userId, venueId);
        if (response.errorCode === 0 && response.data) {
          const data = Array.isArray(response.data)
            ? response.data[0]
            : response.data;
          if (data) setViewVenue(data);
        }
      } catch {
        // Keep list row data if fetch fails
      }
    }
    setViewLoading(false);
  };

  const closeView = () => {
    setShowViewModal(false);
    setViewVenue(null);
    setViewLoading(false);
  };

  const openEdit = (venue) => {
    closeView();
    setMode("edit");
    setForm({
      venueId: venue._id || venue.venueId || null,
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
      numberOfSubVenues: venue.numberOfSubVenues ?? 0,
      directions: venue.directions || "",
      teamsPlayingAtVenue: venue.teamsPlayingAtVenue ?? "",
      showOnVenuesPage: venue.showOnVenuesPage ?? true,
    });
    setShowModal(true);
    setVenueSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSubmit = async () => {
    if (!form.venueName.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Venue name is required",
      });
      return;
    }

    const userId = getUserId();
    if (!userId) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "User ID not found. Please login again.",
      });
      return;
    }

    const payload = {
      ...(form.venueId ? { venueId: form.venueId } : {}),
      userId,
      venueName: form.venueName.trim(),
      addressLine1: form.addressLine1 || null,
      addressLine2: form.addressLine2 || null,
      addressLine3: form.addressLine3 || null,
      townCity: form.townCity || null,
      county: form.county || null,
      state: form.state || null,
      postcode: form.postcode || null,
      telephone: form.telephone || null,
      mapLink: form.mapLink || null,
      numberOfSubVenues: Number(form.numberOfSubVenues) || 0,
      directions: form.directions || null,
      teamsPlayingAtVenue: form.teamsPlayingAtVenue?.trim() || null,
      showOnVenuesPage: form.showOnVenuesPage,
    };

    const result = await saveVenue(payload);
    if (result.success) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: mode === "create" ? "Created" : "Updated",
        text:
          mode === "create"
            ? "Venue created successfully."
            : "Venue updated successfully.",
        timer: 1800,
        showConfirmButton: false,
      });
      setShowModal(false);
      resetForm();
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: result.error || "Failed to save venue",
      });
    }
  };

  const handleDelete = async (venue) => {
    const venueId = venue._id || venue.venueId;
    const userId = getUserId();
    if (!venueId || !userId) return;

    const confirmation = await Swal.fire({
      icon: "warning",
      title: "Delete Venue?",
      text: "Are you sure you want to delete Venue?",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#dc2626",
    });
    if (!confirmation.isConfirmed) return;

    const result = await deleteVenue(venueId, userId);
    if (result.success) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Deleted",
        text: "Venue deleted successfully.",
        timer: 1800,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: result.error || "Failed to delete venue",
      });
    }
  };

  const getEmbeddableMapUrl = (url) => {
    if (!url) return "";
    const trimmed = String(url).trim();
    if (trimmed.includes("/maps/embed")) return trimmed;

    // Handle normal Google Maps links by extracting a meaningful query.
    if (trimmed.includes("google.com/maps") || trimmed.includes("goo.gl/maps")) {
      try {
        const parsed = new URL(trimmed);

        // Prefer explicit q/query params.
        const qParam =
          parsed.searchParams.get("q") ||
          parsed.searchParams.get("query") ||
          parsed.searchParams.get("destination");
        if (qParam) {
          return `https://maps.google.com/maps?q=${encodeURIComponent(
            qParam
          )}&output=embed`;
        }

        // Try /place/<name> pattern.
        const placeMatch = parsed.pathname.match(/\/place\/([^/]+)/i);
        if (placeMatch?.[1]) {
          const place = decodeURIComponent(placeMatch[1]).replace(/\+/g, " ");
          return `https://maps.google.com/maps?q=${encodeURIComponent(
            place
          )}&output=embed`;
        }

        // Try @lat,lng pattern.
        const latLngMatch = parsed.pathname.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
        if (latLngMatch?.[1] && latLngMatch?.[2]) {
          const latLng = `${latLngMatch[1]},${latLngMatch[2]}`;
          return `https://maps.google.com/maps?q=${encodeURIComponent(
            latLng
          )}&output=embed`;
        }
      } catch {
        // Fall through to generic handling below.
      }

      // Generic safe fallback for Google Maps links.
      return `https://maps.google.com/maps?q=${encodeURIComponent(
        trimmed
      )}&output=embed`;
    }

    // Non-Google link: try to embed as-is.
    return trimmed;
  };

  const mapPreviewUrl = getEmbeddableMapUrl(form.mapLink);

  return (
    <div className="space-y-6">
      <SetupTabHeader
        title="Venues"
        description="Create and manage grounds and facilities for your league. Link venues to teams and use them when scheduling matches."
      >
        <SetupPrimaryButton onClick={openCreate} icon={Plus}>
          Create venue
        </SetupPrimaryButton>
      </SetupTabHeader>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading venues...</div>
        ) : !Array.isArray(venues) || venues.length === 0 ? (
          <div className="p-8 text-center">
            <span className="mx-auto mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#00ADE5]/10">
              <MapPin className="text-[#00ADE5]" size={28} />
            </span>
            <p className="font-medium text-gray-700">No Record found.</p>
            <button
              onClick={openCreate}
              className="mt-3 text-sm font-semibold text-[#00ADE5] hover:underline"
            >
              Create your first venue
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Venue Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    City
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Teams
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                    Show On Venues Page?
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                    Google Maps Set Up?
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {venues.map((venue) => (
                  <tr key={venue._id || venue.venueId} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {venue.venueName || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {venue.townCity || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {venue.telephone || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <CountBadgeButton
                        count={getVenueTeams(venue).length}
                        icon={Users}
                        title="View teams at this venue"
                        onClick={() => setTeamsViewVenue(venue)}
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      {venue.showOnVenuesPage ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                          <Eye size={12} />
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                          <EyeOff size={12} />
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {isGoogleMapsSetUp(venue) ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-800">
                          <CheckCircle2 size={14} />
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs text-amber-800">
                          <XCircle size={14} />
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => openView(venue)}
                          className="rounded-md p-1.5 text-[#003366] transition hover:bg-[#003366]/10"
                          title="View venue details"
                          aria-label={`View ${venue.venueName || "venue"}`}
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(venue)}
                          className="rounded-md p-1.5 text-blue-600 transition hover:bg-blue-50"
                          title="Edit venue"
                          aria-label={`Edit ${venue.venueName || "venue"}`}
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(venue)}
                          className="rounded-md p-1.5 text-red-600 transition hover:bg-red-50"
                          title="Delete venue"
                          aria-label={`Delete ${venue.venueName || "venue"}`}
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

      {viewVenue && (
        <Modal
          isOpen={showViewModal}
          onClose={closeView}
          innerScroll
          panelClassName="flex max-w-2xl flex-col"
          labelledBy="venue-view-title"
        >
            <div className="shrink-0 bg-gradient-to-r from-[#003366] to-[#004080] px-4 py-4 text-white sm:px-6 sm:py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20">
                    <MapPin size={20} />
                  </span>
                  <div>
                    <h3 id="venue-view-title" className="text-xl font-bold">
                      {viewVenue.venueName || "Venue Details"}
                    </h3>
                    <p className="text-xs text-blue-100">
                      Read-only venue information
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeView}
                  className="rounded-lg p-2 text-white hover:bg-white/20"
                  aria-label="Close venue details"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {viewLoading ? (
              <div className="p-12 text-center text-gray-500">
                Loading venue details...
              </div>
            ) : (
              <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5 md:grid-cols-3">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:col-span-2">
                  <DetailRow label="Venue Name" value={viewVenue.venueName} className="sm:col-span-2" />
                  <DetailRow label="Address" value={formatAddress(viewVenue)} className="sm:col-span-2" />
                  <DetailRow label="Address Line 1" value={viewVenue.addressLine1} />
                  <DetailRow label="Address Line 2" value={viewVenue.addressLine2} />
                  <DetailRow label="Address Line 3" value={viewVenue.addressLine3} />
                  <DetailRow label="City" value={viewVenue.townCity} />
                  <DetailRow label="County" value={viewVenue.county} />
                  <DetailRow label="State" value={viewVenue.state} />
                  <DetailRow label="Postcode" value={viewVenue.postcode} />
                  <DetailRow label="Telephone" value={viewVenue.telephone} />
                  <DetailRow
                    label="Number of Sub Venues"
                    value={
                      viewVenue.numberOfSubVenues != null
                        ? String(viewVenue.numberOfSubVenues)
                        : null
                    }
                  />
                  <DetailRow
                    label="Teams usually playing at venue"
                    value={formatTeamsUsuallyPlayingAtVenue(viewVenue)}
                    className="sm:col-span-2"
                  />
                  <DetailRow
                    label="Directions"
                    value={viewVenue.directions}
                    className="sm:col-span-2"
                  />
                  <DetailRow
                    label="Show on venues page"
                    value={
                      viewVenue.showOnVenuesPage ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          <Eye size={12} />
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                          <EyeOff size={12} />
                          No
                        </span>
                      )
                    }
                  />
                  <DetailRow
                    label="Google Maps set up"
                    value={
                      isGoogleMapsSetUp(viewVenue) ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700">
                          <CheckCircle2 size={14} />
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700">
                          <XCircle size={14} />
                          No
                        </span>
                      )
                    }
                  />
                  {viewVenue.mapLink ? (
                    <DetailRow
                      label="Map link"
                      value={
                        <a
                          href={viewVenue.mapLink}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-[#00ADE5] hover:underline break-all"
                        >
                          Open in Google Maps
                        </a>
                      }
                      className="sm:col-span-2"
                    />
                  ) : null}
                </div>

                <div className="md:col-span-1">
                  <div className="rounded-xl border border-gray-200 bg-slate-50 p-3 md:sticky md:top-0">
                    <p className="mb-2 text-sm font-semibold text-gray-700">Map</p>
                    {viewVenue.mapLink ? (
                      <>
                        <iframe
                          src={getEmbeddableMapUrl(viewVenue.mapLink)}
                          title={`Map for ${viewVenue.venueName || "venue"}`}
                          className="h-64 w-full rounded-lg border border-gray-200 bg-white md:h-72"
                          loading="lazy"
                        />
                        <a
                          href={viewVenue.mapLink}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-block text-xs font-semibold text-[#00ADE5] hover:underline"
                        >
                          Open map in new tab
                        </a>
                      </>
                    ) : (
                      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white px-4 text-center text-sm text-gray-500 md:h-72">
                        No map link configured for this venue.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex shrink-0 flex-wrap justify-end gap-3 border-t px-4 py-4 sm:px-6">
              <button
                type="button"
                onClick={closeView}
                className="rounded-xl border-2 border-gray-300 px-5 py-2.5 font-semibold text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => openEdit(viewVenue)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#003366] to-[#004080] px-5 py-2.5 font-semibold text-white hover:from-[#002244] hover:to-[#003366]"
              >
                <Edit2 size={16} />
                Edit Venue
              </button>
            </div>
        </Modal>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        innerScroll
        panelClassName="flex max-w-2xl flex-col"
        labelledBy="venue-form-title"
      >
            <div className="shrink-0 bg-gradient-to-r from-[#003366] to-[#004080] px-4 py-4 text-white sm:px-6 sm:py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                    <MapPin size={20} />
                  </span>
                  <div>
                    <h3 id="venue-form-title" className="text-xl font-bold">
                      {mode === "create" ? "Create Venue" : "Edit Venue"}
                    </h3>
                    <p className="text-xs text-blue-100">
                      Keep venue data accurate and consistent.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="rounded-lg p-2 text-white hover:bg-white/20"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5 md:grid-cols-3">
              <div className="grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Venue Name *
                  </label>
                  <div className="relative">
                    <div className="w-full">
                      <input
                        type="text"
                        value={form.venueName}
                        onChange={(e) => {
                          setForm((prev) => ({ ...prev, venueName: e.target.value }));
                        }}
                        onFocus={() => {
                          if (venueSuggestions.length > 0) setShowSuggestions(true);
                        }}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
                        placeholder="Type venue name for Google Places search"
                      />
                      {showSuggestions && venueSuggestions.length > 0 && (
                        <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                          {venueSuggestions.map((suggestion) => (
                            <button
                              key={suggestion.place_id}
                              type="button"
                              onClick={() => {
                                const text =
                                  suggestion.structured_formatting?.main_text ||
                                  suggestion.description;
                                const secondary =
                                  suggestion.structured_formatting?.secondary_text || "";
                                setForm((prev) => ({
                                  ...prev,
                                  venueName: text || prev.venueName,
                                  townCity: prev.townCity || secondary,
                                  mapLink: `https://www.google.com/maps/place/?q=place_id:${suggestion.place_id}`,
                                }));
                                setShowSuggestions(false);
                                setVenueSuggestions([]);
                              }}
                              className="block w-full border-b border-gray-100 px-3 py-2 text-left hover:bg-gray-50 last:border-b-0"
                            >
                              <p className="text-sm font-medium text-gray-800">
                                {suggestion.structured_formatting?.main_text ||
                                  suggestion.description}
                              </p>
                              {suggestion.structured_formatting?.secondary_text && (
                                <p className="text-xs text-gray-500">
                                  {suggestion.structured_formatting.secondary_text}
                                </p>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {!mapsReady && (
                    <p className="mt-1 text-xs text-gray-500">
                      Google Places suggestions require `VITE_GOOGLE_MAPS_API_KEY`.
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    value={form.addressLine1}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, addressLine1: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    value={form.addressLine2}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, addressLine2: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Address Line 3
                  </label>
                  <input
                    type="text"
                    value={form.addressLine3}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, addressLine3: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <input
                    type="text"
                    value={form.townCity}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, townCity: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    County
                  </label>
                  <input
                    type="text"
                    value={form.county}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, county: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    State
                  </label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, state: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Postcode
                  </label>
                  <input
                    type="text"
                    value={form.postcode}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, postcode: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Telephone
                  </label>
                  <input
                    type="text"
                    value={form.telephone}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, telephone: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Number of Sub Venues
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.numberOfSubVenues}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        numberOfSubVenues: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Map Link
                  </label>
                  <input
                    type="text"
                    value={form.mapLink}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, mapLink: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
                    placeholder="Paste Google Maps URL"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Google Maps link paste karein. Preview right side par show hoga.
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Directions
                  </label>
                  <textarea
                    rows={3}
                    value={form.directions}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, directions: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Teams usually playing at venue
                  </label>
                  <textarea
                    rows={2}
                    value={form.teamsPlayingAtVenue}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        teamsPlayingAtVenue: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00ADE5]"
                    placeholder="e.g. Team A, Team B (comma-separated or free text)"
                  />
                </div>

              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.showOnVenuesPage}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      showOnVenuesPage: e.target.checked,
                    }))
                  }
                />
                Show on venues page
              </label>
            </div>

              <div className="md:col-span-1">
                <div className="rounded-xl border border-gray-200 bg-slate-50 p-3 md:sticky md:top-0">
                  <p className="mb-2 text-sm font-semibold text-gray-700">Map Preview</p>
                  {form.mapLink ? (
                    <>
                      <iframe
                        src={mapPreviewUrl}
                        title="Venue map preview"
                        className="h-72 w-full rounded-lg border border-gray-200 bg-white"
                        loading="lazy"
                      />
                      <a
                        href={form.mapLink}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-block text-xs font-semibold text-[#00ADE5] hover:underline"
                      >
                        Open map in new tab
                      </a>
                    </>
                  ) : (
                    <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white px-4 text-center text-sm text-gray-500">
                      Map link paste karte hi yahan preview show hoga.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 justify-end gap-3 border-t px-4 py-4 sm:px-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="rounded-xl border-2 border-gray-300 px-5 py-2.5 font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#003366] to-[#004080] px-5 py-2.5 font-semibold text-white hover:from-[#002244] hover:to-[#003366]"
              >
                <Save size={16} />
                {mode === "create" ? "Create Venue" : "Save Changes"}
              </button>
            </div>
      </Modal>

      <ListViewModal
        isOpen={Boolean(teamsViewVenue)}
        onClose={() => setTeamsViewVenue(null)}
        title={teamsViewVenue?.venueName || "Venue teams"}
        subtitle={
          teamsViewVenue
            ? `${getVenueTeams(teamsViewVenue).length} team${
                getVenueTeams(teamsViewVenue).length === 1 ? "" : "s"
              } usually play here`
            : ""
        }
        labelledBy="venue-teams-title"
        items={teamsViewVenue ? getVenueTeams(teamsViewVenue) : []}
        emptyIcon={Users}
        emptyTitle="No teams linked"
        emptyHint="Teams will appear here when assigned to this venue."
        tableMode
        tableHeaders={["Team"]}
        renderItem={(team) => (
          <td className="px-4 py-3 font-medium text-gray-800">{team.name}</td>
        )}
      />
    </div>
  );
}
