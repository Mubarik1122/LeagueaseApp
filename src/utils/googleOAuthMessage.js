/**
 * Google OAuth popup sends postMessage from the callback page (often frontend or API origin).
 * Success: { token: string }
 * Error:   { error: string, message?: string }
 */

export function parseGoogleOAuthPayload(raw) {
  let data = raw;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      return null;
    }
  }
  if (!data || typeof data !== "object") return null;
  return data;
}

/**
 * Accept postMessage from API origin or current app origin (callback may be either).
 */
export function isTrustedGoogleOAuthOrigin(eventOrigin, apiBaseUrl) {
  if (!eventOrigin || typeof eventOrigin !== "string") return false;

  try {
    const apiOrigin = new URL(apiBaseUrl).origin;
    if (eventOrigin === apiOrigin) return true;
  } catch {
    /* invalid VITE_API_BASE_URL */
  }

  if (typeof window !== "undefined" && eventOrigin === window.location.origin) {
    return true;
  }

  return false;
}

/**
 * True if payload looks like our OAuth result (ignore devtools / other postMessages).
 */
export function isGoogleOAuthResult(data) {
  if (!data || typeof data !== "object") return false;
  if (typeof data.token === "string" && data.token.length > 0) return true;
  if (typeof data.error === "string" && data.error.length > 0) return true;
  return false;
}

const DEFAULT_MESSAGES = {
  UserAlreadyExists:
    "This email is already registered. Please sign in with your email and password.",
  GoogleLoginFailed: "Google sign-in failed. Please try again.",
  GoogleNoEmail: "Google did not return an email for this account.",
};

/**
 * @param {string} code - error code from API
 * @param {string} [message] - optional server message
 */
export function googleOAuthErrorText(code, message) {
  const trimmed = typeof message === "string" ? message.trim() : "";
  if (trimmed) return trimmed;
  return DEFAULT_MESSAGES[code] || DEFAULT_MESSAGES.GoogleLoginFailed;
}
