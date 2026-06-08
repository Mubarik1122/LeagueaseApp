import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Trophy,
  Mail,
  ArrowRight,
  CheckCircle,
  Shield,
  Zap,
  Loader2,
} from "lucide-react";
import Swal from "sweetalert2";
import { authAPI } from "../../services/api";
import Navbar from "../../components/Navbar";
import PoweredBy4SOV from "../../components/PoweredBy4SOV";
import {
  parseGoogleOAuthPayload,
  isTrustedGoogleOAuthOrigin,
  isGoogleOAuthResult,
  googleOAuthErrorText,
} from "../../utils/googleOAuthMessage";
import { hydrateUserFromTokenIfNeeded } from "../../utils/jwtSession";
import {
  isPlayerOnlyWebRoles,
  WEB_PORTAL_PLAYER_ONLY_MESSAGE,
} from "../../utils/webPortalAccess";

export default function AccountSetup() {
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [formData, setFormData] = useState({
    email: "",
    acceptTerms: false,
  });

  const [errors, setErrors] = useState({
    email: "",
    acceptTerms: "",
  });

  const [googleError, setGoogleError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_BASE_URL;

    const handleMessage = (event) => {
      if (!isTrustedGoogleOAuthOrigin(event.origin, apiBase)) return;

      const data = parseGoogleOAuthPayload(event.data);
      if (!isGoogleOAuthResult(data)) return;

      if (data.token) {
        localStorage.removeItem("user");
        localStorage.setItem("token", data.token);
        hydrateUserFromTokenIfNeeded(data.token);
        try {
          const stored = JSON.parse(localStorage.getItem("user") || "null");
          if (isPlayerOnlyWebRoles(stored?.roles)) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            Swal.fire({
              icon: "warning",
              title: "Web access not available",
              text: WEB_PORTAL_PLAYER_ONLY_MESSAGE,
            });
            return;
          }
        } catch {
          /* ignore */
        }
        Swal.fire({
          icon: "success",
          title: "Signed in with Google",
          text: "Redirecting…",
          timer: 1500,
          showConfirmButton: false,
        });
        navigate("/login");
        return;
      }

      const text = googleOAuthErrorText(data.error, data.message);

      if (data.error === "UserAlreadyExists") {
        Swal.fire({
          icon: "warning",
          title: "Account already exists",
          text,
          confirmButtonText: "Go to login",
        }).then((res) => {
          if (res.isConfirmed) navigate("/login");
        });
        return;
      }

      if (data.error === "GoogleNoEmail") {
        Swal.fire({
          icon: "warning",
          title: "Email not provided",
          text,
        });
        return;
      }

      Swal.fire({
        icon: "error",
        title: "Google sign-in",
        text,
      });
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [navigate]);

  const validate = () => {
    const newErrors = { email: "", acceptTerms: "" };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "Please accept the terms and privacy policy.";
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.acceptTerms;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    localStorage.setItem("signupEmail", formData.email);

    try {
      const result = await authAPI.requestOTP(formData.email);

      if (result.errorCode === 1) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: result.errorMessage || "Failed to request OTP.",
        });
        return;
      }

      const data = result.data || {};

      if (data.userAlreadyExists) {
        localStorage.removeItem("signupEmail");
        Swal.fire({
          icon: "error",
          title: "Account already exists",
          text:
            data.message ||
            "User already exists with this email. Please sign in.",
          confirmButtonText: "Go to login",
        }).then(() => {
          navigate("/login");
        });
        return;
      }

      const { isVerified, isUserCreated } = data;

      if (isVerified && isUserCreated) {
        Swal.fire({
          icon: "warning",
          title: "This user already exists",
          text: "An account with this email is already created.",
          confirmButtonText: "Login",
        }).then((res) => {
          if (res.isConfirmed) navigate("/login");
        });
        return;
      }

      if (isVerified && !isUserCreated) {
        navigate("/signup/complete");
        return;
      }

      navigate("/signup/verify");
    } catch (err) {
      console.error("OTP Request Error:", err);
      Swal.fire({
        icon: "error",
        title: "Unexpected Error",
        text: "Something went wrong. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00ADE5] to-[#00d4ff] rounded-full blur-xl opacity-50"></div>
                <div className="relative bg-gradient-to-br from-[#003366] to-[#004080] p-4 rounded-full shadow-lg">
                  <Trophy className="text-white" size={40} />
                </div>
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Create Your Account
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Start managing your sports league today
            </p>
          </div>

          {/* Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 p-6 sm:p-8 lg:p-10">
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Email address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full pl-12 pr-4 py-3 border ${
                      errors.email
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-[#00ADE5] focus:border-[#00ADE5]"
                    } rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-all duration-200 bg-white`}
                    placeholder="Enter your email address"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠</span>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start">
                <input
                  id="acceptTerms"
                  name="acceptTerms"
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  className="h-4 w-4 text-[#00ADE5] focus:ring-[#00ADE5] border-gray-300 rounded mt-1 cursor-pointer"
                />
                <label
                  htmlFor="acceptTerms"
                  className="ml-3 text-sm text-gray-700 cursor-pointer"
                >
                  I accept the{" "}
                  <Link
                    to="/terms"
                    className="text-[#00ADE5] hover:text-[#00d4ff] font-medium transition-colors"
                  >
                    Terms & Conditions
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    className="text-[#00ADE5] hover:text-[#00d4ff] font-medium transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.acceptTerms && (
                <p className="text-sm text-red-600 flex items-center">
                  <span className="mr-1">⚠</span>
                  {errors.acceptTerms}
                </p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-[#003366] to-[#004080] hover:from-[#002244] hover:to-[#003366] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00ADE5] transition-all duration-200 transform hover:enabled:scale-[1.02] active:enabled:scale-[0.98] mt-6 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 shrink-0 animate-spin" aria-hidden />
                    <span>Please wait…</span>
                  </>
                ) : (
                  <>
                    Get Started
                    <ArrowRight className="ml-2 w-5 h-5 shrink-0" />
                  </>
                )}
              </button>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-[#00ADE5] hover:text-[#00d4ff] transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-200/50">
              <Shield className="w-6 h-6 text-[#00ADE5] mx-auto mb-2" />
              <p className="text-xs font-medium text-gray-700">Secure</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-200/50">
              <Zap className="w-6 h-6 text-[#00ADE5] mx-auto mb-2" />
              <p className="text-xs font-medium text-gray-700">Fast Setup</p>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 mb-3">Free 14-day trial • No credit card required</p>
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span className="text-xs">50,000+ leagues</span>
              </div>
              <span>•</span>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span className="text-xs">Trusted worldwide</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200/80 bg-white/50 py-6 text-center text-sm text-gray-500">
        <div className="flex flex-col items-center justify-center gap-4 px-4">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <Link to="/terms" className="hover:text-gray-900 transition-colors">
              Terms & Conditions
            </Link>
            <span className="text-gray-300" aria-hidden>
              |
            </span>
            <Link to="/privacy" className="hover:text-gray-900 transition-colors">
              Privacy
            </Link>
          </div>
          <PoweredBy4SOV />
        </div>
      </footer>
    </div>
  );
}
