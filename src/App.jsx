import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Home from './pages/Home';
import AdminHome from './pages/AdminHome';
import Setup from './pages/Setup';
import People from './pages/People';
import Competitions from './pages/Competitions';
import Login from './pages/Login';
import AccountSetup from './pages/signup/AccountSetup';
import Verification from './pages/signup/Verification';
import CompleteSetup from './pages/signup/CompleteSetup';
import LeagueTypeSelection from './pages/signup/LeagueTypeSelection';
import SportSelection from './pages/signup/SportSelection';
import LeagueDetails from './pages/signup/LeagueDetails';
import WebsiteUrl from './pages/signup/WebsiteUrl';
import Subscription from './pages/signup/Subscription';
import ManageMatches from './pages/schedule/ManageMatches';
import SchedulerTools from './pages/schedule/SchedulerTools';
import ManuallyCreate from './pages/schedule/ManuallyCreate';
import ResultSummary from './pages/results/ResultSummary';
import StandingsAdjustments from './pages/results/StandingsAdjustments';
import StatisticsDownload from './pages/results/StatisticsDownload';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
          <Route path="/signup" element={<AccountSetup />} />
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
        <Sidebar />
        <TopBar />
        
        <main className="lg:ml-64 pt-16">
          <Routes>
            <Route path="/" element={<AdminHome />} />
            <Route path="/setup" element={<Setup />} />
            <Route path="/setup/competitions" element={<Competitions />} />
            <Route path="/people" element={<People />} />
            <Route path="/schedule" element={<ManageMatches />} />
            <Route path="/schedule/scheduler-tools" element={<SchedulerTools />} />
            <Route path="/schedule/manually-create" element={<ManuallyCreate />} />
            <Route path="/results" element={<ResultSummary />} />
            <Route path="/results/standings" element={<StandingsAdjustments />} />
            <Route path="/results/statistics" element={<StatisticsDownload />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;