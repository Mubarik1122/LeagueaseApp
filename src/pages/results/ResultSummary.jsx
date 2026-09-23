import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CalendarRange,
  ChevronDown,
  Layers,
  Loader2,
} from "lucide-react";
import clsx from "clsx";
import { selectClass } from "./resultTheme";
import { useTournament } from "../../hooks/useTournament";
import { useCompanyContext } from "../../context/CompanyContext";
import { matchAPI } from "../../services/api";

const DATE_RANGE_OPTIONS = [
  { id: "last14", label: "Last 14 days onwards" },
  { id: "all", label: "All dates" },
  { id: "custom", label: "Date range" },
];

const SUMMARY_COLUMNS = [
  { key: "dateLabel", label: "Date" },
  { key: "matchCount", label: "Number matches" },
  { key: "enteredResults", label: "Number of entered results" },
  {
    key: "voided",
    label: "Cancelled, postponed, abandoned, void",
  },
  { key: "toApprove", label: "Number to approve" },
  {
    key: "missingHomeStats",
    label: "Result but missing home stats",
    alert: true,
  },
  { key: "homeStatsToLock", label: "Home stats to lock" },
  {
    key: "missingRoadStats",
    label: "Result but missing road stats",
    alert: true,
  },
  { key: "roadStatsToLock", label: "To lock road stats" },
];

