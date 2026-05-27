import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getSuperAdminCategories as getCategories,
  getSuperAdminCategoryById as getCategoryById,
  getSuperAdminCategoriesWithSub as getCategoriesWithSubcategories,
  createSuperAdminCategory as createCategory,
  updateSuperAdminCategory,
  deleteSuperAdminCategory as deleteCategory,
  superAdminUploadImage as uploadImage,
} from "../../services/superAdminApi";

// ─── Shared Color Theme ─────────────────────────────────────────────────────
const O = {
  primary: "#640101",
  dark: "#3b0000",
  gold: "#D2AE4E",
  light: "#fdf8f0",
};

// ─── Shared UI Helpers ──────────────────────────────────────────────────────
const PageHeader = ({
  title,
  buttonLabel,
  onButtonClick,
  backPath,
  navigate,
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
    <div>
      <h2 className="text-xl font-black text-gray-800">{title}</h2>
    </div>
    {buttonLabel && onButtonClick && (
      <button
        onClick={onButtonClick}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white border-0 cursor-pointer"
        style={{ backgroundColor: O.primary }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = O.dark;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = O.primary;
        }}
      >
        <i className="fa fa-plus" /> {buttonLabel}
      </button>
    )}
    {backPath && navigate && (
      <button
        onClick={() => navigate(backPath)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition font-medium text-sm"
      >
        <i className="fa fa-arrow-left" /> Back
      </button>
    )}
  </div>
);

const FormCard = ({
  title,
  children,
  onSubmit,
  onCancel,
  submitLabel,
  loading,
}) => (
  <form
    onSubmit={onSubmit}
    className="bg-white rounded-2xl shadow-sm p-6 space-y-5"
  >
    <h3 className="text-lg font-bold" style={{ color: O.primary }}>
      {title}
    </h3>
    <div className="space-y-4">{children}</div>
    <div className="flex gap-3 pt-4 border-t border-gray-100">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 py-3 rounded-xl font-semibold text-sm border-0 cursor-pointer bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={loading}
        className="flex-1 py-3 rounded-xl font-semibold text-sm border-0 cursor-pointer text-white transition"
        style={{ backgroundColor: loading ? "#fdba74" : O.primary }}
      >
        {loading ? "Saving…" : submitLabel}
      </button>
    </div>
  </form>
);

const Field = ({ label, children, error, required }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const ImageUpload = ({
  preview,
  onChange,
  loading,
  label = "Upload Image",
}) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label}
    </label>
    <div className="flex items-center gap-4">
      <label className="cursor-pointer px-4 py-2 rounded-lg border border-dashed border-gray-300 hover:border-gray-400 transition text-sm text-gray-600">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onChange}
        />
        <i className="fa fa-cloud-upload mr-2" /> Choose File
      </label>
      {loading && <span className="text-sm text-gray-400">Uploading...</span>}
    </div>
    {preview && (
      <div className="mt-3">
        <img
          src={preview}
          alt="Preview"
          className="w-32 h-32 object-cover rounded-lg border border-gray-200"
        />
      </div>
    )}
  </div>
);

