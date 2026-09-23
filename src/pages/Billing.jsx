import {
  CreditCard,
  Package,
  Check,
  Minus,
  Plus,
  Info,
  Zap,
  Layers,
  Users,
  BarChart3,
  Headphones,
  Shield,
} from "lucide-react";
import { Fragment } from "react";
import Swal from "sweetalert2";

const CURRENT_PLAN_ID = "free";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    blurb: "For getting started",
    cta: "Current plan",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    period: "/mo",
    blurb: "For growing leagues",
    cta: "Upgrade to Pro",
    recommended: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "",
    blurb: "For large orgs",
    cta: "Contact sales",
  },
];

const comparisonSections = [
  {
    title: "Capacity",
    icon: Users,
    rows: [
      {
        label: "Users included",
        values: { free: "10", pro: "50", enterprise: "Unlimited" },
      },
      {
        label: "Competitions",
        values: { free: "2", pro: "Unlimited", enterprise: "Unlimited" },
      },
    ],
  },
  {
    title: "Platform",
    icon: BarChart3,
    rows: [
      {
        label: "Competition management",
        values: { free: true, pro: true, enterprise: true },
      },
      {
        label: "Schedule & results",
        values: { free: true, pro: true, enterprise: true },
      },
      {
        label: "Advanced analytics",
        values: { free: false, pro: true, enterprise: true },
      },
      {
        label: "Custom roles & access",
        values: { free: false, pro: true, enterprise: true },
      },
    ],
  },
  {
    title: "Support",
    icon: Headphones,
    rows: [
      {
        label: "Community support",
        values: { free: true, pro: true, enterprise: true },
      },
      {
        label: "Priority email support",
        values: { free: false, pro: true, enterprise: true },
      },
      {
        label: "Dedicated account manager",
        values: { free: false, pro: false, enterprise: true },
      },
      {
        label: "24/7 priority support",
        values: { free: false, pro: false, enterprise: true },
      },
    ],
  },
];

function CellValue({ value }) {
  if (typeof value === "boolean") {
    return value ? (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#00ADE5]/10 text-[#00ADE5]">
        <Check size={15} strokeWidth={2.5} />
      </span>
    ) : (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-50 text-gray-300">
        <Minus size={14} strokeWidth={2.5} />
      </span>
    );
  }

  return (
    <span className="text-sm font-semibold tabular-nums text-[#003366]">
      {value}
    </span>
  );
}

