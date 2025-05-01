import { CreditCard, Package, CheckCircle } from "lucide-react";

export default function Billing() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Billing</h1>

      {/* Current Plan */}
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Package size={20} className="text-[#00ade5]" />
          Current Plan
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">You are currently on the</p>
            <p className="text-xl font-semibold text-gray-900">Free Plan</p>
          </div>
          <button className="px-4 py-2 bg-[#00ade5] text-white rounded hover:bg-[#0099cc]">
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* Payment Method */}
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <CreditCard size={20} className="text-[#00ade5]" />
          Payment Method
        </h2>
        <button className="px-4 py-2 border border-[#00ade5] text-[#00ade5] rounded hover:bg-[#00ade5] hover:text-white">
          Add Payment Method
        </button>
      </div>

      {/* Plan Comparison */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Available Plans
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Free Plan */}
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">Free</h3>
              <p className="text-gray-600 mb-4">
                Basic features for small teams
              </p>
              <p className="text-3xl font-bold mb-4">$0</p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span className="text-sm">Basic features</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span className="text-sm">Up to 10 users</span>
                </li>
              </ul>
              <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded">
                Current Plan
              </button>
            </div>

            {/* Pro Plan */}
            <div className="border rounded-lg p-6 border-[#00ade5] bg-[#00ade5]/5">
              <h3 className="text-xl font-semibold mb-2">Pro</h3>
              <p className="text-gray-600 mb-4">
                Advanced features for growing teams
              </p>
              <p className="text-3xl font-bold mb-4">$29</p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span className="text-sm">All Free features</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span className="text-sm">Up to 50 users</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span className="text-sm">Advanced analytics</span>
                </li>
              </ul>
              <button className="w-full px-4 py-2 bg-[#00ade5] text-white rounded hover:bg-[#0099cc]">
                Upgrade to Pro
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
              <p className="text-gray-600 mb-4">
                Custom solutions for large organizations
              </p>
              <p className="text-3xl font-bold mb-4">Custom</p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span className="text-sm">All Pro features</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span className="text-sm">Unlimited users</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span className="text-sm">24/7 support</span>
                </li>
              </ul>
              <button className="w-full px-4 py-2 border border-[#00ade5] text-[#00ade5] rounded hover:bg-[#00ade5] hover:text-white">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
