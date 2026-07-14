/** Standard page actions shown in role create/edit matrix */

export const PAGE_ACTION_COLUMNS = [
  { id: "view", label: "View", keys: ["view"] },
  { id: "add", label: "Add", keys: ["create", "add"] },
  { id: "edit", label: "Edit", keys: ["edit"] },
  { id: "delete", label: "Delete", keys: ["delete"] },
];

export function getEntityId(item) {
  return item?.pageId || item?.permissionId || item?._id || item?.id || "";
}

/** Map column id (view/add/edit/delete) → permission ObjectId from API list */
export function buildColumnPermissionMap(permissions = []) {
  const map = {};
  PAGE_ACTION_COLUMNS.forEach((col) => {
    const match = permissions.find((p) =>
      col.keys.includes(String(p.permissionKey || "").trim().toLowerCase())
    );
    if (match) map[col.id] = getEntityId(match);
  });
  return map;
}

export function normalizePermissionKey(value) {
  const key = String(value || "").trim().toLowerCase();
  if (key === "create") return "add";
  return key;
}

export function permissionKeyToLabel(key) {
  const normalized = normalizePermissionKey(key);
  const col = PAGE_ACTION_COLUMNS.find(
    (c) => c.id === normalized || c.keys.includes(normalized)
  );
  return col?.label || key;
}

/** Build pageId → Set<permissionId> from role API response */
export function buildPagePermMapFromRole(roleData, platformFilter = null) {
  const map = {};
  (roleData?.pagePermissions || []).forEach((pp) => {
    const ppPlatform = pp.platform || pp.page?.platform || pp.page?.platformKey;
    if (platformFilter && ppPlatform && normalizePlatform(ppPlatform) !== normalizePlatform(platformFilter)) {
      return;
    }
    const pageId = pp.pageId || getEntityId(pp.page);
    if (!pageId) return;
    const permIds = (pp.permissionIds || pp.permissions || [])
      .map((p) => (typeof p === "string" ? p : getEntityId(p)))
      .filter(Boolean);
    if (!map[pageId]) map[pageId] = new Set();
    permIds.forEach((id) => map[pageId].add(id));
  });
  return map;
}

