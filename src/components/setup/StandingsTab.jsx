import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Save,
  Trash2,
  X,
} from "lucide-react";
import Swal from "sweetalert2";
import SetupTabHeader, {
  SetupPrimaryButton,
} from "./SetupTabHeader";
import { selectClass } from "../../pages/results/resultTheme";
import { usePagePermission } from "../../hooks/usePagePermission";
import { useCompanyContext } from "../../context/CompanyContext";
import { standingsConfigAPI } from "../../services/api";

const DEMO_TEAMS = ["Team A", "Team B", "Team C", "Team D"];

/** Catalog ids match API `columnKey` values. */
const COLUMN_CATALOG = [
  { id: "position", description: "Position", defaultHeader: "#", demo: (i) => i + 1 },
  { id: "teamName", description: "Team", defaultHeader: "Team", demo: (_, name) => name },
  { id: "wonLostTie", description: "Won lost tie record", defaultHeader: "W-L-T", demo: () => "9-9-9" },
  { id: "currentStreak", description: "Streak", defaultHeader: "STRK", demo: () => "9W" },
  { id: "winningPercentage", description: "Winning Perc UK Format", defaultHeader: "W%", demo: () => "99.0" },
  { id: "scoreDifference", description: "Score difference", defaultHeader: "+-", demo: () => "9" },
  { id: "scoreFor", description: "Score for", defaultHeader: "F", demo: () => "9" },
  { id: "scoreAgainst", description: "Score against", defaultHeader: "A", demo: () => "9" },
  { id: "last5", description: "Last 5 W-L", defaultHeader: "L5", demo: () => "3-2" },
  { id: "gamesBack", description: "Games back", defaultHeader: "GB", demo: () => "9.0" },
  { id: "played", description: "Played", defaultHeader: "P", demo: () => "27" },
  { id: "won", description: "Won", defaultHeader: "W", demo: () => "9" },
  { id: "tie", description: "Tie", defaultHeader: "T", demo: () => "9" },
  { id: "lost", description: "Lost", defaultHeader: "L", demo: () => "9" },
  { id: "calculatedPoints", description: "Calculated points", defaultHeader: "PTS", demo: () => "27" },
  { id: "winningPercentageUs", description: "Winning Perc US Format", defaultHeader: "PCT", demo: () => ".500" },
  { id: "pointsPercentage", description: "Points percentage", defaultHeader: "PP%", demo: () => "50.0" },
];

const DEFAULT_ACTIVE_IDS = [
  "position",
  "teamName",
  "wonLostTie",
  "currentStreak",
  "winningPercentage",
  "scoreDifference",
  "scoreFor",
  "scoreAgainst",
  "last5",
  "gamesBack",
];

const RANKING_OPTIONS = [
  { value: "", label: "—" },
  { value: "highest_winning_percentage", label: "Highest winning percentage" },
  { value: "lowest_winning_percentage", label: "Lowest winning percentage" },
  { value: "most_score_for", label: "Most score for" },
  { value: "least_score_for", label: "Least score for" },
  { value: "most_score_against", label: "Most score against" },
  { value: "least_score_against", label: "Least score against" },
  { value: "most_points", label: "Most points" },
  { value: "least_points", label: "Least points" },
  { value: "most_wins", label: "Most wins" },
  { value: "least_wins", label: "Least wins" },
  { value: "most_played", label: "Most played" },
  { value: "greatest_score_difference", label: "Best score difference" },
  { value: "least_score_difference", label: "Worst score difference" },
];

const POINT_FIELDS = [
  { key: "win", label: "Win" },
  { key: "loss", label: "Loss" },
  { key: "tie", label: "Tie" },
  { key: "scoreFor", label: "Score for" },
  { key: "scoreAgainst", label: "Score against" },
];

function catalogById(id) {
  return COLUMN_CATALOG.find((c) => c.id === id);
}

function buildDefaultColumns() {
  return DEFAULT_ACTIVE_IDS.map((id) => {
    const col = catalogById(id);
    return { id, header: col?.defaultHeader ?? "", detailedOnly: false };
  });
}

function padPriorities(list, size = 3) {
  const next = Array.isArray(list) ? list.filter(Boolean).map(String) : [];
  while (next.length < size) next.push("");
  return next.slice(0, size);
}

