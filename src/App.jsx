import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import Home from "./pages/Home";
import AdminHome from "./pages/AdminHome";
import Setup from "./pages/Setup";
import People from "./pages/People";
import Competitions from "./pages/Competitions";
import Login from "./pages/Login";
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
import ManageMatches from "./pages/schedule/ManageMatches";
import SchedulerTools from "./pages/schedule/SchedulerTools";
import ManuallyCreate from "./pages/schedule/ManuallyCreate";
import MassDelete from "./pages/schedule/MassDelete";
import Conflicts from "./pages/schedule/Conflicts";
import Download from "./pages/schedule/Download";
import ResultSummary from "./pages/results/ResultSummary";
import StandingsAdjustments from "./pages/results/StandingsAdjustments";
import StatisticsDownload from "./pages/results/StatisticsDownload";

function AuthenticatedLayout({ children }) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar onMenuToggle={setIsMobileMenuOpen} />
      <TopBar />
      <main className="lg:ml-64 pt-16 px-4 lg:px-6">
        <div className="mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00ade5]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<AccountSetup />} />
        <Route path="/signup/verify" element={<Verification />} />
        <Route path="/signup/complete" element={<CompleteSetup />} />
        <Route path="/signup/league-type" element={<LeagueTypeSelection />} />
        <Route path="/signup/sport-selection" element={<SportSelection />} />
        <Route path="/signup/league-details" element={<LeagueDetails />} />
        <Route path="/signup/website-url" element={<WebsiteUrl />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <AdminHome />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/setup"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Setup />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/setup/competitions"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Competitions />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/people/*"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <People />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/schedule"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <ManageMatches />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/schedule/scheduler-tools"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <SchedulerTools />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/schedule/manually-create"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <ManuallyCreate />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/schedule/mass-delete"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <MassDelete />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/schedule/conflicts"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Conflicts />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/schedule/download"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Download />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/results"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <ResultSummary />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/results/standings"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <StandingsAdjustments />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/results/statistics"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <StatisticsDownload />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Account />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/billing"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Billing />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/help"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Help />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
