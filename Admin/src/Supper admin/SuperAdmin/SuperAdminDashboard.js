import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSuperAdminAuth } from "../../context/SuperAdminAuthContext";
import {
  getSpecialCoupons,
  superAdminGetAllUsers as getAllUsers,
  getSuperAdminProducts as getProducts,
  superAdminGetOrders as getOrders,
  superAdminGetStats as getStats,
} from "../../services/superAdminApi";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const WEEKLY_DATA = [
  { day: "Mon", sales: 4200 },
  { day: "Tue", sales: 5800 },
  { day: "Wed", sales: 3900 },
  { day: "Thu", sales: 7200 },
  { day: "Fri", sales: 6100 },
  { day: "Sat", sales: 8900 },
  { day: "Sun", sales: 7500 },
];
const MONTHLY_DATA = [
  { name: "Jan", value: 12400 },
  { name: "Feb", value: 9800 },
  { name: "Mar", value: 15600 },
  { name: "Apr", value: 11200 },
  { name: "May", value: 18900 },
  { name: "Jun", value: 14300 },
];
const PIE_COLORS = ["#640101", "#D2AE4E", "#376D5C", "#975607", "#DAA511"];
const STATUS_COLORS = {
  Pending: "bg-yellow-100 text-yellow-700",
  Confirmed: "bg-blue-100 text-blue-700",
  Shipped: "bg-purple-100 text-purple-700",
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-600",
};