export function normalizePlatform(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

export function getPagePlatform(page) {
  return normalizePlatform(
    page?.platformKey || page?.platform || page?.platformType || page?.platformName
  );
}

export function filterPagesByPlatform(pages = [], platform) {
  const want = normalizePlatform(platform);
  if (!want) return [];

  const hasPlatformField = pages.some(
    (p) => p.platform || p.platformKey || p.platformType || p.platformName
  );
  if (!hasPlatformField) {
    return pages;
  }
  return pages.filter((p) => getPagePlatform(p) === want);
}

/**
 * Parse get-access-matrix into platforms, deduped flat pages, permissions,
 * and a per-platform tree: categories (with nested pages) + topLevelPages.
 *
 * - Category with child pages → shown as group with nested pages
 * - Category with no children → shown as top-level selectable page
 * - topLevelPages from API → top-level section
 */
export function parseAccessMatrix(matrixData) {
  const platforms = [];
  const pages = [];
  const seenPageIds = new Set();
  const permissionByKey = new Map();
  const treeByPlatform = {};

  const addPermission = (perm) => {
    if (!perm) return;
    if (typeof perm === "string") {
      const key = String(perm).trim().toLowerCase();
      if (!key || permissionByKey.has(key)) return;
      permissionByKey.set(key, {
        permissionKey: key,
        permissionName: permissionKeyToLabel(key),
      });
      return;
    }
    const key = String(perm.permissionKey || "").trim().toLowerCase();
    const id = perm.permissionId || getEntityId(perm);
    if (!key && !id) return;
    const mapKey = key || id;
    if (permissionByKey.has(mapKey)) {
      const existing = permissionByKey.get(mapKey);
      permissionByKey.set(mapKey, {
        ...existing,
        ...perm,
        permissionId: existing.permissionId || id,
        permissionKey: existing.permissionKey || key,
      });
      return;
    }
    permissionByKey.set(mapKey, {
      ...perm,
      permissionId: id,
      permissionKey: key || perm.permissionKey,
      permissionName: perm.permissionName || permissionKeyToLabel(key),
    });
  };

  const normalizePage = (page, platformKey, platformName) => {
    if (!page) return null;
    const pageId = page.pageId || getEntityId(page);
    if (!pageId) return null;
    (page.permissionDetails || []).forEach(addPermission);
    (page.permissions || []).forEach(addPermission);
    return {
      ...page,
      pageId,
      pageName: page.pageName || page.name || page.pageKey || "Page",
      pageKey: page.pageKey || "",
      pageSlug: page.pageSlug || "",
      platformKey: page.platformKey || platformKey,
      platform: page.platform || platformKey,
      platformName: page.platformName || platformName,
      isCategory: page.isCategory === true,
      sortOrder: Number(page.sortOrder ?? 0),
    };
  };

  const bySortOrder = (a, b) =>
    (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0) ||
    String(a.pageName || "").localeCompare(String(b.pageName || ""));

  const pushFlatPage = (normalized) => {
    if (!normalized || normalized.isCategory) return;
    if (seenPageIds.has(normalized.pageId)) return;
    seenPageIds.add(normalized.pageId);
    pages.push(normalized);
  };

  const walkPlatform = (plat, index = 0) => {
    const platformKey = plat.platformKey || plat.key || `platform_${index}`;
    const platformName = plat.platformName || plat.name || platformKey;
    platforms.push({
      platformKey,
      platformName,
      platformId: plat.platformId || plat._id || plat.id || "",
      sortOrder: Number(plat.sortOrder ?? index),
      isEnabled: plat.isEnabled !== false,
    });

    (plat.permissions || []).forEach(addPermission);

    const categories = [];
    const topLevelPages = [];
    const topSeen = new Set();
    const nestedPageIds = new Set();

    const addTopLevel = (normalized) => {
      if (!normalized || topSeen.has(normalized.pageId)) return;
      if (nestedPageIds.has(normalized.pageId)) return;
      topSeen.add(normalized.pageId);
      pushFlatPage(normalized);
      topLevelPages.push(normalized);
    };

    const categoryList = (Array.isArray(plat.categories) ? [...plat.categories] : []).sort(
      (a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0)
    );
    categoryList.forEach((cat) => {
      const catNorm = normalizePage(cat, platformKey, platformName);
      const childPages = [];
      const childSeen = new Set();

      [...(cat.pages || [])]
        .sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0))
        .forEach((p) => {
          if (p?.isCategory === true) return;
          const child = normalizePage(p, platformKey, platformName);
          if (!child || childSeen.has(child.pageId)) return;
          childSeen.add(child.pageId);
          nestedPageIds.add(child.pageId);
          pushFlatPage(child);
          childPages.push(child);
        });

      if (childPages.length > 0) {
        if (catNorm?.pageId) nestedPageIds.add(catNorm.pageId);
        categories.push({
          pageId: catNorm?.pageId || `cat_${categories.length}`,
          pageName: catNorm?.pageName || cat.pageName || cat.name || "Category",
          pageKey: catNorm?.pageKey || cat.pageKey || "",
          pageSlug: catNorm?.pageSlug || cat.pageSlug || "",
          isCategory: true,
          sortOrder: Number(cat.sortOrder ?? catNorm?.sortOrder ?? categories.length),
          pages: childPages.sort(bySortOrder),
        });
      } else if (catNorm) {
        // Empty category → show as top-level page (keeps its sortOrder)
        addTopLevel({ ...catNorm, isCategory: false });
      }
    });

    [...(plat.topLevelPages || [])]
      .sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0))
      .forEach((p) => {
        if (p?.isCategory === true) {
          const nested = (p.pages || [])
            .map((child) => normalizePage(child, platformKey, platformName))
            .filter(Boolean);
          if (nested.length > 0) {
            nested.forEach((child) => {
              if (nestedPageIds.has(child.pageId)) return;
              nestedPageIds.add(child.pageId);
              pushFlatPage(child);
            });
            return;
          }
          addTopLevel(normalizePage({ ...p, isCategory: false }, platformKey, platformName));
          return;
        }
        const page = normalizePage(p, platformKey, platformName);
        addTopLevel(page);
      });

    // Legacy flat pages[] only when categories are absent (role-access sends both;
    // flat pages duplicate leaf nodes and must not override empty-category top-level grants)
    if (categoryList.length === 0) {
      (plat.pages || []).forEach((p) => {
        if (p?.isCategory === true) {
          const nested = (p.pages || [])
            .map((child) => normalizePage(child, platformKey, platformName))
            .filter(Boolean);
          const uniqueNested = [];
          nested.forEach((child) => {
            if (nestedPageIds.has(child.pageId) || uniqueNested.some((x) => x.pageId === child.pageId)) {
              return;
            }
            nestedPageIds.add(child.pageId);
            uniqueNested.push(child);
          });
          if (uniqueNested.length > 0) {
            const catId = p.pageId || getEntityId(p) || `cat_${categories.length}`;
            if (!categories.some((c) => c.pageId === catId)) {
              uniqueNested.forEach(pushFlatPage);
              nestedPageIds.add(catId);
              categories.push({
                pageId: catId,
                pageName: p.pageName || p.name || "Category",
                pageKey: p.pageKey || "",
                pageSlug: p.pageSlug || "",
                isCategory: true,
                sortOrder: Number(p.sortOrder ?? categories.length),
                pages: uniqueNested.sort(bySortOrder),
              });
            }
          } else {
            const catAsPage = normalizePage({ ...p, isCategory: false }, platformKey, platformName);
            addTopLevel(catAsPage);
          }
          return;
        }
        addTopLevel(normalizePage(p, platformKey, platformName));
      });
    }

    const sortedCategories = categories.sort(bySortOrder);
    const sortedTopLevel = topLevelPages.sort(bySortOrder);

    // Single sorted stream: categories + top-level pages by sortOrder
    const items = [
      ...sortedCategories.map((category) => ({
        type: "category",
        sortOrder: Number(category.sortOrder) || 0,
        category,
      })),
      ...sortedTopLevel.map((page) => ({
        type: "page",
        sortOrder: Number(page.sortOrder) || 0,
        page,
      })),
    ].sort(
      (a, b) =>
        a.sortOrder - b.sortOrder ||
        String(a.category?.pageName || a.page?.pageName || "").localeCompare(
          String(b.category?.pageName || b.page?.pageName || "")
        )
    );

    treeByPlatform[platformKey] = {
      categories: sortedCategories,
      topLevelPages: sortedTopLevel,
      items,
    };
  };

  const list = Array.isArray(matrixData?.platforms)
    ? matrixData.platforms
    : Array.isArray(matrixData)
      ? matrixData
      : [];

  list.forEach((plat, i) => walkPlatform(plat, i));
  (matrixData?.permissions || []).forEach(addPermission);

  return {
    platforms,
    pages,
    permissions: [...permissionByKey.values()],
    treeByPlatform,
  };
}

