import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

import {
  getSuperAdminSubCategories as getSubCategories,
  createSuperAdminSubCategory as createSubCategory,
  updateSuperAdminSubCategory,
  deleteSuperAdminSubCategory as deleteSubCategory,
  getSuperAdminCategories as getCategories,
  superAdminUploadImage as uploadImage,
} from "../../services/superAdminApi";

import {
  DataTable,
  PageHeader,
  ConfirmModal,
  Field,
  Badge,
} from "../../components/UI";

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

const extractSubCats = (res) =>
  Array.isArray(res.data?.SubCategories) ? res.data.SubCategories : [];

const extractCats = (res) => (Array.isArray(res.data) ? res.data : []);

async function doUpload(file) {
  const fd = new FormData();
  fd.append("file", file);

  const { data } = await uploadImage(fd);

  return data.imageUrl;
}

// ═════════════════════════════════════════════════════════════
// PAGE 1: LIST
// ═════════════════════════════════════════════════════════════

export function SuperAdminSubCategoryList() {
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

    {
      key: "slug",
      label: "Slug",
      searchable: true,
    },

    {
      key: "categoryId",
      label: "Category",
      render: (r) => (
        <span className="text-sm text-gray-600">
          {getCatName(r.categoryId)}
        </span>
      ),
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
            alt=""
            className="w-12 h-12 object-cover rounded border"
          />
        ) : (
          "—"
        ),
    },

    {
      key: "available",
      label: "Status",
      render: (r) => <Badge value={r.available !== false} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Sub-Category List"
        buttonLabel="Create SubCategory"
        onButtonClick={() => navigate("/superadmin/sub-category/create")}
      />

      {loading ? (
        <div className="flex justify-center py-12">Loading...</div>
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
                    navigate("/superadmin/sub-category/update", {
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

// ═════════════════════════════════════════════════════════════
// PAGE 2: CREATE
// ═════════════════════════════════════════════════════════════

export function SuperAdminSubCategoryCreate() {
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

      setForm((f) => ({
        ...f,
        icon: url,
      }));

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

      setForm((f) => ({
        ...f,
        image: url,
      }));

      setImagePreview(url);
    } catch {
      toast.error("Image upload failed.");
    } finally {
      setImageLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!form.categoryId) {
      toast.error("Please select category");
      return;
    }

    setLoading(true);

    try {
      await createSubCategory(form);

      toast.success("Sub-category created!");

      navigate("/superadmin/sub-category");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Create Sub-Category"
        backPath="/superadmin/sub-category"
        navigate={navigate}
      />

      <div className="kanchira-card">
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <Field label="Subcategory Name" required>
            <input
              className="kanchira-input"
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
              onChange={(e) =>
                setForm({
                  ...form,
                  slug: e.target.value,
                })
              }
            />
          </Field>

          <Field label="Category">
            <select
              className="kanchira-input"
              value={form.categoryId}
              onChange={(e) =>
                setForm({
                  ...form,
                  categoryId: e.target.value,
                })
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

          <Field label="Upload Icon">
            <input
              type="file"
              accept="image/*"
              className="kanchira-input"
              onChange={handleIconUpload}
              disabled={iconLoading}
            />
          </Field>

          {iconPreview && (
            <img
              src={iconPreview}
              alt=""
              className="w-20 h-20 rounded border"
            />
          )}

          <Field label="Upload Image">
            <input
              type="file"
              accept="image/*"
              className="kanchira-input"
              onChange={handleImageUpload}
              disabled={imageLoading}
            />
          </Field>

          {imagePreview && (
            <img
              src={imagePreview}
              alt=""
              className="w-20 h-20 rounded border"
            />
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.available}
              onChange={(e) =>
                setForm({
                  ...form,
                  available: e.target.checked,
                })
              }
            />

            <label>Available</label>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/superadmin/sub-category")}
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

// ═════════════════════════════════════════════════════════════
// PAGE 3: UPDATE
// ═════════════════════════════════════════════════════════════

export function SuperAdminSubCategoryUpdate() {
  const navigate = useNavigate();

  const location = useLocation();

  const item = location.state?.item;

  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    name: item?.name || "",
    slug: item?.slug || "",
    categoryId: item?.categoryId || "",
    image: item?.image || "",
    icon: item?.icon || "",
    available: item?.available ?? true,
    isTrending: item?.isTrending ?? false,
    sortOrder: item?.sortOrder || 0,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCategories()
      .then((r) => setCategories(extractCats(r)))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setLoading(true);

    try {
      await updateSuperAdminSubCategory(item._id, form);

      toast.success("Sub-category updated!");

      navigate("/superadmin/sub-category");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Update Sub-Category"
        backPath="/superadmin/sub-category"
        navigate={navigate}
      />

      <div className="kanchira-card">
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <Field label="Subcategory Name">
            <input
              className="kanchira-input"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
            />
          </Field>

          <Field label="Slug">
            <input
              className="kanchira-input"
              value={form.slug}
              onChange={(e) =>
                setForm({
                  ...form,
                  slug: e.target.value,
                })
              }
            />
          </Field>

          <Field label="Category">
            <select
              className="kanchira-input"
              value={form.categoryId}
              onChange={(e) =>
                setForm({
                  ...form,
                  categoryId: e.target.value,
                })
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

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/superadmin/sub-category")}
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

// ═════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═════════════════════════════════════════════════════════════

export default SuperAdminSubCategoryList;
