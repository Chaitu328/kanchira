import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getBanners,
  updateBanner,
  getReviews,
  addReview,
  updateReview,
  deleteReview,
  getAllUsers,
  deleteUser,
  getOrders,
  updateOrderStatus,
  getLogo,
  createLogo,
  updateLogo,
  deleteLogo,
  getPincodes,
  createPincode,
  deletePincode,
  getFestivalDiscounts,
  updateFestivalDiscount,
  getCoupons,
  createCoupon,
  deleteCoupon,
  getAddresses,
  uploadImage,
} from "../services/api";
import {
  DataTable,
  PageHeader,
  ConfirmModal,
  FormCard,
  Field,
  ImageUpload,
  Badge,
} from "../components/UI";

// ══════════════════════════════════════════════════════════════════
// BANNERS
// Backend: GET /getBanners → { _id, banners: [{image,title,description},...] }
// ══════════════════════════════════════════════════════════════════
export function Banners() {
  const navigate = useNavigate();
  const [bannerId, setBannerId] = useState(null); // the single document _id
  const [data, setData] = useState([]); // array of {image,title,description}
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await getBanners();
      setBannerId(r.data?._id || null);
      setData(Array.isArray(r.data?.banners) ? r.data.banners : []);
    } catch {
      toast.error("Failed to load banners.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const columns = [
    {
      key: "image",
      label: "Image",
      render: (r) =>
        r.image ? (
          <img
            src={r.image}
            alt=""
            className="w-20 h-12 object-cover rounded"
          />
        ) : (
          "—"
        ),
    },
    { key: "title", label: "Title", searchable: true },
    {
      key: "description",
      label: "Description",
      render: (r) => (
        <span className="line-clamp-1 max-w-xs">{r.description}</span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Banner List"
        buttonLabel="Create Banner"
        onButtonClick={() => navigate("/dashboard/banners/create")}
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
            searchPlaceholder="Search banners..."
            actions={(row, index) => (
              <button
                className="btn-edit btn-icon"
                onClick={() =>
                  navigate("/dashboard/banners/update", {
                    state: { item: row, bannerId, allBanners: data, index },
                  })
                }
              >
                <i className="fa fa-pencil text-xs" />
              </button>
            )}
          />
        </div>
      )}
    </div>
  );
}

