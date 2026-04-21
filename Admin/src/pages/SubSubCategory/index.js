import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getSubSubCategories,
  getSubCategories,
  getCategories,
  createSubSubCategory,
  updateSubSubCategory,
  deleteSubSubCategory,
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
const extractCats = (res) => (Array.isArray(res.data) ? res.data : []);
const extractSubCats = (res) =>
  Array.isArray(res.data?.SubCategories) ? res.data.SubCategories : [];
const extractSSC = (res) =>
  Array.isArray(res.data?.subSubCategories) ? res.data.subSubCategories : [];

async function doUpload(file) {
  const fd = new FormData();
  fd.append("file", file);
  const { data } = await uploadImage(fd);
  return data.imageUrl;
}

// ══════════════════════════════════════════════════════════════════
// SubSubCategoryList
// ══════════════════════════════════════════════════════════════════
export function SubSubCategoryList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const ssc = await getSubSubCategories();
      setData(extractSSC(ssc));
    } catch {
      toast.error("Failed to load.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async () => {
    try {
      await deleteSubSubCategory(deleteId);
      toast.success("Deleted!");
      load();
    } catch {
      toast.error("Delete failed.");
    } finally {
      setDeleteId(null);
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
            className="w-12 h-12 object-cover rounded border"
          />
        ) : (
          "—"
        ),
    },
    {
      key: "name",
      label: "Name",
      searchable: true,
      render: (r) => <span className="font-medium capitalize">{r.name}</span>,
    },
    { key: "slug", label: "Slug", searchable: true },
  ];

  return (
    <div>
      <PageHeader
        title="Sub-subCategory List"
        buttonLabel="Create Sub-SubCategory"
        onButtonClick={() => navigate("/dashboard/sub-subcategory/create")}
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
                    navigate("/dashboard/sub-subcategory/update", {
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
// SubSubCategoryCreate
// ══════════════════════════════════════════════════════════════════
export function SubSubCategoryCreate() {
  const navigate = useNavigate();
  const [cats, setCats] = useState([]);
  const [subCats, setSubCats] = useState([]);
  const [filteredSubCats, setFilteredSubCats] = useState([]);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    categoryId: "",
    subCategoryId: "",
    image: "",
    available: true,
    isNewArrival: false,
    sortOrder: 0,
  });

  const [imagePreview, setImagePreview] = useState("");
  const [iconPreview, setIconPreview] = useState(""); // icon field (stored as image2 for UI only, not saved to DB)
  const [imageLoading, setImageLoading] = useState(false);
  const [iconLoading, setIconLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([getCategories(), getSubCategories()])
      .then(([c, sc]) => {
        setCats(extractCats(c));
        setSubCats(extractSubCats(sc));
      })
      .catch(() => {});
  }, []);

  const handleCatChange = (catId) => {
    setForm((f) => ({ ...f, categoryId: catId, subCategoryId: "" }));
    setFilteredSubCats(subCats.filter((sc) => sc.categoryId === catId));
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

  // Icon is uploaded and shown but stored separately (not in backend model — shown for UI parity)
  const handleIconUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIconLoading(true);
    try {
      const url = await doUpload(file);
      setIconPreview(url);
    } catch {
      toast.error("Icon upload failed.");
    } finally {
      setIconLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) {
      toast.error("Name is required");
      return;
    }
    if (!form.subCategoryId) {
      toast.error("Please select a sub-category");
      return;
    }
    setLoading(true);
    try {
      await createSubSubCategory(form);
      toast.success("Created!");
      navigate("/dashboard/sub-subcategory");
    } catch {
      toast.error("Failed to create.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Create Sub-SubCategory"
        backPath="/dashboard/sub-subcategory"
        navigate={navigate}
      />
      <div className="kanchira-card max-w-9xl">
        <div className="dark-form-header">Create Sub-Subcategory</div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Row 1: Select Subcategory + Select Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Select Subcategory" required>
              <select
                className="kanchira-input"
                value={form.subCategoryId}
                onChange={(e) =>
                  setForm({ ...form, subCategoryId: e.target.value })
                }
              >
                <option value="">Choose Subcategory</option>
                {filteredSubCats.map((sc) => (
                  <option key={sc._id} value={sc._id}>
                    {sc.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Select Category" required>
              <select
                className="kanchira-input"
                value={form.categoryId}
                onChange={(e) => handleCatChange(e.target.value)}
              >
                <option value="">Choose Category</option>
                {cats.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* Row 2: Name + Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Name" required>
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

          {/* Row 3: Description + Upload Image side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Description">
              <textarea
                className="kanchira-input"
                rows={4}
                placeholder="Enter description"
              />
            </Field>
            <Field label="Upload Image">
              <input
                type="file"
                accept="image/*"
                className="kanchira-input py-1.5"
                onChange={handleImageUpload}
                disabled={imageLoading}
              />
              {imageLoading && (
                <p className="text-xs text-gray-400 mt-1">Uploading...</p>
              )}
            </Field>
          </div>

          {/* Image Preview + Icon side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: image preview */}
            <div>
              {imagePreview && (
                <>
                  <p className="text-sm text-gray-500 mb-1">Image Preview</p>
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                </>
              )}
            </div>

            {/* Right: Icon upload */}
            <div>
              <Field label="Icon (FontAwesome / Material)">
                <input
                  type="file"
                  accept="image/*"
                  className="kanchira-input py-1.5"
                  onChange={handleIconUpload}
                  disabled={iconLoading}
                />
                {iconLoading && (
                  <p className="text-xs text-gray-400 mt-1">Uploading...</p>
                )}
              </Field>
              {iconPreview && (
                <img
                  src={iconPreview}
                  alt="icon"
                  className="w-16 h-16 object-cover rounded-lg border mt-2"
                />
              )}
            </div>
          </div>

          {/* Available dropdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Available">
              <select
                className="kanchira-input"
                value={form.available ? "true" : "false"}
                onChange={(e) =>
                  setForm({ ...form, available: e.target.value === "true" })
                }
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </Field>
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

          {/* Is New Arrival */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isNewArrival"
              checked={form.isNewArrival}
              onChange={(e) =>
                setForm({ ...form, isNewArrival: e.target.checked })
              }
              className="w-4 h-4 accent-red-800"
            />
            <label
              htmlFor="isNewArrival"
              className="text-sm font-medium text-gray-700"
            >
              Is New Arrival
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/dashboard/sub-subcategory")}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// SubSubCategoryUpdate
// ══════════════════════════════════════════════════════════════════
export function SubSubCategoryUpdate() {
  const navigate = useNavigate();
  const location = useLocation();
  const item = location.state?.item;

  const [cats, setCats] = useState([]);
  const [subCats, setSubCats] = useState([]);
  const [filteredSubCats, setFilteredSubCats] = useState([]);

  const [form, setForm] = useState(
    item || {
      name: "",
      slug: "",
      categoryId: "",
      subCategoryId: "",
      image: "",
      available: true,
      isNewArrival: false,
      sortOrder: 0,
    },
  );

  const [imagePreview, setImagePreview] = useState(item?.image || "");
  const [iconPreview, setIconPreview] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [iconLoading, setIconLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([getCategories(), getSubCategories()])
      .then(([c, sc]) => {
        const cList = extractCats(c);
        const scList = extractSubCats(sc);
        setCats(cList);
        setSubCats(scList);
        if (item?.categoryId) {
          setFilteredSubCats(
            scList.filter((s) => s.categoryId === item.categoryId),
          );
        }
      })
      .catch(() => {});
  }, []);

  const handleCatChange = (catId) => {
    setForm((f) => ({ ...f, categoryId: catId, subCategoryId: "" }));
    setFilteredSubCats(subCats.filter((sc) => sc.categoryId === catId));
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

  const handleIconUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIconLoading(true);
    try {
      const url = await doUpload(file);
      setIconPreview(url);
    } catch {
      toast.error("Icon upload failed.");
    } finally {
      setIconLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateSubSubCategory(form);
      toast.success("Updated!");
      navigate("/dashboard/sub-subcategory");
    } catch {
      toast.error("Failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!item) {
    return (
      <div className="p-8 text-center text-gray-500">
        No data.{" "}
        <button
          className="text-red-700 underline"
          onClick={() => navigate("/dashboard/sub-subcategory")}
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Update Sub-SubCategory"
        backPath="/dashboard/sub-subcategory"
        navigate={navigate}
      />
      <div className="kanchira-card max-w-9xl">
        <div className="dark-form-header">Create Sub-Subcategory</div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Row 1: Select Subcategory + Select Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Select Subcategory">
              <select
                className="kanchira-input"
                value={form.subCategoryId || ""}
                onChange={(e) =>
                  setForm({ ...form, subCategoryId: e.target.value })
                }
              >
                <option value="">Choose Subcategory</option>
                {filteredSubCats.map((sc) => (
                  <option key={sc._id} value={sc._id}>
                    {sc.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Select Category">
              <select
                className="kanchira-input"
                value={form.categoryId || ""}
                onChange={(e) => handleCatChange(e.target.value)}
              >
                <option value="">Choose Category</option>
                {cats.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* Row 2: Name + Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Name">
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

          {/* Row 3: Description + Upload Image */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Description">
              <textarea
                className="kanchira-input"
                rows={4}
                placeholder="Enter description"
              />
            </Field>
            <Field label="Upload Image">
              <input
                type="file"
                accept="image/*"
                className="kanchira-input py-1.5"
                onChange={handleImageUpload}
                disabled={imageLoading}
              />
              {imageLoading && (
                <p className="text-xs text-gray-400 mt-1">Uploading...</p>
              )}
            </Field>
          </div>

          {/* Image Preview + Icon upload */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              {imagePreview && (
                <>
                  <p className="text-sm text-gray-500 mb-1">Image Preview</p>
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                </>
              )}
            </div>
            <div>
              <Field label="Icon (FontAwesome / Material)">
                <input
                  type="file"
                  accept="image/*"
                  className="kanchira-input py-1.5"
                  onChange={handleIconUpload}
                  disabled={iconLoading}
                />
                {iconLoading && (
                  <p className="text-xs text-gray-400 mt-1">Uploading...</p>
                )}
              </Field>
              {iconPreview && (
                <img
                  src={iconPreview}
                  alt="icon"
                  className="w-16 h-16 object-cover rounded-lg border mt-2"
                />
              )}
            </div>
          </div>

          {/* Available + Sort Order */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Available">
              <select
                className="kanchira-input"
                value={form.available ? "true" : "false"}
                onChange={(e) =>
                  setForm({ ...form, available: e.target.value === "true" })
                }
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </Field>
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

          {/* Is New Arrival */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isNewArrival"
              checked={!!form.isNewArrival}
              onChange={(e) =>
                setForm({ ...form, isNewArrival: e.target.checked })
              }
              className="w-4 h-4 accent-red-800"
            />
            <label
              htmlFor="isNewArrival"
              className="text-sm font-medium text-gray-700"
            >
              Is New Arrival
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/dashboard/sub-subcategory")}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
