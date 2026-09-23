import { useMemo, useState } from "react";
import {
  Search,
  HelpCircle,
  BookOpen,
  CreditCard,
  Users,
  Shield,
  Settings,
  Code2,
  ChevronDown,
  Send,
  Mail,
  MessageSquare,
  Sparkles,
  LifeBuoy,
} from "lucide-react";
import Swal from "sweetalert2";

const categories = [
  { id: "all", label: "All topics", icon: BookOpen },
  { id: "getting-started", label: "Getting started", icon: Sparkles },
  { id: "account", label: "Account", icon: Settings },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "teams", label: "Teams", icon: Users },
  { id: "security", label: "Security", icon: Shield },
  { id: "api", label: "API", icon: Code2 },
];

const faqs = [
  {
    id: 1,
    category: "getting-started",
    question: "How do I create my first competition?",
    answer:
      "Go to Dashboard and click Create Tournament, or open Competitions from the sidebar. Enter the competition name, type, and season details, then save. You can add divisions and teams afterward from Setup.",
  },
  {
    id: 2,
    category: "getting-started",
    question: "Where can I invite players and staff?",
    answer:
      "Open People from the sidebar, then create a user or invite members with the right roles. Assign them to teams from the team or user detail screens.",
  },
  {
    id: 3,
    category: "account",
    question: "How do I update my profile or password?",
    answer:
      "Open My Account from the sidebar user menu. Update your name and email under Personal information, or set a new password in the Security section, then save changes.",
  },
  {
    id: 4,
    category: "billing",
    question: "How do I upgrade my plan?",
    answer:
      "Visit Billing from the sidebar, compare Free, Pro, and Enterprise in Available plans, then choose Upgrade to Pro or Contact sales for Enterprise pricing.",
  },
  {
    id: 5,
    category: "billing",
    question: "Do I need a payment method on the Free plan?",
    answer:
      "No. A payment method is only required when you upgrade to a paid plan. You can add one anytime from the Billing page.",
  },
  {
    id: 6,
    category: "teams",
    question: "How do I assign players to a team?",
    answer:
      "Open People, select a player, and use Assign to teams. You can also manage team rosters from the Teams area of your competition setup.",
  },
  {
    id: 7,
    category: "security",
    question: "How does access control work?",
    answer:
      "Access Control lets admins manage roles, permissions, and page access. Users only see the pages and actions granted to their roles.",
  },
  {
    id: 8,
    category: "api",
    question: "Is there an API for integrations?",
    answer:
      "API access is available on higher plans. Contact support or sales with your use case and we will share authentication and endpoint details.",
  },
];

const quickLinks = [
  {
    title: "Getting started",
    description: "Create competitions and invite your first users",
    icon: Sparkles,
    category: "getting-started",
  },
  {
    title: "Billing & plans",
    description: "Upgrade, payment methods, and plan limits",
    icon: CreditCard,
    category: "billing",
  },
  {
    title: "Access & security",
    description: "Roles, permissions, and account safety",
    icon: Shield,
    category: "security",
  },
];

