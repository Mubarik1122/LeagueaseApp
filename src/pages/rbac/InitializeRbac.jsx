import { useState } from "react";
import { Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import { roleAPI } from "../../services/api";
import RbacPanel from "../../components/rbac/RbacPanel";
import { RbacBadge, rbacBtnPrimary } from "../../components/rbac/rbacTheme";
import { useRbacContext } from "../../hooks/useRbacContext";

export default function InitializeRbac() {
  const { isSuperAdmin } = useRbacContext();
  const [loading, setLoading] = useState(false);

  const handleInitialize = async () => {
    const confirm = await Swal.fire({
      title: "Run system setup?",
      text: "Default pages, permissions, and system roles will be created.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#003366",
      confirmButtonText: "Continue",
    });
    if (!confirm.isConfirmed) return;

    setLoading(true);
    try {
      const response = await roleAPI.initializeDefaultRoles();
      await Swal.fire({
        icon: "success",
        title: "Setup complete",
        text:
          response.errorMessage ||
          "Default roles, pages, and permissions are ready.",
        confirmButtonColor: "#003366",
      });
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Setup failed",
        text: err.message,
        confirmButtonColor: "#003366",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <RbacPanel title="System Setup">
        <p className="text-sm text-gray-600">
          This action is restricted to Super Admin accounts.
        </p>
      </RbacPanel>
    );
  }

  return (
    <RbacPanel
      title="System Setup"
      description="Initialize default pages, permissions, and roles for a new environment."
      actions={<RbacBadge variant="primary">Super Admin</RbacBadge>}
    >
      <div className="max-w-2xl space-y-4">
        <p className="text-sm leading-relaxed text-gray-600">
          Run once when provisioning a new environment. This creates standard
          pages, permissions (view, create, edit, delete, export), and
          system-defined roles.
        </p>
        <button
          type="button"
          onClick={handleInitialize}
          disabled={loading}
          className={rbacBtnPrimary}
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : null}
          Initialize defaults
        </button>
      </div>
    </RbacPanel>
  );
}
