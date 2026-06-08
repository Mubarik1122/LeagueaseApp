import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Trophy,
  Beer,
  Activity,
  Disc3,
  Gamepad2,
  HelpCircle,
  Check,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import SignupStepper from "../../components/signup/SignupStepper";

const SPORT_CATEGORIES = {
  "Traditional Sports": [
    "Baseball",
    "Basketball",
    "Cricket",
    "Football (American)",
    "Inline Puck Hockey",
    "Field Hockey",
    "Hurling",
    "Ice Hockey",
    "Korfball",
    "Lacrosse",
    "Netball",
    "Rugby League",
    "Rugby Union",
    "Soccer/Football",
    "Soccer (Indoor)",
    "Soccer (Futsal)",
    "Softball",
  ],
  "Traditional Pub/Bar": ["Billiards", "Darts", "Dominoes", "Pool", "Snooker"],
  "Racket and Net Sports": [
    "Badminton",
    "Raquetball",
    "Squash",
    "Tennis",
    "Volleyball",
    "Table Tennis",
  ],
  Bowling: [
    "Crown Green Bowling",
    "Curling",
    "Flat Green Bowling",
    "Indoor Bowling",
    "Skittles",
    "Ten Pin Bowling",
    "Petanque",
  ],
  Games: ["Cornhole", "Pub Quiz", "Subbuteo", "Table Football"],
};

/** Visual identity per category — icon + accent for headers and card top stripe */
const CATEGORY_STYLE = {
  "Traditional Sports": {
    Icon: Trophy,
    stripe: "from-amber-400 via-orange-500 to-rose-500",
    iconBg: "bg-gradient-to-br from-amber-100 to-orange-100 text-orange-700",
    glow: "bg-orange-400/20",
  },
  "Traditional Pub/Bar": {
    Icon: Beer,
    stripe: "from-amber-700 via-amber-600 to-yellow-500",
    iconBg: "bg-gradient-to-br from-amber-200 to-yellow-100 text-amber-900",
    glow: "bg-amber-500/15",
  },
  "Racket and Net Sports": {
    Icon: Activity,
    stripe: "from-emerald-400 via-teal-500 to-cyan-600",
    iconBg: "bg-gradient-to-br from-emerald-100 to-teal-100 text-teal-800",
    glow: "bg-teal-400/15",
  },
  Bowling: {
    Icon: Disc3,
    stripe: "from-violet-400 via-purple-500 to-indigo-600",
    iconBg: "bg-gradient-to-br from-violet-100 to-indigo-100 text-indigo-800",
    glow: "bg-violet-400/15",
  },
  Games: {
    Icon: Gamepad2,
    stripe: "from-pink-400 via-fuchsia-500 to-purple-600",
    iconBg: "bg-gradient-to-br from-pink-100 to-fuchsia-100 text-fuchsia-800",
    glow: "bg-fuchsia-400/15",
  },
};

const OTHER_STYLE = {
  Icon: HelpCircle,
  stripe: "from-slate-400 via-slate-500 to-slate-600",
  iconBg: "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700",
  glow: "bg-slate-400/15",
};

