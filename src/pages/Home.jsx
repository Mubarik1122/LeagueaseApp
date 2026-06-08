import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import PoweredBy4SOV from "../components/PoweredBy4SOV";
import {
  Trophy,
  Calendar,
  Users,
  BarChart3,
  Shield,
  Zap,
  Globe,
  CheckCircle,
  ArrowRight,
  Star,
  Play,
  X,
  Smartphone,
  Bell,
  Wifi,
} from "lucide-react";
import { useState } from "react";
import Modal from "../components/Modal";

const APP_STORE_URL =
  import.meta.env.VITE_APP_STORE_URL?.trim() || "";
const PLAY_STORE_URL =
  import.meta.env.VITE_PLAY_STORE_URL?.trim() || "";

export default function Home() {
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [showDemoModal, setShowDemoModal] = useState(false);

  const features = [
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description:
        "Automated fixture generation with conflict detection and venue management.",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      icon: Users,
      title: "Team Management",
      description:
        "Complete player registration, team rosters, and contact management.",
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      icon: BarChart3,
      title: "Live Results & Standings",
      description:
        "Real-time score updates, automatic standings calculation, and statistics.",
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      icon: Globe,
      title: "Professional Website",
      description:
        "Beautiful, customizable league website with your branding and domain.",
      color: "text-orange-500",
      bgColor: "bg-orange-50",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description:
        "Enterprise-grade security with 99.9% uptime and data backup.",
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description:
        "Optimized performance for instant page loads and smooth navigation.",
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
    },
  ];

  const stats = [
    { number: "50K+", label: "Active Leagues" },
    { number: "2M+", label: "Players Managed" },
    { number: "100+", label: "Sports Supported" },
    { number: "99.9%", label: "Uptime" },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "League Administrator",
      content:
        "Leaguease has transformed how we manage our football league. The scheduling tool alone saves us hours every week!",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Basketball Coach",
      content:
        "The best platform we've used. Easy to use, reliable, and our players love the mobile-friendly interface.",
      rating: 5,
    },
    {
      name: "Emma Williams",
      role: "Sports Coordinator",
      content:
        "From registration to results, everything is seamless. Highly recommend to any sports organization!",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#003366] via-[#004080] to-[#00509e]">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#00ADE5] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#00ADE5] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#00ADE5] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-24 sm:pb-20 lg:pt-32 lg:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
                <Trophy className="w-4 h-4 mr-2" />
                Trusted by 50,000+ leagues worldwide
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 animate-fade-in">
                <span className="block">The easiest place to</span>
                <span className="block bg-gradient-to-r from-[#00ADE5] to-[#00d4ff] bg-clip-text text-transparent">
                  run your sports league
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-200 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Complete sports management solution with league management,
                online scheduling, results tracking, player registrations, and
                a professional website. All in one platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6">
                <button
                  onClick={() => setShowDemoModal(true)}
                  className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold rounded-lg border-2 border-white/30 hover:border-white/50 transition-all duration-200 text-base sm:text-lg cursor-pointer"
                >
                  <Play className="mr-2 w-5 h-5" />
                  Watch Demo
                </button>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-6 text-sm text-gray-300">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#00ADE5] mr-2" />
                  No credit card required
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#00ADE5] mr-2" />
                  14-day free trial
                </div>
              </div>
            </div>

            {/* Right Image/Illustration */}
            <div className="relative hidden lg:block">
              <div className="relative z-10">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00ADE5] to-[#00d4ff] rounded-2xl transform rotate-6 opacity-20"></div>
                <img
                  src="https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&q=80&w=800"
                  alt="Sports management dashboard"
                  className="relative rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-20 sm:h-24 lg:h-32"
          >
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center transform hover:scale-105 transition-transform duration-200"
              >
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#003366] mb-2">
                  {stat.number}
                </div>
                <div className="text-sm sm:text-base text-gray-600">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile app — iOS & Android */}
      <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#003366] via-[#0a4d7a] to-[#001a33]" />
        <div className="pointer-events-none absolute -right-20 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-[#00ADE5]/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="text-center lg:text-left">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#00ADE5] backdrop-blur-sm">
                <Smartphone className="h-4 w-4" />
                Mobile apps
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Download the{" "}
                <span className="bg-gradient-to-r from-[#00ADE5] to-cyan-300 bg-clip-text text-transparent">
                  Leaguease app
                </span>
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-gray-300 sm:text-lg mx-auto lg:mx-0">
                Players stay connected with fixtures, results, and alerts.
                Install on iPhone or Android — same account, built for mobile.
              </p>
              <ul className="mt-8 space-y-3 text-left text-sm text-gray-200 sm:text-base max-w-md mx-auto lg:mx-0">
                {[
                  { Icon: Bell, text: "Match reminders & league updates" },
                  { Icon: Wifi, text: "Works great on the go — lightweight & fast" },
                  { Icon: Shield, text: "Secure sign-in aligned with the web portal" },
                ].map(({ Icon, text }) => (
                  <li key={text} className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#00ADE5] ring-1 ring-white/10">
                      <Icon className="h-4 w-4" strokeWidth={2} />
                    </span>
                    <span className="pt-1.5 leading-snug">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-8 lg:mx-0 lg:max-w-none lg:items-stretch">
              {/* Hero visual — phones / mobile context */}
              <div className="relative w-full">
                <div
                  className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-[#00ADE5]/25 via-transparent to-cyan-400/10 blur-2xl sm:-inset-6"
                  aria-hidden
                />
                <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/[0.06] shadow-[0_25px_80px_-20px_rgba(0,0,0,0.5)] ring-1 ring-white/10 backdrop-blur-sm">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#001a33]/90 via-transparent to-transparent" />
                  <img
                    src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=1200"
                    alt="People using smartphones for apps and notifications"
                    className="aspect-[4/3] w-full object-cover sm:aspect-[16/10]"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-3 p-4 sm:p-5">
                    <p className="max-w-[70%] text-left text-xs font-medium leading-snug text-white/95 drop-shadow sm:text-sm">
                      Your league in your pocket — fixtures, scores, and alerts
                      on iOS and Android.
                    </p>
                    <span className="hidden shrink-0 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md sm:inline-block">
                      Free download
                    </span>
                  </div>
                </div>
              </div>

              {/* Store CTAs — framed panel with brand accent */}
              <div className="relative w-full">
                <div
                  className="pointer-events-none absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-[#00ADE5]/35 via-[#003366]/20 to-cyan-300/20 opacity-80 blur-xl sm:-inset-4"
                  aria-hidden
                />
                <div className="relative overflow-hidden rounded-3xl border border-white/25 bg-gradient-to-br from-white/95 via-white to-slate-50 p-[1px] shadow-[0_24px_60px_-12px_rgba(0,26,51,0.45),0_0_0_1px_rgba(0,173,229,0.12)] ring-1 ring-[#003366]/[0.08]">
                  <div className="relative rounded-[calc(1.5rem-1px)] bg-gradient-to-b from-white via-white to-slate-50/90 px-6 py-7 sm:px-8 sm:py-8">
                    <div
                      className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#00ADE5]/[0.12]"
                      aria-hidden
                    />
                    <div
                      className="pointer-events-none absolute -bottom-20 -left-12 h-40 w-40 rounded-full bg-[#003366]/[0.06]"
                      aria-hidden
                    />
                    <div
                      className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#00ADE5] to-transparent opacity-90"
                      aria-hidden
                    />

                    <div className="relative mb-7 text-center lg:text-left">
                      <div className="mb-4 flex justify-center lg:justify-start">
                        <span className="inline-flex items-center gap-2 rounded-2xl border border-[#00ADE5]/20 bg-gradient-to-br from-[#00ADE5]/10 to-[#003366]/5 px-4 py-2 shadow-sm shadow-[#003366]/5 ring-1 ring-white/80">
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-inner shadow-slate-200/80 ring-1 ring-slate-100">
                            <Smartphone
                              className="h-4 w-4 text-[#00ADE5]"
                              strokeWidth={2.25}
                            />
                          </span>
                          <span className="text-left">
                            <span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-[#003366]">
                              Get the app
                            </span>
                            <span className="text-xs font-medium text-slate-500">
                              iOS &amp; Android
                            </span>
                          </span>
                        </span>
                      </div>
                      <p className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                        Download for your device
                      </p>
                      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600 mx-auto lg:mx-0">
                        Same secure account as the web portal. Tap below to open
                        the store — install in seconds.
                      </p>
                    </div>

                    <div className="relative flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-center sm:gap-5 lg:justify-start">
                      <a
                        href={APP_STORE_URL || "#"}
                        target={APP_STORE_URL ? "_blank" : undefined}
                        rel={APP_STORE_URL ? "noopener noreferrer" : undefined}
                        onClick={(e) => {
                          if (!APP_STORE_URL) e.preventDefault();
                        }}
                        title={
                          APP_STORE_URL
                            ? "Download on the App Store"
                            : "Set VITE_APP_STORE_URL in .env"
                        }
                        className={`group flex min-h-[56px] flex-1 items-center justify-center rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/90 px-4 py-3.5 shadow-[0_4px_14px_-4px_rgba(0,51,102,0.15)] transition-all duration-300 sm:min-w-0 sm:max-w-[210px] ${
                          APP_STORE_URL
                            ? "hover:-translate-y-0.5 hover:border-[#00ADE5]/35 hover:shadow-[0_12px_28px_-8px_rgba(0,173,229,0.25)]"
                            : "cursor-not-allowed opacity-60"
                        }`}
                      >
                        <img
                          src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                          alt="Download on the App Store"
                          className="h-10 w-auto max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.03] sm:h-11"
                        />
                      </a>
                      <a
                        href={PLAY_STORE_URL || "#"}
                        target={PLAY_STORE_URL ? "_blank" : undefined}
                        rel={PLAY_STORE_URL ? "noopener noreferrer" : undefined}
                        onClick={(e) => {
                          if (!PLAY_STORE_URL) e.preventDefault();
                        }}
                        title={
                          PLAY_STORE_URL
                            ? "Get it on Google Play"
                            : "Set VITE_PLAY_STORE_URL in .env"
                        }
                        className={`group flex min-h-[56px] flex-1 items-center justify-center rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/90 px-3 py-2.5 shadow-[0_4px_14px_-4px_rgba(0,51,102,0.15)] transition-all duration-300 sm:min-w-0 sm:max-w-[230px] ${
                          PLAY_STORE_URL
                            ? "hover:-translate-y-0.5 hover:border-emerald-400/40 hover:shadow-[0_12px_28px_-8px_rgba(16,185,129,0.2)]"
                            : "cursor-not-allowed opacity-60"
                        }`}
                      >
                        <img
                          src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                          alt="Get it on Google Play"
                          className="h-[3.35rem] w-auto max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.03] sm:h-[3.6rem]"
                        />
                      </a>
                    </div>

                    <div className="relative mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-slate-200/70 pt-6 text-xs text-slate-500 lg:justify-start">
                      <span className="inline-flex items-center gap-1.5">
                        <CheckCircle
                          className="h-3.5 w-3.5 shrink-0 text-emerald-600"
                          aria-hidden
                        />
                        Free to install
                      </span>
                      <span className="hidden h-3 w-px bg-slate-200 sm:block" />
                      <span className="inline-flex items-center gap-1.5">
                        <Shield
                          className="h-3.5 w-3.5 shrink-0 text-[#003366]"
                          aria-hidden
                        />
                        Secure sign-in
                      </span>
                    </div>

                    {import.meta.env.DEV &&
                      (!APP_STORE_URL || !PLAY_STORE_URL) && (
                        <p className="mt-4 border-t border-dashed border-slate-200 pt-4 text-center text-[11px] text-slate-400 lg:text-left">
                          Dev: set{" "}
                          <code className="rounded bg-slate-100 px-1 font-mono text-slate-700">
                            VITE_APP_STORE_URL
                          </code>{" "}
                          and{" "}
                          <code className="rounded bg-slate-100 px-1 font-mono text-slate-700">
                            VITE_PLAY_STORE_URL
                          </code>{" "}
                          in{" "}
                          <code className="rounded bg-slate-100 px-1">
                            .env
                          </code>
                          .
                        </p>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Everything you need to{" "}
              <span className="text-[#00ADE5]">manage your league</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to make league management effortless
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group bg-white p-6 sm:p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                >
                  <div
                    className={`w-14 h-14 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className={`w-7 h-7 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Get started in{" "}
              <span className="text-[#00ADE5]">3 simple steps</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Set up your league in minutes, not hours
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8 sm:gap-12">
            {[
              {
                step: "01",
                title: "Create Your Account",
                description:
                  "Sign up for free and choose your league type and sport.",
              },
              {
                step: "02",
                title: "Set Up Your League",
                description:
                  "Add teams, players, venues, and customize your settings.",
              },
              {
                step: "03",
                title: "Start Managing",
                description:
                  "Create schedules, track results, and manage your league.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="text-center transform hover:scale-105 transition-transform duration-200"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00ADE5] text-white rounded-full text-2xl font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 sm:py-20 lg:py-28 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Loved by{" "}
              <span className="text-[#00ADE5]">thousands of organizers</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See what our users have to say about Leaguease
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-6 sm:p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 lg:py-28 bg-gradient-to-r from-[#003366] to-[#004080] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Ready to transform your league management?
          </h2>
          <p className="text-lg sm:text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Join thousands of leagues already using Leaguease to streamline
            their operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold rounded-lg border-2 border-white/30 hover:border-white/50 transition-all duration-200 text-base sm:text-lg"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Sport Selection Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-[#003366] via-[#004080] to-[#003366] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
            What's your sport?
          </h3>
          <p className="text-gray-300 mb-8 sm:mb-12 text-sm sm:text-base">
            Choose from a wide range of sports we support
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {[
              { name: "Football", icon: "⚽", color: "from-green-500 to-emerald-600" },
              { name: "Basketball", icon: "🏀", color: "from-orange-500 to-red-600" },
              { name: "Cricket", icon: "🏏", color: "from-blue-500 to-indigo-600" },
              { name: "Tennis", icon: "🎾", color: "from-yellow-400 to-yellow-600" },
              { name: "Hockey", icon: "🏒", color: "from-gray-500 to-gray-700" },
              { name: "Volleyball", icon: "🏐", color: "from-pink-500 to-rose-600" },
              { name: "Baseball", icon: "⚾", color: "from-blue-600 to-blue-800" },
              { name: "Rugby", icon: "🏉", color: "from-amber-600 to-orange-700" },
            ].map((sport, index) => (
              <button
                key={index}
                className="group relative bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl p-4 sm:p-6 hover:bg-white/20 hover:border-white/40 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-2xl"
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className={`text-4xl sm:text-5xl lg:text-6xl transform group-hover:scale-110 transition-transform duration-300`}>
                    {sport.icon}
                  </div>
                  <span className="text-white font-semibold text-sm sm:text-base lg:text-lg">
                    {sport.name}
                  </span>
                </div>
                {/* Hover effect gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${sport.color} opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-300`}></div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <img
                  src="/image/logo/3.png"
                  alt="Leaguease Logo"
                  className="h-10 w-auto filter brightness-0 invert"
                />
              </div>
              <p className="text-sm text-gray-400">
                The complete sports league management platform trusted by
                thousands of organizations worldwide.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/about"
                    className="hover:text-[#00ADE5] transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="hover:text-[#00ADE5] transition-colors"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    to="/blog"
                    className="hover:text-[#00ADE5] transition-colors"
                  >
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/terms"
                    className="hover:text-[#00ADE5] transition-colors"
                  >
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy"
                    className="hover:text-[#00ADE5] transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/cookies"
                    className="hover:text-[#00ADE5] transition-colors"
                  >
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-col items-center gap-3 text-center sm:items-start sm:text-left">
              <p className="text-sm text-gray-400">
                Copyright© 2026 - Leaguease. All rights reserved.
              </p>
              <PoweredBy4SOV variant="dark" />
            </div>
            <div className="flex gap-6">
              <a
                href="#"
                className="text-gray-400 hover:text-[#00ADE5] transition-colors"
                aria-label="Facebook"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-[#00ADE5] transition-colors"
                aria-label="Twitter"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-[#00ADE5] transition-colors"
                aria-label="LinkedIn"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      <Modal
        isOpen={showDemoModal}
        onClose={() => setShowDemoModal(false)}
        panelClassName="relative max-w-2xl"
        backdropClassName="bg-black/75"
        labelledBy="demo-modal-title"
      >
            {/* Close Button */}
            <button
              onClick={() => setShowDemoModal(false)}
              className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
              aria-label="Close modal"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>

            {/* Video Container */}
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="Leaguease Demo Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            {/* Modal Content */}
            <div className="p-6 bg-white">
              <h3 id="demo-modal-title" className="text-2xl font-bold text-gray-900 mb-2">
                Watch Leaguease in Action
              </h3>
              <p className="text-gray-600 mb-4">
                See how easy it is to manage your sports league with Leaguease.
                From scheduling to results tracking, everything you need in one
                platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setShowDemoModal(false)}
                  className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all duration-200"
                >
                  Close
                </button>
              </div>
            </div>
      </Modal>
    </div>
  );
}