function createBlankConfig() {
  return {
    description: "STANDINGS",
    columns: buildDefaultColumns(),
    showHomeRoad: false,
    homeLabel: "Home",
    roadLabel: "Road",
    overallLabel: "Overall",
    ranking: padPriorities([
      "highest_winning_percentage",
      "most_score_for",
      "greatest_score_difference",
    ]),
    headToHeadEnabled: true,
    headToHead: padPriorities([
      "highest_winning_percentage",
      "most_score_for",
    ]),
    points: { win: 3, loss: 0, tie: 1, scoreFor: 0, scoreAgainst: 0 },
    bonusPointsEnabled: false,
  };
}

function mapApiToConfig(data) {
  const blank = createBlankConfig();
  const layout = data?.websiteLayout || data?.layout || {};
  const ranking = data?.teamRanking || data?.ranking || {};

  const apiColumns = Array.isArray(layout.columns) ? layout.columns : [];
  const columns =
    apiColumns.length > 0
      ? apiColumns
          .filter((c) => c?.isVisible !== false)
          .map((c) => {
            const id = String(c.columnKey || c.id || "");
            const meta = catalogById(id);
            return {
              id,
              header:
                c.headerText != null
                  ? String(c.headerText)
                  : meta?.defaultHeader ?? "",
              detailedOnly: Boolean(c.showOnDetailedViewOnly),
            };
          })
          .filter((c) => c.id)
      : blank.columns;

  const h2h = ranking.headToHead || {};
  const h2hPriorities = Array.isArray(h2h.priorities)
    ? h2h.priorities
    : Array.isArray(ranking.headToHeadPriorities)
      ? ranking.headToHeadPriorities
      : blank.headToHead;

  return {
    description:
      layout.standingsDescription ||
      layout.description ||
      blank.description,
    columns,
    showHomeRoad: Boolean(
      layout.showHomeRoadOnDetailedView ?? layout.showHomeRoad
    ),
    homeLabel: layout.homeDescription || blank.homeLabel,
    roadLabel: layout.roadDescription || blank.roadLabel,
    overallLabel: layout.overallDescription || blank.overallLabel,
    ranking: padPriorities(
      ranking.rankingPriorities || ranking.priorities || blank.ranking
    ),
    headToHeadEnabled: h2h.enabled !== false,
    headToHead: padPriorities(h2hPriorities),
    points: {
      win: Number(ranking.points?.win ?? blank.points.win),
      loss: Number(ranking.points?.loss ?? blank.points.loss),
      tie: Number(ranking.points?.tie ?? blank.points.tie),
      scoreFor: Number(ranking.points?.scoreFor ?? blank.points.scoreFor),
      scoreAgainst: Number(
        ranking.points?.scoreAgainst ?? blank.points.scoreAgainst
      ),
    },
    bonusPointsEnabled: Boolean(ranking.bonusPointsEnabled),
  };
}

function buildSavePayload(config) {
  return {
    websiteLayout: {
      standingsDescription: config.description || "STANDINGS",
      showHomeRoadOnDetailedView: Boolean(config.showHomeRoad),
      homeDescription: config.homeLabel || "Home",
      roadDescription: config.roadLabel || "Road",
      overallDescription: config.overallLabel || "Overall",
      columns: config.columns.map((col) => ({
        columnKey: col.id,
        headerText: col.header ?? "",
        isVisible: true,
        showOnDetailedViewOnly: Boolean(col.detailedOnly),
      })),
    },
    teamRanking: {
      rankingPriorities: config.ranking.filter(Boolean),
      headToHead: {
        enabled: Boolean(config.headToHeadEnabled),
        priorities: config.headToHead.filter(Boolean),
      },
      points: {
        win: Number(config.points.win) || 0,
        loss: Number(config.points.loss) || 0,
        tie: Number(config.points.tie) || 0,
        scoreFor: Number(config.points.scoreFor) || 0,
        scoreAgainst: Number(config.points.scoreAgainst) || 0,
      },
      bonusPointsEnabled: Boolean(config.bonusPointsEnabled),
    },
  };
}

const fieldClass =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 shadow-sm transition focus:border-[#00ADE5] focus:outline-none focus:ring-2 focus:ring-[#00ADE5]/20 disabled:bg-slate-50 disabled:opacity-70";

function isFixedColumn(id) {
  return id === "position" || id === "teamName";
}

function LockedMark() {
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-400">
      <X className="h-3.5 w-3.5" strokeWidth={2.5} />
    </span>
  );
}

