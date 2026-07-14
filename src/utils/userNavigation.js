import {
  BarChart,
  Building2,
  Calendar,
  FileText,
  Globe,
  Home,
  LayoutPanelLeft,
  Laptop,
  MessageSquare,
  Settings,
  Shield,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";

/** Map API pageKey → dashboard route (overrides pageSlug when needed). */
const PAGE_KEY_ROUTES = {
  dashboard: "/dashboard",
  setup: "/dashboard/setup",
  "match-schedule": "/dashboard/schedule",
  results: "/dashboard/results",
  users: "/dashboard/people",
  communications: "/dashboard/communication",
  "visit-site": "https://leaguease-web.vercel.app/",
  "access-control": "/dashboard/rbac/companies",
  "company-management": "/dashboard/rbac/companies",
  "role-management": "/dashboard/rbac/roles",
  "platform-management": "/dashboard/rbac/platforms",
  "permission-management": "/dashboard/rbac/permissions",
  "page-management": "/dashboard/rbac/pages",
  "menu-placement": "/dashboard/rbac/menu-placements",
};

const PAGE_KEY_ICONS = {
  dashboard: Home,
  setup: Settings,
  "match-schedule": Calendar,
  results: BarChart,
  users: Users,
  communications: MessageSquare,
  "visit-site": Globe,
  "access-control": ShieldCheck,
  "company-management": Building2,
  "role-management": UserCog,
  "platform-management": Laptop,
  "permission-management": Shield,
  "page-management": FileText,
  "menu-placement": LayoutPanelLeft,
};

/** Setup nested tab pageKey → existing Setup.jsx tab id */
const SETUP_TAB_IDS = {
  settings: "settings",
  seasons: "seasons",
  venues: "venues",
  teams: "teams",
  competitions: "competitions",
  "statistics-setup": "statistics",
  standings: "standings",
  "score-entry-options": "score-entry",
};

const FALLBACK_SIDEBAR = [
  {
    id: "dashboard",
    pageKey: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    icon: Home,
    end: true,
    expandable: false,
    children: [],
  },
  {
    id: "setup",
    pageKey: "setup",
    label: "Setup",
    path: "/dashboard/setup",
    icon: Settings,
    end: false,
    expandable: false,
    children: [],
  },
  {
    id: "match-schedule",
    pageKey: "match-schedule",
    label: "Match Schedule",
    path: "/dashboard/schedule",
    icon: Calendar,
    end: false,
    expandable: false,
    children: [],
  },
  {
    id: "results",
    pageKey: "results",
    label: "Results",
    path: "/dashboard/results",
    icon: BarChart,
    end: false,
    expandable: false,
    children: [],
  },
  {
    id: "users",
    pageKey: "users",
    label: "Users",
    path: "/dashboard/people",
    icon: Users,
    end: false,
    expandable: false,
    children: [],
  },
  {
    id: "communications",
    pageKey: "communications",
    label: "Communication",
    path: "/dashboard/communication",
    icon: MessageSquare,
    end: false,
    expandable: false,
    children: [],
  },
  {
    id: "visit-site",
    pageKey: "visit-site",
    label: "Visit Site",
    path: "https://leaguease-web.vercel.app/",
    icon: Globe,
    external: true,
    end: false,
    expandable: false,
    children: [],
  },
];

function sortByOrder(a, b) {
  return (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0);
}

function getPageKey(page) {
  return String(page?.pageKey || page?.key || "").trim();
}

function getPlacement(page) {
  return String(page?.menuPlacement || "").trim().toLowerCase();
}

export function getWebPlatform(user) {
  const platforms = Array.isArray(user?.platforms) ? user.platforms : [];
  if (platforms.length === 0) return null;

  const slug = String(user?.platformSlug || user?.platformKey || "web").toLowerCase();
  return (
    platforms.find((p) => {
      const key = String(p.platformKey || p.platformSlug || "").toLowerCase();
      return key === slug || key === "web";
    }) || platforms[0]
  );
}

export function pageKeyToRoute(pageKey, pageSlug = "") {
  const key = String(pageKey || "").trim();
  if (PAGE_KEY_ROUTES[key]) return PAGE_KEY_ROUTES[key];

  const slug = String(pageSlug || "").trim();
  if (!slug) return "/dashboard";
  if (/^https?:\/\//i.test(slug)) return slug;
  if (slug.startsWith("/dashboard")) return slug;
  if (slug.startsWith("/")) return `/dashboard${slug}`;
  return `/dashboard/${slug}`;
}

function pageIcon(pageKey) {
  return PAGE_KEY_ICONS[pageKey] || FileText;
}

function buildChildNavItem(child) {
  const pageKey = getPageKey(child);
  const path = pageKeyToRoute(pageKey, child.pageSlug);
  const external = /^https?:\/\//i.test(path);
  return {
    id: child.pageId || pageKey,
    pageKey,
    label: child.pageName || pageKey,
    path,
    icon: pageIcon(pageKey),
    end: pageKey === "dashboard" || path === "/dashboard",
    external,
    sortOrder: child.sortOrder,
    permissions: child.permissions || [],
  };
}

/**
 * Sidebar items from login platforms[].categories
 * - Categories with menuPlacement side_navigation → top-level items
 * - Child pages with side_navigation → expandable submenu
 * - Parent with empty permissions still shows if any child is visible
 * - Child pages with nested_tabs → not in sidebar (shown as tabs on parent page)
 */
export function buildSidebarMenu(user) {
  const platform = getWebPlatform(user);
  const categories = Array.isArray(platform?.categories) ? [...platform.categories] : [];

  if (categories.length === 0) {
    return FALLBACK_SIDEBAR;
  }

  const canViewPage = (pageKey) => {
    if (!pageKey) return false;
    // If no RBAC payload, allow (legacy)
    if (!userHasRbacPermissionData(user)) return true;
    const granted = getPagePermissionsList(user, pageKey);
    // Parent category may omit permissions — treat unknown as potentially visible via children
    if (granted == null) return null;
    return hasPagePermission(user, pageKey, "view");
  };

  return categories
    .filter((cat) => getPlacement(cat) === "side_navigation" || !getPlacement(cat))
    .sort(sortByOrder)
    .map((cat) => {
      const pageKey = getPageKey(cat);
      const path = pageKeyToRoute(pageKey, cat.pageSlug);
      const external = /^https?:\/\//i.test(path) || pageKey === "visit-site";

      const children = (Array.isArray(cat.pages) ? [...cat.pages] : [])
        .filter((p) => getPlacement(p) === "side_navigation")
        .filter((p) => {
          const childKey = getPageKey(p);
          const view = canViewPage(childKey);
          // null = no explicit entry → show if listed in platform tree (backend already filtered)
          return view !== false;
        })
        .sort(sortByOrder)
        .map(buildChildNavItem);

      const selfView = canViewPage(pageKey);
      // Show parent when it has view, OR when it has visible children (e.g. Access Control
      // often has empty category permissions but Role Management under it).
      const visible = selfView === true || children.length > 0 || selfView === null;
      if (!visible) return null;

      return {
        id: cat.pageId || pageKey,
        pageKey,
        label: cat.pageName || pageKey,
        path: children.length > 0 ? children[0].path : path,
        icon: pageIcon(pageKey),
        end: pageKey === "dashboard" || path === "/dashboard",
        external,
        expandable: children.length > 0,
        children,
        sortOrder: cat.sortOrder,
      };
    })
    .filter(Boolean);
}

/**
 * Nested tab pages for a parent category (e.g. Setup).
 * Returns { pageKey, label, tabId, sortOrder }[] for menuPlacement nested_tabs.
 */
export function getNestedTabsForCategory(user, categoryPageKey) {
  const platform = getWebPlatform(user);
  const categories = Array.isArray(platform?.categories) ? platform.categories : [];
  const want = String(categoryPageKey || "").toLowerCase();

  const category = categories.find(
    (c) => getPageKey(c).toLowerCase() === want
  );
  if (!category) return [];

  return (Array.isArray(category.pages) ? [...category.pages] : [])
    .filter((p) => getPlacement(p) === "nested_tabs")
    .sort(sortByOrder)
    .map((p) => {
      const pageKey = getPageKey(p);
      return {
        pageId: p.pageId,
        pageKey,
        label: p.pageName || pageKey,
        tabId: SETUP_TAB_IDS[pageKey] || pageKey,
        sortOrder: p.sortOrder,
        permissions: p.permissions || [],
      };
    });
}

/** Permission key aliases (API may send create or add). */
const PERMISSION_ALIASES = {
  view: ["view"],
  add: ["add", "create"],
  create: ["add", "create"],
  edit: ["edit"],
  delete: ["delete"],
  export: ["export"],
};

/** True when login payload includes actionable RBAC permission data. */
export function userHasRbacPermissionData(user) {
  const map = user?.pageKeyMap;
  if (map && typeof map === "object" && Object.keys(map).length > 0) {
    return true;
  }

  const pages = Array.isArray(user?.pages) ? user.pages : [];
  if (pages.some((p) => Array.isArray(p.permissions) && p.permissions.length > 0)) {
    return true;
  }

  const platform = getWebPlatform(user);
  const categories = Array.isArray(platform?.categories) ? platform.categories : [];
  for (const cat of categories) {
    if (Array.isArray(cat.permissions) && cat.permissions.length > 0) return true;
    const children = Array.isArray(cat.pages) ? cat.pages : [];
    if (children.some((c) => Array.isArray(c.permissions) && c.permissions.length > 0)) {
      return true;
    }
  }

  return false;
}

function getPagePermissionsList(user, pageKey) {
  const key = String(pageKey || "").trim();
  if (!key) return null;

  const map = user?.pageKeyMap;
  if (map && typeof map === "object" && Object.prototype.hasOwnProperty.call(map, key)) {
    return Array.isArray(map[key])
      ? map[key].map((p) => String(p).trim().toLowerCase())
      : [];
  }

  const pages = Array.isArray(user?.pages) ? user.pages : [];
  const page = pages.find((p) => getPageKey(p) === key);
  if (page && Array.isArray(page.permissions)) {
    return page.permissions.map((p) => String(p).trim().toLowerCase());
  }

  // Fallback: walk platforms tree (categories + nested pages)
  const platform = getWebPlatform(user);
  const categories = Array.isArray(platform?.categories) ? platform.categories : [];
  for (const cat of categories) {
    if (getPageKey(cat) === key) {
      // Parent categories often have permissions: [] while children hold real grants
      if (Array.isArray(cat.permissions) && cat.permissions.length > 0) {
        return cat.permissions.map((p) => String(p).trim().toLowerCase());
      }
      const childPages = Array.isArray(cat.pages) ? cat.pages : [];
      if (childPages.length > 0 && (!cat.permissions || cat.permissions.length === 0)) {
        return null;
      }
      if (Array.isArray(cat.permissions)) {
        return cat.permissions.map((p) => String(p).trim().toLowerCase());
      }
    }
    const children = Array.isArray(cat.pages) ? cat.pages : [];
    for (const child of children) {
      if (getPageKey(child) === key && Array.isArray(child.permissions)) {
        return child.permissions.map((p) => String(p).trim().toLowerCase());
      }
    }
  }

  return null;
}

/**
 * @param {object|null} user - logged-in user from localStorage / AuthContext
 * @param {string} pageKey - e.g. "users", "venues"
 * @param {string} permissionKey - view | add | create | edit | delete
 */
export function hasPagePermission(user, pageKey, permissionKey = "view") {
  if (user?.isSuperAdmin === true) return true;
  if (
    Array.isArray(user?.roles) &&
    user.roles.some((r) => String(r).trim().toLowerCase() === "super admin")
  ) {
    return true;
  }

  // No RBAC payload yet (legacy sessions) — do not lock the UI
  if (!userHasRbacPermissionData(user)) return true;

  const granted = getPagePermissionsList(user, pageKey);
  // Page not in access map → deny
  if (granted == null) return false;

  const want = String(permissionKey || "view").trim().toLowerCase();
  const aliases = PERMISSION_ALIASES[want] || [want];
  return aliases.some((alias) => granted.includes(alias));
}

export { SETUP_TAB_IDS, FALLBACK_SIDEBAR, PAGE_KEY_ROUTES };