export function getPlatformPageTree(treeByPlatform, platformKey) {
  if (!treeByPlatform || typeof treeByPlatform !== "object") {
    return { categories: [], topLevelPages: [], items: [] };
  }
  const want = normalizePlatform(platformKey);
  const key = Object.keys(treeByPlatform).find((k) => normalizePlatform(k) === want);
  if (!key) return { categories: [], topLevelPages: [], items: [] };
  const tree = treeByPlatform[key] || { categories: [], topLevelPages: [], items: [] };
  if (Array.isArray(tree.items) && tree.items.length > 0) return tree;

  // Rebuild sorted items if missing (older cached shape)
  const categories = tree.categories || [];
  const topLevelPages = tree.topLevelPages || [];
  const items = [
    ...categories.map((category) => ({
      type: "category",
      sortOrder: Number(category.sortOrder) || 0,
      category,
    })),
    ...topLevelPages.map((page) => ({
      type: "page",
      sortOrder: Number(page.sortOrder) || 0,
      page,
    })),
  ].sort(
    (a, b) =>
      a.sortOrder - b.sortOrder ||
      String(a.category?.pageName || a.page?.pageName || "").localeCompare(
        String(b.category?.pageName || b.page?.pageName || "")
      )
  );
  return { categories, topLevelPages, items };
}

