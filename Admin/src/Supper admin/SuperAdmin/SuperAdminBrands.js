import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuperAdminAuth } from '../../context/SuperAdminAuthContext';
import {
  superAdminGetLogo,
  superAdminDeleteLogo,
  uploadImage,
} from '../../services/superAdminApi';
import { toast } from 'react-toastify';

const MAROON = '#640101';
const GOLD = '#D2AE4E';

export default function SuperAdminBrands() {
  const { superAdmin } = useSuperAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!superAdmin) navigate('/login', { replace: true });
  }, [superAdmin, navigate]);

  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [editingBrand, setEditingBrand] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadBrands = useCallback(async () => {
    const token = localStorage.getItem('superAdminToken');
    if (!token || !superAdmin) {
      navigate('/login', { replace: true });
      return;
    }

    setLoading(true);
    try {
      const response = await superAdminGetLogo();
      const logoData = Array.isArray(response.data?.data) ? response.data.data : response.data?.data ? [response.data.data] : [];
      setBrands(logoData);
    } catch (err) {
      console.error('Failed to load brands:', err);
      toast.error('Failed to load brands.');
    } finally {
      setLoading(false);
    }
  }, [superAdmin, navigate]);

  useEffect(() => {
    if (superAdmin) loadBrands();
  }, [loadBrands, superAdmin]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await superAdminDeleteLogo(deleteTarget._id);
      toast.success('Brand deleted successfully.');
      setDeleteTarget(null);
      setSelected(null);
      loadBrands();
    } catch (err) {
      toast.error('Failed to delete brand.');
    } finally {
      setDeleting(false);
    }
  };

  const filterBrands = () => {
    if (!search) return brands;
    const q = search.toLowerCase();
    return brands.filter(b =>
      (b.brandName || '').toLowerCase().includes(q) ||
      (b.email || '').toLowerCase().includes(q) ||
      (b.phoneNumber || '').toLowerCase().includes(q)
    );
  };

  const filtered = filterBrands();

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-black text-gray-800">All Brands</h2>
          <p className="text-sm text-gray-500">{brands.length} total brands</p>
        </div>
        <div className="relative">
          <i className="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search brands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none w-72"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Total Brands', value: brands.length, color: MAROON, icon: 'fa-certificate' },
          { label: 'Active', value: brands.filter(b => b.status !== false).length, color: '#16a34a', icon: 'fa-check-circle' },
          { label: 'Contact Info', value: brands.filter(b => b.phoneNumber).length, color: '#2563eb', icon: 'fa-phone' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-amber-100 flex items-center gap-3">
            <div style={{ color: s.color }} className="text-2xl">
              <i className={`fa ${s.icon}`} />
            </div>
            <div>
              <p className="text-lg font-black" style={{ color: s.color }}>
                {s.value}
              </p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Brands Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl animate-pulse bg-white shadow-sm" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-amber-100">
          <i className="fa fa-certificate text-4xl text-gray-300 mb-3 block" />
          <p className="text-gray-400">No brands found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-amber-100">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: MAROON + '15' }}>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-600 uppercase">Logo</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-600 uppercase">Brand Name</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-600 uppercase hidden md:table-cell">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-600 uppercase hidden lg:table-cell">Phone</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-600 uppercase hidden lg:table-cell">Address</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-gray-600 uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b, i) => (
                  <tr
                    key={b._id || i}
                    className="border-t border-gray-100 transition cursor-pointer hover:bg-amber-50"
                    onClick={() => setSelected(b)}
                  >
                    <td className="px-4 py-3">
                      {b.logo ? (
                        <img src={b.logo} alt={b.brandName} className="h-10 w-auto object-contain" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                          <i className="fa fa-certificate text-gray-400 text-xs" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-800">{b.brandName || '—'}</p>
                      <p className="text-xs text-gray-400">{b._id?.slice(-8)}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-600">{b.email || '—'}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-600">{b.phoneNumber || '—'}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-600">
                      <span className="line-clamp-1 max-w-xs text-xs">{b.address || '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingBrand(b);
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold border-0 cursor-pointer transition"
                          style={{ backgroundColor: '#dbeafe', color: '#2563eb' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#2563eb';
                            e.currentTarget.style.color = '#fff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#dbeafe';
                            e.currentTarget.style.color = '#2563eb';
                          }}
                        >
                          <i className="fa fa-pencil" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(b);
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold border-0 cursor-pointer transition"
                          style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#dc2626';
                            e.currentTarget.style.color = '#fff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#fee2e2';
                            e.currentTarget.style.color = '#dc2626';
                          }}
                        >
                          <i className="fa fa-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Brand Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-black text-lg text-gray-800">Brand Details</h3>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border-0 cursor-pointer hover:bg-gray-200 transition"
              >
                <i className="fa fa-times text-gray-600" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {selected.logo && (
                <div className="w-full rounded-xl overflow-hidden bg-gray-50 p-4 flex items-center justify-center" style={{ height: '120px' }}>
                  <img src={selected.logo} alt={selected.brandName} className="h-full w-auto object-contain" />
                </div>
              )}

              <div>
                <p className="text-xl font-black text-gray-800">{selected.brandName || '—'}</p>
                <p className="text-sm text-gray-500 mt-1">{selected.description || '—'}</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {[
                  { label: 'Email', value: selected.email, icon: 'fa-envelope' },
                  { label: 'Phone', value: selected.phoneNumber, icon: 'fa-phone' },
                  { label: 'Address', value: selected.address, icon: 'fa-map-marker' },
                ].map((item) =>
                  item.value ? (
                    <div key={item.label} className="rounded-xl p-3 bg-gray-50 flex items-start gap-3">
                      <i className={`fa ${item.icon} mt-1 text-gray-400`} style={{ color: MAROON }} />
                      <div>
                        <p className="text-xs font-bold text-gray-600">{item.label}</p>
                        <p className="text-sm text-gray-800 font-medium">{item.value}</p>
                      </div>
                    </div>
                  ) : null
                )}
              </div>

              <div className="text-xs text-gray-400 space-y-1">
                <p>
                  <span className="font-semibold">ID:</span> {selected._id}
                </p>
                {selected.createdAt && (
                  <p>
                    <span className="font-semibold">Created:</span> {new Date(selected.createdAt).toLocaleDateString('en-IN')}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setDeleteTarget(selected);
                    setSelected(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm border-0 cursor-pointer"
                  style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
                >
                  <i className="fa fa-trash mr-2" /> Delete Brand
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm border-0 cursor-pointer"
                  style={{ backgroundColor: '#f3f4f6', color: '#374151' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="text-center mb-4">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fa fa-trash text-2xl text-red-500" />
              </div>
              <h3 className="font-black text-lg text-gray-800">Delete Brand?</h3>
              <p className="text-sm text-gray-500 mt-1">
                This will permanently delete <strong>{deleteTarget.brandName}</strong> and cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm border-0 cursor-pointer"
                style={{ backgroundColor: '#f3f4f6', color: '#374151' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm border-0 cursor-pointer text-white"
                style={{ backgroundColor: '#dc2626' }}
              >
                {deleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}