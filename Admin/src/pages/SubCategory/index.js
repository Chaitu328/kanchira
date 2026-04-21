import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getSubCategories,
  getCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  uploadImage,
} from "../../services/api";
import {
  DataTable,
  PageHeader,
  ConfirmModal,
  Field,
  Badge,
} from "../../components/UI";

// ── helpers ──────────────────────────────────────────────────────
const extractSubCats = (res) =>
  Array.isArray(res.data?.SubCategories) ? res.data.SubCategories : [];
const extractCats = (res) => (Array.isArray(res.data) ? res.data : []);

// ── shared image uploader ─────────────────────────────────────────
async function doUpload(file) {
  const fd = new FormData();
  fd.append("file", file);
  const { data } = await uploadImage(fd);
  return data.imageUrl;
}

// ══════════════════════════════════════════════════════════════════
// SubCategoryList
// ══════════════════════════════════════════════════════════════════
export function SubCategoryList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [sc, cats] = await Promise.all([
        getSubCategories(),
        getCategories(),
      ]);
      setData(extractSubCats(sc));
      setCategories(extractCats(cats));
    } catch {
      toast.error("Failed to load sub-categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const getCatName = (id) => categories.find((c) => c._id === id)?.name || "—";

  const handleDelete = async () => {
    try {
      await deleteSubCategory(deleteId);
      toast.success("Deleted!");
      load();
    } catch {
      toast.error("Failed to delete.");
    } finally {
      setDeleteId(null);
    }
  };

  const columns = [
    {
      key: "name",
      label: "Name",
      searchable: true,
      render: (r) => <span className="font-medium capitalize">{r.name}</span>,
    },
    { key: "slug", label: "Slug", searchable: true },
    {
      key: "categoryId",
      label: "Category ID",
      searchable: true,
      value: (r) => getCatName(r.categoryId),
    },
    {
      key: "image",
      label: "Image",
      render: (r) =>
        r.image ? (
          <img
            src={r.image}
            alt=""
            className="w-12 h-12 object-cover rounded border"
          />
        ) : (
          "—"
        ),
    },
    {
      key: "icon",
      label: "Icon",
      render: (r) =>
        r.icon ? (
          <img
            src={r.icon}
            alt="icon"
            className="w-12 h-12 object-cover rounded border"
          />
        ) : (
          "—"
        ),
    },
    {
      key: "available",
      label: "Available",
      // available is missing from DB for old records — treat undefined/null as true
      render: (r) => <Badge value={r.available !== false} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Sub-Category List"
        buttonLabel="Create SubCategory"
        onButtonClick={() => navigate("/dashboard/sub-category/create")}
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <div
            className="spinner"
            style={{
              width: 40,
              height: 40,
              borderTopColor: "#640101",
              borderColor: "rgba(100,1,1,0.2)",
              borderWidth: 4,
            }}
          />
        </div>
      ) : (
        <div className="kanchira-card">
          <DataTable
            columns={columns}
            data={data}
            searchPlaceholder="Filter..."
            actions={(row) => (
              <>
                <button
                  className="btn-edit btn-icon"
                  onClick={() =>
                    navigate("/dashboard/sub-category/update", {
                      state: { item: row },
                    })
                  }
                >
                  <i className="fa fa-pencil text-xs" />
                </button>
                <button
                  className="btn-danger btn-icon"
                  onClick={() => setDeleteId(row._id)}
                >
                  <i className="fa fa-trash text-xs" />
                </button>
              </>
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

// ══════════════════════════════════════════════════════════════════
// SubCategoryCreate
// ══════════════════════════════════════════════════════════════════
export function SubCategoryCreate() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    categoryId: "",
    image: "",
    icon: "",
    available: true,
    isTrending: false,
    sortOrder: 0,
  });
  const [iconPreview, setIconPreview] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [iconLoading, setIconLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCategories()
      .then((r) => setCategories(extractCats(r)))
      .catch(() => {});
  }, []);

  const handleIconUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIconLoading(true);
    try {
      const url = await doUpload(file);
      setForm((f) => ({ ...f, icon: url }));
      setIconPreview(url);
    } catch {
      toast.error("Icon upload failed.");
    } finally {
      setIconLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageLoading(true);
    try {
      const url = await doUpload(file);
      setForm((f) => ({ ...f, image: url }));
      setImagePreview(url);
    } catch {
      toast.error("Image upload failed.");
    } finally {
      setImageLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) {
      toast.error("Name is required");
      return;
    }
    if (!form.categoryId) {
      toast.error("Please select a category");
      return;
    }
    setLoading(true);
    try {
      await createSubCategory(form);
      toast.success("Sub-category created!");
      navigate("/dashboard/sub-category");
    } catch {
      toast.error("Failed to create.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Create Sub-Category"
        backPath="/dashboard/sub-category"
        navigate={navigate}
      />
      <div className="kanchira-card max-w-9xl">
        <div className="dark-form-header">Create Sub Category</div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Row 1: Name + Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Subcategory Name" required>
              <input
                className="kanchira-input"
                placeholder="Enter name"
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
            <Field label="Slug">
              <input
                className="kanchira-input"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
            </Field>
          </div>

          {/* Row 2: Select Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Select Category" required>
              <select
                className="kanchira-input"
                value={form.categoryId}
                onChange={(e) =>
                  setForm({ ...form, categoryId: e.target.value })
                }
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* Available checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="available"
              checked={form.available}
              onChange={(e) =>
                setForm({ ...form, available: e.target.checked })
              }
              className="w-4 h-4 accent-red-800"
            />
            <label
              htmlFor="available"
              className="text-sm font-medium text-gray-700"
            >
              Available
            </label>
          </div>

          {/* Row 3: Icon + Image uploads side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Icon upload */}
            <div>
              <Field label="Icon (FontAwesome / Material)">
                <input
                  type="file"
                  accept="image/*"
                  className="kanchira-input py-1.5"
                  onChange={handleIconUpload}
                  disabled={iconLoading}
                />
              </Field>
              {iconLoading && (
                <p className="text-xs text-gray-400 mt-1">Uploading...</p>
              )}
              {iconPreview && (
                <div className="mt-2">
                  <p className="text-xs text-gray-400 mb-1">Image Preview</p>
                  <img
                    src={iconPreview}
                    alt="icon"
                    className="w-24 h-24 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>

            {/* Main image upload */}
            <div>
              <Field label="Upload Image">
                <input
                  type="file"
                  accept="image/*"
                  className="kanchira-input py-1.5"
                  onChange={handleImageUpload}
                  disabled={imageLoading}
                />
              </Field>
              {imageLoading && (
                <p className="text-xs text-gray-400 mt-1">Uploading...</p>
              )}
              {imagePreview && (
                <div className="mt-2">
                  <p className="text-xs text-gray-400 mb-1">Image Preview</p>
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="w-24 h-24 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Row 4: Is Trending + Sort Order */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isTrending"
                checked={form.isTrending}
                onChange={(e) =>
                  setForm({ ...form, isTrending: e.target.checked })
                }
                className="w-4 h-4 accent-red-800"
              />
              <label
                htmlFor="isTrending"
                className="text-sm font-medium text-gray-700"
              >
                Is Trending
              </label>
            </div>
            <Field label="Sort Order">
              <input
                type="number"
                className="kanchira-input"
                min={0}
                value={form.sortOrder}
                onChange={(e) =>
                  setForm({ ...form, sortOrder: Number(e.target.value) })
                }
              />
            </Field>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/dashboard/sub-category")}
            >
              Back
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creating..." : "Create Subcategory"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// SubCategoryUpdate
// ══════════════════════════════════════════════════════════════════
export function SubCategoryUpdate() {
  const navigate = useNavigate();
  const location = useLocation();
  const item = location.state?.item;

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(
    item || {
      name: "",
      slug: "",
      categoryId: "",
      image: "",
      icon: "",
      available: true,
      isTrending: false,
      sortOrder: 0,
    },
  );
  const [iconPreview, setIconPreview] = useState(item?.icon || "");
  const [imagePreview, setImagePreview] = useState(item?.image || "");
  const [iconLoading, setIconLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCategories()
      .then((r) => setCategories(extractCats(r)))
      .catch(() => {});
  }, []);

  const handleIconUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIconLoading(true);
    try {
      const url = await doUpload(file);
      setForm((f) => ({ ...f, icon: url }));
      setIconPreview(url);
    } catch {
      toast.error("Icon upload failed.");
    } finally {
      setIconLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageLoading(true);
    try {
      const url = await doUpload(file);
      setForm((f) => ({ ...f, image: url }));
      setImagePreview(url);
    } catch {
      toast.error("Image upload failed.");
    } finally {
      setImageLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateSubCategory(form);
      toast.success("Updated!");
      navigate("/dashboard/sub-category");
    } catch {
      toast.error("Failed to update.");
    } finally {
      setLoading(false);
    }
  };

  if (!item) {
    return (
      <div className="p-8 text-center text-gray-500">
        No data found.{" "}
        <button
          className="text-red-700 underline"
          onClick={() => navigate("/dashboard/sub-category")}
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Update Sub-Category"
        backPath="/dashboard/sub-category"
        navigate={navigate}
      />
      <div className="kanchira-card max-w-9xl">
        <div className="dark-form-header">Create Sub Category</div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Row 1: Name + Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Subcategory Name">
              <input
                className="kanchira-input"
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Field>
            <Field label="Slug">
              <input
                className="kanchira-input"
                value={form.slug || ""}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
            </Field>
          </div>

          {/* Row 2: Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Select Category">
              <select
                className="kanchira-input"
                value={form.categoryId || ""}
                onChange={(e) =>
                  setForm({ ...form, categoryId: e.target.value })
                }
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* Available */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="available"
              checked={!!form.available}
              onChange={(e) =>
                setForm({ ...form, available: e.target.checked })
              }
              className="w-4 h-4 accent-red-800"
            />
            <label
              htmlFor="available"
              className="text-sm font-medium text-gray-700"
            >
              Available
            </label>
          </div>

          {/* Icon + Image uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Field label="Icon (FontAwesome / Material)">
                <input
                  type="file"
                  accept="image/*"
                  className="kanchira-input py-1.5"
                  onChange={handleIconUpload}
                  disabled={iconLoading}
                />
              </Field>
              {iconLoading && (
                <p className="text-xs text-gray-400 mt-1">Uploading...</p>
              )}
              {iconPreview && (
                <div className="mt-2">
                  <p className="text-xs text-gray-400 mb-1">Image Preview</p>
                  <img
                    src={iconPreview}
                    alt="icon"
                    className="w-24 h-24 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>

            <div>
              <Field label="Upload Image">
                <input
                  type="file"
                  accept="image/*"
                  className="kanchira-input py-1.5"
                  onChange={handleImageUpload}
                  disabled={imageLoading}
                />
              </Field>
              {imageLoading && (
                <p className="text-xs text-gray-400 mt-1">Uploading...</p>
              )}
              {imagePreview && (
                <div className="mt-2">
                  <p className="text-xs text-gray-400 mb-1">Image Preview</p>
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="w-24 h-24 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Is Trending + Sort Order */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isTrending"
                checked={!!form.isTrending}
                onChange={(e) =>
                  setForm({ ...form, isTrending: e.target.checked })
                }
                className="w-4 h-4 accent-red-800"
              />
              <label
                htmlFor="isTrending"
                className="text-sm font-medium text-gray-700"
              >
                Is Trending
              </label>
            </div>
            <Field label="Sort Order">
              <input
                type="number"
                className="kanchira-input"
                min={0}
                value={form.sortOrder ?? 0}
                onChange={(e) =>
                  setForm({ ...form, sortOrder: Number(e.target.value) })
                }
              />
            </Field>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/dashboard/sub-category")}
            >
              Back
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Updating..." : "Update Subcategory"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