function extractOrders(data) {
  if (!data) return [];
  if (Array.isArray(data.orders)) return data.orders;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.result)) return data.result;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.orders?.data)) return data.orders.data;
  return [];
}
function buildStatusData(orders) {
  const counts = {};
  orders.forEach((o) => {
    const s = o.status || "Pending";
    counts[s] = (counts[s] || 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}
function calcRevenue(orders) {
  return orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
}

const SUPER_STAT_CARDS = [
  {
    label: "Special Coupons",
    icon: "fa-star",
    color: "#D2AE4E",
    bg: "#fef9ec",
    getValue: (count) => count ?? "—",
    path: "/superadmin/coupons",
  },
  {
    label: "Super Admin Role",
    icon: "fa-shield",
    color: "#640101",
    bg: "#fff0f0",
    getValue: (_, role) => role?.toUpperCase() || "SUPERADMIN",
    path: null,
  },
  {
    label: "Full Access",
    icon: "fa-unlock-alt",
    color: "#376d5c",
    bg: "#f0faf5",
    getValue: () => "All Modules",
    path: null,
  },
];

const ADMIN_QUICK_LINKS = [
  {
    label: "Manage Categories",
    icon: "fa-th-large",
    path: "/superadmin/category",
    color: "#640101",
  },
  {
    label: "Manage Products",
    icon: "fa-cube",
    path: "/superadmin/products",
    color: "#975607",
  },
  {
    label: "View Orders",
    icon: "fa-shopping-cart",
    path: "/superadmin/orders",
    color: "#376D5C",
  },
  {
    label: "Sales Report",
    icon: "fa-bar-chart",
    path: "/superadmin/sales",
    color: "#640101",
  },
  {
    label: "Manage Users",
    icon: "fa-users",
    path: "/superadmin/users",
    color: "#D2AE4E",
  },
  {
    label: "Banners",
    icon: "fa-picture-o",
    path: "/superadmin/banners",
    color: "#5a3e99",
  },
  {
    label: "Coupon Codes",
    icon: "fa-ticket",
    path: "/superadmin/coupons",
    color: "#1a7a5e",
  },
  {
    label: "Addresses",
    icon: "fa-address-book",
    path: "/superadmin/address",
    color: "#2c5282",
  },
];

export default function SuperAdminDashboard() {
  // NO auth guard here — App.js SuperAdminProtectedRoute handles it
  const { superAdmin } = useSuperAdminAuth();
  const navigate = useNavigate();

  const [couponCount, setCouponCount] = useState(null);
  const [couponLoading, setCouponLoading] = useState(true);
  const [couponError, setCouponError] = useState(false);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [statsData, setStatsData] = useState({ totalOrders: 0, totalSales: 0 });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let mounted = true;
    setCouponLoading(true);
    setCouponError(false);
    getSpecialCoupons({ limit: 1 })
      .then((res) => {
        if (!mounted) return;
        setCouponCount(res.data?.data?.pagination?.total ?? 0);
      })
      .catch(() => {
        if (!mounted) return;
        setCouponError(true);
        setCouponCount("—");
      })
      .finally(() => {
        if (mounted) setCouponLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const errs = {};
    const fetchAll = async () => {
      setLoading(true);
      await getAllUsers()
        .then((r) => {
          const list = Array.isArray(r.data?.users)
            ? r.data.users
            : Array.isArray(r.data)
              ? r.data
              : [];
          if (mounted) setUsers(list);
        })
        .catch(() => {
          errs.users = true;
        });
      await getProducts()
        .then((r) => {
          const list = Array.isArray(r.data?.products)
            ? r.data.products
            : Array.isArray(r.data)
              ? r.data
              : [];
          if (mounted) setProducts(list);
        })
        .catch(() => {
          errs.products = true;
        });
      await getOrders()
        .then((r) => {
          if (mounted) setOrders(extractOrders(r.data));
        })
        .catch(() => {
          errs.orders = true;
        });
      await getStats()
        .then((r) => {
          if (r.data?.responseCode === 200 && mounted)
            setStatsData({
              totalOrders: r.data.totalOrders,
              totalSales: r.data.totalSales,
            });
        })
        .catch(() => {});
      if (mounted) {
        setErrors(errs);
        setLoading(false);
      }
    };
    fetchAll();
    return () => {
      mounted = false;
    };
  }, []);

  const handleNavigate = useCallback(
    (path) => {
      if (path) navigate(path);
    },
    [navigate],
  );

  const superCards = useMemo(
    () =>
      SUPER_STAT_CARDS.map((card) => ({
        ...card,
        value: card.getValue(couponCount, superAdmin?.role),
      })),
    [couponCount, superAdmin?.role],
  );

  const revenue = useMemo(
    () => statsData.totalSales || calcRevenue(orders),
    [statsData.totalSales, orders],
  );
  const totalOrders = useMemo(
    () => statsData.totalOrders || orders.length,
    [statsData.totalOrders, orders.length],
  );
  const statusData = useMemo(() => buildStatusData(orders), [orders]);
  const dashboardStats = useMemo(
    () => [
      {
        label: "TOTAL SALES",
        value: loading ? null : `₹${revenue.toLocaleString("en-IN")}`,
        change: "+36%",
        icon: "fa-inr",
        color: "#640101",
        path: "/superadmin/sales",
        err: errors.orders,
      },
      {
        label: "TOTAL USERS",
        value: loading ? null : users.length,
        change: "+12%",
        icon: "fa-users",
        color: "#975607",
        path: "/superadmin/users",
        err: errors.users,
      },
      {
        label: "TOTAL PRODUCTS",
        value: loading ? null : products.length,
        change: "+8%",
        icon: "fa-cube",
        color: "#376D5C",
        path: "/superadmin/products",
        err: errors.products,
      },
      {
        label: "TOTAL ORDERS",
        value: loading ? null : totalOrders,
        change: "+24%",
        icon: "fa-shopping-cart",
        color: "#D2AE4E",
        path: "/superadmin/orders",
        err: errors.orders,
      },
    ],
    [loading, revenue, users.length, products.length, totalOrders, errors],
  );

  return (
    <div className="space-y-8">
      <div className="border-t border-gray-200 pt-8">
        <h1
          className="text-3xl font-black text-center mb-6"
          style={{
            background: "linear-gradient(to right,#640101,#D2AE4E,#640101)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Analytics Dashboard
        </h1>
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-yellow-800 text-sm flex items-center gap-2">
          <i className="fa fa-exclamation-triangle text-yellow-500" />
          Some data failed to load. Check your backend connection.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {dashboardStats.map((s, i) => (
          <button
            key={i}
            onClick={() => handleNavigate(s.path)}
            className="stat-card text-left cursor-pointer hover:opacity-90 active:scale-95 transition-all duration-200 border-0 w-full rounded-xl overflow-hidden"
            style={{ backgroundColor: s.color }}
          >
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-yellow-200 uppercase tracking-wide">
                    {s.label}
                  </p>
                  <p className="text-2xl font-bold mt-1 text-white min-h-[2rem]">
                    {s.err ? (
                      <span className="text-sm text-red-200">Error</span>
                    ) : s.value === null ? (
                      <span className="inline-block w-16 h-7 bg-white/20 rounded animate-pulse" />
                    ) : (
                      s.value
                    )}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <i className={`fa ${s.icon} text-yellow-300`} />
                </div>
              </div>
              <div className="flex items-center gap-1">
                <i className="fa fa-arrow-up text-green-300 text-xs" />
                <span className="text-green-300 text-xs font-medium">
                  {s.change} from last month
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <h5
            className="font-semibold mb-4 flex items-center gap-2"
            style={{ color: "#640101" }}
          >
            <i className="fa fa-line-chart" /> Weekly Sales Trend
          </h5>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={WEEKLY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e8d0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(v) => [`₹${Number(v).toLocaleString()}`, "Sales"]}
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#640101"
                strokeWidth={2.5}
                dot={{ fill: "#D2AE4E", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <h5
            className="font-semibold mb-4 flex items-center gap-2"
            style={{ color: "#640101" }}
          >
            <i className="fa fa-pie-chart" /> Order Status Breakdown
          </h5>
          {loading ? (
            <div className="flex justify-center items-center h-[250px]">
              <div
                className="animate-spin rounded-full h-9 w-9 border-4 border-[#64010133]"
                style={{ borderTopColor: "#640101" }}
              />
            </div>
          ) : statusData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[250px] text-gray-400">
              <i className="fa fa-shopping-cart text-4xl mb-2" />
              <p className="text-sm">No orders yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {statusData.map((_, i) => (
                    <Cell
                      key={`cell-${i}`}
                      fill={PIE_COLORS[i % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        <h5
          className="font-semibold mb-4 flex items-center gap-2"
          style={{ color: "#640101" }}
        >
          <i className="fa fa-bar-chart" /> Monthly Revenue Overview
        </h5>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={MONTHLY_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0e8d0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(v) => [`₹${Number(v).toLocaleString()}`, "Revenue"]}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {MONTHLY_DATA.map((_, i) => (
                <Cell
                  key={`bar-${i}`}
                  fill={i % 2 === 0 ? "#640101" : "#D2AE4E"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h5
            className="font-semibold flex items-center gap-2"
            style={{ color: "#640101" }}
          >
            <i className="fa fa-list" /> Recent Orders
          </h5>
          <button
            className="text-xs font-medium px-3 py-1.5 rounded-lg text-white hover:opacity-90 transition"
            style={{ backgroundColor: "#640101" }}
            onClick={() => handleNavigate("/superadmin/orders")}
          >
            View All
          </button>
        </div>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-10 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <i className="fa fa-shopping-cart text-4xl mb-2 block" />
            <p>No orders yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {[
                    "#",
                    "Order ID",
                    "Customer",
                    "Amount",
                    "Status",
                    "Date",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-sm font-semibold text-gray-600"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.slice(0, 5).map((o, i) => (
                  <tr
                    key={o._id || `order-${i}`}
                    className="hover:bg-gray-50/50 transition"
                  >
                    <td className="px-4 py-3 text-sm text-gray-500">{i + 1}</td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-700">
                      {o._id?.slice(-8).toUpperCase() || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {o.address?.fullName || o.userId || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                      {o.totalAmount
                        ? `₹${Number(o.totalAmount).toLocaleString("en-IN")}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[o.status] || "bg-gray-100 text-gray-600"}`}
                      >
                        {o.status || "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {o.createdAt
                        ? new Date(o.createdAt).toLocaleDateString("en-IN")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h5
          className="font-semibold mb-3 flex items-center gap-2"
          style={{ color: "#640101" }}
        >
          <i className="fa fa-th" /> Quick Navigation
        </h5>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {ADMIN_QUICK_LINKS.map((q, i) => (
            <button
              key={i}
              onClick={() => handleNavigate(q.path)}
              className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer text-left w-full active:scale-95"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: q.color }}
              >
                <i className={`fa ${q.icon} text-white text-sm`} />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {q.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
