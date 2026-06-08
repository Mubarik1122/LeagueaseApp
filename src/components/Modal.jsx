import { useEffect } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";

let openModalCount = 0;

function lockBodyScroll() {
  if (openModalCount === 0) {
    document.body.dataset.modalPrevOverflow = document.body.style.overflow || "";
    document.body.style.overflow = "hidden";
  }
  openModalCount += 1;
}

function unlockBodyScroll() {
  openModalCount = Math.max(0, openModalCount - 1);
  if (openModalCount === 0) {
    document.body.style.overflow =
      document.body.dataset.modalPrevOverflow || "";
    delete document.body.dataset.modalPrevOverflow;
  }
}

export default function Modal({
  isOpen,
  onClose,
  children,
  panelClassName = "",
  backdropClassName = "",
  labelledBy,
  describedBy,
  closeOnBackdrop = true,
  /** When true, panel does not scroll — children use flex + overflow on the body (fixed header/footer). */
  innerScroll = false,
}) {
  useEffect(() => {
    if (!isOpen) return undefined;
    lockBodyScroll();
    return () => unlockBodyScroll();
  }, [isOpen]);

  if (!isOpen) return null;

  const hasCustomMaxWidth = /\bmax-w-/.test(panelClassName);

  return createPortal(
    <div
      className={clsx(
        "animate-modal-backdrop fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-4",
        backdropClassName
      )}
      onClick={closeOnBackdrop ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
    >
      <div
        className={clsx(
          "animate-modal-content flex w-full min-h-0 max-h-[min(85dvh,calc(100dvh-2rem))] flex-col rounded-2xl bg-white shadow-2xl",
          innerScroll
            ? "overflow-hidden"
            : "overflow-y-auto overscroll-contain",
          !hasCustomMaxWidth && "max-w-lg",
          panelClassName
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
