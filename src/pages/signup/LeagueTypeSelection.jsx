import { Link, useNavigate } from "react-router-dom";
import { Trophy, ArrowRight, ArrowLeft } from "lucide-react";
import Navbar from "../../components/Navbar";
import SignupStepper from "../../components/signup/SignupStepper";

export default function LeagueTypeSelection() {
  const navigate = useNavigate();

  const handleSelection = (type) => {
    localStorage.setItem("leagueType", type);
    navigate("/signup/sport-selection");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/80 to-indigo-100/60">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-16 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl space-y-10">
          <div className="text-center space-y-4">
            <SignupStepper currentStep={1} className="pb-2" />
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00ADE5] to-[#0088cc] blur-xl opacity-40 scale-150" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#003366] to-[#004080] shadow-lg shadow-[#003366]/25">
                  <Trophy className="h-8 w-8 text-white" strokeWidth={1.75} />
                </div>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
              What kind of league do you want to create?
            </h1>
            <p className="text-base text-gray-600 max-w-md mx-auto">
              Choose your path — you can always update details later in setup.
            </p>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => handleSelection("sports")}
              className="group w-full max-w-md text-left rounded-2xl border-2 border-gray-200/80 bg-white/90 p-8 shadow-md shadow-gray-200/50 backdrop-blur-sm transition-all duration-300 hover:border-[#00ADE5] hover:shadow-xl hover:shadow-[#00ADE5]/10 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00ADE5] focus-visible:ring-offset-2"
            >
              <div className="flex flex-wrap justify-center gap-4 sm:gap-5 mb-6">
                {[
                  {
                    src: "https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/fifa.svg",
                    alt: "Football",
                  },
                  {
                    src: "https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/nba.svg",
                    alt: "Basketball",
                  },
                  {
                    src: "https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/mlb.svg",
                    alt: "Baseball",
                  },
                ].map((icon) => (
                  <div
                    key={icon.alt}
                    className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 ring-1 ring-gray-200/80 transition-transform duration-300 group-hover:scale-105"
                  >
                    <img
                      src={icon.src}
                      alt={icon.alt}
                      className="h-9 w-9 opacity-90"
                    />
                  </div>
                ))}
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#003366] transition-colors">
                  Sports
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Create a league for traditional sports — fixtures, standings,
                  and more.
                </p>
                <span className="inline-flex items-center justify-center gap-2 pt-3 text-sm font-semibold text-[#00ADE5]">
                  Continue
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </button>
          </div>

          <div className="rounded-2xl border-2 border-[#003366]/20 bg-gradient-to-r from-white via-white to-blue-50/90 p-5 sm:p-6 shadow-lg shadow-[#003366]/5 ring-1 ring-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-center sm:text-left space-y-1">
                <p className="text-sm font-semibold text-[#003366] uppercase tracking-wide">
                  Not ready for a league site?
                </p>
                <p className="text-base sm:text-lg font-medium text-gray-900">
                  Don&apos;t want to create a league website?
                </p>
              </div>
              <Link
                to="/login"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-[#003366] bg-[#003366] px-5 py-3.5 text-sm sm:text-base font-bold text-white shadow-md transition-all hover:bg-[#002244] hover:border-[#002244] hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00ADE5] focus-visible:ring-offset-2"
              >
                <ArrowLeft className="h-5 w-5 shrink-0" />
                Go back to My Account
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
