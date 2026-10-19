import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Layers,
  Loader2,
  MapPin,
  Plus,
  Send,
  Trophy,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import clsx from "clsx";
import { assistantAPI } from "../services/api";
import { useCompanyContext } from "../context/CompanyContext";

const COMPANY_QUESTION_RE =
  /which company|what company|company (is this|should|for)|select (a )?company/i;

const WELCOME =
  "Hello! I'm the Leaguease assistant. I can help you create or update users, teams, matches, venues, seasons, divisions, and players; save match results and player stats; manage roles; and look up schedules or day results.\n\nSelect a quick action below, or type your request.";

const ACTION_PROMPTS = [
  { label: "Create user", value: "Create a new user", Icon: UserPlus },
  { label: "Create team", value: "Create a team", Icon: Users },
  { label: "Schedule match", value: "Schedule a match", Icon: CalendarDays },
  { label: "Add venue", value: "Add a venue", Icon: MapPin },
  { label: "Create season", value: "Create a season", Icon: Trophy },
  { label: "Create division", value: "Create a division", Icon: Layers },
  { label: "Add player", value: "Add a player to a team", Icon: Plus },
  { label: "Save result", value: "Save a match result", Icon: ClipboardList },
  { label: "Enter stats", value: "Enter player stats", Icon: ClipboardList },
  { label: "Today's matches", value: "Show today's matches", Icon: CalendarDays },
];

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

export default function AssistantChat() {
  const { isSuperAdmin, selectedCompanyId, selectedCompany } =
    useCompanyContext();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [status, setStatus] = useState(null);
  const [pendingActionType, setPendingActionType] = useState(null);
  const [actionsExpanded, setActionsExpanded] = useState(true);
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

  const selectedCompanyName =
    selectedCompany?.companyName || selectedCompany?.name || "";

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  const mode = useMemo(() => {
    if (status === "confirming") return "confirm";
    if (status === "collecting" && pendingActionType) return "collecting";
    return "idle";
  }, [status, pendingActionType]);

  useEffect(() => {
    if (!open) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, sending]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const sendMessage = async (raw) => {
    const text = String(raw || "").trim();
    if (!text || sendingRef.current) return;

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

      // Super Admin: if assistant still asks for company, send selected company once
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
      const raw = String(err?.message || "");
      const friendly =
        raw === "Failed to fetch" || /networkerror|load failed/i.test(raw)
          ? "Cannot reach the assistant server. Please confirm the backend is running on your API URL, then try again."
          : raw || "Assistant request failed.";
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
        setTimeout(() => {
          sendMessageRef.current?.(autoCompanyAnswer);
        }, 0);
      }
    }
  };

  sendMessageRef.current = sendMessage;

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
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
              <StatusChip status={status} actionType={pendingActionType} />
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-gradient-to-b from-[#f4f7fb] to-[#eef3f8] px-3.5 py-3.5">
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

          <div className="border-t border-[#003366]/8 bg-white px-3.5 pb-3.5 pt-3">
            {mode === "confirm" ? (
              <div className="mb-3 rounded-xl border border-amber-200/80 bg-amber-50/90 p-3">
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
              <div className="mb-3 flex items-center justify-between gap-2 rounded-xl border border-[#00ADE5]/20 bg-[#00ADE5]/5 px-3 py-2.5">
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
              <div className="mb-3">
                <button
                  type="button"
                  onClick={() => setActionsExpanded((v) => !v)}
                  className="mb-2 flex w-full items-center justify-between gap-2 rounded-lg px-0.5 py-0.5 text-left transition hover:bg-gray-50"
                  aria-expanded={actionsExpanded}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400">
                    Quick actions
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400">
                    {actionsExpanded ? "Hide" : "Show"}
                    {actionsExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </span>
                </button>
                {actionsExpanded && (
                  <div className="-mx-0.5 grid grid-cols-2 gap-1.5">
                    {ACTION_PROMPTS.map(({ label, value, Icon }) => (
                      <button
                        key={label}
                        type="button"
                        disabled={sending}
                        onClick={() => sendMessage(value)}
                        className="group flex items-center gap-2 rounded-xl border border-gray-200/90 bg-[#f8fafc] px-2.5 py-2 text-left transition hover:border-[#00ADE5]/35 hover:bg-white hover:shadow-sm disabled:opacity-50"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-[#003366] shadow-sm ring-1 ring-gray-100 transition group-hover:text-[#00ADE5]">
                          <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
                        </span>
                        <span className="truncate text-[11px] font-semibold text-gray-700 group-hover:text-[#003366]">
                          {label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="flex items-end gap-2 rounded-xl border border-gray-200 bg-[#f8fafc] p-1.5 shadow-inner focus-within:border-[#00ADE5] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#00ADE5]/15"
            >
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                disabled={sending}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder={
                  mode === "confirm"
                    ? "Or type Confirm / Cancel…"
                    : mode === "collecting"
                      ? "Type the requested detail…"
                      : "Describe what you need…"
                }
                className="max-h-28 min-h-[40px] flex-1 resize-none bg-transparent px-2.5 py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
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
