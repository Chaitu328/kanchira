
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getSpecialCoupons, deleteSpecialCoupon } from "../../api";
import { toast } from "react-toastify";

const SpecialCouponsList = () => {
  const [coupons, setCoupons] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const fetchCoupons = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (filterActive) params.isActive = filterActive;
      
      const res = await getSpecialCoupons(params);
      setCoupons(res.data.data.coupons || []);
      setPagination(res.data.data.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 });
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load coupons";
      toast.error(msg);
      if (err.response?.status === 403) {
        toast.error("Access denied: Super Admin only");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons(1);
  }, [search, filterActive]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteSpecialCoupon(deleteTarget._id);
      toast.success("Coupon deleted successfully");
      setDeleteTarget(null);
      fetchCoupons(pagination.page);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete coupon";
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (coupon) => {
    const isExpired = new Date(coupon.expiryDate) < new Date();
    if (isExpired) return { text: "Expired", class: "bg-gray-100 text-gray-600" };
    if (coupon.isActive) return { text: "Active", class: "bg-green-100 text-green-700" };
    return { text: "Inactive", class: "bg-red-100 text-red-700" };
  };

  const getDiscountLabel = (coupon) => {
    if (coupon.discountType === "percentage") return `${coupon.discountValue}% OFF`;
    return `₹${coupon.discountValue} OFF`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <span className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </span>
            Special Coupons
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {pagination.total} total coupons · Super Admin only
          </p>
        </div>
        <Link
          to="/superadmin/coupons/create"
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition flex items-center gap-2 text-sm font-medium shadow-lg"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create New Coupon
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">All Status</option>
          <option value="true">Active Only</option>
          <option value="false">Inactive Only</option>
        </select>
      </div>

      {/* Coupons Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <p className="text-lg text-gray-500 font-medium">No coupons found</p>
          <p className="text-sm text-gray-400 mt-1">Create your first special coupon</p>
          <Link to="/superadmin/coupons/create" className="inline-block mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-600 transition">
            Create Coupon
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Discount</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Usage</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Expiry</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coupons.map((coupon) => {
                  const status = getStatusBadge(coupon);
                  return (
                    <tr key={coupon._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="font-mono font-bold text-gray-800">{coupon.code}</div>
                        <div className="text-xs text-gray-500 mt-1 truncate max-w-[200px]">{coupon.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
                          {getDiscountLabel(coupon)}
                        </span>
                        {coupon.minOrderAmount > 0 && (
                          <div className="text-xs text-gray-500 mt-1">Min: ₹{coupon.minOrderAmount}</div>
                        )}
                        {coupon.maxDiscountAmount > 0 && coupon.discountType === "percentage" && (
                          <div className="text-xs text-gray-500">Max: ₹{coupon.maxDiscountAmount}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-700">
                          {coupon.usedCount} / {coupon.usageLimit}
                        </div>
                        <div className="w-24 h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                            style={{ width: `${Math.min((coupon.usedCount / coupon.usageLimit) * 100, 100)}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700">
                          {new Date(coupon.expiryDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(coupon.expiryDate) < new Date() ? "Expired" : "Active"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.class}`}>
                          {status.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/superadmin/coupons/update/${coupon._id}`)}
                            className="p-2 rounded-lg hover:bg-indigo-50 text-indigo-600 transition"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeleteTarget(coupon)}
                            className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchCoupons(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-50 hover:bg-gray-50 transition"
                >
                  Previous
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => fetchCoupons(page)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      page === pagination.page
                        ? "bg-indigo-500 text-white"
                        : "border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => fetchCoupons(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-50 hover:bg-gray-50 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🗑️</div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">Delete Coupon?</h3>
              <p className="text-sm text-gray-500">
                Are you sure you want to delete <strong className="font-mono">{deleteTarget.code}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-5 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-5 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition font-bold text-sm flex items-center gap-2"
              >
                {deleting ? (
                  <><span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> Deleting...</>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecialCouponsList;

