import { useState } from "react";
import { Loader2, UserMinus, UserPlus } from "lucide-react";
import Swal from "sweetalert2";
import { roleAPI } from "../../../services/api";
import { useRbacContext } from "../../../hooks/useRbacContext";
import { useRbacFetch } from "../../../hooks/useRbacFetch";

export default function RoleAssignments({ embedded = false }) {
  const { needsCompany, companiesReady } = useRbacContext();
  const [mode, setMode] = useState("single");
  const [userId, setUserId] = useState("");
  const [roleName, setRoleName] = useState("");
  const [roleNames, setRoleNames] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchEnabled = companiesReady && !needsCompany;

  const { data: roles } = useRbacFetch(
    async () => {
      const res = await roleAPI.getCompanyRoles({ isActive: "true" });
      return Array.isArray(res.data) ? res.data : [];
    },
    [],
    { enabled: fetchEnabled, initialData: [] }
  );

  const toggleRoleName = (name) => {
    setRoleNames((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!userId.trim()) {
      Swal.fire({ icon: "warning", title: "User ID is required" });
      return;
    }
    setSubmitting(true);
    try {
      if (mode === "single") {
        if (!roleName) {
          Swal.fire({ icon: "warning", title: "Select a role" });
          return;
        }
        await roleAPI.assignRole({ userId: userId.trim(), roleName });
      } else {
        if (roleNames.length === 0) {
          Swal.fire({ icon: "warning", title: "Select at least one role" });
          return;
        }
        await roleAPI.assignMultipleRoles({
          userId: userId.trim(),
          roleNames,
        });
      }
      Swal.fire({ icon: "success", title: "Role(s) assigned", timer: 1500, showConfirmButton: false });
      setUserId("");
      setRoleName("");
      setRoleNames([]);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Assign failed", text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async () => {
    if (!userId.trim() || !roleName) {
      Swal.fire({ icon: "warning", title: "User ID and role are required" });
      return;
    }
    const confirm = await Swal.fire({
      title: "Remove role from user?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
    });
    if (!confirm.isConfirmed) return;
    setSubmitting(true);
    try {
      await roleAPI.removeRole({ userId: userId.trim(), roleName });
      Swal.fire({ icon: "success", title: "Role removed", timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Remove failed", text: err.message });
    } finally {
      setSubmitting(false);
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
          "Select a company from the top bar to assign roles."
        )}
      </div>
    );
  }

  return (
    <div className={embedded ? "p-5 sm:p-6" : "p-5"}>
      {!embedded && (
        <div className="mb-5">
          <h2 className="text-base font-bold text-gray-900">Assign Roles</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Assign or remove roles for a user by ID
          </p>
        </div>
      )}

      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setMode("single")}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
            mode === "single"
              ? "bg-[#003366] text-white"
              : "border border-gray-200 text-gray-600"
          }`}
        >
          Single Role
        </button>
        <button
          type="button"
          onClick={() => setMode("multiple")}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
            mode === "multiple"
              ? "bg-[#003366] text-white"
              : "border border-gray-200 text-gray-600"
          }`}
        >
          Multiple Roles
        </button>
      </div>

      <form onSubmit={handleAssign} className="max-w-lg space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-600">User ID</label>
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono"
            placeholder="674a1b2c3d4e5f6789012349"
          />
        </div>

        {mode === "single" ? (
          <div>
            <label className="text-xs font-semibold text-gray-600">Role</label>
            <select
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="">Select role</option>
              {roles.map((r) => (
                <option key={r.roleId || r._id || r.id} value={r.roleName}>
                  {r.roleName}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="text-xs font-semibold text-gray-600">Roles</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {roles.map((r) => (
                <label
                  key={r.roleId || r._id || r.id}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs"
                >
                  <input
                    type="checkbox"
                    checked={roleNames.includes(r.roleName)}
                    onChange={() => toggleRoleName(r.roleName)}
                  />
                  {r.roleName}
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-[#003366] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
            Assign
          </button>
          {mode === "single" && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              <UserMinus size={14} />
              Remove Role
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
