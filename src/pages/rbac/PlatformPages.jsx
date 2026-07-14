import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileText,
  FolderTree,
  GripVertical,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import clsx from "clsx";
import Swal from "sweetalert2";
import { menuPlacementAPI, pageAPI, platformAPI } from "../../services/api";
import PageFormDrawer, { normalizePageSlug } from "../../components/rbac/PageFormDrawer";
import { useRbacContext } from "../../hooks/useRbacContext";
import { useCompanyContext } from "../../context/CompanyContext";
import { useRbacFetch } from "../../hooks/useRbacFetch";
import {
  RbacPageHeader,
  RbacCard,
  StatCard,
  WorkspaceBanner,
} from "../../components/rbac/RbacContent";
import {
  RbacBadge,
  rbacBtnPrimary,
  rbacBtnSecondary,
  rbacSelect,
} from "../../components/rbac/rbacTheme";

const emptyCategoryForm = {
  pageId: "",
  pageSlug: "",
  pageName: "",
  parentId: "",
  companyIds: [],
  menuPlacement: "",
  isCategory: true,
  isTopLevel: true,
  isActive: true,
};

const emptyPageForm = {
  pageId: "",
  pageSlug: "",
  pageName: "",
  parentId: "",
  companyIds: [],
  menuPlacement: "",
  isCategory: false,
  isTopLevel: true,
  isActive: true,
};

function getPageId(page) {
  return page?.pageId || page?._id || page?.id || "";
}

function getPageSlug(page) {
  return page?.pageSlug || page?.pageKey || "";
}

function getParentId(page) {
  return (
    page?.parentId ||
    page?.parentPageId ||
    page?.categoryId ||
    page?.parent?.pageId ||
    page?.parent?._id ||
    ""
  );
}

function getMenuPlacement(page) {
  return (
    page?.menuPlacement ||
    page?.placementKey ||
    page?.menuPlacementKey ||
    ""
  );
}

function getPlacementKey(placement) {
  return placement?.placementKey || placement?.key || placement?.menuPlacement || "";
}

function isCategoryPage(page) {
  return page?.isCategory === true;
}

function sortByOrder(a, b) {
  return (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0);
}

function getCompanyIdsFromPage(page) {
  if (Array.isArray(page?.companyIds)) return page.companyIds.map(String);
  if (Array.isArray(page?.companies)) {
    return page.companies
      .map((c) => c.companyId || c._id || c.id)
      .filter(Boolean)
      .map(String);
  }
  return [];
}

function getPageCompanies(page) {
  if (Array.isArray(page?.companies) && page.companies.length > 0) {
    return page.companies;
  }
  if (Array.isArray(page?.companyIds) && page.companyIds.length > 0) {
    return page.companyIds.map((id) => ({
      companyId: id,
      companyName: String(id),
    }));
  }
  return [];
}

function getPageRoles(page) {
  if (Array.isArray(page?.roles) && page.roles.length > 0) return page.roles;
  if (Array.isArray(page?.roleIds) && page.roleIds.length > 0) {
    return page.roleIds.map((id) => ({
      roleId: id,
      roleName: String(id),
    }));
  }
  return [];
}

function getCompanyIdFromItem(company) {
  return company?.companyId || company?._id || company?.id || "";
}

function getCompanyName(company) {
  return company?.companyName || company?.name || getCompanyIdFromItem(company) || "—";
}

function getRoleId(role) {
  return role?.roleId || role?._id || role?.id || "";
}

function getRoleName(role) {
  return role?.roleName || role?.name || getRoleId(role) || "—";
}

/** Prefer per-company roles; fall back to page-level roles (flat API shape). */
function getRolesForCompany(company, pageRoles) {
  if (Array.isArray(company?.roles) && company.roles.length > 0) {
    return company.roles;
  }
  if (Array.isArray(company?.roleIds) && company.roleIds.length > 0 && pageRoles.length > 0) {
    const ids = new Set(company.roleIds.map(String));
    return pageRoles.filter((r) => ids.has(String(getRoleId(r))));
  }
  return pageRoles;
}

function RoleTag({ children }) {
  return (
    <span className="inline-flex max-w-full items-center truncate rounded-full border border-gray-200/90 bg-[#f3f4f6] px-2.5 py-1 text-[11px] font-medium leading-none text-gray-600">
      {children}
    </span>
  );
}

