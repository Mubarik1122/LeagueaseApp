/** Normalize a company domain / host into an absolute https URL. */
export function normalizeWebsiteUrl(domain) {
  const raw = String(domain || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw.replace(/^\/+/, "")}`;
}

/** Best-effort company domain from the logged-in user payload. */
export function resolveUserCompanyDomain(user) {
  if (!user || typeof user !== "object") return "";
  const company =
    user.company && typeof user.company === "object" ? user.company : null;

  return (
    user.domain ||
    user.companyDomain ||
    user.websiteUrl ||
    user.website ||
    user.domainName ||
    company?.domain ||
    company?.companyDomain ||
    company?.websiteUrl ||
    ""
  );
}

/** Extract domain from GET /company/me (or similar) payload. */
export function domainFromCompanyPayload(payload) {
  if (!payload || typeof payload !== "object") return "";
  const company =
    payload.company && typeof payload.company === "object"
      ? payload.company
      : null;
  return (
    payload.domain ||
    payload.companyDomain ||
    payload.websiteUrl ||
    payload.domainName ||
    company?.domain ||
    company?.companyDomain ||
    ""
  );
}
