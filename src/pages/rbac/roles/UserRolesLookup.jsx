import { useState } from "react";
import { Loader2, Search } from "lucide-react";
import Swal from "sweetalert2";
import { roleAPI } from "../../../services/api";
import { useRbacContext } from "../../../hooks/useRbacContext";

export default function UserRolesLookup({ embedded = false }) {
  const { needsCompany } = useRbacContext();
  const [userId, setUserId] = useState("");
  const [activeOnly, setActiveOnly] = useState(true);
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!userId.trim()) {
      Swal.fire({ icon: "warning", title: "User ID is required" });
      return;
    }
    setLoading(true);
    setRoles(null);
    try {
      const query = activeOnly ? {} : { activeOnly: "false" };
      const res = await roleAPI.getUserRoles(userId.trim(), query);
      const data = res.data;
      if (Array.isArray(data)) setRoles(data);
      else if (Array.isArray(data?.roles)) setRoles(data.roles);
      else setRoles([]);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Lookup failed", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (needsCompany) {
    return (
      <div className={embedded ? "px-5 py-12 text-center sm:px-6" : "p-6 text-sm text-gray-600"}>
        {embedded ? (
          <>
            <p className="text-sm font-medium text-gray-900">Company required</p>
            <p className="mt-1 text-sm text-gray-500">
              Select a company from Company Management first.
            </p>
          </>
        ) : (
          "Select a company from the top bar to view user roles."
        )}
      </div>
    );
  }

  return (
    <div className={embedded ? "p-5 sm:p-6" : "p-5"}>
      {!embedded && (
        <div className="mb-5">
          <h2 className="text-base font-bold text-gray-900">User Roles</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Look up roles assigned to a specific user
          </p>
        </div>
      )}

      <form onSubmit={handleSearch} className="max-w-lg space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-600">User ID</label>
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono"
            placeholder="674a1b2c3d4e5f6789012349"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(e) => setActiveOnly(e.target.checked)}
          />
          Active roles only
        </label>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-[#003366] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
          Search
        </button>
      </form>

      {roles !== null && (
        <div className="mt-6">
          {roles.length === 0 ? (
            <p className="text-sm text-gray-500">No roles found for this user.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Role</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Type</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white">
                  {roles.map((role, idx) => (
                    <tr key={role.roleId || role._id || role.id || idx}>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {role.roleName || role.name}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {role.isSystemRole ? "System" : "Company"}
                      </td>
                      <td className="px-4 py-3">
                        {role.isActive !== false ? (
                          <span className="text-green-600">Active</span>
                        ) : (
                          <span className="text-gray-400">Inactive</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
