import { useNavigate } from "react-router-dom";
import { MapPin, ArrowRight } from "lucide-react";

export default function VenuesTab() {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <MapPin className="mx-auto text-[#00ADE5] mb-4" size={64} />
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Venue Management
        </h2>
        <p className="text-gray-600 mb-6">
          Manage all your league venues in one place
        </p>
        <button
          onClick={() => navigate("/admin/venues")}
          className="px-6 py-3 bg-[#00ADE5] text-white rounded-md hover:bg-[#008FC5] flex items-center mx-auto"
        >
          Go to Venue Management
          <ArrowRight size={18} className="ml-2" />
        </button>
      </div>
    </div>
  );
}
