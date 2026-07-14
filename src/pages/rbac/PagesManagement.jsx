import { useMemo } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowRight, FileText, Laptop, Loader2, RefreshCw } from "lucide-react";
import { pageAPI, platformAPI } from "../../services/api";
import { useRbacFetch } from "../../hooks/useRbacFetch";
import PlatformPages from "./PlatformPages";
import {
  RbacPageHeader,
  RbacCard,
  WorkspaceBanner,
} from "../../components/rbac/RbacContent";
import { RbacBadge, rbacBtnSecondary } from "../../components/rbac/rbacTheme";

function getPlatformKey(platform) {
  return platform?.platformKey || platform?.key || "";
}

function getPlatformName(platform) {
  return platform?.platformName || platform?.name || getPlatformKey(platform) || "Platform";
}

function countPagesForPlatform(pages, platformKey) {
  const want = String(platformKey || "").toLowerCase();
  if (!want) return 0;
  return (pages || []).filter((p) => {
    const key = String(p.platformKey || p.platform || "").toLowerCase();
    return key === want;
  }).length;
}

function PlatformCards() {
  const {
    data: platforms,
    loading: platformsLoading,
    reload: loadPlatforms,
  } = useRbacFetch(
    async () => {
      const res = await platformAPI.getPlatforms({ isActive: "true" });
      return Array.isArray(res.data) ? res.data : [];
    },
    [],
    { initialData: [] }
  );

  const {
    data: pages,
    loading: pagesLoading,
    reload: loadPages,
  } = useRbacFetch(
    async () => {
      const res = await pageAPI.getPages();
      return Array.isArray(res.data) ? res.data : [];
    },
    [],
    { initialData: [] }
  );

  const loading = platformsLoading || pagesLoading;

  const cards = useMemo(() => {
    return (platforms || []).map((platform) => {
      const key = getPlatformKey(platform);
      return {
        key,
        name: getPlatformName(platform),
        description: platform.description || "",
        isActive: platform.isActive !== false,
        pageCount: countPagesForPlatform(pages, key),
      };
    });
  }, [platforms, pages]);

  const handleRefresh = () => {
    loadPlatforms();
    loadPages();
  };

  return (
    <>
      <RbacPageHeader
        title="Page Management"
        description="Select a platform to view and create its pages."
        actions={
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className={rbacBtnSecondary}
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        }
      />

      <div className="space-y-5 p-5 sm:p-6">
        <WorkspaceBanner
          title="Pages by platform"
          subtitle="Access control modules"
          initials="PG"
        />

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#00ADE5]" size={32} />
          </div>
        ) : cards.length === 0 ? (
          <RbacCard className="px-5 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00ADE5]/10">
              <Laptop className="text-[#00ADE5]" size={26} strokeWidth={1.75} />
            </div>
            <p className="mt-4 text-sm font-medium text-gray-900">No platforms found</p>
            <p className="mt-1 text-sm text-gray-500">
              Create a platform first, then add pages under it.
            </p>
            <Link
              to="/dashboard/rbac/platforms"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#003366] hover:underline"
            >
              Go to Platform Management
              <ArrowRight size={14} />
            </Link>
          </RbacCard>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => (
              <Link
                key={card.key}
                to={`/dashboard/rbac/pages/${encodeURIComponent(card.key)}`}
                className="group block rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm transition hover:border-[#00ADE5]/40 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#003366]/10 to-white text-[#003366]">
                    <Laptop size={20} />
                  </span>
                  <RbacBadge variant={card.isActive ? "success" : "muted"}>
                    {card.isActive ? "Active" : "Inactive"}
                  </RbacBadge>
                </div>

                <h3 className="mt-4 text-base font-semibold text-[#003366] group-hover:text-[#004080]">
                  {card.name}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                  {card.description || "Manage pages for this platform"}
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600">
                    <FileText size={14} className="text-[#00ADE5]" />
                    {card.pageCount} page{card.pageCount === 1 ? "" : "s"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#003366] opacity-80 transition group-hover:opacity-100">
                    Open
                    <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/**
 * /dashboard/rbac/pages → platform cards
 * /dashboard/rbac/pages/:platformKey → pages for that platform
 */
export default function PagesManagement() {
  const { pathname } = useLocation();
  const params = useParams();

  // Prefer pathname parse — nested dashboard <Routes> + splat can be unreliable
  const fromPath = pathname.match(/\/rbac\/pages\/([^/]+)\/?$/);
  const fromSplat = params["*"] || params.platformKey || "";
  const raw = fromPath?.[1] || String(fromSplat).split("/").filter(Boolean)[0] || "";
  const platformKey = decodeURIComponent(raw);

  if (platformKey) {
    return <PlatformPages platformKey={platformKey} />;
  }

  return <PlatformCards />;
}
