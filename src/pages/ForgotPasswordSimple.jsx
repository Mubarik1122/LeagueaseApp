import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  KeyRound,
  Mail,
  ShieldCheck,
  Lock,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import Swal from "sweetalert2";
import { authAPI } from "../services/api";
import Navbar from "../components/Navbar";
import PoweredBy4SOV from "../components/PoweredBy4SOV";

const STEPS = [
  { n: 1, label: "Email" },
  { n: 2, label: "Verify" },
  { n: 3, label: "New password" },
];

function StepDots({ step }) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {STEPS.map((s, i) => (
        <div key={s.n} className="flex items-center gap-2 sm:gap-3">
          {i > 0 && (
            <div
              className={`h-0.5 w-6 rounded-full sm:w-10 ${
                step > s.n - 1 ? "bg-emerald-500" : "bg-gray-200"
              }`}
            />
          )}
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all sm:h-10 sm:w-10 ${
              step === s.n
                ? "bg-gradient-to-br from-[#003366] to-[#004080] text-white shadow-lg shadow-[#003366]/30 ring-4 ring-[#00ADE5]/20"
                : step > s.n
                  ? "bg-emerald-500 text-white"
                  : "border-2 border-gray-200 bg-white text-gray-400"
            }`}
          >
            {step > s.n ? "✓" : s.n}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ForgotPasswordSimple() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const t = setInterval(() => {
      setResendSeconds((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [resendSeconds]);

  const passwordRules = [
    { label: "At least 8 characters", met: formData.newPassword.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(formData.newPassword) },
    { label: "One lowercase letter", met: /[a-z]/.test(formData.newPassword) },
    { label: "One number", met: /\d/.test(formData.newPassword) },
  ];
  const passwordOk = passwordRules.every((r) => r.met);

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      setErrors({ email: "Email is required" });
      return false;
    }
    if (!emailRegex.test(formData.email)) {
      setErrors({ email: "Please enter a valid email address" });
      return false;
    }
    setErrors({});
    return true;
  };

  const validateOTP = () => {
    if (!formData.otp.trim() || formData.otp.length !== 6) {
      setErrors({ otp: "Enter the 6-digit code" });
      return false;
    }
    setErrors({});
    return true;
  };

  const validatePassword = () => {
    const newErrors = {};
    if (!passwordOk) {
      newErrors.newPassword = "Please meet all password requirements";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;

    setLoading(true);
    try {
      const result = await authAPI.requestOTP(formData.email.trim());

      const data = result.data || {};

      if (data.userAlreadyExists === false && data.isVerified && !data.isUserCreated) {
        Swal.fire({
          icon: "info",
          title: "Complete signup first",
          text:
            data.message ||
            "This email is not registered yet. Please finish creating your account.",
          confirmButtonText: "OK",
        });
        return;
      }

      if (result.errorCode === 0) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Code sent",
          text: "Check your inbox for the verification code.",
          timer: 2200,
          showConfirmButton: false,
        });
        setResendSeconds(60);
        setStep(2);
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Unable to send code",
        text:
          err.message ||
          "We couldn’t send a code to this email. Check the address or try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!validateOTP()) return;

    setLoading(true);
    try {
      const result = await authAPI.verifyOTP(
        formData.email.trim(),
        formData.otp
      );

      if (result.errorCode === 0 && result.data?.verified) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Verified",
          timer: 1800,
          showConfirmButton: false,
        });
        setStep(3);
      } else {
        Swal.fire({
          icon: "error",
          title: "Invalid code",
          text:
            result.errorMessage ||
            result.data?.message ||
            "The code is wrong or expired. Try again or request a new one.",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Verification failed",
        text: err.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setLoading(true);
    try {
      const result = await authAPI.forgotPassword(
        formData.email.trim(),
        formData.newPassword
      );

      if (result.errorCode === 0) {
        Swal.fire({
          icon: "success",
          title: "Password updated",
          text: "You can now sign in with your new password.",
          confirmButtonText: "Go to login",
          confirmButtonColor: "#003366",
        }).then(() => navigate("/login"));
      } else {
        Swal.fire({
          icon: "error",
          title: "Could not reset",
          text: result.errorMessage || "Please try again.",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Something went wrong. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendSeconds > 0) return;
    try {
      const result = await authAPI.requestOTP(formData.email.trim());
      if (result.errorCode === 0) {
        setResendSeconds(60);
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "New code sent",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Resend failed",
        text: "Could not resend the code. Try again shortly.",
      });
    }
  };

  const inputClass = (field) =>
    `mt-1.5 block w-full rounded-xl border bg-white py-2.5 pl-11 pr-3 text-gray-900 shadow-sm transition-shadow focus:border-[#00ADE5] focus:outline-none focus:ring-2 focus:ring-[#00ADE5]/25 ${
      errors[field] ? "border-red-400" : "border-gray-200"
    }`;

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-gradient-to-br from-slate-100 via-sky-50/90 to-indigo-100/70">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,173,229,0.14),transparent)]"
        aria-hidden
      />
      <Navbar />
      <main className="relative flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-16 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-5">
            <StepDots step={step} />
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 scale-150 rounded-full bg-gradient-to-r from-[#00ADE5] to-[#0088cc] opacity-35 blur-xl" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#003366] to-[#004080] shadow-lg shadow-[#003366]/25 ring-4 ring-white/70">
                  {step === 1 && (
                    <Mail className="h-8 w-8 text-white" strokeWidth={1.75} />
                  )}
                  {step === 2 && (
                    <ShieldCheck
                      className="h-8 w-8 text-white"
                      strokeWidth={1.75}
                    />
                  )}
                  {step === 3 && (
                    <Lock className="h-8 w-8 text-white" strokeWidth={1.75} />
                  )}
                </div>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {step === 1 && "Reset password"}
                {step === 2 && "Enter verification code"}
                {step === 3 && "Choose new password"}
              </h1>
              <p className="mt-2 text-base text-gray-600 leading-relaxed">
                {step === 1 &&
                  "We’ll email you a one-time code to confirm it’s you."}
                {step === 2 &&
                  "Enter the 6-digit code we sent to your inbox."}
                {step === 3 &&
                  "Create a strong password you haven’t used here before."}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200/80 bg-white/90 p-7 shadow-xl shadow-gray-200/50 backdrop-blur-sm ring-1 ring-gray-100 sm:p-9">
            {step === 1 && (
              <form onSubmit={handleRequestOTP} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-800">
                    Email address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-1.5">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`${inputClass("email")} !pl-11`}
                      placeholder="you@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1.5 text-sm font-medium text-red-600">
                      {errors.email}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#003366] to-[#004080] py-3.5 text-sm font-semibold text-white shadow-md shadow-[#003366]/20 transition-all hover:from-[#002244] hover:to-[#003366] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00ADE5] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Sending code…
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-5 w-5" />
                      Send verification code
                    </>
                  )}
                </button>
                <div className="text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-[#00ADE5] hover:text-[#0088cc]"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to login
                  </Link>
                </div>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div className="rounded-xl border border-sky-200/80 bg-sky-50/90 p-4 text-left">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#003366]/80">
                    Code sent to
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-900 break-all">
                    {formData.email}
                  </p>
                </div>
                <div>
                  <label className="block text-center text-sm font-semibold text-gray-800">
                    Verification code
                  </label>
                  <input
                    name="otp"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={formData.otp}
                    onChange={(e) =>
                      handleChange({
                        target: {
                          name: "otp",
                          value: e.target.value.replace(/\D/g, ""),
                        },
                      })
                    }
                    className="mx-auto mt-2 block w-full max-w-[13rem] rounded-xl border-2 border-gray-200 py-3.5 text-center text-2xl font-semibold tracking-[0.35em] text-gray-900 placeholder:text-gray-300 focus:border-[#00ADE5] focus:outline-none focus:ring-2 focus:ring-[#00ADE5]/25"
                    placeholder="••••••"
                  />
                  {errors.otp && (
                    <p className="mt-1.5 text-center text-sm font-medium text-red-600">
                      {errors.otp}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading || formData.otp.length !== 6}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#003366] to-[#004080] py-3.5 text-sm font-semibold text-white shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Verifying…
                    </>
                  ) : (
                    "Verify & continue"
                  )}
                </button>
                <div className="flex flex-col items-center gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-between">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendSeconds > 0}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#003366] disabled:text-gray-400"
                  >
                    <RefreshCw className="h-4 w-4" />
                    {resendSeconds > 0
                      ? `Resend in ${resendSeconds}s`
                      : "Resend code"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setFormData((p) => ({ ...p, otp: "" }));
                      setErrors({});
                    }}
                    className="text-sm font-semibold text-gray-600 hover:text-gray-900"
                  >
                    Change email
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/80 px-4 py-3 text-sm font-medium text-emerald-900">
                  Email verified — set a new password for{" "}
                  <span className="font-bold">{formData.email}</span>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800">
                    New password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      name="newPassword"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="block w-full rounded-xl border border-gray-200 py-2.5 pl-3.5 pr-20 text-gray-900 shadow-sm focus:border-[#00ADE5] focus:outline-none focus:ring-2 focus:ring-[#00ADE5]/25"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute inset-y-0 right-0 px-3 text-sm font-semibold text-[#003366]"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="mt-1.5 text-sm text-red-600">
                      {errors.newPassword}
                    </p>
                  )}
                  <ul className="mt-3 space-y-2 rounded-xl border border-gray-100 bg-slate-50/80 p-3">
                    {passwordRules.map((r) => (
                      <li
                        key={r.label}
                        className="flex items-center gap-2 text-sm text-gray-700"
                      >
                        {r.met ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                        ) : (
                          <XCircle className="h-4 w-4 shrink-0 text-red-400" />
                        )}
                        {r.label}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800">
                    Confirm password <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`mt-1.5 block w-full rounded-xl border py-2.5 px-3.5 focus:border-[#00ADE5] focus:outline-none focus:ring-2 focus:ring-[#00ADE5]/25 ${
                      errors.confirmPassword
                        ? "border-red-400"
                        : "border-gray-200"
                    }`}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1.5 text-sm text-red-600">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading || !passwordOk}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#003366] to-[#004080] py-3.5 text-sm font-semibold text-white shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Updating…
                    </>
                  ) : (
                    "Update password"
                  )}
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-xs text-gray-500">
            For security, we only reset passwords after email verification.
          </p>
        </div>
      </main>

      <footer className="relative border-t border-gray-200/80 bg-white/40 py-6 text-center text-sm text-gray-500 backdrop-blur-sm">
        <div className="flex flex-col items-center justify-center gap-4 px-4">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <Link to="/terms" className="hover:text-gray-800 transition-colors">
              Terms
            </Link>
            <span className="text-gray-300" aria-hidden>
              |
            </span>
            <Link to="/privacy" className="hover:text-gray-800 transition-colors">
              Privacy
            </Link>
          </div>
          <PoweredBy4SOV />
        </div>
      </footer>
    </div>
  );
}
