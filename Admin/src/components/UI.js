import React, { useState } from "react";

// ── Spinner ───────────────────────────────────────────────────────
export function Spinner({ fullScreen = false }) {
  if (fullScreen)
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
        <div className="bg-white rounded-xl p-8 flex flex-col items-center gap-3 shadow-xl">
          <div
            className="spinner"
            style={{
              borderTopColor: "#640101",
              borderColor: "rgba(100,1,1,0.2)",
              width: 40,
              height: 40,
              borderWidth: 4,
            }}
          />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  return <div className="spinner" />;
}

// ── Confirm Delete Modal ──────────────────────────────────────────
export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  message = "Are you sure you want to delete this item? This action cannot be undone.",
}) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <i className="fa fa-exclamation-triangle text-red-600" />
          </div>
          <h3 className="font-semibold text-gray-800">Confirm Delete</h3>
        </div>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-danger"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Data Table with search + pagination ──────────────────────────
export function DataTable({
  columns,
  data,
  searchPlaceholder = "Search...",
  actions,
  emptyMessage = "No records found.",
  hideControls = false,
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // If no columns are marked searchable, skip internal filtering entirely
  // (the parent component handles its own search/filter externally).
  const hasSearchableCols = columns.some((col) => col.searchable);
  const filtered =
    !hasSearchableCols || !search
      ? data
      : data.filter((row) =>
          columns.some((col) => {
            if (!col.searchable) return false;
            const val = col.value ? col.value(row) : row[col.key];
            return String(val ?? "")
              .toLowerCase()
              .includes(search.toLowerCase());
          }),
        );

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice(page * pageSize, page * pageSize + pageSize);

  return (
    <div>
      {/* Search bar — hidden when parent manages search externally */}
      {!hideControls && (
        <div className="mb-4 flex gap-2 items-center">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by coupon code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>
          <select
            className=""
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(0);
            }}
          >
            {[5, 10, 25, 100].map((s) => (
              <option key={s} value={s}>
                {s} / page
              </option>
            ))}
          </select>
        </div>
      )}
      {/* Table */}
      <div className="overflow-x-auto rounded-xl shadow">
        <table className="kanchira-table">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold w-12">
                #
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-sm font-semibold"
                >
                  {col.label}
                </th>
              ))}
              {actions && (
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 2}
                  className="text-center py-10 text-gray-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paged.map((row, i) => (
                <tr key={row._id || i}>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {page * pageSize + i + 1}
                  </td>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-4 py-3 text-sm text-gray-700"
                    >
                      {col.render
                        ? col.render(row)
                        : col.value
                          ? col.value(row)
                          : (row[col.key] ?? "—")}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {actions(row, page * pageSize + i)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination — hidden when parent manages pagination externally */}
      {!hideControls && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
          <span>
            Showing {page * pageSize + 1}–
            {Math.min((page + 1) * pageSize, filtered.length)} of{" "}
            {filtered.length}
          </span>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              ‹ Prev
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, idx) => {
              const pg =
                totalPages <= 5
                  ? idx
                  : Math.max(0, Math.min(page - 2, totalPages - 5)) + idx;
              return (
                <button
                  key={pg}
                  className={`px-3 py-1 rounded border ${pg === page ? "text-white border-transparent" : "border-gray-200 hover:bg-gray-50"}`}
                  style={pg === page ? { backgroundColor: "#640101" } : {}}
                  onClick={() => setPage(pg)}
                >
                  {pg + 1}
                </button>
              );
            })}
            <button
              className="px-3 py-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Next ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page wrapper ──────────────────────────────────────────────────
export function PageHeader({
  title,
  buttonLabel,
  onButtonClick,
  backPath,
  navigate,
}) {
  return (
    <div className="page-header">
      <div className="flex items-center gap-3">
        {backPath && (
          <button
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
            onClick={() => navigate(backPath)}
          >
            <i className="fa fa-arrow-left" />
          </button>
        )}
        <h1 className="page-title">{title}</h1>
      </div>
      {buttonLabel && (
        <button
          className="btn-primary flex items-center gap-2"
          onClick={onButtonClick}
        >
          <i className="fa fa-plus" /> {buttonLabel}
        </button>
      )}
    </div>
  );
}

// ── Form Card ─────────────────────────────────────────────────────
export function FormCard({
  title,
  children,
  onSubmit,
  onCancel,
  submitLabel = "Save",
  loading,
}) {
  return (
    <div className="kanchira-card max-w-9xl">
      <h2 className="text-lg font-semibold mb-5" style={{ color: "#640101" }}>
        {title}
      </h2>
      <form onSubmit={onSubmit}>
        <div className="space-y-4">{children}</div>
        <div className="flex gap-3 justify-end mt-6">
          {onCancel && (
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="btn-primary flex items-center gap-2"
            disabled={loading}
          >
            {loading && <Spinner />} {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Form Field ────────────────────────────────────────────────────
export function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────
export function Badge({ value, truthy = "Active", falsy = "Inactive" }) {
  const isTrue = value === true || value === "true" || value === 1;
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${isTrue ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
    >
      {isTrue ? truthy : falsy}
    </span>
  );
}

// ── Image Upload ──────────────────────────────────────────────────
export function ImageUpload({
  label = "Upload Image",
  preview,
  onChange,
  loading,
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="flex items-center gap-4">
        <label className="cursor-pointer flex items-center gap-2 border-2 border-dashed border-gray-300 rounded-lg px-4 py-3 hover:border-yellow-500 transition">
          {loading ? <Spinner /> : <i className="fa fa-upload text-gray-400" />}
          <span className="text-sm text-gray-500">
            {loading ? "Uploading..." : "Choose file"}
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onChange}
            disabled={loading}
          />
        </label>
        {preview && <img src={preview} alt="preview" className="img-preview" />}
      </div>
    </div>
  );
}
