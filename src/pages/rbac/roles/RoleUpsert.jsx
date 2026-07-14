import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

/** Legacy route — redirects to Role Directory with drawer query params */
export default function RoleUpsert() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleId = searchParams.get("roleId");

  useEffect(() => {
    const params = new URLSearchParams();
    if (roleId) params.set("roleId", roleId);
    else params.set("create", "true");
    navigate(`/dashboard/rbac/roles?${params.toString()}`, { replace: true });
  }, [navigate, roleId]);

  return null;
}
