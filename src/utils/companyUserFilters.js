/** Defaults for GET /company/get-users */
export const DEFAULT_USER_FILTERS = {
  status: "Active",
  role: "All",
  division: "All",
  team: "All",
  userId: "",
};

export const USER_ROLE_FILTER_OPTIONS = [
  "All",
  "League Administrator",
  "Team Administrator",
  "Player",
  "Division Administrator",
  "Referee",
  "Referee Administrator",
];

/**
 * Build query params for GET /company/get-users
 * @see status: Active | Inactive | All
 * @see role: role name (omit when All)
 * @see division: Division/Tournament _id
 * @see team: Team _id
 * @see userId: User _id
 * @see search: firstName, lastName, email, username
 * companyId is appended separately for Super Admin via getActiveCompanyId()
 */
export function buildCompanyUserQuery(filters = {}) {
  const query = {
    status: filters.status || DEFAULT_USER_FILTERS.status,
  };

  const role = filters.role != null ? String(filters.role).trim() : "All";
  if (role && role !== "All") query.role = role;

  const division =
    filters.division != null ? String(filters.division).trim() : "All";
  if (division && division !== "All") query.division = division;

  const team = filters.team != null ? String(filters.team).trim() : "All";
  if (team && team !== "All") query.team = team;

  const search = filters.search != null ? String(filters.search).trim() : "";
  if (search) query.search = search;

  const userId = filters.userId != null ? String(filters.userId).trim() : "";
  if (userId) query.userId = userId;

  return query;
}

export function hasActiveUserFilters(filters = {}, searchQuery = "") {
  return (
    Boolean(searchQuery.trim()) ||
    Boolean(filters.userId?.trim()) ||
    filters.status !== DEFAULT_USER_FILTERS.status ||
    filters.role !== DEFAULT_USER_FILTERS.role ||
    filters.division !== DEFAULT_USER_FILTERS.division ||
    filters.team !== DEFAULT_USER_FILTERS.team
  );
}
