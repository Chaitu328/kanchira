import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useSuperAdminAuth } from '../../context/SuperAdminAuthContext';
import { superAdminLogout } from '../../services/superAdminApi';
import { toast } from 'react-toastify';
import logo from '../../assets/logo1.png';

const SA_NAV = [
  { label: 'Dashboard',        icon: 'fa-tachometer',   path: '/superadmin/dashboard' },
  { label: 'Special Coupons',  icon: 'fa-star',         path: '/superadmin/special-coupons' },
  { label: 'Category',         icon: 'fa-th-large',     path: '/superadmin/category' },
  { label: 'Sub-Category',     icon: 'fa-indent',       path: '/superadmin/sub-category' },
  { label: 'Sub-SubCategory',  icon: 'fa-sitemap',      path: '/superadmin/sub-subcategory' },
  { label: 'Products',         icon: 'fa-cube',         path: '/superadmin/products' },
  { label: 'Banners',          icon: 'fa-picture-o',    path: '/superadmin/banners' },
  { label: 'Reviews',          icon: 'fa-star-half-o',  path: '/superadmin/reviews' },
  { label: 'Orders',           icon: 'fa-shopping-cart',path: '/superadmin/orders' },
  { label: 'All Users',        icon: 'fa-users',        path: '/superadmin/users' },
  { label: 'Logo / Brand',     icon: 'fa-flag',         path: '/superadmin/logo' },
  { label: 'Pincode',          icon: 'fa-map-marker',   path: '/superadmin/pincode' },
  { label: 'Coupon Codes',     icon: 'fa-ticket',       path: '/superadmin/coupons' },
  { label: 'Address',          icon: 'fa-address-book', path: '/superadmin/address' },
];

export default function SuperAdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { superAdmin, logoutSuperAdmin } = useSuperAdminAuth();

  const handleLogout = async () => {
    try { await superAdminLogout(); } catch {}
    logoutSuperAdmin();
    toast.info('Logged out successfully.');
    navigate('/superadmin/login');
  };

  const sidebarW = collapsed ? 60 : 260;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Sidebar ── */}
      <aside
        className="fixed top-0 left-0 h-screen sidebar-scroll z-50 transition-all duration-300 flex flex-col"
        style={{ width: sidebarW, background: 'linear-gradient(180deg, #3b0000 0%, #640101 60%, #7a1a00 100%)' }}
        onMouseEnter={() => collapsed && setCollapsed(false)}
        onMouseLeave={() => !collapsed && setCollapsed(true)}
      >
        {/* Brand */}
        <div className="flex flex-col items-center pt-4 pb-3 border-b" style={{ borderColor: 'rgba(210,174,78,0.4)' }}>
          <div className="flex items-center justify-center w-full px-3">
            <div className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border-2" style={{ borderColor: '#D2AE4E' }}>
              <img src={logo} alt="Logo" className="w-full h-full object-cover rounded-full" />
            </div>
            {!collapsed && (
              <div className="ml-2 overflow-hidden">
                <p className="text-white font-black text-sm leading-tight whitespace-nowrap">KANCHIRA</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-xs px-1.5 py-0.5 rounded font-bold whitespace-nowrap" style={{ backgroundColor: '#D2AE4E', color: '#3b0000' }}>
                    ⚡ SUPER ADMIN
                  </span>
                </div>
              </div>
            )}
          </div>
          {!collapsed && superAdmin && (
            <p className="text-yellow-200 text-xs mt-2 px-3 text-center truncate w-full">{superAdmin.email}</p>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          {SA_NAV.map((item, idx) => {
            if (item.divider) {
              return !collapsed ? (
                <div key={idx} className="px-4 py-2 mt-2">
                  <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: 'rgba(210,174,78,0.7)' }}>
                    {item.label}
                  </p>
                </div>
              ) : <div key={idx} className="border-t my-2 mx-3" style={{ borderColor: 'rgba(210,174,78,0.3)' }} />;
            }

            const active = location.pathname === item.path ||
              (item.path !== '/superadmin/dashboard' && item.path !== '/dashboard' && location.pathname.startsWith(item.path));

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                title={collapsed ? item.label : ''}
                className="w-full flex items-center px-4 py-2.5 text-left transition-all duration-200 cursor-pointer border-0"
                style={{
                  backgroundColor: active ? '#D2AE4E' : 'transparent',
                  color: active ? '#3b0000' : 'white',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = 'rgba(210,174,78,0.25)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <i className={`fa ${item.icon} text-base flex-shrink-0`} style={{ width: 26, textAlign: 'center' }} />
                {!collapsed && (
                  <span className="ml-3 text-sm font-medium whitespace-nowrap overflow-hidden">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t p-3" style={{ borderColor: 'rgba(210,174,78,0.3)' }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 rounded-lg text-white hover:bg-white/10 transition cursor-pointer border-0 bg-transparent"
          >
            <i className="fa fa-sign-out text-base flex-shrink-0" style={{ width: 26, textAlign: 'center' }} />
            {!collapsed && <span className="ml-3 text-sm font-medium whitespace-nowrap">Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="transition-all duration-300" style={{ marginLeft: sidebarW }}>
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-3 shadow-sm" style={{ backgroundColor: '#3b0000' }}>
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 rounded text-xs font-bold" style={{ backgroundColor: '#D2AE4E', color: '#3b0000' }}>
              ⚡ SUPER ADMIN
            </span>
            <h1 className="text-white font-semibold text-sm hidden sm:block">Kanchira Super Admin Panel</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-white text-sm">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#D2AE4E' }}>
                <i className="fa fa-user-secret text-sm" style={{ color: '#3b0000' }} />
              </div>
              <span className="hidden sm:block">{superAdmin?.name || 'Super Admin'}</span>
            </div>
          </div>
        </header>

        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
