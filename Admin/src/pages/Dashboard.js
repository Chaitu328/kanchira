// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
//   XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
// } from 'recharts';
// import { getAllUsers, getProducts, getOrders } from '../services/api';

// const weeklyData = [
//   { day: 'Mon', sales: 4200 }, { day: 'Tue', sales: 5800 },
//   { day: 'Wed', sales: 3900 }, { day: 'Thu', sales: 7200 },
//   { day: 'Fri', sales: 6100 }, { day: 'Sat', sales: 8900 },
//   { day: 'Sun', sales: 7500 },
// ];
// const monthlyData = [
//   { name: 'Jan', value: 12400 }, { name: 'Feb', value: 9800 },
//   { name: 'Mar', value: 15600 }, { name: 'Apr', value: 11200 },
//   { name: 'May', value: 18900 }, { name: 'Jun', value: 14300 },
// ];
// const PIE_COLORS = ['#640101', '#D2AE4E', '#376D5C', '#975607', '#DAA511'];

// // ── Safely extract an array from any orders API response shape ──────────────
// function extractOrders(data) {
//   if (!data) return [];
//   // { orders: [...] }
//   if (Array.isArray(data.orders)) return data.orders;
//   // { data: [...] }
//   if (Array.isArray(data.data)) return data.data;
//   // { result: [...] }
//   if (Array.isArray(data.result)) return data.result;
//   // raw array
//   if (Array.isArray(data)) return data;
//   // { orders: { data: [...] } }
//   if (Array.isArray(data.orders?.data)) return data.orders.data;
//   return [];
// }

// function buildStatusData(orders) {
//   const counts = {};
//   orders.forEach(o => { const s = o.status || 'Pending'; counts[s] = (counts[s] || 0) + 1; });
//   return Object.entries(counts).map(([name, value]) => ({ name, value }));
// }
// function calcRevenue(orders) {
//   return orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
// }

// export default function Dashboard() {
//   const navigate = useNavigate();
//   const [users, setUsers]       = useState([]);
//   const [products, setProducts] = useState([]);
//   const [orders, setOrders]     = useState([]);
//   const [loading, setLoading]   = useState(true);
//   const [errors, setErrors]     = useState({});
//   const [orderDebug, setOrderDebug] = useState(null); // temp debug

//   useEffect(() => {
//     const errs = {};
//     const fetchAll = async () => {
//       setLoading(true);

//       // Users
//       await getAllUsers()
//         .then(r => setUsers(Array.isArray(r.data?.users) ? r.data.users : []))
//         .catch(() => { errs.users = true; });

//       // Products
//       await getProducts()
//         .then(r => setProducts(Array.isArray(r.data?.products) ? r.data.products : []))
//         .catch(() => { errs.products = true; });

//       // Orders — use flexible extractor
//       await getOrders()
//         .then(r => {
//           const extracted = extractOrders(r.data);
//           setOrders(extracted);
//           // Keep raw keys for debugging (remove after confirmed working)
//           setOrderDebug(Object.keys(r.data || {}));
//         })
//         .catch(() => { errs.orders = true; });

//       setErrors(errs);
//       setLoading(false);
//     };
//     fetchAll();
//   }, []);

//   const revenue    = calcRevenue(orders);
//   const statusData = buildStatusData(orders);

//   const stats = [
//     { label: 'TOTAL SALES',    value: loading ? null : `₹${revenue.toLocaleString('en-IN')}`, change: '+36%', icon: 'fa-inr',          color: '#640101', path: '/dashboard/sales',   err: errors.orders },
//     { label: 'TOTAL USERS',    value: loading ? null : users.length,                          change: '+12%', icon: 'fa-users',        color: '#975607', path: '/dashboard/users',   err: errors.users },
//     { label: 'TOTAL PRODUCTS', value: loading ? null : products.length,                       change: '+8%',  icon: 'fa-cube',         color: '#376D5C', path: '/dashboard/products',err: errors.products },
//     { label: 'TOTAL ORDERS',   value: loading ? null : orders.length,                         change: '+34%', icon: 'fa-shopping-cart',color: '#D2AE4E', path: '/dashboard/orders',  err: errors.orders },
//   ];

