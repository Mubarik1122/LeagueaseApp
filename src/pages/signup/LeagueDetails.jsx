import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CalendarDays,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import SignupStepper from "../../components/signup/SignupStepper";

const COUNTRIES = [
  "United States",
  "Pakistan",
  "India",
  "Bangladesh",
  "United Kingdom",
  "Australia",
  "Canada",
  "Germany",
  "France",
  "China",
  "Japan",
  "Brazil",
];

const INITIAL_FORM = {
  leagueName: "",
  country: "United States",
  seasonName: "",
  seasonStartDate: "",
  seasonEndDate: "",
};

function parseIsoDate(str) {
  if (!str || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
  const [y, m, d] = str.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function toIsoDate(date) {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function FieldLabel({ children, required }) {
  return (
    <label className="block text-sm font-semibold text-gray-800">
      {children}
      {required && <span className="text-red-500"> *</span>}
    </label>
  );
}

function Hint({ children }) {
  return (
    <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">{children}</p>
  );
}

export default function LeagueDetails() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const errors = {};
    if (!formData.leagueName.trim()) {
      errors.leagueName = "League name is required";
    }
    if (!formData.country) {
      errors.country = "Country is required";
    }
    if (!formData.seasonName.trim()) {
      errors.seasonName = "Season name is required";
    }
    if (!formData.seasonStartDate) {
      errors.seasonStartDate = "Start date is required";
    }
    if (!formData.seasonEndDate) {
      errors.seasonEndDate = "End date is required";
    }

    const start = parseIsoDate(formData.seasonStartDate);
    const end = parseIsoDate(formData.seasonEndDate);
    if (start && end && end < start) {
      errors.seasonEndDate = "End date must be on or after the start date";
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    localStorage.setItem("leagueDetails", JSON.stringify(formData));
    navigate("/signup/website-url");
  };

  const inputClass = (name) =>
    [
      "mt-1.5 block w-full rounded-xl border bg-white py-2.5 px-3.5 text-gray-900 shadow-sm transition-shadow",
      "focus:border-[#00ADE5] focus:outline-none focus:ring-2 focus:ring-[#00ADE5]/25",
      formErrors[name] ? "border-red-400" : "border-gray-200",
    ].join(" ");

  const datePickerInputClass = (name) =>
    `${inputClass(name)} !pl-11 cursor-pointer`;

  const startDate = parseIsoDate(formData.seasonStartDate);
  const endDate = parseIsoDate(formData.seasonEndDate);

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-gradient-to-br from-slate-100 via-sky-50/90 to-indigo-100/70">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,173,229,0.14),transparent)]"
        aria-hidden
      />
      <Navbar />
      <main className="relative flex-1 px-4 py-10 sm:py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl space-y-8">
          <header className="space-y-5 text-center">
            <SignupStepper currentStep={3} />
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 scale-150 rounded-full bg-gradient-to-r from-[#00ADE5] to-[#0088cc] opacity-35 blur-xl" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#003366] to-[#004080] shadow-lg shadow-[#003366]/25 ring-4 ring-white/70">
                  <ClipboardList
                    className="h-8 w-8 text-white"
                    strokeWidth={1.75}
                  />
                </div>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                League details
              </h1>
              <p className="mx-auto mt-2 max-w-md text-base text-gray-600 leading-relaxed">
                Name your league, set the season, and pick when play begins and
                ends. Everything here can be updated later.
              </p>
            </div>
          </header>

          <section className="rounded-2xl border border-gray-200/80 bg-white/90 p-7 shadow-xl shadow-gray-200/50 backdrop-blur-sm ring-1 ring-gray-100 sm:p-9">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <FieldLabel required>League name</FieldLabel>
                  <Hint>What&apos;s your league called?</Hint>
                  <input
                    type="text"
                    name="leagueName"
                    value={formData.leagueName}
                    onChange={handleChange}
                    className={inputClass("leagueName")}
                    autoComplete="organization"
                    placeholder="e.g. Downtown Sunday League"
                  />
                  {formErrors.leagueName && (
                    <p className="mt-1.5 text-sm font-medium text-red-600">
                      {formErrors.leagueName}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <FieldLabel required>Country</FieldLabel>
                  <Hint>Where does your league take place?</Hint>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className={inputClass("country")}
                  >
                    {COUNTRIES.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                  {formErrors.country && (
                    <p className="mt-1.5 text-sm font-medium text-red-600">
                      {formErrors.country}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <FieldLabel required>Season name</FieldLabel>
                  <Hint>For example 2024–25.</Hint>
                  <input
                    type="text"
                    name="seasonName"
                    value={formData.seasonName}
                    onChange={handleChange}
                    className={inputClass("seasonName")}
                    placeholder="e.g. 2025–26"
                  />
                  {formErrors.seasonName && (
                    <p className="mt-1.5 text-sm font-medium text-red-600">
                      {formErrors.seasonName}
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-[#003366]/10 bg-gradient-to-br from-[#003366]/5 via-white to-sky-50/40 p-5 sm:p-6">
                <div className="mb-4 flex items-center gap-2 border-b border-gray-200/80 pb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-gray-100">
                    <CalendarDays className="h-4 w-4 text-[#00ADE5]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#003366]">
                      Season timeline
                    </p>
                    <p className="text-xs text-gray-500">
                      First and last scheduled match dates
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <FieldLabel required>Season start</FieldLabel>
                    <Hint>First match date</Hint>
                    <div className="relative mt-1.5">
                      <CalendarDays
                        className="pointer-events-none absolute left-3.5 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-gray-400"
                        aria-hidden
                      />
                      <DatePicker
                        selected={startDate}
                        onChange={(date) => {
                          setFormData((prev) => {
                            const next = {
                              ...prev,
                              seasonStartDate: toIsoDate(date),
                            };
                            const end = parseIsoDate(prev.seasonEndDate);
                            if (date && end && end < date) {
                              next.seasonEndDate = "";
                            }
                            return next;
                          });
                          setFormErrors((p) => ({
                            ...p,
                            seasonStartDate: "",
                            seasonEndDate: "",
                          }));
                        }}
                        dateFormat="MMM d, yyyy"
                        placeholderText="Select date"
                        className={datePickerInputClass("seasonStartDate")}
                        wrapperClassName="w-full"
                        calendarClassName="signup-flow-datepicker-calendar"
                        popperClassName="signup-flow-datepicker-popper"
                        showPopperArrow={false}
                      />
                    </div>
                    {formErrors.seasonStartDate && (
                      <p className="mt-1.5 text-sm font-medium text-red-600">
                        {formErrors.seasonStartDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <FieldLabel required>Season end</FieldLabel>
                    <Hint>Last match date</Hint>
                    <div className="relative mt-1.5">
                      <CalendarDays
                        className="pointer-events-none absolute left-3.5 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-gray-400"
                        aria-hidden
                      />
                      <DatePicker
                        selected={endDate}
                        onChange={(date) => {
                          setFormData((prev) => ({
                            ...prev,
                            seasonEndDate: toIsoDate(date),
                          }));
                          setFormErrors((p) => ({ ...p, seasonEndDate: "" }));
                        }}
                        minDate={startDate || undefined}
                        dateFormat="MMM d, yyyy"
                        placeholderText="Select date"
                        className={datePickerInputClass("seasonEndDate")}
                        wrapperClassName="w-full"
                        calendarClassName="signup-flow-datepicker-calendar"
                        popperClassName="signup-flow-datepicker-popper"
                        showPopperArrow={false}
                      />
                    </div>
                    {formErrors.seasonEndDate && (
                      <p className="mt-1.5 text-sm font-medium text-red-600">
                        {formErrors.seasonEndDate}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={() => navigate("/signup/sport-selection")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:border-gray-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00ADE5] focus-visible:ring-offset-2"
                >
                  <ChevronLeft className="h-5 w-5 shrink-0" />
                  Previous
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#003366] to-[#004080] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[#003366]/20 transition-all hover:from-[#002244] hover:to-[#003366] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#00ADE5]"
                >
                  Continue
                  <ChevronRight className="h-5 w-5 shrink-0" />
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