function formatYmd(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function resolveDateRange(dateFilter, dateFrom, dateTo) {
  if (dateFilter === "all") {
    return { dateFrom: "", dateTo: "" };
  }
  if (dateFilter === "custom") {
    return {
      dateFrom: dateFrom || "",
      dateTo: dateTo || "",
    };
  }
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  from.setDate(from.getDate() - 14);
  return { dateFrom: formatYmd(from), dateTo: "" };
}

function toDateKey(value) {
  if (!value) return null;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return formatYmd(d);
}

function formatDateLabel(dateKey) {
  if (!dateKey) return "—";
  const d = new Date(`${dateKey}T12:00:00`);
  if (Number.isNaN(d.getTime())) return dateKey;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

function num(...candidates) {
  for (const value of candidates) {
    if (value == null || value === "") continue;
    const n = Number(value);
    if (!Number.isNaN(n)) return n;
  }
  return 0;
}

function normalizeSummaryRows(data) {
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.rows)
      ? data.rows
      : Array.isArray(data?.dates)
        ? data.dates
        : Array.isArray(data?.summary)
          ? data.summary
          : Array.isArray(data?.items)
            ? data.items
            : Array.isArray(data?.results)
              ? data.results
              : [];

  return list
    .map((row) => {
      const dateKey = toDateKey(
        row?.date ??
          row?.matchDate ??
          row?.dateKey ??
          row?.day ??
          row?.dateTime
      );
      if (!dateKey) return null;

      return {
        dateKey,
        dateLabel: formatDateLabel(dateKey),
        matchCount: num(
          row.matchCount,
          row.numberMatches,
          row.matches,
          row.totalMatches
        ),
        enteredResults: num(
          row.enteredResults,
          row.numberOfEnteredResults,
          row.enteredResultCount,
          row.resultsEntered
        ),
        voided: num(
          row.voided,
          row.cancelledPostponedAbandonedVoid,
          row.cancelledCount,
          row.voidCount,
          row.cancelledPostponedAbandonedVoidCount
        ),
        toApprove: num(
          row.toApprove,
          row.numberToApprove,
          row.pendingApproval,
          row.approveCount
        ),
        missingHomeStats: num(
          row.missingHomeStats,
          row.resultButMissingHomeStats,
          row.missingHomeStatsCount,
          row.homeStatsMissing
        ),
        homeStatsToLock: num(
          row.homeStatsToLock,
          row.homeStatsToLockCount,
          row.toLockHomeStats
        ),
        missingRoadStats: num(
          row.missingRoadStats,
          row.resultButMissingRoadStats,
          row.missingAwayStats,
          row.missingRoadStatsCount,
          row.roadStatsMissing
        ),
        roadStatsToLock: num(
          row.roadStatsToLock,
          row.toLockRoadStats,
          row.awayStatsToLock,
          row.roadStatsToLockCount
        ),
      };
    })
    .filter(Boolean)
    .sort((a, b) => (a.dateKey < b.dateKey ? 1 : a.dateKey > b.dateKey ? -1 : 0));
}

function CountCell({ value, alert }) {
  const n = Number(value) || 0;
  return (
    <td
      className={clsx(
        "border border-gray-200 bg-white px-3 py-2.5 text-left tabular-nums",
        alert && n > 0
          ? "font-semibold text-red-600"
          : "font-medium text-gray-800"
      )}
    >
      {n}
    </td>
  );
}

export default function ResultSummary() {
  const navigate = useNavigate();
  const { tournaments, fetchTournaments } = useTournament();
  const { isSuperAdmin, selectedCompanyId, companiesReady } =
    useCompanyContext();

  const [selectedCompetition, setSelectedCompetition] = useState("All");
  const [dateFilter, setDateFilter] = useState("last14");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [daySummaries, setDaySummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.userId) return;
    if (isSuperAdmin && (!companiesReady || !selectedCompanyId)) return;
    fetchTournaments(user.userId, {
      companyId: isSuperAdmin ? selectedCompanyId : null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuperAdmin, selectedCompanyId, companiesReady]);

  const divisions = useMemo(() => {
    if (!Array.isArray(tournaments)) return [];
    return tournaments
      .map((t, index) => {
        const id = String(
          t.divisionOrTournamentId ?? t._id ?? t.id ?? `row-${index}`
        );
        const name =
          t.divisionOrtournamentName ??
          t.tournamentName ??
          t.name ??
          "Unnamed division";
        return { id, name };
      })
      .filter((d) => d.id)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [tournaments]);

  useEffect(() => {
    if (selectedCompetition === "All") return;
    const stillExists = divisions.some((d) => d.id === selectedCompetition);
    if (!stillExists) setSelectedCompetition("All");
  }, [divisions, selectedCompetition]);

  useEffect(() => {
    if (isSuperAdmin && (!companiesReady || !selectedCompanyId)) return;
    if (dateFilter === "custom" && !dateFrom && !dateTo) return;

    const range = resolveDateRange(dateFilter, dateFrom, dateTo);
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await matchAPI.getResultsEntrySummary({
          dateFrom: range.dateFrom || undefined,
          dateTo: range.dateTo || undefined,
          division: selectedCompetition,
        });
        if (cancelled) return;
        setDaySummaries(normalizeSummaryRows(res?.data));
      } catch (err) {
        if (cancelled) return;
        setError(err.message || "Could not load results summary.");
        setDaySummaries([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [
    selectedCompetition,
    dateFilter,
    dateFrom,
    dateTo,
    isSuperAdmin,
    selectedCompanyId,
    companiesReady,
  ]);

  const showingLabel = useMemo(() => {
    if (dateFilter === "all") return "Showing all dates";
    if (dateFilter === "custom") {
      if (dateFrom && dateTo) return `Showing ${dateFrom} to ${dateTo}`;
      if (dateFrom) return `Showing from ${dateFrom}`;
      if (dateTo) return `Showing until ${dateTo}`;
      return "Showing custom date range";
    }
    return "Showing last 14 days onwards";
  }, [dateFilter, dateFrom, dateTo]);

  const openDayResults = (dateKey) => {
    const params = new URLSearchParams({ date: dateKey });
    navigate(`/dashboard/results/maintain?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#003366] sm:text-xl">
          Result summary by date
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Approve and lock match results before they appear on public pages.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="relative w-full sm:w-64">
          <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
            <Layers className="h-3.5 w-3.5 text-[#00ADE5]" />
            Competition
          </label>
          <div className="relative">
            <select
              value={selectedCompetition}
              onChange={(e) => setSelectedCompetition(e.target.value)}
              className={selectClass}
            >
              <option value="All">All competitions</option>
              {divisions.map((division) => (
                <option key={division.id} value={division.id}>
                  {division.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div className="w-fit max-w-full">
          <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
            <CalendarRange className="h-3.5 w-3.5 text-[#00ADE5]" />
            Date range
          </label>
          <div
            role="group"
            aria-label="Date range"
            className="inline-flex h-[42px] max-w-full flex-wrap items-center rounded-xl border border-gray-200 bg-white p-1 shadow-sm sm:flex-nowrap"
          >
            {DATE_RANGE_OPTIONS.map(({ id, label }) => {
              const isActive = dateFilter === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setDateFilter(id)}
                  aria-pressed={isActive}
                  className={clsx(
                    "h-full rounded-lg px-3.5 text-sm font-medium whitespace-nowrap transition-colors duration-150 sm:px-4",
                    isActive
                      ? "bg-[#003366] text-white"
                      : "text-gray-500 hover:text-[#003366]"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {dateFilter === "custom" && (
          <>
            <div className="w-full sm:w-44">
              <label className="mb-2 block text-xs font-semibold text-gray-600">
                From
              </label>
              <input
                type="date"
                value={dateFrom}
                max={dateTo || undefined}
                onChange={(e) => setDateFrom(e.target.value)}
                className={`${selectClass} pr-3`}
              />
            </div>
            <div className="w-full sm:w-44">
              <label className="mb-2 block text-xs font-semibold text-gray-600">
                To
              </label>
              <input
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(e) => setDateTo(e.target.value)}
                className={`${selectClass} pr-3`}
              />
            </div>
          </>
        )}
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-[#00ADE5]/20 bg-[#00ADE5]/5 px-4 py-3.5">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#00ADE5]" />
        <p className="text-sm leading-relaxed text-gray-600">
          Approve the result of a match to make the result and stats appear on
          the public pages. Lock stats to prevent them from being changed by
          administrators.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
        <div className="border-b border-[#00264d] bg-[#003366] px-5 py-3.5">
          <h3 className="text-sm font-semibold text-white">Match results</h3>
          <p className="mt-0.5 text-xs text-white/70">{showingLabel}</p>
        </div>

        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-[#00ADE5]" />
          </div>
        ) : error ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm font-semibold text-red-600">{error}</p>
          </div>
        ) : daySummaries.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-5 py-16 text-center">
            <div className="rounded-full bg-[#00ADE5]/10 p-3">
              <CalendarRange className="h-6 w-6 text-[#00ADE5]" />
            </div>
            <p className="text-sm font-semibold text-[#003366]">
              No matches found
            </p>
            <p className="max-w-md text-sm text-gray-500">
              There are no matches to display for your current filter choice.
              Try changing the competition or date range.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] border-collapse text-sm">
              <thead>
                <tr>
                  {SUMMARY_COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      className="border border-[#00264d] bg-[#003366] px-3 py-2.5 text-left text-[11px] font-semibold leading-snug text-white"
                    >
                      {col.label}
                    </th>
                  ))}
                  <th className="border border-[#00264d] bg-[#003366] px-3 py-2.5 text-left text-[11px] font-semibold text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {daySummaries.map((row) => (
                  <tr key={row.dateKey} className="hover:bg-slate-50/80">
                    <td className="border border-gray-200 bg-white px-3 py-2.5 text-left font-semibold text-[#003366]">
                      {row.dateLabel}
                    </td>
                    <CountCell value={row.matchCount} />
                    <CountCell value={row.enteredResults} />
                    <CountCell value={row.voided} />
                    <CountCell value={row.toApprove} />
                    <CountCell value={row.missingHomeStats} alert />
                    <CountCell value={row.homeStatsToLock} />
                    <CountCell value={row.missingRoadStats} alert />
                    <CountCell value={row.roadStatsToLock} />
                    <td className="border border-gray-200 bg-white px-3 py-2 text-left">
                      <button
                        type="button"
                        onClick={() => openDayResults(row.dateKey)}
                        className="inline-flex items-center rounded-full bg-red-600 px-3.5 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700"
                      >
                        Results
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
