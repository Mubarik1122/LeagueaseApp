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
} from "lucide-react";
import clsx from "clsx";

const menuItems = [
  { icon: Trophy, label: "Admin Home", path: "/", highlight: true },
  { icon: Settings, label: "Setup", path: "/setup" },
  { icon: Calendar, label: "Schedule", path: "/schedule" },
  { icon: BarChart, label: "Results", path: "/results" },
  { icon: Users, label: "People", path: "/people" },
  { icon: MessageSquare, label: "Communication", path: "/communication" },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear stored user session
    localStorage.clear();
    // Redirect to login
    window.location.href = "/login"; // Hard redirect
  };

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside
        className={clsx(
          "fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-transform duration-300 z-40",
          "lg:translate-x-0 lg:w-64",
          isOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full"
        )}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <img
              src="\image\logo\9.png"
              alt="Tournament Logo"
              className="h-16 object-contain"
            />
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  "hover:bg-gray-100",
                  item.highlight && "font-semibold",
                  isActive ? "bg-[#e6f9fd] text-[#00ade5]" : "text-gray-700"
                )
              }
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200">
          <div className="p-4">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100"
            >
              <User size={20} className="text-gray-600" />
              <span className="text-gray-700">John Doe</span>
            </button>

            {showUserMenu && (
              <div className="mt-2 py-2 bg-white rounded-lg shadow-lg border border-gray-200">
                <NavLink
                  to="/account"
                  className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  <User size={16} />
                  <span>My Account</span>
                </NavLink>
                <NavLink
                  to="/billing"
                  className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  <CreditCard size={16} />
                  <span>Billing</span>
                  <span className="ml-auto text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Free
                  </span>
                </NavLink>
                <NavLink
                  to="/help"
                  className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  <HelpCircle size={16} />
                  <span>Help</span>
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-[#00ade5] hover:bg-gray-50"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
