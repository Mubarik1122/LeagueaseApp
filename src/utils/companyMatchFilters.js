function getCurrentMonthRange() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
  return {
    dateFrom: `${year}-${month}-01`,
    dateTo: `${year}-${month}-${String(lastDay).padStart(2, "0")}`,
  };
}

const monthRange = getCurrentMonthRange();

/** Defaults for GET /company/get-matches */
export const DEFAULT_MATCH_FILTERS = {
  status: "All",
  division: "All",
  venue: "All",
  homeTeam: "All",
  awayTeam: "All",
  dateFrom: monthRange.dateFrom,
  dateTo: monthRange.dateTo,
};

export const MATCH_STATUS_OPTIONS = ["All", "Normal", "Scheduled", "Played"];

/**
 * Build query params for GET /company/get-matches
 * companyId is appended for Super Admin via buildApiUrl()
 */
export function buildCompanyMatchQuery(filters = {}) {
  const query = {};

  const status = filters.status != null ? String(filters.status).trim() : "All";
  if (status && status !== "All") query.status = status;

  const division =
    filters.division != null ? String(filters.division).trim() : "All";
  if (division && division !== "All") query.division = division;

  const venue = filters.venue != null ? String(filters.venue).trim() : "All";
  if (venue && venue !== "All") query.venue = venue;

  const homeTeam =
    filters.homeTeam != null ? String(filters.homeTeam).trim() : "All";
  if (homeTeam && homeTeam !== "All") query.homeTeam = homeTeam;

  const awayTeam =
    filters.awayTeam != null ? String(filters.awayTeam).trim() : "All";
  if (awayTeam && awayTeam !== "All") query.awayTeam = awayTeam;

  const dateFrom =
    filters.dateFrom != null ? String(filters.dateFrom).trim() : "";
  if (dateFrom) query.dateFrom = dateFrom;

  const dateTo = filters.dateTo != null ? String(filters.dateTo).trim() : "";
  if (dateTo) query.dateTo = dateTo;

  return query;
}

export function hasActiveMatchFilters(filters = {}) {
  return (
    filters.status !== DEFAULT_MATCH_FILTERS.status ||
    filters.division !== DEFAULT_MATCH_FILTERS.division ||
    filters.venue !== DEFAULT_MATCH_FILTERS.venue ||
    filters.homeTeam !== DEFAULT_MATCH_FILTERS.homeTeam ||
    filters.awayTeam !== DEFAULT_MATCH_FILTERS.awayTeam ||
    filters.dateFrom !== DEFAULT_MATCH_FILTERS.dateFrom ||
    filters.dateTo !== DEFAULT_MATCH_FILTERS.dateTo
  );
}
