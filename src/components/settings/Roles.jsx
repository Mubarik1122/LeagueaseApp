import { useState, useEffect, useRef } from "react";
import { Lock, AlertCircle, CheckCircle2, Loader2, Info } from "lucide-react";
import { roleAPI, settingsAPI } from "../../services/api";
import Swal from "sweetalert2";

function isSuperAdminUser(user) {
  if (!user || typeof user !== "object") return false;
  if (user.isSuperAdmin === true) return true;
  return Array.isArray(user.roles)
    ? user.roles.some(
        (role) => String(role).trim().toLowerCase() === "super admin"
      )
    : false;
}

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const hasFetched = useRef(false);

  // Fetch roles from API - only once
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchRoles();
    }
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First, get all available roles
      const rolesResponse = await roleAPI.getRoles();
      
      // Then, get user's current settings to see which roles are enabled
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user?.userId;
      setIsSuperAdmin(isSuperAdminUser(user));

      let enabledRoleIds = [];
      let enabledRoleNames = [];
      let enabledRoleNameSet = new Set();
      if (userId) {
        try {
          const settingsResponse = await settingsAPI.getSettings();
          if (settingsResponse.errorCode === 0 && settingsResponse.data?.roles) {
            // Extract enabled role IDs from settings
            enabledRoleIds = settingsResponse.data.roles
              .filter((role) => role.enabled)
              .map((role) => role._id || role.id);
          }

          // Support alternative settings shape:
          // { userRoles: ["League Administrator"] }
          if (Array.isArray(settingsResponse.data?.userRoles)) {
            enabledRoleNames = settingsResponse.data.userRoles
              .filter(Boolean)
              .map((r) => String(r).trim());
            enabledRoleNameSet = new Set(
              enabledRoleNames.map((n) => n.toLowerCase())
            );
          }
        } catch (settingsErr) {
          console.warn("Could not fetch user settings:", settingsErr);
          // Continue with roles list even if settings fail
        }
      }
      
      // Transform API response to match component structure
      if (rolesResponse.data && Array.isArray(rolesResponse.data)) {
        const transformedRoles = rolesResponse.data.map((role) => {
          const roleId = role._id || role.id;
          const roleName = role.roleName || role.name || "Unknown Role";
          return {
            id: roleId,
            name: roleName,
            // If backend returns enabled info as IDs use that,
            // otherwise also support enabled by role name via `userRoles`.
            enabled:
              enabledRoleIds.includes(roleId) ||
              enabledRoleNameSet.has(String(roleName).trim().toLowerCase()) ||
              role.enabled === true,
            security: role.security || "Default Security",
            hasOverride: role.hasOverride || false,
            originalData: role, // Keep original data for update
          };
        });
        setRoles(transformedRoles);
      } else {
        // Fallback to empty array if data structure is different
        setRoles([]);
      }
    } catch (err) {
      console.error("Error fetching roles:", err);
      setError(err.message || "Failed to load roles");
      // Set empty array on error
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = (roleId) => {
    if (isSuperAdmin) return;

    setRoles(
      roles.map((role) =>
        role.id === roleId ? { ...role, enabled: !role.enabled } : role
      )
    );
  };

  const handleUpdate = async () => {
    if (isSuperAdmin) {
      Swal.fire({
        icon: "info",
        title: "Roles Locked",
        text: "Super Admin cannot change or disable their own roles.",
        confirmButtonColor: "#00ADE5",
      });
      return;
    }
    // Validation: At least one role must be selected
    const selectedRoles = roles.filter((role) => role.enabled);
    
    if (selectedRoles.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Selection Required",
        text: "Please select at least one role before updating.",
        confirmButtonColor: "#00ADE5",
      });
      return;
    }

    try {
      setUpdating(true);
      
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user?.userId;

      if (!userId) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "User ID not found. Please login again.",
          confirmButtonColor: "#00ADE5",
        });
        return;
      }

      // Prepare roles data for saving
      // Only send roles that user selected/enabled.
      // This prevents backend from receiving "disabled=false" entries
      // for roles the user did not explicitly select in this request.
      const rolesData = selectedRoles.map((role) => ({
        _id: role.id,
        roleName: role.name,
        enabled: true,
        security: role.security,
        hasOverride: role.hasOverride,
      }));

      // Save roles using settings API
      const response = await settingsAPI.saveSettings("Roles", { roles: rolesData }, userId);

      if (response.errorCode === 0) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Roles Updated!",
          text: `${selectedRoles.length} role(s) have been updated successfully.`,
          timer: 2000,
          showConfirmButton: false,
          confirmButtonColor: "#00ADE5",
        });

        // Refresh roles data after successful update
        await fetchRoles();
      } else {
        throw new Error(response.errorMessage || "Failed to update roles");
      }
    } catch (err) {
      console.error("Error updating roles:", err);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: err.message || "Failed to update roles. Please try again.",
        confirmButtonColor: "#00ADE5",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-[#00ADE5] animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading roles...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-[#00ADE5]/10 rounded-lg">
          <Lock className="text-[#00ADE5]" size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Define Roles And Security
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage role permissions for your league
          </p>
        </div>
      </div>

      {isSuperAdmin && (
        <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-lg">
          <div className="flex items-start">
            <Info className="text-amber-500 mr-2 mt-0.5 flex-shrink-0" size={18} />
            <p className="text-sm text-amber-800">
              <span className="font-semibold">Super Admin account:</span> your
              assigned roles are locked and cannot be changed or disabled.
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="text-red-400 mr-2" size={20} />
            <div>
              <p className="text-red-700 font-medium">Error loading roles</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Roles Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Enabled
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Security
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {roles.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <AlertCircle className="w-12 h-12 text-gray-400 mb-3" />
                      <p className="text-gray-500 font-medium">No roles found</p>
                      <p className="text-gray-400 text-sm mt-1">
                        {error ? "Unable to load roles" : "No roles available"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                roles.map((role) => (
                  <tr
                    key={role.id}
                    className="hover:bg-gray-50 transition-colors duration-100"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">
                          {role.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <label
                        className={`relative inline-flex items-center ${
                          isSuperAdmin
                            ? "cursor-not-allowed opacity-60"
                            : "cursor-pointer"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={role.enabled}
                          onChange={() => handleRoleToggle(role.id)}
                          disabled={isSuperAdmin}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#00ADE5]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00ADE5]"></div>
                      </label>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {role.security}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {role.hasOverride && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Override
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Message */}
      <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
        <div className="flex items-start">
          <Info className="text-blue-400 mr-2 mt-0.5 flex-shrink-0" size={18} />
          <p className="text-sm text-blue-700">
            <span className="font-semibold">Note:</span> Selecting / De-selecting
            the "Referee *" role will enable/disable Referee Assignment for your
            league.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <button
          onClick={handleBack}
          className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-100"
        >
          Back
        </button>
        <button
          onClick={handleUpdate}
          disabled={updating || roles.length === 0 || isSuperAdmin}
          className="px-6 py-3 bg-gradient-to-r from-[#003366] to-[#004080] text-white rounded-xl font-semibold hover:from-[#002244] hover:to-[#003366] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-100 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        >
          {updating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <CheckCircle2 size={20} />
              Update
            </>
          )}
        </button>
      </div>
    </div>
  );
}
