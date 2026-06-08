import clsx from "clsx";
import { X } from "lucide-react";
import Modal from "../Modal";

export function CountBadgeButton({
  count = 0,
  icon: Icon,
  title,
  onClick,
  disabled = false,
  allowZeroClick = false,
}) {
  const canClick = onClick && (allowZeroClick || count > 0) && !disabled;

  return (
    <button
      type="button"
      onClick={canClick ? onClick : undefined}
      disabled={disabled || !canClick}
      title={title}
      className={clsx(
        "group/count inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[#00ADE5]/20",
        canClick
          ? "border-[#003366]/10 bg-white text-[#003366] hover:border-[#00ADE5]/35 hover:bg-[#00ADE5]/5"
          : "cursor-default border-gray-200 bg-gray-50 text-gray-400"
      )}
    >
      {Icon && (
        <Icon
          className={clsx(
            "h-3.5 w-3.5",
            canClick
              ? "text-[#00ADE5] transition group-hover/count:text-[#003366]"
              : "text-gray-300"
          )}
          strokeWidth={2.25}
        />
      )}
      <span>{count}</span>
    </button>
  );
}

export function ListViewModal({
  isOpen,
  onClose,
  title,
  subtitle,
  labelledBy,
  items = [],
  emptyIcon: EmptyIcon,
  emptyTitle = "No items found",
  emptyHint = "",
  renderItem,
  tableMode = false,
  tableHeaders = [],
  footerLabel = "Close",
  panelClassName = "flex max-w-lg flex-col",
  headerIcon: HeaderIcon = null,
  enhancedTable = false,
  children,
}) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      innerScroll
      panelClassName={panelClassName}
      labelledBy={labelledBy}
    >
      <div className="shrink-0 bg-gradient-to-r from-[#003366] to-[#004080] px-5 py-5 text-white sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            {HeaderIcon && (
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 shadow-sm backdrop-blur-sm">
                <HeaderIcon size={22} />
              </span>
            )}
            <div className="min-w-0">
              <h3
                id={labelledBy}
                className="truncate text-xl font-bold sm:text-2xl"
              >
                {title}
              </h3>
              {subtitle && (
                <p className="mt-1 text-sm text-blue-100/95">{subtitle}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 transition hover:bg-white/20"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {children && (
        <div className="shrink-0 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white px-5 py-3.5 sm:px-6">
          {children}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6 sm:py-5">
        {items.length > 0 ? (
          tableMode ? (
            <div
              className={clsx(
                "overflow-hidden shadow-sm",
                enhancedTable
                  ? "rounded-2xl border border-gray-200/90"
                  : "rounded-xl border border-gray-200"
              )}
            >
              <table className="min-w-full text-sm">
                {tableHeaders.length > 0 && (
                  <thead>
                    <tr
                      className={
                        enhancedTable
                          ? "bg-gradient-to-r from-[#003366] to-[#004080] text-white"
                          : "bg-slate-50"
                      }
                    >
                      {tableHeaders.map((header) => (
                        <th
                          key={header}
                          className={clsx(
                            "px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider",
                            enhancedTable ? "text-white/95" : "text-gray-500"
                          )}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody
                  className={clsx(
                    "divide-y",
                    enhancedTable ? "divide-gray-100 bg-white" : "divide-gray-100 bg-white"
                  )}
                >
                  {items.map((item, index) => (
                    <tr
                      key={item.id ?? item._id ?? item.key ?? index}
                      className="transition-colors hover:bg-slate-50/80"
                    >
                      {renderItem(item, index)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <ul className="space-y-2">
              {items.map((item, index) => (
                <li key={item.id ?? item.key ?? index}>
                  {renderItem(item, index)}
                </li>
              ))}
            </ul>
          )
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gradient-to-b from-slate-50 to-white px-6 py-12 text-center">
            {EmptyIcon && (
              <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00ADE5]/10">
                <EmptyIcon className="h-7 w-7 text-[#00ADE5]" />
              </span>
            )}
            <p className="mt-4 text-base font-semibold text-gray-800">
              {emptyTitle}
            </p>
            {emptyHint && (
              <p className="mx-auto mt-2 max-w-xs text-sm text-gray-500">
                {emptyHint}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex shrink-0 justify-end border-t border-gray-100 bg-white px-5 py-3 sm:px-6">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-gray-200 px-4 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          {footerLabel}
        </button>
      </div>
    </Modal>
  );
}

export function itemInitials(name) {
  const parts = String(name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export const ITEM_AVATAR_GRADIENTS = [
  "from-[#003366] to-[#004080]",
  "from-[#00ADE5] to-[#0088cc]",
  "from-[#004080] to-[#005a9e]",
  "from-[#002244] to-[#003366]",
];

export function ListItemCard({ name, index = 0, action = null }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={clsx(
            "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-xs font-bold text-white",
            ITEM_AVATAR_GRADIENTS[index % ITEM_AVATAR_GRADIENTS.length]
          )}
        >
          {itemInitials(name)}
        </span>
        <span className="min-w-0 text-sm font-semibold text-gray-800">
          {name}
        </span>
      </div>
      {action}
    </div>
  );
}
