import { Link } from "react-router-dom";
import { ChevronDown, Search } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Top Bar */}
      <div className="bg-[#f8fafc] py-1 px-4">
        <div className="max-w-7xl mx-auto flex justify-end space-x-4 text-sm">
          <a href="#" className="text-[#00ADE5] hover:opacity-80">
            Top Sites
          </a>
          <a href="#" className="text-[#00ADE5] hover:opacity-80">
            Help Centre
          </a>
          <div className="flex items-center">
            <span className="text-[#00ADE5]">EN</span>
            <ChevronDown className="h-4 w-4 text-[#00ADE5]" />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <img
                  src="\image\logo\3.png"
                  alt="Leaguease Logo"
                  className="h-16 w-100"
                />
              </Link>
              <div className="hidden md:flex ml-10 space-x-8">
                <div className="relative group">
                  <button className="flex items-center text-black hover:text-[#00ADE5]">
                    Sports
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </button>
                </div>
                <div className="relative group">
                  <button className="flex items-center text-black hover:text-[#00ADE5]">
                    Features
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </button>
                </div>
                <Link to="/pricing" className="text-black hover:text-[#00ADE5]">
                  Pricing
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Find my league"
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#00ADE5] focus:border-[#00ADE5]"
                />
              </div>
              <Link
                to="/login"
                className="text-black hover:text-[#00ADE5] px-3 py-2 text-sm font-medium"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="bg-[#003366] text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

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
                    Sports organiser - the solution for organising and managing
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
    </div>
  );
}
