import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trophy } from "lucide-react";
import Swal from "sweetalert2";
import { authAPI } from "../../services/api";

export default function AccountSetup() {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    acceptTerms: false,
  });

  const [errors, setErrors] = useState({
    email: "",
    acceptTerms: "",
  });

  const [googleError, setGoogleError] = useState(null);

  // 🔁 Listen for Google login result
  useEffect(() => {
    const handleMessage = (event) => {
      if (!event.origin.includes("localhost") && !event.origin.includes("vercel.app")) return;

      const { token, error } = event.data;

      if (token) {
        localStorage.setItem("token", token);
        Swal.fire({
          icon: "success",
          title: "Logged in with Google!",
          timer: 1500,
          showConfirmButton: false,
        });
        navigate("/login");
      } else if (error === "UserAlreadyExists") {
        Swal.fire({
          icon: "warning",
          title: "Account Exists",
          text: "An account with this email already exists. Please login instead.",
          confirmButtonText: "Login",
        }).then((res) => {
          if (res.isConfirmed) navigate("/login");
        });
      } else if (error === "GoogleLoginFailed") {
        Swal.fire({
          icon: "error",
          title: "Google Login Failed",
          text: "Something went wrong. Please try again.",
        });
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

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

    localStorage.setItem("signupEmail", formData.email);

    try {
      const response = await fetch(`${BASE_URL}/auth/request-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const result = await response.json();

      if (result.errorCode === 1) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: result.errorMessage || "Failed to request OTP.",
        });
        return;
      }

      const { isVerified, isUserCreated } = result.data;

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

            {/* 🔴 Google login error above email input */}
            {googleError && (
              <div className="mb-4 text-red-600 text-sm font-medium text-center">
                {googleError}
              </div>
            )}

            {/* 🔘 Google Login */}
            <button
              type="button"
              onClick={() => {
                setGoogleError(""); // clear old errors
                const width = 500;
                const height = 600;
                const left = (window.innerWidth - width) / 2;
                const top = (window.innerHeight - height) / 2;

                const popup = window.open(
                  `${BASE_URL}/auth/google`,
                  'GoogleSignIn',
                  `width=${width},height=${height},top=${top},left=${left}`
                );

                if (popup) popup.focus();
              }}
              className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-100 mb-6 flex items-center justify-center gap-2"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-5 h-5"
              />
              <span>Continue with Google</span>
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or use your email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`mt-1 block w-full border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#00ADE5] focus:border-[#00ADE5]`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div className="flex items-start">
                <input
                  id="acceptTerms"
                  name="acceptTerms"
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  className="h-4 w-4 text-[#00ADE5] focus:ring-[#00ADE5] border-gray-300 rounded mt-1"
                />
                <label htmlFor="acceptTerms" className="ml-2 text-sm text-gray-900">
                  I accept{" "}
                  <Link to="/terms" className="text-blue-600 hover:underline">
                    Terms & Conditions
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.acceptTerms && (
                <p className="text-sm text-red-600">{errors.acceptTerms}</p>
              )}

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#003366] hover:bg-[#002244] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00ADE5]"
                >
                  Get Started
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