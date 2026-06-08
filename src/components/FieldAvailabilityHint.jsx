import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import clsx from "clsx";

export function getFieldCheckInputClass(baseClass, check) {
  const status = check?.status;
  if (!status || status === "idle" || status === "pending" || status === "checking") {
    return baseClass;
  }
  if (status === "available") {
    return `${baseClass} border-emerald-300 focus:border-emerald-400 focus:ring-emerald-200`;
  }
  if (status === "taken" || status === "invalid") {
    return `${baseClass} border-red-300 focus:border-red-400 focus:ring-red-200`;
  }
  return baseClass;
}

export default function FieldAvailabilityHint({ check, className }) {
  if (!check || check.status === "idle" || check.status === "pending") {
    return null;
  }

  const config = {
    checking: {
      text: "text-gray-500",
      icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
      label: "Checking availability…",
    },
    available: {
      text: "text-emerald-600",
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      label: check.message || "Available",
    },
    taken: {
      text: "text-red-600",
      icon: <XCircle className="h-3.5 w-3.5" />,
      label: check.message || "Already in use",
    },
    invalid: {
      text: "text-amber-600",
      icon: <XCircle className="h-3.5 w-3.5" />,
      label: check.message || "Invalid value",
    },
    error: {
      text: "text-amber-600",
      icon: <XCircle className="h-3.5 w-3.5" />,
      label: check.message || "Could not verify",
    },
  }[check.status];

  if (!config) return null;

  return (
    <p
      className={clsx(
        "mt-1 flex items-start gap-1 text-xs font-medium leading-snug",
        config.text,
        className
      )}
    >
      <span className="mt-0.5 shrink-0">{config.icon}</span>
      <span>{config.label}</span>
    </p>
  );
}
