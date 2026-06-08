const STORAGE_KEY = "selectedCompanyId";

export function isSuperAdminUser(user) {
  if (!user || typeof user !== "object") return false;
  if (user.isSuperAdmin === true) return true;
  return Array.isArray(user.roles)
    ? user.roles.some(
        (role) => String(role).trim().toLowerCase() === "super admin"
      )
    : false;
}

export function getStoredCompanyId() {
  const value = localStorage.getItem(STORAGE_KEY);
  return value && String(value).trim() ? String(value).trim() : null;
}

export function setStoredCompanyId(companyId) {
  if (companyId != null && String(companyId).trim() !== "") {
    localStorage.setItem(STORAGE_KEY, String(companyId).trim());
    return;
  }
  localStorage.removeItem(STORAGE_KEY);
}

export function clearStoredCompanyId() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getSessionUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}

/** Active company for API calls: Super Admin uses header selection; others use JWT companyId. */
export function getActiveCompanyId() {
  const user = getSessionUser();
  if (isSuperAdminUser(user)) {
    return getStoredCompanyId();
  }
  return user.companyId != null && String(user.companyId).trim() !== ""
    ? String(user.companyId).trim()
    : null;
}
