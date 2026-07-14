import { Navigate } from "react-router-dom";
import { ShieldOff } from "lucide-react";
import { usePagePermission } from "../hooks/usePagePermission";

/**
 * Soft gate: requires `view` on the given pageKey.
 * Renders children when allowed; otherwise a compact forbidden state (or redirect).
 */
export default function RequirePageAccess({
  pageKey,
  children,
  redirectTo = null,
  permission = "view",
}) {
  const { can } = usePagePermission(pageKey);
  const allowed = can(permission);

  if (allowed) return children;

  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
        <ShieldOff className="h-7 w-7" />
      </div>
      <h2 className="text-lg font-semibold text-gray-900">Access restricted</h2>
      <p className="mt-2 text-sm text-gray-500">
        You do not have permission to view this page. Contact your league administrator
        if you need access.
      </p>
    </div>
  );
}
