import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  superAdminGetUsedCoupons,
  superAdminAddUsedCoupon,
  superAdminUpdateUsedCoupon,
  superAdminDeleteUsedCoupon,
  superAdminGetOrderCouponUsages,
  getSpecialCoupons,
} from "../../services/superAdminApi";
import { DataTable } from "../../components/UI";

// ── Status badge colours ──────────────────────────────────────────
const STATUS_COLORS = {
  Active: "bg-green-100 text-green-700",
  Used: "bg-blue-100 text-blue-700",
  Expired: "bg-red-100 text-red-600",
  Inactive: "bg-gray-100 text-gray-600",
};

// ── Add Used Coupon Modal ─────────────────────────────────────────
function AddUsedCouponModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    userName: "",
    userEmail: "",
    userPhone: "",
    couponCode: "",
    discountAmount: "",
    discountPercent: "",
  });
  const [adding, setAdding] = useState(false);
  const [specialCoupons, setSpecialCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getSpecialCoupons({ limit: 100, isActive: true });
        const list =
          res.data?.data?.coupons || res.data?.coupons || res.data?.data || [];
        setSpecialCoupons(list);
      } catch {
        setSpecialCoupons([]);
      } finally {
        setLoadingCoupons(false);
      }
    };
    load();
  }, []);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.userName || !form.userEmail || !form.userPhone) {
      toast.error("Please fill in Name, Email, and Phone");
      return;
    }
    if (!form.couponCode) {
      toast.error("Please select a coupon code");
      return;
    }
    setAdding(true);
    await onAdd({ ...form, usedAt: new Date().toISOString(), status: "Used" });
    setAdding(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between sticky top-0 bg-white pb-2 border-b border-gray-100">
          <h2 className="text-lg font-bold" style={{ color: "#640101" }}>
            <i className="fa fa-plus mr-2" />
            Add Used Coupon
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none flex-shrink-0"
          >
            <i className="fa fa-times" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Person Details */}
          <div className="bg-amber-50 rounded-lg px-4 py-3 border border-amber-100">
            <p className="text-xs font-semibold text-amber-700 uppercase mb-3">
              <i className="fa fa-user mr-1" /> Person Details
            </p>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="userName"
                value={form.userName}
                onChange={handleChange}
                placeholder="e.g. John Doe"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#640101] transition"
              />
            </div>
            <div className="mt-3">
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="userEmail"
                value={form.userEmail}
                onChange={handleChange}
                placeholder="e.g. john@example.com"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#640101] transition"
              />
            </div>
            <div className="mt-3">
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="userPhone"
                value={form.userPhone}
                onChange={handleChange}
                placeholder="e.g. 9876543210"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#640101] transition"
              />
            </div>
          </div>

          {/* Coupon Details */}
          <div className="bg-blue-50 rounded-lg px-4 py-3 border border-blue-100">
            <p className="text-xs font-semibold text-blue-700 uppercase mb-3">
              <i className="fa fa-crown mr-1" /> Coupon Details
            </p>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Coupon Code <span className="text-red-500">*</span>
              </label>
              {loadingCoupons ? (
                <div className="flex items-center gap-2 py-2 text-sm text-gray-500">
                  <i className="fa fa-spinner fa-spin" /> Loading coupons…
                </div>
              ) : (
                <select
                  name="couponCode"
                  value={form.couponCode}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#640101] transition bg-white"
                >
                  <option value="">Select Coupon Code</option>
                  {specialCoupons.map((c) => (
                    <option key={c._id} value={c.code}>
                      {c.code} —{" "}
                      {c.discountType === "percentage"
                        ? `${c.discountValue}% OFF`
                        : `₹${c.discountValue} OFF`}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                  Discount ₹
                </label>
                <input
                  type="number"
                  name="discountAmount"
                  value={form.discountAmount}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#640101] transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                  Discount %
                </label>
                <input
                  type="number"
                  name="discountPercent"
                  value={form.discountPercent}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  max="100"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#640101] transition"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-3 border-t border-gray-100 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={adding}
            className="flex-1 py-2 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-60"
            style={{ backgroundColor: "#640101" }}
          >
            {adding ? (
              <span>
                <i className="fa fa-spinner fa-spin mr-1" />
                Adding…
              </span>
            ) : (
              <span>
                <i className="fa fa-check mr-1" />
                Add Coupon Usage
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Edit Modal ────────────────────────────────────────────────────
function EditCouponModal({ coupon, onClose, onSave }) {
  const [form, setForm] = useState({
    status: coupon.status || "Used",
    discountAmount: coupon.discountAmount || "",
    discountPercent: coupon.discountValue || "",
    couponCode: coupon.couponCode || "",
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    setSaving(true);
    await onSave({ ...coupon, ...form });
    setSaving(false);
  };

  const isOrderRecord = coupon.source === "order";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold" style={{ color: "#640101" }}>
            <i className="fa fa-edit mr-2" />
            Edit Coupon Record
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            <i className="fa fa-times" />
          </button>
        </div>

        {isOrderRecord && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-amber-700 text-xs flex items-center gap-2">
            <i className="fa fa-info-circle" />
            This record was auto-created from a user order and is view-only.
          </div>
        )}

        {/* User info */}
        <div className="bg-amber-50 rounded-xl px-4 py-3 flex items-center gap-3 border border-amber-100">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ backgroundColor: "#640101" }}
          >
            {(coupon.userName || "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {coupon.userName || "—"}
            </p>
            <p className="text-xs text-gray-500">{coupon.userEmail || "—"}</p>
            <p className="text-xs text-gray-400">{coupon.userPhone || "—"}</p>
          </div>
        </div>

        {/* Show which admin/superadmin created this coupon */}
        {isOrderRecord && coupon.createdByAdmin && (
          <div className="bg-orange-50 rounded-xl px-4 py-3 border border-orange-100">
            <p className="text-xs font-semibold text-orange-700 uppercase mb-1">
              <i className="fa fa-user-shield mr-1" /> Coupon Created By
            </p>
            <p className="text-sm font-semibold text-gray-800">
              {coupon.createdByAdmin.name || "—"}
            </p>
            {coupon.createdByAdmin.email && (
              <p className="text-xs text-gray-500">
                {coupon.createdByAdmin.email}
              </p>
            )}
            {coupon.createdByAdmin.phone && (
              <p className="text-xs text-gray-400">
                {coupon.createdByAdmin.phone}
              </p>
            )}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Status
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              disabled={isOrderRecord}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#640101] transition bg-white disabled:opacity-60"
            >
              {Object.keys(STATUS_COLORS).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Coupon Code
            </label>
            <input
              type="text"
              name="couponCode"
              value={form.couponCode}
              onChange={handleChange}
              disabled={isOrderRecord}
              placeholder="e.g. SUPER20"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#640101] transition disabled:opacity-60"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Discount ₹
              </label>
              <input
                type="number"
                name="discountAmount"
                value={form.discountAmount}
                onChange={handleChange}
                disabled={isOrderRecord}
                placeholder="0"
                min="0"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#640101] transition disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Discount %
              </label>
              <input
                type="number"
                name="discountPercent"
                value={form.discountPercent}
                onChange={handleChange}
                disabled={isOrderRecord}
                placeholder="0"
                min="0"
                max="100"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#640101] transition disabled:opacity-60"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            {isOrderRecord ? "Close" : "Cancel"}
          </button>
          {!isOrderRecord && (
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 py-2 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-60"
              style={{ backgroundColor: "#640101" }}
            >
              {saving ? (
                <span>
                  <i className="fa fa-spinner fa-spin mr-1" />
                  Saving…
                </span>
              ) : (
                <span>
                  <i className="fa fa-check mr-1" />
                  Save Changes
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirmation Modal ─────────────────────────────────────
function DeleteConfirmModal({ coupon, onClose, onConfirm, deleting }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="text-4xl mb-3">🗑️</div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            Delete Record?
          </h3>
          <p className="text-sm text-gray-600">
            Are you sure you want to delete <strong>{coupon.userName}</strong>'s
            coupon record? This action cannot be undone.
          </p>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-2 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-60"
            style={{ backgroundColor: "#640101" }}
          >
            {deleting ? (
              <span>
                <i className="fa fa-spinner fa-spin mr-1" />
                Deleting…
              </span>
            ) : (
              <span>
                <i className="fa fa-trash mr-1" />
                Delete
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Detail Modal ──────────────────────────────────────────────────
function CouponDetailModal({ coupon, onClose }) {
  const typeLabel =
    coupon.source === "order"
      ? coupon.createdByType === "superadmin"
        ? "SuperAdmin Coupon (used at checkout)"
        : "Admin Coupon (used at checkout)"
      : coupon.source === "admin"
        ? "SuperAdmin Coupon (Manual)"
        : "SuperAdmin Coupon (Website)";

  const rows = [
    { label: "User Name", value: coupon.userName },
    { label: "Email", value: coupon.userEmail || "—" },
    { label: "Phone", value: coupon.userPhone },
    { label: "Coupon Code", value: coupon.couponCode },
    { label: "Coupon Type", value: typeLabel },
    ...(coupon.source === "order" && coupon.createdByAdmin
      ? [
          {
            label: "Coupon Created By",
            value: `${coupon.createdByAdmin.name || "Unknown"}${
              coupon.createdByAdmin.phone
                ? ` · ${coupon.createdByAdmin.phone}`
                : ""
            }`,
          },
        ]
      : []),
    {
      label: "Discount",
      value:
        coupon.discountAmount && Number(coupon.discountAmount) > 0
          ? `₹${Number(coupon.discountAmount).toLocaleString("en-IN")}`
          : coupon.discountValue && Number(coupon.discountValue) > 0
            ? `${coupon.discountValue}%`
            : "—",
    },
    {
      label: "Order Amount",
      value:
        coupon.orderAmount && Number(coupon.orderAmount) > 0
          ? `₹${Number(coupon.orderAmount).toLocaleString("en-IN")}`
          : "—",
    },
    { label: "Status", value: coupon.status || "Used" },
    {
      label: "Used At",
      value: coupon.usedAt
        ? new Date(coupon.usedAt).toLocaleString("en-IN")
        : "—",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold" style={{ color: "#640101" }}>
            <i className="fa fa-info-circle mr-2" />
            Coupon Usage Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            <i className="fa fa-times" />
          </button>
        </div>

        <div className="space-y-0 text-sm divide-y divide-gray-100">
          {rows.map(({ label, value }) => (
            <div key={label} className="flex justify-between py-2.5">
              <span className="text-gray-500 font-medium">{label}</span>
              <span className="text-gray-800 text-right max-w-[55%] break-words">
                {value || "—"}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition mt-2"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────
const PAGE_SIZES = [10, 25, 50, 100];

function usePagination(data) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const paged = data.slice((safePage - 1) * pageSize, safePage * pageSize);
  const start = data.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, data.length);

  return {
    paged,
    page: safePage,
    setPage,
    pageSize,
    setPageSize: (sz) => {
      setPageSize(sz);
      setPage(1);
    },
    totalPages,
    start,
    end,
    total: data.length,
  };
}

// ── Main Component ────────────────────────────────────────────────
export default function UsedCoupons() {
  const navigate = useNavigate();

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchUsedCoupons();
  }, []);

  const fetchUsedCoupons = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await superAdminGetUsedCoupons({ limit: 500 });
      const usageData = Array.isArray(res.data?.data?.data)
        ? res.data.data.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data?.usages)
            ? res.data.usages
            : Array.isArray(res.data)
              ? res.data
              : [];

      const usageRecords = usageData.map((c) => ({
        ...c,
        _rowId: `usage-${c._id}`,
      }));

      let orderRecords = [];
      try {
        const ordRes = await superAdminGetOrderCouponUsages();
        const usages = Array.isArray(ordRes.data?.usages)
          ? ordRes.data.usages
          : [];
        orderRecords = usages.map((u) => ({
          ...u,
          _rowId: `order-${u._id}`,
        }));
      } catch (ordErr) {
        console.warn("Could not fetch order-based coupons:", ordErr.message);
      }

      const combined = [...usageRecords, ...orderRecords];
      combined.sort((a, b) => new Date(b.usedAt) - new Date(a.usedAt));
      setCoupons(combined);
    } catch (err) {
      console.error("Failed to fetch used coupons:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load used coupons",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (newCoupon) => {
    try {
      const res = await superAdminAddUsedCoupon({
        couponCode: newCoupon.couponCode,
        userName: newCoupon.userName,
        userEmail: newCoupon.userEmail,
        userPhone: newCoupon.userPhone,
        discountAmount: Number(newCoupon.discountAmount) || 0,
        discountValue: Number(newCoupon.discountPercent) || 0,
        status: "Used",
        source: "admin",
      });
      const saved =
        res.data?.data?.usage || res.data?.usage || res.data?.data || res.data;
      const tagged = { ...saved, _rowId: `usage-${saved._id}` };
      setCoupons((prev) => [tagged, ...prev]);
      setShowAddModal(false);
      toast.success("Coupon usage recorded successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add record");
    }
  };

  const handleSave = async (updated) => {
    try {
      const res = await superAdminUpdateUsedCoupon(updated._id, {
        status: updated.status,
        couponCode: updated.couponCode,
        discountAmount: Number(updated.discountAmount) || 0,
        discountValue: Number(updated.discountPercent) || 0,
      });
      const saved =
        res.data?.data?.usage || res.data?.usage || res.data?.data || res.data;
      setCoupons((prev) =>
        prev.map((c) =>
          c._id === (saved._id || updated._id) ? { ...c, ...saved } : c,
        ),
      );
      setEditTarget(null);
      toast.success("Coupon record updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update record");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.source === "order") {
      toast.error("Order records cannot be deleted here");
      setDeleteTarget(null);
      return;
    }
    setDeleting(true);
    try {
      await superAdminDeleteUsedCoupon(deleteTarget._id);
      setCoupons((prev) =>
        prev.filter((c) => c._rowId !== deleteTarget._rowId),
      );
      setDeleteTarget(null);
      toast.success("Record deleted!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete record");
    } finally {
      setDeleting(false);
    }
  };

  const filteredCoupons = coupons.filter((c) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      (c.userName || "").toLowerCase().includes(q) ||
      (c.userEmail || "").toLowerCase().includes(q) ||
      (c.userPhone || "").toLowerCase().includes(q) ||
      (c.couponCode || "").toLowerCase().includes(q) ||
      (c.createdByAdmin?.name || "").toLowerCase().includes(q);

    const matchType =
      filterType === "all"
        ? true
        : filterType === "superadmin"
          ? c.source === "frontend" || c.source === "admin"
          : filterType === "admin"
            ? c.source === "order"
            : true;

    return matchSearch && matchType;
  });

  const pg = usePagination(filteredCoupons);

  const totalSaved = coupons.reduce(
    (s, c) => s + (Number(c.discountAmount) || 0),
    0,
  );
  const saCount = coupons.filter(
    (c) => c.source === "frontend" || c.source === "admin",
  ).length;
  const orderCount = coupons.filter((c) => c.source === "order").length;
  const manualCount = coupons.filter((c) => c.source === "admin").length;

  // ── Table columns ─────────────────────────────────────────────────
  const columns = [
    {
      key: "userName",
      label: "User",
      render: (r) => (
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: "#640101" }}
          >
            {(r.userName || "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-800 text-sm leading-tight">
              {r.userName || "—"}
            </p>
            {r.userEmail ? (
              <a
                href={`mailto:${r.userEmail}`}
                className="text-xs text-gray-400 hover:text-[#640101] transition"
              >
                {r.userEmail}
              </a>
            ) : (
              <span className="text-xs text-gray-300">No email</span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "userPhone",
      label: "Phone",
      render: (r) => (
        <span className="font-mono text-sm text-gray-700">
          {r.userPhone || "—"}
        </span>
      ),
    },
    {
      key: "couponCode",
      label: "Coupon Code",
      render: (r) =>
        r.couponCode ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#640101]/10 text-[#640101]">
            <i className="fa fa-tag text-[10px]" />
            {r.couponCode}
          </span>
        ) : (
          <span className="text-gray-400 text-sm">—</span>
        ),
    },
    // ── TYPE column — reflects actual creator (SA or Admin) ──────
    {
      key: "source",
      label: "Type",
      render: (r) => {
        let config;
        if (r.source === "order") {
          // createdByType="superadmin" means the coupon was created by SuperAdmin
          config =
            r.createdByType === "superadmin"
              ? { label: "SA Coupon", cls: "bg-blue-100 text-blue-700" }
              : { label: "Admin Coupon", cls: "bg-amber-100 text-amber-700" };
        } else if (r.source === "admin") {
          config = { label: "SA Manual", cls: "bg-purple-100 text-purple-700" };
        } else {
          config = { label: "SA Website", cls: "bg-blue-100 text-blue-700" };
        }
        return (
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.cls}`}
          >
            {config.label}
          </span>
        );
      },
    },
    // ── COUPON BY column ─────────────────────────────────────────
    {
      key: "createdByAdmin",
      label: "Coupon By",
      render: (r) => {
        if (r.source === "order") {
          if (r.createdByAdmin) {
            return (
              <div>
                <p className="text-xs font-semibold text-gray-700">
                  {r.createdByAdmin.name || "—"}
                </p>
                {r.createdByAdmin.phone && (
                  <p className="text-xs text-gray-400">
                    {r.createdByAdmin.phone}
                  </p>
                )}
              </div>
            );
          }
          return (
            <span className="text-xs text-gray-400 italic">Admin deleted</span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-violet-100 text-violet-700 font-medium">
            <i className="fa fa-crown text-[9px]" /> SuperAdmin
          </span>
        );
      },
    },
    {
      key: "discount",
      label: "Discount",
      render: (r) => {
        if (r.discountAmount && Number(r.discountAmount) > 0) {
          return (
            <span className="text-sm font-semibold text-green-600">
              -₹{Number(r.discountAmount).toLocaleString("en-IN")}
            </span>
          );
        }
        if (r.discountValue && Number(r.discountValue) > 0) {
          return (
            <span className="text-sm font-semibold text-green-600">
              -{r.discountValue}%
            </span>
          );
        }
        return <span className="text-gray-400 text-sm">—</span>;
      },
    },
    {
      key: "orderAmount",
      label: "Order ₹",
      render: (r) =>
        r.orderAmount && Number(r.orderAmount) > 0 ? (
          <span className="text-sm text-gray-700">
            ₹{Number(r.orderAmount).toLocaleString("en-IN")}
          </span>
        ) : (
          <span className="text-gray-400 text-sm">—</span>
        ),
    },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            STATUS_COLORS[r.status] || "bg-gray-100 text-gray-600"
          }`}
        >
          {r.status || "Used"}
        </span>
      ),
    },
    {
      key: "usedAt",
      label: "Date",
      render: (r) =>
        r.usedAt ? (
          <span className="text-sm text-gray-600">
            {new Date(r.usedAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        ) : (
          <span className="text-gray-400 text-sm">—</span>
        ),
    },
  ];

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {showAddModal && (
        <AddUsedCouponModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAdd}
        />
      )}
      {editTarget && (
        <EditCouponModal
          coupon={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={handleSave}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          coupon={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}
      {detailTarget && (
        <CouponDetailModal
          coupon={detailTarget}
          onClose={() => setDetailTarget(null)}
        />
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#640101" }}>
            <i className="fa fa-history mr-2" />
            Used Coupons
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            All coupon usages — SuperAdmin special coupons &amp; regular admin
            order coupons
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition"
            style={{ backgroundColor: "#640101" }}
          >
            <i className="fa fa-plus" /> Add Record
          </button>
          <button
            onClick={fetchUsedCoupons}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            <i className="fa fa-refresh" /> Refresh
          </button>
          <button
            onClick={() => navigate("/superadmin/coupons")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            <i className="fa fa-arrow-left" /> Back
          </button>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="bg-white rounded-lg px-4 py-3 border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex items-center gap-3 flex-1">
          <i className="fa fa-search text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone, coupon code, or admin name…"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              pg.setPage(1);
            }}
            className="flex-1 outline-none text-sm bg-transparent"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="fa fa-times" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {[
            { key: "all", label: "All" },
            { key: "superadmin", label: "SuperAdmin Coupons" },
            { key: "admin", label: "Admin Order Coupons" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => {
                setFilterType(f.key);
                pg.setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                filterType === f.key
                  ? "text-white border-transparent"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
              style={filterType === f.key ? { backgroundColor: "#640101" } : {}}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-800 text-sm flex items-center gap-2">
          <i className="fa fa-exclamation-circle text-red-500" />
          {error}
          <button
            onClick={fetchUsedCoupons}
            className="ml-auto text-red-600 underline text-xs font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Legend */}
      {!error && !loading && coupons.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-xs text-gray-500 flex flex-wrap gap-x-6 gap-y-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
            <b>SA Website</b> — User applied superadmin coupon on the website
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />
            <b>SA Manual</b> — Superadmin added manually
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
            <b>SA Coupon</b> — SuperAdmin coupon used at checkout
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            <b>Admin Coupon</b> — Admin coupon used at checkout
          </span>
        </div>
      )}

      {/* Summary Stats */}
      {!loading && coupons.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            {
              label: "Total Records",
              value: coupons.length,
              icon: "fa-ticket",
              color: "#640101",
            },
            {
              label: "SA Website",
              value: coupons.filter((c) => c.source === "frontend").length,
              icon: "fa-globe",
              color: "#6D28D9",
            },
            {
              label: "SA Manual",
              value: manualCount,
              icon: "fa-user-shield",
              color: "#9333ea",
            },
            {
              label: "Admin Orders",
              value: orderCount,
              icon: "fa-shopping-cart",
              color: "#D97706",
            },
            {
              label: "Total Saved ₹",
              value: `₹${totalSaved.toLocaleString("en-IN")}`,
              icon: "fa-inr",
              color: "#16a34a",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: stat.color }}
                >
                  <i className={`fa ${stat.icon} text-white text-xs`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide leading-tight">
                    {stat.label}
                  </p>
                  <p className="text-base font-bold text-gray-800">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div
              className="animate-spin rounded-full h-8 w-8 border-b-2"
              style={{ borderColor: "#640101" }}
            />
            <span className="ml-3 text-sm text-gray-500">
              Loading coupon records…
            </span>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <i className="fa fa-inbox text-4xl mb-3 block" />
            <p className="text-sm font-medium">No records found.</p>
            {(searchTerm || filterType !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterType("all");
                }}
                className="mt-2 text-xs underline"
                style={{ color: "#640101" }}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <DataTable
              columns={columns}
              data={pg.paged}
              hideControls={true}
              actions={(row) => (
                <div className="flex gap-1">
                  <button
                    onClick={() => setDetailTarget(row)}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-500 transition"
                    title="View Details"
                  >
                    <i className="fa fa-eye text-sm" />
                  </button>
                  {row.source !== "order" && (
                    <>
                      <button
                        onClick={() => setEditTarget(row)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-blue-50 text-blue-600 transition"
                        title="Edit"
                      >
                        <i className="fa fa-pencil text-sm" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(row)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-50 text-red-500 transition"
                        title="Delete"
                      >
                        <i className="fa fa-trash text-sm" />
                      </button>
                    </>
                  )}
                </div>
              )}
            />
          </div>
        )}

        {!loading && filteredCoupons.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-3">
              <span>
                Showing {pg.start}–{pg.end} of {pg.total} records
              </span>
              <span className="text-gray-300">|</span>
              <span>
                {saCount} superadmin · {orderCount} admin orders
              </span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={pg.pageSize}
                onChange={(e) => pg.setPageSize(Number(e.target.value))}
                className="border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-[#640101]"
              >
                {PAGE_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s} / page
                  </option>
                ))}
              </select>
              <button
                onClick={() => pg.setPage((p) => Math.max(1, p - 1))}
                disabled={pg.page === 1}
                className="px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition"
              >
                ‹ Prev
              </button>
              <span className="px-2">
                {pg.page} / {pg.totalPages}
              </span>
              <button
                onClick={() =>
                  pg.setPage((p) => Math.min(pg.totalPages, p + 1))
                }
                disabled={pg.page === pg.totalPages}
                className="px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition"
              >
                Next ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