function collectPagesFromAccessPlatform(plat) {
  const list = [];
  const seen = new Set();

  const push = (page) => {
    if (!page) return;
    const id = page.pageId || getEntityId(page);
    if (!id || seen.has(id)) return;
    seen.add(id);
    list.push(page);
  };

  const categories = Array.isArray(plat?.categories) ? plat.categories : [];

  categories.forEach((cat) => {
    const children = Array.isArray(cat?.pages) ? cat.pages : [];
    if (children.length > 0) {
      children.forEach((p) => {
        if (p?.isCategory === true) return;
        push(p);
      });
      // Category with own access (rare) — still collect it
      if (pageIsGrantedAccess(cat)) push(cat);
      return;
    }
    // Empty category → selectable top-level page (Dashboard, Match Schedule, Results, …)
    push(cat);
  });

  (plat?.topLevelPages || []).forEach((p) => {
    if (p?.isCategory === true) {
      const children = Array.isArray(p.pages) ? p.pages : [];
      if (children.length > 0) {
        children.forEach(push);
        if (pageIsGrantedAccess(p)) push(p);
      } else {
        push(p);
      }
      return;
    }
    push(p);
  });

  // Only use flat pages[] when categories are absent (avoids duplicate leaf noise)
  if (categories.length === 0) {
    (plat?.pages || []).forEach((p) => {
      if (p?.isCategory === true) {
        const children = Array.isArray(p.pages) ? p.pages : [];
        if (children.length > 0) children.forEach(push);
        else push(p);
        return;
      }
      push(p);
    });
  }

  return list;
}

function pageIsGrantedAccess(page) {
  if (page?.hasAccess === true || page?.isGranted === true) return true;
  if (Array.isArray(page?.permissionDetails)) {
    if (page.permissionDetails.some((d) => d?.isGranted === true)) return true;
  }
  if (Array.isArray(page?.permissions) && page.permissions.length > 0) {
    return true;
  }
  return false;
}

/** Resolve granted permission keys/ids → permission ObjectIds for column map */
function grantedPermissionIdsFromPage(page, columnPermissionMap = {}) {
  const set = new Set();
  const colByKey = {};
  PAGE_ACTION_COLUMNS.forEach((col) => {
    col.keys.forEach((k) => {
      colByKey[k] = col.id;
    });
    colByKey[col.id] = col.id;
  });

  const addByKey = (rawKey) => {
    const key = normalizePermissionKey(rawKey);
    const colId = colByKey[key];
    if (colId && columnPermissionMap[colId]) {
      set.add(columnPermissionMap[colId]);
    }
  };

  const details = Array.isArray(page?.permissionDetails) ? page.permissionDetails : [];
  if (details.length > 0) {
    details.forEach((d) => {
      if (d?.isGranted !== true) return;
      const id = d.permissionId || getEntityId(d);
      // Prefer matching column map ids; still keep raw granted id as fallback
      if (id && Object.values(columnPermissionMap).includes(id)) {
        set.add(id);
      } else if (id && Object.keys(columnPermissionMap).length === 0) {
        set.add(id);
      }
      addByKey(d.permissionKey || d.permissionName);
    });
    // Also honor permissions: ["view"] style lists
    (page?.permissions || []).forEach((p) => {
      if (typeof p === "string") addByKey(p);
    });
    return set;
  }

  (page?.permissions || []).forEach((p) => {
    if (typeof p === "string") {
      addByKey(p);
      return;
    }
    if (p?.isGranted === false) return;
    const id = p.permissionId || getEntityId(p);
    if (id && Object.values(columnPermissionMap).includes(id)) {
      set.add(id);
    }
    addByKey(p.permissionKey || p.permissionName);
  });

  // Do not auto-grant all columns when hasAccess with empty perms
  // (category pages use permissionIds: [])
  return set;
}

