import { useState, useEffect } from "react";
import { authAPI } from "../services/api";
import { hydrateUserFromTokenIfNeeded } from "../utils/jwtSession";
import {
  isPlayerOnlyWebRoles,
  WEB_PORTAL_PLAYER_ONLY_MESSAGE,
} from "../utils/webPortalAccess";
import { clearStoredCompanyId } from "../utils/companySelection";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    let userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (isPlayerOnlyWebRoles(parsedUser.roles)) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        } else {
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    } else if (token) {
      /* Google OAuth (and similar) often only persist `token` — derive `user` from JWT */
      const hydrated = hydrateUserFromTokenIfNeeded(token);
      if (hydrated) {
        if (isPlayerOnlyWebRoles(hydrated.roles)) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        } else {
          setUser(hydrated);
          setIsAuthenticated(true);
        }
      }
    }

    setLoading(false);
  }, []);

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
        };

        if (isPlayerOnlyWebRoles(userWithRoles.roles)) {
          return { success: false, error: WEB_PORTAL_PLAYER_ONLY_MESSAGE };
        }

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userWithRoles));

        setUser(userWithRoles);
        setIsAuthenticated(true);

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
    login,
    logout,
    signup,
  };
};
