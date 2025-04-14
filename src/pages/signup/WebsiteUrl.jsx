import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Globe } from "lucide-react";

export default function WebsiteUrl() {
  const navigate = useNavigate();
  const [urlType, setUrlType] = useState("suggestion");
  const [customUrl, setCustomUrl] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedUrl =
      urlType === "suggestion" ? "4sovtournament2" : customUrl;
    localStorage.setItem("websiteUrl", selectedUrl);
    navigate("/signup/subscription");
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
          <h2 className="text-2xl font-bold text-gray-900">Step 4 of 5</h2>
          <p className="mt-2 text-gray-600">Choose league website address</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <p className="text-sm text-blue-700">
              This will be the URL that people use to visit your public league
              website, for example: https://myleague.leaguerepublic.com
            </p>
            <p className="text-sm text-blue-700 mt-2">
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
                className="px-4 py-2 bg-[#003366] text-white rounded-md hover:bg-[#003366]"
              >
                Next
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