//   const quickLinks = [
//     { label: 'Manage Categories',  icon: 'fa-th-large',     path: '/dashboard/category',  color: '#640101' },
//     { label: 'Manage Products',    icon: 'fa-cube',          path: '/dashboard/products',  color: '#975607' },
//     { label: 'View Orders',        icon: 'fa-shopping-cart', path: '/dashboard/orders',    color: '#376D5C' },
//     { label: 'Sales Report',       icon: 'fa-bar-chart',     path: '/dashboard/sales',     color: '#640101' },
//     { label: 'Manage Users',       icon: 'fa-users',         path: '/dashboard/users',     color: '#D2AE4E' },
//     { label: 'Banners',            icon: 'fa-picture-o',     path: '/dashboard/banners',   color: '#5a3e99' },
//     { label: 'Coupon Codes',       icon: 'fa-ticket',        path: '/dashboard/coupons',   color: '#1a7a5e' },
//     { label: 'Festival Discounts', icon: 'fa-gift',          path: '/dashboard/festival',  color: '#b85a00' },
//     { label: 'Addresses',          icon: 'fa-address-book',  path: '/dashboard/address',   color: '#2c5282' },
//   ];

//   const STATUS_COLORS = {
//     Pending:   'bg-yellow-100 text-yellow-700',
//     Confirmed: 'bg-blue-100 text-blue-700',
//     Shipped:   'bg-purple-100 text-purple-700',
//     Completed: 'bg-green-100 text-green-700',
//     Cancelled: 'bg-red-100 text-red-600',
//   };

//   return (
//     <div className="space-y-6">
//       <h1 className="text-3xl font-black text-center" style={{ background:'linear-gradient(to right,#640101,#D2AE4E,#640101)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
//         Dashboard
//       </h1>

//       {/* Error banner */}
//       {Object.keys(errors).length > 0 && (
//         <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-yellow-800 text-sm flex items-center gap-2">
//           <i className="fa fa-exclamation-triangle text-yellow-500" />
//           Some data failed to load. Check your backend connection.
//         </div>
//       )}

//       {/* DEBUG: show orders API response keys — remove once confirmed working */}
//       {!loading && orderDebug && orders.length === 0 && !errors.orders && (
//         <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-blue-800 text-xs">
//           <strong>Debug — orders API returned keys:</strong> {JSON.stringify(orderDebug)}
//           {' '}(orders array empty — check backend response shape)
//         </div>
//       )}

//       {/* Stat Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
//         {stats.map((s, i) => (
//           <button key={i} onClick={() => navigate(s.path)}
//             className="stat-card text-left cursor-pointer hover:opacity-90 active:scale-95 transition border-0 w-full"
//             style={{ backgroundColor: s.color }}>
//             <div className="flex items-start justify-between mb-3">
//               <div>
//                 <p className="text-xs font-semibold text-yellow-200 uppercase tracking-wide">{s.label}</p>
//                 <p className="text-2xl font-bold mt-1 text-white min-h-[2rem]">
//                   {s.err
//                     ? <span className="text-sm text-red-200">Error</span>
//                     : s.value === null
//                       ? <span className="inline-block w-16 h-7 bg-white/20 rounded animate-pulse" />
//                       : s.value}
//                 </p>
//               </div>
//               <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
//                 <i className={`fa ${s.icon} text-yellow-300`} />
//               </div>
//             </div>
//             <div className="flex items-center gap-1">
//               <i className="fa fa-arrow-up text-green-300 text-xs" />
//               <span className="text-green-300 text-xs font-medium">{s.change} from last month</span>
//             </div>
//           </button>
//         ))}
//       </div>

//       {/* Charts */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="kanchira-card">
//           <h5 className="font-semibold mb-4" style={{ color:'#640101' }}>
//             <i className="fa fa-line-chart mr-2"/>Weekly Sales Trend
//           </h5>
//           <ResponsiveContainer width="100%" height={250}>
//             <LineChart data={weeklyData}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#f0e8d0" />
//               <XAxis dataKey="day" tick={{ fontSize:12 }} />
//               <YAxis tick={{ fontSize:12 }} />
//               <Tooltip formatter={v => [`₹${v.toLocaleString()}`, 'Sales']} />
//               <Line type="monotone" dataKey="sales" stroke="#640101" strokeWidth={2.5}
//                 dot={{ fill:'#D2AE4E', r:4 }} activeDot={{ r:6 }} />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>

