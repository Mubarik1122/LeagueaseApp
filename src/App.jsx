import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import Home from "./pages/Home";
import AdminHome from "./pages/AdminHome";
import Setup from "./pages/Setup";
import People from "./pages/People";
import Competitions from "./pages/Competitions";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPasswordSimple";
import Account from "./pages/Account";
import Billing from "./pages/Billing";
import Help from "./pages/Help";
import AccountSetup from "./pages/signup/AccountSetup";
import Verification from "./pages/signup/Verification";
import CompleteSetup from "./pages/signup/CompleteSetup";
import LeagueTypeSelection from "./pages/signup/LeagueTypeSelection";
import SportSelection from "./pages/signup/SportSelection";
import LeagueDetails from "./pages/signup/LeagueDetails";
import WebsiteUrl from "./pages/signup/WebsiteUrl";
import ScheduleLayout from "./pages/schedule/ScheduleLayout";
import ManageMatches from "./pages/schedule/ManageMatches";
import SchedulerTools from "./pages/schedule/SchedulerTools";
import ManuallyCreate from "./pages/schedule/ManuallyCreate";
import MassDelete from "./pages/schedule/MassDelete";
import Conflicts from "./pages/schedule/Conflicts";
import Download from "./pages/schedule/Download";
import ResultSummary from "./pages/results/ResultSummary";
import MaintainResults from "./pages/results/MaintainResults";
import ResultsLayout from "./pages/results/ResultsLayout";
import StandingsAdjustments from "./pages/results/StandingsAdjustments";
import StatisticsDownload from "./pages/results/StatisticsDownload";
import MatchStatistics from "./pages/results/MatchStatistics";
import RbacLayout, { RbacIndexRedirect } from "./pages/rbac/RbacLayout";
import CompanyManagement from "./pages/rbac/CompanyManagement";
import UserManagement from "./pages/rbac/UserManagement";
import PlatformManagement from "./pages/rbac/PlatformManagement";
import PagesManagement from "./pages/rbac/PagesManagement";
import PermissionsManagement from "./pages/rbac/PermissionsManagement";
import MenuPlacementManagement from "./pages/rbac/MenuPlacementManagement";
import CompanyRolesList from "./pages/rbac/roles/CompanyRolesList";
import RoleUpsert from "./pages/rbac/roles/RoleUpsert";
import Teams from "./pages/Teams";
import Standings from "./pages/Standings";
import VenueManagement from "./pages/VenueManagement";
import { useAuthContext } from "./context/AuthContext";

function App() {
  const { isAuthenticated, loading } = useAuthContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add("mobile-nav-open");
    } else {
      document.body.classList.remove("mobile-nav-open");
    }

    return () => {
      document.body.classList.remove("mobile-nav-open");
    };
  }, [isMobileMenuOpen]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      {/* Public Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/signup" element={<AccountSetup />} />
        <Route path="/signup/verify" element={<Verification />} />
        <Route path="/signup/complete" element={<CompleteSetup />} />
        <Route path="/signup/league-type" element={<LeagueTypeSelection />} />
        <Route path="/signup/sport-selection" element={<SportSelection />} />
        <Route path="/signup/league-details" element={<LeagueDetails />} />
        <Route path="/signup/website-url" element={<WebsiteUrl />} />

        {/* 🔹 Protected Dashboard Routes */}
        <Route
          path="/dashboard/*"
          element={
            isAuthenticated ? (
              <div className="min-h-screen bg-gray-50">
                <Sidebar onMenuToggle={setIsMobileMenuOpen} />
                <TopBar />
                <main className="lg:ml-64 pt-16 px-4 lg:px-6">
                  <Routes>
                    <Route path="" element={<AdminHome />} />
                    <Route path="setup/*" element={<Setup />} />
                    <Route path="teams" element={<Teams />} />
                    <Route path="standings" element={<Standings />} />
                    <Route path="venues" element={<VenueManagement />} />
                    <Route path="people*" element={<People />} />
                    <Route path="schedule/*" element={<ScheduleLayout />}>
                      <Route index element={<ManageMatches />} />
                      <Route
                        path="scheduler-tools"
                        element={<SchedulerTools />}
                      />
                      <Route
                        path="manually-create"
                        element={<ManuallyCreate />}
                      />
                      <Route path="mass-delete" element={<MassDelete />} />
                      <Route path="conflicts" element={<Conflicts />} />
                      <Route path="download" element={<Download />} />
                    </Route>
                    <Route path="results/match/:matchId" element={<MatchStatistics />} />
                    <Route path="results/*" element={<ResultsLayout />}>
                      <Route index element={<ResultSummary />} />
                      <Route path="maintain" element={<MaintainResults />} />
                      <Route
                        path="standings"
                        element={<StandingsAdjustments />}
                      />
                      <Route
                        path="statistics"
                        element={<StatisticsDownload />}
                      />
                    </Route>
                    <Route path="rbac/*" element={<RbacLayout />}>
                      <Route index element={<RbacIndexRedirect />} />
                      <Route path="companies" element={<CompanyManagement />} />
                      <Route path="roles" element={<CompanyRolesList />} />
                      <Route path="roles/upsert" element={<RoleUpsert />} />
                      <Route path="users" element={<UserManagement />} />
                      <Route path="platforms" element={<PlatformManagement />} />
                      <Route path="permissions" element={<PermissionsManagement />} />
                      <Route path="menu-placements" element={<MenuPlacementManagement />} />
                      <Route path="pages/*" element={<PagesManagement />} />
                      {/* Legacy redirects */}
                      <Route path="roles/assign" element={<Navigate to="/dashboard/rbac/users" replace />} />
                      <Route path="roles/user-roles" element={<Navigate to="/dashboard/rbac/users?tab=lookup" replace />} />
                      <Route path="initialize" element={<Navigate to="/dashboard/rbac/platforms" replace />} />
                      <Route path="access/*" element={<Navigate to="/dashboard/rbac/users" replace />} />
                    </Route>
                    <Route path="account" element={<Account />} />
                    <Route path="billing" element={<Billing />} />
                    <Route path="help" element={<Help />} />
                  </Routes>
                </main>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Fallback for unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
