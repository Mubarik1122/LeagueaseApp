import { Search, ChevronDown, Bell, Settings as SettingsIcon, Building2 } from "lucide-react";
import { useState } from "react";
import { useCompanyContext } from "../context/CompanyContext";

export default function TopBar() {
  const [showNotifications, setShowNotifications] = useState(false);
  const {
    isSuperAdmin,
    companies,
    selectedCompanyId,
    setSelectedCompanyId,
    loadingCompanies,
  } = useCompanyContext();

  return (
    <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 h-16 fixed top-0 right-0 left-0 z-30 lg:left-64 shadow-sm">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between">
        {/* Page Title */}
        <div>
          <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-xs text-gray-500 hidden sm:block">Welcome back!</p>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3 sm:gap-6">
          {isSuperAdmin && (
            <div className="hidden md:block relative">
              <label className="text-xs text-gray-600 mr-2 font-medium inline-flex items-center gap-1">
                <Building2 size={14} />
                Company
              </label>
              <select
                value={selectedCompanyId || ""}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                disabled={loadingCompanies || companies.length === 0}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:border-[#00ADE5] focus:ring-2 focus:ring-[#00ADE5]/20 transition-all duration-200 text-sm font-medium text-gray-700 hover:border-gray-400 cursor-pointer min-w-[180px] max-w-[240px] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {companies.length === 0 ? (
                  <option value="">
                    {loadingCompanies ? "Loading..." : "No companies"}
                  </option>
                ) : (
                  companies.map((company) => (
                    <option key={company.companyId} value={company.companyId}>
                      {company.companyName}
                    </option>
                  ))
                )}
              </select>
              <ChevronDown
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                size={16}
              />
            </div>
          )}

          {/* Season Selector */}
          <div className="hidden md:block relative">
            <label className="text-xs text-gray-600 mr-2 font-medium">Season</label>
            <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:border-[#00ADE5] focus:ring-2 focus:ring-[#00ADE5]/20 transition-all duration-200 text-sm font-medium text-gray-700 hover:border-gray-400 cursor-pointer">
              <option>2024-2025</option>
              <option>2023-2024</option>
            </select>
            <ChevronDown
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              size={16}
            />
          </div>

          {/* Search */}
          <div className="relative hidden sm:block">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search competitions..."
              className="pl-10 pr-4 py-2 w-48 lg:w-64 rounded-lg border border-gray-300 focus:outline-none focus:border-[#00ADE5] focus:ring-2 focus:ring-[#00ADE5]/20 transition-all duration-200 text-sm bg-gray-50 hover:bg-white"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              aria-label="Notifications"
            >
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="px-4 py-8 text-center text-sm text-gray-500">
                  No new notifications
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <button
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            aria-label="Settings"
          >
            <SettingsIcon size={20} className="text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
