import { Loader2, RefreshCw } from "lucide-react";
import Swal from "sweetalert2";
import { accessAPI } from "../../../services/api";
import { useRbacFetch } from "../../../hooks/useRbacFetch";

export default function MyAccess() {
  const {
    data: profile,
    loading,
    reload: load,
  } = useRbacFetch(
    async () => {
      const res = await accessAPI.getMyAccess();
      return res.data;
    },
    [],
    { initialData: null }
  );

  return (
    <div className="p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">My Access</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Your effective platform access and page permissions
          </p>
        </div>
        <button
          type="button"
          onClick={() => load().catch((err) => {
            Swal.fire({ icon: "error", title: "Failed to load access", text: err.message });
          })}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-[#003366]" size={28} />
        </div>
      ) : profile ? (
        <div className="space-y-5">
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

          <div>
            <h3 className="text-sm font-bold text-gray-800">Page Permissions</h3>
            {Array.isArray(profile.pages) && profile.pages.length > 0 ? (
              <div className="mt-3 overflow-x-auto rounded-xl border border-gray-100">
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
              <p className="mt-2 text-sm text-gray-500">No page permissions assigned.</p>
            )}
          </div>

          {profile.pageKeyMap && Object.keys(profile.pageKeyMap).length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-800">Page Key Map</h3>
              <pre className="mt-2 overflow-x-auto rounded-xl border border-gray-100 bg-gray-50 p-4 text-xs text-gray-700">
                {JSON.stringify(profile.pageKeyMap, null, 2)}
              </pre>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
