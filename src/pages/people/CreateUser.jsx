import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  KeyRound,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  Shield,
  User,
  UserPlus,
} from "lucide-react";
import Swal from "sweetalert2";
import clsx from "clsx";
import { useUsers } from "../../hooks/useUsers";
import { USER_ROLE_FILTER_OPTIONS } from "../../utils/companyUserFilters";
import FieldAvailabilityHint, {
  getFieldCheckInputClass,
} from "../../components/FieldAvailabilityHint";
import { useCompanyUserFieldCheck } from "../../hooks/useCompanyUserFieldCheck";

const ASSIGNABLE_ROLES = USER_ROLE_FILTER_OPTIONS.filter((r) => r !== "All");

const todayIso = new Date().toISOString().slice(0, 10);

const emptyForm = () => ({
  firstName: "",
  middleInitial: "",
  lastName: "",
  dateOfBirth: "",
  email: "",
  username: "",
  password: "",
  confirmPassword: "",
  selectedRoles: ["Player"],
  contactUsPreference: "",
  internalReference1: "",
  internalReference2: "",
  workPhone: "",
  homePhone: "",
  mobilePhone: "",
  houseName: "",
  houseNumber: "",
  addressLine1: "",
  addressLine2: "",
  addressLine3: "",
  townCity: "",
  county: "",
  postcode: "",
});