//         <div className="kanchira-card">
//           <h5 className="font-semibold mb-4" style={{ color:'#640101' }}>
//             <i className="fa fa-pie-chart mr-2"/>Order Status Breakdown
//           </h5>
//           {loading ? (
//             <div className="flex justify-center items-center h-[250px]">
//               <div className="spinner" style={{ width:36, height:36, borderTopColor:'#640101', borderColor:'rgba(100,1,1,0.2)', borderWidth:4 }} />
//             </div>
//           ) : statusData.length === 0 ? (
//             <div className="flex flex-col items-center justify-center h-[250px] text-gray-400">
//               <i className="fa fa-shopping-cart text-4xl mb-2" />
//               <p className="text-sm">No orders yet</p>
//             </div>
//           ) : (
//             <ResponsiveContainer width="100%" height={250}>
//               <PieChart>
//                 <Pie data={statusData} cx="50%" cy="50%" outerRadius={85} dataKey="value"
//                   label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
//                   {statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
//                 </Pie>
//                 <Tooltip /><Legend />
//               </PieChart>
//             </ResponsiveContainer>
//           )}
//         </div>
//       </div>

//       {/* Monthly Bar Chart */}
//       <div className="kanchira-card">
//         <h5 className="font-semibold mb-4" style={{ color:'#640101' }}>
//           <i className="fa fa-bar-chart mr-2"/>Monthly Revenue Overview
//         </h5>
//         <ResponsiveContainer width="100%" height={220}>
//           <BarChart data={monthlyData}>
//             <CartesianGrid strokeDasharray="3 3" stroke="#f0e8d0" />
//             <XAxis dataKey="name" tick={{ fontSize:12 }} />
//             <YAxis tick={{ fontSize:12 }} />
//             <Tooltip formatter={v => [`₹${v.toLocaleString()}`, 'Revenue']} />
//             <Bar dataKey="value" radius={[4,4,0,0]}>
//               {monthlyData.map((_, i) => <Cell key={i} fill={i % 2 === 0 ? '#640101' : '#D2AE4E'} />)}
//             </Bar>
//           </BarChart>
//         </ResponsiveContainer>
//       </div>

//       {/* Recent Orders */}
//       <div className="kanchira-card">
//         <div className="flex items-center justify-between mb-4">
//           <h5 className="font-semibold" style={{ color:'#640101' }}>
//             <i className="fa fa-list mr-2"/>Recent Orders
//           </h5>
//           <button className="text-xs font-medium px-3 py-1 rounded-lg text-white"
//             style={{ backgroundColor:'#640101' }}
//             onClick={() => navigate('/dashboard/orders')}>
//             View All
//           </button>
//         </div>
//         {loading ? (
//           <div className="space-y-2">
//             {[1,2,3].map(n => <div key={n} className="h-10 bg-gray-100 rounded animate-pulse" />)}
//           </div>
//         ) : orders.length === 0 ? (
//           <div className="text-center py-10 text-gray-400">
//             <i className="fa fa-shopping-cart text-4xl mb-2 block" />
//             <p>No orders yet</p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="kanchira-table">
//               <thead>
//                 <tr>
//                   {['#','Order ID','Customer','Amount','Status','Date'].map(h => (
//                     <th key={h} className="px-4 py-3 text-left text-sm font-semibold">{h}</th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {orders.slice(0, 5).map((o, i) => (
//                   <tr key={o._id || i}>
//                     <td className="px-4 py-3 text-sm text-gray-500">{i+1}</td>
//                     <td className="px-4 py-3 text-sm font-mono text-gray-700">{o._id?.slice(-8).toUpperCase() || '—'}</td>
//                     <td className="px-4 py-3 text-sm text-gray-700">{o.address?.fullName || o.userId || '—'}</td>
//                     <td className="px-4 py-3 text-sm text-gray-700 font-medium">
//                       {o.totalAmount ? `₹${Number(o.totalAmount).toLocaleString('en-IN')}` : '—'}
//                     </td>
//                     <td className="px-4 py-3">
//                       <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'}`}>
//                         {o.status || 'Pending'}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3 text-sm text-gray-500">
//                       {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : '—'}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* Quick Links */}
//       <div>
//         <h5 className="font-semibold mb-3" style={{ color:'#640101' }}>
//           <i className="fa fa-th mr-2"/>Quick Navigation
//         </h5>
//         <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//           {quickLinks.map((q, i) => (
//             <button key={i} onClick={() => navigate(q.path)}
//               className="kanchira-card flex items-center gap-3 hover:shadow-md transition cursor-pointer border-0 bg-white text-left w-full">
//               <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
//                 style={{ backgroundColor:q.color }}>
//                 <i className={`fa ${q.icon} text-white text-sm`} />
//               </div>
//               <span className="text-sm font-medium text-gray-700">{q.label}</span>
//             </button>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { getAllUsers, getProducts, getOrders, getStats } from '../services/api';

