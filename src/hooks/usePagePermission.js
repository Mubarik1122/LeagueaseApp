import { useMemo } from "react";
import { useAuthContext } from "../context/AuthContext";
import { hasPagePermission } from "../utils/userNavigation";

/**
 * Page-level RBAC flags from the login payload (`pageKeyMap` / pages / platforms).
 * Super Admin always has full access.
 *
 * @param {string} pageKey - API pageKey e.g. "users", "venues", "competitions"
 */
export function usePagePermission(pageKey) {
  const { user } = useAuthContext();

  return useMemo(() => {
    const can = (action) => hasPagePermission(user, pageKey, action);
    return {
      canView: can("view"),
      canAdd: can("add"),
      canEdit: can("edit"),
      canDelete: can("delete"),
      can,
      pageKey,
      user,
    };
  }, [user, pageKey]);
}

export default usePagePermission;
