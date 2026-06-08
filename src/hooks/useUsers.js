import { useCallback, useState } from "react";
import { authAPI, companyAPI } from "../services/api";
import { buildCompanyUserQuery } from "../utils/companyUserFilters";

export function mapCompanyUser(user) {
  const lastName = user?.lastName ? String(user.lastName).trim() : "";
  const firstName = user?.firstName ? String(user.firstName).trim() : "";
  const name =
    lastName && firstName
      ? `${lastName}, ${firstName}`
      : lastName || firstName || user?.email || "—";
  const roles = Array.isArray(user?.roles) ? user.roles : [];

  const teams = Array.isArray(user?.teams) ? user.teams : [];
  const divisions = Array.isArray(user?.divisions) ? user.divisions : [];
  const teamNames = Array.isArray(user?.teamNames)
    ? user.teamNames
    : teams.map((team) => team.teamName).filter(Boolean);
  const divisionNames = Array.isArray(user?.divisionNames)
    ? user.divisionNames
    : divisions.map((division) => division.divisionName).filter(Boolean);

  return {
    userId: user?.userId,
    name,
    firstName: user?.firstName,
    lastName: user?.lastName,
    middleInitial: user?.middleInitial,
    email: user?.email,
    username: user?.username,
    dateOfBirth: user?.dateOfBirth,
    roles,
    role: roles.length ? roles.join(", ") : "—",
    teams,
    divisions,
    teamNames,
    divisionNames,
    teamNamesLabel:
      user?.teamNamesLabel ||
      (teamNames.length ? teamNames.join(", ") : "—"),
    divisionNamesLabel:
      user?.divisionNamesLabel ||
      (divisionNames.length ? divisionNames.join(", ") : "—"),
    hasLogin: user?.hasLogin ?? Boolean(user?.username),
    verifiedEmail: Boolean(user?.isVerified),
    sendLoginInvite: user?.sendLoginInvite,
    status: user?.status || "Active",
    loginProvider: user?.loginProvider,
    mobilePhone: user?.mobilePhone,
    workPhone: user?.workPhone,
    homePhone: user?.homePhone,
    contactUsPreference: user?.contactUsPreference,
    internalReference1: user?.internalReference1,
    internalReference2: user?.internalReference2,
    address: user?.address,
    createdAt: user?.createdAt,
    updatedAt: user?.updatedAt,
  };
}

const OBJECT_ID_PATTERN = /^[a-fA-F0-9]{24}$/;

export function buildDivisionNameMap(divisions = []) {
  const map = {};
  for (const division of divisions) {
    const id = String(
      division?.id ?? division?.divisionId ?? division?._id ?? ""
    ).trim();
    const name = String(
      division?.name ??
        division?.divisionName ??
        division?.tournamentName ??
        ""
    ).trim();
    if (id && name) map[id] = name;
  }
  return map;
}

export function formatUserDivisionLabel(user, divisionNameById = {}) {
  if (!user) return "—";

  const fromDivisionObjects = (user.divisions || [])
    .map((division) => {
      const id = String(division.divisionId || division.id || "");
      return division.divisionName || divisionNameById[id] || null;
    })
    .filter(Boolean);

  if (fromDivisionObjects.length > 0) {
    return [...new Set(fromDivisionObjects)].join(", ");
  }

  const rawNames = Array.isArray(user.divisionNames) ? user.divisionNames : [];
  const resolvedFromNames = rawNames
    .map((value) => {
      const token = String(value || "").trim();
      if (!token) return null;
      if (OBJECT_ID_PATTERN.test(token)) {
        return divisionNameById[token] || null;
      }
      return token;
    })
    .filter(Boolean);

  if (resolvedFromNames.length > 0) {
    return [...new Set(resolvedFromNames)].join(", ");
  }

  const label = String(user.divisionNamesLabel || "").trim();
  if (!label || label === "—") return "—";

  return label
    .split(",")
    .map((part) => {
      const token = part.trim();
      if (OBJECT_ID_PATTERN.test(token)) {
        return divisionNameById[token] || token;
      }
      return token;
    })
    .join(", ");
}