function companyInitial(name) {
  const t = String(name || "").trim();
  return t ? t[0].toUpperCase() : "?";
}

function PageAccessPanel({ page }) {
  const companies = getPageCompanies(page);
  const pageRoles = getPageRoles(page);

  if (companies.length === 0 && pageRoles.length === 0) {
    return (
      <div className="px-4 pb-4 pl-10 sm:pl-14">
        <div className="rounded-xl border border-dashed border-gray-200 bg-[#fafafa] px-4 py-6 text-center">
          <p className="text-sm text-gray-400">No companies or roles attached yet.</p>
        </div>
      </div>
    );
  }

  if (companies.length === 0 && pageRoles.length > 0) {
    return (
      <div className="px-4 pb-4 pl-10 sm:pl-14">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 bg-[#fafafa] px-4 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Roles
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 p-4">
            {pageRoles.map((role) => (
              <RoleTag key={getRoleId(role) || getRoleName(role)}>
                {getRoleName(role)}
              </RoleTag>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-4 pl-10 sm:pl-14">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="grid grid-cols-[minmax(140px,220px)_1fr] gap-3 border-b border-gray-100 bg-[#fafafa] px-4 py-2.5 sm:grid-cols-[minmax(180px,260px)_1fr]">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Company
          </p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Roles
          </p>
        </div>
        <div className="divide-y divide-gray-100">
          {companies.map((company) => {
            const cid = getCompanyIdFromItem(company);
            const name = getCompanyName(company);
            const roles = getRolesForCompany(company, pageRoles);
            return (
              <div
                key={cid || name}
                className="grid grid-cols-[minmax(140px,220px)_1fr] items-start gap-3 px-4 py-3.5 sm:grid-cols-[minmax(180px,260px)_1fr]"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#003366]/8 text-xs font-bold text-[#003366]">
                    {companyInitial(name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{name}</p>
                    {company.status ? (
                      <p className="truncate text-[11px] text-gray-400">{company.status}</p>
                    ) : null}
                  </div>
                </div>
                <div className="flex min-w-0 flex-wrap content-start gap-1.5 pt-0.5">
                  {roles.length === 0 ? (
                    <span className="text-xs text-gray-400">No roles</span>
                  ) : (
                    roles.map((role) => (
                      <RoleTag key={getRoleId(role) || getRoleName(role)}>
                        {getRoleName(role)}
                      </RoleTag>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SortablePageRow({
  page,
  parentId,
  canReorder,
  isDeleting,
  isSuperAdmin,
  onEdit,
  onDelete,
}) {
  const id = getPageId(page);
  const slug = getPageSlug(page);
  const isActive = page.isActive !== false;
  const companies = getPageCompanies(page);
  const companyCount = companies.length;
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id,
      disabled: !canReorder,
      data: { type: "page", parentId: String(parentId || "") },
    });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={clsx(
        "border-b border-gray-100 bg-white transition",
        detailsOpen && "bg-[#fbfcfd]",
        isDragging && "relative z-10 bg-[#00ADE5]/5 opacity-90 shadow-lg"
      )}
    >
      <div className="group flex items-start gap-2 px-4 py-4 pl-10 sm:items-center sm:pl-12">
        <button
          type="button"
          className={clsx(
            "mt-1 shrink-0 rounded p-0.5 sm:mt-0",
            canReorder
              ? "cursor-grab text-gray-400 hover:text-[#003366] active:cursor-grabbing"
              : "cursor-default text-gray-300"
          )}
          aria-label="Drag to reorder"
          disabled={!canReorder}
          {...(canReorder ? { ...attributes, ...listeners } : {})}
        >
          <GripVertical size={16} />
        </button>

        <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e8f7fc] text-[#00ADE5] sm:mt-0">
          <FileText size={16} />
        </span>

        <button
          type="button"
          onClick={() => setDetailsOpen((v) => !v)}
          className="min-w-0 flex-1 text-left"
        >
          <p className="truncate text-[15px] font-semibold text-gray-900">
            {page.pageName || "Untitled"}
          </p>
          {slug ? (
            <p className="mt-0.5 truncate font-mono text-xs text-gray-400">{slug}</p>
          ) : null}
          <p className="mt-1 text-xs text-gray-500">
            {companyCount === 0
              ? "No companies attached"
              : `Accessible to ${companyCount} compan${companyCount === 1 ? "y" : "ies"}`}
          </p>
        </button>

        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          <RbacBadge variant={isActive ? "success" : "muted"}>
            {isActive ? "Active" : "Inactive"}
          </RbacBadge>
          {isSuperAdmin && (
            <>
              <button
                type="button"
                onClick={() => onEdit(page)}
                aria-label="Edit page"
                title="Edit"
                className="inline-flex items-center justify-center rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-[#003366]"
              >
                <Pencil size={15} />
              </button>
              <button
                type="button"
                onClick={() => onDelete(page)}
                disabled={isDeleting}
                aria-label="Delete page"
                title="Delete"
                className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Trash2 size={15} />
                )}
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setDetailsOpen((v) => !v)}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-[#003366]"
            aria-label={detailsOpen ? "Hide access details" : "Show access details"}
            aria-expanded={detailsOpen}
          >
            {detailsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
      </div>

      {detailsOpen && <PageAccessPanel page={page} />}
    </div>
  );
}

function SortableCategoryBlock({
  category,
  index,
  childrenPages,
  isOpen,
  canReorder,
  reordering,
  deletingId,
  isSuperAdmin,
  onToggle,
  onAddPage,
  onEdit,
  onDelete,
  onEditPage,
  onDeletePage,
  onPageDragEnd,
  sensors,
}) {
  const id = getPageId(category);
  const slug = getPageSlug(category);
  const orderLabel = String(index + 1).padStart(2, "0");
  const childIds = childrenPages.map(getPageId).filter(Boolean);
  const isDeleting = deletingId === id;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id,
      disabled: !canReorder,
      data: { type: "category", parentId: null },
    });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={clsx(
        "border-b border-gray-100 last:border-b-0",
        isDragging && "relative z-10 opacity-80 shadow-lg"
      )}
    >
      <div className="flex items-center gap-2 bg-gradient-to-r from-[#003366]/5 via-[#f8fafc] to-white px-5 py-3.5">
        <button
          type="button"
          className={clsx(
            "shrink-0 rounded p-0.5",
            canReorder
              ? "cursor-grab text-gray-400 hover:text-[#003366] active:cursor-grabbing"
              : "cursor-default text-gray-200"
          )}
          aria-label="Drag category to reorder"
          disabled={!canReorder}
          {...(canReorder ? { ...attributes, ...listeners } : {})}
        >
          <GripVertical size={16} />
        </button>
        <button
          type="button"
          onClick={() => onToggle(id)}
          className="rounded-lg p-1.5 text-[#003366]/70 transition hover:bg-white hover:text-[#003366]"
          aria-label={isOpen ? "Collapse" : "Expand"}
        >
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#003366]/10 text-[#003366]">
          <FolderTree size={16} />
        </span>
        <button type="button" onClick={() => onToggle(id)} className="min-w-0 flex-1 text-left">
          <span className="text-sm font-bold uppercase tracking-wide text-[#003366]">
            {orderLabel} {category.pageName || "Category"}
          </span>
          {slug && (
            <span className="mt-0.5 block font-mono text-[11px] font-normal normal-case tracking-normal text-gray-400">
              {slug}
            </span>
          )}
        </button>
        <span className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-gray-600 ring-1 ring-gray-200/80">
          {childrenPages.length} Page{childrenPages.length === 1 ? "" : "s"}
        </span>
        {isSuperAdmin && (
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => onAddPage(id)}
              title="Add child page"
              className="rounded-lg p-2 text-[#00ADE5] transition hover:bg-white"
            >
              <Plus size={14} />
            </button>
            <button
              type="button"
              onClick={() => onEdit(category)}
              title="Edit category"
              className="rounded-lg p-2 text-[#003366] transition hover:bg-white"
            >
              <Pencil size={14} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(category)}
              disabled={isDeleting}
              title="Delete category"
              className="rounded-lg p-2 text-gray-400 transition hover:bg-white hover:text-red-600 disabled:opacity-50"
            >
              {isDeleting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}
            </button>
          </div>
        )}
      </div>

      {isOpen && (
        <div>
          {childrenPages.length === 0 ? (
            <p className="bg-white px-5 py-5 pl-16 text-sm text-gray-400">
              No pages in this category.
              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={() => onAddPage(id)}
                  className="ml-2 font-semibold text-[#003366] hover:underline"
                >
                  Add page
                </button>
              )}
            </p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(event) => onPageDragEnd(id, event)}
            >
              <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
                {childrenPages.map((page) => (
                  <SortablePageRow
                    key={getPageId(page)}
                    page={page}
                    parentId={id}
                    canReorder={canReorder && !reordering}
                    isDeleting={deletingId === getPageId(page)}
                    isSuperAdmin={isSuperAdmin}
                    onEdit={onEditPage}
                    onDelete={onDeletePage}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}
    </div>
  );
}

export default function PlatformPages({ platformKey: platformKeyProp }) {
  const platformKey = String(platformKeyProp || "").trim();
  const { isSuperAdmin } = useRbacContext();
  const { companies } = useCompanyContext();

  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formMode, setFormMode] = useState("page");
  const [form, setForm] = useState(emptyPageForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [reordering, setReordering] = useState(false);
  const [localCategories, setLocalCategories] = useState([]);
  const [localChildren, setLocalChildren] = useState({});
  const [localUncategorized, setLocalUncategorized] = useState([]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const { data: platforms, loading: platformsLoading } = useRbacFetch(
    async () => {
      const res = await platformAPI.getPlatforms();
      return Array.isArray(res.data) ? res.data : [];
    },
    [],
    { initialData: [] }
  );

  const platform = useMemo(() => {
    return (platforms || []).find((p) => {
      const key = p.platformKey || p.key || "";
      return String(key).toLowerCase() === String(platformKey).toLowerCase();
    });
  }, [platforms, platformKey]);

  const platformName =
    platform?.platformName || platform?.name || platformKey || "Platform";

  const {
    data: allPages,
    loading: pagesLoading,
    reload: loadPages,
  } = useRbacFetch(
    async () => {
      const query = {};
      if (platformKey) query.platformKey = platformKey;
      if (statusFilter !== "") query.isActive = statusFilter;
      const res = await pageAPI.getPages(query);
      return Array.isArray(res.data) ? res.data : [];
    },
    [statusFilter, platformKey],
    { initialData: [] }
  );

  const { data: placements } = useRbacFetch(
    async () => {
      const res = await menuPlacementAPI.getPlacements();
      const list = Array.isArray(res.data) ? res.data : [];
      return list.filter((p) => p.isActive !== false);
    },
    [],
    { initialData: [] }
  );

  const defaultMenuPlacement = useMemo(() => {
    const list = placements || [];
    const sideNav = list.find(
      (p) => getPlacementKey(p).toLowerCase() === "side_navigation"
    );
    if (sideNav) return getPlacementKey(sideNav);
    return getPlacementKey(list[0]) || "";
  }, [placements]);

  const pages = useMemo(() => {
    const want = platformKey.toLowerCase();
    return (allPages || []).filter(
      (p) => String(p.platformKey || p.platform || "").toLowerCase() === want
    );
  }, [allPages, platformKey]);

  const filteredPages = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter((p) => {
      const name = (p.pageName || "").toLowerCase();
      const slug = getPageSlug(p).toLowerCase();
      return name.includes(q) || slug.includes(q);
    });
  }, [pages, search]);

  const categories = useMemo(() => {
    return filteredPages.filter(isCategoryPage).slice().sort(sortByOrder);
  }, [filteredPages]);

  const parentPages = useMemo(() => {
    return pages.filter(isCategoryPage).slice().sort(sortByOrder);
  }, [pages]);

  const tree = useMemo(() => {
    const categoryIds = new Set(categories.map(getPageId));
    const categorySlugs = new Set(categories.map((c) => getPageSlug(c).toLowerCase()));
    const childrenByParent = {};
    const uncategorized = [];

    filteredPages
      .filter((p) => !isCategoryPage(p))
      .slice()
      .sort(sortByOrder)
      .forEach((page) => {
        const parentId = String(getParentId(page) || "");
        const parentSlug = String(
          page.parentSlug || page.categorySlug || page.parent?.pageSlug || ""
        ).toLowerCase();

        if (parentId && categoryIds.has(parentId)) {
          (childrenByParent[parentId] ||= []).push(page);
          return;
        }
        if (parentSlug && categorySlugs.has(parentSlug)) {
          const cat = categories.find(
            (c) => getPageSlug(c).toLowerCase() === parentSlug
          );
          if (cat) {
            (childrenByParent[getPageId(cat)] ||= []).push(page);
            return;
          }
        }
        uncategorized.push(page);
      });

    return { childrenByParent, uncategorized };
  }, [filteredPages, categories]);

  useEffect(() => {
    setLocalCategories(categories);
    setLocalChildren(tree.childrenByParent);
    setLocalUncategorized(tree.uncategorized);
  }, [categories, tree]);

  const loading = platformsLoading || pagesLoading;
  const canReorder = isSuperAdmin && !search.trim() && !reordering;

  const stats = useMemo(() => {
    const childPages = pages.filter((p) => !isCategoryPage(p));
    return {
      categories: pages.filter(isCategoryPage).length,
      pages: childPages.length,
      active: pages.filter((p) => p.isActive !== false).length,
    };
  }, [pages]);

  const toggleCategory = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !(prev[id] !== false) }));
  };

  const persistReorder = async (items) => {
    setReordering(true);
    try {
      await pageAPI.reorder({ platformKey, items });
      await loadPages();
    } catch (err) {
      await loadPages();
      Swal.fire({ icon: "error", title: "Reorder failed", text: err.message });
    } finally {
      setReordering(false);
    }
  };

  const handleCategoryDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    if (active.data.current?.type !== "category" || over.data.current?.type !== "category") {
      return;
    }

    const oldIndex = localCategories.findIndex((c) => getPageId(c) === active.id);
    const newIndex = localCategories.findIndex((c) => getPageId(c) === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(localCategories, oldIndex, newIndex);
    setLocalCategories(next);

    await persistReorder(
      next.map((cat, sortOrder) => ({
        pageId: getPageId(cat),
        sortOrder,
        parentId: null,
      }))
    );
  };

  const handlePageDragEnd = async (parentId, event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeParent = String(active.data.current?.parentId || "");
    const overParent = String(over.data.current?.parentId || "");
    if (
      active.data.current?.type !== "page" ||
      over.data.current?.type !== "page" ||
      activeParent !== overParent ||
      activeParent !== String(parentId)
    ) {
      return;
    }

    const list = localChildren[parentId] || [];
    const oldIndex = list.findIndex((p) => getPageId(p) === active.id);
    const newIndex = list.findIndex((p) => getPageId(p) === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(list, oldIndex, newIndex);
    setLocalChildren((prev) => ({ ...prev, [parentId]: next }));

    await persistReorder(
      next.map((page, sortOrder) => ({
        pageId: getPageId(page),
        sortOrder,
        parentId,
      }))
    );
  };

  const handleUncategorizedDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    if (active.data.current?.type !== "page" || over.data.current?.type !== "page") return;
    if (
      String(active.data.current?.parentId || "") !== "" ||
      String(over.data.current?.parentId || "") !== ""
    ) {
      return;
    }

    const oldIndex = localUncategorized.findIndex((p) => getPageId(p) === active.id);
    const newIndex = localUncategorized.findIndex((p) => getPageId(p) === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(localUncategorized, oldIndex, newIndex);
    setLocalUncategorized(next);

    await persistReorder(
      next.map((page, sortOrder) => ({
        pageId: getPageId(page),
        sortOrder,
        parentId: null,
      }))
    );
  };

  const openAddCategory = () => {
    setFormMode("category");
    setForm({
      ...emptyCategoryForm,
      menuPlacement: defaultMenuPlacement,
    });
    setDrawerOpen(true);
  };

  const openAddPage = (parentId = "") => {
    if (parentPages.length === 0) {
      Swal.fire({
        icon: "info",
        title: "Add a category first",
        text: "Child pages need a parent page. Create a category, then add pages under it.",
      });
      return;
    }
    const parent = parentPages.find((p) => getPageId(p) === parentId);
    setFormMode("page");
    setForm({
      ...emptyPageForm,
      parentId: parentId || "",
      menuPlacement: getMenuPlacement(parent) || defaultMenuPlacement,
    });
    setDrawerOpen(true);
  };

  const openEdit = (page) => {
    const category = isCategoryPage(page);
    const parentId = getParentId(page);
    setFormMode(category ? "category" : "page");
    setForm({
      pageId: getPageId(page),
      pageSlug: getPageSlug(page),
      pageName: page.pageName || "",
      parentId,
      companyIds: getCompanyIdsFromPage(page),
      menuPlacement: getMenuPlacement(page) || defaultMenuPlacement,
      isCategory: category,
      isTopLevel: category || !parentId,
      isActive: page.isActive !== false,
    });
    setDrawerOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const pageSlug = normalizePageSlug(form.pageSlug);
    if (!form.pageName.trim() || !pageSlug) {
      Swal.fire({ icon: "warning", title: "Name and slug are required" });
      return;
    }

    const isCategory = formMode === "category";
    if (!isCategory && !form.parentId) {
      Swal.fire({ icon: "warning", title: "Parent page is required" });
      return;
    }

    const menuPlacement = String(form.menuPlacement || "").trim();
    if (!menuPlacement) {
      Swal.fire({
        icon: "warning",
        title: "Select where to add this",
        text: "Choose a menu placement (e.g. Side Navigation).",
      });
      return;
    }

    const companyIds = Array.isArray(form.companyIds)
      ? form.companyIds.map(String).filter(Boolean)
      : [];
    if (companyIds.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Select at least one company",
        text: "Choose which companies can access this page.",
      });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        platformKey,
        pageName: form.pageName.trim(),
        pageSlug,
        menuPlacement,
        isCategory,
        isTopLevel: isCategory ? true : !form.parentId,
        isActive: Boolean(form.isActive),
        companyIds,
      };
      if (!isCategory && form.parentId) {
        payload.parentId = form.parentId;
        payload.isTopLevel = false;
      }
      if (form.pageId) payload.pageId = form.pageId;

      await pageAPI.upsert(payload);
      setDrawerOpen(false);
      await loadPages();
      Swal.fire({
        icon: "success",
        title: form.pageId
          ? isCategory
            ? "Category updated"
            : "Page updated"
          : isCategory
            ? "Category created"
            : "Page created",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Save failed", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (page) => {
    const id = getPageId(page);
    const name = page.pageName || getPageSlug(page) || "this item";
    if (!id) {
      Swal.fire({ icon: "error", title: "Delete failed", text: "Page ID is missing." });
      return;
    }

    const confirm = await Swal.fire({
      title: isCategoryPage(page) ? "Delete category?" : "Delete page?",
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
      await pageAPI.delete(id);
      await loadPages();
      Swal.fire({
        icon: "success",
        title: "Deleted",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Delete failed", text: err.message });
    } finally {
      setDeletingId(null);
    }
  };

  if (!platformKey) {
    return (
      <div className="p-6 text-center text-sm text-gray-500">
        Platform not found.{" "}
        <Link to="/dashboard/rbac/pages" className="font-semibold text-[#003366] hover:underline">
          Back to platforms
        </Link>
      </div>
    );
  }

  const categoryIds = localCategories.map(getPageId).filter(Boolean);
  const uncategorizedIds = localUncategorized.map(getPageId).filter(Boolean);

  return (
    <>
      <RbacPageHeader
        title={platformName}
        description={`Organize categories and pages for the ${platformName} platform.`}
        actions={
          <>
            <Link to="/dashboard/rbac/pages" className={rbacBtnSecondary}>
              <ArrowLeft size={15} />
              Platforms
            </Link>
            <button
              type="button"
              onClick={() => loadPages()}
              disabled={loading || reordering}
              className={rbacBtnSecondary}
            >
              <RefreshCw size={15} className={loading || reordering ? "animate-spin" : ""} />
              Refresh
            </button>
            {isSuperAdmin && (
              <>
                <button type="button" onClick={openAddCategory} className={rbacBtnSecondary}>
                  <Plus size={15} />
                  Add Category
                </button>
                <button type="button" onClick={() => openAddPage()} className={rbacBtnPrimary}>
                  <Plus size={15} />
                  Add Page
                </button>
              </>
            )}
          </>
        }
      />

      <div className="space-y-5 p-5 sm:p-6">
        <WorkspaceBanner
          title={platformName}
          subtitle="Platform pages"
          initials={(platformName || "PG").slice(0, 2).toUpperCase()}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={FolderTree}
            label="Categories"
            value={loading ? "—" : stats.categories}
            hint="Parent groups"
            accent="navy"
          />
          <StatCard
            icon={FileText}
            label="Pages"
            value={loading ? "—" : stats.pages}
            hint="Child pages"
            accent="cyan"
          />
          <StatCard
            icon={CheckCircle2}
            label="Active"
            value={loading ? "—" : stats.active}
            hint="Available in role config"
            accent="slate"
          />
        </div>

        <RbacCard className="overflow-hidden">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-gray-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-[#003366]">Page tree</h2>
              <p className="mt-0.5 text-xs text-gray-500">
                {localCategories.length} categor{localCategories.length === 1 ? "y" : "ies"}
                {search ? " matching search" : ""}
                {canReorder ? " · Drag to reorder" : ""}
              </p>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <div className="w-40">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={rbacSelect}
                >
                  <option value="">All</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div className="relative w-full sm:w-64">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search pages…"
                  className={`${rbacSelect} pl-9`}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-[#00ADE5]" size={32} />
            </div>
          ) : localCategories.length === 0 && localUncategorized.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00ADE5]/10">
                <FileText className="text-[#00ADE5]" size={26} strokeWidth={1.75} />
              </div>
              <p className="mt-4 text-sm font-medium text-gray-900">No pages found</p>
              <p className="mt-1 text-sm text-gray-500">
                Create a category first, then add child pages under it.
              </p>
              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={openAddCategory}
                  className={`${rbacBtnPrimary} mt-5`}
                >
                  <Plus size={15} />
                  Add Category
                </button>
              )}
            </div>
          ) : (
            <div>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleCategoryDragEnd}
              >
                <SortableContext items={categoryIds} strategy={verticalListSortingStrategy}>
                  {localCategories.map((category, index) => {
                    const id = getPageId(category);
                    return (
                      <SortableCategoryBlock
                        key={id}
                        category={category}
                        index={index}
                        childrenPages={localChildren[id] || []}
                        isOpen={expanded[id] !== false}
                        canReorder={canReorder}
                        reordering={reordering}
                        deletingId={deletingId}
                        isSuperAdmin={isSuperAdmin}
                        onToggle={toggleCategory}
                        onAddPage={openAddPage}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                        onEditPage={openEdit}
                        onDeletePage={handleDelete}
                        onPageDragEnd={handlePageDragEnd}
                        sensors={sensors}
                      />
                    );
                  })}
                </SortableContext>
              </DndContext>

              {localUncategorized.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 bg-gradient-to-r from-[#003366]/5 via-[#f8fafc] to-white px-5 py-3.5">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#003366]/10 text-[#003366]">
                      <FileText size={16} />
                    </span>
                    <span className="text-sm font-bold uppercase tracking-wide text-[#003366]">
                      Uncategorized
                    </span>
                    <span className="ml-auto rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-gray-600 ring-1 ring-gray-200/80">
                      {localUncategorized.length} Page
                      {localUncategorized.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleUncategorizedDragEnd}
                  >
                    <SortableContext
                      items={uncategorizedIds}
                      strategy={verticalListSortingStrategy}
                    >
                      {localUncategorized.map((page) => (
                        <SortablePageRow
                          key={getPageId(page)}
                          page={page}
                          parentId=""
                          canReorder={canReorder}
                          isDeleting={deletingId === getPageId(page)}
                          isSuperAdmin={isSuperAdmin}
                          onEdit={openEdit}
                          onDelete={handleDelete}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                </div>
              )}
            </div>
          )}
        </RbacCard>
      </div>

      <PageFormDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        form={form}
        setForm={setForm}
        onSubmit={handleSave}
        saving={saving}
        mode={formMode}
        platformName={platformName}
        parentPages={parentPages}
        companies={companies || []}
        placements={placements || []}
      />
    </>
  );
}
