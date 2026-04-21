import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo1.png';

const NAV_ITEMS = [
  { label: 'Dashboard',        icon: 'fa-home',        path: '/dashboard' },
  { label: 'Category',         icon: 'fa-th-large',    path: '/dashboard/category' },
  { label: 'Sub-Category',     icon: 'fa-indent',      path: '/dashboard/sub-category' },
  { label: 'Sub-SubCategory',  icon: 'fa-sitemap',     path: '/dashboard/sub-subcategory' },
  { label: 'Products',         icon: 'fa-cube',        path: '/dashboard/products' },
  { label: 'Banners',          icon: 'fa-picture-o',   path: '/dashboard/banners' },
  { label: 'Reviews',          icon: 'fa-star-half-o', path: '/dashboard/reviews' },
  { label: 'Orders',           icon: 'fa-shopping-cart',path: '/dashboard/orders' },
  { label: 'All Users',        icon: 'fa-users',       path: '/dashboard/users' },
  { label: 'Logo / Brand',     icon: 'fa-flag',        path: '/dashboard/logo' },
  { label: 'Pincode',          icon: 'fa-map-marker',  path: '/dashboard/pincode' },
  { label: 'Festival Discount',icon: 'fa-gift',        path: '/dashboard/festival' },
  { label: 'Coupon Codes',     icon: 'fa-ticket',      path: '/dashboard/coupons' },
  { label: 'Address',          icon: 'fa-address-book',path: '/dashboard/address' },
];

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarW = collapsed ? 60 : 250;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Sidebar ── */}
      <aside
        className="fixed top-0 left-0 h-screen sidebar-scroll z-50 transition-all duration-300 flex flex-col"
        style={{ width: sidebarW, backgroundColor: '#640101' }}
        onMouseEnter={() => collapsed && setCollapsed(false)}
        onMouseLeave={() => !collapsed && setCollapsed(true)}
      >
        {/* Brand */}
        <div className="flex flex-col items-center pt-4 pb-3 border-b border-yellow-600/40">
          <div className="flex items-center justify-center w-full px-3">
            {/* <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
              <i className="fa fa-leaf text-yellow-400 text-xl" />
            </div> */}

            <div className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
  <img
    src={logo}
    alt="Logo"
    className="w-full h-full object-cover rounded-full"
  />
</div>
            {!collapsed && (
              <div className="ml-2 overflow-hidden">
                <p className="text-white font-bold text-sm leading-tight whitespace-nowrap">KANCHIRA</p>
                <p className="text-yellow-300 text-xs whitespace-nowrap">Admin Panel</p>
              </div>
            )}
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3">
          {NAV_ITEMS.map(item => {
            const active = location.pathname === item.path ||
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center px-4 py-3 text-left transition-all duration-200 cursor-pointer border-0"
                style={{
                  backgroundColor: active ? '#D2AE4E' : 'transparent',
                  color: 'white',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = 'rgba(210,174,78,0.3)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <i className={`fa ${item.icon} text-lg flex-shrink-0`} style={{ width: 28, textAlign: 'center' }} />
                {!collapsed && (
                  <span className="ml-3 text-sm font-medium whitespace-nowrap overflow-hidden transition-all">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-yellow-600/30 p-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 rounded-lg text-white hover:bg-white/10 transition cursor-pointer border-0 bg-transparent"
          >
            <i className="fa fa-sign-out text-lg flex-shrink-0" style={{ width: 28, textAlign: 'center' }} />
            {!collapsed && <span className="ml-3 text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Top Navbar ── */}
      <header
        className="fixed top-0 right-0 h-14 z-40 flex items-center justify-between px-4 shadow transition-all duration-300"
        style={{ left: sidebarW, backgroundColor: '#D2AE4E' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCollapsed(c => !c)}
            className="text-[#640101] hover:text-white transition text-xl border-0 bg-transparent cursor-pointer"
          >
            <i className={`fa ${collapsed ? 'fa-bars' : 'fa-bars'}`} />
          </button>
          <span className="text-[#640101] font-semibold text-sm">Welcome back, Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <i className="fa fa-user-circle text-[#640101] text-2xl" />
          <span className="text-[#640101] font-semibold text-sm">Admin</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-[#640101] hover:text-white transition text-sm border-0 bg-transparent cursor-pointer"
          >
            <i className="fa fa-sign-out" /> Logout
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main
        className="transition-all duration-300 pt-14"
        style={{ marginLeft: sidebarW }}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
