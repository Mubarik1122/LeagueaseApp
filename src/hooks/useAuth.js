import { useState, useEffect, useCallback, useRef } from "react";
import { authAPI, accessAPI } from "../services/api";
import { hydrateUserFromTokenIfNeeded } from "../utils/jwtSession";
import { clearStoredCompanyId } from "../utils/companySelection";
import { mergeAccessIntoUser } from "../utils/mergeAccessIntoUser";

const ACCESS_REFRESH_MIN_MS = 20_000;

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessRefreshing, setAccessRefreshing] = useState(false);
  const lastAccessRefreshAt = useRef(0);
  const userRef = useRef(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const persistUser = useCallback((nextUser) => {
    userRef.current = nextUser;
    setUser(nextUser);
    if (nextUser) {
      localStorage.setItem("user", JSON.stringify(nextUser));
    }
  }, []);

  /**
   * Reload effective permissions / pages from GET /access/my-access
   * so Super Admin grants apply without requiring full re-login.
   */
  const refreshAccess = useCallback(
    async (options = {}) => {
      const force = Boolean(options.force);
      const token = localStorage.getItem("token");
      if (!token) {
        return { success: false, error: "Not authenticated" };
      }

      const now = Date.now();
      if (
        !force &&
        lastAccessRefreshAt.current &&
        now - lastAccessRefreshAt.current < ACCESS_REFRESH_MIN_MS
      ) {
        return { success: true, skipped: true, user: userRef.current };
      }

      setAccessRefreshing(true);
      try {
        const response = await accessAPI.getMyAccess();
        lastAccessRefreshAt.current = Date.now();

        const accessData = response?.data ?? response;
        // Guard: some gateways wrap twice
        const payload =
          accessData?.data &&
          typeof accessData.data === "object" &&
          (accessData.data.platforms || accessData.data.pageKeyMap)
            ? accessData.data
            : accessData;

        const current =
          userRef.current ||
          (() => {
            try {
              return JSON.parse(localStorage.getItem("user") || "null");
            } catch {
              return null;
            }
          })();

        const merged = mergeAccessIntoUser(current, payload);
        persistUser(merged);
        setIsAuthenticated(true);
        return { success: true, user: merged };
      } catch (error) {
        return {
          success: false,
          error: error?.message || "Failed to refresh access",
        };
      } finally {
        setAccessRefreshing(false);
      }
    },
    [persistUser]
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    let userData = localStorage.getItem("user");
    let restored = false;

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        userRef.current = parsedUser;
        setIsAuthenticated(true);
        restored = true;
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    } else if (token) {
      const hydrated = hydrateUserFromTokenIfNeeded(token);
      if (hydrated) {
        setUser(hydrated);
        userRef.current = hydrated;
        setIsAuthenticated(true);
        restored = true;
      }
    }

    setLoading(false);

    if (restored) {
      refreshAccess({ force: true }).catch(() => {});
    }
  }, [refreshAccess]);

  // When user returns to the tab, pick up newly granted permissions
  useEffect(() => {
    if (!isAuthenticated) return undefined;

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        refreshAccess().catch(() => {});
      }
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [isAuthenticated, refreshAccess]);

  const login = async (identifier, password, leagueId = null) => {
    try {
      const response = await authAPI.login(identifier, password, leagueId);

      if (response.errorCode === 0) {
        const { token, user: userData } = response.data;
        if (!userData || typeof userData !== "object") {
          return { success: false, error: "Invalid login response from server." };
        }

        const userWithRoles = {
          ...userData,
          roles: userData.roles ?? response.data.roles,
          isSuperAdmin:
            userData.isSuperAdmin === true || response.data.isSuperAdmin === true,
          companyId: userData.companyId ?? response.data.companyId ?? null,
          platformKey: userData.platformKey ?? response.data.platformKey ?? "web",
          platformSlug: userData.platformSlug ?? response.data.platformSlug ?? "web",
          platformAccess:
            userData.platformAccess ?? response.data.platformAccess ?? null,
          platforms: Array.isArray(userData.platforms) ? userData.platforms : [],
          pages: userData.pages ?? response.data.pages ?? [],
          permissions: Array.isArray(userData.permissions)
            ? userData.permissions
            : [],
          pageKeyMap:
            userData.pageKeyMap && typeof userData.pageKeyMap === "object"
              ? userData.pageKeyMap
              : {},
        };

        localStorage.setItem("token", token);
        persistUser(userWithRoles);
        setIsAuthenticated(true);
        lastAccessRefreshAt.current = Date.now();

        return { success: true, data: { ...response.data, user: userWithRoles } };
      } else {
        return { success: false, error: response.errorMessage };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    clearStoredCompanyId();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("rememberMe");
    localStorage.removeItem("rememberUntil");
    localStorage.removeItem("Username");
    localStorage.removeItem("Key");

    userRef.current = null;
    lastAccessRefreshAt.current = 0;
    setUser(null);
    setIsAuthenticated(false);
  };

  const signup = async (userData) => {
    try {
      const response = await authAPI.signup(userData);
      return { success: response.errorCode === 0, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return {
    user,
    loading,
    isAuthenticated,
    accessRefreshing,
    login,
    logout,
    signup,
    refreshAccess,
  };
};
