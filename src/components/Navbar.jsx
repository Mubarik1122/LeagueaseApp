import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Search } from "lucide-react";
import { useState } from "react";
import { useAuthContext } from "../context/AuthContext"; // ✅ adjust path as needed

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuthContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const goToDashboard = () => {
    navigate("/dashboard");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center hover:opacity-90 transition-opacity">
              <img
                src="/image/logo/3.png"
                alt="Leaguease Logo"
                className="h-14 sm:h-16 lg:h-20 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Find my league"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#00ADE5] focus:border-[#00ADE5]"
              />
            </div>

            {/* Auth Section */}
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-full bg-[#003366] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#004080]"
                >
                  Log In
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={goToDashboard}
                  className="text-black hover:text-[#00ADE5] px-3 py-2 text-sm font-medium"
                >
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 px-3 py-2 text-sm font-medium"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
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

      {/* Mobile Menu */}
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
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="mt-2 block w-full rounded-full bg-[#003366] px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#004080]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log In
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    goToDashboard();
                  }}
                  className="block w-full text-left text-gray-700 hover:text-[#00ADE5] py-2"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="block w-full text-left text-red-600 hover:text-red-700 py-2"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
