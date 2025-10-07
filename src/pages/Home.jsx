import { Link } from "react-router-dom";
import Navbar from "../components/NavBar";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <div className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h1 className="text-4xl tracking-tight font-bold text-black sm:text-5xl md:text-6xl">
                    <span className="block">The easiest place to</span>
                    <span className="block text-[#00ADE5]">
                      run your sports league
                    </span>
                  </h1>
                  <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                    Sports organiser — the solution for organising and managing
                    leagues, with a user-friendly interface and features
                    including league management system, online scheduler,
                    results tracking, player registrations, and a professional
                    website.
                  </p>
                  <div className="mt-5 sm:mt-8 sm:flex lg:justify-start">
                    <div className="rounded-md shadow">
                      <Link
                        to="/signup"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#003366] hover:opacity-90 md:py-4 md:text-lg md:px-10"
                      >
                        Sign up for free
                      </Link>
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-3">
                      <button className="w-full flex items-center justify-center px-8 py-3 border border-[#00ADE5] text-base font-medium rounded-md text-[#00ADE5] bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
                        Get a demo
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-gray-500">
                    No credit card required
                  </p>
                </div>
                <div className="hidden lg:block">
                  <img
                    src="https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&q=80&w=800"
                    alt="Sports management illustration"
                    className="w-full h-auto rounded-lg shadow-xl"
                  />
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Sport Selection Section */}
      <div className="bg-[#003366]">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 text-center">
          <button className="bg-white px-6 py-3 rounded-full text-lg font-medium text-black hover:bg-gray-50 transition-colors">
            What's your sport?
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 py-6 text-center text-sm text-gray-600 border-t border-gray-200">
        <div className="space-x-2">
          <Link to="/terms" className="hover:text-gray-900">
            Terms & Conditions
          </Link>
          <span>|</span>
          <Link to="/privacy" className="hover:text-gray-900">
            Privacy
          </Link>
          <span>|</span>
          <span>Copyright© 2002-2025 - LeagueRepublic</span>
        </div>
      </footer>
    </div>
  );
}
