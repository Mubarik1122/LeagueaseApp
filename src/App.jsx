import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import Home from "./pages/Home";
import AdminHome from "./pages/AdminHome";
import Dashboard from "./pages/Dashboard";
import Setup from "./pages/Setup";
import People from "./pages/People";
import Competitions from "./pages/Competitions";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
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
import Subscription from "./pages/signup/Subscription";
import ManageMatches from "./pages/schedule/ManageMatches";
import SchedulerTools from "./pages/schedule/SchedulerTools";
import ManuallyCreate from "./pages/schedule/ManuallyCreate";
import MassDelete from "./pages/schedule/MassDelete";
import Conflicts from "./pages/schedule/Conflicts";
import Download from "./pages/schedule/Download";
import ResultSummary from "./pages/results/ResultSummary";
import StandingsAdjustments from "./pages/results/StandingsAdjustments";
import StatisticsDownload from "./pages/results/StatisticsDownload";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={<Login onLogin={() => setIsAuthenticated(true)} />}
          />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signup/account-setup" element={<AccountSetup />} />
          <Route path="/signup/verify" element={<Verification />} />
          <Route path="/signup/complete" element={<CompleteSetup />} />
          <Route path="/signup/league-type" element={<LeagueTypeSelection />} />
          <Route path="/signup/sport-selection" element={<SportSelection />} />
          <Route path="/signup/league-details" element={<LeagueDetails />} />
          <Route path="/signup/website-url" element={<WebsiteUrl />} />
          <Route path="/signup/subscription" element={<Subscription />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Sidebar onMenuToggle={setIsMobileMenuOpen} />
        <TopBar />

        <main className="lg:ml-64 pt-16 px-4 lg:px-6">
          <div className="mx-auto">
            <Routes>
              <Route path="/" element={<AdminHome />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/setup" element={<Setup />} />
              <Route path="/setup/competitions" element={<Competitions />} />
              <Route path="/people*" element={<People />} />
              <Route path="/schedule" element={<ManageMatches />} />
              <Route
                path="/schedule/scheduler-tools"
                element={<SchedulerTools />}
              />
              <Route
                path="/schedule/manually-create"
                element={<ManuallyCreate />}
              />
              <Route path="/schedule/mass-delete" element={<MassDelete />} />
              <Route path="/schedule/conflicts" element={<Conflicts />} />
              <Route path="/schedule/download" element={<Download />} />
              <Route path="/results" element={<ResultSummary />} />
              <Route
                path="/results/standings"
                element={<StandingsAdjustments />}
              />
              <Route
                path="/results/statistics"
                element={<StatisticsDownload />}
              />
              <Route path="/account" element={<Account />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/help" element={<Help />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
