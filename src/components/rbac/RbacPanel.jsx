export default function RbacPanel({ title, description, actions, children, noPadding = false }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      {(title || actions) && (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 bg-gray-50/40 px-5 py-4">
          <div>
            {title && (
              <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
            )}
            {description && (
              <p className="mt-0.5 text-sm text-gray-500">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          )}
        </div>
      )}
      <div className={noPadding ? "" : "p-5"}>{children}</div>
    </div>
  );
}
