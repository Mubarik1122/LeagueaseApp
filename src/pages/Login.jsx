import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trophy } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import Swal from "sweetalert2";
import CryptoJS from "crypto-js";
import Navbar from "../components/Navbar";
import { useAuthContext } from "../context/AuthContext";

export default function Login() {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
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

    // ✅ If already logged in, go to home
    if (isAuthenticated) {
      navigate("/");
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

        navigate("/");
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

  const handleGoogleLogin = () => {
    Swal.fire({
      title: "Please wait...",
      text: "Signing in with Google...",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const popup = window.open(
      `${BASE_URL}/auth/google`,
      "_blank",
      "width=500,height=600"
    );

    const receiveMessage = (event) => {
      // ✅ Check for correct origin (important in production)
      if (!event.origin.includes(new URL(BASE_URL).origin)) return;

      const { token, error } = event.data;

      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("rememberMe", "false");
        localStorage.setItem(
          "rememberUntil",
          (Date.now() + 24 * 60 * 60 * 1000).toString()
        );
        Swal.close(); // ✅ Close loading modal
        onLogin();
        navigate("/");
      } else if (error === "UserAlreadyExists") {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: "This Google account is already linked with another login method.",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Google Login Failed",
          text: "Something went wrong during Google login.",
        });
      }

      window.removeEventListener("message", receiveMessage);
      popup?.close();
    };

    window.addEventListener("message", receiveMessage, false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Trophy className="text-[#00ADE5]" size={48} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Log into 'My Account'
            </h2>
          </div>

          <div className="bg-white py-8 px-4 shadow-sm rounded-lg sm:px-10">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-white border text-gray-800 py-2 px-4 rounded-md flex items-center justify-center gap-2 hover:bg-gray-100 mb-6"
            >
              <FcGoogle size={22} />
              Login with Google Account
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or use your LeagueRepublic account...
                </span>
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700"
                >
                  Username or Email
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  className={`mt-1 block w-full border ${
                    errors.username ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#00ADE5] focus:border-[#00ADE5]`}
                />
                {errors.username && (
                  <p className="text-red-600 text-sm mt-1">{errors.username}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`mt-1 block w-full border ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#00ADE5] focus:border-[#00ADE5]`}
                />
                {errors.password && (
                  <p className="text-red-600 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="h-4 w-4 text-[#00ADE5] focus:ring-[#00ADE5] border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Remember Me
                  </label>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#003366] hover:bg-[#002244] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00ADE5]"
                >
                  Login
                </button>
              </div>
            </form>

            <div className="mt-6">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:underline"
              >
                Lost password
              </Link>
            </div>
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
