import { useCallback, useEffect, useState } from "react";
import { matchAPI } from "../services/api";
import { useCompanyContext } from "../context/CompanyContext";

export function normalizePointType(item) {
  return {
    ...item,
    id: item._id || item.id || item.pointId,
  };
}

export function sortPointTypes(items) {
  return [...items].sort(
    (a, b) => (Number(a.sequence) || 1) - (Number(b.sequence) || 1)
  );
}

export function usePointTypes(userId) {
  const { isSuperAdmin, selectedCompanyId, companiesReady } =
    useCompanyContext();

  const [pointTypes, setPointTypes] = useState([]);
  const [predefinedTypes, setPredefinedTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [predefinedLoading, setPredefinedLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPointTypes = useCallback(async () => {
    if (!userId) {
      setPointTypes([]);
      setLoading(false);
      return [];
    }

    if (isSuperAdmin && (!companiesReady || !selectedCompanyId)) {
      setPointTypes([]);
      setLoading(false);
      return [];
    }

    setLoading(true);
    setError(null);
    try {
      const response = await matchAPI.getAllPointTypes(userId);
      const items = Array.isArray(response?.data)
        ? sortPointTypes(response.data.map(normalizePointType))
        : [];
      setPointTypes(items);
      return items;
    } catch (err) {
      setError(err.message || "Could not load stat types.");
      setPointTypes([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [userId, isSuperAdmin, selectedCompanyId, companiesReady]);

  const loadPredefinedTypes = useCallback(async () => {
    setPredefinedLoading(true);
    try {
      const response = await matchAPI.getPredefinedPointTypes();
      setPredefinedTypes(Array.isArray(response?.data) ? response.data : []);
    } catch {
      setPredefinedTypes([]);
    } finally {
      setPredefinedLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPointTypes();
  }, [loadPointTypes]);

  useEffect(() => {
    loadPredefinedTypes();
  }, [loadPredefinedTypes]);

  return {
    pointTypes,
    predefinedTypes,
    loading,
    predefinedLoading,
    error,
    refresh: loadPointTypes,
    companiesReady,
    waitingForCompany: isSuperAdmin && (!companiesReady || !selectedCompanyId),
  };
}
