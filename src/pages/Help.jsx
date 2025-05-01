import { useState } from "react";
import { MessageSquare, Search } from "lucide-react";

export default function Help() {
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle chat message submission
    setMessage("");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Help Center</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Sidebar - FAQ Categories */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00ade5] focus:border-[#00ade5]"
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
            </div>

            <nav className="space-y-1">
              {[
                "Getting Started",
                "Account Settings",
                "Billing",
                "Teams",
                "Security",
                "API",
              ].map((category) => (
                <button
                  key={category}
                  className="w-full text-left px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  {category}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Right Side - Chat Support */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow h-[600px] flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <MessageSquare size={20} className="text-[#00ade5]" />
                <h2 className="text-lg font-medium">Live Support</h2>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                {/* System Message */}
                <div className="flex justify-center">
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    Today
                  </span>
                </div>

                {/* Support Message */}
                <div className="flex items-start gap-2">
                  <div className="bg-[#00ade5] text-white rounded-lg p-3 max-w-md">
                    <p>Hello! How can I help you today?</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#00ade5] focus:border-[#00ade5]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00ade5] text-white rounded hover:bg-[#0099cc]"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
