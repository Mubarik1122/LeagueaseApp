import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  ArrowRight,
  Trophy,
  TrendingUp,
  Eye,
  Settings2,
} from "lucide-react";
import SetupTabHeader, { SetupSecondaryButton } from "./SetupTabHeader";

const FEATURES = [
  {
    icon: Trophy,
    title: "Points scoring system",
    description: "Set win, draw, and loss points for each competition.",
  },
  {
    icon: TrendingUp,
    title: "Promotion & relegation",
    description: "Define zones and highlight top and bottom positions.",
  },
  {
    icon: Eye,
    title: "Visibility controls",
    description: "Choose what standings data is shown on public pages.",
  },
  {
    icon: Settings2,
    title: "Per-competition settings",
    description: "Configure standings separately for each division or tournament.",
  },
];

export default function StandingsTab() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <SetupTabHeader
        title="Standings"
        description="Configure how standings are calculated and displayed for each competition. Set points, promotion zones, and public visibility."
      >
        <SetupSecondaryButton
          onClick={() => navigate("/dashboard/standings")}
          icon={ArrowRight}
        >
          Go to standings setup
        </SetupSecondaryButton>
      </SetupTabHeader>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-slate-50 px-5 py-4 sm:px-6">
          <p className="text-sm font-semibold text-gray-700">
            Standings setup
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            Open the full standings editor to manage scoring and display rules
            per competition.
          </p>
        </div>

        <div className="p-5 sm:p-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#00ADE5]/10">
              <BarChart3 className="text-[#00ADE5]" size={32} />
            </span>
            <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">
              Configure league standings
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
              Set points systems, promotion zones, and public visibility for
              each tournament or division in your league.
            </p>
          </div>

          <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-[#00ADE5]/40 hover:bg-slate-50"
              >
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#003366]/5 text-[#003366]">
                  <Icon size={18} />
                </span>
                <div className="min-w-0 text-left">
                  <p className="text-sm font-semibold text-gray-800">{title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
