import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trophy, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import Swal from "sweetalert2";
import CryptoJS from "crypto-js";
import Navbar from "../components/Navbar";
import PoweredBy4SOV from "../components/PoweredBy4SOV";
import { useAuthContext } from "../context/AuthContext";
export default function Login() {
  const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY;
  const navigate = useNavigate();
  const { login, user, isAuthenticated } = useAuthContext();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const rememberMe = localStorage.getItem("rememberMe") === "true";

    if (rememberMe) {
      const savedUsername = localStorage.getItem("Username") || "";
      const encryptedPassword = localStorage.getItem("Key");

      let decryptedPassword = "";
      if (encryptedPassword) {
        try {
          const bytes = CryptoJS.AES.decrypt(encryptedPassword, ENCRYPTION_KEY);
          decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);
        } catch (err) {
          console.error("Decryption failed:", err);
        }
      }

      setFormData({
        username: savedUsername,
        password: decryptedPassword,
        rememberMe: true,
      });
    }

    // ✅ If already logged in, go to dashboard
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate, ENCRYPTION_KEY]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let valid = true;
    const newErrors = { username: "", password: "" };

    if (!formData.username.trim()) {
      newErrors.username = "Username or email is required.";
      valid = false;
    }
    if (!formData.password) {
      newErrors.password = "Password is required.";
      valid = false;
    }

    setErrors(newErrors);
    if (!valid) return;

    try {
      const result = await login(formData.username, formData.password);

      if (result.success) {
        // ✅ Handle Remember Me locally
        if (formData.rememberMe) {
          const encryptedPassword = CryptoJS.AES.encrypt(
            formData.password,
            ENCRYPTION_KEY
          ).toString();

          localStorage.setItem("rememberMe", "true");
          localStorage.setItem("Username", formData.username);
          localStorage.setItem("Key", encryptedPassword);
          localStorage.setItem(
            "rememberUntil",
            (Date.now() + 24 * 60 * 60 * 1000).toString()
          ); // 24 hours
        } else {
          localStorage.removeItem("rememberMe");
          localStorage.removeItem("Username");
          localStorage.removeItem("Key");
        }

        Swal.fire({
          icon: "success",
          title: "Welcome!",
          text: "Login successful!",
          timer: 1500,
          showConfirmButton: false,
        });

        navigate("/dashboard");
      } else {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: result.error || "Invalid credentials.",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: "Something went wrong. Please try again later.",
      });
    }
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
              Welcome Back
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Log into your account to continue
            </p>
          </div>

          {/* Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 p-6 sm:p-8 lg:p-10">
            {/* Form */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Username/Email Field */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Username or Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    className={`block w-full pl-12 pr-4 py-3 border ${
                      errors.username
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-[#00ADE5] focus:border-[#00ADE5]"
                    } rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-all duration-200 bg-white`}
                    placeholder="Enter your username or email"
                  />
                </div>
                {errors.username && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠</span>
                    {errors.username}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className={`block w-full pl-12 pr-12 py-3 border ${
                      errors.password
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-[#00ADE5] focus:border-[#00ADE5]"
                    } rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-all duration-200 bg-white`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠</span>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="h-4 w-4 text-[#00ADE5] focus:ring-[#00ADE5] border-gray-300 rounded cursor-pointer"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-700 cursor-pointer"
                  >
                    Remember me
                  </label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-[#00ADE5] hover:text-[#00d4ff] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-[#003366] to-[#004080] hover:from-[#002244] hover:to-[#003366] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00ADE5] transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Sign In
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </form>

          </div>

          {/* Trust Badges */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 mb-3">Trusted by 50,000+ leagues</p>
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span className="text-xs">Secure</span>
              </div>
              <span>•</span>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs">Verified</span>
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
