import axios from "axios";

const API_BASE =
  process.env.REACT_APP_API_URL || "https://kanchira-backend-1.onrender.com/";

// All regular-admin routes are mounted at /api on the backend:
//   app.use("/api", authRoutes)  ← index.js
// So every call here must include the "api/" prefix.
const api = axios.create({ baseURL: API_BASE });

// ── Attach JWT token to every request ────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auto logout on 401 ───────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("admin");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

// ── AUTH ─────────────────────────────────────────────────────────
// FIX: was 'admin/login' → 404. Backend mounts at /api so needs 'api/admin/login'
export const loginAdmin = (data) => api.post("api/admin/login", data);
export const registerAdmin = (data) => api.post("api/admin/register", data);

// ── IMAGE UPLOAD ─────────────────────────────────────────────────
export const uploadImage = (formData) => api.post("api/upload", formData);

// ── CATEGORIES ───────────────────────────────────────────────────
export const getCategories = () => api.get("api/category/all");
export const getCategoryById = (id) => api.get(`api/category/${id}`);
export const getCategoriesWithSubcategories = () =>
  api.get("api/categories/with-subcategories");
export const createCategory = (data) => api.post("api/category/create", data);
export const updateCategory = (data) =>
  api.put(`api/category/update/${data._id}`, data);
export const deleteCategory = (id) => api.delete(`api/category/delete/${id}`);

// ── SUB-CATEGORIES ───────────────────────────────────────────────
export const getSubCategories = () => api.get("api/subcategory/all");
export const getSubCategoryById = (id) => api.get(`api/subcategory/${id}`);
export const createSubCategory = (data) =>
  api.post("api/subcategory/create", data);
export const updateSubCategory = (data) =>
  api.put(`api/subcategory/update/${data._id}`, data);
export const deleteSubCategory = (id) =>
  api.delete(`api/subcategory/delete/${id}`);

// ── SUB-SUB-CATEGORIES ───────────────────────────────────────────
export const getSubSubCategories = () => api.get("api/sub-subcategory/all");
export const getSubSubCategoryById = (id) =>
  api.get(`api/sub-subcategory/${id}`);
export const getSubSubByCategory = (categoryId) =>
  api.get(`api/sub-subcategory/by-category/${categoryId}`);
export const createSubSubCategory = (data) =>
  api.post("api/sub-subcategory/create", data);
export const updateSubSubCategory = (data) =>
  api.put(`api/sub-subcategory/update/${data._id}`, data);
export const deleteSubSubCategory = (id) =>
  api.delete(`api/sub-subcategory/delete/${id}`);

// ── PRODUCTS ─────────────────────────────────────────────────────
export const getAllProducts = () => api.get("api/product/all");
export const getProductById = (id) => api.get(`api/product/${id}`);
export const getProductsByCategory = (categoryId) =>
  api.get(`api/products/category/${categoryId}`);
export const getProductsBySubSubCategory = (subSubcategoryId) =>
  api.get(`api/products/sub-subcategory/${subSubcategoryId}`);
export const getProductsFiltered = (params) =>
  api.get("api/products/filter", { params });
export const getProducts = () => api.get("api/products");
export const searchProducts = (q) => api.get(`api/product/search?q=${q}`);
export const createProduct = (data) => api.post("api/product/create", data);
export const updateProduct = (data) =>
  api.put(`api/product/update/${data._id}`, data);
export const deleteProduct = (id) => api.delete(`api/product/delete/${id}`);

// ── BANNERS ──────────────────────────────────────────────────────
export const getBanners = () => api.get("api/banner");
export const createBanner = (data) => api.post("api/banner/create", data);
export const updateBanner = (id, data) =>
  api.put(`api/banner/update/${id}`, data);

// ── OFFERS ───────────────────────────────────────────────────────
export const getOffers = () => api.get("api/offer");
export const createOffer = (data) => api.post("api/offer/create", data);
export const updateOffer = (id, data) =>
  api.put(`api/offer/update/${id}`, data);
export const deleteOffer = (id) => api.delete(`api/offer/delete/${id}`);

