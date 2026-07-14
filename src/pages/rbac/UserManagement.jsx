import { useSearchParams } from "react-router-dom";
import clsx from "clsx";
import { RbacPageHeader } from "../../components/rbac/RbacContent";
import RoleAssignments from "./roles/RoleAssignments";
import UserRolesLookup from "./roles/UserRolesLookup";

const TABS = [
  { id: "assign", label: "Assign Roles" },
  { id: "lookup", label: "User Lookup" },
];

export default function UserManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") === "lookup" ? "lookup" : "assign";

  const setTab = (tab) => {
    const next = new URLSearchParams(searchParams);
    if (tab === "assign") next.delete("tab");
    else next.set("tab", tab);
    setSearchParams(next, { replace: true });
  };

  return (
    <>
      <RbacPageHeader
        title="User Management"
        description="Assign roles to users and look up a user's current role assignments."
      />

      <div className="border-b border-gray-100 bg-white px-5 sm:px-6">
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTab(tab.id)}
              className={clsx(
                "border-b-2 px-4 py-3 text-sm font-medium transition",
                activeTab === tab.id
                  ? "border-[#00ADE5] text-[#003366]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "assign" ? (
        <RoleAssignments embedded />
      ) : (
        <UserRolesLookup embedded />
      )}
    </>
  );
}
