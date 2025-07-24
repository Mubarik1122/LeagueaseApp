import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.jsx";
import Swal from "sweetalert2";

export default function Verification() {
  const navigate = useNavigate();
  const { verifyOTP, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  useEffect(() => {
    const storedEmail = localStorage.getItem("signupEmail");
    if (!storedEmail) {
      navigate("/signup");
    }
    setEmail(storedEmail);
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (verificationCode.length !== 6) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Code",
        text: "Please enter a valid 6-digit verification code.",
      });
      return;
    }

    try {
      await verifyOTP(email, verificationCode);
      
      Swal.fire({
        icon: "success",
        title: "Email Verified",
        text: "Your email has been successfully verified!",
        timer: 2000,
        showConfirmButton: false,
      });
      
      navigate("/signup/complete");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Verification Failed",
        text: error.message || "Invalid verification code. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Please check your email inbox
          </h2>
          <div className="mt-8 flex justify-center">
            <div className="relative">
              <Mail className="w-24 h-24 text-red-500" />
              <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                1
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg shadow">
          <p className="text-gray-600 mb-6">
            Next step is to verify your email address, we've sent an email to
            <br />
            <span className="font-medium">{email}</span>
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter verification code:
              </label>
              <input
                type="text"
                maxLength="6"
                value={verificationCode}
                onChange={(e) =>
                  setVerificationCode(e.target.value.replace(/\D/g, ""))
                }
                className="block w-32 mx-auto text-center border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#00ADE5] focus:border-[#00ADE5]"
                placeholder="123456"
              />
            </div>

            <button
              type="submit"
              disabled={verificationCode.length !== 6 || loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#003366] hover:bg-[#003366] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00ADE5] disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          </form>

          <p className="mt-4 text-sm text-gray-500">
            If you don't receive an email please check your spam folder and if
            it is not there please contact us using the chat facility below.
          </p>
        </div>
      </div>
    </div>
  );
}
