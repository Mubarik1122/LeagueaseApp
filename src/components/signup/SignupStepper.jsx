import { Check } from "lucide-react";

const STEPS = [1, 2, 3, 4];

/**
 * Horizontal 4-step indicator for post-account league signup.
 * Step 1: /signup/league-type → Step 4: /signup/website-url
 *
 * @param {1|2|3|4} currentStep — Active step (1-based).
 */
export default function SignupStepper({ currentStep, className = "" }) {
  return (
    <nav
      aria-label="League setup progress"
      className={`flex items-center justify-center ${className}`}
    >
      <ol className="m-0 flex list-none items-center p-0">
        {STEPS.map((step, idx) => (
          <li key={step} className="flex items-center">
            {idx > 0 && (
              <div
                className={`mx-0.5 h-0.5 w-7 rounded-full sm:mx-1 sm:w-11 ${
                  idx < currentStep ? "bg-emerald-500" : "bg-gray-200"
                }`}
                aria-hidden
              />
            )}
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all sm:h-11 sm:w-11 ${
                step < currentStep
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                  : step === currentStep
                    ? "scale-105 bg-gradient-to-br from-[#003366] to-[#004080] text-white shadow-lg shadow-[#003366]/40 ring-4 ring-[#00ADE5]/25"
                    : "border-2 border-gray-200 bg-white text-gray-400"
              }`}
            >
              {step < currentStep ? (
                <Check className="h-5 w-5" strokeWidth={3} aria-hidden />
              ) : (
                <span>{step}</span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
