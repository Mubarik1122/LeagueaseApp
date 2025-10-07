import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, Menu, X, Search } from "lucide-react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const goToDashboard = () => {
    navigate("/"); // you can change to /admin if needed
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img
                src="/image/logo/3.png"
                alt="Leaguease Logo"
                className="h-12 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="relative group">
              <button className="flex items-center text-black hover:text-[#00ADE5] transition">
                Sports <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              {/* Dropdown placeholder */}
              <div className="absolute hidden group-hover:block bg-white border rounded-md shadow-lg mt-2 w-40">
                <Link
                  to="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Football
                </Link>
                <Link
                  to="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Basketball
                </Link>
              </div>
            </div>

            <div className="relative group">
              <button className="flex items-center text-black hover:text-[#00ADE5] transition">
                Features <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              <div className="absolute hidden group-hover:block bg-white border rounded-md shadow-lg mt-2 w-40">
                <Link
                  to="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Scheduling
                </Link>
                <Link
                  to="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Results
                </Link>
              </div>
            </div>

            <Link
              to="/pricing"
              className="text-black hover:text-[#00ADE5] text-sm font-medium"
            >
              Pricing
            </Link>

            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Find my league"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#00ADE5] focus:border-[#00ADE5]"
              />
            </div>

            {/* Auth Buttons */}
            {!isLoggedIn ? (
              <>
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
              </>
            ) : (
              <button
                onClick={goToDashboard}
                className="text-black hover:text-[#00ADE5] px-3 py-2 text-sm font-medium"
              >
                Dashboard
              </button>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-[#00ADE5]"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 pt-2 pb-3 space-y-2">
            <Link
              to="/"
              className="block text-gray-700 hover:text-[#00ADE5] py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/pricing"
              className="block text-gray-700 hover:text-[#00ADE5] py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            {!isLoggedIn ? (
              <>
                <Link
                  to="/login"
                  className="block text-gray-700 hover:text-[#00ADE5] py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="block text-gray-700 hover:text-[#00ADE5] py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  goToDashboard();
                }}
                className="block w-full text-left text-gray-700 hover:text-[#00ADE5] py-2"
              >
                Dashboard
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