export default function Help() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openFaqId, setOpenFaqId] = useState(1);
  const [supportForm, setSupportForm] = useState({
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);

  const filteredFaqs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return faqs.filter((faq) => {
      const matchesCategory =
        activeCategory === "all" || faq.category === activeCategory;
      const matchesSearch =
        !q ||
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  const handleQuickLink = (category) => {
    setActiveCategory(category);
    setSearchQuery("");
    const first = faqs.find((f) => f.category === category);
    if (first) setOpenFaqId(first.id);
  };

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    if (!supportForm.subject.trim() || !supportForm.message.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing details",
        text: "Please add a subject and message before sending.",
        confirmButtonColor: "#00ADE5",
      });
      return;
    }

    setSending(true);
    try {
      await new Promise((r) => setTimeout(r, 450));
      await Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Message sent",
        text: "Our team will get back to you soon.",
        timer: 2400,
        showConfirmButton: false,
      });
      setSupportForm({ subject: "", message: "" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-full space-y-5 py-6 sm:space-y-6 sm:py-8">
      {/* Hero */}
      <div className="animate-fade-up overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
        <div className="relative bg-gradient-to-r from-[#003366] via-[#003d7a] to-[#004080] px-5 py-7 text-white sm:px-8 sm:py-8">
          <div className="animate-blob pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-[#00ADE5]/20 blur-3xl" />
          <div className="animate-blob animation-delay-2000 pointer-events-none absolute bottom-0 left-1/3 h-28 w-28 rounded-full bg-white/10 blur-2xl" />

          <div className="relative mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
              <LifeBuoy className="h-6 w-6" strokeWidth={2} />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/65">
              Help Center
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              How can we help you?
            </h1>
            <p className="mx-auto mt-2 max-w-xl text-sm text-blue-100/90">
              Search guides, browse topics, or contact support for league
              management help.
            </p>

            <div className="relative mx-auto mt-6 max-w-xl">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#00ADE5]"
                strokeWidth={2}
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search help articles..."
                className="w-full rounded-xl border-0 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 shadow-lg outline-none ring-0 placeholder:text-gray-400 focus:ring-2 focus:ring-[#00ADE5]/40"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-3">
        {quickLinks.map((link, index) => {
          const Icon = link.icon;
          const delay =
            index === 0
              ? "animation-delay-100"
              : index === 1
                ? "animation-delay-200"
                : "animation-delay-300";
          return (
            <button
              key={link.title}
              type="button"
              onClick={() => handleQuickLink(link.category)}
              className={`animate-fade-up group rounded-2xl border border-gray-200/90 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#00ADE5]/40 hover:shadow-md ${delay}`}
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#00ADE5]/10 text-[#00ADE5] transition duration-200 group-hover:scale-105">
                <Icon size={18} strokeWidth={2} />
              </span>
              <h3 className="mt-3 text-sm font-bold text-[#003366]">
                {link.title}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">
                {link.description}
              </p>
            </button>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        {/* Categories */}
        <aside className="animate-fade-up animation-delay-200 lg:col-span-4 xl:col-span-3">
          <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#003366]/5 text-[#003366]">
                  <BookOpen size={16} strokeWidth={2} />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-[#003366]">Topics</h2>
                  <p className="text-xs text-gray-500">Browse by category</p>
                </div>
              </div>
            </div>
            <nav className="space-y-1 p-3">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const active = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition duration-200 ${
                      active
                        ? "bg-[#00ADE5]/10 text-[#00ADE5]"
                        : "text-gray-600 hover:bg-slate-50 hover:text-[#003366]"
                    }`}
                  >
                    <Icon size={16} strokeWidth={2} />
                    {cat.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* FAQ + Contact */}
        <div className="space-y-5 lg:col-span-8 xl:col-span-9">
          <div className="animate-fade-up animation-delay-300 overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#00ADE5]/10 text-[#00ADE5]">
                  <HelpCircle size={16} strokeWidth={2} />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-[#003366]">
                    Frequently asked questions
                  </h2>
                  <p className="text-xs text-gray-500">
                    {filteredFaqs.length} article
                    {filteredFaqs.length === 1 ? "" : "s"} found
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {filteredFaqs.length === 0 ? (
                <div className="px-5 py-12 text-center sm:px-6">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-gray-400">
                    <Search size={20} />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-gray-800">
                    No articles match your search
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Try another keyword or browse a different topic.
                  </p>
                </div>
              ) : (
                filteredFaqs.map((faq, index) => {
                  const isOpen = openFaqId === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className={`animate-fade-up transition-colors duration-200 ${
                        isOpen ? "bg-[#00ADE5]/[0.03]" : "hover:bg-slate-50/70"
                      }`}
                      style={{ animationDelay: `${0.05 * (index + 1)}s` }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setOpenFaqId(isOpen ? null : faq.id)
                        }
                        className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left sm:px-6"
                      >
                        <span className="text-sm font-semibold text-[#003366]">
                          {faq.question}
                        </span>
                        <ChevronDown
                          size={18}
                          className={`mt-0.5 shrink-0 text-[#00ADE5] transition-transform duration-300 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      <div
                        className={`grid transition-all duration-300 ease-out ${
                          isOpen
                            ? "grid-rows-[1fr] opacity-100"
                            : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <p className="px-5 pb-4 text-sm leading-relaxed text-gray-600 sm:px-6">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Contact support */}
          <div className="animate-fade-up animation-delay-400 overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
            <div className="border-b border-gray-100 bg-gradient-to-r from-[#003366]/[0.04] to-[#00ADE5]/[0.06] px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#00ADE5] shadow-sm ring-1 ring-gray-100">
                  <MessageSquare size={18} strokeWidth={2} />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-[#003366]">
                    Contact support
                  </h2>
                  <p className="text-xs text-gray-500">
                    Send a message and we will reply by email
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSupportSubmit}
              className="space-y-4 p-5 sm:p-6"
            >
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                  Subject
                </label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#00ADE5]"
                    strokeWidth={2}
                  />
                  <input
                    type="text"
                    value={supportForm.subject}
                    onChange={(e) =>
                      setSupportForm((prev) => ({
                        ...prev,
                        subject: e.target.value,
                      }))
                    }
                    placeholder="Brief summary of your issue"
                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-gray-900 shadow-sm transition placeholder:text-gray-400 focus:border-[#00ADE5] focus:outline-none focus:ring-2 focus:ring-[#00ADE5]/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                  Message
                </label>
                <textarea
                  rows={4}
                  value={supportForm.message}
                  onChange={(e) =>
                    setSupportForm((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }))
                  }
                  placeholder="Describe what you need help with..."
                  className="w-full resize-y rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm transition placeholder:text-gray-400 focus:border-[#00ADE5] focus:outline-none focus:ring-2 focus:ring-[#00ADE5]/20"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-gray-500">
                  Typical response time: within 1 business day
                </p>
                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00ADE5] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#00ADE5]/25 transition duration-200 hover:-translate-y-0.5 hover:bg-[#0099c7] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  <Send size={16} strokeWidth={2.25} />
                  {sending ? "Sending…" : "Send message"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
