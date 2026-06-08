import { useCallback, useEffect, useRef, useState } from "react";
import { companyAPI } from "../services/api";
import { useCompanyContext } from "../context/CompanyContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const IDLE_CHECK = { status: "idle", message: "" };

export function useCompanyUserFieldCheck(options = {}) {
  const { excludeUserId = null } = options;
  const { isSuperAdmin, selectedCompanyId, companiesReady } =
    useCompanyContext();
  const [checks, setChecks] = useState({});
  const timersRef = useRef({});
  const requestsRef = useRef({});

  const patchCheck = useCallback((key, patch) => {
    setChecks((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || IDLE_CHECK), ...patch },
    }));
  }, []);

  const clearCheck = useCallback((key) => {
    setChecks((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const checkExists = useCallback(
    async (field, value, key) => {
      const trimmed = String(value || "").trim();

      if (!trimmed) {
        clearCheck(key);
        return;
      }

      if (field === "email" && !EMAIL_RE.test(trimmed)) {
        patchCheck(key, {
          status: "invalid",
          message: "Enter a valid email address.",
        });
        return;
      }

      if (isSuperAdmin && (!companiesReady || !selectedCompanyId)) {
        patchCheck(key, {
          status: "error",
          message: "Select a company before checking.",
        });
        return;
      }

      const requestId = Symbol();
      requestsRef.current[key] = requestId;
      patchCheck(key, { status: "checking", message: "Checking availability…" });

      try {
        const payload =
          field === "email"
            ? { email: trimmed.toLowerCase() }
            : { username: trimmed };

        if (excludeUserId) {
          payload.userId = excludeUserId;
        }

        const response = await companyAPI.checkUserExists(payload);
        if (requestsRef.current[key] !== requestId) return;

        const data = response.data || {};
        if (data.exists) {
          patchCheck(key, {
            status: "taken",
            message:
              data.message ||
              (field === "email"
                ? "Email already exists in this company."
                : "Username already exists in this company."),
          });
        } else {
          patchCheck(key, {
            status: "available",
            message:
              data.message ||
              (field === "email"
                ? "Email is available."
                : "Username is available."),
          });
        }
      } catch (error) {
        if (requestsRef.current[key] !== requestId) return;
        patchCheck(key, {
          status: "error",
          message: error.message || "Could not verify availability.",
        });
      }
    },
    [
      clearCheck,
      excludeUserId,
      isSuperAdmin,
      patchCheck,
      selectedCompanyId,
      companiesReady,
    ]
  );

  const scheduleCheck = useCallback(
    (key, field, value, delay = 450) => {
      if (timersRef.current[key]) {
        clearTimeout(timersRef.current[key]);
      }

      const trimmed = String(value || "").trim();
      if (!trimmed) {
        clearCheck(key);
        return;
      }

      patchCheck(key, { status: "pending", message: "" });
      timersRef.current[key] = setTimeout(() => {
        checkExists(field, value, key);
      }, delay);
    },
    [checkExists, clearCheck, patchCheck]
  );

  const setLocalCheck = useCallback(
    (key, status, message) => {
      if (timersRef.current[key]) {
        clearTimeout(timersRef.current[key]);
        delete timersRef.current[key];
      }
      delete requestsRef.current[key];
      patchCheck(key, { status, message });
    },
    [patchCheck]
  );

  const getCheck = useCallback(
    (key) => checks[key] || IDLE_CHECK,
    [checks]
  );

  const hasSaveBlockingChecks = useCallback(() => {
    return Object.values(checks).some((check) =>
      ["taken", "checking", "pending", "invalid"].includes(check.status)
    );
  }, [checks]);

  const clearChecks = useCallback(() => {
    Object.values(timersRef.current).forEach(clearTimeout);
    timersRef.current = {};
    requestsRef.current = {};
    setChecks({});
  }, []);

  useEffect(
    () => () => {
      Object.values(timersRef.current).forEach(clearTimeout);
    },
    []
  );

  return {
    scheduleCheck,
    setLocalCheck,
    getCheck,
    clearCheck,
    hasSaveBlockingChecks,
    clearChecks,
  };
}
