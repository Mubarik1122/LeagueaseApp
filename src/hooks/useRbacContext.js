import { useCompanyContext } from "../context/CompanyContext";
import { useAuthContext } from "../context/AuthContext";
import { isSuperAdminUser } from "../utils/companySelection";

export function useRbacContext() {
  const { user } = useAuthContext();
  const {
    isSuperAdmin,
    selectedCompanyId,
    companies,
    companiesReady,
    loadingCompanies,
  } = useCompanyContext();

  const superAdmin = isSuperAdmin || isSuperAdminUser(user);
  const effectiveCompanyId = superAdmin
    ? selectedCompanyId
    : user?.companyId ?? null;

  return {
    user,
    isSuperAdmin: superAdmin,
    companyId: effectiveCompanyId,
    companies,
    companiesReady,
    loadingCompanies,
    needsCompany: superAdmin && !effectiveCompanyId,
  };
}
