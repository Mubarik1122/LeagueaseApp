import { useMemo, useState } from "react";
import {
  ClipboardList,
  ShieldCheck,
  UserCog,
  Users,
  BadgeCheck,
  RefreshCw,
  Upload,
  Eye,
  Radio,
  Clock,
  Bell,
  FileText,
  Lock,
} from "lucide-react";
import Swal from "sweetalert2";
import {
  SetupPageHeader,
  SettingsSection,
  SettingsRow,
  SetupFooter,
  SetupTip,
  InlineNumberField,
} from "./SetupSettingsUI";

const PERMISSION_OPTIONS = [
  {
    key: "allowScoreEntry",
    title: "Allow score entry",
    description: "When off, only league administrators can submit results.",
    icon: ClipboardList,
  },
  {
    key: "allowTeamManagerEntry",
    title: "Team manager entry",
    description: "Let designated team managers report scores for their fixtures.",
    icon: UserCog,
    dependsOn: "allowScoreEntry",
  },
  {
    key: "allowPlayerEntry",
    title: "Player entry",
    description: "Allow registered players to submit scores from their account.",
    icon: Users,
    dependsOn: "allowScoreEntry",
  },
];

const APPROVAL_OPTIONS = [
  {
    key: "requireApproval",
    title: "Admin approval required",
    description: "Hold submitted scores until an administrator reviews and approves.",
    icon: ShieldCheck,
  },
  {
    key: "requireBothTeamsConfirm",
    title: "Dual-team confirmation",
    description: "Both home and away sides must confirm before a result is final.",
    icon: BadgeCheck,
  },
  {
    key: "allowScoreCorrection",
    title: "Post-submission corrections",
    description: "Permit score amendments within a defined window after the match.",
    icon: RefreshCw,
  },
];

const DISPLAY_OPTIONS = [
  {
    key: "autoPublishResults",
    title: "Auto-publish results",
    description: "Publish scores to standings as soon as they pass your rules.",
    icon: Upload,
  },
  {
    key: "showScoresImmediately",
    title: "Immediate public display",
    description: "Show scores on public pages without an additional delay.",
    icon: Eye,
  },
  {
    key: "allowLiveScoreUpdates",
    title: "Live score updates",
    description: "Enable in-match score changes while the fixture is in progress.",
    icon: Radio,
  },
  {
    key: "allowHalfTimeScores",
    title: "Half-time scores",
    description: "Capture and display interval scores alongside full-time results.",
    icon: Clock,
  },
];

const NOTIFICATION_OPTIONS = [
  {
    key: "notifyOnScoreEntry",
    title: "Entry notifications",
    description: "Alert relevant users when a new score is submitted.",
    icon: Bell,
  },
  {
    key: "requireMatchReport",
    title: "Match report required",
    description: "Require a short report or notes with every score submission.",
    icon: FileText,
  },
];

function countEnabled(config, items) {
  return items.filter((item) => config[item.key]).length;
}

