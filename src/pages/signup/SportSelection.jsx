import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const sportCategories = {
  "Traditional Sports": [
    "Baseball",
    "Basketball",
    "Cricket",
    "Football (American)",
    "Inline Puck Hockey",
    "Field Hockey",
    "Hurling",
    "Ice Hockey",
    "Korfball",
    "Lacrosse",
    "Netball",
    "Rugby League",
    "Rugby Union",
    "Soccer/Football",
    "Soccer (Indoor)",
    "Soccer (Futsal)",
    "Softball",
  ],
  "Traditional Pub/Bar": ["Billiards", "Darts", "Dominoes", "Pool", "Snooker"],
  "Racket and Net Sports": [
    "Badminton",
    "Raquetball",
    "Squash",
    "Tennis",
    "Volleyball",
    "Table Tennis",
  ],
  Bowling: [
    "Crown Green Bowling",
    "Curling",
    "Flat Green Bowling",
    "Indoor Bowling",
    "Skittles",
    "Ten Pin Bowling",
    "Petanque",
  ],
  Games: ["Cornhole", "Pub Quiz", "Subbuteo", "Table Football"],
};

export default function SportSelection() {
  const navigate = useNavigate();
  const [selectedSport, setSelectedSport] = useState("");
  const [otherSport, setOtherSport] = useState("");

  const handlePrevious = () => {
    navigate("/signup/league-type");
  };

  const handleNext = () => {
    const sport = selectedSport === "Other" ? otherSport : selectedSport;
    localStorage.setItem("selectedSport", sport);
    // Navigate to the next step (you can add the route for the next step)
    navigate("/signup/league-details");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <div className="inline-block p-2 bg-red-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-[#00ADE5]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Step 2 of 5</h2>
          <p className="mt-2 text-xl text-gray-600">Select your sport</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="grid md:grid-cols-3 gap-8">
            {Object.entries(sportCategories).map(([category, sports]) => (
              <div key={category}>
                <h3 className="font-medium text-gray-900 mb-4">{category}</h3>
                <div className="space-y-3">
                  {sports.map((sport) => (
                    <label key={sport} className="flex items-center">
                      <input
                        type="radio"
                        name="sport"
                        value={sport}
                        checked={selectedSport === sport}
                        onChange={(e) => setSelectedSport(e.target.value)}
                        className="h-4 w-4 text-[#00ADE5] focus:ring-[#00ADE5] border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        {sport}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div>
              <h3 className="font-medium text-gray-900 mb-4">Other</h3>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="sport"
                  value="Other"
                  checked={selectedSport === "Other"}
                  onChange={(e) => setSelectedSport(e.target.value)}
                  className="h-4 w-4 text-[#00ADE5] focus:ring-[#00ADE5] border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-600">Other</span>
              </label>
              {selectedSport === "Other" && (
                <input
                  type="text"
                  value={otherSport}
                  onChange={(e) => setOtherSport(e.target.value)}
                  placeholder="Please specify"
                  className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#00ADE5] focus:border-[#00ADE5]"
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={
              !selectedSport || (selectedSport === "Other" && !otherSport)
            }
            className="px-4 py-2 bg-[#003366] text-white rounded-md hover:bg-[#003366] disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
