# Kanchira Admin Panel — React + Tailwind

Complete conversion of the Angular admin panel to React 18 + Tailwind CSS.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start
```

Opens at: http://localhost:3000

---

## Requirements

- Node.js 16+
- Backend running at `http://localhost:3007/`

## Environment Variables

Create a `.env` file in the root:

```
REACT_APP_API_URL=http://localhost:3007/
```

---

## Features

| Page | Features |
|------|----------|
| **Login** | JWT auth, register admin, password toggle |
| **Dashboard** | Stats cards (live users/products/orders), line chart, pie chart, quick links |
| **Category** | List, Create, Update, Delete with image upload |
| **Sub-Category** | List, Create, Update, Delete — linked to Category |
| **Sub-SubCategory** | List, Create, Update, Delete — cascading dropdowns |
| **Products** | List, Create, Update, Delete, View — with variants, sizes, SKU, tags |
| **Banners** | List, Create, Update with image |
| **Reviews** | List, Create, Edit inline, Delete |
| **All Users** | List, Delete |
| **Orders** | List, status update |
| **Logo/Brand** | List, Add, Update, Delete |
| **Pincode** | List, Add, Delete (delivery zones) |
| **Festival Discount** | List, Edit inline |
| **Coupon Codes** | List, Create |
| **Address** | Read-only list |

## Enhancements over Angular version

- ✅ **JWT auto-attach** on every request (interceptor)
- ✅ **Auto-logout** on 401 Unauthorized
- ✅ **Cascading dropdowns** in Sub-SubCategory and Product forms (Category → SubCat → SubSubCat)
- ✅ **Live stats** on dashboard (real API calls)
- ✅ **Order status management** with dropdown
- ✅ **Inline edit modals** (no separate page navigation) for Reviews, Festival Discounts
- ✅ **Product view modal** with all variants/sizes detail
- ✅ **Reusable DataTable** with search, pagination, page size selector
- ✅ **Toast notifications** (react-toastify) with brand colors
- ✅ **Collapsible sidebar** — collapses on hover-out, expands on hover-in
- ✅ **Active nav highlighting**
- ✅ **Image upload** to Cloudinary via `/upload` endpoint across all modules
- ✅ **Form validation** with inline error messages
- ✅ **Confirm delete modals** for all destructive actions
- ✅ **Fully responsive** — works on mobile/tablet

## Brand Colors

| Token | Hex |
|-------|-----|
| Primary Red | `#640101` |
| Dark Red | `#810202` |
| Gold | `#D2AE4E` |
| Brown | `#975607` |
| Green | `#376D5C` |

## Tech Stack

- **React 18** with React Router v6
- **Tailwind CSS** for styling
- **Recharts** for dashboard charts
- **Axios** for API calls
- **React-Toastify** for notifications
- **Lucide React** for icons
