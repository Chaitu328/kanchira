import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuperAdminAuth } from '../../context/SuperAdminAuthContext';
import {
  superAdminGetAllUsers,
  superAdminDeleteUser,
  getSpecialCoupons,
  superAdminGetOrders,
  superAdminGetAllReviews,
  superAdminGetCoupons,
} from '../../services/superAdminApi';
import { toast } from 'react-toastify';

const MAROON = '#640101';
const GOLD = '#D2AE4E';

const TABS = {
  ALL_USERS: 'all_users',
  SUPER_COUPONS: 'super_coupons',
  USED_COUPONS: 'used_coupons',
  ALL_COUPONS: 'all_coupons',
};

export default function SuperAdminUsers() {
  const { superAdmin } = useSuperAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!superAdmin) navigate('/login', { replace: true });
  }, [superAdmin, navigate]);

  const [users, setUsers] = useState([]);
  const [superCoupons, setSuperCoupons] = useState([]);
  const [allCoupons, setAllCoupons] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState(TABS.ALL_USERS);

  const loadAll = useCallback(async () => {
    const token = localStorage.getItem('superAdminToken');
    if (!token || !superAdmin) { navigate('/login', { replace: true }); return; }
    setLoading(true);
    try {
      const [usersRes, couponRes, ordersRes, allCouponsRes] = await Promise.allSettled([
        superAdminGetAllUsers(),
        getSpecialCoupons({ limit: 200 }),
        superAdminGetOrders(),
        superAdminGetCoupons(),
      ]);
      setUsers(usersRes.status === 'fulfilled' ? (usersRes.value.data?.users || []) : []);
      setSuperCoupons(couponRes.status === 'fulfilled' ? (couponRes.value.data?.data?.coupons || []) : []);
      setOrders(ordersRes.status === 'fulfilled' ? (ordersRes.value.data?.orders || []) : []);
      setAllCoupons(allCouponsRes.status === 'fulfilled' ? (allCouponsRes.value.data || []) : []);
    } catch (err) {
      toast.error('Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, [superAdmin, navigate]);

  useEffect(() => { if (superAdmin) loadAll(); }, [loadAll, superAdmin]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await superAdminDeleteUser(deleteTarget._id);
      toast.success('User deleted successfully.');
      setDeleteTarget(null);
      setSelected(null);
      loadAll();
    } catch { toast.error('Failed to delete user.'); }
    finally { setDeleting(false); }
  };

  const superCouponCodes = new Set(superCoupons.map(c => c.code));
  const getUserOrders = (uid) => orders.filter(o => {
    const oId = o.userId?._id || o.userId || o.user;
    return oId === (uid?._id || uid);
  });
  const getUserRevenue = (uid) => getUserOrders(uid).reduce((s, o) => s + (o.totalAmount || 0), 0);
  const getCouponDetails = (code) => superCoupons.find(c => c.code === code);
  const getUserSuperCoupon = (u) => {
    const direct = u.lastCouponUsed || u.couponCode;
    if (direct && superCouponCodes.has(direct)) return direct;
    const o = getUserOrders(u._id).find(ord => ord.couponCode && superCouponCodes.has(ord.couponCode));
    return o?.couponCode || null;
  };

  const superCouponUsers = users.filter(u => getUserSuperCoupon(u) !== null);
  const usedCouponUsers = users.filter(u => getUserOrders(u._id).length > 0);
  const totalRevenue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);

  const filterRow = (u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.phone || '').toLowerCase().includes(q);
  };

  const filtered = users.filter(filterRow);
  const filteredSuperCouponUsers = superCouponUsers.filter(filterRow);
  const filteredUsedCoupons = allCoupons.filter(c => {
    const q = search.toLowerCase();
    return (c.code || '').toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q);
  });

  const initials = (u) => ((u.name || u.phone || u.email || '?')[0] || '?').toUpperCase();
  const avatarColor = (u) => {
    const p = [MAROON, '#2563eb', '#16a34a', '#7c3aed', '#0891b2', '#d97706'];
    return p[(u._id || '').charCodeAt(0) % p.length];
  };
  const statusBadge = (c) => {
    const expired = c.expiryDate && new Date(c.expiryDate) < new Date();
    if (expired) return { text: 'Expired', bg: '#f3f4f6', color: '#6b7280' };
    if (c.isActive) return { text: 'Active', bg: '#dcfce7', color: '#16a34a' };
    return { text: 'Inactive', bg: '#fee2e2', color: '#dc2626' };
  };

  const Skeleton = ({ rows = 5 }) => (
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => <div key={i} className="h-14 rounded-xl animate-pulse bg-white shadow-sm" />)}
    </div>
  );

  const renderAllUsers = () => (
    loading ? <Skeleton /> : filtered.length === 0 ? (
      <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
        <i className="fa fa-users text-4xl text-gray-300 mb-3 block" />
        <p className="text-gray-400">No users found.</p>
      </div>
    ) : (
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-amber-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: MAROON + '15' }}>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-600 uppercase">User</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-600 uppercase">Email</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-600 uppercase hidden md:table-cell">Phone</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-600 uppercase hidden lg:table-cell">Orders</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-600 uppercase hidden lg:table-cell">Revenue</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-gray-600 uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => {
                const uOrders = getUserOrders(u._id);
                return (
                  <tr key={u._id || i} className="border-t border-gray-100 cursor-pointer hover:bg-amber-50" onClick={() => setSelected(u)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ backgroundColor: avatarColor(u) }}>
                          {initials(u)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{u.name || '—'}</p>
                          <p className="text-xs text-gray-400">{u._id?.slice(-8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{u.email || '—'}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-500">{u.phone || '—'}</td>
                    <td className="px-4 py-3 text-right hidden lg:table-cell font-semibold text-gray-800">{uOrders.length}</td>
                    <td className="px-4 py-3 text-right hidden lg:table-cell font-semibold" style={{ color: '#16a34a' }}>
                      ₹{getUserRevenue(u._id).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(u); }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold border-0 cursor-pointer"
                        style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                        <i className="fa fa-trash" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  );

  const renderSpecialCoupons = () => (
    loading ? <Skeleton rows={3} /> : superCoupons.length === 0 ? (
      <div className="bg-white rounded-2xl shadow-sm p-8 text-center border border-amber-100">
        <p className="text-gray-400 text-sm">No special coupons yet.</p>
      </div>
    ) : (
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-amber-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: MAROON + '15' }}>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-600 uppercase">#</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-600 uppercase">Code</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-600 uppercase">Discount</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-600 uppercase hidden md:table-cell">Min Order</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-600 uppercase hidden lg:table-cell">Usage</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-600 uppercase">Total Amount Used</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-gray-600 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {superCoupons.map((c, i) => {
                const badge = statusBadge(c);
                return (
                  <tr key={c._id || i} className="border-t border-gray-100 hover:bg-amber-50">
                    <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                    <td className="px-4 py-3">
                      <span className="font-black font-mono tracking-wider px-2 py-1 rounded text-xs" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>{c.code}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold" style={{ color: MAROON }}>
                      {c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-600">{c.minOrderAmount ? `₹${c.minOrderAmount}` : '—'}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-600">{c.usedCount || 0} / {c.usageLimit ?? '∞'}</td>
                    <td className="px-4 py-3 text-gray-700 font-medium">₹{Math.round(c.totalAmountUsed || 0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: badge.bg, color: badge.color }}>{badge.text}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  );

  const renderAllCoupons = () => (
    loading ? <Skeleton /> : filteredUsedCoupons.length === 0 ? (
      <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
        <p className="text-gray-400">No coupons found.</p>
      </div>
    ) : (
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-amber-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: MAROON + '15' }}>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-600 uppercase">#</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-600 uppercase">Code</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-600 uppercase">Type</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-600 uppercase">Value</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-600 uppercase">Total Amount Used</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-gray-600 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsedCoupons.map((c, i) => {
                const expired = c.expiryDate && new Date(c.expiryDate) < new Date();
                return (
                  <tr key={c._id || i} className="border-t border-gray-100 hover:bg-amber-50">
                    <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                    <td className="px-4 py-3">
                      <span className="font-black font-mono px-2 py-1 rounded text-xs" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>{c.code}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${c.type === 'percentage' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{c.type}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold" style={{ color: MAROON }}>
                      {c.type === 'percentage' ? `${c.value}%` : `₹${c.value}`}
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-medium">₹{Math.round(c.totalAmountUsed || 0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{
                        backgroundColor: expired ? '#f3f4f6' : c.active ? '#dcfce7' : '#fee2e2',
                        color: expired ? '#6b7280' : c.active ? '#16a34a' : '#dc2626',
                      }}>
                        {expired ? 'Expired' : c.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-black text-gray-800">Management Panel</h2>
          <p className="text-sm text-gray-500">{users.length} users · {superCoupons.length} special coupons · {allCoupons.length} total coupons</p>
        </div>
        <div className="relative">
          <i className="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none w-64" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Users', value: users.length, color: MAROON },
          { label: 'Special Coupons', value: superCoupons.length, color: '#7c3aed' },
          { label: 'Total Orders', value: orders.length, color: '#f59e0b' },
          { label: 'Total Revenue', value: '₹' + totalRevenue.toLocaleString('en-IN'), color: '#16a34a' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-amber-100">
            <p className="text-lg font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 mb-5 bg-white rounded-xl p-1 shadow-sm overflow-x-auto border border-amber-100">
        {[
          { key: TABS.ALL_USERS, label: 'All Users', icon: 'fa-users', count: users.length },
          { key: TABS.SUPER_COUPONS, label: 'Super Coupons', icon: 'fa-star', count: superCoupons.length },
          { key: TABS.ALL_COUPONS, label: 'All Coupons', icon: 'fa-ticket', count: allCoupons.length },
          { key: TABS.USED_COUPONS, label: 'Used Coupons', icon: 'fa-check', count: usedCouponUsers.length },
        ].map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition border-0 cursor-pointer whitespace-nowrap"
            style={{ backgroundColor: activeTab === t.key ? MAROON : 'transparent', color: activeTab === t.key ? '#fff' : '#6b7280' }}>
            <i className={`fa ${t.icon} text-xs`} />
            {t.label}
            <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{
              backgroundColor: activeTab === t.key ? 'rgba(255,255,255,0.25)' : '#f3f4f6',
              color: activeTab === t.key ? '#fff' : '#374151',
            }}>{t.count}</span>
          </button>
        ))}
      </div>

      {activeTab === TABS.ALL_USERS && renderAllUsers()}
      {activeTab === TABS.SUPER_COUPONS && renderSpecialCoupons()}
      {activeTab === TABS.ALL_COUPONS && renderAllCoupons()}
      {activeTab === TABS.USED_COUPONS && (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center border border-amber-100">
          <i className="fa fa-history text-4xl text-gray-300 mb-3 block" />
          <p className="text-gray-400">Used Coupons — Coming soon</p>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-black text-lg text-gray-800">User Details</h3>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border-0 cursor-pointer">
                <i className="fa fa-times text-gray-600" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl" style={{ backgroundColor: avatarColor(selected) }}>
                  {initials(selected)}
                </div>
                <div>
                  <p className="text-xl font-black text-gray-800">{selected.name || '—'}</p>
                  <p className="text-sm text-gray-500">{selected.email || '—'}</p>
                  <p className="text-sm text-gray-500">{selected.phone || '—'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Orders', value: getUserOrders(selected._id).length, color: MAROON },
                  { label: 'Revenue', value: '₹' + getUserRevenue(selected._id).toLocaleString('en-IN'), color: '#16a34a' },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl p-3 text-center" style={{ backgroundColor: s.color + '15' }}>
                    <p className="font-black text-lg" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-xs text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="text-xs text-gray-400 space-y-1">
                <p><span className="font-semibold">ID:</span> {selected._id}</p>
                {selected.createdAt && <p><span className="font-semibold">Joined:</span> {new Date(selected.createdAt).toLocaleDateString('en-IN')}</p>}
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setDeleteTarget(selected); setSelected(null); }}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm border-0 cursor-pointer"
                  style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                  <i className="fa fa-trash mr-2" /> Delete User
                </button>
                <button onClick={() => setSelected(null)}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm border-0 cursor-pointer"
                  style={{ backgroundColor: '#f3f4f6', color: '#374151' }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="text-center mb-4">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fa fa-trash text-2xl text-red-500" />
              </div>
              <h3 className="font-black text-lg text-gray-800">Delete User?</h3>
              <p className="text-sm text-gray-500 mt-1">This will permanently delete <strong>{deleteTarget.name || deleteTarget.email}</strong>.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} disabled={deleting}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm border-0 cursor-pointer"
                style={{ backgroundColor: '#f3f4f6', color: '#374151' }}>Cancel</button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm border-0 cursor-pointer text-white"
                style={{ backgroundColor: '#dc2626' }}>
                {deleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}