function SportOption({ sport, selected, onSelect }) {
  const id = `sport-${sport.replace(/[^a-zA-Z0-9]/g, "-")}`;
  return (
    <label
      htmlFor={id}
      className={`group flex cursor-pointer items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left text-sm transition-all duration-200 ${
        selected
          ? "border-[#00ADE5] bg-gradient-to-r from-[#00ADE5]/12 to-cyan-50/80 text-[#003366] shadow-md shadow-[#00ADE5]/10 ring-1 ring-[#00ADE5]/25"
          : "border-transparent bg-white/50 text-gray-700 hover:border-gray-200/80 hover:bg-white hover:shadow-sm"
      }`}
    >
      <input
        id={id}
        type="radio"
        name="sport"
        value={sport}
        checked={selected}
        onChange={() => onSelect(sport)}
        className="h-4 w-4 shrink-0 border-gray-300 text-[#00ADE5] focus:ring-[#00ADE5] focus:ring-offset-0"
      />
      <span className="min-w-0 flex-1 font-medium leading-snug">{sport}</span>
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
          selected
            ? "bg-[#00ADE5] text-white scale-100"
            : "scale-90 bg-gray-100 text-transparent group-hover:bg-gray-200"
        }`}
      >
        <Check className="h-4 w-4" strokeWidth={3} />
      </span>
    </label>
  );
}

function CategoryCard({ title, style, children }) {
  const Icon = style.Icon;
  return (
    <div className="group/card relative overflow-hidden rounded-2xl border border-gray-200/60 bg-white/70 shadow-lg shadow-gray-200/40 backdrop-blur-md transition-all duration-300 hover:shadow-xl hover:shadow-[#003366]/5 hover:border-[#00ADE5]/25">
      <div
        className={`h-1.5 bg-gradient-to-r ${style.stripe}`}
        aria-hidden
      />
      <div className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full blur-2xl ${style.glow} opacity-0 transition-opacity duration-300 group-hover/card:opacity-100`} />
      <div className="relative p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm ${style.iconBg}`}
          >
            <Icon className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold uppercase tracking-wide text-[#003366]">
              {title}
            </h2>
            <div className="mt-1 h-0.5 w-12 rounded-full bg-gradient-to-r from-[#00ADE5] to-transparent" />
          </div>
        </div>
        <div className="max-h-[min(48vh,26rem)] space-y-1.5 overflow-y-auto pr-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:thin]">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function SportSelection() {
  const navigate = useNavigate();
  const [selectedSport, setSelectedSport] = useState("");
  const [otherSport, setOtherSport] = useState("");

  const handleNext = () => {
    const sport = selectedSport === "Other" ? otherSport.trim() : selectedSport;
    if (!sport) return;
    localStorage.setItem("selectedSport", sport);
    navigate("/signup/league-details");
  };

  const canContinue =
    Boolean(selectedSport) &&
    (selectedSport !== "Other" || otherSport.trim().length > 0);

  const displaySelection =
    selectedSport === "Other"
      ? otherSport.trim() || "Other"
      : selectedSport || null;

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-gradient-to-br from-slate-100 via-sky-50/90 to-indigo-100/70">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,173,229,0.18),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-[#00ADE5]/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-indigo-400/15 blur-3xl"
        aria-hidden
      />

      <Navbar />
      <main className="relative flex-1 px-4 py-10 sm:py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-10">
          <header className="space-y-6 text-center">
            <SignupStepper currentStep={2} />
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00ADE5] to-cyan-400 opacity-35 blur-2xl" />
                <div className="relative flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl bg-gradient-to-br from-[#003366] via-[#004080] to-[#0055a4] shadow-xl shadow-[#003366]/30 ring-4 ring-white/80">
                  <Dumbbell
                    className="h-10 w-10 text-white drop-shadow-sm"
                    strokeWidth={1.75}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h1 className="bg-gradient-to-r from-[#003366] via-[#004080] to-[#00ADE5] bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-5xl sm:leading-tight">
                Pick your sport
              </h1>
              <p className="mx-auto max-w-2xl text-base text-gray-600 sm:text-lg leading-relaxed">
                Find your discipline below — each category is tailored for how
                leagues like yours run. Your choice powers defaults in the admin
                dashboard.
              </p>
            </div>
          </header>

          {displaySelection && (
            <div className="mx-auto flex max-w-xl flex-col items-center justify-center gap-2 rounded-2xl border border-[#00ADE5]/30 bg-gradient-to-r from-[#00ADE5]/10 via-white/90 to-cyan-50/80 px-5 py-4 text-center shadow-lg shadow-[#00ADE5]/10 backdrop-blur-sm transition-all duration-300 sm:flex-row sm:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-[#003366]/80">
                Selected
              </span>
              <span className="text-lg font-bold text-[#003366]">
                {displaySelection}
              </span>
            </div>
          )}

          <section className="rounded-3xl border border-white/60 bg-white/40 p-5 shadow-2xl shadow-indigo-200/20 backdrop-blur-xl ring-1 ring-gray-200/50 sm:p-8">
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Object.entries(SPORT_CATEGORIES).map(([category, sports]) => (
                <CategoryCard
                  key={category}
                  title={category}
                  style={CATEGORY_STYLE[category]}
                >
                  {sports.map((sport) => (
                    <SportOption
                      key={sport}
                      sport={sport}
                      selected={selectedSport === sport}
                      onSelect={setSelectedSport}
                    />
                  ))}
                </CategoryCard>
              ))}

              <CategoryCard title="Other" style={OTHER_STYLE}>
                <label
                  htmlFor="sport-other"
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-sm transition-all duration-200 ${
                    selectedSport === "Other"
                      ? "border-[#00ADE5] bg-gradient-to-r from-[#00ADE5]/12 to-cyan-50/80 text-[#003366] shadow-md shadow-[#00ADE5]/10 ring-1 ring-[#00ADE5]/25"
                      : "border-transparent bg-white/50 hover:border-gray-200/80 hover:bg-white hover:shadow-sm"
                  }`}
                >
                  <input
                    id="sport-other"
                    type="radio"
                    name="sport"
                    value="Other"
                    checked={selectedSport === "Other"}
                    onChange={() => setSelectedSport("Other")}
                    className="h-4 w-4 shrink-0 border-gray-300 text-[#00ADE5] focus:ring-[#00ADE5] focus:ring-offset-0"
                  />
                  <span className="min-w-0 flex-1 font-medium">
                    Other (specify)
                  </span>
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
                      selectedSport === "Other"
                        ? "bg-[#00ADE5] text-white"
                        : "bg-gray-100 text-transparent"
                    }`}
                  >
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </span>
                </label>
                {selectedSport === "Other" && (
                  <input
                    type="text"
                    value={otherSport}
                    onChange={(e) => setOtherSport(e.target.value)}
                    placeholder="Type your sport…"
                    className="mt-3 block w-full rounded-xl border-2 border-[#00ADE5]/25 bg-white py-3 px-4 text-sm font-medium shadow-inner transition-shadow focus:border-[#00ADE5] focus:outline-none focus:ring-2 focus:ring-[#00ADE5]/30"
                  />
                )}
              </CategoryCard>
            </div>
          </section>

          <footer className="flex flex-col-reverse gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => navigate("/signup/league-type")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-gray-200/90 bg-white/90 px-6 py-3.5 text-sm font-bold text-gray-700 shadow-md backdrop-blur-sm transition-all hover:border-gray-300 hover:bg-white hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00ADE5] focus-visible:ring-offset-2"
            >
              <ChevronLeft className="h-5 w-5 shrink-0" />
              Previous
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!canContinue}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#003366] via-[#004080] to-[#0055a4] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#003366]/25 transition-all hover:shadow-xl hover:shadow-[#003366]/35 hover:brightness-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#00ADE5] disabled:cursor-not-allowed disabled:from-gray-300 disabled:via-gray-300 disabled:to-gray-400 disabled:shadow-none disabled:brightness-100"
            >
              Continue
              <ChevronRight className="h-5 w-5 shrink-0" />
            </button>
          </footer>
        </div>
      </main>
    </div>
  );
}
