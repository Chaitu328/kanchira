import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getProducts, uploadImage } from "../services/api";
import {
  getAllReviews,
  addReview,
  updateReview,
  deleteReview,
} from "../services/superAdminApi";
import {
  DataTable,
  PageHeader,
  ConfirmModal,
  FormCard,
  Field,
  ImageUpload,
} from "../components/UI";

// ══════════════════════════════════════════════════════════════════
// REVIEWS
// Backend:
//   GET    /review/all/data          → getAllReviews()
//   POST   /review/add               → addReview(data)
//   PUT    /review/update/:id        → updateReview(id, data)
//   DELETE /review/delete/:id         → deleteReview(id)
// ══════════════════════════════════════════════════════════════════
export function Reviews() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [editReview, setEditReview] = useState(null);

  const hasFetched = useRef(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await getAllReviews();
      setData(
        Array.isArray(r.data?.data)
          ? r.data.data
          : Array.isArray(r.data)
            ? r.data
            : [],
      );
    } catch {
      toast.error("Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    load();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteReview(deleteId);
      toast.success("Review deleted!");
      setDeleteId(null);
      load();
    } catch {
      toast.error("Delete failed.");
    }
  };

  const handleUpdate = async (ev) => {
    ev.preventDefault();
    if (!editReview?._id) return;
    try {
      // ✅ Only send plain fields — never send populated objects like userId/productId
      const payload = {
        rating: editReview.rating,
        text: editReview.text,
        tags: editReview.tags,
        images: editReview.images,
      };
      await updateReview(String(editReview._id), payload);
      toast.success("Updated!");
      setEditReview(null);
      load();
    } catch {
      toast.error("Update failed.");
    }
  };

  const StarRating = ({ rating }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <i
          key={s}
          className={`fa fa-star text-xs ${s <= rating ? "text-yellow-500" : "text-gray-300"}`}
        />
      ))}
    </div>
  );

  const columns = [
    {
      key: "image",
      label: "Image",
      render: (r) =>
        r.images?.[0] ? (
          <img src={r.images[0]} alt="" className="img-preview" />
        ) : (
          "—"
        ),
    },
    {
      key: "userId",
      label: "User",
      searchable: true,
      render: (r) => (
        <span className="font-medium">{r.userId?.name || "—"}</span>
      ),
    },
    {
      key: "rating",
      label: "Rating",
      render: (r) => <StarRating rating={r.rating} />,
    },
    {
      key: "text",
      label: "Review",
      render: (r) => (
        <span className="line-clamp-2 max-w-xs text-sm">{r.text}</span>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      render: (r) =>
        r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Reviews"
        buttonLabel="Create Review"
        onButtonClick={() => navigate("/superadmin/reviews/create")}
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
            searchPlaceholder="Search reviews..."
            actions={(row) => (
              <>
                <button
                  className="btn-edit btn-icon"
                  onClick={() =>
                    setEditReview({ ...row, _id: String(row._id) })
                  }
                >
                  <i className="fa fa-pencil text-xs" />
                </button>
                <button
                  className="btn-danger btn-icon"
                  onClick={() => setDeleteId(String(row._id))}
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
      {editReview && (
        <div className="modal-overlay" onClick={() => setEditReview(null)}>
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold mb-4" style={{ color: "#640101" }}>
              Edit Review
            </h3>
            <form onSubmit={handleUpdate} className="space-y-3">
              <Field label="Rating">
                <select
                  className="kanchira-input"
                  value={editReview.rating || 5}
                  onChange={(e) =>
                    setEditReview({
                      ...editReview,
                      rating: Number(e.target.value),
                    })
                  }
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n} Star{n > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Review">
                <textarea
                  className="kanchira-input"
                  rows={4}
                  value={editReview.text || ""}
                  onChange={(e) =>
                    setEditReview({ ...editReview, text: e.target.value })
                  }
                />
              </Field>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditReview(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// REVIEW CREATE
// Backend: POST /review/add  → addReview(data)
// Required: productId, rating, text
// Optional: images[]
// ══════════════════════════════════════════════════════════════════
export function ReviewCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ rating: 5, text: "", productId: "" });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(true);
  const [previewImages, setPreviewImages] = useState([]);
  const [imgLoading, setImgLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await getProducts();
        setProducts(Array.isArray(r.data) ? r.data : []);
      } catch {
        toast.error("Failed to load products.");
      } finally {
        setProductLoading(false);
      }
    })();
  }, []);

  const handleImageUpload = async (ev) => {
    const file = ev.target.files[0];
    if (!file) return;
    setImgLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await uploadImage(fd);
      setPreviewImages((prev) => [...prev, data.imageUrl]);
    } catch {
      toast.error("Upload failed.");
    } finally {
      setImgLoading(false);
    }
  };

  const removeImage = (index) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!form.productId) {
      toast.error("Please select a product.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        productId: form.productId,
        rating: form.rating,
        text: form.text,
        images: previewImages,
      };
      await addReview(payload);
      toast.success("Review created!");
      navigate("/superadmin/reviews");
    } catch {
      toast.error("Failed to create review.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Create Review"
        backPath="/superadmin/reviews"
        navigate={navigate}
      />
      <FormCard
        title="New Review"
        onSubmit={handleSubmit}
        onCancel={() => navigate("/superadmin/reviews")}
        submitLabel="Create"
        loading={loading}
      >
        <Field label="Product" required>
          {productLoading ? (
            <div className="text-sm text-gray-400">Loading products...</div>
          ) : (
            <select
              className="kanchira-input"
              value={form.productId}
              onChange={(e) => setForm({ ...form, productId: e.target.value })}
            >
              <option value="">Select a product</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name || p.title || "Unnamed"}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Rating">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className="border-0 bg-transparent cursor-pointer p-0"
                onClick={() => setForm({ ...form, rating: n })}
              >
                <i
                  className={`fa fa-star text-xl ${n <= form.rating ? "text-yellow-500" : "text-gray-300"}`}
                />
              </button>
            ))}
          </div>
        </Field>
        <Field label="Review" required>
          <textarea
            className="kanchira-input"
            rows={4}
            value={form.text}
            onChange={(e) => setForm({ ...form, text: e.target.value })}
          />
        </Field>
        <Field label="Images">
          <div className="flex items-center gap-4">
            <label className="cursor-pointer px-4 py-2 rounded-lg border border-dashed border-gray-300 hover:border-gray-400 transition text-sm text-gray-600">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <i className="fa fa-cloud-upload mr-2" /> Choose File
            </label>
            {imgLoading && (
              <span className="text-sm text-gray-400">Uploading...</span>
            )}
          </div>
          {previewImages.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {previewImages.map((img, i) => (
                <div key={i} className="relative">
                  <img
                    src={img}
                    alt=""
                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center border-0 cursor-pointer"
                  >
                    <i className="fa fa-times" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Field>
      </FormCard>
    </div>
  );
}