export function BannerCreate() {
  const navigate = useNavigate();
  // Banner stores an array of images under bannerImage field
  const [form, setForm] = useState({ image: "", title: "", description: "" });
  const [preview, setPreview] = useState("");
  const [imgLoading, setImgLoading] = useState(false);
  const [loading, setLoading] = useState(false);

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
    } catch {
      toast.error("Upload failed.");
    } finally {
      setImgLoading(false);
    }
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setLoading(true);
    try {
      // Backend expects { bannerImage: [{image, title, description}] }
      await createBanner({ bannerImage: [form] });
      toast.success("Banner created!");
      navigate("/dashboard/banners");
    } catch {
      toast.error("Failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Create Banner"
        backPath="/dashboard/banners"
        navigate={navigate}
      />
      <FormCard
        title="New Banner"
        onSubmit={handleSubmit}
        onCancel={() => navigate("/dashboard/banners")}
        submitLabel="Create"
        loading={loading}
      >
        <Field label="Title">
          <input
            className="kanchira-input"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </Field>
        <Field label="Description">
          <textarea
            className="kanchira-input"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
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

export function BannerUpdate() {
  const navigate = useNavigate();
  const location = useLocation();
  // item = one banner object {image,title,description}, bannerId = document _id, allBanners = full array
  const { item, bannerId, allBanners = [], index = 0 } = location.state || {};
  const [form, setForm] = useState(item || {});
  const [preview, setPreview] = useState(item?.image || "");
  const [imgLoading, setImgLoading] = useState(false);
  const [loading, setLoading] = useState(false);

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
    } catch {
      toast.error("Upload failed.");
    } finally {
      setImgLoading(false);
    }
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setLoading(true);
    try {
      // Replace the banner at the correct index in the array
      const updated = [...allBanners];
      updated[index] = form;
      await updateBanner(bannerId, updated);
      toast.success("Banner updated!");
      navigate("/dashboard/banners");
    } catch {
      toast.error("Failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Update Banner"
        backPath="/dashboard/banners"
        navigate={navigate}
      />
      <FormCard
        title="Edit Banner"
        onSubmit={handleSubmit}
        onCancel={() => navigate("/dashboard/banners")}
        submitLabel="Update"
        loading={loading}
      >
        <Field label="Title">
          <input
            className="kanchira-input"
            value={form.title || ""}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </Field>
        <Field label="Description">
          <textarea
            className="kanchira-input"
            rows={3}
            value={form.description || ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
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

// ══════════════════════════════════════════════════════════════════
// REVIEWS
// Backend: GET /getReviews → { data: [...] }  →  res.data.data  ✅
// ══════════════════════════════════════════════════════════════════
export function Reviews() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [editReview, setEditReview] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await getReviews();
      // Returns { data: [...] }
      setData(Array.isArray(r.data?.data) ? r.data.data : []);
    } catch {
      toast.error("Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async () => {
    try {
      await deleteReview(deleteId);
      toast.success("Review deleted!");
      load();
    } catch {
      toast.error("Delete failed.");
    } finally {
      setDeleteId(null);
    }
  };

  const handleUpdate = async (ev) => {
    ev.preventDefault();
    try {
      await updateReview(editReview);
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
        onButtonClick={() => navigate("/dashboard/reviews/create")}
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
                  onClick={() => setEditReview({ ...row })}
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

export function ReviewCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ rating: 5, text: "", productId: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setLoading(true);
    try {
      await addReview(form);
      toast.success("Review created!");
      navigate("/dashboard/reviews");
    } catch {
      toast.error("Failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Create Review"
        backPath="/dashboard/reviews"
        navigate={navigate}
      />
      <FormCard
        title="New Review"
        onSubmit={handleSubmit}
        onCancel={() => navigate("/dashboard/reviews")}
        submitLabel="Create"
        loading={loading}
      >
        <Field label="Product ID">
          <input
            className="kanchira-input"
            placeholder="Product MongoDB _id"
            value={form.productId}
            onChange={(e) => setForm({ ...form, productId: e.target.value })}
          />
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
        <Field label="Review">
          <textarea
            className="kanchira-input"
            rows={4}
            value={form.text}
            onChange={(e) => setForm({ ...form, text: e.target.value })}
          />
        </Field>
      </FormCard>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// ALL USERS
// Backend: GET /users → { users: [...] }
// ══════════════════════════════════════════════════════════════════
export function AllUsers() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await getAllUsers();
      setData(Array.isArray(r.data?.users) ? r.data.users : []);
    } catch {
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async () => {
    try {
      await deleteUser(deleteId);
      toast.success("User deleted!");
      load();
    } catch {
      toast.error("Delete failed.");
    } finally {
      setDeleteId(null);
    }
  };

  const columns = [
    {
      key: "name",
      label: "Name",
      searchable: true,
      render: (r) => (
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: "#640101" }}
          >
            {(r.name || r.phone || "?")[0].toUpperCase()}
          </div>
          <span className="font-medium">{r.name || "—"}</span>
        </div>
      ),
    },
    { key: "email", label: "Email", searchable: true },
    { key: "phone", label: "Phone", searchable: true },
    {
      key: "createdAt",
      label: "Joined",
      render: (r) =>
        r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—",
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">All Users</h1>
        <div
          className="bg-white rounded-xl px-4 py-2 shadow-sm text-sm font-medium"
          style={{ color: "#640101" }}
        >
          <i className="fa fa-users mr-2" /> Total: {data.length}
        </div>
      </div>
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
            searchPlaceholder="Search users..."
            actions={(row) => (
              <button
                className="btn-danger btn-icon"
                onClick={() => setDeleteId(row._id || row.userId)}
              >
                <i className="fa fa-trash text-xs" />
              </button>
            )}
          />
        </div>
      )}
      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        message="Are you sure you want to delete this user? All their data will be removed."
      />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// ORDERS
// Backend: GET /getorders → { orders: [...] }
// ══════════════════════════════════════════════════════════════════
export function Orders() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [filter, setFilter] = useState("All");

  const load = async () => {
    setLoading(true);
    try {
      const r = await getOrders();
      setData(Array.isArray(r.data?.orders) ? r.data.orders : []);
    } catch {
      /* orders might be empty */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const STATUS_COLORS = {
    Pending: "bg-yellow-100 text-yellow-700",
    Confirmed: "bg-blue-100 text-blue-700",
    Shipped: "bg-purple-100 text-purple-700",
    Completed: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-600",
  };
  const STATUSES = [
    "All",
    "Pending",
    "Confirmed",
    "Shipped",
    "Completed",
    "Cancelled",
  ];

  const handleStatusChange = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      toast.success("Status updated!");
      load();
    } catch {
      toast.error("Failed to update.");
    }
  };

  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const totalSales = data.reduce((s, o) => s + (Number(o.totalAmount) || 0), 0);
  const completedOrders = data.filter((o) => o.status === "Completed").length;
  const pendingOrders = data.filter(
    (o) => o.status === "Pending" || !o.status,
  ).length;

  const filteredData =
    filter === "All"
      ? data
      : data.filter((o) => (o.status || "Pending") === filter);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Orders</h1>
      </div>

      {/* Stats row */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Total Orders",
              value: data.length,
              icon: "fa-shopping-cart",
              color: "#640101",
            },
            {
              label: "Total Sales",
              value: `₹${totalSales.toLocaleString("en-IN")}`,
              icon: "fa-inr",
              color: "#975607",
            },
            {
              label: "Completed",
              value: completedOrders,
              icon: "fa-check-circle",
              color: "#376D5C",
            },
            {
              label: "Pending",
              value: pendingOrders,
              icon: "fa-clock-o",
              color: "#D2AE4E",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="rounded-xl p-4 text-white flex items-center gap-3 shadow"
              style={{ backgroundColor: s.color }}
            >
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <i className={`fa ${s.icon} text-yellow-200`} />
              </div>
              <div>
                <p className="text-xs font-semibold text-yellow-200 uppercase tracking-wide">
                  {s.label}
                </p>
                <p className="text-xl font-bold">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Status filter tabs */}
      {!loading && data.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${filter === s ? "text-white border-transparent" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}
              style={
                filter === s
                  ? { backgroundColor: "#640101", borderColor: "#640101" }
                  : {}
              }
            >
              {s}
              {s !== "All" && (
                <span className="ml-1 opacity-70">
                  ({data.filter((o) => (o.status || "Pending") === s).length})
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
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
      ) : filteredData.length === 0 ? (
        <div className="kanchira-card text-center py-16">
          <i className="fa fa-shopping-cart text-5xl text-gray-200 mb-4 block" />
          <p className="text-gray-400 font-medium">
            {filter === "All" ? "No orders yet" : `No ${filter} orders`}
          </p>
        </div>
      ) : (
        <div className="kanchira-card overflow-x-auto p-0">
          <table className="kanchira-table w-full">
            <thead>
              <tr>
                {[
                  "",
                  "#",
                  "Order ID",
                  "Customer",
                  "Items",
                  "Total",
                  "Payment",
                  "Status",
                  "Date",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((o, i) => {
                const items = Array.isArray(o.items)
                  ? o.items
                  : Array.isArray(o.orderItems)
                    ? o.orderItems
                    : Array.isArray(o.products)
                      ? o.products
                      : [];
                const isOpen = expanded[o._id];
                return (
                  <React.Fragment key={o._id || i}>
                    <tr className="hover:bg-amber-50/40 transition">
                      {/* expand toggle */}
                      <td className="pl-3 pr-1 py-3">
                        {items.length > 0 && (
                          <button
                            onClick={() => toggleExpand(o._id)}
                            className="w-6 h-6 rounded-full bg-gray-100 hover:bg-amber-100 flex items-center justify-center border-0 cursor-pointer transition"
                          >
                            <i
                              className={`fa fa-chevron-${isOpen ? "up" : "down"} text-xs text-gray-500`}
                            />
                          </button>
                        )}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-400">
                        {i + 1}
                      </td>
                      <td className="px-3 py-3 font-mono text-xs text-gray-700">
                        {o._id?.slice(-8).toUpperCase() || "—"}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-700 font-medium whitespace-nowrap">
                        {o.address?.fullName || o.userId || "—"}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-500">
                        {items.length > 0 ? (
                          <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                            {items.length} item{items.length > 1 ? "s" : ""}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-3 py-3 text-sm font-semibold text-gray-800 whitespace-nowrap">
                        {o.totalAmount
                          ? `₹${Number(o.totalAmount).toLocaleString("en-IN")}`
                          : "—"}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-500 whitespace-nowrap">
                        {o.paymentMethod || "—"}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[o.status] || "bg-gray-100 text-gray-600"}`}
                        >
                          {o.status || "Pending"}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-400 whitespace-nowrap">
                        {o.createdAt
                          ? new Date(o.createdAt).toLocaleDateString("en-IN")
                          : "—"}
                      </td>
                      <td className="px-3 py-3">
                        <select
                          className="kanchira-input w-auto text-xs py-1"
                          value={o.status || "Pending"}
                          onChange={(e) =>
                            handleStatusChange(o._id, e.target.value)
                          }
                        >
                          {[
                            "Pending",
                            "Confirmed",
                            "Shipped",
                            "Completed",
                            "Cancelled",
                          ].map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                    {/* Expanded items row */}
                    {isOpen && items.length > 0 && (
                      <tr>
                        <td
                          colSpan={10}
                          className="px-6 pb-4 pt-0 bg-amber-50/60"
                        >
                          <div className="rounded-lg border border-amber-200 overflow-hidden">
                            <div className="px-4 py-2 bg-amber-100 text-xs font-bold text-amber-800 uppercase tracking-wide flex items-center gap-2">
                              <i className="fa fa-list-ul" /> Order Items —{" "}
                              {o.address?.fullName || "Customer"}
                            </div>
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-white border-b border-amber-100">
                                  <th className="px-4 py-2 text-left text-xs text-gray-500 font-semibold">
                                    #
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs text-gray-500 font-semibold">
                                    Product Name
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs text-gray-500 font-semibold">
                                    Image
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs text-gray-500 font-semibold">
                                    Qty
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs text-gray-500 font-semibold">
                                    Price
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs text-gray-500 font-semibold">
                                    Subtotal
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {items.map((item, j) => {
                                  const name =
                                    item.productName ||
                                    item.name ||
                                    item.title ||
                                    item.productId?.name ||
                                    "Product";
                                  const img =
                                    item.image ||
                                    item.img ||
                                    item.productImage ||
                                    item.productId?.images?.[0] ||
                                    null;
                                  const qty = item.quantity || item.qty || 1;
                                  const price =
                                    item.price ||
                                    item.productPrice ||
                                    item.productId?.price ||
                                    0;
                                  const subtotal = qty * Number(price);
                                  return (
                                    <tr
                                      key={j}
                                      className="border-b border-amber-50 last:border-0 hover:bg-white"
                                    >
                                      <td className="px-4 py-2 text-gray-400 text-xs">
                                        {j + 1}
                                      </td>
                                      <td className="px-4 py-2 font-medium text-gray-800">
                                        {name}
                                      </td>
                                      <td className="px-4 py-2">
                                        {img ? (
                                          <img
                                            src={img}
                                            alt=""
                                            className="w-10 h-10 object-cover rounded"
                                          />
                                        ) : (
                                          <span className="text-gray-300 text-xs">
                                            —
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-4 py-2 text-gray-700">
                                        {qty}
                                      </td>
                                      <td className="px-4 py-2 text-gray-700">
                                        {price
                                          ? `₹${Number(price).toLocaleString("en-IN")}`
                                          : "—"}
                                      </td>
                                      <td className="px-4 py-2 font-semibold text-gray-800">
                                        {subtotal
                                          ? `₹${subtotal.toLocaleString("en-IN")}`
                                          : "—"}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// SALES
// Shows all orders as sales records — customer name, items, totals
// ══════════════════════════════════════════════════════════════════
export function Sales() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await getOrders();
        setData(Array.isArray(r.data?.orders) ? r.data.orders : []);
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalSales = data.reduce((s, o) => s + (Number(o.totalAmount) || 0), 0);
  const totalItems = data.reduce((s, o) => {
    const items = Array.isArray(o.items)
      ? o.items
      : Array.isArray(o.orderItems)
        ? o.orderItems
        : Array.isArray(o.products)
          ? o.products
          : [];
    return s + items.reduce((a, it) => a + (it.quantity || it.qty || 1), 0);
  }, 0);

  // Flatten: one row per item across all orders
  const salesRows = data.flatMap((o) => {
    const customer = o.address?.fullName || o.userId || "Unknown";
    const date = o.createdAt
      ? new Date(o.createdAt).toLocaleDateString("en-IN")
      : "—";
    const orderId = o._id?.slice(-8).toUpperCase() || "—";
    const status = o.status || "Pending";
    const items = Array.isArray(o.items)
      ? o.items
      : Array.isArray(o.orderItems)
        ? o.orderItems
        : Array.isArray(o.products)
          ? o.products
          : [];

    if (items.length === 0) {
      return [
        {
          orderId,
          customer,
          date,
          status,
          productName: "—",
          image: null,
          qty: "—",
          price: "—",
          subtotal: o.totalAmount ? Number(o.totalAmount) : null,
          isTotal: true,
        },
      ];
    }

    return items.map((item, idx) => {
      const name =
        item.productName ||
        item.name ||
        item.title ||
        item.productId?.name ||
        "Product";
      const img =
        item.image ||
        item.img ||
        item.productImage ||
        item.productId?.images?.[0] ||
        null;
      const qty = item.quantity || item.qty || 1;
      const price = Number(
        item.price || item.productPrice || item.productId?.price || 0,
      );
      return {
        orderId,
        customer,
        date,
        status,
        productName: name,
        image: img,
        qty,
        price,
        subtotal: qty * price,
        isFirstItem: idx === 0,
        totalItems: items.length,
      };
    });
  });

  const STATUS_COLORS = {
    Pending: "bg-yellow-100 text-yellow-700",
    Confirmed: "bg-blue-100 text-blue-700",
    Shipped: "bg-purple-100 text-purple-700",
    Completed: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-600",
  };

  const filtered = salesRows.filter(
    (row) =>
      row.customer.toLowerCase().includes(search.toLowerCase()) ||
      row.orderId.toLowerCase().includes(search.toLowerCase()) ||
      row.productName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      <div className="page-header">
        <h1 className="page-title">Sales</h1>
      </div>

      {/* Summary cards */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Total Sales",
              value: `₹${totalSales.toLocaleString("en-IN")}`,
              icon: "fa-inr",
              color: "#640101",
            },
            {
              label: "Total Orders",
              value: data.length,
              icon: "fa-shopping-cart",
              color: "#975607",
            },
            {
              label: "Total Items Sold",
              value: totalItems,
              icon: "fa-cube",
              color: "#376D5C",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="rounded-xl p-4 text-white flex items-center gap-3 shadow"
              style={{ backgroundColor: s.color }}
            >
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <i className={`fa ${s.icon} text-yellow-200`} />
              </div>
              <div>
                <p className="text-xs font-semibold text-yellow-200 uppercase tracking-wide">
                  {s.label}
                </p>
                <p className="text-xl font-bold">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      {!loading && data.length > 0 && (
        <div className="relative max-w-sm">
          <i className="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            className="kanchira-input pl-9 text-sm"
            placeholder="Search by customer, order or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

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
      ) : salesRows.length === 0 ? (
        <div className="kanchira-card text-center py-16">
          <i className="fa fa-bar-chart text-5xl text-gray-200 mb-4 block" />
          <p className="text-gray-400 font-medium">No sales data yet</p>
        </div>
      ) : (
        <div className="kanchira-card overflow-x-auto p-0">
          <table className="kanchira-table w-full">
            <thead>
              <tr>
                {[
                  "#",
                  "Order ID",
                  "Customer",
                  "Status",
                  "Product Name",
                  "Image",
                  "Qty",
                  "Price",
                  "Subtotal",
                  "Date",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr
                  key={i}
                  className={`hover:bg-amber-50/40 transition ${row.isFirstItem ? "border-t-2 border-amber-100" : ""}`}
                >
                  <td className="px-3 py-2 text-xs text-gray-400">{i + 1}</td>
                  <td className="px-3 py-2 font-mono text-xs text-gray-600">
                    {row.orderId}
                  </td>
                  <td className="px-3 py-2 text-sm font-semibold text-gray-800 whitespace-nowrap">
                    {row.customer}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[row.status] || "bg-gray-100 text-gray-600"}`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-700 font-medium">
                    {row.productName}
                  </td>
                  <td className="px-3 py-2">
                    {row.image ? (
                      <img
                        src={row.image}
                        alt=""
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-600">{row.qty}</td>
                  <td className="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">
                    {row.price !== "—"
                      ? `₹${Number(row.price).toLocaleString("en-IN")}`
                      : "—"}
                  </td>
                  <td className="px-3 py-2 text-sm font-bold text-gray-800 whitespace-nowrap">
                    {row.subtotal
                      ? `₹${row.subtotal.toLocaleString("en-IN")}`
                      : "—"}
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-400 whitespace-nowrap">
                    {row.date}
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Grand total footer */}
            <tfoot>
              <tr className="border-t-2 border-amber-200 bg-amber-50">
                <td
                  colSpan={8}
                  className="px-3 py-3 text-right text-sm font-bold text-gray-700"
                >
                  Grand Total
                </td>
                <td
                  className="px-3 py-3 text-sm font-black"
                  style={{ color: "#640101" }}
                >
                  ₹{totalSales.toLocaleString("en-IN")}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// LOGO / BRAND
// Backend: GET /getLogo → { data: [...] }  →  res.data.data  ✅
// ══════════════════════════════════════════════════════════════════
export function Logo() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ brandName: "", logo: "" });
  const [preview, setPreview] = useState("");
  const [imgLoading, setImgLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await getLogo();
      // Returns { data: [...] }
      const logos = Array.isArray(r.data?.data)
        ? r.data.data
        : r.data?.data
          ? [r.data.data]
          : [];
      setData(logos);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleImage = async (ev) => {
    const file = ev.target.files[0];
    if (!file) return;
    setImgLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await uploadImage(fd);
      setForm((f) => ({ ...f, logo: data.imageUrl }));
      setPreview(data.imageUrl);
    } catch {
      toast.error("Upload failed.");
    } finally {
      setImgLoading(false);
    }
  };

  const handleCreate = async (ev) => {
    ev.preventDefault();
    setSaving(true);
    try {
      await createLogo(form);
      toast.success("Logo created!");
      setShowCreate(false);
      load();
    } catch {
      toast.error("Failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteLogo(deleteId);
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
      key: "logo",
      label: "Logo",
      render: (r) =>
        r.logo ? (
          <img src={r.logo} alt="" className="h-12 w-auto object-contain" />
        ) : (
          "—"
        ),
    },
    { key: "brandName", label: "Brand", searchable: true },
    { key: "email", label: "Email", searchable: true },
    { key: "phoneNumber", label: "Phone" },
  ];

  return (
    <div>
      <PageHeader
        title="Logo / Brand"
        buttonLabel={showCreate ? "Cancel" : "Add Logo"}
        onButtonClick={() => setShowCreate((s) => !s)}
      />

      {showCreate && (
        <div className="kanchira-card max-w-lg mb-6">
          <h3 className="font-semibold mb-4" style={{ color: "#640101" }}>
            Add Logo
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <Field label="Brand Name">
              <input
                className="kanchira-input"
                value={form.brandName}
                onChange={(e) =>
                  setForm({ ...form, brandName: e.target.value })
                }
              />
            </Field>
            <ImageUpload
              preview={preview}
              onChange={handleImage}
              loading={imgLoading}
            />
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}

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
            searchPlaceholder="Search..."
            actions={(row) => (
              <>
                <button
                  className="btn-edit btn-icon"
                  onClick={() =>
                    navigate("/dashboard/logo/update", { state: { item: row } })
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

export function LogoUpdate() {
  const navigate = useNavigate();
  const location = useLocation();
  const item = location.state?.item;
  const [form, setForm] = useState(item || {});
  const [preview, setPreview] = useState(item?.logo || "");
  const [imgLoading, setImgLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleImage = async (ev) => {
    const file = ev.target.files[0];
    if (!file) return;
    setImgLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await uploadImage(fd);
      setForm((f) => ({ ...f, logo: data.imageUrl }));
      setPreview(data.imageUrl);
    } catch {
      toast.error("Upload failed.");
    } finally {
      setImgLoading(false);
    }
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setLoading(true);
    try {
      await updateLogo(form);
      toast.success("Updated!");
      navigate("/dashboard/logo");
    } catch {
      toast.error("Failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Update Logo"
        backPath="/dashboard/logo"
        navigate={navigate}
      />
      <FormCard
        title="Edit Brand Logo"
        onSubmit={handleSubmit}
        onCancel={() => navigate("/dashboard/logo")}
        submitLabel="Update"
        loading={loading}
      >
        <Field label="Brand Name">
          <input
            className="kanchira-input"
            value={form.brandName || ""}
            onChange={(e) => setForm({ ...form, brandName: e.target.value })}
          />
        </Field>
        <Field label="Email">
          <input
            className="kanchira-input"
            value={form.email || ""}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>
        <Field label="Phone Number">
          <input
            className="kanchira-input"
            value={form.phoneNumber || ""}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
          />
        </Field>
        <Field label="Address">
          <input
            className="kanchira-input"
            value={form.address || ""}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </Field>
        <ImageUpload
          preview={preview}
          onChange={handleImage}
          loading={imgLoading}
          label="Update Logo Image"
        />
      </FormCard>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// PINCODE
// Backend: GET /getPincode → { pincodes: [...] }
// Note: Pincode model only has { pincode, available } fields
// ══════════════════════════════════════════════════════════════════
export function Pincode() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ pincode: "", available: true });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await getPincodes();
      setData(Array.isArray(r.data?.pincodes) ? r.data.pincodes : []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (ev) => {
    ev.preventDefault();
    if (!form.pincode) {
      toast.error("Pincode is required");
      return;
    }
    setSaving(true);
    try {
      await createPincode(form);
      toast.success("Pincode added!");
      setShowCreate(false);
      setForm({ pincode: "", available: true });
      load();
    } catch {
      toast.error("Failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePincode(deleteId);
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
      key: "pincode",
      label: "Pincode",
      searchable: true,
      render: (r) => <span className="font-mono font-bold">{r.pincode}</span>,
    },
    {
      key: "available",
      label: "Available",
      render: (r) => <Badge value={r.available} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Delivery Pincodes"
        buttonLabel={showCreate ? "Cancel" : "Add Pincode"}
        onButtonClick={() => setShowCreate((s) => !s)}
      />

      {showCreate && (
        <div className="kanchira-card max-w-sm mb-6">
          <h3 className="font-semibold mb-4" style={{ color: "#640101" }}>
            Add Pincode
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <Field label="Pincode" required>
              <input
                className="kanchira-input"
                placeholder="600001"
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
              />
            </Field>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded"
                checked={form.available}
                onChange={(e) =>
                  setForm({ ...form, available: e.target.checked })
                }
              />
              <span className="text-sm text-gray-700">
                Available for delivery
              </span>
            </label>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Add Pincode"}
              </button>
            </div>
          </form>
        </div>
      )}

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
            searchPlaceholder="Search pincodes..."
            actions={(row) => (
              <button
                className="btn-danger btn-icon"
                onClick={() => setDeleteId(row._id)}
              >
                <i className="fa fa-trash text-xs" />
              </button>
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
// FESTIVAL DISCOUNTS
// Backend: GET /getfestival → raw array  →  res.data  ✅
// ══════════════════════════════════════════════════════════════════
export function FestivalDiscount() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await getFestivalDiscounts();
      setData(Array.isArray(r.data) ? r.data : []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpdate = async (ev) => {
    ev.preventDefault();
    setSaving(true);
    try {
      await updateFestivalDiscount(editItem._id, editItem);
      toast.success("Festival discount updated!");
      setEditItem(null);
      load();
    } catch {
      toast.error("Update failed.");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: "name",
      label: "Name",
      searchable: true,
      render: (r) => <span className="font-medium">{r.name}</span>,
    },
    {
      key: "description",
      label: "Description",
      render: (r) => (
        <span className="line-clamp-1 max-w-xs">{r.description}</span>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (r) => (
        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium capitalize">
          {r.type}
        </span>
      ),
    },
    {
      key: "value",
      label: "Value",
      render: (r) => (r.type === "percentage" ? `${r.value}%` : `₹${r.value}`),
    },
    {
      key: "expiryDate",
      label: "Expiry",
      render: (r) =>
        r.expiryDate ? new Date(r.expiryDate).toLocaleDateString() : "—",
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Festival Discounts</h1>
      </div>
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
            searchPlaceholder="Search discounts..."
            actions={(row) => (
              <button
                className="btn-edit btn-icon"
                onClick={() => setEditItem({ ...row })}
              >
                <i className="fa fa-pencil text-xs" />
              </button>
            )}
          />
        </div>
      )}

      {editItem && (
        <div className="modal-overlay" onClick={() => setEditItem(null)}>
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold mb-4" style={{ color: "#640101" }}>
              Update Festival Discount
            </h3>
            <form onSubmit={handleUpdate} className="space-y-3">
              <Field label="Name">
                <input
                  className="kanchira-input"
                  value={editItem.name || ""}
                  onChange={(e) =>
                    setEditItem({ ...editItem, name: e.target.value })
                  }
                />
              </Field>
              <Field label="Description">
                <input
                  className="kanchira-input"
                  value={editItem.description || ""}
                  onChange={(e) =>
                    setEditItem({ ...editItem, description: e.target.value })
                  }
                />
              </Field>
              <Field label="Type">
                <select
                  className="kanchira-input"
                  value={editItem.type || "percentage"}
                  onChange={(e) =>
                    setEditItem({ ...editItem, type: e.target.value })
                  }
                >
                  <option value="percentage">Percentage</option>
                  <option value="flat">Flat</option>
                </select>
              </Field>
              <Field label="Value">
                <input
                  type="number"
                  className="kanchira-input"
                  value={editItem.value || ""}
                  onChange={(e) =>
                    setEditItem({ ...editItem, value: e.target.value })
                  }
                />
              </Field>
              <Field label="Expiry Date">
                <input
                  type="date"
                  className="kanchira-input"
                  value={
                    editItem.expiryDate ? editItem.expiryDate.slice(0, 10) : ""
                  }
                  onChange={(e) =>
                    setEditItem({ ...editItem, expiryDate: e.target.value })
                  }
                />
              </Field>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditItem(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? "Updating..." : "Update"}
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
// COUPON CODES
// Backend: GET /getCoupons → raw array  →  res.data  ✅
// ══════════════════════════════════════════════════════════════════
export function CouponCodes() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    code: "",
    type: "percentage",
    value: "",
    expiryDate: "",
    active: true,
  });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await getCoupons();
      setData(Array.isArray(r.data) ? r.data : []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (ev) => {
    ev.preventDefault();
    setSaving(true);
    try {
      await createCoupon(form);
      toast.success("Coupon created!");
      setShowCreate(false);
      setForm({
        code: "",
        type: "percentage",
        value: "",
        expiryDate: "",
        active: true,
      });
      load();
    } catch {
      toast.error("Failed to create coupon.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCoupon(deleteTarget._id);
      toast.success("Coupon deleted!");
      setDeleteTarget(null);
      load();
    } catch {
      toast.error("Failed to delete coupon.");
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: "code",
      label: "Code",
      searchable: true,
      render: (r) => (
        <span className="font-mono font-bold text-sm tracking-wider">
          {r.code}
        </span>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (r) => (
        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs capitalize">
          {r.type}
        </span>
      ),
    },
    {
      key: "value",
      label: "Value",
      render: (r) => (r.type === "percentage" ? `${r.value}%` : `₹${r.value}`),
    },
    {
      key: "expiryDate",
      label: "Expiry",
      render: (r) =>
        r.expiryDate ? new Date(r.expiryDate).toLocaleDateString() : "—",
    },
    {
      key: "active",
      label: "Status",
      render: (r) => (
        <Badge value={r.active} truthy="Active" falsy="Inactive" />
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <button
          onClick={() => setDeleteTarget(r)}
          className="px-3 py-1 rounded-lg text-xs font-medium text-white"
          style={{ backgroundColor: "#640101" }}
        >
          <i className="fa fa-trash mr-1" />
          Delete
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Coupon Codes"
        buttonLabel={showCreate ? "Cancel" : "Create Coupon"}
        onButtonClick={() => setShowCreate((s) => !s)}
      />

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <i className="fa fa-trash text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Delete Coupon</h3>
                <p className="text-sm text-gray-500">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-5">
              Are you sure you want to delete coupon{" "}
              <span className="font-mono font-bold text-red-700">
                {deleteTarget.code}
              </span>
              ?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                className="btn-secondary"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ backgroundColor: "#640101" }}
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="kanchira-card max-w-lg mb-6">
          <h3 className="font-semibold mb-4" style={{ color: "#640101" }}>
            New Coupon
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <Field label="Coupon Code">
              <input
                className="kanchira-input uppercase"
                placeholder="SUMMER20"
                value={form.code}
                onChange={(e) =>
                  setForm({ ...form, code: e.target.value.toUpperCase() })
                }
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Type">
                <select
                  className="kanchira-input"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="percentage">Percentage</option>
                  <option value="flat">Flat</option>
                </select>
              </Field>
              <Field label="Value">
                <input
                  type="number"
                  className="kanchira-input"
                  placeholder="0"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Expiry Date">
              <input
                type="date"
                className="kanchira-input"
                value={form.expiryDate}
                onChange={(e) =>
                  setForm({ ...form, expiryDate: e.target.value })
                }
              />
            </Field>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-success" disabled={saving}>
                {saving ? "Creating..." : "Create Coupon"}
              </button>
            </div>
          </form>
        </div>
      )}

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
            searchPlaceholder="Search coupons..."
          />
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// ADDRESS
// Backend: GET /getAllAddress → { address: [...] }
// ══════════════════════════════════════════════════════════════════
export function Address() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAddresses()
      .then((r) =>
        setData(Array.isArray(r.data?.address) ? r.data.address : []),
      )
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    {
      key: "fullName",
      label: "Name",
      searchable: true,
      render: (r) => r.fullName || r.name || "—",
    },
    { key: "phone", label: "Phone", searchable: true },
    {
      key: "currentAddress",
      label: "Address",
      searchable: true,
      render: (r) =>
        `${r.houseNumber || ""} ${r.currentAddress || r.address || ""}`.trim() ||
        "—",
    },
    { key: "city", label: "City", searchable: true },
    { key: "district", label: "District" },
    { key: "state", label: "State" },
    {
      key: "pincode",
      label: "Pincode",
      render: (r) => <span className="font-mono">{r.pincode}</span>,
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Addresses</h1>
      </div>
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
            searchPlaceholder="Search addresses..."
          />
        </div>
      )}
    </div>
  );
}
