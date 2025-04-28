import { useNavigate } from "react-router-dom";

export default function LeagueTypeSelection() {
  const navigate = useNavigate();

  const handleSelection = (type) => {
    localStorage.setItem("leagueType", type);
    navigate("/signup/sport-selection");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Step 1 of 5</h2>
          <p className="mt-2 text-xl text-gray-600">
            What kind of league do you want to create?
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Sports Option */}
          <button
            onClick={() => handleSelection("sports")}
            className="group relative bg-white rounded-lg border-2 border-dashed border-gray-300 p-8 hover:border-[#00ADE5] transition-colors"
          >
            <div className="grid grid-cols-3 gap-4 mb-6">
              <img
                src="https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/fifa.svg"
                alt="Football"
                className="w-12 h-12"
              />
              <img
                src="https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/nba.svg"
                alt="Basketball"
                className="w-12 h-12"
              />
              <img
                src="https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/mlb.svg"
                alt="Baseball"
                className="w-12 h-12"
              />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900">Sports</h3>
              <p className="mt-2 text-sm text-gray-500">
                Create a league for traditional sports
              </p>
            </div>
          </button>

          {/* Gaming Option */}
          <button
            onClick={() => handleSelection("gaming")}
            className="group relative bg-white rounded-lg border-2 border-dashed border-gray-300 p-8 hover:border-[#00ADE5] transition-colors"
          >
            <div className="grid grid-cols-3 gap-4 mb-6">
              <svg
                className="w-12 h-12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path d="M9 10h6m-3-3v6" />
              </svg>
              <svg
                className="w-12 h-12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M6 8h4m-2-2v4" />
                <circle cx="16" cy="8" r="1" />
                <circle cx="18" cy="10" r="1" />
              </svg>
              <svg
                className="w-12 h-12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M15 5v2M9 5v2M15 19v-2M9 19v-2M5 9h2M19 9h-2M5 15h2M19 15h-2" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900">Gaming</h3>
              <p className="mt-2 text-sm text-gray-500">
                Create a league for esports and gaming
              </p>
            </div>
          </button>
        </div>

        <div className="text-center">
          <a href="/login" className="text-sm text-blue-600 hover:underline">
            Don't want to create a league website? Go back to My Account
          </a>
        </div>
      </div>
    </div>
  );
}
