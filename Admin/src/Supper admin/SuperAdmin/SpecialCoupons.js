// import React, { useState, useEffect, useCallback } from 'react';
// import { toast } from 'react-toastify';
// import {
//   getSpecialCoupons,
//   createSpecialCoupon,
//   updateSpecialCoupon,
//   deleteSpecialCoupon,
// } from '../../services/superAdminApi';
// import { Spinner } from '../../components/UI';

// const EMPTY_FORM = {
//   code: '',
//   description: '',
//   discountType: 'percentage',
//   discountValue: '',
//   minOrderAmount: '',
//   maxDiscountAmount: '',
//   usageLimit: '',
//   expiryDate: '',
//   isActive: true,
// };

// export default function SpecialCoupons() {
//   const [coupons, setCoupons] = useState([]);
//   const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
//   const [loading, setLoading] = useState(false);
//   const [search, setSearch] = useState('');
//   const [filterActive, setFilterActive] = useState('');
//   const [page, setPage] = useState(1);

//   // Modal state
//   const [showModal, setShowModal] = useState(false);
//   const [editCoupon, setEditCoupon] = useState(null); // null = create
//   const [form, setForm] = useState(EMPTY_FORM);
//   const [saving, setSaving] = useState(false);
//   const [formErrors, setFormErrors] = useState({});

//   // Delete confirm
//   const [deleteId, setDeleteId] = useState(null);
//   const [deleting, setDeleting] = useState(false);

//   const fetchCoupons = useCallback(async () => {
//     setLoading(true);
//     try {
//       const params = { page, limit: 10 };
//       if (search) params.search = search;
//       if (filterActive !== '') params.isActive = filterActive;
//       const res = await getSpecialCoupons(params);
//       setCoupons(res.data.data.coupons);
//       setPagination(res.data.data.pagination);
//     } catch {
//       toast.error('Failed to load coupons.');
//     } finally { setLoading(false); }
//   }, [page, search, filterActive]);

//   useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

//   const openCreate = () => {
//     setEditCoupon(null);
//     setForm(EMPTY_FORM);
//     setFormErrors({});
//     setShowModal(true);
//   };

//   const openEdit = (coupon) => {
//     setEditCoupon(coupon);
//     setForm({
//       code: coupon.code,
//       description: coupon.description || '',
//       discountType: coupon.discountType,
//       discountValue: coupon.discountValue,
//       minOrderAmount: coupon.minOrderAmount || '',
//       maxDiscountAmount: coupon.maxDiscountAmount || '',
//       usageLimit: coupon.usageLimit || '',
//       expiryDate: coupon.expiryDate ? coupon.expiryDate.slice(0, 10) : '',
//       isActive: coupon.isActive,
//     });
//     setFormErrors({});
//     setShowModal(true);
//   };

//   const validateForm = () => {
//     const e = {};
//     if (!form.code.trim()) e.code = 'Code is required.';
//     if (!form.discountValue || isNaN(form.discountValue) || Number(form.discountValue) <= 0)
//       e.discountValue = 'Enter a valid discount value.';
//     if (form.discountType === 'percentage' && Number(form.discountValue) > 100)
//       e.discountValue = 'Percentage cannot exceed 100.';
//     if (!form.expiryDate) e.expiryDate = 'Expiry date is required.';
//     return e;
//   };

//   const handleSave = async (ev) => {
//     ev.preventDefault();
//     const e = validateForm();
//     if (Object.keys(e).length) { setFormErrors(e); return; }
//     setSaving(true);
//     try {
//       const payload = {
//         ...form,
//         discountValue: Number(form.discountValue),
//         minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : undefined,
//         maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : undefined,
//         usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
//         expiryDate: new Date(form.expiryDate).toISOString(),
//       };
//       if (editCoupon) {
//         await updateSpecialCoupon(editCoupon._id, payload);
//         toast.success('Coupon updated!');
//       } else {
//         await createSpecialCoupon(payload);
//         toast.success('Special coupon created!');
//       }
//       setShowModal(false);
//       fetchCoupons();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Save failed.');
//     } finally { setSaving(false); }
//   };

//   const handleDelete = async () => {
//     setDeleting(true);
//     try {
//       await deleteSpecialCoupon(deleteId);
//       toast.success('Coupon deleted.');
//       setDeleteId(null);
//       fetchCoupons();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Delete failed.');
//     } finally { setDeleting(false); }
//   };

//   const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

