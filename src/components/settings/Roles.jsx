import { useState } from "react";
import { Lock } from "lucide-react";

export default function Roles() {
  const [roles, setRoles] = useState([
    {
      id: 1,
      name: "Division Administrator",
      enabled: false,
      security: "Default Security",
    },
    {
      id: 2,
      name: "League Administrator",
      enabled: true,
      security: "Default Security",
    },
    {
      id: 3,
      name: "Player",
      enabled: true,
      security: "Default Security",
      hasOverride: true,
    },
    {
      id: 4,
      name: "Referee Administrator",
      enabled: false,
      security: "Default Security",
    },
    { id: 5, name: "Referee *", enabled: false, security: "Default Security" },
    {
      id: 6,
      name: "Team Administrator",
      enabled: true,
      security: "Default Security",
      hasOverride: true,
    },
  ]);

  const handleRoleToggle = (roleId) => {
    setRoles(
      roles.map((role) =>
        role.id === roleId ? { ...role, enabled: !role.enabled } : role
      )
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Lock className="text-gray-600" size={20} />
        <h2 className="text-lg font-medium text-gray-700">
          Define Roles And Security
        </h2>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Check for yes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Security
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {roles.map((role) => (
              <tr key={role.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {role.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={role.enabled}
                    onChange={() => handleRoleToggle(role.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {role.security}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {role.hasOverride && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Override
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-sm text-gray-500 italic">
        * Selecting / De-selecting this role will enable/disable Referee
        Assignment for your league
      </p>

      <div className="mt-6 flex gap-4">
        <button className="px-4 py-2 bg-[#003366] text-white rounded hover:bg-[#003366]0">
          Update
        </button>
        <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
          Back
        </button>
      </div>
    </div>
  );
}
