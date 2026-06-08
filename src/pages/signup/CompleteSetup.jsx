import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  UserRound,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";
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
  const [usernameStatus, setUsernameStatus] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem("signupEmail");
    if (!storedEmail) {
      navigate("/signup");
    }
    setEmail(storedEmail);
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
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

  const password = formData.password;

  const passwordRules = [
    {
      label: "Be at least 8 characters in length",
      met: password.length >= 8,
    },
    {
      label: "Contain at least one upper case letter",
      met: /[A-Z]/.test(password),
    },
    {
      label: "Contain at least one lower case letter",
      met: /[a-z]/.test(password),
    },
    {
      label: "Contain at least one number",
      met: /\d/.test(password),
    },
  ];

  const passwordMeetsCriteria = passwordRules.every((r) => r.met);

  const inputClass =
    "mt-1.5 block w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3.5 text-gray-900 shadow-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-[#00ADE5]/30 focus:border-[#00ADE5]";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/80 to-indigo-100/60">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10 sm:py-14 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg space-y-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00ADE5] to-[#0088cc] blur-xl opacity-40 scale-150" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#003366] to-[#004080] shadow-lg shadow-[#003366]/25">
                  <UserRound
                    className="h-8 w-8 text-white"
                    strokeWidth={1.75}
                  />
                </div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#00ADE5]/30 bg-white/90 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#003366] shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-[#00ADE5]" />
              Almost there
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
              Complete your profile
            </h1>
            <p className="text-base text-gray-600 max-w-md mx-auto leading-relaxed">
              Add your name, choose a username, and set a secure password. Your
              email is already verified.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200/80 bg-white/90 p-8 sm:p-9 shadow-xl shadow-gray-200/50 backdrop-blur-sm ring-1 ring-gray-100">
            <div className="mb-8 flex items-center gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50/80 px-4 py-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              <p className="text-sm font-medium text-emerald-900">
                Email verified — you&apos;re signed in to finish account setup.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    First name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className={inputClass}
                    autoComplete="given-name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Last name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className={inputClass}
                    autoComplete="family-name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Username <span className="text-red-500">*</span>
                  <span className="ml-1 font-normal text-gray-500">
                    (6–8 characters)
                  </span>
                </label>
                <div className="relative mt-1.5">
                  <input
                    type="text"
                    name="username"
                    maxLength={8}
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className={`${inputClass} pr-11 ${
                      usernameStatus === "taken"
                        ? "border-red-400 focus:ring-red-200 focus:border-red-400"
                        : ""
                    }`}
                    autoComplete="username"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                    {checkingUsername && (
                      <Loader2 className="h-5 w-5 animate-spin text-[#00ADE5]" />
                    )}
                    {!checkingUsername && usernameStatus === "available" && (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    )}
                  </div>
                </div>
                {usernameStatus === "taken" && (
                  <p className="mt-1.5 text-sm font-medium text-red-600">
                    This username is not available
                  </p>
                )}
                {usernameStatus === "available" && (
                  <p className="mt-1.5 text-sm font-medium text-emerald-700">
                    Username is available
                  </p>
                )}
                {usernameStatus === "error" && (
                  <p className="mt-1.5 text-sm font-medium text-red-500">
                    Could not check username — try again
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1.5">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`${inputClass} pr-24`}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center gap-1 px-3 text-sm font-semibold text-[#003366] hover:text-[#00ADE5] transition-colors"
                  >
                    {showPassword ? (
                      <>
                        <EyeOff className="h-4 w-4" />
                        Hide
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" />
                        Show
                      </>
                    )}
                  </button>
                </div>
                <div className="mt-4 rounded-xl border border-gray-100 bg-slate-50/80 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                    Password requirements
                  </p>
                  <ul className="mt-3 space-y-2.5">
                    {passwordRules.map((rule) => (
                      <li
                        key={rule.label}
                        className="flex items-start gap-2.5 text-sm"
                      >
                        {rule.met ? (
                          <CheckCircle2
                            className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                            aria-hidden
                          />
                        ) : (
                          <XCircle
                            className="mt-0.5 h-4 w-4 shrink-0 text-red-500"
                            aria-hidden
                          />
                        )}
                        <span
                          className={
                            rule.met ? "text-gray-800" : "text-gray-600"
                          }
                        >
                          {rule.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  !passwordMeetsCriteria ||
                  usernameStatus !== "available"
                }
                className="mt-2 w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-[#003366] to-[#004080] shadow-md shadow-[#003366]/20 hover:from-[#002244] hover:to-[#003366] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#00ADE5] disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none disabled:cursor-not-allowed disabled:opacity-90 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2
                      className="h-5 w-5 shrink-0 animate-spin"
                      aria-hidden
                    />
                    <span>Creating your account…</span>
                  </>
                ) : (
                  "Create new account"
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
