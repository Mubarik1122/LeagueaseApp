import { useEffect } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { X } from "lucide-react";

let openDrawerCount = 0;

function lockBodyScroll() {
  if (openDrawerCount === 0) {
    document.body.dataset.drawerPrevOverflow = document.body.style.overflow || "";
    document.body.style.overflow = "hidden";
  }
  openDrawerCount += 1;
}

function unlockBodyScroll() {
  openDrawerCount = Math.max(0, openDrawerCount - 1);
  if (openDrawerCount === 0) {
    document.body.style.overflow = document.body.dataset.drawerPrevOverflow || "";
    delete document.body.dataset.drawerPrevOverflow;
  }
}

export default function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  widthClass = "max-w-2xl",
  labelledBy,
  tone = "default",
}) {
  useEffect(() => {
    if (!isOpen) return undefined;
    lockBodyScroll();
    return () => unlockBodyScroll();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isRole = tone === "role";

  return createPortal(
    <div className="fixed inset-0 z-[110] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-[#003366]/30 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close drawer"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={clsx(
          "relative flex h-full w-full flex-col shadow-2xl",
          "animate-[slideInRight_0.28s_cubic-bezier(0.16,1,0.3,1)]",
          isRole ? "bg-[#f4f7fa]" : "bg-white",
          widthClass
        )}
      >
        <div
          className={clsx(
            "shrink-0 border-b px-6 py-5",
            isRole
              ? "border-gray-200/80 bg-white"
              : "border-gray-200 bg-white"
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2
                id={labelledBy}
                className="text-xl font-semibold tracking-tight text-[#003366]"
              >
                {title}
              </h2>
              {subtitle && (
                <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-gray-200 bg-white p-2 text-gray-400 shadow-sm transition hover:border-gray-300 hover:text-gray-700"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div
          className={clsx(
            "flex-1 overflow-y-auto overscroll-contain",
            isRole ? "px-5 py-5 sm:px-6" : "px-6 py-5"
          )}
        >
          {children}
        </div>

        {footer && (
          <div className="shrink-0 border-t border-gray-200 bg-white px-6 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
            {footer}
          </div>
        )}
      </aside>
    </div>,
    document.body
  );
}
