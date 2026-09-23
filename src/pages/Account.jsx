import { useMemo, useState } from "react";
import {
  User,
  Mail,
  Key,
  Shield,
  Save,
  Eye,
  EyeOff,
  Info,
} from "lucide-react";
import Swal from "sweetalert2";
import { useAuthContext } from "../context/AuthContext";

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-gray-900 shadow-sm transition placeholder:text-gray-400 focus:border-[#00ADE5] focus:outline-none focus:ring-2 focus:ring-[#00ADE5]/20";

function SectionCard({ icon: Icon, title, description, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-gray-100 bg-gradient-to-r from-[#003366]/[0.04] to-[#00ADE5]/[0.06] px-5 py-4 sm:px-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
          <Icon className="h-5 w-5 text-[#00ADE5]" strokeWidth={2} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
          {description && (
            <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-4 p-5 sm:p-6">{children}</div>
    </div>
  );
}

function Field({ label, required, hint, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-gray-600">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

function PasswordField({
  name,
  value,
  onChange,
  placeholder,
  show,
  onToggle,
}) {
  return (
    <div className="relative">
      <Key
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#00ADE5]"
        strokeWidth={2}
      />
      <input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete="new-password"
        className={`${inputClass} pr-11`}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-gray-400 transition hover:text-[#003366]"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

export default function Account() {
  const { user } = useAuthContext();

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [saving, setSaving] = useState(false);

  const displayName = useMemo(() => {
    if (formData.firstName || formData.lastName) {
      return [formData.firstName, formData.lastName].filter(Boolean).join(" ");
    }
    return formData.email || "Your account";
  }, [formData.firstName, formData.lastName, formData.email]);

  const initials = useMemo(() => {
    const first = formData.firstName?.[0] || formData.email?.[0] || "U";
    const last = formData.lastName?.[0] || "";
    return `${first}${last}`.toUpperCase();
  }, [formData.firstName, formData.lastName, formData.email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing name",
        text: "Please enter both first and last name.",
        confirmButtonColor: "#00ADE5",
      });
      return;
    }

    if (!formData.email.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Email required",
        text: "Please provide a valid email address.",
        confirmButtonColor: "#00ADE5",
      });
      return;
    }

    const changingPassword =
      formData.currentPassword ||
      formData.newPassword ||
      formData.confirmPassword;

    if (changingPassword) {
      if (!formData.currentPassword) {
        Swal.fire({
          icon: "warning",
          title: "Current password required",
          text: "Enter your current password to set a new one.",
          confirmButtonColor: "#00ADE5",
        });
        return;
      }
      if (formData.newPassword.length < 8) {
        Swal.fire({
          icon: "warning",
          title: "Password too short",
          text: "New password must be at least 8 characters.",
          confirmButtonColor: "#00ADE5",
        });
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        Swal.fire({
          icon: "error",
          title: "Passwords do not match",
          text: "New password and confirmation must be the same.",
          confirmButtonColor: "#00ADE5",
        });
        return;
      }
    }

    setSaving(true);
    try {
      // TODO: Wire to account update / change-password API
      await new Promise((r) => setTimeout(r, 400));
      await Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Account updated",
        timer: 2200,
        showConfirmButton: false,
      });
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-6 sm:py-8">
      {/* Profile banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#003366] via-[#003d7a] to-[#004080] text-white shadow-xl shadow-[#003366]/20">
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[#00ADE5]/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 left-1/3 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-xl font-bold backdrop-blur-sm ring-2 ring-white/20 sm:h-20 sm:w-20 sm:text-2xl">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">
                My Account
              </p>
              <h1 className="mt-1 truncate text-2xl font-bold sm:text-3xl">
                {displayName}
              </h1>
              <p className="mt-1 truncate text-sm text-blue-100">
                {formData.email || "No email on file"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-100 backdrop-blur-sm">
              Profile & security
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <SectionCard
          icon={User}
          title="Personal information"
          description="Your name and contact details used across Leaguease"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="First name" required>
              <div className="relative">
                <User
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#00ADE5]"
                  strokeWidth={2}
                />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First name"
                  className={inputClass}
                />
              </div>
            </Field>
            <Field label="Last name" required>
              <div className="relative">
                <User
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#00ADE5]"
                  strokeWidth={2}
                />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last name"
                  className={inputClass}
                />
              </div>
            </Field>
          </div>

          <Field
            label="Email address"
            required
            hint="Used for login and important league notifications"
          >
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#00ADE5]"
                strokeWidth={2}
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>
          </Field>
        </SectionCard>

        <SectionCard
          icon={Shield}
          title="Security"
          description="Leave blank to keep your current password. New passwords need at least 8 characters."
        >
          <div className="space-y-4">
            <Field label="Current password">
              <PasswordField
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Enter current password"
                show={showPasswords.current}
                onToggle={() =>
                  setShowPasswords((p) => ({ ...p, current: !p.current }))
                }
              />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="New password">
                <PasswordField
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  show={showPasswords.next}
                  onToggle={() =>
                    setShowPasswords((p) => ({ ...p, next: !p.next }))
                  }
                />
              </Field>
              <Field label="Confirm new password">
                <PasswordField
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat new password"
                  show={showPasswords.confirm}
                  onToggle={() =>
                    setShowPasswords((p) => ({ ...p, confirm: !p.confirm }))
                  }
                />
              </Field>
            </div>
          </div>
        </SectionCard>

        <div className="flex items-start gap-3 rounded-2xl border border-[#00ADE5]/20 bg-[#00ADE5]/5 px-4 py-3.5 sm:px-5">
          <Info
            className="mt-0.5 h-4 w-4 shrink-0 text-[#00ADE5]"
            strokeWidth={2}
          />
          <p className="text-xs leading-relaxed text-gray-600 sm:text-sm">
            Keep your profile details up to date so teammates and league
            admins can reach you. Password changes take effect on your next
            login.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#003366]/15 bg-white px-5 py-2.5 text-sm font-semibold text-[#003366] shadow-sm transition hover:border-[#00ADE5] hover:bg-[#00ADE5]/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00ADE5] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#00ADE5]/25 transition hover:bg-[#0099c7] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" strokeWidth={2.25} />
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