export function getUserDivisionItems(user, divisionNameById = {}) {
  if (!user) return [];

  const fromObjects = (user.divisions || [])
    .map((division) => {
      const id = String(division.divisionId || division.id || "").trim();
      const name =
        division.divisionName ||
        divisionNameById[id] ||
        (OBJECT_ID_PATTERN.test(id) ? null : id);
      if (!id && !name) return null;
      return { id: id || name, name: name || id };
    })
    .filter(Boolean);

  if (fromObjects.length > 0) {
    return fromObjects;
  }

  const label = formatUserDivisionLabel(user, divisionNameById);
  if (!label || label === "—") return [];

  return label.split(",").map((part, index) => {
    const name = part.trim();
    return { id: `division-${index}`, name };
  });
}

export function getUserTeamItems(user) {
  if (!user) return [];

  const fromObjects = (user.teams || [])
    .map((team) => {
      const id = String(team.teamId || team.id || "").trim();
      const name = team.teamName || team.name || null;
      if (!id && !name) return null;
      return { id: id || name, name: name || id };
    })
    .filter(Boolean);

  if (fromObjects.length > 0) {
    return fromObjects;
  }

  const label = String(user.teamNamesLabel || "").trim();
  if (!label || label === "—") return [];

  return label.split(",").map((part, index) => {
    const name = part.trim();
    return { id: `team-${index}`, name };
  });
}

export function enrichUserDivisionLabels(user, divisionNameById = {}) {
  if (!user) return user;

  const divisions = (user.divisions || []).map((division) => {
    const id = String(division.divisionId || division.id || "");
    return {
      ...division,
      divisionName:
        division.divisionName || divisionNameById[id] || division.divisionName,
    };
  });
  const divisionNames = divisions.map((d) => d.divisionName).filter(Boolean);

  return {
    ...user,
    divisions,
    divisionNames: divisionNames.length ? divisionNames : user.divisionNames,
    divisionNamesLabel: formatUserDivisionLabel(user, divisionNameById),
  };
}

export function userHasPlayerRole(user) {
  if (!user) return false;
  if (Array.isArray(user.roles) && user.roles.includes("Player")) return true;
  return String(user.role || "")
    .split(",")
    .map((role) => role.trim())
    .includes("Player");
}

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [companyMeta, setCompanyMeta] = useState(null);
  const [appliedFilters, setAppliedFilters] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async (filters = {}) => {
    const query = buildCompanyUserQuery(filters);
    setLoading(true);
    setError(null);

    try {
      const response = await companyAPI.getUsers(query);
      if (Number(response.errorCode) === 0) {
        const payload = response.data || {};
        const rawUsers = Array.isArray(payload.users) ? payload.users : [];
        const mapped = rawUsers.map(mapCompanyUser);

        setCompanyMeta({
          companyId: payload.companyId,
          companyName: payload.companyName,
          domain: payload.domain,
          status: payload.status,
          totalUsers: payload.totalUsers ?? mapped.length,
        });
        setAppliedFilters(payload.filters || query);
        setUsers(mapped);
      } else {
        setError(response.errorMessage || "Failed to load users.");
        setUsers([]);
        setCompanyMeta(null);
        setAppliedFilters(null);
      }
    } catch (err) {
      setError(err.message);
      setUsers([]);
      setCompanyMeta(null);
      setAppliedFilters(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (payload) => {
    try {
      const response = await authAPI.signup(payload);
      if (Number(response.errorCode) === 0) {
        return { success: true, data: response.data };
      }
      return {
        success: false,
        error: response.errorMessage || "Failed to create user.",
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const updateUser = useCallback(async (payload) => {
    try {
      const response = await companyAPI.updateUser(payload);
      if (Number(response.errorCode) === 0) {
        return { success: true, data: response.data };
      }
      return {
        success: false,
        error: response.errorMessage || "Failed to update user.",
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const deleteUser = useCallback(async (userId) => {
    try {
      const response = await companyAPI.deleteUser(userId);
      if (Number(response.errorCode) === 0) {
        return { success: true, data: response.data };
      }
      return {
        success: false,
        error: response.errorMessage || "Failed to delete user.",
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  return {
    users,
    companyMeta,
    appliedFilters,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  };
}
