import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

export default function LeagueTypeSelection() {
  const navigate = useNavigate();

  const handleSelection = (type) => {
    localStorage.setItem("leagueType", type);
    navigate("/signup/sport-selection");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
          <div className="max-w-4xl w-full space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Step 1 of 4</h2>
              <p className="mt-2 text-xl text-gray-600">
                What kind of league do you want to create?
              </p>
            </div>

            <div className="flex justify-center">
              <div className="grid md:grid-cols-1 gap-6">
                {/* Sports Option */}
                <button
                  onClick={() => handleSelection("sports")}
                  className="w-96 group relative bg-white rounded-lg border-2 border-dashed border-gray-300 p-8 hover:border-[#00ADE5] transition-colors"
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
                    <h3 className="text-lg font-medium text-gray-900">
                      Sports
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Create a league for traditional sports
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <div className="text-center">
              <a
                href="/login"
                className="text-sm text-blue-600 hover:underline"
              >
                Don't want to create a league website? Go back to My Account
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