//   return (
//     <div>
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
//         <div>
//           <h2 className="text-xl font-black flex items-center gap-2" style={{ color: '#640101' }}>
//             <i className="fa fa-star" style={{ color: '#D2AE4E' }} />
//             Special Coupons
//           </h2>
//           <p className="text-xs text-gray-400 mt-0.5">Exclusive — Super Admin eyes only</p>
//         </div>
//         <button
//           onClick={openCreate}
//           className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold shadow hover:opacity-90 transition"
//           style={{ backgroundColor: '#640101' }}
//         >
//           <i className="fa fa-plus" /> Create Special Coupon
//         </button>
//       </div>

//       {/* Filters */}
//       <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-center">
//         <input
//           className="kanchira-input max-w-xs"
//           placeholder="Search by code..."
//           value={search}
//           onChange={e => { setSearch(e.target.value); setPage(1); }}
//         />
//         <select
//           className="kanchira-input max-w-[140px]"
//           value={filterActive}
//           onChange={e => { setFilterActive(e.target.value); setPage(1); }}
//         >
//           <option value="">All Status</option>
//           <option value="true">Active</option>
//           <option value="false">Inactive</option>
//         </select>
//         <span className="text-xs text-gray-400 ml-auto">Total: {pagination.total}</span>
//       </div>

//       {/* Table */}
//       <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
//         {loading ? (
//           <div className="flex justify-center py-16"><Spinner /></div>
//         ) : coupons.length === 0 ? (
//           <div className="text-center py-16 text-gray-400">
//             <i className="fa fa-ticket text-4xl mb-3 block" />
//             No special coupons found.
//           </div>
//         ) : (
//           <table className="kanchira-table">
//             <thead>
//               <tr>
//                 <th>#</th>
//                 <th>Code</th>
//                 <th>Type</th>
//                 <th>Discount</th>
//                 <th>Min Order</th>
//                 <th>Limit</th>
//                 <th>Used</th>
//                 <th>Expiry</th>
//                 <th>Status</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {coupons.map((c, i) => (
//                 <tr key={c._id}>
//                   <td className="text-gray-400 text-xs">{(page - 1) * 10 + i + 1}</td>
//                   <td>
//                     <span className="font-bold tracking-wider px-2 py-1 rounded text-xs" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
//                       {c.code}
//                     </span>
//                   </td>
//                   <td>
//                     <span className={`text-xs px-2 py-0.5 rounded font-medium ${c.discountType === 'percentage' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
//                       {c.discountType}
//                     </span>
//                   </td>
//                   <td className="font-semibold" style={{ color: '#640101' }}>
//                     {c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}
//                   </td>
//                   <td>{c.minOrderAmount ? `₹${c.minOrderAmount}` : '—'}</td>
//                   <td>{c.usageLimit ?? '∞'}</td>
//                   <td>{c.usedCount ?? 0}</td>
//                   <td className="text-xs text-gray-500">{c.expiryDate ? new Date(c.expiryDate).toLocaleDateString('en-IN') : '—'}</td>
//                   <td>
//                     <span className={`text-xs px-2 py-0.5 rounded font-semibold ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
//                       {c.isActive ? 'Active' : 'Inactive'}
//                     </span>
//                   </td>
//                   <td>
//                     <div className="flex gap-2">
//                       <button
//                         onClick={() => openEdit(c)}
//                         className="px-2 py-1 rounded text-xs text-white border-0 cursor-pointer"
//                         style={{ backgroundColor: '#375a7f' }}
//                       >
//                         <i className="fa fa-edit" />
//                       </button>
//                       <button
//                         onClick={() => setDeleteId(c._id)}
//                         className="px-2 py-1 rounded text-xs text-white border-0 cursor-pointer"
//                         style={{ backgroundColor: '#dc2626' }}
//                       >
//                         <i className="fa fa-trash" />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>

//       {/* Pagination */}
//       {pagination.totalPages > 1 && (
//         <div className="flex justify-center gap-2 mt-4">
//           {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
//             <button
//               key={p}
//               onClick={() => setPage(p)}
//               className="w-8 h-8 rounded text-sm border-0 cursor-pointer font-semibold"
//               style={{ backgroundColor: p === page ? '#640101' : '#f3f4f6', color: p === page ? 'white' : '#374151' }}
//             >
//               {p}
//             </button>
//           ))}
//         </div>
//       )}