function RankSelect({ value, onChange, disabled }) {
  return (
    <div className="relative min-w-0 w-full max-w-lg">
      <select
        value={value}
        disabled={disabled}
        onChange={onChange}
        className={clsx(selectClass, disabled && "cursor-not-allowed opacity-60")}
      >
        {RANKING_OPTIONS.map((opt) => (
          <option key={opt.value || "empty"} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
    </div>
  );
}

export default function StandingsTab() {
  const { canEdit } = usePagePermission("standings");
  const { isSuperAdmin, selectedCompanyId, companiesReady } =
    useCompanyContext();

  const [config, setConfig] = useState(() => createBlankConfig());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState("layout");

  const loadConfig = async () => {
    setLoading(true);
    try {
      const res = await standingsConfigAPI.get();
      const data = res?.data ?? res;
      if (data && (data.websiteLayout || data.teamRanking || data.columns)) {
        setConfig(mapApiToConfig(data));
      } else {
        setConfig(createBlankConfig());
      }
    } catch (err) {
      setConfig(createBlankConfig());
      Swal.fire({
        icon: "warning",
        title: "Could not load standings",
        text: err.message || "Using default configuration.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin && (!companiesReady || !selectedCompanyId)) return;
    loadConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuperAdmin, selectedCompanyId, companiesReady]);

  const updateConfig = (patch) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  };

  const updateColumn = (columnId, patch) => {
    setConfig((prev) => ({
      ...prev,
      columns: prev.columns.map((col) =>
        col.id === columnId ? { ...col, ...patch } : col
      ),
    }));
  };

  const persistSort = async (columns) => {
    try {
      await standingsConfigAPI.sortLayout(columns.map((c) => c.id));
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Sort failed",
        text: err.message || "Could not update column order.",
      });
      throw err;
    }
  };

  const moveColumn = async (columnId, direction) => {
    if (isFixedColumn(columnId) || !canEdit) return;
    const idx = config.columns.findIndex((c) => c.id === columnId);
    if (idx < 0) return;
    const next = idx + direction;
    if (next < 0 || next >= config.columns.length) return;
    if (isFixedColumn(config.columns[next]?.id)) return;

    const columns = [...config.columns];
    const [item] = columns.splice(idx, 1);
    columns.splice(next, 0, item);
    const previous = config.columns;
    setConfig((prev) => ({ ...prev, columns }));

    try {
      await persistSort(columns);
    } catch {
      setConfig((prev) => ({ ...prev, columns: previous }));
    }
  };

  const removeColumn = async (columnId) => {
    if (isFixedColumn(columnId)) {
      Swal.fire({
        icon: "info",
        title: "Required column",
        text: "Position and Team columns cannot be removed.",
      });
      return;
    }
    if (!canEdit) return;
    if (isSuperAdmin && !selectedCompanyId) {
      Swal.fire({
        icon: "warning",
        title: "Select a company",
        text: "Choose a company before updating standings columns.",
      });
      return;
    }

    const previous = config.columns;
    updateConfig({
      columns: config.columns.filter((c) => c.id !== columnId),
    });

    try {
      await standingsConfigAPI.deleteColumn(columnId);
    } catch (err) {
      setConfig((prev) => ({ ...prev, columns: previous }));
      Swal.fire({
        icon: "error",
        title: "Delete failed",
        text: err.message || "Could not remove column.",
      });
    }
  };

  const addColumn = (catalogId) => {
    const col = catalogById(catalogId);
    if (!col || config.columns.some((c) => c.id === catalogId)) return;
    updateConfig({
      columns: [
        ...config.columns,
        { id: catalogId, header: col.defaultHeader, detailedOnly: false },
      ],
    });
  };

  const availableColumns = useMemo(
    () =>
      COLUMN_CATALOG.filter(
        (c) => !config.columns.some((active) => active.id === c.id)
      ),
    [config.columns]
  );

  const previewColumns = config.columns.filter((col) => !col.detailedOnly);

  const saveAll = async (message) => {
    if (!canEdit || saving) return;
    setSaving(true);
    try {
      await standingsConfigAPI.save(buildSavePayload(config));
      Swal.fire({
        icon: "success",
        title: "Saved",
        text: message || "Standings settings saved.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Save failed",
        text: err.message || "Could not save standings configuration.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-gray-200 bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-[#00ADE5]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SetupTabHeader
        title="Standings"
        description="Configure table columns, ranking rules, and points for your league."
      />

      <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
        {[
          { id: "layout", label: "Layout" },
          { id: "ranking", label: "Ranking" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSubTab(tab.id)}
            className={clsx(
              "rounded-lg px-5 py-2 text-sm font-semibold transition",
              activeSubTab === tab.id
                ? "bg-[#003366] text-white"
                : "text-gray-500 hover:text-[#003366]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeSubTab === "layout" ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm">
            <label className="mb-2 block text-xs font-semibold text-gray-600">
              Description
            </label>
            <input
              type="text"
              value={config.description}
              readOnly
              className={clsx(fieldClass, "max-w-md cursor-default bg-slate-50")}
            />
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-[#003366]/[0.04] to-[#00ADE5]/[0.06]">
                    {previewColumns.map((col) => {
                      const meta = catalogById(col.id);
                      return (
                        <th
                          key={col.id}
                          className="whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-wide text-[#003366]/80"
                        >
                          {col.header || meta?.description || ""}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {DEMO_TEAMS.map((team, rowIndex) => (
                    <tr
                      key={team}
                      className={
                        rowIndex % 2 === 1 ? "bg-slate-50/60" : "bg-white"
                      }
                    >
                      {previewColumns.map((col) => {
                        const meta = catalogById(col.id);
                        return (
                          <td
                            key={col.id}
                            className="whitespace-nowrap px-4 py-2.5 text-gray-700"
                          >
                            {meta?.demo(rowIndex, team) ?? "—"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-3.5">
              <h3 className="text-sm font-bold text-[#003366]">Columns</h3>
              <p className="mt-0.5 text-xs text-gray-500">
                Edit header labels, reorder columns, or show some only on
                detailed view
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-max border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-[1] min-w-[140px] border border-gray-200 bg-slate-50 px-3 py-2.5 text-left text-xs font-semibold text-gray-500" />
                    {config.columns.map((col) => {
                      const meta = catalogById(col.id);
                      return (
                        <th
                          key={col.id}
                          className="min-w-[110px] border border-gray-200 bg-slate-50 px-2 py-2.5 text-center text-xs font-semibold text-gray-700"
                        >
                          {meta?.description || col.id}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="sticky left-0 z-[1] border border-gray-200 bg-slate-50 px-3 py-3 text-xs font-semibold text-gray-600">
                      Header text
                    </td>
                    {config.columns.map((col) => (
                      <td
                        key={`hdr-${col.id}`}
                        className="border border-gray-200 bg-white px-2 py-2.5 text-center"
                      >
                        {isFixedColumn(col.id) ? (
                          <LockedMark />
                        ) : (
                          <input
                            type="text"
                            value={col.header}
                            disabled={!canEdit}
                            onChange={(e) =>
                              updateColumn(col.id, { header: e.target.value })
                            }
                            className="mx-auto w-full max-w-[88px] rounded-md border border-gray-300 px-2 py-1.5 text-center text-sm focus:border-[#00ADE5] focus:outline-none focus:ring-2 focus:ring-[#00ADE5]/20"
                          />
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="sticky left-0 z-[1] border border-gray-200 bg-slate-50 px-3 py-3 text-xs font-semibold text-gray-600">
                      Show on detailed view only
                    </td>
                    {config.columns.map((col) => (
                      <td
                        key={`det-${col.id}`}
                        className="border border-gray-200 bg-white px-2 py-3 text-center"
                      >
                        {isFixedColumn(col.id) ? (
                          <LockedMark />
                        ) : (
                          <input
                            type="checkbox"
                            checked={col.detailedOnly}
                            disabled={!canEdit}
                            onChange={(e) =>
                              updateColumn(col.id, {
                                detailedOnly: e.target.checked,
                              })
                            }
                            className="h-4 w-4 rounded border-gray-300 text-[#00ADE5] focus:ring-[#00ADE5]"
                          />
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="sticky left-0 z-[1] border border-gray-200 bg-slate-50 px-3 py-3 text-xs font-semibold text-gray-600">
                      Actions
                    </td>
                    {config.columns.map((col, index) => {
                      const locked = isFixedColumn(col.id);
                      const canMoveLeft =
                        index > 0 &&
                        !isFixedColumn(config.columns[index - 1]?.id);
                      const canMoveRight =
                        index < config.columns.length - 1 &&
                        !isFixedColumn(config.columns[index + 1]?.id);
                      return (
                        <td
                          key={`act-${col.id}`}
                          className="border border-gray-200 bg-white px-2 py-3 text-center"
                        >
                          {locked || !canEdit ? (
                            locked ? (
                              <LockedMark />
                            ) : null
                          ) : (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => removeColumn(col.id)}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white transition hover:bg-red-600"
                                title="Remove"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                              {canMoveLeft && (
                                <button
                                  type="button"
                                  onClick={() => moveColumn(col.id, -1)}
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#003366] text-white transition hover:bg-[#004080]"
                                  title="Move left"
                                >
                                  <ChevronLeft className="h-3.5 w-3.5" />
                                </button>
                              )}
                              {canMoveRight && (
                                <button
                                  type="button"
                                  onClick={() => moveColumn(col.id, 1)}
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#003366] text-white transition hover:bg-[#004080]"
                                  title="Move right"
                                >
                                  <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-3.5">
              <h3 className="text-sm font-bold text-[#003366]">Add column</h3>
            </div>
            <div className="overflow-x-auto">
              {availableColumns.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-gray-500">
                  All stats are already in the layout
                </p>
              ) : (
                <table className="min-w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="border border-gray-200 px-4 py-2.5 text-left text-xs font-semibold text-gray-600">
                        Description
                      </th>
                      <th className="border border-gray-200 px-4 py-2.5 text-left text-xs font-semibold text-gray-600">
                        Header text
                      </th>
                      <th className="border border-gray-200 px-4 py-2.5 text-left text-xs font-semibold text-gray-600" />
                    </tr>
                  </thead>
                  <tbody>
                    {availableColumns.map((col) => (
                      <tr key={col.id} className="bg-white">
                        <td className="border border-gray-200 px-4 py-2.5 font-medium text-gray-800">
                          {col.description}
                        </td>
                        <td className="border border-gray-200 px-4 py-2.5 text-gray-700">
                          {col.defaultHeader || "—"}
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-center">
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => addColumn(col.id)}
                              className="rounded-md bg-[#003366] px-3 py-1 text-xs font-semibold text-white transition hover:bg-[#004080]"
                            >
                              Add
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {canEdit && (
            <div className="flex justify-end">
              <SetupPrimaryButton
                onClick={() => saveAll("Layout saved.")}
                icon={saving ? Loader2 : Save}
                disabled={saving}
              >
                {saving ? "Saving..." : "Update layout"}
              </SetupPrimaryButton>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-[#003366]">Ranking</h3>
            <p className="mt-1 text-xs text-gray-500">
              Sort teams by these rules in order (1 first, then 2, then 3).
            </p>
            <div className="mt-4 space-y-2">
              {config.ranking.map((value, index) => (
                <div key={`rank-${index}`} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#003366] text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <RankSelect
                    value={value}
                    disabled={!canEdit}
                    onChange={(e) => {
                      const ranking = [...config.ranking];
                      ranking[index] = e.target.value;
                      updateConfig({ ranking });
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-gray-100 pt-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-[#003366]">
                    Head to head
                  </h4>
                  <p className="mt-0.5 text-xs text-gray-500">
                    If still tied, use matches between those teams
                  </p>
                </div>
                <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={config.headToHeadEnabled}
                    disabled={!canEdit}
                    onChange={(e) => {
                      updateConfig({ headToHeadEnabled: e.target.checked });
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-[#00ADE5] focus:ring-[#00ADE5]"
                  />
                  Enabled
                </label>
              </div>

              {config.headToHeadEnabled && (
                <div className="mt-3 space-y-2">
                  {config.headToHead.map((value, index) => (
                    <div
                      key={`h2h-${index}`}
                      className="flex items-center gap-3"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#00ADE5]/15 text-xs font-bold text-[#003366]">
                        {index + 1}
                      </span>
                      <RankSelect
                        value={value}
                        disabled={!canEdit}
                        onChange={(e) => {
                          const headToHead = [...config.headToHead];
                          headToHead[index] = e.target.value;
                          updateConfig({ headToHead });
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-[#003366]">Points</h3>
            <p className="mt-1 text-xs text-gray-500">
              How many points a team gets for each result
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {POINT_FIELDS.map((field) => (
                <div key={field.key} className="w-[88px]">
                  <label className="mb-1 block text-center text-[11px] font-semibold text-gray-500">
                    {field.label}
                  </label>
                  <input
                    type="number"
                    value={config.points[field.key]}
                    disabled={!canEdit}
                    onChange={(e) =>
                      updateConfig({
                        points: {
                          ...config.points,
                          [field.key]: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full rounded-lg border border-gray-200 px-2 py-2 text-center text-sm font-semibold text-[#003366] focus:border-[#00ADE5] focus:outline-none focus:ring-2 focus:ring-[#00ADE5]/20"
                  />
                </div>
              ))}
            </div>
          </div>

          {canEdit && (
            <div className="flex justify-end">
              <SetupPrimaryButton
                onClick={() => saveAll("Ranking and points saved.")}
                icon={saving ? Loader2 : Save}
                disabled={saving}
              >
                {saving ? "Saving..." : "Update ranking"}
              </SetupPrimaryButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
