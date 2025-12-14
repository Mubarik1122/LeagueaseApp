import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import Swal from "sweetalert2";
import { authAPI } from "../../services/api";
import Navbar from "../../components/Navbar";

export default function CompleteSetup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null); // "available", "taken", "error", null
  const [checkingUsername, setCheckingUsername] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem("signupEmail");
    if (!storedEmail) {
      navigate("/signup");
    }
    setEmail(storedEmail);
    // Optionally set username default from email prefix
    // setFormData((prev) => ({ ...prev, username: storedEmail.split("@")[0] }));
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await authAPI.signup({
        ...formData,
        email,
      });

      if (result.errorCode === 1) {
        Swal.fire({
          icon: "error",
          title: "Signup Failed",
          text:
            result.errorMessage || "Something went wrong. Please try again.",
        });
        console.error("Signup error:", result.errorMessage);
        return;
      }

      navigate("/signup/league-type");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "An unexpected error occurred. Please try again later.",
      });
      console.error("Signup request failed:", err);
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "username") {
      setUsernameStatus(null);

      const trimmed = value.trim();
      if (trimmed.length >= 6 && trimmed.length <= 8) {
        setCheckingUsername(true);
        try {
          const data = await authAPI.verifyUsername(trimmed);

          if (data.data.exists) {
            setUsernameStatus("taken");
          } else {
            setUsernameStatus("available");
          }
        } catch (err) {
          setUsernameStatus("error");
        } finally {
          setCheckingUsername(false);
        }
      } else {
        setUsernameStatus(null);
      }
    }
  };

  const passwordMeetsCriteria = (password) => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password)
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
          <div className="max-w-md w-full space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 text-center">
                Complete account setup
              </h2>
            </div>

            <div className="bg-white p-8 rounded-lg shadow">
              {/* <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
            <div className="flex">
              <CheckCircle className="text-green-400 mr-2" size={20} />
              <p className="text-sm text-green-700">
                Thanks for verifying your email address
              </p>
            </div>
          </div> */}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      First name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#00ADE5] focus:border-[#00ADE5]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Last name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#00ADE5] focus:border-[#00ADE5]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Username *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="username"
                      maxLength={8} // <-- Limit input to 8 characters
                      required
                      value={formData.username}
                      onChange={handleChange}
                      className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none ${
                        usernameStatus === "taken"
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-[#00ADE5] focus:border-[#00ADE5]"
                      }`}
                    />
                    {usernameStatus === "available" && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600">
                        ✔
                      </span>
                    )}
                  </div>
                  {usernameStatus === "taken" && (
                    <p className="mt-1 text-sm text-red-600">
                      Username not available
                    </p>
                  )}
                  {usernameStatus === "available" && (
                    <p className="mt-1 text-sm text-green-600">
                      Username is available
                    </p>
                  )}
                  {usernameStatus === "error" && (
                    <p className="mt-1 text-sm text-red-500">
                      Error checking username
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Password *
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pr-16 focus:outline-none focus:ring-[#00ADE5] focus:border-[#00ADE5]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-sm text-gray-600 hover:text-gray-800"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Passwords must:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>be at least 8 characters in length</li>
                      <li>contain at least one upper case letter</li>
                      <li>contain at least one lower case letter</li>
                      <li>contain at least one number</li>
                    </ul>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={
                    !passwordMeetsCriteria(formData.password) ||
                    usernameStatus !== "available"
                  }
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#003366] hover:bg-[#003366] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00ADE5] disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Create new account
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