//       {/* ── Create / Edit Modal ── */}
//       {showModal && (
//         <Modal title={editCoupon ? 'Edit Special Coupon' : 'Create Special Coupon'} onClose={() => setShowModal(false)}>
//           <form onSubmit={handleSave} className="space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               <FormField label="Coupon Code *" error={formErrors.code}>
//                 <input
//                   className="kanchira-input uppercase"
//                   placeholder="e.g. SUPER50"
//                   value={form.code}
//                   onChange={f('code')}
//                   disabled={!!editCoupon}
//                 />
//               </FormField>

//               <FormField label="Discount Type">
//                 <select className="kanchira-input" value={form.discountType} onChange={f('discountType')}>
//                   <option value="percentage">Percentage (%)</option>
//                   <option value="flat">Flat (₹)</option>
//                 </select>
//               </FormField>

//               <FormField label="Discount Value *" error={formErrors.discountValue}>
//                 <input
//                   type="number"
//                   className="kanchira-input"
//                   placeholder={form.discountType === 'percentage' ? '0–100' : '₹ amount'}
//                   value={form.discountValue}
//                   onChange={f('discountValue')}
//                   min={1}
//                 />
//               </FormField>

//               <FormField label="Min Order Amount (₹)">
//                 <input type="number" className="kanchira-input" placeholder="Optional" value={form.minOrderAmount} onChange={f('minOrderAmount')} min={0} />
//               </FormField>

//               {form.discountType === 'percentage' && (
//                 <FormField label="Max Discount Amount (₹)">
//                   <input type="number" className="kanchira-input" placeholder="Cap limit" value={form.maxDiscountAmount} onChange={f('maxDiscountAmount')} min={0} />
//                 </FormField>
//               )}

//               <FormField label="Usage Limit">
//                 <input type="number" className="kanchira-input" placeholder="Leave blank = unlimited" value={form.usageLimit} onChange={f('usageLimit')} min={1} />
//               </FormField>

//               <FormField label="Expiry Date *" error={formErrors.expiryDate}>
//                 <input type="date" className="kanchira-input" value={form.expiryDate} onChange={f('expiryDate')} />
//               </FormField>

//               <FormField label="Status">
//                 <label className="flex items-center gap-2 mt-2 cursor-pointer">
//                   <input type="checkbox" checked={form.isActive} onChange={f('isActive')} className="w-4 h-4" />
//                   <span className="text-sm text-gray-700">Active</span>
//                 </label>
//               </FormField>
//             </div>

//             <FormField label="Description">
//               <textarea
//                 className="kanchira-input resize-none"
//                 rows={2}
//                 placeholder="Short description..."
//                 value={form.description}
//                 onChange={f('description')}
//               />
//             </FormField>

//             <div className="flex gap-3 pt-2 justify-end">
//               <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border text-sm text-gray-600 bg-transparent cursor-pointer">
//                 Cancel
//               </button>
//               <button type="submit" className="px-5 py-2 rounded-lg text-white text-sm font-semibold flex items-center gap-2 cursor-pointer border-0" style={{ backgroundColor: '#640101' }} disabled={saving}>
//                 {saving ? <><Spinner /> Saving...</> : editCoupon ? 'Update Coupon' : 'Create Coupon'}
//               </button>
//             </div>
//           </form>
//         </Modal>
//       )}

//       {/* ── Delete Confirm Modal ── */}
//       {deleteId && (
//         <Modal title="Delete Coupon" onClose={() => setDeleteId(null)}>
//           <div className="text-center py-4">
//             <div className="text-5xl mb-4">🗑️</div>
//             <p className="text-gray-600 mb-6">Are you sure you want to permanently delete this coupon? This cannot be undone.</p>
//             <div className="flex justify-center gap-3">
//               <button onClick={() => setDeleteId(null)} className="px-5 py-2 rounded-lg border text-sm text-gray-600 bg-transparent cursor-pointer">
//                 Cancel
//               </button>
//               <button
//                 onClick={handleDelete}
//                 className="px-5 py-2 rounded-lg text-white text-sm font-semibold border-0 cursor-pointer flex items-center gap-2"
//                 style={{ backgroundColor: '#dc2626' }}
//                 disabled={deleting}
//               >
//                 {deleting ? <><Spinner /> Deleting...</> : 'Yes, Delete'}
//               </button>
//             </div>
//           </div>
//         </Modal>
//       )}
//     </div>
//   );
// }

// // ─── Helpers ─────────────────────────────────────────────────────
// const Modal = ({ title, onClose, children }) => (
//   <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
//     <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
//       <div className="flex items-center justify-between p-5 border-b">
//         <h3 className="font-bold text-lg" style={{ color: '#640101' }}>{title}</h3>
//         <button onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-transparent border-0 cursor-pointer text-xl">
//           <i className="fa fa-times" />
//         </button>
//       </div>
//       <div className="p-5">{children}</div>
//     </div>
//   </div>
// );

