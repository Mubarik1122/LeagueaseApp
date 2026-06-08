import { createContext, useContext, useEffect, useState } from "react";
import { companyAPI } from "../services/api";
import { useAuthContext } from "./AuthContext";
import {
  getStoredCompanyId,
  isSuperAdminUser,
  setStoredCompanyId,
} from "../utils/companySelection";

const CompanyContext = createContext({
  isSuperAdmin: false,
  companies: [],
  selectedCompanyId: null,
  selectedCompany: null,
  setSelectedCompanyId: () => {},
  loadingCompanies: false,
  companiesReady: true,
  refreshCompanies: async () => {},
});

export function CompanyProvider({ children }) {
  const { user, isAuthenticated } = useAuthContext();
  const isSuperAdmin = isSuperAdminUser(user);
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyIdState] = useState(
    () => getStoredCompanyId()
  );
  const [loadingCompanies, setLoadingCompanies] = useState(
    () => isAuthenticated && isSuperAdmin
  );
  const [companiesReady, setCompaniesReady] = useState(
    () => !(isAuthenticated && isSuperAdmin)
  );

  const refreshCompanies = async () => {
    if (!isAuthenticated || !isSuperAdmin) {
      setCompanies([]);
      setCompaniesReady(true);
      return;
    }

    setLoadingCompanies(true);
    setCompaniesReady(false);
    try {
      const response = await companyAPI.getAll();
      const list = Array.isArray(response.data) ? response.data : [];
      setCompanies(list);

      const storedId = getStoredCompanyId();
      const storedStillValid = list.some(
        (company) => company.companyId === storedId
      );

      if (storedStillValid) {
        setSelectedCompanyIdState((prev) =>
          prev === storedId ? prev : storedId
        );
      } else if (list.length > 0) {
        const firstId = list[0].companyId;
        setStoredCompanyId(firstId);
        setSelectedCompanyIdState((prev) =>
          prev === firstId ? prev : firstId
        );
      } else {
        setStoredCompanyId(null);
        setSelectedCompanyIdState((prev) => (prev === null ? prev : null));
      }
    } catch (error) {
      console.error("Failed to load companies:", error);
      setCompanies([]);
    } finally {
      setLoadingCompanies(false);
      setCompaniesReady(true);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !isSuperAdmin) {
      setCompanies([]);
      setSelectedCompanyIdState(null);
      setLoadingCompanies(false);
      setCompaniesReady(true);
      return;
    }
    setLoadingCompanies(true);
    setCompaniesReady(false);
    refreshCompanies();
  }, [isAuthenticated, isSuperAdmin, user?.userId]);

  const setSelectedCompanyId = (companyId) => {
    const normalized =
      companyId != null && String(companyId).trim() !== ""
        ? String(companyId).trim()
        : null;
    setSelectedCompanyIdState((prev) => {
      if (prev === normalized) return prev;
      setStoredCompanyId(normalized);
      return normalized;
    });
  };

  const selectedCompany =
    companies.find((company) => company.companyId === selectedCompanyId) ||
    null;

  return (
    <CompanyContext.Provider
      value={{
        isSuperAdmin,
        companies,
        selectedCompanyId: isSuperAdmin ? selectedCompanyId : null,
        selectedCompany,
        setSelectedCompanyId,
        loadingCompanies,
        companiesReady,
        refreshCompanies,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompanyContext() {
  return useContext(CompanyContext);
}
