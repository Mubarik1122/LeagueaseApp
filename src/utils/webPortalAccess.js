/**
 * Web app is for league admins / staff. Pure Player accounts use the mobile app only.
 */

export const WEB_PORTAL_PLAYER_ONLY_MESSAGE =
  "You are registered as a Player. This web portal is not available for Player accounts. Please sign in using the mobile app.";

/**
 * @param {unknown} roles - from API `user.roles` e.g. ["Player"] or ["Player", "League Administrator"]
 * @returns {true} if user must be blocked from web (only Player role(s), no admin/staff role)
 */
export function isPlayerOnlyWebRoles(roles) {
  if (!Array.isArray(roles) || roles.length === 0) return false;

  const normalized = roles.map((r) => String(r).trim().toLowerCase());
  const hasNonPlayer = normalized.some((r) => r !== "player");
  return !hasNonPlayer;
}
