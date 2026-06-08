import { useMemo, useState } from "react";
import {
  BarChart3,
  Target,
  HandHelping,
  Square,
  ShieldAlert,
  Shield,
  Star,
  Users,
  Percent,
  Crosshair,
  Focus,
  Flag,
  AlertTriangle,
} from "lucide-react";
import Swal from "sweetalert2";
import {
  SetupPageHeader,
  SettingsSection,
  SettingsRow,
  SetupFooter,
  SetupTip,
} from "./SetupSettingsUI";

const PLAYER_STATS = [
  {
    key: "trackGoals",
    title: "Goals",
    description: "Record goals scored by individual players each match.",
    icon: Target,
  },
  {
    key: "trackAssists",
    title: "Assists",
    description: "Track players who assisted goal-scoring opportunities.",
    icon: HandHelping,
  },
  {
    key: "trackYellowCards",
    title: "Yellow cards",
    description: "Log cautions issued during matches for discipline reports.",
    icon: Square,
  },
  {
    key: "trackRedCards",
    title: "Red cards",
    description: "Record dismissals and automatic suspension triggers.",
    icon: ShieldAlert,
  },
  {
    key: "trackCleanSheets",
    title: "Clean sheets",
    description: "Track goalkeeper shutouts when no goals are conceded.",
    icon: Shield,
  },
  {
    key: "trackPlayerOfMatch",
    title: "Player of the match",
    description: "Allow officials to nominate a standout performer per game.",
    icon: Star,
  },
];

const MATCH_STATS = [
  {
    key: "trackAttendance",
    title: "Attendance",
    description: "Capture spectator or participant turnout for each fixture.",
    icon: Users,
  },
  {
    key: "trackPossession",
    title: "Possession",
    description: "Store ball possession percentages for tactical analysis.",
    icon: Percent,
  },
  {
    key: "trackShots",
    title: "Total shots",
    description: "Count all shot attempts including blocked and off-target efforts.",
    icon: Crosshair,
  },
  {
    key: "trackShotsOnTarget",
    title: "Shots on target",
    description: "Measure attacking threat with shots requiring a save or goal.",
    icon: Focus,
  },
  {
    key: "trackCorners",
    title: "Corners",
    description: "Track corner kicks awarded during each match.",
    icon: Flag,
  },
  {
    key: "trackFouls",
    title: "Fouls",
    description: "Record fouls committed for fairness and discipline insights.",
    icon: AlertTriangle,
  },
];

function countEnabled(config, items) {
  return items.filter((item) => config[item.key]).length;
}

export default function StatisticSetup() {
  const [config, setConfig] = useState({
    trackGoals: true,
    trackAssists: true,
    trackYellowCards: true,
    trackRedCards: true,
    trackCleanSheets: true,
    trackPlayerOfMatch: true,
    trackAttendance: false,
    trackPossession: false,
    trackShots: false,
    trackShotsOnTarget: false,
    trackCorners: false,
    trackFouls: false,
  });

  const [loading, setLoading] = useState(false);

  const playerEnabled = useMemo(
    () => countEnabled(config, PLAYER_STATS),
    [config]
  );
  const matchEnabled = useMemo(
    () => countEnabled(config, MATCH_STATS),
    [config]
  );
  const totalEnabled = playerEnabled + matchEnabled;

  const setFlag = (key, value) =>
    setConfig((prev) => ({ ...prev, [key]: value }));

  const setGroup = (items, value) =>
    setConfig((prev) =>
      items.reduce((acc, item) => ({ ...acc, [item.key]: value }), prev)
    );

  const handleSave = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Saved",
        text: "Statistics configuration has been saved successfully",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error saving config:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save configuration",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <SetupPageHeader
        title="Statistic Setup"
        description="Define which player and match metrics your league collects. A focused setup keeps reporting accurate without slowing down results entry."
        stats={[
          { label: "Total active", value: totalEnabled },
          { label: "Player stats", value: `${playerEnabled}/${PLAYER_STATS.length}` },
          { label: "Match stats", value: `${matchEnabled}/${MATCH_STATS.length}` },
          {
            label: "Coverage",
            value: `${Math.round((totalEnabled / (PLAYER_STATS.length + MATCH_STATS.length)) * 100)}%`,
          },
        ]}
      />

      <div className="space-y-6">
        <SettingsSection
          icon={Target}
          title="Player statistics"
          subtitle="Individual performance metrics recorded per player"
          enabledCount={playerEnabled}
          totalCount={PLAYER_STATS.length}
          onEnableAll={() => setGroup(PLAYER_STATS, true)}
          onDisableAll={() => setGroup(PLAYER_STATS, false)}
        >
          {PLAYER_STATS.map((item) => (
            <SettingsRow
              key={item.key}
              icon={item.icon}
              title={item.title}
              description={item.description}
              checked={config[item.key]}
              onChange={(value) => setFlag(item.key, value)}
            />
          ))}
        </SettingsSection>

        <SettingsSection
          icon={BarChart3}
          title="Match statistics"
          subtitle="Team-level metrics captured once per fixture"
          enabledCount={matchEnabled}
          totalCount={MATCH_STATS.length}
          onEnableAll={() => setGroup(MATCH_STATS, true)}
          onDisableAll={() => setGroup(MATCH_STATS, false)}
        >
          {MATCH_STATS.map((item) => (
            <SettingsRow
              key={item.key}
              icon={item.icon}
              title={item.title}
              description={item.description}
              checked={config[item.key]}
              onChange={(value) => setFlag(item.key, value)}
            />
          ))}
        </SettingsSection>
      </div>

      <SetupFooter onSave={handleSave} loading={loading} />

      <SetupTip>
        <strong className="font-semibold text-gray-800">Recommendation:</strong>{" "}
        Start with core stats (goals, cards, assists) and add advanced metrics
        only when your officials can reliably capture them every week.
      </SetupTip>
    </div>
  );
}
