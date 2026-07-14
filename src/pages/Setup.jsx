import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronDown, Settings2 } from "lucide-react";
import clsx from "clsx";
import { useAuthContext } from "../context/AuthContext";
import {
  getNestedTabsForCategory,
  hasPagePermission,
} from "../utils/userNavigation";
import RequirePageAccess from "../components/RequirePageAccess";
import { usePagePermission } from "../hooks/usePagePermission";

// Import settings components
import LeagueOptions from "../components/settings/LeagueOptions";
import Roles from "../components/settings/Roles";
import GeneralSiteSettings from "../components/settings/GeneralSiteSettings";
import FacebookSettings from "../components/settings/FacebookSettings";
import TwitterSettings from "../components/settings/TwitterSettings";
import Terminology from "../components/settings/Terminology";

// Import setup tab components
import Competitions from "./Competitions";
import Seasons from "../components/setup/Seasons";
import VenuesTab from "../components/setup/VenuesTab";
import TeamsTab from "../components/setup/TeamsTab";
import StatisticSetup from "../components/setup/StatisticSetup";
import StandingsTab from "../components/setup/StandingsTab";
import ScoreEntryOptions from "../components/setup/ScoreEntryOptions";

const settingsTabs = [
  { id: "league", label: "League Options", component: LeagueOptions },
  { id: "roles", label: "Roles", component: Roles },
  {
    id: "general",
    label: "General Site Settings",
    component: GeneralSiteSettings,
  },
  { id: "facebook", label: "Facebook Settings", component: FacebookSettings },
  { id: "twitter", label: "Twitter Settings", component: TwitterSettings },
  { id: "terminology", label: "Terminology", component: Terminology },
];

const MAIN_TAB_COMPONENTS = {
  settings: { id: "settings", label: "Settings", hasSubTabs: true },
  seasons: { id: "seasons", label: "Seasons", component: Seasons },
  venues: { id: "venues", label: "Venues", component: VenuesTab },
  teams: { id: "teams", label: "Teams", component: TeamsTab },
  competitions: { id: "competitions", label: "Competitions", component: Competitions },
  statistics: { id: "statistics", label: "Statistic Setup", component: StatisticSetup },
  standings: { id: "standings", label: "Standings", component: StandingsTab },
  "score-entry": {
    id: "score-entry",
    label: "Score Entry Options",
    component: ScoreEntryOptions,
  },
};

const FALLBACK_MAIN_TABS = Object.values(MAIN_TAB_COMPONENTS);

const tabButtonClass = (isActive) =>
  clsx(
    "shrink-0 rounded-xl px-4 py-2.5 text-xs font-bold tracking-wide transition whitespace-nowrap",
    isActive
      ? "bg-gradient-to-r from-[#003366] to-[#004080] text-white shadow-sm"
      : "text-gray-500 hover:bg-slate-50 hover:text-[#003366]"
  );

export default function Setup() {
  const { user } = useAuthContext();
  const { canEdit: canEditSettings } = usePagePermission("settings");
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");

  const mainTabs = useMemo(() => {
    const nested = getNestedTabsForCategory(user, "setup");
    if (nested.length === 0) return FALLBACK_MAIN_TABS;

    return nested
      .filter((item) => hasPagePermission(user, item.pageKey, "view"))
      .map((item) => {
        const base = MAIN_TAB_COMPONENTS[item.tabId];
        if (!base) return null;
        return {
          ...base,
          label: item.label || base.label,
        };
      })
      .filter(Boolean);
  }, [user]);

  const allowedTabIds = useMemo(
    () => new Set(mainTabs.map((tab) => tab.id)),
    [mainTabs]
  );

  const defaultTabId = mainTabs[0]?.id || "settings";

  const [activeMainTab, setActiveMainTab] = useState(() =>
    tabParam && MAIN_TAB_COMPONENTS[tabParam] ? tabParam : "settings"
  );
  const [activeSettingsTab, setActiveSettingsTab] = useState("league");
  const [isTabsOpen, setIsTabsOpen] = useState(false);

  useEffect(() => {
    if (tabParam && allowedTabIds.has(tabParam)) {
      setActiveMainTab(tabParam);
      return;
    }
    if (!allowedTabIds.has(activeMainTab)) {
      setActiveMainTab(defaultTabId);
    }
  }, [tabParam, allowedTabIds, activeMainTab, defaultTabId]);

  const handleMainTabChange = (tabId) => {
    setActiveMainTab(tabId);
    const nextParams = new URLSearchParams(searchParams);
    if (tabId === "settings") {
      nextParams.delete("tab");
    } else {
      nextParams.set("tab", tabId);
    }
    if (tabId !== "competitions") {
      nextParams.delete("manage");
    }
    setSearchParams(nextParams, { replace: true });
  };

  const getActiveComponent = () => {
    if (activeMainTab === "settings") {
      const ActiveComponent =
        settingsTabs.find((tab) => tab.id === activeSettingsTab)?.component || LeagueOptions;
      return <ActiveComponent canEdit={canEditSettings} />;
    }
    const mainTab = mainTabs.find((tab) => tab.id === activeMainTab);
    const ActiveComponent = mainTab?.component;
    return ActiveComponent ? <ActiveComponent /> : null;
  };

  const activeTabLabel = settingsTabs.find((tab) => tab.id === activeSettingsTab)?.label;

  return (
    <RequirePageAccess pageKey="setup">
    <div className="space-y-5 py-4 md:py-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#003366] to-[#004080] text-white shadow-sm">
            <Settings2 size={22} />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Setup</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Configure league settings, seasons, teams, and competitions
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
        <nav
          className="flex gap-1 overflow-x-auto p-2"
          aria-label="Setup sections"
        >
          {mainTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleMainTabChange(tab.id)}
              className={tabButtonClass(activeMainTab === tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeMainTab === "settings" ? (
        <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
          <div className="md:hidden border-b border-gray-100 p-4">
            <button
              type="button"
              onClick={() => setIsTabsOpen(!isTabsOpen)}
              className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-slate-50 px-4 py-2.5"
            >
              <span className="text-sm font-semibold text-gray-700">
                {activeTabLabel}
              </span>
              <ChevronDown
                className={clsx(
                  "h-5 w-5 text-gray-500 transition-transform",
                  isTabsOpen && "rotate-180"
                )}
              />
            </button>
            {isTabsOpen && (
              <div className="mt-2 space-y-1 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                {settingsTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveSettingsTab(tab.id);
                      setIsTabsOpen(false);
                    }}
                    className={clsx(
                      "w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition",
                      activeSettingsTab === tab.id
                        ? "bg-gradient-to-r from-[#003366] to-[#004080] text-white"
                        : "text-gray-600 hover:bg-slate-50"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="hidden border-b border-gray-100 md:block">
            <nav className="flex gap-1 overflow-x-auto p-2">
              {settingsTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSettingsTab(tab.id)}
                  className={tabButtonClass(activeSettingsTab === tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {getActiveComponent()}
        </div>
      ) : (
        <div>{getActiveComponent()}</div>
      )}
    </div>
    </RequirePageAccess>
  );
}
