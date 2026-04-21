# Kanchira Admin — Fixes Applied

## Bug Fixes in `Dashboard.js`

### 1. Wrong API response shapes (main bug)
The original code used `.then(r => r.data.length)` but the API returns nested objects:

| Endpoint | Response shape | Correct access |
|---|---|---|
| `GET /users` | `{ users: [...] }` | `r.data.users` |
| `GET /getproducts` | `{ products: [...] }` | `r.data.products` |
| `GET /getorders` | `{ orders: [...] }` | `r.data.orders` |

### 2. Static revenue → now calculates real revenue
Total Revenue is now computed from `orders.reduce(sum + totalAmount)`.

### 3. Order Status Pie Chart now uses real data
Replaces static monthly data with live order status breakdown from the API.

### 4. Loading skeletons
Stat cards show animated placeholders while data loads.

### 5. Error notification
If any API call fails, a warning banner appears instead of silently showing 0.

### 6. Recent Orders table
Shows last 5 orders with ID, customer, amount, status, and date — all from real API data.

### 7. Quick Links now use `useNavigate` (React Router)
Replaced `<a href>` tags (which trigger full page reloads) with `navigate()` calls.

## How to Run

### Backend
```bash
cd kanchira-backend
npm install
node index.js       # or: nodemon index.js
# Runs on http://localhost:3007
```

### Frontend
```bash
cd kanchira-react-admin
npm install
npm start
# Runs on http://localhost:3000
```

### Environment
Frontend `.env`:
```
REACT_APP_API_URL=http://localhost:3007/
```