// ── USERS ────────────────────────────────────────────────────────
export const getAllUsers = () => api.get("api/user/all");
export const deleteUser = (id) => api.delete(`api/user/${id}`);

// ── ORDERS / STATS ───────────────────────────────────────────────
export const getStats = () => api.get("api/order/stats");
export const getOrders = () => api.get("api/kitchen/orders");
export const updateOrderStatus = (id, status) =>
  api.put(`api/kitchen/order/status/${id}`, { status });

// ── COUPONS ──────────────────────────────────────────────────────
export const getCoupons = () => api.get("api/coupon/all");
export const getUsedCoupons = () => api.get("api/coupon/used");
// FIX: removed the broken `superAdminGetUsedCoupons` that referenced
//      undefined `saApi` — it caused a ReferenceError crash on import.
export const getCouponByCode = (code) => api.get(`api/coupon/${code}`);
export const createCoupon = (data) => api.post("api/coupon/create", data);
export const applyCoupon = (data) => api.post("api/coupon/apply", data);
export const deleteCoupon = (id) => api.delete(`api/coupon/delete/${id}`);

// ── ADDRESS ──────────────────────────────────────────────────────
export const getAllAddress = () => api.get("api/address/all/data");
export const getAddress = (userId) => api.get(`api/address/${userId}`);
export const addAddress = (data) => api.post("api/address/add", data);
export const updateAddress = (id, data) =>
  api.put(`api/address/update/${id}`, data);

// ── REVIEWS ──────────────────────────────────────────────────────
export const getAllReviews = () => api.get("api/review/all/data");
export const getReview = (productId) => api.get(`api/review/${productId}`);
export const addReview = (data) => api.post("api/review/add", data);
export const updateReview = (id, data) =>
  api.put(`api/review/update/${id}`, data);
export const deleteReview = (id) => api.delete(`api/review/delete/${id}`);

// ── LOGO ─────────────────────────────────────────────────────────
export const getLogo = () => api.get("api/logo");
export const createLogo = (data) => api.post("api/logo/create", data);
export const updateLogo = (id, data) => api.put(`api/logo/update/${id}`, data);
export const deleteLogo = (id) => api.delete(`api/logo/delete/${id}`);

// ── SEO ──────────────────────────────────────────────────────────
export const getAllSeo = () => api.get("api/seo/all");
export const getSeoById = (id) => api.get(`api/seo/${id}`);
export const createSeo = (data) => api.post("api/seo/create", data);
export const updateSeo = (id, data) => api.put(`api/seo/update/${id}`, data);
export const deleteSeo = (id) => api.delete(`api/seo/delete/${id}`);

// ── PINCODE ──────────────────────────────────────────────────────
export const getPincodes = () => api.get("api/pincode/all");
export const createPincode = (data) => api.post("api/pincode/create", data);
export const updatePincode = (id, data) =>
  api.put(`api/pincode/update/${id}`, data);
// FIX: was api.delete("deletePincode", { data: { id } }) — wrong URL format
export const deletePincode = (id) => api.delete(`api/pincode/delete/${id}`);

// ── SWIPERS ──────────────────────────────────────────────────────
export const getSwipers = () => api.get("api/swiper/all");
export const createSwiper = (data) => api.post("api/swiper/create", data);
export const deleteSwiper = (id) => api.delete(`api/swiper/delete/${id}`);

// ── CART ─────────────────────────────────────────────────────────
export const getAllCartData = () => api.get("api/cart/all/data");
export const getCart = (userId) => api.get(`api/cart/${userId}`);
export const addToCart = (data) => api.post("api/cart/add", data);
export const updateCartQty = (data) => api.put("api/cart/update", data);
export const removeFromCart = (data) => api.delete("api/cart/remove", { data });
export const clearCart = (userId) => api.delete(`api/cart/clear/${userId}`);

// ── ENQUIRY ──────────────────────────────────────────────────────
export const createEnquiry = (data) => api.post("api/enquiry/create", data);

// ── ALIASES — backward compatibility ─────────────────────────────
export const getReviews = getAllReviews;
export const getAddresses = getAllAddress;

export default api;
