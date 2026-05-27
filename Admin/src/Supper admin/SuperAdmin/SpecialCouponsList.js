import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSpecialCoupons, deleteSpecialCoupon } from '../../services/superAdminApi';
import { toast } from 'react-toastify';

const O = { primary: '#640101', dark: '#3b0000', gold: '#D2AE4E', light: '#fdf8f0' };

export default function SpecialCouponsList() {
  const [coupons,      setCoupons]      = useState([]);
  const [pagination,   setPagination]   = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);
  const navigate = useNavigate();

  const fetchCoupons = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search)       params.search   = search;
      if (filterActive) params.isActive = filterActive;
      const res = await getSpecialCoupons(params);
      setCoupons(res.data.data.coupons || []);
      setPagination(res.data.data.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to load coupons from API.');
      setCoupons([]);
      setPagination({ total: 0, page: 1, limit: 10, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoupons(1); }, [search, filterActive]); // eslint-disable-line

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteSpecialCoupon(deleteTarget._id);
      toast.success('Coupon deleted successfully');
      setDeleteTarget(null);
      fetchCoupons(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete coupon');
    } finally {
      setDeleting(false);
    }
  };

  const statusBadge = (c) => {
    const expired = new Date(c.expiryDate) < new Date();
    if (expired)    return { text: 'Expired',  bg: '#f3f4f6', color: '#6b7280' };
    if (c.isActive) return { text: 'Active',   bg: '#dcfce7', color: '#16a34a' };
    return              { text: 'Inactive', bg: '#fee2e2', color: '#dc2626' };
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-black text-gray-800">Special Coupons</h2>
          <p className="text-sm text-gray-500">
            {pagination.total} coupons · Super Admin only
          </p>
        </div>
        <button
          onClick={() => navigate('/superadmin/coupons/create')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white border-0 cursor-pointer"
          style={{ backgroundColor: O.primary }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = O.dark; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = O.primary; }}
        >
          <i className="fa fa-plus" /> Create Coupon
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <i className="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input type="text" placeholder="Search coupon code..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none"
            style={{ '--tw-ring-color': O.gold }}
          />
        </div>
        <select value={filterActive} onChange={e => setFilterActive(e.target.value)}
          className="py-2 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none">
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-xl animate-pulse bg-white shadow-sm" />)}
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <i className="fa fa-star text-4xl text-gray-300 mb-3 block" />
          <p className="text-gray-400">No coupons found.</p>
          <button onClick={() => navigate('/superadmin/coupons/create')}
            className="mt-4 px-5 py-2 rounded-xl text-sm font-semibold text-white border-0 cursor-pointer"
            style={{ backgroundColor: O.primary }}>
            Create First Coupon
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: `${O.primary}15` }}>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-600 uppercase">Code</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-600 uppercase hidden md:table-cell">Discount</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-600 uppercase hidden lg:table-cell">Min Order</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-600 uppercase hidden lg:table-cell">Usage</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-600 uppercase hidden md:table-cell">Expiry</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-gray-600 uppercase">Status</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c, i) => {
                const badge = statusBadge(c);
                return (
                  <tr key={c._id || i} className="border-t border-gray-100 transition"
                    style={{}} onMouseEnter={e => e.currentTarget.style.backgroundColor = O.light}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
                    <td className="px-4 py-3">
                      <p className="font-black font-mono text-sm" style={{ color: O.dark }}>{c.code}</p>
                      <p className="text-xs text-gray-400 truncate max-w-40">{c.description || '—'}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="font-semibold" style={{ color: O.primary }}>
                        {c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                      </span>
                      <p className="text-xs text-gray-400 capitalize">{c.discountType}</p>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-700">₹{c.minOrderAmount || 0}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-gray-700">{c.usedCount || 0}</span>
                      <span className="text-gray-400"> / {c.usageLimit || '∞'}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-500 text-xs">
                      {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: badge.bg, color: badge.color }}>
                        {badge.text}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => navigate(`/superadmin/coupons/update/${c._id}`)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold border-0 cursor-pointer transition"
                          style={{ backgroundColor: '#dbeafe', color: '#2563eb' }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#2563eb'; e.currentTarget.style.color = '#fff'; }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#dbeafe'; e.currentTarget.style.color = '#2563eb'; }}>
                          <i className="fa fa-pencil" />
                        </button>
                        <button onClick={() => setDeleteTarget(c)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold border-0 cursor-pointer transition"
                          style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#dc2626'; e.currentTarget.style.color = '#fff'; }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#fee2e2'; e.currentTarget.style.color = '#dc2626'; }}>
                          <i className="fa fa-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex gap-2">
                {[...Array(pagination.totalPages)].map((_, i) => (
                  <button key={i} onClick={() => fetchCoupons(i + 1)}
                    className="w-8 h-8 rounded-lg text-xs font-semibold border-0 cursor-pointer transition"
                    style={{ backgroundColor: pagination.page === i + 1 ? O.primary : '#f3f4f6', color: pagination.page === i + 1 ? '#fff' : '#374151' }}>
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fa fa-trash text-2xl text-red-500" />
            </div>
            <h3 className="font-black text-lg mb-1">Delete Coupon?</h3>
            <p className="text-sm text-gray-500 mb-4">Permanently delete <strong className="font-mono">{deleteTarget.code}</strong>? This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} disabled={deleting}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm border-0 cursor-pointer bg-gray-100 text-gray-700">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm border-0 cursor-pointer text-white"
                style={{ backgroundColor: '#dc2626' }}>
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