function findMapKeyForPlatform(platformKey, platformKeys) {
  const want = normalizePlatform(platformKey);
  const aliases = {
    web: ["web", "website"],
    website: ["web", "website"],
    mobile: ["mobile", "mobile_app", "app"],
  };
  const wantSet = new Set(aliases[want] || [want]);

  const match = (platformKeys || []).find((k) => {
    const nk = normalizePlatform(k);
    if (nk === want) return true;
    const keyAliases = aliases[nk] || [nk];
    return keyAliases.some((a) => wantSet.has(a));
  });
  return match || want;
}

/**
 * Build per-platform pagePerm maps from role get-role-access response.
 * Supports:
 * - platforms[].categories[].pages / topLevelPages (hasAccess, isGranted, permissionDetails)
 * - legacy pagePermissions / platformPagePermissions
 */
export function buildPlatformPagePermMapsFromRole(
  roleData,
  platformKeys = ["web", "website", "mobile"],
  columnPermissionMap = {}
) {
  const keys = platformKeys.length > 0 ? platformKeys : ["web", "website", "mobile"];
  const maps = {};
  keys.forEach((k) => {
    maps[k] = {};
  });

  const accessPlatforms = roleData?.platforms;
  if (Array.isArray(accessPlatforms) && accessPlatforms.length > 0) {
    accessPlatforms.forEach((plat) => {
      const mapKey = findMapKeyForPlatform(plat.platformKey || plat.key, keys);
      if (!maps[mapKey]) maps[mapKey] = {};

      collectPagesFromAccessPlatform(plat).forEach((page) => {
        if (!pageIsGrantedAccess(page)) return;
        const pageId = page.pageId || getEntityId(page);
        if (!pageId) return;
        maps[mapKey][pageId] = grantedPermissionIdsFromPage(page, columnPermissionMap);
      });
    });
    return maps;
  }

  const fromNested = roleData?.platformPagePermissions;
  if (fromNested && typeof fromNested === "object") {
    keys.forEach((k) => {
      maps[k] = buildPagePermMapFromNestedList(fromNested[k]);
    });
    return maps;
  }

  const hasPlatformOnEntries = (roleData?.pagePermissions || []).some(
    (pp) => pp.platform || pp.page?.platform || pp.page?.platformKey
  );

  if (!hasPlatformOnEntries) {
    const all = buildPagePermMapFromRole(roleData);
    if (Object.keys(all).length > 0 && keys[0]) {
      maps[keys[0]] = all;
    }
    return maps;
  }

  keys.forEach((k) => {
    maps[k] = buildPagePermMapFromRole(roleData, k);
  });
  return maps;
}

function buildPagePermMapFromNestedList(list) {
  const map = {};
  (list || []).forEach((pp) => {
    const pageId = pp.pageId || getEntityId(pp.page);
    if (!pageId) return;
    const permIds = (pp.permissionIds || pp.permissions || [])
      .map((p) => (typeof p === "string" ? p : getEntityId(p)))
      .filter(Boolean);
    map[pageId] = new Set(permIds);
  });
  return map;
}

export function mergePlatformMapsToPayload(platformMaps = {}) {
  const merged = [];
  Object.entries(platformMaps).forEach(([platform, map]) => {
    pagePermMapToPayload(map).forEach((entry) => {
      merged.push({ ...entry, platform });
    });
  });
  return merged;
}

/**
 * Build role upsert `platformPermissions` payload:
 * [{ platformKey, isEnabled, pagePermissions: [{ pageId, permissionIds }] }]
 * Includes pages with empty permissionIds (e.g. category-only access).
 */
export function buildPlatformPermissionsPayload(platformMaps = {}, platformKeys = []) {
  const keys =
    platformKeys.length > 0
      ? platformKeys
      : Object.keys(platformMaps || {});

  return keys
    .map((platformKey) => {
      const map = platformMaps[platformKey] || {};
      const pagePermissions = Object.entries(map)
        .filter(([pageId, set]) => pageId && set)
        .map(([pageId, set]) => ({
          pageId,
          permissionIds: [...set],
        }));

      if (pagePermissions.length === 0) return null;

      return {
        platformKey,
        isEnabled: true,
        pagePermissions,
      };
    })
    .filter(Boolean);
}

