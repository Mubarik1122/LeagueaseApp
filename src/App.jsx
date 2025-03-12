import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import AdminHome from "./pages/AdminHome";
import Setup from "./pages/Setup";
import People from "./pages/People";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <TopBar />

        <main className="lg:ml-64 pt-16">
          <Routes>
            <Route path="/" element={<AdminHome />} />
            <Route path="/setup" element={<Setup />} />
            <Route path="/people" element={<People />} />
            {/* Other routes will be added as needed */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