// const FormField = ({ label, children, error }) => (
//   <div>
//     <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
//     {children}
//     {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
//   </div>
// );


import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getSpecialCoupons,
  getSpecialCouponById,
  createSpecialCoupon,
  updateSpecialCoupon,
  deleteSpecialCoupon,
} from '../../services/superAdminApi';
import { toast } from 'react-toastify';

const O = { primary: '#640101', dark: '#3b0000', gold: '#D2AE4E', light: '#fdf8f0' };

// ─────────────────────────────────────────────────────────────────────────────
// PAGE 1: Special Coupons List
// ─────────────────────────────────────────────────────────────────────────────

export function SpecialCouponsList() {
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
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = O.light}
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

// ─────────────────────────────────────────────────────────────────────────────
// PAGE 2: Create Special Coupon
// ─────────────────────────────────────────────────────────────────────────────

export function SpecialCouponCreate() {
  const [form, setForm] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    minOrderAmount: "",
    maxDiscountAmount: "",
    usageLimit: "",
    expiryDate: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...form,
        code: form.code.toUpperCase(),
        discountValue: Number(form.discountValue),
        minOrderAmount: Number(form.minOrderAmount) || 0,
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : undefined,
        usageLimit: Number(form.usageLimit),
        expiryDate: new Date(form.expiryDate).toISOString(),
      };

      const res = await createSpecialCoupon(data);
      if (res.data.success) {
        toast.success("Special coupon created successfully!");
        navigate("/superadmin/coupons");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create coupon";
      const errors = err.response?.data?.errors;
      if (errors && Array.isArray(errors)) {
        errors.forEach((error) => toast.error(error));
      } else if (err.response?.status === 409) {
        toast.error(`Coupon code ${form.code.toUpperCase()} already exists`);
      } else if (err.response?.status === 403) {
        toast.error("Access denied: Super Admin only");
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white transition";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-2";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <span className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </span>
          Create Special Coupon
        </h2>
        <p className="text-gray-500 text-sm mt-1">Create exclusive coupons for VIP customers. Code will be auto-converted to UPPERCASE.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Code */}
          <div>
            <label className={labelClass}>Coupon Code *</label>
            <input
              type="text"
              name="code"
              value={form.code}
              onChange={handleChange}
              required
              placeholder="SUPER50"
              className={inputClass}
            />
            <p className="text-xs text-gray-400 mt-1">Auto-converted to uppercase</p>
          </div>

          {/* Discount Type */}
          <div>
            <label className={labelClass}>Discount Type *</label>
            <select
              name="discountType"
              value={form.discountType}
              onChange={handleChange}
              required
              className={inputClass}
            >
              <option value="percentage">Percentage (%)</option>
              <option value="flat">Flat Amount (₹)</option>
            </select>
          </div>

          {/* Discount Value */}
          <div>
            <label className={labelClass}>
              Discount Value * {form.discountType === "percentage" ? "(%)" : "(₹)"}
            </label>
            <input
              type="number"
              name="discountValue"
              value={form.discountValue}
              onChange={handleChange}
              required
              min={1}
              placeholder={form.discountType === "percentage" ? "50" : "100"}
              className={inputClass}
            />
          </div>

          {/* Min Order Amount */}
          <div>
            <label className={labelClass}>Minimum Order Amount (₹)</label>
            <input
              type="number"
              name="minOrderAmount"
              value={form.minOrderAmount}
              onChange={handleChange}
              min={0}
              placeholder="500"
              className={inputClass}
            />
          </div>

          {/* Max Discount Amount */}
          {form.discountType === "percentage" && (
            <div>
              <label className={labelClass}>Maximum Discount Amount (₹)</label>
              <input
                type="number"
                name="maxDiscountAmount"
                value={form.maxDiscountAmount}
                onChange={handleChange}
                min={0}
                placeholder="200"
                className={inputClass}
              />
              <p className="text-xs text-gray-400 mt-1">Cap for percentage discounts</p>
            </div>
          )}

          {/* Usage Limit */}
          <div>
            <label className={labelClass}>Usage Limit *</label>
            <input
              type="number"
              name="usageLimit"
              value={form.usageLimit}
              onChange={handleChange}
              required
              min={1}
              placeholder="100"
              className={inputClass}
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label className={labelClass}>Expiry Date *</label>
            <input
              type="datetime-local"
              name="expiryDate"
              value={form.expiryDate}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className={labelClass}>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            placeholder="Exclusive 50% off for VIP customers"
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Preview */}
        {form.code && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
            <h4 className="text-sm font-bold text-indigo-700 mb-2">Preview</h4>
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-lg font-mono font-bold text-lg">
                {form.code.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  {form.discountType === "percentage" ? `${form.discountValue}% OFF` : `₹${form.discountValue} OFF`}
                </p>
                {form.minOrderAmount > 0 && (
                  <p className="text-xs text-gray-500">Min order: ₹{form.minOrderAmount}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate("/superadmin/coupons")}
            className="px-6 py-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold hover:from-indigo-600 hover:to-purple-600 transition disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <><span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> Creating...</>
            ) : (
              <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Create Coupon</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE 3: Update Special Coupon
// ─────────────────────────────────────────────────────────────────────────────

export function SpecialCouponUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    getSpecialCouponById(id)
      .then(res => {
        const c = res.data.data.coupon;
        setForm({
          code: c.code || '',
          description: c.description || '',
          discountType: c.discountType || 'percentage',
          discountValue: c.discountValue ?? '',
          minOrderAmount: c.minOrderAmount ?? '',
          maxDiscountAmount: c.maxDiscountAmount ?? '',
          usageLimit: c.usageLimit ?? '',
          expiryDate: c.expiryDate ? c.expiryDate.slice(0, 16) : '',
          isActive: c.isActive !== false,
        });
      })
      .catch(() => { toast.error('Failed to load coupon.'); navigate('/superadmin/coupons'); })
      .finally(() => setFetching(false));
  }, [id]); // eslint-disable-line

  const handle = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      delete payload.code; // code cannot be changed
      ['discountValue', 'minOrderAmount', 'maxDiscountAmount', 'usageLimit'].forEach(k => {
        if (payload[k] !== '' && payload[k] !== undefined) payload[k] = Number(payload[k]);
        else delete payload[k];
      });
      await updateSpecialCoupon(id, payload);
      toast.success('Coupon updated!');
      navigate('/superadmin/coupons');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="flex justify-center py-20">
      <div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: '#fed7aa', borderTopColor: '#F97316' }} />
    </div>
  );

  if (!form) return null;

  const Field = ({ label, name, type = 'text', placeholder, required, readOnly }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      <input
        name={name} type={type} value={form[name]} onChange={handle}
        placeholder={placeholder} required={required} readOnly={readOnly}
        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 transition disabled:bg-gray-50"
        style={readOnly ? { backgroundColor: '#f9fafb', color: '#6b7280' } : {}}
      />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/superadmin/coupons')}
          className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center border-0 cursor-pointer hover:shadow transition">
          <i className="fa fa-arrow-left text-gray-600" />
        </button>
        <div>
          <h2 className="text-xl font-black text-gray-800">Update Coupon</h2>
          <p className="text-sm font-mono font-semibold" style={{ color: '#F97316' }}>{form.code}</p>
        </div>
      </div>

      <form onSubmit={submit} className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Coupon Code" name="code" readOnly />
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Discount Type</label>
            <select name="discountType" value={form.discountType} onChange={handle}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400">
              <option value="percentage">Percentage (%)</option>
              <option value="flat">Flat Amount (₹)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={handle} rows={2}
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 resize-none" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={`Discount Value (${form.discountType === 'percentage' ? '%' : '₹'})`} name="discountValue" type="number" />
          <Field label="Min Order Amount (₹)" name="minOrderAmount" type="number" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Max Discount (₹)" name="maxDiscountAmount" type="number" />
          <Field label="Usage Limit" name="usageLimit" type="number" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Expiry Date" name="expiryDate" type="datetime-local" />
          <div className="flex items-center gap-3 pt-6">
            <input type="checkbox" id="isActive" name="isActive" checked={form.isActive} onChange={handle}
              className="w-4 h-4 rounded accent-orange-500" />
            <label htmlFor="isActive" className="text-sm font-semibold text-gray-700 cursor-pointer">Active</label>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate('/superadmin/coupons')}
            className="flex-1 py-3 rounded-xl font-semibold text-sm border-0 cursor-pointer bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 py-3 rounded-xl font-semibold text-sm border-0 cursor-pointer text-white transition"
            style={{ backgroundColor: loading ? '#fdba74' : '#F97316' }}
          >
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT EXPORT (for backward compatibility)
// ─────────────────────────────────────────────────────────────────────────────

export default SpecialCouponsList;