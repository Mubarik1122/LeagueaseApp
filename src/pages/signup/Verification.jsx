import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Loader2,
  ShieldCheck,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import Swal from "sweetalert2";
import { authAPI } from "../../services/api";
import Navbar from "../../components/Navbar";

export default function Verification() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [timer, setTimer] = useState(60);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem("signupEmail");
    if (!storedEmail) {
      navigate("/signup");
    } else {
      setEmail(storedEmail);

      const lastSent = localStorage.getItem("otpSentAt");
      if (lastSent) {
        const secondsPassed = Math.floor(
          (Date.now() - parseInt(lastSent)) / 1000
        );
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

    setIsVerifying(true);
    try {
      const result = await authAPI.verifyOTP(email, verificationCode);

      if (result.errorCode === 0 && result.data?.verified) {
        navigate("/signup/complete");
      } else {
        Swal.fire({
          icon: "error",
          title: "Verification Failed",
          text:
            result.errorMessage ||
            result.data?.message ||
            "Invalid OTP or expired.",
        });
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      Swal.fire({
        icon: "error",
        title: "Unexpected Error",
        text: "Something went wrong. Please try again later.",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setResendDisabled(true);
    setTimer(60);
    localStorage.setItem("otpSentAt", Date.now().toString());

    try {
      const result = await authAPI.requestOTP(email);

      if (result.errorCode === 0) {
        Swal.fire({
          icon: "success",
          title: "OTP Sent",
          text:
            result.data?.message || "A new OTP has been sent to your email.",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Resend Failed",
          text:
            result.errorMessage || "Unable to resend OTP. Please try again.",
        });
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      Swal.fire({
        icon: "error",
        title: "Unexpected Error",
        text: "Something went wrong. Please try again later.",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/80 to-indigo-100/60">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-16 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00ADE5] to-[#0088cc] blur-xl opacity-40 scale-150" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#003366] to-[#004080] shadow-lg shadow-[#003366]/25">
                  <ShieldCheck
                    className="h-8 w-8 text-white"
                    strokeWidth={1.75}
                  />
                </div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#00ADE5]/30 bg-white/90 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#003366] shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-[#00ADE5]" />
              Verify your email
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
              Check your inbox
            </h1>
            <p className="text-base text-gray-600 max-w-sm mx-auto leading-relaxed">
              We&apos;ve sent a 6-digit code. Enter it below to continue setting
              up your account.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200/80 bg-white/90 p-8 shadow-xl shadow-gray-200/50 backdrop-blur-sm ring-1 ring-gray-100">
            <div className="mb-8 flex items-start gap-4 rounded-xl bg-gradient-to-r from-[#003366]/5 to-[#00ADE5]/5 p-4 border border-[#003366]/10">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
                <Mail className="h-5 w-5 text-[#00ADE5]" />
              </div>
              <div className="text-left min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#003366]/80">
                  Code sent to
                </p>
                <p className="mt-0.5 text-sm font-semibold text-gray-900 break-all">
                  {email}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="otp"
                  className="block text-center text-sm font-semibold text-gray-700 mb-3"
                >
                  Enter verification code
                </label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) =>
                    setVerificationCode(e.target.value.replace(/\D/g, ""))
                  }
                  className="block w-full max-w-[14rem] mx-auto text-center text-2xl font-semibold tracking-[0.35em] text-gray-900 placeholder:text-gray-300 border-2 border-gray-200 rounded-xl shadow-inner py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-[#00ADE5] focus:border-[#00ADE5] transition-shadow"
                  placeholder="••••••"
                />
              </div>

              <button
                type="submit"
                disabled={verificationCode.length !== 6 || isVerifying}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-[#003366] to-[#004080] shadow-md shadow-[#003366]/20 hover:from-[#002244] hover:to-[#003366] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#00ADE5] disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none disabled:cursor-not-allowed disabled:opacity-90 transition-all"
              >
                {isVerifying ? (
                  <>
                    <Loader2
                      className="h-5 w-5 shrink-0 animate-spin"
                      aria-hidden
                    />
                    <span>Verifying…</span>
                  </>
                ) : (
                  "Verify & continue"
                )}
              </button>

              <div className="pt-2 text-center">
                {resendDisabled ? (
                  <p className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-gray-600">
                    <span className="font-medium tabular-nums text-[#003366]">
                      {timer}s
                    </span>
                    <span>until you can resend the code</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#00ADE5]/40 bg-white px-5 py-2.5 text-sm font-semibold text-[#003366] hover:bg-[#00ADE5]/5 hover:border-[#00ADE5] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00ADE5] focus-visible:ring-offset-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Resend code
                  </button>
                )}
              </div>
            </form>

            <p className="mt-8 text-center text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-6">
              Didn&apos;t receive the code? Check your spam or junk folder, or
              try resending after the timer.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
