import { Outlet, Navigate } from "react-router-dom";

export default function RbacLayout() {
  return (
    <div className="min-h-[calc(100vh-7rem)] rounded-2xl border border-gray-200/90 bg-white shadow-sm">
      <Outlet />
    </div>
  );
}

export function RbacIndexRedirect() {
  return <Navigate to="/dashboard/rbac/companies" replace />;
}
