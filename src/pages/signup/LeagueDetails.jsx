import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";

export default function LeagueDetails() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    leagueName: "",
    country: "Pakistan",
    seasonName: "2025",
    seasonStartDate: "2025-07-04",
    seasonEndDate: "2025-09-22",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("leagueDetails", JSON.stringify(formData));
    navigate("/signup/website-url");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <Settings className="h-8 w-8 text-[#00ADE5]" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Step 3 of 5</h2>
          <p className="mt-2 text-gray-600">Enter league details</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                League name
              </label>
              <p className="text-xs text-gray-500 mb-1">
                What's your league called?
              </p>
              <input
                type="text"
                name="leagueName"
                required
                value={formData.leagueName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#00ADE5] focus:border-[#00ADE5]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Country
              </label>
              <p className="text-xs text-gray-500 mb-1">
                Which country does your league take place?
              </p>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#00ADE5] focus:border-[#00ADE5]"
              >
                <option value="Pakistan">Pakistan</option>
                <option value="India">India</option>
                <option value="Bangladesh">Bangladesh</option>
                {/* Add more countries as needed */}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Season name
              </label>
              <p className="text-xs text-gray-500 mb-1">
                This might be something like 2022-23. You can change this later
                if you need to.
              </p>
              <input
                type="text"
                name="seasonName"
                required
                value={formData.seasonName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#00ADE5] focus:border-[#00ADE5]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Season Start Date
              </label>
              <p className="text-xs text-gray-500 mb-1">
                What's the date that the first match will take place?
              </p>
              <input
                type="date"
                name="seasonStartDate"
                required
                value={formData.seasonStartDate}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#00ADE5] focus:border-[#00ADE5]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Season End Date
              </label>
              <p className="text-xs text-gray-500 mb-1">
                What's the date when the last match will take place?
              </p>
              <input
                type="date"
                name="seasonEndDate"
                required
                value={formData.seasonEndDate}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#00ADE5] focus:border-[#00ADE5]"
              />
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => navigate("/signup/sport-selection")}
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