export default function Billing() {
  const currentPlan = plans.find((p) => p.id === CURRENT_PLAN_ID);
  const proPlan = plans.find((p) => p.id === "pro");

  const handleUpgrade = (plan) => {
    if (!plan || plan.id === CURRENT_PLAN_ID) return;

    if (plan.id === "enterprise") {
      Swal.fire({
        icon: "info",
        title: "Contact sales",
        text: "Reach out to our team for a custom Enterprise quote tailored to your league.",
        confirmButtonColor: "#00ADE5",
        confirmButtonText: "Got it",
      });
      return;
    }

    Swal.fire({
      icon: "info",
      title: `Upgrade to ${plan.name}`,
      text: "Billing checkout will be available soon. Your Free plan remains active.",
      confirmButtonColor: "#00ADE5",
    });
  };

  const handleAddPayment = () => {
    Swal.fire({
      icon: "info",
      title: "Add payment method",
      text: "Secure card capture will be available when paid plans go live.",
      confirmButtonColor: "#00ADE5",
    });
  };

  return (
    <div className="w-full space-y-5 py-6 sm:space-y-6 sm:py-8">
      {/* Hero + plan summary */}
      <div className="animate-fade-up overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
        <div className="relative bg-gradient-to-r from-[#003366] via-[#003d7a] to-[#004080] px-5 py-6 text-white sm:px-8 sm:py-7">
          <div className="animate-blob pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-[#00ADE5]/20 blur-3xl" />
          <div className="animate-blob animation-delay-2000 pointer-events-none absolute bottom-0 left-1/4 h-28 w-28 rounded-full bg-white/10 blur-2xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 transition duration-300 hover:scale-105 hover:bg-white/25 sm:h-14 sm:w-14">
                <CreditCard className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/65">
                  Billing
                </p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                  Plans & payments
                </h1>
                <p className="mt-1.5 max-w-lg text-sm text-blue-100/90">
                  Review your subscription, payment details, and available
                  upgrades.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleUpgrade(proPlan)}
              className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#003366] shadow-lg transition duration-200 hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-xl active:translate-y-0 lg:self-auto"
            >
              <Zap size={16} strokeWidth={2.25} />
              Upgrade to Pro
            </button>
          </div>
        </div>

        {/* Status strip */}
        <div className="grid divide-y divide-gray-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="animate-fade-up animation-delay-100 flex items-center gap-3 px-5 py-4 transition duration-200 hover:bg-slate-50/80 sm:px-6">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition duration-200 group-hover:scale-105">
              <Package size={16} strokeWidth={2} />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Current plan
              </p>
              <p className="text-sm font-bold text-[#003366]">
                {currentPlan?.name}
                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                  <span className="animate-soft-pulse h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>
              </p>
            </div>
          </div>
          <div className="animate-fade-up animation-delay-200 flex items-center gap-3 px-5 py-4 transition duration-200 hover:bg-slate-50/80 sm:px-6">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#003366]/5 text-[#003366]">
              <Layers size={16} strokeWidth={2} />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Billing amount
              </p>
              <p className="text-sm font-bold text-[#003366]">
                {currentPlan?.price}
                <span className="ml-1 font-medium text-gray-500">
                  {currentPlan?.period}
                </span>
              </p>
            </div>
          </div>
          <div className="animate-fade-up animation-delay-300 flex items-center gap-3 px-5 py-4 transition duration-200 hover:bg-slate-50/80 sm:px-6">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Shield size={16} strokeWidth={2} />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Next renewal
              </p>
              <p className="text-sm font-bold text-[#003366]">Not applicable</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment method */}
      <div className="animate-fade-up animation-delay-200 overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm transition duration-300 hover:shadow-md">
        <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#00ADE5]/10 text-[#00ADE5]">
              <CreditCard size={18} strokeWidth={2} />
            </span>
            <div>
              <h2 className="text-sm font-bold text-[#003366]">
                Payment method
              </h2>
              <p className="text-xs text-gray-500">
                Used for paid plan renewals
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddPayment}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-[#003366] transition duration-200 hover:-translate-y-0.5 hover:border-[#00ADE5] hover:bg-[#00ADE5]/5 hover:text-[#00ADE5] active:translate-y-0"
          >
            <Plus size={16} strokeWidth={2.25} />
            Add payment method
          </button>
        </div>
        <div className="px-5 py-5 sm:px-6">
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-200 bg-slate-50/80 px-6 py-8 text-center transition duration-300 hover:border-[#00ADE5]/40 hover:bg-[#00ADE5]/[0.03]">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-gray-100 transition duration-300 hover:scale-105">
              <CreditCard className="h-5 w-5 text-gray-400" strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                No card on file
              </p>
              <p className="mt-1 max-w-sm text-xs leading-relaxed text-gray-500">
                You are on the Free plan. A payment method is only required when
                you upgrade to Pro or Enterprise.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison */}
      <div className="animate-fade-up animation-delay-300 overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#003366]/5 text-[#003366]">
              <Layers size={18} strokeWidth={2} />
            </span>
            <div>
              <h2 className="text-sm font-bold text-[#003366]">
                Available plans
              </h2>
              <p className="text-xs text-gray-500">
                Compare features across Free, Pro, and Enterprise
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse">
            <thead>
              <tr>
                <th className="w-[30%] bg-white px-5 py-5 text-left sm:px-6" />
                {plans.map((plan, index) => {
                  const isCurrent = plan.id === CURRENT_PLAN_ID;
                  const delayClass =
                    index === 0
                      ? "animation-delay-100"
                      : index === 1
                        ? "animation-delay-200"
                        : "animation-delay-300";
                  return (
                    <th
                      key={plan.id}
                      className={`animate-fade-up relative px-4 py-5 text-center align-bottom sm:px-5 ${delayClass} ${
                        plan.recommended
                          ? "bg-gradient-to-b from-[#00ADE5]/[0.08] to-transparent"
                          : "bg-white"
                      }`}
                    >
                      {plan.recommended && (
                        <div className="absolute inset-x-0 top-0 h-1 origin-left animate-fade-up bg-[#00ADE5]" />
                      )}
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex min-h-[22px] items-center gap-1.5">
                          {isCurrent && (
                            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                              Active
                            </span>
                          )}
                          {plan.recommended && !isCurrent && (
                            <span className="rounded-md bg-[#00ADE5] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                              Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-base font-bold text-[#003366]">
                          {plan.name}
                        </p>
                        <p className="text-xs text-gray-500">{plan.blurb}</p>
                        <div className="mt-1 flex items-baseline gap-0.5">
                          <span className="text-3xl font-bold tracking-tight text-[#003366]">
                            {plan.price}
                          </span>
                          {plan.period && (
                            <span className="text-xs font-medium text-gray-500">
                              {plan.period}
                            </span>
                          )}
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {comparisonSections.map((section) => (
                <Fragment key={section.title}>
                  <tr className="border-t border-gray-100">
                    <td
                      colSpan={4}
                      className="bg-slate-50/90 px-5 py-2.5 sm:px-6"
                    >
                      <div className="flex items-center gap-2">
                        <section.icon
                          size={13}
                          className="text-[#00ADE5]"
                          strokeWidth={2.25}
                        />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                          {section.title}
                        </span>
                      </div>
                    </td>
                  </tr>
                  {section.rows.map((row) => (
                    <tr
                      key={row.label}
                      className="border-t border-gray-50 transition duration-150 hover:bg-slate-50/80"
                    >
                      <td className="px-5 py-3.5 text-sm text-gray-600 sm:px-6">
                        {row.label}
                      </td>
                      {plans.map((plan) => (
                        <td
                          key={plan.id}
                          className={`px-4 py-3.5 text-center sm:px-5 ${
                            plan.recommended ? "bg-[#00ADE5]/[0.03]" : ""
                          }`}
                        >
                          <div className="flex justify-center transition duration-200 hover:scale-110">
                            <CellValue value={row.values[plan.id]} />
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>

            <tfoot>
              <tr className="border-t border-gray-200">
                <td className="px-5 py-5 sm:px-6" />
                {plans.map((plan) => {
                  const isCurrent = plan.id === CURRENT_PLAN_ID;
                  return (
                    <td
                      key={plan.id}
                      className={`px-4 py-5 text-center sm:px-5 ${
                        plan.recommended ? "bg-[#00ADE5]/[0.04]" : ""
                      }`}
                    >
                      <button
                        type="button"
                        disabled={isCurrent}
                        onClick={() => handleUpgrade(plan)}
                        className={`mx-auto w-full max-w-[168px] rounded-xl px-4 py-2.5 text-sm font-semibold transition duration-200 ${
                          isCurrent
                            ? "cursor-default bg-slate-100 text-gray-500"
                            : plan.recommended
                              ? "bg-[#00ADE5] text-white shadow-md shadow-[#00ADE5]/20 hover:-translate-y-0.5 hover:bg-[#0099c7] hover:shadow-lg active:translate-y-0"
                              : "border border-gray-200 bg-white text-[#003366] hover:-translate-y-0.5 hover:border-[#00ADE5] hover:text-[#00ADE5] active:translate-y-0"
                        }`}
                      >
                        {isCurrent ? "Current plan" : plan.cta}
                      </button>
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="animate-fade-up animation-delay-400 flex items-start gap-3 rounded-xl border border-gray-200/90 bg-white px-4 py-3.5 shadow-sm sm:px-5">
        <Info
          className="mt-0.5 h-4 w-4 shrink-0 text-[#00ADE5]"
          strokeWidth={2}
        />
        <p className="text-xs leading-relaxed text-gray-600 sm:text-sm">
          Running multiple leagues or need SSO and custom contracts?{" "}
          <button
            type="button"
            onClick={() =>
              handleUpgrade(plans.find((p) => p.id === "enterprise"))
            }
            className="font-semibold text-[#00ADE5] transition hover:underline"
          >
            Talk to sales
          </button>{" "}
          about Enterprise.
        </p>
      </div>
    </div>
  );
}
