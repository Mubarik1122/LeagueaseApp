import { useEffect, useMemo, useRef, useState } from "react";
import {
  AtSign,
  CalendarDays,
  Check,
  ClipboardList,
  Layers,
  LayoutGrid,
  Loader2,
  MapPin,
  Mic,
  MicOff,
  Plus,
  Send,
  Shield,
  ShieldOff,
  Trophy,
  UserCog,
  UserPlus,
  Users,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import clsx from "clsx";
import { assistantAPI } from "../services/api";
import { useCompanyContext } from "../context/CompanyContext";
import {
  createSpeechRecognizer,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  speakText,
  stopSpeaking,
} from "../utils/assistantVoice";

const COMPANY_QUESTION_RE =
  /which company|what company|company (is this|should|for)|select (a )?company/i;

const WELCOME =
  "Hello! I'm the Leaguease assistant. I can help with access control, scheduling, setup, and lookups.\n\nTap Actions, type @, or use the mic to speak.";

const ACTION_CATEGORIES = [
  {
    id: "access",
    label: "Access",
    actions: [
      {
        id: "create_user",
        label: "Create user",
        value: "Create a new user",
        hint: "Invite a new account",
        Icon: UserPlus,
      },
      {
        id: "update_user",
        label: "Update user",
        value: "Update a user",
        hint: "Edit profile details",
        Icon: UserCog,
      },
      {
        id: "assign_role",
        label: "Assign role",
        value: "Assign a role to a user",
        hint: "Grant access",
        Icon: Shield,
      },
      {
        id: "remove_role",
        label: "Remove role",
        value: "Remove a role from a user",
        hint: "Revoke access",
        Icon: ShieldOff,
      },
      {
        id: "users_by_role",
        label: "Users by role",
        value: "List users by role",
        hint: "Lookup directory",
        Icon: Users,
      },
    ],
  },
  {
    id: "schedule",
    label: "Schedule",
    actions: [
      {
        id: "schedule_match",
        label: "Schedule match",
        value: "Schedule a match",
        hint: "Create a fixture",
        Icon: CalendarDays,
      },
      {
        id: "todays_matches",
        label: "Today's matches",
        value: "Show today's matches",
        hint: "View schedule",
        Icon: CalendarDays,
      },
      {
        id: "save_result",
        label: "Save result",
        value: "Save a match result",
        hint: "Enter final score",
        Icon: ClipboardList,
      },
      {
        id: "enter_stats",
        label: "Enter stats",
        value: "Enter player stats",
        hint: "Match statistics",
        Icon: ClipboardList,
      },
    ],
  },
  {
    id: "setup",
    label: "Setup",
    actions: [
      {
        id: "create_team",
        label: "Create team",
        value: "Create a team",
        hint: "Add a club/team",
        Icon: Users,
      },
      {
        id: "add_player",
        label: "Add player",
        value: "Add a player to a team",
        hint: "Roster update",
        Icon: Plus,
      },
      {
        id: "add_venue",
        label: "Add venue",
        value: "Add a venue",
        hint: "New location",
        Icon: MapPin,
      },
      {
        id: "create_season",
        label: "Create season",
        value: "Create a season",
        hint: "Season timeline",
        Icon: Trophy,
      },
      {
        id: "create_division",
        label: "Create division",
        value: "Create a division",
        hint: "Competition group",
        Icon: Layers,
      },
    ],
  },
];

const ALL_ACTIONS = ACTION_CATEGORIES.flatMap((category) =>
  category.actions.map((action) => ({
    ...action,
    categoryId: category.id,
    categoryLabel: category.label,
  }))
);

const SUGGESTION_CHIPS = [
  ALL_ACTIONS.find((a) => a.id === "create_user"),
  ALL_ACTIONS.find((a) => a.id === "schedule_match"),
  ALL_ACTIONS.find((a) => a.id === "create_team"),
  ALL_ACTIONS.find((a) => a.id === "todays_matches"),
].filter(Boolean);

const ACTION_LABELS = {
  create_user: "Create User",
  create_team: "Create Team",
  create_match: "Create Match",
  create_venue: "Create Venue",
  create_season: "Create Season",
  create_division: "Create Division",
  create_player: "Create Player",
  save_match_result: "Save Result",
  save_player_stats: "Player Stats",
  update_user: "Update User",
  assign_role: "Assign Role",
  remove_role: "Remove Role",
  update_match: "Update Match",
  delete_match: "Delete Match",
  update_team: "Update Team",
  delete_team: "Delete Team",
  create_point_type: "Point Type",
};

function BasketballIcon({ className }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="32" cy="32" r="30" fill="#F97316" />
      <circle
        cx="32"
        cy="32"
        r="30"
        fill="none"
        stroke="#7C2D12"
        strokeWidth="2.5"
      />
      <path
        d="M32 2v60M2 32h60M12 12c10 8 30 8 40 0M12 52c10-8 30-8 40 0"
        fill="none"
        stroke="#7C2D12"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="22" cy="22" r="3" fill="#FDBA74" opacity="0.55" />
    </svg>
  );
}

