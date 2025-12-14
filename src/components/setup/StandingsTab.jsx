import { useNavigate } from "react-router-dom";
import { BarChart3, ArrowRight } from "lucide-react";

export default function StandingsTab() {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <BarChart3 className="mx-auto text-[#00ADE5] mb-4" size={64} />
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Standings Configuration
        </h2>
        <p className="text-gray-600 mb-6">
          Configure how standings are calculated and displayed for your competitions
        </p>
        <button
          onClick={() => navigate("/admin/standings")}
          className="px-6 py-3 bg-[#00ADE5] text-white rounded-md hover:bg-[#008FC5] flex items-center mx-auto"
        >
          Go to Standings Setup
          <ArrowRight size={18} className="ml-2" />
        </button>
      </div>
    </div>
  );
}
