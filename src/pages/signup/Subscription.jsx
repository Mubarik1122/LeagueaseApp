import { useNavigate } from "react-router-dom";
import { CreditCard, Check } from "lucide-react";
import Navbar from "../../components/Navbar";

export default function Subscription() {
  const navigate = useNavigate();

  const handleFreePlan = () => {
    localStorage.setItem("subscription", "free");
    navigate("/admin");
  };

  const handleGoldTrial = () => {
    localStorage.setItem("subscription", "gold-trial");
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <Navbar />
      <div className="max-w-5xl w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <CreditCard className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Step 5 of 5</h2>
          <p className="mt-2 text-gray-600">Choose your plan</p>
          <p className="mt-2 text-sm text-gray-500">
            We have even more great features in our paid-for plans - check them
            out and{" "}
            <span className="text-[#00ADE5] font-medium">
              start your free 14 day trial
            </span>{" "}
            or continue with the free features.
          </p>
          <p className="text-sm text-gray-500">
            You can start a trial at any time from the Billing page.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">FREE</h3>
            <p className="text-gray-600 mb-6">
              Everything you need to run a sports league
            </p>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>League Scheduler</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Match results</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Player statistics</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Online registrations and payments</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Mobile friendly website</span>
              </li>
            </ul>

            <button
              onClick={handleFreePlan}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Continue with Free features
            </button>
          </div>

          {/* Gold Plan */}
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">GOLD</h3>
            <p className="text-gray-600 mb-6">
              Everything in FREE plus zero adverts and premium features
            </p>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>No adverts</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Use your own domain name</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Enhanced website look and feel</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Integration with your own existing website</span>
              </li>
            </ul>

            <button
              onClick={handleGoldTrial}
              className="w-full px-4 py-2 bg-[#003366] text-white rounded-md hover:bg-[#003366]"
            >
              Start free 14 day trial
            </button>
          </div>
        </div>

        {/* Pricing Table */}
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">GOLD PRICING</h3>
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-medium text-gray-700">SMALL</h4>
              <p className="text-3xl font-bold text-gray-900 my-2">$17.90</p>
              <p className="text-sm text-gray-500">per month</p>
              <p className="text-sm text-[#00ADE5] mt-2">For up to 25 Teams</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700">MEDIUM</h4>
              <p className="text-3xl font-bold text-gray-900 my-2">$30.40</p>
              <p className="text-sm text-gray-500">per month</p>
              <p className="text-sm text-[#00ADE5] mt-2">For up to 100 Teams</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700">LARGE</h4>
              <p className="text-3xl font-bold text-gray-900 my-2">$60.90</p>
              <p className="text-sm text-gray-500">per month</p>
              <p className="text-sm text-[#00ADE5] mt-2">For up to 300 Teams</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700">XL</h4>
              <p className="text-3xl font-bold text-gray-900 my-2">$89.60</p>
              <p className="text-sm text-gray-500">per month</p>
              <p className="text-sm text-[#00ADE5] mt-2">
                For more than 300 Teams
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            We calculate the number of teams to be teams in divisions (round
            robin) in one season. We do not count teams in tournaments, i.e.
            knockout competitions nor singles / doubles / triples teams.
          </p>
        </div>
      </div>
    </div>
  );
}
