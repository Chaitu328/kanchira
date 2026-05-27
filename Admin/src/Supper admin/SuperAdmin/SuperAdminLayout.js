import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSuperAdminAuth } from "../../context/SuperAdminAuthContext";

const SA_NAV = [
  { label: "Dashboard", icon: "fa-tachometer", path: "/superadmin/dashboard" },
  // { label: 'All Users', icon: 'fa-users', path: '/superadmin/users' },
  { label: "Special Coupons", icon: "fa-star", path: "/superadmin/coupons" },
  {
    label: "Used Coupons",
    icon: "fa-history",
    path: "/superadmin/used-coupons",
  },
  // { label: 'Coupon Usage Table', icon: 'fa-table', path: '/superadmin/coupon-usage-table' },
  { label: "— Admin Access —", icon: null, path: null, divider: true },
  { label: "Category", icon: "fa-th-large", path: "/superadmin/category" },
  {
    label: "Sub-Category",
    icon: "fa-indent",
    path: "/superadmin/sub-category",
  },
  {
    label: "Sub-SubCategory",
    icon: "fa-sitemap",
    path: "/superadmin/sub-subcategory",
  },
  { label: "Products", icon: "fa-cube", path: "/superadmin/products" },
  { label: "Banners", icon: "fa-picture-o", path: "/superadmin/banners" },
  { label: "Reviews", icon: "fa-star-half-o", path: "/superadmin/reviews" },
  { label: "Orders", icon: "fa-shopping-cart", path: "/superadmin/orders" },
  // { label: 'All Users', icon: 'fa-users', path: '/superadmin/users' },

  { label: "Sales", icon: "fa-bar-chart", path: "/superadmin/sales" },
  { label: "Logo / Brand", icon: "fa-flag", path: "/superadmin/logo" },
  { label: "Pincode", icon: "fa-map-marker", path: "/superadmin/pincode" },
  {
    label: "Coupon Codes",
    icon: "fa-ticket",
    path: "/superadmin/coupon-codes",
  },
  { label: "Address", icon: "fa-address-book", path: "/superadmin/address" },
];

export default function SuperAdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { superAdmin, isSuperAdminAuthenticated, logoutSuperAdmin } =
    useSuperAdminAuth();

  // ── Protect route ──────
  useEffect(() => {
    if (!isSuperAdminAuthenticated) {
      navigate("/superadmin/login", { replace: true });
    }
  }, [isSuperAdminAuthenticated, navigate]);

  const handleLogout = async () => {
    try {
      await logoutSuperAdmin();
      toast.success("Logged out successfully.");
      navigate("/superadmin/login", { replace: true });
    } catch (error) {
      logoutSuperAdmin();
      toast.info("Logged out.");
      navigate("/superadmin/login", { replace: true });
    }
  };
  if (!isSuperAdminAuthenticated) return null;

  const sidebarW = collapsed ? 60 : 260;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className="fixed top-0 left-0 h-screen z-50 transition-all duration-300 flex flex-col overflow-y-auto"
        style={{
          width: sidebarW,
          background:
            "linear-gradient(180deg, #3b0000 0%, #640101 60%, #7a1a00 100%)",
        }}
      >
        {/* Brand */}
        <div
          className="flex flex-col items-center pt-4 pb-3 border-b px-3"
          style={{ borderColor: "rgba(210,174,78,0.4)" }}
        >
          <div className="flex items-center justify-center w-full">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 border-2"
              style={{
                borderColor: "#D2AE4E",
                background: "linear-gradient(135deg, #D2AE4E, #b8941d)",
              }}
            >
              <span className="text-white font-black text-xl">S</span>
            </div>
            {!collapsed && (
              <div className="ml-2 overflow-hidden">
                <p className="text-white font-black text-sm leading-tight whitespace-nowrap">
                  SUPER ADMIN
                </p>
              </div>
            )}
          </div>
          {!collapsed && superAdmin && (
            <p className="text-yellow-200 text-xs mt-2 px-3 text-center truncate w-full">
              {superAdmin.email}
            </p>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3">
          {SA_NAV.map((item, idx) => {
            if (item.divider) {
              return !collapsed ? (
                <div key={idx} className="px-4 py-2 mt-2">
                  <p
                    className="text-xs uppercase tracking-widest font-semibold"
                    style={{ color: "rgba(210,174,78,0.7)" }}
                  >
                    {item.label}
                  </p>
                </div>
              ) : (
                <div
                  key={idx}
                  className="border-t my-2 mx-3"
                  style={{ borderColor: "rgba(210,174,78,0.3)" }}
                />
              );
            }

            const active =
              location.pathname === item.path ||
              (item.path !== "/superadmin/dashboard" &&
                location.pathname.startsWith(item.path));

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                title={collapsed ? item.label : ""}
                className="w-full flex items-center px-4 py-2.5 text-left transition-all duration-200 cursor-pointer border-0 bg-transparent"
                style={{
                  backgroundColor: active ? "#D2AE4E" : "transparent",
                  color: active ? "#3b0000" : "white",
                }}
                onMouseEnter={(e) => {
                  if (!active)
                    e.currentTarget.style.backgroundColor =
                      "rgba(210,174,78,0.25)";
                }}
                onMouseLeave={(e) => {
                  if (!active)
                    e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <i
                  className={`fa ${item.icon} text-base flex-shrink-0`}
                  style={{ width: 26, textAlign: "center" }}
                />
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
        <div
          className="border-t p-3"
          style={{ borderColor: "rgba(210,174,78,0.3)" }}
        >
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 rounded-lg text-white hover:bg-white/10 transition cursor-pointer border-0 bg-transparent"
            title={collapsed ? "Logout" : ""}
          >
            <i
              className="fa fa-sign-out text-base flex-shrink-0"
              style={{ width: 26, textAlign: "center" }}
            />
            {!collapsed && (
              <span className="ml-3 text-sm font-medium whitespace-nowrap">
                Logout
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className="transition-all duration-300"
        style={{ marginLeft: sidebarW }}
      >
        {/* Top Bar */}
        <header
          className="sticky top-0 z-40 flex items-center justify-between px-6 py-3 shadow-sm"
          style={{ backgroundColor: "#3b0000" }}
        >
          <div className="flex items-center gap-3">
            <span
              className="px-2 py-1 rounded text-xs font-bold"
              style={{ backgroundColor: "#D2AE4E", color: "#3b0000" }}
            >
              ⚡ SUPER ADMIN
            </span>
            <h1 className="text-white font-semibold text-sm hidden sm:block">
              {SA_NAV.find((n) => location.pathname === n.path)?.label ||
                "Super Admin Panel"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-white text-sm">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#D2AE4E" }}
              >
                <i
                  className="fa fa-user-secret text-sm"
                  style={{ color: "#3b0000" }}
                />
              </div>
              <div>
                <p className="font-semibold text-sm">
                  {superAdmin?.name || "Super Admin"}
                </p>
                <p className="text-xs text-yellow-200">
                  {superAdmin?.role || "SUPERADMIN"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