export default function ScoreEntryOptions() {
  const [config, setConfig] = useState({
    allowScoreEntry: true,
    requireApproval: false,
    allowTeamManagerEntry: true,
    allowPlayerEntry: false,
    requireBothTeamsConfirm: false,
    autoPublishResults: true,
    notifyOnScoreEntry: true,
    allowScoreCorrection: true,
    correctionDeadlineHours: 48,
    showScoresImmediately: true,
    allowLiveScoreUpdates: false,
    requireMatchReport: false,
    allowHalfTimeScores: true,
  });

  const [loading, setLoading] = useState(false);

  const permissionEnabled = useMemo(
    () => countEnabled(config, PERMISSION_OPTIONS),
    [config]
  );
  const approvalEnabled = useMemo(
    () => countEnabled(config, APPROVAL_OPTIONS),
    [config]
  );
  const displayEnabled = useMemo(
    () => countEnabled(config, DISPLAY_OPTIONS),
    [config]
  );
  const notificationEnabled = useMemo(
    () => countEnabled(config, NOTIFICATION_OPTIONS),
    [config]
  );

  const securityLevel = useMemo(() => {
    let score = 0;
    if (!config.allowScoreEntry) score += 2;
    if (config.requireApproval) score += 2;
    if (config.requireBothTeamsConfirm) score += 2;
    if (!config.allowPlayerEntry) score += 1;
    if (config.requireMatchReport) score += 1;
    if (score >= 6) return "High";
    if (score >= 3) return "Balanced";
    return "Open";
  }, [config]);

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
        text: "Score entry options have been saved successfully",
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

  const renderRows = (items) =>
    items.map((item) => (
      <SettingsRow
        key={item.key}
        icon={item.icon}
        title={item.title}
        description={item.description}
        checked={config[item.key]}
        onChange={(value) => setFlag(item.key, value)}
        disabled={
          item.dependsOn ? !config[item.dependsOn] : false
        }
      />
    ));

  return (
    <div className="space-y-6">
      <SetupPageHeader
        title="Score Entry Options"
        description="Control who can enter scores, how they are verified, and when results go live across your league."
        stats={[
          { label: "Security level", value: securityLevel },
          { label: "Permissions", value: `${permissionEnabled}/${PERMISSION_OPTIONS.length}` },
          { label: "Verification", value: `${approvalEnabled}/${APPROVAL_OPTIONS.length}` },
          { label: "Publishing", value: `${displayEnabled}/${DISPLAY_OPTIONS.length}` },
        ]}
      />

      <div className="space-y-6">
        <SettingsSection
          icon={Lock}
          title="Entry permissions"
          subtitle="Who is allowed to submit match results"
          enabledCount={permissionEnabled}
          totalCount={PERMISSION_OPTIONS.length}
          onEnableAll={() => setGroup(PERMISSION_OPTIONS, true)}
          onDisableAll={() => setGroup(PERMISSION_OPTIONS, false)}
        >
          {renderRows(PERMISSION_OPTIONS)}
        </SettingsSection>

        <SettingsSection
          icon={ShieldCheck}
          title="Approval & verification"
          subtitle="Quality controls before results become official"
          enabledCount={approvalEnabled}
          totalCount={APPROVAL_OPTIONS.length}
          onEnableAll={() => setGroup(APPROVAL_OPTIONS, true)}
          onDisableAll={() => setGroup(APPROVAL_OPTIONS, false)}
        >
          {renderRows(APPROVAL_OPTIONS)}
          {config.allowScoreCorrection && (
            <InlineNumberField
              label="Correction deadline"
              hint="How long after kick-off teams may request a score change."
              min={1}
              max={168}
              value={config.correctionDeadlineHours}
              onChange={(e) =>
                setConfig({
                  ...config,
                  correctionDeadlineHours:
                    parseInt(e.target.value, 10) || 48,
                })
              }
            />
          )}
        </SettingsSection>

        <SettingsSection
          icon={Eye}
          title="Display & publishing"
          subtitle="When and how scores appear publicly"
          enabledCount={displayEnabled}
          totalCount={DISPLAY_OPTIONS.length}
          onEnableAll={() => setGroup(DISPLAY_OPTIONS, true)}
          onDisableAll={() => setGroup(DISPLAY_OPTIONS, false)}
        >
          {renderRows(DISPLAY_OPTIONS)}
        </SettingsSection>

        <SettingsSection
          icon={Bell}
          title="Notifications & reporting"
          subtitle="Alerts and documentation tied to score entry"
          enabledCount={notificationEnabled}
          totalCount={NOTIFICATION_OPTIONS.length}
          onEnableAll={() => setGroup(NOTIFICATION_OPTIONS, true)}
          onDisableAll={() => setGroup(NOTIFICATION_OPTIONS, false)}
        >
          {renderRows(NOTIFICATION_OPTIONS)}
        </SettingsSection>
      </div>

      <SetupFooter onSave={handleSave} loading={loading} />

      <SetupTip>
        <strong className="font-semibold text-gray-800">Best practice:</strong>{" "}
        Competitive leagues often combine manager entry with admin approval.
        Casual leagues can enable auto-publish for faster standings updates.
      </SetupTip>
    </div>
  );
}
