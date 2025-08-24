import { useState } from "react";
import { Search, Menu, X, Calendar, Trophy, Users, MapPin, Phone, Mail, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function VisitSite() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const goBackToAdmin = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Back to Admin Button */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={goBackToAdmin}
          className="flex items-center gap-2 px-4 py-2 bg-[#00ADE5] text-white rounded-lg shadow-lg hover:bg-[#0099cc] transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Admin
        </button>
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <img
                src="/image/logo/3.png"
                alt="League Logo"
                className="h-12 w-auto"
              />
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">Muslim League</h1>
                <p className="text-sm text-gray-600">Cricket Tournament</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#home" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                Home
              </a>
              <a href="#fixtures" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                Fixtures
              </a>
              <a href="#results" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                Results
              </a>
              <a href="#standings" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                Standings
              </a>
              <a href="#teams" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                Teams
              </a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                Contact
              </a>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="text-gray-700 hover:text-gray-900 focus:outline-none focus:text-gray-900"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <a href="#home" className="block px-3 py-2 text-base font-medium text-gray-900 hover:text-blue-600">
                Home
              </a>
              <a href="#fixtures" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600">
                Fixtures
              </a>
              <a href="#results" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600">
                Results
              </a>
              <a href="#standings" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600">
                Standings
              </a>
              <a href="#teams" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600">
                Teams
              </a>
              <a href="#contact" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600">
                Contact
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="home" className="relative bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div 
          className="relative min-h-96 flex items-center justify-center bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80&w=1200')"
          }}
        >
          <div className="text-center px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Welcome to Muslim League
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Premier Cricket Tournament 2024-2025
            </p>
            <div className="space-x-4">
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                View Fixtures
              </button>
              <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition">
                Latest Results
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Trophy className="text-blue-600" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">12</h3>
              <p className="text-gray-600">Teams</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Calendar className="text-green-600" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">48</h3>
              <p className="text-gray-600">Matches</p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="text-yellow-600" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">180</h3>
              <p className="text-gray-600">Players</p>
            </div>
            <div className="text-center">
              <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-red-600" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">6</h3>
              <p className="text-gray-600">Venues</p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Results */}
      <section id="results" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Latest Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { team1: "Lions CC", team2: "Eagles FC", score1: "185/7", score2: "142/10", status: "Lions Won" },
              { team1: "Tigers XI", team2: "Panthers CC", score1: "156/9", score2: "158/6", status: "Panthers Won" },
              { team1: "Wolves FC", team2: "Hawks CC", score1: "201/5", score2: "198/8", status: "Wolves Won" },
            ].map((match, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 border">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-center flex-1">
                    <h3 className="font-semibold text-gray-900">{match.team1}</h3>
                    <p className="text-2xl font-bold text-blue-600">{match.score1}</p>
                  </div>
                  <div className="px-4">
                    <span className="text-gray-500">vs</span>
                  </div>
                  <div className="text-center flex-1">
                    <h3 className="font-semibold text-gray-900">{match.team2}</h3>
                    <p className="text-2xl font-bold text-blue-600">{match.score2}</p>
                  </div>
                </div>
                <div className="text-center">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {match.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Fixtures */}
      <section id="fixtures" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Upcoming Fixtures</h2>
          <div className="space-y-4">
            {[
              { team1: "Sharks CC", team2: "Dolphins FC", date: "March 25, 2025", time: "2:00 PM", venue: "Central Ground" },
              { team1: "Falcons XI", team2: "Ravens CC", date: "March 26, 2025", time: "10:00 AM", venue: "Sports Complex" },
              { team1: "Bulls FC", team2: "Stallions CC", date: "March 27, 2025", time: "3:00 PM", venue: "Main Stadium" },
            ].map((fixture, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center space-x-4 mb-4 md:mb-0">
                    <div className="text-center">
                      <h3 className="font-semibold text-gray-900">{fixture.team1}</h3>
                    </div>
                    <span className="text-gray-500 font-medium">vs</span>
                    <div className="text-center">
                      <h3 className="font-semibold text-gray-900">{fixture.team2}</h3>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-6">
                    <div className="flex items-center text-gray-600">
                      <Calendar size={16} className="mr-2" />
                      <span>{fixture.date}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="mr-2">🕐</span>
                      <span>{fixture.time}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin size={16} className="mr-2" />
                      <span>{fixture.venue}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Standings Table */}
      <section id="standings" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">League Standings</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow-md">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Played</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Won</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  { pos: 1, team: "Lions CC", played: 8, won: 7, lost: 1, points: 14 },
                  { pos: 2, team: "Eagles FC", played: 8, won: 6, lost: 2, points: 12 },
                  { pos: 3, team: "Tigers XI", played: 8, won: 5, lost: 3, points: 10 },
                  { pos: 4, team: "Panthers CC", played: 8, won: 4, lost: 4, points: 8 },
                  { pos: 5, team: "Wolves FC", played: 8, won: 3, lost: 5, points: 6 },
                ].map((team) => (
                  <tr key={team.pos} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{team.pos}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{team.team}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{team.played}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{team.won}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{team.lost}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{team.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Phone size={16} className="mr-3" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center">
                  <Mail size={16} className="mr-3" />
                  <span>info@muslimleague.com</span>
                </div>
                <div className="flex items-center">
                  <MapPin size={16} className="mr-3" />
                  <span>123 Sports Avenue, City, State 12345</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#fixtures" className="hover:text-blue-400">Fixtures</a></li>
                <li><a href="#results" className="hover:text-blue-400">Results</a></li>
                <li><a href="#standings" className="hover:text-blue-400">Standings</a></li>
                <li><a href="#teams" className="hover:text-blue-400">Teams</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-white hover:text-blue-400">Facebook</a>
                <a href="#" className="text-white hover:text-blue-400">Twitter</a>
                <a href="#" className="text-white hover:text-blue-400">Instagram</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p>&copy; 2025 Muslim League. All rights reserved.</p>
          </div>
        </div>
      </section>
    </div>
  );
}