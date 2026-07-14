import { useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import Swal from "sweetalert2";
import { accessAPI } from "../../../services/api";

export default function CheckPermission() {
  const [pageKey, setPageKey] = useState("");
  const [permissionKey, setPermissionKey] = useState("view");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!pageKey.trim() || !permissionKey.trim()) {
      Swal.fire({ icon: "warning", title: "Page key and permission key are required" });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await accessAPI.checkPermission(
        pageKey.trim(),
        permissionKey.trim()
      );
      setResult(res.data);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Check failed", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5">
      <div className="mb-5">
        <h2 className="text-base font-bold text-gray-900">Check Permission</h2>
        <p className="mt-0.5 text-sm text-gray-500">
          Test whether your current session has a specific page permission
        </p>
      </div>

      <form onSubmit={handleCheck} className="max-w-lg space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-600">Page Key</label>
          <input
            value={pageKey}
            onChange={(e) => setPageKey(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono"
            placeholder="e.g. leagues"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600">Permission Key</label>
          <select
            value={permissionKey}
            onChange={(e) => setPermissionKey(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          >
            <option value="view">view</option>
            <option value="create">create</option>
            <option value="edit">edit</option>
            <option value="delete">delete</option>
            <option value="export">export</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-[#003366] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
          Check
        </button>
      </form>

      {result && (
        <div
          className={`mt-6 max-w-lg rounded-xl border p-5 ${
            result.allowed
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          <p className="text-sm font-bold text-gray-900">
            {result.allowed ? "Allowed" : "Denied"}
          </p>
          <p className="mt-1 text-sm text-gray-600">
            <span className="font-mono">{result.pageKey || pageKey}</span>
            {" · "}
            <span className="font-mono">{result.permissionKey || permissionKey}</span>
          </p>
        </div>
      )}
    </div>
  );
}
