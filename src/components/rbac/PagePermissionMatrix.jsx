import clsx from "clsx";
import { getEntityId, PAGE_ACTION_COLUMNS } from "./rolePermissions";

function PermCell({ checked, disabled, onChange, readOnly }) {
  if (readOnly) {
    return (
      <td className="px-2 py-3 text-center">
        <span
          className={clsx(
            "inline-flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold",
            checked
              ? "bg-[#00ADE5]/15 text-[#003366]"
              : "bg-gray-100 text-gray-300"
          )}
        >
          {checked ? "✓" : "—"}
        </span>
      </td>
    );
  }

  return (
    <td className="px-2 py-3 text-center">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="h-[18px] w-[18px] cursor-pointer rounded border-gray-300 text-[#00ADE5] focus:ring-[#00ADE5]/25 disabled:cursor-not-allowed disabled:opacity-40"
      />
    </td>
  );
}

export default function PagePermissionMatrix({
  pages = [],
  columnPermissionMap = {},
  pagePermMap = {},
  onToggle,
  onToggleRow,
  readOnly = false,
  emptyMessage = "No pages available. Run System Setup first.",
}) {
  const hasColumns = PAGE_ACTION_COLUMNS.some((c) => columnPermissionMap[c.id]);

  if (pages.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-12 text-center">
        <p className="text-sm text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-[#003366] text-white">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">
                Page
              </th>
              {PAGE_ACTION_COLUMNS.map((col) => (
                <th
                  key={col.id}
                  className="px-2 py-3 text-center text-[11px] font-semibold uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
              {!readOnly && onToggleRow && (
                <th className="px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-wider">
                  All
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {pages.map((page, idx) => {
              const pageId = getEntityId(page);
              const rowFlags = PAGE_ACTION_COLUMNS.map((col) => {
                const permId = columnPermissionMap[col.id];
                return Boolean(permId && pagePermMap[pageId]?.has(permId));
              });
              const allSelected =
                rowFlags.length > 0 && rowFlags.every(Boolean) && rowFlags.some(Boolean);

              return (
                <tr
                  key={pageId}
                  className={clsx(
                    "transition-colors",
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50/60",
                    "hover:bg-[#00ADE5]/5"
                  )}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{page.pageName}</p>
                    <p className="font-mono text-[11px] text-gray-400">/{page.pageKey}</p>
                  </td>
                  {PAGE_ACTION_COLUMNS.map((col) => {
                    const permId = columnPermissionMap[col.id];
                    const checked = Boolean(
                      permId && pagePermMap[pageId]?.has(permId)
                    );
                    return (
                      <PermCell
                        key={col.id}
                        checked={checked}
                        disabled={!permId || !hasColumns}
                        readOnly={readOnly}
                        onChange={() => onToggle?.(pageId, col.id)}
                      />
                    );
                  })}
                  {!readOnly && onToggleRow && (
                    <td className="px-3 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => onToggleRow(pageId, !allSelected)}
                        className="text-xs font-semibold text-[#00ADE5] hover:underline"
                      >
                        {allSelected ? "Clear" : "All"}
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!hasColumns && (
        <p className="border-t border-amber-100 bg-amber-50 px-4 py-2.5 text-xs text-amber-800">
          View, Add, Edit, Delete permissions are missing — run System Setup first.
        </p>
      )}
    </div>
  );
}

export function ReadOnlyPermissionMatrix({ pages, pagePermissions, columnPermissionMap }) {
  const pageMap = new Map();
  (pagePermissions || []).forEach((pp) => {
    const pageId = pp.pageId || getEntityId(pp.page);
    pageMap.set(pageId, pp);
  });

  const displayPages =
    pages.length > 0
      ? pages
      : (pagePermissions || []).map((pp) => ({
          pageId: pp.pageId,
          pageName: pp.pageName || pp.pageKey,
          pageKey: pp.pageKey,
        }));

  const syntheticPermMap = {};
  displayPages.forEach((page) => {
    const pageId = getEntityId(page);
    const pp = pageMap.get(pageId);
    if (!pp) return;
    const set = new Set();
    PAGE_ACTION_COLUMNS.forEach((col) => {
      const permId = columnPermissionMap[col.id];
      if (!permId) return;
      const raw = pp.permissions || pp.permissionKeys || pp.permissionIds || [];
      const has = raw.some((p) => {
        if (typeof p === "string") {
          const k = p.toLowerCase();
          return col.keys.includes(k) || (k === "create" && col.id === "add");
        }
        const key = String(p.permissionKey || p.permissionName || "").toLowerCase();
        return col.keys.includes(key) || getEntityId(p) === permId;
      });
      if (has) set.add(permId);
    });
    if (set.size) syntheticPermMap[pageId] = set;
  });

  return (
    <PagePermissionMatrix
      pages={displayPages}
      columnPermissionMap={columnPermissionMap}
      pagePermMap={syntheticPermMap}
      readOnly
      emptyMessage="No page access configured."
    />
  );
}
