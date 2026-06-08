import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Trophy,
  Users,
  Calendar,
  BarChart,
  MessageSquare,
  Settings,
  Menu,
  X,
  User,
  CreditCard,
  HelpCircle,
  LogOut,
  Globe,
  Home,
  ChevronRight,
} from "lucide-react";
import clsx from "clsx";
import { useAuthContext } from "../context/AuthContext";

const menuItems = [
  { icon: Home, label: "Dashboard", path: "/dashboard", highlight: true },
  { icon: Settings, label: "Setup", path: "/dashboard/setup" },
  { icon: Calendar, label: "Match Schedule", path: "/dashboard/schedule" },
  { icon: BarChart, label: "Results", path: "/dashboard/results" },
  { icon: Users, label: "Users", path: "/dashboard/people" },
  { icon: MessageSquare, label: "Communication", path: "/dashboard/communication" },
  {
    icon: Globe,
    label: "Visit Site",
    path: "https://leaguease-web.vercel.app/",
    external: true,
  },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X size={24} className="text-gray-700" />
        ) : (
          <Menu size={24} className="text-gray-700" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed left-0 top-0 h-full bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 transition-transform duration-300 z-40 shadow-xl",
          "lg:translate-x-0 lg:w-64",
          isOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#00ADE5] to-[#00d4ff] rounded-lg blur-sm opacity-30"></div>
              <div className="relative bg-white p-2 rounded-lg">
                <img
                  src="/image/logo/3.png"
                  alt="Leaguease Logo"
                  className="h-10 w-auto object-contain"
                />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Leaguease</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-200px)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            if (item.external) {
              return (
                <a
                  key={item.path}
                  href={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-gradient-to-r hover:from-[#00ADE5]/10 hover:to-[#00d4ff]/10 text-gray-700 hover:text-[#00ADE5] group"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              );
            }
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  clsx(
                    "flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                    item.highlight && "font-semibold",
                    isActive
                      ? "bg-gradient-to-r from-[#00ADE5] to-[#00d4ff] text-white shadow-lg shadow-[#00ADE5]/30"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-[#00ADE5]/10 hover:to-[#00d4ff]/10 hover:text-[#00ADE5]"
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    size={20}
                    className={clsx(
                      "transition-transform",
                      "group-hover:scale-110"
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                <ChevronRight
                  size={16}
                  className={clsx(
                    "transition-opacity",
                    "opacity-0 group-hover:opacity-100"
                  )}
                />
              </NavLink>
            );
          })}
        </nav>

        {/* User Menu */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white">
          <div className="p-4">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#00ADE5] to-[#00d4ff] text-white font-semibold">
                {user?.firstName?.[0] || user?.email?.[0] || "U"}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-gray-900">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email || "User"}
                </p>
                <p className="text-xs text-gray-500">Account Settings</p>
              </div>
              <ChevronRight
                size={16}
                className={clsx(
                  "text-gray-400 transition-transform duration-200",
                  showUserMenu && "rotate-90"
                )}
              />
            </button>

            {showUserMenu && (
              <div className="mt-2 py-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-fade-in">
                <NavLink
                  to="/dashboard/account"
                  className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gradient-to-r hover:from-[#00ADE5]/10 hover:to-[#00d4ff]/10 hover:text-[#00ADE5] transition-all duration-200"
                  onClick={() => setShowUserMenu(false)}
                >
                  <User size={18} />
                  <span>My Account</span>
                </NavLink>
                <NavLink
                  to="/dashboard/billing"
                  className="flex items-center justify-between gap-3 px-4 py-2.5 text-gray-700 hover:bg-gradient-to-r hover:from-[#00ADE5]/10 hover:to-[#00d4ff]/10 hover:text-[#00ADE5] transition-all duration-200"
                  onClick={() => setShowUserMenu(false)}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard size={18} />
                    <span>Billing</span>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                    Free
                  </span>
                </NavLink>
                <NavLink
                  to="/dashboard/help"
                  className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gradient-to-r hover:from-[#00ADE5]/10 hover:to-[#00d4ff]/10 hover:text-[#00ADE5] transition-all duration-200"
                  onClick={() => setShowUserMenu(false)}
                >
                  <HelpCircle size={18} />
                  <span>Help & Support</span>
                </NavLink>
                <div className="border-t border-gray-200 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-all duration-200"
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