function StatusChip({ status, actionType }) {
  if (!status || status === "collecting") {
    if (!actionType) return null;
    return (
      <span className="rounded-md bg-white/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/90">
        {ACTION_LABELS[actionType] || actionType}
      </span>
    );
  }

  const styles =
    status === "confirming"
      ? "bg-amber-400/20 text-amber-50"
      : status === "completed"
        ? "bg-emerald-400/20 text-emerald-50"
        : status === "cancelled"
          ? "bg-white/10 text-white/80"
          : status === "error"
            ? "bg-red-400/20 text-red-50"
            : "bg-white/10 text-white/90";

  const label =
    status === "confirming" && actionType
      ? `Confirm · ${ACTION_LABELS[actionType] || actionType}`
      : status;

  return (
    <span
      className={clsx(
        "rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wide",
        styles
      )}
    >
      {label}
    </span>
  );
}

function parseMention(text) {
  const match = String(text || "").match(/(?:^|\s)@([^\s@]*)$/);
  if (!match) return null;
  return {
    query: match[1] || "",
    start: match.index + (match[0].startsWith(" ") ? 1 : 0),
  };
}

export default function AssistantChat() {
  const { isSuperAdmin, selectedCompanyId, selectedCompany } =
    useCompanyContext();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [status, setStatus] = useState(null);
  const [pendingActionType, setPendingActionType] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionIndex, setMentionIndex] = useState(0);
  const [listening, setListening] = useState(false);
  const [voiceSupported] = useState(() => isSpeechRecognitionSupported());
  const [ttsSupported] = useState(() => isSpeechSynthesisSupported());
  const [speakReplies, setSpeakReplies] = useState(true);
  const [voiceHint, setVoiceHint] = useState("");
  const [messages, setMessages] = useState([
    { id: "welcome", role: "assistant", content: WELCOME },
  ]);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const autoCompanySentRef = useRef(false);
  const sendingRef = useRef(false);
  const sendMessageRef = useRef(null);
  const messagesRef = useRef(messages);
  const conversationIdRef = useRef(conversationId);
  const recognitionRef = useRef(null);
  const speakRepliesRef = useRef(speakReplies);

  const selectedCompanyName =
    selectedCompany?.companyName || selectedCompany?.name || "";

  const mode = useMemo(() => {
    if (status === "confirming") return "confirm";
    if (status === "collecting" && pendingActionType) return "collecting";
    return "idle";
  }, [status, pendingActionType]);

  const sheetActions = useMemo(() => {
    const q = mentionQuery.trim().toLowerCase();
    if (!q) return ALL_ACTIONS;
    return ALL_ACTIONS.filter(
      (action) =>
        action.label.toLowerCase().includes(q) ||
        action.hint.toLowerCase().includes(q) ||
        action.categoryLabel.toLowerCase().includes(q) ||
        action.value.toLowerCase().includes(q)
    );
  }, [mentionQuery]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    speakRepliesRef.current = speakReplies;
  }, [speakReplies]);

  useEffect(() => {
    setMentionIndex(0);
  }, [mentionQuery, sheetOpen]);

  useEffect(() => {
    if (!open) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, sending]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    if (!open) {
      try {
        recognitionRef.current?.stop?.();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;
      setListening(false);
      stopSpeaking();
      setVoiceHint("");
    }
  }, [open]);

  useEffect(() => {
    if (mode !== "idle") setSheetOpen(false);
  }, [mode]);

  useEffect(
    () => () => {
      try {
        recognitionRef.current?.stop?.();
      } catch {
        /* ignore */
      }
      stopSpeaking();
    },
    []
  );

  const closeSheet = () => {
    setSheetOpen(false);
    setMentionQuery("");
    if (parseMention(input)) {
      setInput((prev) => prev.replace(/(?:^|\s)@[^\s@]*$/, "").trimEnd());
    }
  };

  const openSheet = (query = "") => {
    if (mode !== "idle") return;
    setMentionQuery(query);
    setSheetOpen(true);
  };

  const syncMentionState = (value) => {
    const mention = parseMention(value);
    if (!mention || mode !== "idle") {
      if (!mention) setMentionQuery("");
      return;
    }
    openSheet(mention.query);
  };

  const sendMessage = async (raw) => {
    const text = String(raw || "").trim();
    if (!text || sendingRef.current) return;

    stopSpeaking();
    setSheetOpen(false);
    setMentionQuery("");
    setVoiceHint("");

    const userMsg = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    sendingRef.current = true;
    setSending(true);

    let autoCompanyAnswer = null;

    try {
      const history = messagesRef.current
        .filter((m) => m.id !== "welcome")
        .concat(userMsg)
        .slice(-12)
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await assistantAPI.chat({
        message: text,
        conversationId: conversationIdRef.current,
        history,
        ...(isSuperAdmin && selectedCompanyId
          ? { companyId: selectedCompanyId }
          : {}),
      });
      const data = response?.data || {};
      if (data.conversationId) {
        conversationIdRef.current = data.conversationId;
        setConversationId(data.conversationId);
      }
      setStatus(data.status || null);
      setPendingActionType(data.pendingAction?.type || null);

      const reply = data.reply || "No reply from assistant.";
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: reply,
        },
      ]);

      if (speakRepliesRef.current) {
        speakText(reply);
      }

      const companyAnswer = selectedCompanyName || selectedCompanyId;
      if (
        isSuperAdmin &&
        companyAnswer &&
        !autoCompanySentRef.current &&
        COMPANY_QUESTION_RE.test(reply) &&
        !data.pendingAction?.fields?.companyId
      ) {
        autoCompanySentRef.current = true;
        autoCompanyAnswer = companyAnswer;
      }

      if (
        data.status === "completed" ||
        data.status === "cancelled" ||
        data.status === "idle"
      ) {
        autoCompanySentRef.current = false;
      }
    } catch (err) {
      setStatus("error");
      setPendingActionType(null);
      const rawMsg = String(err?.message || "");
      const friendly =
        rawMsg === "Failed to fetch" || /networkerror|load failed/i.test(rawMsg)
          ? "Cannot reach the assistant server. Please confirm the backend is running on your API URL, then try again."
          : rawMsg || "Assistant request failed.";
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: "assistant",
          content: friendly,
        },
      ]);
    } finally {
      sendingRef.current = false;
      setSending(false);
      if (autoCompanyAnswer) {
        setTimeout(() => sendMessageRef.current?.(autoCompanyAnswer), 0);
      }
    }
  };

  sendMessageRef.current = sendMessage;

  const stopListening = () => {
    try {
      recognitionRef.current?.stop?.();
    } catch {
      /* ignore */
    }
    recognitionRef.current = null;
    setListening(false);
  };

  const startListening = () => {
    if (!voiceSupported || sendingRef.current) return;

    stopSpeaking();
    setSheetOpen(false);
    setVoiceHint("");

    if (listening) {
      stopListening();
      return;
    }

    const recognition = createSpeechRecognizer({
      lang: "en-US",
      onStart: () => {
        setListening(true);
        setVoiceHint("Listening…");
      },
      onEnd: () => {
        setListening(false);
        recognitionRef.current = null;
        setVoiceHint((prev) => (prev === "Listening…" ? "" : prev));
      },
      onError: (message) => {
        setListening(false);
        recognitionRef.current = null;
        setVoiceHint(message);
      },
      onResult: (transcript, meta) => {
        if (!transcript) return;
        setInput(transcript);
        if (meta?.isFinal) {
          setVoiceHint("");
          stopListening();
          sendMessageRef.current?.(transcript);
        } else {
          setVoiceHint(transcript);
        }
      },
    });

    if (!recognition) {
      setVoiceHint("Speech recognition is not supported in this browser.");
      return;
    }

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setVoiceHint("Could not start the microphone. Try again.");
      setListening(false);
      recognitionRef.current = null;
    }
  };

  const selectAction = (action) => {
    if (!action) return;
    setSheetOpen(false);
    setMentionQuery("");
    setInput("");
    stopListening();
    sendMessage(action.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (sheetOpen && sheetActions[mentionIndex]) {
      selectAction(sheetActions[mentionIndex]);
      return;
    }
    sendMessage(input);
  };

  const handleInputKeyDown = (e) => {
    if (sheetOpen && sheetActions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMentionIndex((i) => (i + 1) % sheetActions.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setMentionIndex(
          (i) => (i - 1 + sheetActions.length) % sheetActions.length
        );
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        closeSheet();
        return;
      }
      if ((e.key === "Enter" && !e.shiftKey) || e.key === "Tab") {
        e.preventDefault();
        selectAction(sheetActions[mentionIndex]);
        return;
      }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const headerSubtitle = pendingActionType
    ? ACTION_LABELS[pendingActionType] || pendingActionType
    : "League operations assistant";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition hover:scale-105",
          open
            ? "bg-[#003366] text-white"
            : "bg-transparent p-0 shadow-none hover:scale-110"
        )}
        aria-label={open ? "Close assistant" : "Open assistant"}
      >
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <span className="animate-assistant-basketball inline-flex drop-shadow-lg">
            <BasketballIcon className="h-14 w-14" />
          </span>
        )}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-[60] flex h-[min(620px,78vh)] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-[#003366]/10 bg-white shadow-[0_20px_50px_-12px_rgba(0,51,102,0.35)]">
          <div className="relative overflow-hidden border-b border-[#003366]/10 bg-[#003366] px-4 py-3.5 text-white">
            <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-[#00ADE5]/20 blur-2xl" />
            <div className="relative flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                  <BasketballIcon className="h-6 w-6" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold tracking-tight">
                    Leaguease Assistant
                  </p>
                  <p className="truncate text-[11px] text-white/70">
                    {headerSubtitle}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {ttsSupported && (
                  <button
                    type="button"
                    onClick={() => {
                      setSpeakReplies((v) => {
                        const next = !v;
                        if (!next) stopSpeaking();
                        return next;
                      });
                    }}
                    className="rounded-lg p-1.5 text-white/80 transition hover:bg-white/10 hover:text-white"
                    title={
                      speakReplies
                        ? "Mute spoken replies"
                        : "Enable spoken replies"
                    }
                    aria-label={
                      speakReplies
                        ? "Mute spoken replies"
                        : "Enable spoken replies"
                    }
                  >
                    {speakReplies ? (
                      <Volume2 className="h-4 w-4" />
                    ) : (
                      <VolumeX className="h-4 w-4" />
                    )}
                  </button>
                )}
                <StatusChip status={status} actionType={pendingActionType} />
              </div>
            </div>
          </div>

          <div className="relative min-h-0 flex-1">
            <div className="h-full space-y-3 overflow-y-auto bg-gradient-to-b from-[#f4f7fb] to-[#eef3f8] px-3.5 py-3.5">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={clsx(
                    "flex",
                    m.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={clsx(
                      "max-w-[88%] whitespace-pre-wrap px-3.5 py-2.5 text-[13px] leading-relaxed",
                      m.role === "user"
                        ? "rounded-2xl rounded-br-md bg-[#003366] text-white shadow-sm"
                        : "rounded-2xl rounded-bl-md border border-white/80 bg-white text-gray-700 shadow-[0_1px_2px_rgba(0,51,102,0.06)]"
                    )}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-md border border-white/80 bg-white px-3.5 py-2.5 text-[13px] text-gray-500 shadow-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-[#00ADE5]" />
                    Working on it…
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* WhatsApp-style action sheet over chat (chat stays underneath) */}
            {sheetOpen && mode === "idle" && (
              <div className="absolute inset-0 z-20 flex flex-col justify-end">
                <button
                  type="button"
                  className="absolute inset-0 bg-[#003366]/25 backdrop-blur-[1px]"
                  aria-label="Close actions"
                  onClick={closeSheet}
                />
                <div className="relative max-h-[55%] overflow-hidden rounded-t-2xl border border-gray-200 bg-white shadow-[0_-8px_30px_rgba(0,51,102,0.18)]">
                  <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2.5">
                    <div>
                      <p className="text-sm font-semibold text-[#003366]">
                        Actions
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {mentionQuery
                          ? `Filtering “${mentionQuery}”`
                          : "Choose a task to start"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={closeSheet}
                      className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                      aria-label="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="max-h-[320px] overflow-y-auto py-1">
                    {sheetActions.length === 0 ? (
                      <p className="px-3 py-6 text-center text-[12px] text-gray-500">
                        No matching actions
                      </p>
                    ) : (
                      sheetActions.map((action, index) => {
                        const Icon = action.Icon;
                        const active = index === mentionIndex;
                        const showCategoryHeader =
                          !mentionQuery &&
                          (index === 0 ||
                            sheetActions[index - 1].categoryId !==
                              action.categoryId);
                        return (
                          <div key={action.id}>
                            {showCategoryHeader && (
                              <p className="sticky top-0 z-[1] bg-[#f8fafc] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-400">
                                {action.categoryLabel}
                              </p>
                            )}
                            <button
                              type="button"
                              onMouseEnter={() => setMentionIndex(index)}
                              onClick={() => selectAction(action)}
                              className={clsx(
                                "flex w-full items-center gap-3 px-3 py-2.5 text-left transition",
                                active ? "bg-[#00ADE5]/10" : "hover:bg-gray-50"
                              )}
                            >
                              <span
                                className={clsx(
                                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                                  active
                                    ? "bg-[#003366] text-white"
                                    : "bg-[#f1f5f9] text-[#003366]"
                                )}
                              >
                                <Icon className="h-4 w-4" />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-[13px] font-semibold text-gray-900">
                                  {action.label}
                                </span>
                                <span className="block truncate text-[11px] text-gray-500">
                                  {action.hint}
                                </span>
                              </span>
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-[#003366]/8 bg-white px-3.5 pb-3.5 pt-2.5">
            {mode === "confirm" ? (
              <div className="mb-2.5 rounded-xl border border-amber-200/80 bg-amber-50/90 p-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-amber-800/80">
                  Awaiting confirmation
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={sending}
                    onClick={() => sendMessage("confirm")}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#003366] px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-[#00264d] disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Confirm
                  </button>
                  <button
                    type="button"
                    disabled={sending}
                    onClick={() => sendMessage("cancel")}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                  >
                    <X className="h-3.5 w-3.5" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : mode === "collecting" ? (
              <div className="mb-2.5 flex items-center justify-between gap-2 rounded-xl border border-[#00ADE5]/20 bg-[#00ADE5]/5 px-3 py-2.5">
                <p className="text-[11px] font-medium text-[#003366]/80">
                  Providing details for{" "}
                  <span className="font-semibold">
                    {ACTION_LABELS[pendingActionType] || "this request"}
                  </span>
                </p>
                <button
                  type="button"
                  disabled={sending}
                  onClick={() => sendMessage("cancel")}
                  className="shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold text-gray-500 transition hover:bg-white hover:text-gray-800 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="mb-2.5 flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <button
                  type="button"
                  disabled={sending}
                  onClick={() => openSheet("")}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#003366] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#00264d] disabled:opacity-50"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  Actions
                </button>
                {SUGGESTION_CHIPS.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    disabled={sending}
                    onClick={() => selectAction(action)}
                    className="inline-flex shrink-0 items-center rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-medium text-gray-700 transition hover:border-[#00ADE5]/40 hover:text-[#003366] disabled:opacity-50"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            {(listening || voiceHint) && (
              <div
                className={clsx(
                  "mb-2 flex items-center gap-2 rounded-xl px-3 py-2 text-[11px]",
                  listening
                    ? "border border-red-200 bg-red-50 text-red-700"
                    : "border border-amber-200 bg-amber-50 text-amber-800"
                )}
              >
                {listening ? (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                  </span>
                ) : null}
                <span className="truncate font-medium">
                  {voiceHint || "Listening…"}
                </span>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="flex items-end gap-2 rounded-xl border border-gray-200 bg-[#f8fafc] p-1.5 shadow-inner focus-within:border-[#00ADE5] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#00ADE5]/15"
            >
              <button
                type="button"
                disabled={sending || mode === "confirm"}
                onClick={() => {
                  const next = input.endsWith("@") ? input : `${input}@`;
                  setInput(next);
                  syncMentionState(next);
                  inputRef.current?.focus();
                }}
                className="mb-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#003366] transition hover:bg-white disabled:opacity-40"
                aria-label="Open actions with @"
                title="Type @ for actions"
              >
                <AtSign className="h-4 w-4" />
              </button>
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                disabled={sending || listening}
                onChange={(e) => {
                  const value = e.target.value;
                  setInput(value);
                  syncMentionState(value);
                }}
                onKeyDown={handleInputKeyDown}
                placeholder={
                  listening
                    ? "Listening…"
                    : mode === "confirm"
                      ? "Or type Confirm / Cancel…"
                      : mode === "collecting"
                        ? "Type or speak the detail…"
                        : "Message, @, or mic…"
                }
                className="max-h-28 min-h-[40px] flex-1 resize-none bg-transparent px-1.5 py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400 disabled:opacity-60"
              />
              {voiceSupported && (
                <button
                  type="button"
                  disabled={sending}
                  onClick={startListening}
                  className={clsx(
                    "mb-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition disabled:opacity-40",
                    listening
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "text-[#003366] hover:bg-white"
                  )}
                  aria-label={listening ? "Stop listening" : "Speak"}
                  title={
                    listening
                      ? "Stop listening"
                      : "Speak your request"
                  }
                >
                  {listening ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </button>
              )}
              <button
                type="submit"
                disabled={
                  sending ||
                  listening ||
                  (!input.trim() && !(sheetOpen && sheetActions[mentionIndex]))
                }
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#003366] text-white transition hover:bg-[#00264d] disabled:opacity-40"
                aria-label="Send"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
