import {
  Building2,
  FileText,
  Laptop,
  LayoutPanelLeft,
  Shield,
  UserCog,
} from "lucide-react";

/** Flat sidebar menu for Access Control */
export const RBAC_MENU_ITEMS = [
  {
    id: "companies",
    label: "Company Management",
    path: "/dashboard/rbac/companies",
    icon: Building2,
    end: true,
  },
  {
    id: "roles",
    label: "Role Management",
    path: "/dashboard/rbac/roles",
    icon: UserCog,
    end: true,
  },
  {
    id: "platforms",
    label: "Platform Management",
    path: "/dashboard/rbac/platforms",
    icon: Laptop,
    end: true,
  },
  {
    id: "permissions",
    label: "Permission Management",
    path: "/dashboard/rbac/permissions",
    icon: Shield,
    end: true,
  },
  {
    id: "menu-placements",
    label: "Menu Placement",
    path: "/dashboard/rbac/menu-placements",
    icon: LayoutPanelLeft,
    end: true,
  },
  {
    id: "pages",
    label: "Page Management",
    path: "/dashboard/rbac/pages",
    icon: FileText,
    end: false,
  },
];

/** @deprecated use RBAC_MENU_ITEMS */
export const RBAC_SIDEBAR_SECTIONS = [{ id: "main", label: "", items: RBAC_MENU_ITEMS }];
export const RBAC_NAV_ITEMS = RBAC_MENU_ITEMS;
export const ROLES_NAV_ITEMS = [];
export const ACCESS_NAV_ITEMS = [];

export const PLATFORM_TABS = [
  { id: "website", label: "Website Portal" },
  { id: "mobile", label: "Mobile App" },
];

export const PERMISSION_CARD_META = {
  view: {
    label: "View",
    description: "Allows viewing records on selected pages",
  },
  add: {
    label: "Add",
    description: "Allows creating new records on selected pages",
  },
  edit: {
    label: "Edit",
    description: "Allows updating existing records on selected pages",
  },
  delete: {
    label: "Delete",
    description: "Allows removing records on selected pages",
  },
};
