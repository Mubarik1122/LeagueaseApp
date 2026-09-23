import { useCallback, useState } from "react";
import { companyAPI } from "../services/api";
import { buildCompanyMatchQuery } from "../utils/companyMatchFilters";

export function mapCompanyMatch(match) {
  const divisions = Array.isArray(match?.divisions) ? match.divisions : [];
  const divisionNames = divisions
    .map((division) => division.divisionName)
    .filter(Boolean);

  return {
    matchId: match?.matchId,
    dateTime: match?.dateTime,
    status: match?.status || "Normal",
    dateStatus: match?.dateStatus,
    homeTeam: match?.homeTeam,
    awayTeam: match?.awayTeam,
    venue: match?.venue,
    divisions,
    divisionNamesLabel:
      divisionNames.length > 0
        ? divisionNames.join(", ")
        : divisions.map((d) => d.divisionId).join(", ") || "—",
    homeTeamName: match?.homeTeam?.teamName || "—",
    awayTeamName: match?.awayTeam?.teamName || "—",
    venueName: match?.venue?.venueName || "—",
    homeScore: match?.homeScore,
    awayScore: match?.awayScore,
    note: match?.note,
    displayNote: Boolean(match?.displayNote),
    scoreLocked: Boolean(match?.scoreLocked),
    homeStatsLocked: Boolean(match?.homeStatsLocked),
    awayStatsLocked: Boolean(match?.awayStatsLocked),
    resultApproved: Boolean(
      match?.resultApproved ?? match?.approved ?? match?.isApproved
    ),
    homeStatsEntered:
      Boolean(match?.homeStatsEntered ?? match?.hasHomeStats) ||
      Number(match?.homeStatsCount) > 0 ||
      Boolean(match?.homeTeam?.hasStats),
    awayStatsEntered:
      Boolean(
        match?.awayStatsEntered ?? match?.hasAwayStats ?? match?.hasRoadStats
      ) ||
      Number(match?.awayStatsCount) > 0 ||
      Boolean(match?.awayTeam?.hasStats),
  };
}

export function useCompanyMatches() {
  const [matches, setMatches] = useState([]);
  const [companyMeta, setCompanyMeta] = useState(null);
  const [appliedFilters, setAppliedFilters] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMatches = useCallback(async (filters = {}) => {
    const query = buildCompanyMatchQuery(filters);
    setLoading(true);
    setError(null);

    try {
      const response = await companyAPI.getMatches(query);
      if (Number(response.errorCode) === 0) {
        const payload = response.data || {};
        const rawMatches = Array.isArray(payload.matches) ? payload.matches : [];
        const mapped = rawMatches.map(mapCompanyMatch);

        setCompanyMeta({
          companyId: payload.companyId,
          companyName: payload.companyName,
          totalMatches: payload.totalMatches ?? mapped.length,
        });
        setAppliedFilters(payload.filters || query);
        setMatches(mapped);
      } else {
        setError(response.errorMessage || "Failed to load matches.");
        setMatches([]);
        setCompanyMeta(null);
        setAppliedFilters(null);
      }
    } catch (err) {
      setError(err.message);
      setMatches([]);
      setCompanyMeta(null);
      setAppliedFilters(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    matches,
    companyMeta,
    appliedFilters,
    loading,
    error,
    fetchMatches,
  };
}
