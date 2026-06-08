import { AlertTriangle, Layers, Trophy, Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function CompetitionTable({ competitions }) {
  const safeCompetitions = Array.isArray(competitions) ? competitions : [];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="bg-gradient-to-r from-[#003366] to-[#004080] text-white">
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                Competition
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                Teams
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                Matches
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                Results
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                Conflicts
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                Standings
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                Code
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {safeCompetitions.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-14 text-center">
                  <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00ADE5]/10">
                      <Trophy className="h-7 w-7 text-[#00ADE5]" />
                    </div>
                    <p className="text-base font-semibold text-gray-800">
                      No competitions yet
                    </p>
                    <p className="text-sm text-gray-500">
                      Create a division or tournament to see it listed here.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              safeCompetitions.map((comp, index) => (
                <tr
                  key={comp.id ?? index}
                  className="group transition-colors hover:bg-slate-50/80"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#003366]/10 to-[#00ADE5]/10">
                        <Layers className="h-5 w-5 text-[#003366]" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-gray-900">
                          {comp.name}
                        </p>
                        <p className="text-xs text-gray-500">Division</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#00ADE5]/10 px-2.5 py-1 text-xs font-semibold text-[#0088cc]">
                        <Users className="h-3.5 w-3.5" />
                        {comp.teams ?? 0}
                      </span>
                      <Link
                        to="/dashboard/teams"
                        className="text-xs font-medium text-[#00ADE5] hover:text-[#0088cc] hover:underline"
                      >
                        Manage
                      </Link>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-medium text-gray-600">
                      {comp.matches ?? 0}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-medium text-gray-600">
                      {comp.results ?? 0}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {comp.conflicts > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                        <AlertTriangle size={14} />
                        {comp.conflicts}
                      </span>
                    ) : (
                      <span className="text-sm font-medium text-gray-400">
                        0
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      to="/dashboard/standings"
                      className="inline-flex items-center rounded-lg border border-[#00ADE5]/30 bg-[#00ADE5]/5 px-3 py-1.5 text-xs font-semibold text-[#0088cc] transition-colors hover:border-[#00ADE5] hover:bg-[#00ADE5]/10"
                    >
                      Setup
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex rounded-md bg-gray-100 px-2.5 py-1 font-mono text-xs font-semibold text-gray-700">
                      {comp.shortCode || "—"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
