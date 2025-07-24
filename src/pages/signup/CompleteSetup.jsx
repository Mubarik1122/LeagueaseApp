import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import Swal from "sweetalert2";

export default function CompleteSetup() {
  const navigate = useNavigate();
  const { signup, verifyUsername, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);

  useEffect(() => {
    const storedEmail = localStorage.getItem("signupEmail");
    if (!storedEmail) {
      navigate("/signup");
    }
    setEmail(storedEmail);
    setFormData((prev) => ({ ...prev, username: storedEmail }));
  }, [navigate]);

  const checkUsername = async (username) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    try {
      setUsernameChecking(true);
      const response = await verifyUsername(username);
      setUsernameAvailable(response.available !== false);
    } catch (error) {
      setUsernameAvailable(false);
    } finally {
      setUsernameChecking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!passwordMeetsCriteria(formData.password)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Password",
        text: "Password must meet all the specified criteria.",
      });
      return;
    }

    if (usernameAvailable === false) {
      Swal.fire({
        icon: "warning",
        title: "Username Unavailable",
        text: "Please choose a different username.",
      });
      return;
    }

    try {
      const signupData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: email,
        username: formData.username,
        password: formData.password,
      };

      await signup(signupData);
      
      // Store user data for league creation
      localStorage.setItem("userData", JSON.stringify(signupData));
      
      Swal.fire({
        icon: "success",
        title: "Account Created",
        text: "Your account has been created successfully!",
        timer: 2000,
        showConfirmButton: false,
      });
      
      // Navigate to league type selection
      navigate("/signup/league-type");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Signup Failed",
        text: error.message || "Failed to create account. Please try again.",
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Check username availability when username changes
    if (name === 'username') {
      setUsernameAvailable(null);
      const timeoutId = setTimeout(() => {
        checkUsername(value);
      }, 500);
      
      return () => clearTimeout(timeoutId);
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            Complete account setup
          </h2>
        </div>

        <div className="bg-white p-8 rounded-lg shadow">
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
            <div className="flex">
              <CheckCircle className="text-green-400 mr-2" size={20} />
              <p className="text-sm text-green-700">
                Thanks for verifying your email address
              </p>
            </div>
          </div>

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
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                onBlur={() => checkUsername(formData.username)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#00ADE5] focus:border-[#00ADE5]"
              />
              {usernameChecking && (
                <p className="mt-1 text-sm text-gray-500">Checking availability...</p>
              )}
              {usernameAvailable === true && (
                <p className="mt-1 text-sm text-green-600">✓ Username is available</p>
              )}
              {usernameAvailable === false && (
                <p className="mt-1 text-sm text-red-600">✗ Username is not available</p>
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
                usernameAvailable === false || 
                usernameChecking ||
                loading
              }
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#003366] hover:bg-[#003366] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00ADE5] disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Create new account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}