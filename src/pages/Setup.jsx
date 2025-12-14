import { useState } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

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

const mainTabs = [
  { id: "settings", label: "SETTINGS", hasSubTabs: true },
  { id: "competitions", label: "COMPETITIONS", component: Competitions },
  { id: "seasons", label: "SEASONS", component: Seasons },
  { id: "venues", label: "VENUES", component: VenuesTab },
  { id: "statistics", label: "STATISTIC SETUP", component: StatisticSetup },
  { id: "standings", label: "STANDINGS", component: StandingsTab },
  { id: "score-entry", label: "SCORE ENTRY OPTIONS", component: ScoreEntryOptions },
];

export default function Setup() {
  const [activeMainTab, setActiveMainTab] = useState("settings");
  const [activeSettingsTab, setActiveSettingsTab] = useState("league");
  const [isTabsOpen, setIsTabsOpen] = useState(false);

  // Get the active component to render
  const getActiveComponent = () => {
    if (activeMainTab === "settings") {
      const ActiveComponent =
        settingsTabs.find((tab) => tab.id === activeSettingsTab)?.component || LeagueOptions;
      return <ActiveComponent />;
    } else {
      const mainTab = mainTabs.find((tab) => tab.id === activeMainTab);
      const ActiveComponent = mainTab?.component;
      return ActiveComponent ? <ActiveComponent /> : null;
    }
  };

  const activeTabLabel = settingsTabs.find((tab) => tab.id === activeSettingsTab)?.label;

  return (
    <div className="p-4 md:p-6">
      {/* Top Navigation - Main Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex flex-wrap gap-1 md:gap-2">
          {mainTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveMainTab(tab.id)}
              className={clsx(
                "px-2 md:px-4 py-2 text-xs md:text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors",
                activeMainTab === tab.id
                  ? "border-[#00ADE5] text-[#00ADE5]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Settings Sub-tabs Section */}
      {activeMainTab === "settings" ? (
        <>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6">
            Settings
          </h1>

          <div className="bg-white rounded-lg shadow">
            {/* Mobile Tabs Dropdown */}
            <div className="md:hidden border-b border-gray-200 p-4">
              <button
                onClick={() => setIsTabsOpen(!isTabsOpen)}
                className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg"
              >
                <span className="text-sm font-medium text-gray-700">
                  {activeTabLabel}
                </span>
                <ChevronDown
                  className={clsx(
                    "w-5 h-5 text-gray-500 transition-transform",
                    isTabsOpen && "transform rotate-180"
                  )}
                />
              </button>
              {isTabsOpen && (
                <div className="mt-2 py-2 bg-white rounded-lg shadow-lg border border-gray-200">
                  {settingsTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveSettingsTab(tab.id);
                        setIsTabsOpen(false);
                      }}
                      className={clsx(
                        "w-full text-left px-4 py-2 text-sm",
                        activeSettingsTab === tab.id
                          ? "text-[#00ADE5] bg-blue-50"
                          : "text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Settings Sub-tabs */}
            <div className="hidden md:block border-b border-gray-200">
              <div className="flex flex-wrap">
                {settingsTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSettingsTab(tab.id)}
                    className={clsx(
                      "px-6 py-3 text-sm font-medium transition-colors",
                      activeSettingsTab === tab.id
                        ? "border-b-2 border-[#00ADE5] text-[#00ADE5]"
                        : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            {getActiveComponent()}
          </div>
        </>
      ) : (
        /* Content for other main tabs */
        <div>{getActiveComponent()}</div>
      )}
    </div>
  );
}
