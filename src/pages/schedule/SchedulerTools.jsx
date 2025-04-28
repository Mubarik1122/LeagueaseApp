import { Link } from "react-router-dom";
import { AlertCircle, Clock } from "lucide-react";

export default function SchedulerTools() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          to="/schedule"
          className="text-blue-600 hover:underline flex items-center gap-2"
        >
          ← Back to Manage Matches
        </Link>
      </div>

      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Scheduler Tools
      </h1>

      <div className="space-y-6">
        {/* Multi Division Scheduler */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-red-100 text-[#00ADE5] px-3 py-1 rounded-full text-sm font-medium">
                new - try this first
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-800 mb-2">
                  Multi Division Scheduler
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <Clock size={16} />
                  <span>5 mins approx</span>
                </div>
                <p className="text-gray-600 mb-4">
                  Please check out the new scheduler that we are introducing in
                  Beta stage. It will schedule divisions of different sizes
                  having them all complete as soon as possible. For example, if
                  you have a 10 team division meeting twice it will be completed
                  in 18 weeks and an 8 team division meeting twice in 14 weeks.
                  It accommodates venue sharing between the divisions.
                </p>
                <button className="px-4 py-2 bg-[#003366] text-white rounded hover:bg-[#003366]">
                  Go →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Template Scheduler */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div>
                <h2 className="text-lg font-medium text-gray-800 mb-2">
                  Template scheduler
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <Clock size={16} />
                  <span>5 mins approx</span>
                </div>
                <p className="text-gray-600 mb-4">
                  Use this scheduler for single or similar size divisions.
                  Matches will complete at the same time as the largest
                  division. Supports venue sharing across divisions and
                  inter-division matches.
                </p>
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                    Go →
                  </button>
                  <Link
                    to="/help/scheduler"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <AlertCircle size={16} />
                    Find out more
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
