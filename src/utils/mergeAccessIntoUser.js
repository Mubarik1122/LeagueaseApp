/**
 * Merge /access/my-access (or login access fields) into the session user object.
 * Preserves identity fields when the access payload omits them.
 */
export function mergeAccessIntoUser(currentUser, accessPayload) {
  const base =
    currentUser && typeof currentUser === "object" ? { ...currentUser } : {};
  const data =
    accessPayload && typeof accessPayload === "object" ? accessPayload : null;
  if (!data) return base;

  const next = { ...base };

  if (Array.isArray(data.roles)) next.roles = data.roles;
  if (typeof data.isSuperAdmin === "boolean") {
    next.isSuperAdmin = data.isSuperAdmin;
  } else if (data.isSuperAdmin === true || base.isSuperAdmin === true) {
    next.isSuperAdmin = true;
  }

  if (data.companyId != null) next.companyId = data.companyId;
  if (data.platformKey != null) next.platformKey = data.platformKey;
  if (data.platformSlug != null) next.platformSlug = data.platformSlug;
  if (data.platformAccess != null) next.platformAccess = data.platformAccess;

  // Always replace nav/access trees when the API sends them (clone → new refs for React)
  if (Array.isArray(data.platforms)) {
    next.platforms =
      typeof structuredClone === "function"
        ? structuredClone(data.platforms)
        : JSON.parse(JSON.stringify(data.platforms));
  }
  if (Array.isArray(data.pages)) {
    next.pages =
      typeof structuredClone === "function"
        ? structuredClone(data.pages)
        : JSON.parse(JSON.stringify(data.pages));
  } else if (data.pages != null) {
    next.pages = data.pages;
  }
  if (Array.isArray(data.permissions)) {
    next.permissions = [...data.permissions];
  }

  if (data.pageKeyMap && typeof data.pageKeyMap === "object") {
    next.pageKeyMap = { ...data.pageKeyMap };
  } else if (Array.isArray(next.pages) && next.pages.length > 0) {
    // Derive pageKeyMap from pages if API omitted it
    const map = {};
    next.pages.forEach((page) => {
      const key = String(page?.pageKey || page?.key || "").trim();
      if (!key) return;
      map[key] = Array.isArray(page.permissions)
        ? page.permissions.map((p) => String(p).trim().toLowerCase())
        : [];
    });
    if (Object.keys(map).length > 0) next.pageKeyMap = map;
  }

  // Bump so sidebar/menu consumers get a reliable change signal
  next.accessRevision = (Number(base.accessRevision) || 0) + 1;
  next.accessSyncedAt = Date.now();

  return next;
}
