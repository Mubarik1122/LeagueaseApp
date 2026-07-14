import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  User,
  CreditCard,
  HelpCircle,
  LogOut,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import clsx from "clsx";
import { useAuthContext } from "../context/AuthContext";
import { buildSidebarMenu } from "../utils/userNavigation";

export default function Sidebar({ onMenuToggle }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthContext();

  const menuItems = useMemo(
    () => buildSidebarMenu(user),
    // accessRevision bumps on every /access/my-access merge so menu always rebuilds
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, user?.accessRevision, user?.pageKeyMap, user?.platforms]
  );

  // Auto-expand newly granted sections (e.g. Access Control after permission refresh)
  useEffect(() => {
    setExpandedKeys((prev) => {
      const next = { ...prev };
      let changed = false;
      menuItems.forEach((item) => {
        if (
          item.expandable &&
          item.children?.length &&
          !Object.prototype.hasOwnProperty.call(prev, item.pageKey)
        ) {
          next[item.pageKey] = true;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [menuItems, user?.accessRevision]);

  useEffect(() => {
    setExpandedKeys((prev) => {
      const next = { ...prev };
      let changed = false;
      menuItems.forEach((item) => {
        if (!item.expandable || !item.children?.length) return;
        const onChild = item.children.some(
          (c) =>
            location.pathname === c.path ||
            location.pathname.startsWith(`${c.path}/`)
        );
        if (onChild && !next[item.pageKey]) {
          next[item.pageKey] = true;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [location.pathname, menuItems]);

  const closeMobile = () => {
    setIsOpen(false);
    onMenuToggle?.(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleMobile = () => {
    const next = !isOpen;
    setIsOpen(next);
    onMenuToggle?.(next);
  };

  const toggleExpanded = (pageKey) => {
    setExpandedKeys((prev) => ({ ...prev, [pageKey]: !prev[pageKey] }));
  };

  const linkClass = ({ isActive }, highlight = false) =>
    clsx(
      "group flex items-center justify-between gap-3 rounded-xl px-4 py-3 transition-all duration-200",
      highlight && "font-semibold",
      isActive
        ? "bg-gradient-to-r from-[#00ADE5] to-[#00d4ff] text-white shadow-lg shadow-[#00ADE5]/30"
        : "text-gray-700 hover:bg-gradient-to-r hover:from-[#00ADE5]/10 hover:to-[#00d4ff]/10 hover:text-[#00ADE5]"
    );

  const renderLeaf = (item, { indent = false } = {}) => {
    const Icon = item.icon;

    if (item.external) {
      return (
        <a
          key={item.id || item.path}
          href={item.path}
          target="_blank"
          rel="noopener noreferrer"
          className={clsx(
            "group flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-gray-700 transition-all duration-200 hover:bg-gradient-to-r hover:from-[#00ADE5]/10 hover:to-[#00d4ff]/10 hover:text-[#00ADE5]",
            indent && "py-2 text-[13px]"
          )}
        >
          <div className="flex items-center gap-3">
            <Icon size={indent ? 15 : 20} className="transition-transform group-hover:scale-110" />
            <span className={indent ? "font-medium" : "font-medium"}>{item.label}</span>
          </div>
          <ChevronRight
            size={16}
            className="opacity-0 transition-opacity group-hover:opacity-100"
          />
        </a>
      );
    }

    return (
      <NavLink
        key={item.id || item.path}
        to={item.path}
        end={item.end}
        onClick={closeMobile}
        className={(args) =>
          clsx(linkClass(args, item.end), indent && "rounded-lg px-3 py-2 text-[13px] font-medium")
        }
      >
        <div className="flex items-center gap-3">
          <Icon size={indent ? 15 : 20} className="shrink-0 transition-transform group-hover:scale-110" />
          <span className="truncate">{item.label}</span>
        </div>
        {!indent && (
          <ChevronRight
            size={16}
            className="opacity-0 transition-opacity group-hover:opacity-100"
          />
        )}
      </NavLink>
    );
  };

  const renderExpandable = (item) => {
    const Icon = item.icon;
    const isOpenSection = Boolean(expandedKeys[item.pageKey]);
    const isSectionActive = item.children.some(
      (c) =>
        location.pathname === c.path || location.pathname.startsWith(`${c.path}/`)
    );

    return (
      <div key={item.id || item.pageKey} className="!mt-1">
        <button
          type="button"
          onClick={() => {
            const next = !isOpenSection;
            toggleExpanded(item.pageKey);
            if (next && item.children[0]?.path) {
              navigate(item.children[0].path);
            }
          }}
          className={clsx(
            "flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 transition-all duration-200",
            isSectionActive
              ? "bg-gradient-to-r from-[#00ADE5] to-[#00d4ff] text-white shadow-lg shadow-[#00ADE5]/30"
              : "text-gray-700 hover:bg-gradient-to-r hover:from-[#00ADE5]/10 hover:to-[#00d4ff]/10 hover:text-[#00ADE5]"
          )}
        >
          <div className="flex items-center gap-3">
            <Icon size={20} />
            <span className="font-medium">{item.label}</span>
          </div>
          <ChevronDown
            size={16}
            className={clsx(
              "shrink-0 transition-transform duration-200",
              isOpenSection && "rotate-180"
            )}
          />
        </button>

        {isOpenSection && (
          <ul className="mt-1 space-y-0.5 pl-2">
            {item.children.map((child) => (
              <li key={child.id || child.path}>{renderLeaf(child, { indent: true })}</li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 rounded-lg border border-gray-200 bg-white p-2.5 shadow-lg transition-all duration-200 hover:shadow-xl"
        onClick={toggleMobile}
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X size={24} className="text-gray-700" />
        ) : (
          <Menu size={24} className="text-gray-700" />
        )}
      </button>

      <aside
        className={clsx(
          "fixed left-0 top-0 z-40 h-full border-r border-gray-200 bg-gradient-to-b from-white to-gray-50 shadow-xl transition-transform duration-300",
          "lg:w-64 lg:translate-x-0",
          isOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full lg:translate-x-0"
        )}
      >
        <div className="border-b border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#00ADE5] to-[#00d4ff] opacity-30 blur-sm" />
              <div className="relative rounded-lg bg-white p-2">
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

        <nav className="h-[calc(100vh-200px)] space-y-1 overflow-y-auto p-4">
          {menuItems.map((item) =>
            item.expandable ? renderExpandable(item) : renderLeaf(item)
          )}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white">
          <div className="p-4">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:bg-gray-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#00ADE5] to-[#00d4ff] font-semibold text-white">
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
              <div className="animate-fade-in mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white py-2 shadow-xl">
                <NavLink
                  to="/dashboard/account"
                  className="flex items-center gap-3 px-4 py-2.5 text-gray-700 transition-all duration-200 hover:bg-gradient-to-r hover:from-[#00ADE5]/10 hover:to-[#00d4ff]/10 hover:text-[#00ADE5]"
                  onClick={() => setShowUserMenu(false)}
                >
                  <User size={18} />
                  <span>My Account</span>
                </NavLink>
                <NavLink
                  to="/dashboard/billing"
                  className="flex items-center justify-between gap-3 px-4 py-2.5 text-gray-700 transition-all duration-200 hover:bg-gradient-to-r hover:from-[#00ADE5]/10 hover:to-[#00d4ff]/10 hover:text-[#00ADE5]"
                  onClick={() => setShowUserMenu(false)}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard size={18} />
                    <span>Billing</span>
                  </div>
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                    Free
                  </span>
                </NavLink>
                <NavLink
                  to="/dashboard/help"
                  className="flex items-center gap-3 px-4 py-2.5 text-gray-700 transition-all duration-200 hover:bg-gradient-to-r hover:from-[#00ADE5]/10 hover:to-[#00d4ff]/10 hover:text-[#00ADE5]"
                  onClick={() => setShowUserMenu(false)}
                >
                  <HelpCircle size={18} />
                  <span>Help & Support</span>
                </NavLink>
                <div className="my-1 border-t border-gray-200" />
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-red-600 transition-all duration-200 hover:bg-red-50"
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 backdrop-blur-sm lg:hidden"
          onClick={closeMobile}
        />
      )}
    </>
  );
}