const weeklyData = [
  { day: 'Mon', sales: 4200 }, { day: 'Tue', sales: 5800 },
  { day: 'Wed', sales: 3900 }, { day: 'Thu', sales: 7200 },
  { day: 'Fri', sales: 6100 }, { day: 'Sat', sales: 8900 },
  { day: 'Sun', sales: 7500 },
];
const monthlyData = [
  { name: 'Jan', value: 12400 }, { name: 'Feb', value: 9800 },
  { name: 'Mar', value: 15600 }, { name: 'Apr', value: 11200 },
  { name: 'May', value: 18900 }, { name: 'Jun', value: 14300 },
];
const PIE_COLORS = ['#640101', '#D2AE4E', '#376D5C', '#975607', '#DAA511'];

// ── Safely extract orders array from any backend response shape ──
function extractOrders(data) {
  if (!data) return [];
  if (Array.isArray(data.orders)) return data.orders;
  if (Array.isArray(data.data))   return data.data;
  if (Array.isArray(data.result)) return data.result;
  if (Array.isArray(data))        return data;
  if (Array.isArray(data.orders?.data)) return data.orders.data;
  return [];
}

function buildStatusData(orders) {
  const counts = {};
  orders.forEach(o => {
    const s = o.status || 'Pending';
    counts[s] = (counts[s] || 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

function calcRevenue(orders) {
  return orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [users, setUsers]       = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders]     = useState([]);
  const [statsData, setStatsData] = useState({ totalOrders: 0, totalSales: 0 });
  const [loading, setLoading]   = useState(true);
  const [errors, setErrors]     = useState({});

  useEffect(() => {
    const errs = {};
    const fetchAll = async () => {
      setLoading(true);

      // Users
      await getAllUsers()
        .then(r => {
          const list = Array.isArray(r.data?.users)
            ? r.data.users
            : Array.isArray(r.data) ? r.data : [];
          setUsers(list);
        })
        .catch(() => { errs.users = true; });

      // Products
      await getProducts()
        .then(r => {
          const list = Array.isArray(r.data?.products)
            ? r.data.products
            : Array.isArray(r.data) ? r.data : [];
          setProducts(list);
        })
        .catch(() => { errs.products = true; });

      // Orders
      await getOrders()
        .then(r => {
          setOrders(extractOrders(r.data));
        })
        .catch(() => { errs.orders = true; });

      // Stats (total sales + total orders across ALL orders)
      await getStats()
        .then(r => {
          if (r.data?.responseCode === 200) {
            setStatsData({ totalOrders: r.data.totalOrders, totalSales: r.data.totalSales });
          }
        })
        .catch(() => { /* stats unavailable, fallback to orders array */ });

      setErrors(errs);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const revenue    = statsData.totalSales || calcRevenue(orders);
  const totalOrders = statsData.totalOrders || orders.length;
  const statusData = buildStatusData(orders);

  const stats = [
    {
      label: 'TOTAL SALES',
      value: loading ? null : `₹${revenue.toLocaleString('en-IN')}`,
      change: '+36%',
      icon: 'fa-inr',
      color: '#640101',
      path: '/dashboard/sales',
      err: errors.orders,
    },
    {
      label: 'TOTAL USERS',
      value: loading ? null : users.length,
      change: '+12%',
      icon: 'fa-users',
      color: '#975607',
      path: '/dashboard/users',
      err: errors.users,
    },
    {
      label: 'TOTAL PRODUCTS',
      value: loading ? null : products.length,
      change: '+8%',
      icon: 'fa-cube',
      color: '#376D5C',
      path: '/dashboard/products',
      err: errors.products,
    },
    {
      label: 'TOTAL ORDERS',
      value: loading ? null : totalOrders,
      change: '+24%',
      icon: 'fa-shopping-cart',
      color: '#D2AE4E',
      path: '/dashboard/orders',
      err: errors.orders,
    },
  ];

  const quickLinks = [
    { label: 'Manage Categories',  icon: 'fa-th-large',     path: '/dashboard/category',  color: '#640101' },
    { label: 'Manage Products',    icon: 'fa-cube',          path: '/dashboard/products',  color: '#975607' },
    { label: 'View Orders',        icon: 'fa-shopping-cart', path: '/dashboard/orders',    color: '#376D5C' },
    { label: 'Sales Report',       icon: 'fa-bar-chart',     path: '/dashboard/sales',     color: '#640101' },
    { label: 'Manage Users',       icon: 'fa-users',         path: '/dashboard/users',     color: '#D2AE4E' },
    { label: 'Banners',            icon: 'fa-picture-o',     path: '/dashboard/banners',   color: '#5a3e99' },
    { label: 'Coupon Codes',       icon: 'fa-ticket',        path: '/dashboard/coupons',   color: '#1a7a5e' },
    { label: 'Festival Discounts', icon: 'fa-gift',          path: '/dashboard/festival',  color: '#b85a00' },
    { label: 'Addresses',          icon: 'fa-address-book',  path: '/dashboard/address',   color: '#2c5282' },
  ];

  const STATUS_COLORS = {
    Pending:   'bg-yellow-100 text-yellow-700',
    Confirmed: 'bg-blue-100 text-blue-700',
    Shipped:   'bg-purple-100 text-purple-700',
    Completed: 'bg-green-100 text-green-700',
    Cancelled: 'bg-red-100 text-red-600',
  };

  return (
    <div className="space-y-6">
      <h1
        className="text-3xl font-black text-center"
        style={{
          background: 'linear-gradient(to right,#640101,#D2AE4E,#640101)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Dashboard
      </h1>

      {/* Error banner */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-yellow-800 text-sm flex items-center gap-2">
          <i className="fa fa-exclamation-triangle text-yellow-500" />
          Some data failed to load. Check your backend connection.
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, i) => (
          <button
            key={i}
            onClick={() => navigate(s.path)}
            className="stat-card text-left cursor-pointer hover:opacity-90 active:scale-95 transition border-0 w-full"
            style={{ backgroundColor: s.color }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
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
          </button>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Sales */}
        <div className="kanchira-card">
          <h5 className="font-semibold mb-4" style={{ color: '#640101' }}>
            <i className="fa fa-line-chart mr-2" />Weekly Sales Trend
          </h5>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e8d0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={v => [`₹${v.toLocaleString()}`, 'Sales']} />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#640101"
                strokeWidth={2.5}
                dot={{ fill: '#D2AE4E', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Pie — live data */}
        <div className="kanchira-card">
          <h5 className="font-semibold mb-4" style={{ color: '#640101' }}>
            <i className="fa fa-pie-chart mr-2" />Order Status Breakdown
          </h5>
          {loading ? (
            <div className="flex justify-center items-center h-[250px]">
              <div className="spinner" style={{ width: 36, height: 36, borderTopColor: '#640101', borderColor: 'rgba(100,1,1,0.2)', borderWidth: 4 }} />
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
                  cx="50%" cy="50%"
                  outerRadius={85}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Monthly Revenue Bar Chart ── */}
      <div className="kanchira-card">
        <h5 className="font-semibold mb-4" style={{ color: '#640101' }}>
          <i className="fa fa-bar-chart mr-2" />Monthly Revenue Overview
        </h5>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0e8d0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={v => [`₹${v.toLocaleString()}`, 'Revenue']} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {monthlyData.map((_, i) => (
                <Cell key={i} fill={i % 2 === 0 ? '#640101' : '#D2AE4E'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Recent Orders ── */}
      <div className="kanchira-card">
        <div className="flex items-center justify-between mb-4">
          <h5 className="font-semibold" style={{ color: '#640101' }}>
            <i className="fa fa-list mr-2" />Recent Orders
          </h5>
          <button
            className="text-xs font-medium px-3 py-1 rounded-lg text-white"
            style={{ backgroundColor: '#640101' }}
            onClick={() => navigate('/dashboard/orders')}
          >
            View All
          </button>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(n => (
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
            <table className="kanchira-table">
              <thead>
                <tr>
                  {['#', 'Order ID', 'Customer', 'Amount', 'Status', 'Date'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-sm font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((o, i) => (
                  <tr key={o._id || i}>
                    <td className="px-4 py-3 text-sm text-gray-500">{i + 1}</td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-700">
                      {o._id?.slice(-8).toUpperCase() || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {o.address?.fullName || o.userId || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                      {o.totalAmount ? `₹${Number(o.totalAmount).toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'}`}>
                        {o.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Quick Navigation ── */}
      <div>
        <h5 className="font-semibold mb-3" style={{ color: '#640101' }}>
          <i className="fa fa-th mr-2" />Quick Navigation
        </h5>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {quickLinks.map((q, i) => (
            <button
              key={i}
              onClick={() => navigate(q.path)}
              className="kanchira-card flex items-center gap-3 hover:shadow-md transition cursor-pointer border-0 bg-white text-left w-full"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: q.color }}
              >
                <i className={`fa ${q.icon} text-white text-sm`} />
              </div>
              <span className="text-sm font-medium text-gray-700">{q.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}