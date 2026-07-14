import { useState } from "react";
import { Loader2, Search } from "lucide-react";
import Swal from "sweetalert2";
import { accessAPI } from "../../../services/api";

export default function UserAccess() {
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!userId.trim()) {
      Swal.fire({ icon: "warning", title: "User ID is required" });
      return;
    }
    setLoading(true);
    setProfile(null);
    try {
      const res = await accessAPI.getUserAccess(userId.trim());
      setProfile(res.data);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Lookup failed", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5">
      <div className="mb-5">
        <h2 className="text-base font-bold text-gray-900">User Access</h2>
        <p className="mt-0.5 text-sm text-gray-500">
          View effective access profile for a specific user
        </p>
      </div>

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
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-[#003366] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
          Search
        </button>
      </form>

      {profile && (
        <div className="mt-6 space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase text-gray-500">Super Admin</p>
              <p className="mt-1 text-lg font-bold text-gray-900">
                {profile.isSuperAdmin ? "Yes" : "No"}
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase text-gray-500">Website</p>
              <p className="mt-1 text-lg font-bold text-gray-900">
                {profile.platformAccess?.website ? "Allowed" : "Denied"}
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase text-gray-500">Mobile</p>
              <p className="mt-1 text-lg font-bold text-gray-900">
                {profile.platformAccess?.mobile ? "Allowed" : "Denied"}
              </p>
            </div>
          </div>

          {Array.isArray(profile.pages) && profile.pages.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Page</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Key</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Permissions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white">
                  {profile.pages.map((page) => (
                    <tr key={page.pageId || page.pageKey}>
                      <td className="px-4 py-3 font-medium text-gray-900">{page.pageName}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{page.pageKey}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {(page.permissions || []).join(", ") || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No page permissions for this user.</p>
          )}
        </div>
      )}
    </div>
  );
}