const Badge = ({ value }) => (
  <span
    className={`text-xs px-2.5 py-1 rounded-full font-semibold ${value ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
  >
    {value ? "Active" : "Inactive"}
  </span>
);

const ConfirmModal = ({ open, onClose, onConfirm }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <i className="fa fa-trash text-2xl text-red-500" />
        </div>
        <h3 className="font-black text-lg mb-1">Delete Category?</h3>
        <p className="text-sm text-gray-500 mb-4">
          This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm border-0 cursor-pointer bg-gray-100 text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm border-0 cursor-pointer text-white"
            style={{ backgroundColor: "#dc2626" }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── DataTable Component ────────────────────────────────────────────────────
const DataTable = ({ columns, data, searchPlaceholder, actions }) => {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const filtered = data.filter((row) =>
    columns.some(
      (col) =>
        col.searchable &&
        row[col.key] &&
        String(row[col.key]).toLowerCase().includes(search.toLowerCase()),
    ),
  );

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const av = a[sortKey] || "";
        const bv = b[sortKey] || "";
        return sortDir === "asc"
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av));
      })
    : filtered;

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <i className="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: `${O.primary}15` }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left px-4 py-3 text-xs font-bold text-gray-600 uppercase cursor-pointer select-none"
                  onClick={() => col.searchable && toggleSort(col.key)}
                >
                  {col.label}{" "}
                  {col.searchable && (
                    <i
                      className={`fa fa-sort text-gray-300 ml-1 ${sortKey === col.key ? "text-gray-600" : ""}`}
                    />
                  )}
                </th>
              ))}
              {actions && (
                <th className="text-center px-4 py-3 text-xs font-bold text-gray-600 uppercase">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr
                key={row._id || i}
                className="border-t border-gray-100 transition"
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = O.light)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "")
                }
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    {col.render ? col.render(row) : row[col.key] || "—"}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-3 text-center">{actions(row)}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
//  PAGE 1: SuperAdminCategoryList (Category List)
// ═════════════════════════════════════════════════════════════════════════════
export function SuperAdminCategoryList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await getCategories();
      setData(Array.isArray(r.data) ? r.data : []);
    } catch {
      toast.error("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async () => {
    try {
      await deleteCategory(deleteId);
      toast.success("Category deleted successfully!");
      setDeleteId(null);
      load();
    } catch {
      toast.error("Failed to delete category.");
    }
  };

  const columns = [
    {
      key: "image",
      label: "Image",
      render: (r) =>
        r.image ? (
          <img
            src={r.image}
            alt=""
            className="w-12 h-12 object-cover rounded-lg"
          />
        ) : (
          <span className="text-gray-300">—</span>
        ),
    },
    {
      key: "name",
      label: "Name",
      searchable: true,
      render: (r) => <span className="font-medium capitalize">{r.name}</span>,
    },
    { key: "slug", label: "Slug", searchable: true },
    {
      key: "available",
      label: "Status",
      render: (r) => <Badge value={r.available} />,
    },
    {
      key: "updatedAt",
      label: "Updated On",
      render: (r) =>
        r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : "—",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Category List"
        buttonLabel="Create Category"
        onButtonClick={() => navigate("/superadmin/category/create")}
      />
      {loading ? (
        <div className="flex justify-center py-12">
          <div
            className="w-10 h-10 border-4 rounded-full animate-spin"
            style={{
              borderColor: "rgba(100,1,1,0.2)",
              borderTopColor: O.primary,
            }}
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <DataTable
            columns={columns}
            data={data}
            searchPlaceholder="Search categories..."
            actions={(row) => (
              <div className="flex items-center justify-center gap-2">
                <button
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border-0 cursor-pointer transition"
                  style={{ backgroundColor: "#dbeafe", color: "#2563eb" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#2563eb";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#dbeafe";
                    e.currentTarget.style.color = "#2563eb";
                  }}
                  onClick={() =>
                    navigate("/superadmin/category/update", {
                      state: { item: row },
                    })
                  }
                >
                  <i className="fa fa-pencil" />
                </button>
                <button
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border-0 cursor-pointer transition"
                  style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#dc2626";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#fee2e2";
                    e.currentTarget.style.color = "#dc2626";
                  }}
                  onClick={() => setDeleteId(row._id)}
                >
                  <i className="fa fa-trash" />
                </button>
              </div>
            )}
          />
        </div>
      )}
      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//  PAGE 2: SuperAdminCategoryCreate (Create Category)
// ═════════════════════════════════════════════════════════════════════════════
export function SuperAdminCategoryCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    description: "",
    slug: "",
    image: "",
    available: true,
  });
  const [errors, setErrors] = useState({});
  const [imgLoading, setImgLoading] = useState(false);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name || form.name.length < 3)
      e.name = "Name must be at least 3 characters.";
    if (!form.description || form.description.length < 10)
      e.description = "Description must be at least 10 characters.";
    return e;
  };

  const handleImage = async (ev) => {
    const file = ev.target.files[0];
    if (!file) return;
    setImgLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await uploadImage(fd);
      setForm((f) => ({ ...f, image: data.imageUrl }));
      setPreview(data.imageUrl);
      toast.success("Image uploaded!");
    } catch {
      toast.error("Image upload failed.");
    } finally {
      setImgLoading(false);
    }
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setLoading(true);
    try {
      await createCategory(form);
      toast.success("Category created successfully!");
      navigate("/superadmin/category");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create category.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Create Category"
        backPath="/superadmin/category"
        navigate={navigate}
      />
      <FormCard
        title="New Category"
        onSubmit={handleSubmit}
        onCancel={() => navigate("/superadmin/category")}
        submitLabel="Create Category"
        loading={loading}
      >
        <Field label="Category Name" required error={errors.name}>
          <input
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 transition"
            placeholder="Enter category name"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
                slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
              })
            }
          />
        </Field>
        <Field label="Description" required error={errors.description}>
          <textarea
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 transition resize-none"
            rows={3}
            placeholder="Enter description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </Field>
        <Field label="Slug">
          <input
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 transition"
            placeholder="category-slug"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
        </Field>
        <Field label="Status">
          <select
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 transition"
            value={form.available ? "true" : "false"}
            onChange={(e) =>
              setForm({ ...form, available: e.target.value === "true" })
            }
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </Field>
        <ImageUpload
          preview={preview}
          onChange={handleImage}
          loading={imgLoading}
        />
      </FormCard>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//  PAGE 3: SuperAdminCategoryUpdate (Update Category)
// ═════════════════════════════════════════════════════════════════════════════
export function SuperAdminCategoryUpdate() {
  const navigate = useNavigate();
  const location = useLocation();
  const item = location.state?.item;

  const [form, setForm] = useState(() => {
    if (item) {
      return {
        _id: item._id || "",
        name: item.name || "",
        description: item.description || "",
        slug: item.slug || "",
        image: item.image || "",
        available: item.available !== false,
      };
    }
    return {
      _id: "",
      name: "",
      description: "",
      slug: "",
      image: "",
      available: true,
    };
  });

  const [imgLoading, setImgLoading] = useState(false);
  const [preview, setPreview] = useState(item?.image || "");
  const [loading, setLoading] = useState(false);

  // Fetch fresh data if navigated directly without state
  useEffect(() => {
    if (!item && form._id) {
      getCategoryById(form._id)
        .then((r) => {
          const d = r.data;
          setForm({
            _id: d._id,
            name: d.name || "",
            description: d.description || "",
            slug: d.slug || "",
            image: d.image || "",
            available: d.available !== false,
          });
          setPreview(d.image || "");
        })
        .catch(() => toast.error("Failed to load category data."));
    }
  }, [item, form._id]);

  const handleImage = async (ev) => {
    const file = ev.target.files[0];
    if (!file) return;
    setImgLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await uploadImage(fd);
      setForm((f) => ({ ...f, image: data.imageUrl }));
      setPreview(data.imageUrl);
      toast.success("Image uploaded!");
    } catch {
      toast.error("Image upload failed.");
    } finally {
      setImgLoading(false);
    }
  };

  // CORRECT: API expects the whole data object including _id
  const handleSubmit = async (ev) => {
    ev.preventDefault();

    if (!form._id) {
      toast.error("Category ID is missing. Cannot update.");
      return;
    }
    if (!form.name.trim()) {
      toast.error("Category name is required.");
      return;
    }

    setLoading(true);
    try {
      // Pass the entire form object; API extracts _id from data._id internally
      await updateSuperAdminCategory(form._id, form);
      toast.success("Category updated successfully!");
      navigate("/superadmin/category");
    } catch (err) {
      console.error("Update error:", err);
      toast.error(err.response?.data?.message || "Failed to update category.");
    } finally {
      setLoading(false);
    }
  };

  if (!item && !form._id) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">No category data found.</p>
        <button
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white border-0 cursor-pointer"
          style={{ backgroundColor: O.primary }}
          onClick={() => navigate("/superadmin/category")}
        >
          ← Back to Categories
        </button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Update Category"
        backPath="/superadmin/category"
        navigate={navigate}
      />
      <FormCard
        title="Edit Category"
        onSubmit={handleSubmit}
        onCancel={() => navigate("/superadmin/category")}
        submitLabel="Update Category"
        loading={loading}
      >
        <Field label="Category Name" required>
          <input
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 transition"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
                // Only auto-generate slug if it was empty or matched the old auto-pattern
                slug:
                  form.slug === form.name.toLowerCase().replace(/\s+/g, "-")
                    ? e.target.value.toLowerCase().replace(/\s+/g, "-")
                    : form.slug,
              })
            }
          />
        </Field>

        <Field label="Description">
          <textarea
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 transition resize-none"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </Field>

        <Field label="Slug">
          <input
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 transition"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
        </Field>

        <Field label="Status">
          <select
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 transition"
            value={form.available ? "true" : "false"}
            onChange={(e) =>
              setForm({ ...form, available: e.target.value === "true" })
            }
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </Field>

        <ImageUpload
          preview={preview}
          onChange={handleImage}
          loading={imgLoading}
          label="Update Image"
        />
      </FormCard>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//  DEFAULT EXPORT
// ═════════════════════════════════════════════════════════════════════════════
export default SuperAdminCategoryList;
