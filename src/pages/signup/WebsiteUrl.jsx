import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Globe } from "lucide-react";
import Swal from "sweetalert2";

export default function WebsiteUrl() {
  const navigate = useNavigate();
  const [urlType, setUrlType] = useState("suggestion");
  const [customUrl, setCustomUrl] = useState("");
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = localStorage.getItem("signupEmail");
    const leagueDetails = JSON.parse(localStorage.getItem("leagueDetails") || "{}");
    const selectedSport = localStorage.getItem("selectedSport");

    const requiredFields = [
      "leagueName",
      "country",
      "seasonName",
      "seasonStartDate",
      "seasonEndDate",
    ];

    const missingFields = requiredFields.filter((field) => !leagueDetails[field]);
    if (!selectedSport) missingFields.push("sportName");
    if (!email) missingFields.push("email");

    if (missingFields.length > 0) {
      alert(`Missing required fields: ${missingFields.join(", ")}`);
      return;
    }

    const selectedUrl = urlType === "suggestion" ? "4sovtournament2" : customUrl.trim();

    const payload = {
      email,
      ...leagueDetails,
      sportName: selectedSport,
      domainName: selectedUrl || null,
    };

    try {
      const response = await fetch(`${BASE_URL}/auth/create-league`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.removeItem("leagueDetails");
        localStorage.removeItem("selectedSport");
        localStorage.removeItem("websiteUrl");
        localStorage.removeItem("signupEmail");

        Swal.fire({
          icon: "success",
          title: "League created successfully!",
          confirmButtonText: "Go to Login",
          confirmButtonColor: "#003366",
        }).then(() => {
          navigate("/login");
        });
      } else {
        alert(result.error || "Something went wrong!");
      }
    } catch (error) {
      console.error("API Error:", error);
      alert("An error occurred.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <Globe className="h-8 w-8 text-[#00ADE5]" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Step 4 of 4</h2>
          <p className="mt-2 text-gray-600">Choose league website address</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-sm text-red-700">
              This will be the URL that people use to visit your public league
              website, for example: https://myleague.leaguerepublic.com
            </p>
            <p className="text-sm text-red-700 mt-2">
              You can use your own domain name e.g. myleague.com if you choose a
              Gold plan.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-4">
                Here are some sub domain suggestions:
              </h3>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={urlType === "suggestion"}
                  onChange={() => setUrlType("suggestion")}
                  className="h-4 w-4 text-[#00ADE5] focus:ring-[#00ADE5] border-gray-300"
                />
                <span className="text-gray-900">4sovtournament2</span>
              </label>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-4">
                Or enter your own:
              </h3>
              <div className="flex items-center">
                <span className="text-gray-500">https://</span>
                <input
                  type="text"
                  value={customUrl}
                  onChange={(e) => {
                    setCustomUrl(e.target.value);
                    setUrlType("custom");
                  }}
                  onClick={() => setUrlType("custom")}
                  className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#00ADE5] focus:border-[#00ADE5]"
                  placeholder="myleaguename"
                />
                <span className="text-gray-500">.leaguerepublic.com</span>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => navigate("/signup/league-details")}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#003366] text-white rounded-md hover:bg-[#002244]"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