export function platformMapHasAccess(map) {
  return Object.values(map || {}).some((set) => set && set.size > 0);
}

/** True if any page is selected for the platform (including empty permissionIds). */
export function platformMapHasPages(map) {
  return Object.keys(map || {}).length > 0;
}

export function isColumnChecked(pagePermMap, pageId, columnId, columnPermissionMap) {
  const permId = columnPermissionMap[columnId];
  if (!permId) return false;
  return Boolean(pagePermMap[pageId]?.has(permId));
}

export function togglePageColumn(pagePermMap, pageId, columnId, columnPermissionMap) {
  const permId = columnPermissionMap[columnId];
  if (!permId) return pagePermMap;

  const next = { ...pagePermMap };
  const set = new Set(next[pageId] || []);
  if (set.has(permId)) set.delete(permId);
  else set.add(permId);

  if (set.size === 0) delete next[pageId];
  else next[pageId] = set;
  return next;
}

export function togglePageRow(pagePermMap, pageId, columnPermissionMap, selectAll) {
  const next = { ...pagePermMap };
  if (!selectAll) {
    delete next[pageId];
    return next;
  }
  const ids = Object.values(columnPermissionMap).filter(Boolean);
  if (ids.length === 0) return next;
  next[pageId] = new Set(ids);
  return next;
}

export function pagePermMapToPayload(pagePermMap) {
  return Object.entries(pagePermMap)
    .filter(([pageId, set]) => pageId && set)
    .map(([pageId, set]) => ({
      pageId,
      permissionIds: [...set],
    }));
}

/** Build pagePermMap from selected pages × selected permission columns.
 * View is always included when any page is selected (required access).
 */
export function buildPagePermMapFromSelection(
  selectedPageIds,
  selectedColIds,
  columnPermissionMap
) {
  const colIds = new Set(selectedColIds);
  if (selectedPageIds.size > 0 && columnPermissionMap.view) {
    colIds.add("view");
  }

  const map = {};
  selectedPageIds.forEach((pageId) => {
    const set = new Set();
    colIds.forEach((colId) => {
      const permId = columnPermissionMap[colId];
      if (permId) set.add(permId);
    });
    map[pageId] = set;
  });
  return map;
}

/** Derive page + column selections from existing pagePermMap */
export function deriveSelectionFromPagePermMap(pagePermMap, columnPermissionMap) {
  const selectedPageIds = new Set(Object.keys(pagePermMap));
  const selectedColIds = new Set();

  const colByPermId = Object.fromEntries(
    Object.entries(columnPermissionMap).map(([col, id]) => [id, col])
  );

  Object.values(pagePermMap).forEach((set) => {
    set.forEach((permId) => {
      const col = colByPermId[permId];
      if (col) selectedColIds.add(col);
    });
  });

  return { selectedPageIds, selectedColIds };
}

/** For read-only display: which columns are enabled per page */
export function getPageActionFlags(pp, columnPermissionMap) {
  const flags = { view: false, add: false, edit: false, delete: false };
  const raw = pp.permissions || pp.permissionKeys || pp.permissionIds || [];

  raw.forEach((p) => {
    if (typeof p === "string") {
      const byKey = normalizePermissionKey(p);
      if (flags[byKey] !== undefined) flags[byKey] = true;
      const col = PAGE_ACTION_COLUMNS.find((c) => c.keys.includes(byKey));
      if (col) flags[col.id] = true;
      return;
    }
    const key = normalizePermissionKey(p.permissionKey || p.permissionName);
    const id = getEntityId(p);
    PAGE_ACTION_COLUMNS.forEach((col) => {
      if (col.keys.includes(key) || columnPermissionMap[col.id] === id) {
        flags[col.id] = true;
      }
    });
  });

  return flags;
}
