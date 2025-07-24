import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trophy } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.jsx";
import { testApiConnection } from "../../config/api.js";
import Swal from "sweetalert2";

export default function AccountSetup() {
  const navigate = useNavigate();
  const { requestOTP, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    language: "English (UK)",
    acceptTerms: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.acceptTerms) {
      Swal.fire({
        icon: "warning",
        title: "Terms Required",
        text: "Please accept the terms and conditions to continue.",
      });
      return;
    }

    // Test API connection first
    const isConnected = await testApiConnection();
    if (!isConnected) {
      Swal.fire({
        icon: "error",
        title: "Connection Error",
        text: "Unable to connect to the server. Please check your internet connection and try again.",
      });
      return;
    }

    try {
      await requestOTP(formData.email);
      
      // Store email in localStorage for verification step
      localStorage.setItem("signupEmail", formData.email);
      localStorage.setItem("signupLanguage", formData.language);
      
      Swal.fire({
        icon: "success",
        title: "OTP Sent",
        text: "Please check your email for the verification code.",
        timer: 2000,
        showConfirmButton: false,
      });
      
      navigate("/signup/verify");
    } catch (error) {
      console.error('OTP request error:', error);
      Swal.fire({
        icon: "error",
        title: "Failed to Send OTP",
        text: error.message || "Unable to send OTP. Please try again.",
      });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Trophy className="text-[#00ADE5]" size={48} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Create a league - Account Setup
            </h2>
          </div>

          <div className="bg-white py-8 px-4 shadow-sm rounded-lg sm:px-10">
            <button className="w-full bg-[#4267B2] text-white py-2 px-4 rounded-md hover:bg-[#365899] mb-6 flex items-center justify-center gap-2">
              <span>Continue with Facebook</span>
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  or use your email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#00ADE5] focus:border-[#00ADE5]"
                />
              </div>

              <div>
                <label
                  htmlFor="language"
                  className="block text-sm font-medium text-gray-700"
                >
                  Language *
                </label>
                <select
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#00ADE5] focus:border-[#00ADE5]"
                >
                  <option>English (UK)</option>
                  <option>English (US)</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  id="acceptTerms"
                  name="acceptTerms"
                  type="checkbox"
                  required
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  className="h-4 w-4 text-[#00ADE5] focus:ring-[#00ADE5] border-gray-300 rounded"
                />
                <label
                  htmlFor="acceptTerms"
                  className="ml-2 block text-sm text-gray-900"
                >
                  I accept{" "}
                  <Link to="/terms" className="text-blue-600 hover:underline">
                    Terms & Conditions
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-blue-600 hover:underline">
                    Privacy
                  </Link>
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#003366] hover:bg-[#003366] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00ADE5]"
                >
                  {loading ? "Sending OTP..." : "Get Started"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-sm text-gray-600">
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