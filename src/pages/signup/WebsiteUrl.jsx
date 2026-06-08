import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Globe,
  ChevronLeft,
  Link2,
  Info,
  CheckCircle2,
} from "lucide-react";
import Swal from "sweetalert2";
import { authAPI } from "../../services/api";
import Navbar from "../../components/Navbar";
import SignupStepper from "../../components/signup/SignupStepper";

export default function WebsiteUrl() {
  const navigate = useNavigate();
  const [urlType, setUrlType] = useState("suggestion");
  const [customUrl, setCustomUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = localStorage.getItem("signupEmail");
    const leagueDetails = JSON.parse(
      localStorage.getItem("leagueDetails") || "{}"
    );
    const selectedSport = localStorage.getItem("selectedSport");

    const requiredFields = [
      "leagueName",
      "country",
      "seasonName",
      "seasonStartDate",
      "seasonEndDate",
    ];

    const missingFields = requiredFields.filter(
      (field) => !leagueDetails[field]
    );
    if (!selectedSport) missingFields.push("sportName");
    if (!email) missingFields.push("email");

    if (missingFields.length > 0) {
      Swal.fire({
        icon: "warning",
        title: "Missing information",
        text: `Please complete earlier steps: ${missingFields.join(", ")}`,
      });
      return;
    }

    const selectedUrl =
      urlType === "suggestion" ? "4sovtournament2" : customUrl.trim();

    const payload = {
      email,
      ...leagueDetails,
      sportName: selectedSport,
      domainName: selectedUrl || null,
    };

    try {
      const result = await authAPI.createLeague(payload);

      if (result.errorCode === 0) {
        localStorage.removeItem("leagueDetails");
        localStorage.removeItem("selectedSport");
        localStorage.removeItem("websiteUrl");
        localStorage.removeItem("signupEmail");

        Swal.fire({
          icon: "success",
          title: "League created successfully!",
          confirmButtonText: "Go to Login",
          confirmButtonColor: "#003366",
        }).then(() => {
          navigate("/login");
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: result.errorMessage || "Something went wrong!",
        });
      }
    } catch (error) {
      console.error("API Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while creating the league.",
      });
    }
  };

  const suggestionId = "url-suggestion";
  const customId = "url-custom";

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-gradient-to-br from-slate-100 via-sky-50/90 to-indigo-100/70">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,173,229,0.14),transparent)]"
        aria-hidden
      />
      <Navbar />
      <main className="relative flex-1 px-4 py-10 sm:py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-lg space-y-8">
          <header className="space-y-5 text-center">
            <SignupStepper currentStep={4} />
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 scale-150 rounded-full bg-gradient-to-r from-[#00ADE5] to-[#0088cc] opacity-35 blur-xl" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#003366] to-[#004080] shadow-lg shadow-[#003366]/25 ring-4 ring-white/70">
                  <Globe className="h-8 w-8 text-white" strokeWidth={1.75} />
                </div>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Your league website address
              </h1>
              <p className="mx-auto mt-2 max-w-md text-base text-gray-600 leading-relaxed">
                This URL is how players and fans find your public league site.
                You can connect a custom domain later on supported plans.
              </p>
            </div>
          </header>

          <section className="rounded-2xl border border-gray-200/80 bg-white/90 p-7 shadow-xl shadow-gray-200/50 backdrop-blur-sm ring-1 ring-gray-100 sm:p-9">
            <div className="mb-6 flex gap-3 rounded-xl border border-sky-200/80 bg-sky-50/90 p-4 text-left">
              <Info
                className="mt-0.5 h-5 w-5 shrink-0 text-[#00ADE5]"
                aria-hidden
              />
              <div className="space-y-2 text-sm text-gray-700 leading-relaxed">
                <p>
                  Example:{" "}
                  <span className="font-semibold text-[#003366]">
                    https://myleague.leaguerepublic.com
                  </span>
                </p>
                <p className="text-gray-600">
                  Gold plans can use your own domain (e.g.{" "}
                  <span className="font-medium">myleague.com</span>).
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-gray-800">
                  Choose an address
                </legend>

                <label
                  htmlFor={suggestionId}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all ${
                    urlType === "suggestion"
                      ? "border-[#00ADE5] bg-[#00ADE5]/5 ring-1 ring-[#00ADE5]/20"
                      : "border-gray-200 hover:border-gray-300 hover:bg-slate-50/80"
                  }`}
                >
                  <input
                    id={suggestionId}
                    type="radio"
                    name="urlType"
                    checked={urlType === "suggestion"}
                    onChange={() => setUrlType("suggestion")}
                    className="mt-1 h-4 w-4 border-gray-300 text-[#00ADE5] focus:ring-[#00ADE5]"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="font-semibold text-gray-900">
                      Suggested subdomain
                    </span>
                    <p className="mt-1 flex flex-wrap items-center gap-1 text-sm text-gray-600">
                      <Link2 className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                      <span className="break-all font-mono text-[#003366]">
                        https://4sovtournament2.leaguerepublic.com
                      </span>
                    </p>
                  </div>
                  {urlType === "suggestion" && (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-[#00ADE5]" />
                  )}
                </label>

                <label
                  htmlFor={customId}
                  className={`flex cursor-pointer flex-col gap-3 rounded-xl border-2 p-4 transition-all ${
                    urlType === "custom"
                      ? "border-[#00ADE5] bg-[#00ADE5]/5 ring-1 ring-[#00ADE5]/20"
                      : "border-gray-200 hover:border-gray-300 hover:bg-slate-50/80"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      id={customId}
                      type="radio"
                      name="urlType"
                      checked={urlType === "custom"}
                      onChange={() => setUrlType("custom")}
                      className="mt-1 h-4 w-4 border-gray-300 text-[#00ADE5] focus:ring-[#00ADE5]"
                    />
                    <div className="flex-1">
                      <span className="font-semibold text-gray-900">
                        Custom subdomain
                      </span>
                      <p className="mt-0.5 text-xs text-gray-500">
                        Letters, numbers, and hyphens — keep it short and
                        memorable.
                      </p>
                    </div>
                    {urlType === "custom" && (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-[#00ADE5]" />
                    )}
                  </div>
                  <div
                    className={`flex flex-wrap items-center gap-1 rounded-xl border bg-white py-2.5 pl-3 pr-2 shadow-inner sm:flex-nowrap ${
                      urlType === "custom"
                        ? "border-[#00ADE5]/40"
                        : "border-gray-200"
                    }`}
                    onClick={() => setUrlType("custom")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setUrlType("custom");
                      }
                    }}
                    role="presentation"
                  >
                    <span className="shrink-0 text-sm text-gray-500">
                      https://
                    </span>
                    <input
                      type="text"
                      value={customUrl}
                      onChange={(e) => {
                        setCustomUrl(e.target.value);
                        setUrlType("custom");
                      }}
                      onFocus={() => setUrlType("custom")}
                      className="min-w-0 flex-1 border-0 bg-transparent py-1 text-sm font-medium text-gray-900 outline-none focus:ring-0"
                      placeholder="myleaguename"
                      autoComplete="off"
                    />
                    <span className="shrink-0 text-sm text-gray-500">
                      .leaguerepublic.com
                    </span>
                  </div>
                </label>
              </fieldset>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={() => navigate("/signup/league-details")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:border-gray-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00ADE5] focus-visible:ring-offset-2"
                >
                  <ChevronLeft className="h-5 w-5 shrink-0" />
                  Previous
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#003366] to-[#004080] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[#003366]/20 transition-all hover:from-[#002244] hover:to-[#003366] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#00ADE5]"
                >
                  Create league
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
