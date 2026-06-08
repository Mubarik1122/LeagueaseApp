import { Link } from "react-router-dom";
import clsx from "clsx";
import {
  ArrowRight,
  CalendarClock,
  Clock,
  Info,
  LayoutTemplate,
  Settings2,
  Sparkles,
  Star,
  Wand2,
} from "lucide-react";

const FEATURED_TOOL = {
  title: "Multi Division Scheduler",
  duration: "5 mins approx",
  badge: "Recommended",
  description:
    "Schedule divisions of different sizes so they all complete as soon as possible. For example, a 10-team division meeting twice finishes in 18 weeks, while an 8-team division finishes in 14 weeks. Venue sharing across divisions is fully supported.",
};

const SECONDARY_TOOLS = [
  {
    id: "template",
    title: "Template scheduler",
    duration: "5 mins approx",
    description:
      "Best for single or similar-size divisions. Matches complete alongside the largest division, with venue sharing and inter-division fixtures supported.",
    helpLink: "/dashboard/help/scheduler",
    icon: LayoutTemplate,
    accent: "from-[#003366] to-[#004080]",
    glow: "shadow-[#003366]/10",
  },
  {
    id: "advanced",
    title: "Advanced Scheduler",
    duration: "30 mins approx",
    description:
      "Build schedules around team and pitch availability. Ideal for multiple divisions of different sizes that share venues.",
    helpLink: "/dashboard/help/scheduler",
    icon: Settings2,
    accent: "from-[#00ADE5] to-[#0088cc]",
    glow: "shadow-[#00ADE5]/15",
  },
  {
    id: "reschedule",
    title: "Reschedule",
    duration: "20 mins approx",
    description:
      "Resolve conflicts and update fixtures — TBC matches, postponements, date ranges, team-specific changes, and missing matches.",
    helpLink: null,
    icon: CalendarClock,
    accent: "from-[#003366] to-[#004080]",
    glow: "shadow-[#003366]/10",
  },
];

function DurationBadge({ value }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-gray-600">
      <Clock className="h-3.5 w-3.5 text-[#00ADE5]" />
      {value}
    </span>
  );
}

function GoButton({ variant = "accent", className }) {
  return (
    <button
      type="button"
      className={clsx(
        "inline-flex w-auto shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition",
        variant === "primary"
          ? "bg-gradient-to-r from-[#003366] to-[#004080] text-white shadow-sm hover:shadow-md"
          : "border border-[#00ADE5]/30 bg-white text-[#0088cc] hover:border-[#00ADE5] hover:bg-[#00ADE5]/5",
        className
      )}
    >
      Go
      <ArrowRight className="h-3.5 w-3.5" />
    </button>
  );
}

function SchedulerToolCard({
  title,
  duration,
  description,
  helpLink,
  icon: Icon,
  accent,
  glow,
}) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-[#00ADE5]/25 hover:shadow-md">
      <div className={clsx("h-1 bg-gradient-to-r", accent)} />

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <span
            className={clsx(
              "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm",
              accent,
              glow
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={2} />
          </span>
          <DurationBadge value={duration} />
        </div>

        <h3 className="mt-4 text-base font-bold text-[#003366]">{title}</h3>

        <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600">
          {description}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4">
          <GoButton />
          {helpLink && (
            <Link
              to={helpLink}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#00ADE5] transition hover:text-[#0088cc] hover:underline"
            >
              <Info className="h-3.5 w-3.5" />
              Learn more
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export default function SchedulerTools() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#00ADE5]">
          Schedule
        </p>
        <h2 className="mt-1 text-xl font-bold tracking-tight text-[#003366] sm:text-2xl">
          Scheduler Tools
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Choose the right tool to generate, refine, or reschedule your league
          fixtures.
        </p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-[#003366] via-[#004080] to-[#003366] px-5 py-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
              <Star className="h-3 w-3 fill-white" />
              {FEATURED_TOOL.badge}
            </span>
            <span className="text-xs text-white/70">Beta · try this first</span>
          </div>
        </div>

        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[auto_1fr] lg:items-start">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#003366] to-[#004080] text-white shadow-lg shadow-[#003366]/20">
            <Wand2 className="h-7 w-7" strokeWidth={2} />
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-lg font-bold text-[#003366] sm:text-xl">
                {FEATURED_TOOL.title}
              </h3>
              <DurationBadge value={FEATURED_TOOL.duration} />
            </div>

            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-600">
              {FEATURED_TOOL.description}
            </p>

            <div className="mt-4 w-fit">
              <GoButton variant="primary" />
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
            More options
          </h3>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {SECONDARY_TOOLS.map((tool) => (
            <SchedulerToolCard key={tool.id} {...tool} />
          ))}
        </div>
      </section>

      <div className="flex items-start gap-3 rounded-2xl border border-gray-200/90 bg-gradient-to-r from-slate-50 to-[#00ADE5]/5 px-5 py-4">
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#00ADE5]/10 text-[#00ADE5]">
          <Sparkles className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-[#003366]">Quick tip</p>
          <p className="mt-0.5 text-sm leading-relaxed text-gray-600">
            Start with the Multi Division Scheduler for the fastest setup, then
            use Reschedule to handle conflicts, postponements, and TBC fixtures.
          </p>
        </div>
      </div>
    </div>
  );
}