function userToForm(user) {
  const addr = user?.address || {};
  let dateOfBirth = "";
  if (user?.dateOfBirth) {
    const parsed = new Date(user.dateOfBirth);
    if (!Number.isNaN(parsed.getTime())) {
      dateOfBirth = parsed.toISOString().slice(0, 10);
    }
  }

  const roles =
    Array.isArray(user?.roles) && user.roles.length
      ? user.roles
      : user?.role && user.role !== "—"
        ? user.role.split(", ").map((r) => r.trim()).filter(Boolean)
        : ["Player"];

  const contactUsPreference =
    user?.contactUsPreference === true
      ? "yes"
      : user?.contactUsPreference === false
        ? "no"
        : "";

  return {
    firstName: user?.firstName || "",
    middleInitial: user?.middleInitial || "",
    lastName: user?.lastName || "",
    dateOfBirth,
    email: user?.email || "",
    username: user?.username || "",
    password: "",
    confirmPassword: "",
    selectedRoles: roles,
    contactUsPreference,
    internalReference1: user?.internalReference1 || "",
    internalReference2: user?.internalReference2 || "",
    workPhone: user?.workPhone || "",
    homePhone: user?.homePhone || "",
    mobilePhone: user?.mobilePhone || "",
    houseName: addr.houseName || "",
    houseNumber: addr.houseNumber || "",
    addressLine1: addr.line1 || "",
    addressLine2: addr.line2 || "",
    addressLine3: addr.line3 || "",
    townCity: addr.city || "",
    county: addr.county || "",
    postcode: addr.postalCode || "",
  };
}

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm transition focus:border-[#00ADE5] focus:outline-none focus:ring-2 focus:ring-[#00ADE5]/20";

function SectionCard({ icon: Icon, title, description, children, step }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-gray-100 bg-gradient-to-r from-[#003366]/[0.04] to-[#00ADE5]/[0.06] px-5 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
          {step ? (
            <span className="text-sm font-bold text-[#003366]">{step}</span>
          ) : (
            <Icon className="h-5 w-5 text-[#00ADE5]" />
          )}
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
          {description && (
            <p className="mt-0.5 text-xs text-gray-500">{description}</p>
          )}
        </div>
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </div>
  );
}

function Field({ label, required, children, hint, className }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-semibold text-gray-600">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

export default function CreateUser({ onBack, onSuccess, editUser = null }) {
  const { createUser, updateUser } = useUsers();
  const isEdit = Boolean(editUser?.userId);
  const [form, setForm] = useState(() =>
    isEdit ? userToForm(editUser) : emptyForm()
  );
  const [saving, setSaving] = useState(false);
  const {
    scheduleCheck,
    getCheck,
    hasSaveBlockingChecks,
    clearChecks,
  } = useCompanyUserFieldCheck({
    excludeUserId: isEdit ? editUser?.userId : null,
  });
  const [showOptional, setShowOptional] = useState(
    () =>
      isEdit &&
      Boolean(
        editUser?.workPhone ||
          editUser?.homePhone ||
          editUser?.mobilePhone ||
          editUser?.internalReference1 ||
          editUser?.internalReference2 ||
          editUser?.address
      )
  );

  useEffect(() => {
    if (isEdit && editUser) {
      setForm(userToForm(editUser));
      clearChecks();
    }
  }, [isEdit, editUser?.userId, editUser?.updatedAt, clearChecks]);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "email") {
      scheduleCheck("email", "email", value);
    }
    if (key === "username") {
      scheduleCheck("username", "username", value);
    }
  };

  const toggleRole = (role) => {
    setForm((prev) => {
      const has = prev.selectedRoles.includes(role);
      const next = has
        ? prev.selectedRoles.filter((r) => r !== role)
        : [...prev.selectedRoles, role];
      return { ...prev, selectedRoles: next };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Required fields",
        text: "First name, last name and email are required.",
      });
      return;
    }

    if (!form.username.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Username required",
        text: "Please enter a username for this user.",
      });
      return;
    }

    if (hasSaveBlockingChecks()) {
      Swal.fire({
        icon: "warning",
        title: "Availability check required",
        text: "Email or username is invalid, duplicate, or still being verified.",
      });
      return;
    }

    if (!isEdit) {
      if (!form.password) {
        Swal.fire({ icon: "warning", title: "Password required" });
        return;
      }
      if (form.password !== form.confirmPassword) {
        Swal.fire({
          icon: "warning",
          title: "Passwords do not match",
        });
        return;
      }
    } else if (form.password || form.confirmPassword) {
      if (!form.password || form.password !== form.confirmPassword) {
        Swal.fire({
          icon: "warning",
          title: "Passwords do not match",
          text: "Leave both password fields blank to keep the current password.",
        });
        return;
      }
    }

    setSaving(true);
    try {
      const roles =
        form.selectedRoles.length > 0 ? form.selectedRoles : ["Player"];

      const payload = {
        firstName: form.firstName.trim(),
        middleInitial: form.middleInitial.trim() || null,
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        username: form.username.trim(),
        roles,
        contactUsPreference:
          form.contactUsPreference === ""
            ? null
            : form.contactUsPreference === "yes",
        internalReference1: form.internalReference1.trim() || null,
        internalReference2: form.internalReference2.trim() || null,
        workPhone: form.workPhone.trim() || null,
        homePhone: form.homePhone.trim() || null,
        mobilePhone: form.mobilePhone.trim() || null,
        address: {
          houseName: form.houseName.trim() || null,
          houseNumber: form.houseNumber.trim() || null,
          line1: form.addressLine1.trim() || null,
          line2: form.addressLine2.trim() || null,
          line3: form.addressLine3.trim() || null,
          city: form.townCity.trim() || null,
          county: form.county.trim() || null,
          postalCode: form.postcode.trim() || null,
        },
      };

      if (form.dateOfBirth) payload.dateOfBirth = form.dateOfBirth;
      if (form.password) payload.password = form.password;

      const result = isEdit
        ? await updateUser({ userId: editUser.userId, ...payload })
        : await createUser({
            ...payload,
            loginProvider: "Website",
            sendLoginInvite: false,
            password: form.password,
          });

      if (result.success) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: isEdit ? "User updated" : "User created",
          timer: 2000,
          showConfirmButton: false,
        });
        if (!isEdit) setForm(emptyForm());
        onSuccess?.();
      } else {
        Swal.fire({
          icon: "error",
          title: isEdit ? "Update failed" : "Create failed",
          text: result.error,
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.message || "Could not create user.",
      });
    } finally {
      setSaving(false);
    }
  };

  const fullName = [form.firstName, form.lastName].filter(Boolean).join(" ");

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Header */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-[#003366] to-[#004080] px-5 py-5 text-white sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
              {isEdit ? (
                <User className="h-5 w-5" />
              ) : (
                <UserPlus className="h-5 w-5" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold sm:text-xl">
                {isEdit ? "Edit User" : "Create User"}
              </h2>
              <p className="text-sm text-blue-100">
                {isEdit
                  ? "Update profile, login credentials and roles"
                  : "Register a new league member with roles and login access"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to list
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* Main form */}
        <div className="space-y-5 xl:col-span-2">
          <SectionCard
            step="1"
            title="Personal details"
            description="Basic identity information for the new user"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="First name" required>
                <input
                  className={inputClass}
                  value={form.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                  placeholder="Muhammad"
                />
              </Field>
              <Field label="Middle initial">
                <input
                  className={inputClass}
                  maxLength={5}
                  value={form.middleInitial}
                  onChange={(e) => update("middleInitial", e.target.value)}
                  placeholder="A"
                />
              </Field>
              <Field label="Last name" required>
                <input
                  className={inputClass}
                  value={form.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                  placeholder="Muaz"
                />
              </Field>
            </div>

            <Field
              label="Date of birth"
              hint="Optional — used for age verification and records"
              className="sm:max-w-xs"
            >
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#00ADE5]" />
                <input
                  type="date"
                  className={`${inputClass} pl-10 [color-scheme:light]`}
                  value={form.dateOfBirth}
                  max={todayIso}
                  onChange={(e) => update("dateOfBirth", e.target.value)}
                />
              </div>
            </Field>
          </SectionCard>

          <SectionCard
            icon={KeyRound}
            title="Login & email"
            description="Email and sign-in credentials"
          >
            <Field label="Email address" required>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  className={getFieldCheckInputClass(
                    `${inputClass} pl-10`,
                    getCheck("email")
                  )}
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="user@example.com"
                />
              </div>
              <FieldAvailabilityHint check={getCheck("email")} />
            </Field>

            <div className="rounded-xl border border-[#003366]/15 bg-slate-50/80 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#003366]">
                Login credentials
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="Username" required>
                  <input
                    className={getFieldCheckInputClass(
                      inputClass,
                      getCheck("username")
                    )}
                    value={form.username}
                    onChange={(e) => update("username", e.target.value)}
                    placeholder="username"
                  />
                  <FieldAvailabilityHint check={getCheck("username")} />
                </Field>
                <Field
                  label="Password"
                  required={!isEdit}
                  hint={
                    isEdit
                      ? "Leave blank to keep the current password"
                      : undefined
                  }
                >
                  <input
                    type="password"
                    className={inputClass}
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                  />
                </Field>
                <Field
                  label="Confirm password"
                  required={!isEdit}
                  hint={
                    isEdit
                      ? "Only required when changing password"
                      : undefined
                  }
                >
                  <input
                    type="password"
                    className={inputClass}
                    value={form.confirmPassword}
                    onChange={(e) => update("confirmPassword", e.target.value)}
                  />
                </Field>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            icon={Shield}
            title="Roles within the league"
            description="Select one or more roles for this user"
          >
            <div className="flex flex-wrap gap-2">
              {ASSIGNABLE_ROLES.map((role) => {
                const active = form.selectedRoles.includes(role);
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRole(role)}
                    className={clsx(
                      "rounded-xl border px-3.5 py-2 text-sm font-semibold transition",
                      active
                        ? "border-[#003366] bg-gradient-to-r from-[#003366] to-[#004080] text-white shadow-sm"
                        : "border-gray-200 bg-white text-gray-600 hover:border-[#00ADE5]/40 hover:bg-[#00ADE5]/5"
                    )}
                  >
                    {role}
                  </button>
                );
              })}
            </div>
            {form.selectedRoles.length === 0 && (
              <p className="text-xs text-amber-600">
                No role selected — Player will be assigned by default.
              </p>
            )}
          </SectionCard>

          {/* Optional — collapsible */}
          <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setShowOptional((v) => !v)}
              className="flex w-full items-center justify-between gap-3 bg-gradient-to-r from-white to-slate-50/80 px-5 py-4 text-left transition hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                  <MapPin className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Optional details
                  </h3>
                  <p className="text-xs text-gray-500">
                    Contact, references and address (expand to fill)
                  </p>
                </div>
              </div>
              <ChevronDown
                className={clsx(
                  "h-5 w-5 text-gray-400 transition-transform",
                  showOptional && "rotate-180"
                )}
              />
            </button>

            {showOptional && (
              <div className="space-y-4 border-t border-gray-100 p-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Field label="Contact preference">
                    <select
                      className={inputClass}
                      value={form.contactUsPreference}
                      onChange={(e) => update("contactUsPreference", e.target.value)}
                    >
                      <option value="">Select</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </Field>
                  <Field label="Internal reference 1">
                    <input
                      className={inputClass}
                      value={form.internalReference1}
                      onChange={(e) => update("internalReference1", e.target.value)}
                    />
                  </Field>
                  <Field label="Internal reference 2">
                    <input
                      className={inputClass}
                      value={form.internalReference2}
                      onChange={(e) => update("internalReference2", e.target.value)}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Field label="Work phone">
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        className={`${inputClass} pl-10`}
                        value={form.workPhone}
                        onChange={(e) => update("workPhone", e.target.value)}
                      />
                    </div>
                  </Field>
                  <Field label="Home phone">
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        className={`${inputClass} pl-10`}
                        value={form.homePhone}
                        onChange={(e) => update("homePhone", e.target.value)}
                      />
                    </div>
                  </Field>
                  <Field label="Mobile phone">
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        className={`${inputClass} pl-10`}
                        value={form.mobilePhone}
                        onChange={(e) => update("mobilePhone", e.target.value)}
                      />
                    </div>
                  </Field>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="House name">
                    <input className={inputClass} value={form.houseName} onChange={(e) => update("houseName", e.target.value)} />
                  </Field>
                  <Field label="House number">
                    <input className={inputClass} value={form.houseNumber} onChange={(e) => update("houseNumber", e.target.value)} />
                  </Field>
                  <Field label="Address line 1">
                    <input className={inputClass} value={form.addressLine1} onChange={(e) => update("addressLine1", e.target.value)} />
                  </Field>
                  <Field label="Address line 2">
                    <input className={inputClass} value={form.addressLine2} onChange={(e) => update("addressLine2", e.target.value)} />
                  </Field>
                  <Field label="Address line 3">
                    <input className={inputClass} value={form.addressLine3} onChange={(e) => update("addressLine3", e.target.value)} />
                  </Field>
                  <Field label="Town / City">
                    <input className={inputClass} value={form.townCity} onChange={(e) => update("townCity", e.target.value)} />
                  </Field>
                  <Field label="County">
                    <input className={inputClass} value={form.county} onChange={(e) => update("county", e.target.value)} />
                  </Field>
                  <Field label="Postcode / ZIP">
                    <input className={inputClass} value={form.postcode} onChange={(e) => update("postcode", e.target.value)} />
                  </Field>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar summary */}
        <div className="xl:col-span-1">
          <div className="sticky top-20 space-y-4">
            <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
              <div className="border-b border-gray-100 bg-gradient-to-r from-white to-slate-50/80 px-5 py-4">
                <h3 className="text-sm font-bold text-gray-900">Summary</h3>
                <p className="text-xs text-gray-500">
                  {isEdit ? "Review before saving" : "Review before creating"}
                </p>
              </div>
              <div className="space-y-3 p-5 text-sm">
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00ADE5]/10">
                    <User className="h-5 w-5 text-[#00ADE5]" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-900">
                      {fullName || "New user"}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {form.email || "No email yet"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Roles
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(form.selectedRoles.length ? form.selectedRoles : ["Player"]).map(
                      (role) => (
                        <span
                          key={role}
                          className="rounded-full bg-[#00ADE5]/10 px-2.5 py-1 text-xs font-semibold text-[#0088cc]"
                        >
                          {role}
                        </span>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Login method
                  </p>
                  <p className="text-sm text-gray-700">
                    {form.username
                      ? `Username: ${form.username}`
                      : "Not set yet"}
                  </p>
                </div>

                <ul className="space-y-1.5 border-t border-gray-100 pt-3 text-xs text-gray-500">
                  <li className={form.firstName && form.lastName ? "text-emerald-600" : ""}>
                    {form.firstName && form.lastName ? "✓" : "○"} Name provided
                  </li>
                  <li className={form.email ? "text-emerald-600" : ""}>
                    {form.email ? "✓" : "○"} Email provided
                  </li>
                  <li
                    className={
                      form.username &&
                      (isEdit ||
                        (form.password && form.confirmPassword))
                        ? "text-emerald-600"
                        : ""
                    }
                  >
                    {form.username &&
                    (isEdit || (form.password && form.confirmPassword))
                      ? "✓"
                      : "○"}{" "}
                    Login configured
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#003366] to-[#004080] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isEdit ? "Save Changes" : "Create User"}
              </button>
              <button
                type="button"
                onClick={onBack}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
