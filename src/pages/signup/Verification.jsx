import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";

export default function Verification() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [timer, setTimer] = useState(60);
  const [resendDisabled, setResendDisabled] = useState(true);

  useEffect(() => {
    const storedEmail = localStorage.getItem("signupEmail");
    if (!storedEmail) {
      navigate("/signup");
    } else {
      setEmail(storedEmail);

      // 🕒 Load timer state from localStorage if it exists
      const lastSent = localStorage.getItem("otpSentAt");
      if (lastSent) {
        const secondsPassed = Math.floor((Date.now() - parseInt(lastSent)) / 1000);
        const remaining = 60 - secondsPassed;
        if (remaining > 0) {
          setTimer(remaining);
          setResendDisabled(true);
        } else {
          setTimer(0);
          setResendDisabled(false);
        }
      }
    }
  }, [navigate]);

  useEffect(() => {
    let countdown;
    if (resendDisabled && timer > 0) {
      countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            setResendDisabled(false);
            clearInterval(countdown);
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(countdown);
  }, [resendDisabled, timer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (verificationCode.length !== 6) return;

    try {
      const BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: verificationCode }),
      });

      const data = await response.json();

      if (response.ok && data.verified) {
        navigate("/signup/complete");
      } else {
        alert(data.message || data.error || "Verification failed");
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  const handleResend = async () => {
    setResendDisabled(true);
    setTimer(60);
    localStorage.setItem("otpSentAt", Date.now().toString());

    try {
      const BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${BASE_URL}/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Resend failed");
      alert("Verification code resent.");
    } catch (err) {
      console.error("Resend OTP error:", err);
      alert("Failed to resend verification code. Please try again.");
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
            A 6-digit code has been sent to:
            <br />
            <span className="font-medium">{email}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                className="block w-40 mx-auto text-center border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#00ADE5] focus:border-[#00ADE5]"
                placeholder="123456"
              />
            </div>

            <button
              type="submit"
              disabled={verificationCode.length !== 6}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#003366] hover:bg-[#002244] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00ADE5] disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Verify
            </button>

            <div className="text-sm mt-4">
              {resendDisabled ? (
                <p className="text-gray-500">
                  Resend available in <span className="font-medium">{timer}</span> seconds
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-blue-600 hover:underline"
                >
                  Resend Code
                </button>
              )}
            </div>
          </form>

          <p className="mt-6 text-sm text-gray-500">
            Didn’t receive the code? Check your spam folder or contact support.
          </p>
        </div>
      </div>
    </div>
  );
}
