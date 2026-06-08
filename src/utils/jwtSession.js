/**
 * Read JWT payload (no signature verify — same as typical SPA session bootstrap).
 * Used when only `token` is stored (e.g. Google OAuth) and `user` was never set.
 */

export function decodeJwtPayload(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );
    const json = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Build the minimal `user` object the app expects (see localStorage `user` usage).
 * Adjust claim names if your backend JWT uses different keys.
 */
export function buildSessionUserFromJwtPayload(payload) {
  if (!payload || typeof payload !== "object") return null;

  const userId =
    payload.userId ??
    payload.user_id ??
    payload.id ??
    payload.sub ??
    payload.userID;

  if (userId == null || userId === "") return null;

  let roles;
  if (Array.isArray(payload.roles)) {
    roles = payload.roles;
  } else if (payload.role != null && payload.role !== "") {
    roles = [payload.role];
  }

  const isSuperAdmin =
    payload.isSuperAdmin === true ||
    (Array.isArray(roles) &&
      roles.some((role) => String(role).trim().toLowerCase() === "super admin"));

  return {
    userId: String(userId),
    ...(payload.email && { email: payload.email }),
    ...(payload.username && { username: payload.username }),
    ...(payload.userName && { username: payload.userName }),
    ...(roles && { roles }),
    ...(isSuperAdmin && { isSuperAdmin: true }),
  };
}

/**
 * Persist `user` in localStorage from Bearer token if missing.
 * @returns {object|null} session user or null
 */
export function hydrateUserFromTokenIfNeeded(token) {
  if (!token) return null;
  const existing = localStorage.getItem("user");
  if (existing) {
    try {
      const u = JSON.parse(existing);
      if (u && (u.userId || u._id || u.id)) return u;
    } catch {
      /* fall through */
    }
  }

  const payload = decodeJwtPayload(token);
  const user = buildSessionUserFromJwtPayload(payload);
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
    return user;
  }
  return null;
}
