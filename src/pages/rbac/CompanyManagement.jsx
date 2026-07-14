import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Check,
  Hash,
  Laptop,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  UserCog,
  Users,
} from "lucide-react";
import clsx from "clsx";
import Swal from "sweetalert2";
import { useCompanyContext } from "../../context/CompanyContext";
import { useRbacContext } from "../../hooks/useRbacContext";
import { useRbacFetch } from "../../hooks/useRbacFetch";
import { companyAPI, roleAPI } from "../../services/api";
import CompanyFormDrawer from "../../components/rbac/CompanyFormDrawer";
import { RbacPageHeader, RbacCard } from "../../components/rbac/RbacContent";
import {
  RbacBadge,
  rbacBtnPrimary,
  rbacBtnSecondary,
  rbacSelect,
} from "../../components/rbac/rbacTheme";

const QUICK_LINKS = [
  {
    label: "Role Management",
    path: "/dashboard/rbac/roles",
    icon: UserCog,
    description: "Create and edit roles",
  },
  {
    label: "Platform Management",
    path: "/dashboard/rbac/platforms",
    icon: Laptop,
    description: "Website & mobile access",
  },
];

const emptyForm = {
  companyId: "",
  companyName: "",
  domain: "",
  status: "Active",
};

function companyInitials(name) {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function shortId(id) {
  if (!id) return "—";
  const s = String(id);
  return s.length > 14 ? `${s.slice(0, 6)}…${s.slice(-6)}` : s;
}

function getCompanyId(company) {
  return company?.companyId || company?._id || company?.id || "";
}

function StatCard({ icon: Icon, label, value, hint, accent = "cyan" }) {
  const accents = {
    cyan: "from-[#00ADE5]/12 to-white text-[#00ADE5]",
    navy: "from-[#003366]/10 to-white text-[#003366]",
    emerald: "from-emerald-50 to-white text-emerald-600",
    slate: "from-slate-100 to-white text-slate-600",
  };

  return (
    <RbacCard className="overflow-hidden">
      <div className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-gray-900">
            {value}
          </p>
          {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
        </div>
        <span
          className={clsx(
            "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br",
            accents[accent] || accents.cyan
          )}
        >
          <Icon size={20} strokeWidth={2} />
        </span>
      </div>
    </RbacCard>
  );
}

export default function CompanyManagement() {
  const { isSuperAdmin, companyId, needsCompany, user } = useRbacContext();
  const {
    companies,
    selectedCompanyId,
    selectedCompany,
    setSelectedCompanyId,
    loadingCompanies,
    refreshCompanies,
    companiesReady,
  } = useCompanyContext();

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchEnabled = companiesReady && !needsCompany;

  const { data: roles, loading: rolesLoading } = useRbacFetch(
    async () => {
      const res = await roleAPI.getCompanyRoles({ includeUserCount: "true" });
      return Array.isArray(res.data) ? res.data : [];
    },
    [companyId],
    { enabled: fetchEnabled, initialData: [] }
  );

  const stats = useMemo(() => {
    const list = roles || [];
    return {
      total: list.length,
      active: list.filter((r) => r.isActive !== false).length,
      system: list.filter((r) => r.isSystemRole).length,
      company: list.filter((r) => !r.isSystemRole).length,
      users: list.reduce((sum, r) => sum + (Number(r.userCount) || 0), 0),
    };
  }, [roles]);

  const filteredCompanies = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter((c) => {
      const name = (c.companyName || c.name || "").toLowerCase();
      const id = String(getCompanyId(c)).toLowerCase();
      const domain = String(c.domain || "").toLowerCase();
      return name.includes(q) || id.includes(q) || domain.includes(q);
    });
  }, [companies, search]);

  const displayName =
    selectedCompany?.companyName ||
    selectedCompany?.name ||
    user?.companyName ||
    "Your company";

  const activeId = selectedCompanyId || companyId;
  const isEdit = Boolean(form.companyId);

  const openCreate = () => {
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (company) => {
    setForm({
      companyId: getCompanyId(company),
      companyName: company.companyName || company.name || "",
      domain: company.domain || "",
      status: company.status || "Active",
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.companyName.trim()) {
      Swal.fire({ icon: "warning", title: "Company name is required" });
      return;
    }

    const payload = {
      companyName: form.companyName.trim(),
      domain: form.domain.trim(),
      status: form.status,
    };
    if (isEdit) payload.companyId = form.companyId;

    setSaving(true);
    try {
      await companyAPI.save(payload);
      setModalOpen(false);
      await refreshCompanies();
      Swal.fire({
        icon: "success",
        title: isEdit ? "Company updated" : "Company created",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Save failed", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (company) => {
    const id = getCompanyId(company);
    const name = company.companyName || company.name || "this company";

    const confirm = await Swal.fire({
      title: "Delete company?",
      text: `"${name}" will be permanently removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
    });
    if (!confirm.isConfirmed) return;

    setDeletingId(id);
    try {
      await companyAPI.delete([id]);
      if (selectedCompanyId === id) {
        setSelectedCompanyId(null);
      }
      await refreshCompanies();
      Swal.fire({
        icon: "success",
        title: "Company deleted",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Delete failed", text: err.message });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <RbacPageHeader
        title="Company Management"
        description="Create, update, and manage company workspaces for access control."
        actions={
          isSuperAdmin ? (
            <>
              <button
                type="button"
                onClick={() => refreshCompanies()}
                disabled={loadingCompanies}
                className={rbacBtnSecondary}
              >
                <RefreshCw size={15} className={loadingCompanies ? "animate-spin" : ""} />
                Refresh
              </button>
              <button type="button" onClick={openCreate} className={rbacBtnPrimary}>
                <Plus size={15} />
                Add Company
              </button>
            </>
          ) : null
        }
      />

      <div className="space-y-5 p-5 sm:p-6">
        {!needsCompany && (
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#003366] via-[#003d73] to-[#004080] text-white shadow-lg shadow-[#003366]/20">
            <div className="flex flex-wrap items-center justify-between gap-5 px-6 py-5">
              <div className="flex min-w-0 items-center gap-4">
                <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-lg font-bold backdrop-blur-sm">
                  {companyInitials(displayName)}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                    Active workspace
                  </p>
                  <h2 className="mt-1 truncate text-xl font-semibold">{displayName}</h2>
                  {activeId && (
                    <p className="mt-1 flex items-center gap-1.5 font-mono text-xs text-white/60">
                      <Hash size={12} />
                      {shortId(activeId)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                  <Check size={13} />
                  In context
                </span>
                {isSuperAdmin && (
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/90">
                    Super Admin
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {!needsCompany && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={Shield}
              label="Total roles"
              value={rolesLoading ? "—" : stats.total}
              hint={`${stats.active} active`}
              accent="navy"
            />
            <StatCard
              icon={UserCog}
              label="System roles"
              value={rolesLoading ? "—" : stats.system}
              hint="Platform-wide defaults"
              accent="slate"
            />
            <StatCard
              icon={Building2}
              label="Company roles"
              value={rolesLoading ? "—" : stats.company}
              hint="Custom for this company"
              accent="cyan"
            />
            <StatCard
              icon={Users}
              label="Users with roles"
              value={rolesLoading ? "—" : stats.users}
              hint="Across all roles"
              accent="emerald"
            />
          </div>
        )}

        {!needsCompany && (
          <RbacCard className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Quick actions
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {QUICK_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="group flex items-center gap-3 rounded-xl border border-gray-200/90 bg-gray-50/50 px-4 py-3.5 transition hover:border-[#00ADE5]/40 hover:bg-[#00ADE5]/5"
                  >
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#00ADE5] shadow-sm">
                      <Icon size={17} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#003366]">{link.label}</p>
                      <p className="truncate text-xs text-gray-500">{link.description}</p>
                    </div>
                    <ArrowRight
                      size={15}
                      className="shrink-0 text-gray-300 transition group-hover:text-[#00ADE5]"
                    />
                  </Link>
                );
              })}
            </div>
          </RbacCard>
        )}

        {isSuperAdmin && (
          <RbacCard className="overflow-hidden">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-gray-100 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-[#003366]">All companies</h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  {companies.length} workspace{companies.length === 1 ? "" : "s"} available
                </p>
              </div>
              <div className="relative w-full sm:w-72">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, domain or ID…"
                  className={`${rbacSelect} pl-9`}
                />
              </div>
            </div>

            {loadingCompanies ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-[#00ADE5]" size={32} />
              </div>
            ) : filteredCompanies.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <Building2 className="mx-auto text-gray-300" size={36} strokeWidth={1.5} />
                <p className="mt-3 text-sm font-medium text-gray-900">
                  {search ? "No matching companies" : "No companies found"}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {search
                    ? "Try a different search term."
                    : "Add your first company to get started."}
                </p>
                {!search && (
                  <button type="button" onClick={openCreate} className={`${rbacBtnPrimary} mt-5`}>
                    <Plus size={15} />
                    Add Company
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-[#003366] text-white">
                      <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">
                        Domain
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">
                        Company ID
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {filteredCompanies.map((company, idx) => {
                      const id = getCompanyId(company);
                      const name = company.companyName || company.name || "Unnamed company";
                      const isSelected = id === selectedCompanyId;
                      const isActive =
                        String(company.status || "Active").toLowerCase() === "active";
                      const isDeleting = deletingId === id;

                      return (
                        <tr
                          key={id}
                          className={clsx(
                            "transition-colors",
                            isSelected
                              ? "bg-[#00ADE5]/8"
                              : idx % 2 === 1
                                ? "bg-gray-50/40 hover:bg-gray-50"
                                : "hover:bg-gray-50"
                          )}
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <span
                                className={clsx(
                                  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                                  isSelected
                                    ? "bg-[#00ADE5] text-white"
                                    : "bg-[#003366]/8 text-[#003366]"
                                )}
                              >
                                {companyInitials(name)}
                              </span>
                              <div>
                                <p className="font-medium text-gray-900">{name}</p>
                                {isSelected && (
                                  <p className="mt-0.5 text-[11px] font-medium text-[#00ADE5]">
                                    Active context
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-gray-600">
                            {company.domain || "—"}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="font-mono text-xs text-gray-500" title={id}>
                              {id}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <RbacBadge variant={isActive ? "success" : "muted"}>
                              {company.status || "Active"}
                            </RbacBadge>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                disabled={isSelected}
                                onClick={() => setSelectedCompanyId(id)}
                                className={clsx(
                                  "rounded-lg px-2.5 py-1.5 text-xs font-semibold transition",
                                  isSelected
                                    ? "cursor-default bg-[#00ADE5]/15 text-[#00ADE5]"
                                    : "text-[#003366] hover:bg-gray-100"
                                )}
                              >
                                {isSelected ? "Selected" : "Select"}
                              </button>
                              <button
                                type="button"
                                onClick={() => openEdit(company)}
                                className="rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-[#003366]"
                                aria-label={`Edit ${name}`}
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(company)}
                                disabled={isDeleting}
                                className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                aria-label={`Delete ${name}`}
                              >
                                {isDeleting ? (
                                  <Loader2 size={15} className="animate-spin" />
                                ) : (
                                  <Trash2 size={15} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </RbacCard>
        )}

        {!isSuperAdmin && companyId && (
          <RbacCard className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#00ADE5]/10 text-[#00ADE5]">
                  <Building2 size={22} />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-[#003366]">{displayName}</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    You manage access control for your assigned company workspace.
                  </p>
                  <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-1 font-mono text-xs text-gray-500">
                    <Hash size={12} />
                    {companyId}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  openEdit({
                    companyId,
                    companyName: displayName,
                    domain: selectedCompany?.domain || "",
                    status: selectedCompany?.status || "Active",
                  })
                }
                className={rbacBtnSecondary}
              >
                <Pencil size={15} />
                Edit Company
              </button>
            </div>
          </RbacCard>
        )}

        {needsCompany && isSuperAdmin && (
          <RbacCard className="px-5 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#00ADE5]/10">
              <Building2 className="text-[#00ADE5]" size={30} strokeWidth={1.75} />
            </div>
            <p className="mt-4 text-base font-semibold text-gray-900">
              Select a company to continue
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
              Choose a workspace from the table above to view access statistics.
            </p>
          </RbacCard>
        )}
      </div>

      <CompanyFormDrawer
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        form={form}
        setForm={setForm}
        onSubmit={handleSave}
        saving={saving}
      />
    </>
  );
}
