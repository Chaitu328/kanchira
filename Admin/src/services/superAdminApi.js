import axios from "axios";

// ─────────────────────────────────────────────────────────────────
//  TWO AXIOS INSTANCES
//  api   → regular admin  (token key: 'token')           base: /api/
//  saApi → super admin    (token key: 'superAdminToken') base: /
//
//  Routes in Routes/route.js are mounted at /api on the backend.
//  Super-admin-only routes (auth, special coupons) live at /superadmin.
//  Shared endpoints (users, products, orders, stats, etc.) use /api/ prefix.
// ─────────────────────────────────────────────────────────────────
const BASE =
  process.env.REACT_APP_API_URL || "https://kanchira-backend-1.onrender.com/";

// Regular admin — hits /api/* routes
const api = axios.create({ baseURL: BASE });

// Super admin — hits /api/* for shared routes; /superadmin/* for SA-only routes
const saApi = axios.create({ baseURL: BASE });

// ── Regular admin: attach token + auto-logout on 401 ─────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
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

// ── Super admin: attach superAdminToken + auto-logout on 401 ─────
saApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("superAdminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (process.env.NODE_ENV !== "production") {
    console.debug(
      "[SuperAdminAPI]",
      config.method?.toUpperCase(),
      BASE + config.url,
    );
  }
  return config;
});
saApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (process.env.NODE_ENV !== "production") {
      console.error(
        "[SuperAdminAPI] Error:",
        err.config?.url,
        err.response?.status,
        err.response?.data,
      );
    }
    if (err.response?.status === 401) {
      localStorage.removeItem("superAdminToken");
      localStorage.removeItem("superAdminRefreshToken");
      localStorage.removeItem("superAdmin");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

// ═════════════════════════════════════════════════════════════════
//  REGULAR ADMIN  (api)
// ═════════════════════════════════════════════════════════════════

// ── Auth ──────────────────────────────────────────────────────────
export const loginAdmin = (data) => api.post("api/admin/login", data);
export const registerAdmin = (data) => api.post("api/admin/register", data);

// ── Image Upload ──────────────────────────────────────────────────
export const uploadImage = (formData) => api.post("api/upload", formData);

// ── Categories ────────────────────────────────────────────────────
export const getCategories = () => api.get("api/category/all");
export const getCategoryById = (id) => api.get(`api/category/${id}`);
export const getCategoriesWithSubcategories = () =>
  api.get("api/categories/with-subcategories");
export const createCategory = (data) => api.post("api/category/create", data);
export const updateCategory = (data) =>
  api.put(`api/category/update/${data._id}`, data);
export const deleteCategory = (id) => api.delete(`api/category/delete/${id}`);

// ── Sub-Categories ────────────────────────────────────────────────
export const getSubCategories = () => api.get("api/subcategory/all");
export const getSubCategoryById = (id) => api.get(`api/subcategory/${id}`);
export const createSubCategory = (data) =>
  api.post("api/subcategory/create", data);
export const updateSubCategory = (data) =>
  api.put(`api/subcategory/update/${data._id}`, data);
export const deleteSubCategory = (id) =>
  api.delete(`api/subcategory/delete/${id}`);

// ── Sub-Sub-Categories ────────────────────────────────────────────
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

// ── Products ──────────────────────────────────────────────────────
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

// ── Banners ───────────────────────────────────────────────────────
export const getBanners = () => api.get("api/banner");
export const createBanner = (data) => api.post("api/banner/create", data);
export const updateBanner = (id, data) =>
  api.put(`api/banner/update/${id}`, data);
export const deleteBanner = (id) => api.delete(`api/banner/delete/${id}`);

// ── Offers ────────────────────────────────────────────────────────
export const getOffers = () => api.get("api/offer");
export const createOffer = (data) => api.post("api/offer/create", data);
export const updateOffer = (id, data) =>
  api.put(`api/offer/update/${id}`, data);
export const deleteOffer = (id) => api.delete(`api/offer/delete/${id}`);

// ── Users ─────────────────────────────────────────────────────────
export const getAllUsers = () => api.get("api/user/all");
export const deleteUser = (id) => api.delete(`api/user/${id}`);

// ── Orders ────────────────────────────────────────────────────────
export const getStats = () => api.get("api/order/stats");
export const getOrders = () => api.get("api/kitchen/orders");
export const updateOrderStatus = (id, status) =>
  api.put(`api/kitchen/order/status/${id}`, { status });

// ── Coupons (/api/coupon) ─────────────────────────────────────────
export const getCoupons = () => api.get("api/coupon/all");
export const getCouponByCode = (code) => api.get(`api/coupon/${code}`);
export const createCoupon = (data) => api.post("api/coupon/create", data);
export const applyCoupon = (data) => api.post("api/coupon/apply", data);
export const deleteCoupon = (id) => api.delete(`api/coupon/delete/${id}`);

// ── Address ───────────────────────────────────────────────────────
export const getAllAddress = () => api.get("api/address/all/data");
export const getAddress = (userId) => api.get(`api/address/${userId}`);
export const addAddress = (data) => api.post("api/address/add", data);
export const updateAddress = (id, data) =>
  api.put(`api/address/update/${id}`, data);

// ── Reviews ───────────────────────────────────────────────────────
export const getAllReviews = () => api.get("api/review/all/data");
export const getReview = (productId) => api.get(`api/review/${productId}`);
export const addReview = (data) => api.post("api/review/add", data);
export const updateReview = (id, data) =>
  api.put(`api/review/update/${id}`, data);
export const deleteReview = (id) => api.delete(`api/review/delete/${id}`);

// ── Logo ──────────────────────────────────────────────────────────
export const getLogo = () => api.get("api/logo");
export const createLogo = (data) => api.post("api/logo/create", data);
export const updateLogo = (id, data) => api.put(`api/logo/update/${id}`, data);
export const deleteLogo = (id) => api.delete(`api/logo/delete/${id}`);

// ── SEO ───────────────────────────────────────────────────────────
export const getAllSeo = () => api.get("api/seo/all");
export const getSeoById = (id) => api.get(`api/seo/${id}`);
export const createSeo = (data) => api.post("api/seo/create", data);
export const updateSeo = (id, data) => api.put(`api/seo/update/${id}`, data);
export const deleteSeo = (id) => api.delete(`api/seo/delete/${id}`);

// ── Pincode ───────────────────────────────────────────────────────
export const getPincodes = () => api.get("api/pincode/all");
export const createPincode = (data) => api.post("api/pincode/create", data);
export const updatePincode = (id, data) =>
  api.put(`api/pincode/update/${id}`, data);
export const deletePincode = (id) => api.delete(`api/pincode/delete/${id}`);

// ── Swipers ───────────────────────────────────────────────────────
export const getSwipers = () => api.get("api/swiper/all");
export const createSwiper = (data) => api.post("api/swiper/create", data);
export const deleteSwiper = (id) => api.delete(`api/swiper/delete/${id}`);

// ── Cart ──────────────────────────────────────────────────────────
export const getAllCartData = () => api.get("api/cart/all/data");
export const getCart = (userId) => api.get(`api/cart/${userId}`);
export const addToCart = (data) => api.post("api/cart/add", data);
export const updateCartQty = (data) => api.put("api/cart/update", data);
export const removeFromCart = (data) => api.delete("api/cart/remove", { data });
export const clearCart = (userId) => api.delete(`api/cart/clear/${userId}`);

// ── Enquiry ───────────────────────────────────────────────────────
export const createEnquiry = (data) => api.post("api/enquiry/create", data);

// ── Festival Discounts ────────────────────────────────────────────
export const createFestivalDiscount = (data) =>
  api.post("api/festival/create", data);
export const updateFestivalDiscount = (id, data) =>
  api.put(`api/festival/update/${id}`, data);
export const getAllFestivalDiscounts = () => api.get("api/festival/all");
export const getFestivalDiscountById = (id) => api.get(`api/festival/${id}`);

// ═════════════════════════════════════════════════════════════════
//  SUPER ADMIN  (saApi)
//  Uses 'superAdminToken' from localStorage.
//  /superadmin/* → SA-only routes (auth, special coupons)
//  /api/*        → shared routes (same backend, different auth header)
// ═════════════════════════════════════════════════════════════════

// ── Auth (/superadmin/auth) ───────────────────────────────────────
export const superAdminLogin = (data) =>
  saApi.post("superadmin/auth/login", data);
export const superAdminRegister = (data) =>
  saApi.post("superadmin/auth/register", data);
export const superAdminGetProfile = () => saApi.get("superadmin/auth/me");
export const superAdminRefreshToken = (refreshToken) =>
  saApi.post("superadmin/auth/refresh-token", { refreshToken });
export const superAdminLogout = () => saApi.post("superadmin/auth/logout");
export const superAdminForgotPassword = (email) =>
  saApi.post("superadmin/auth/forgot-password", { email });
export const superAdminVerifyOtp = (email, otp) =>
  saApi.post("superadmin/auth/verify-otp", { email, otp });
export const superAdminResetPassword = (email, newPassword, confirmPassword) =>
  saApi.post("superadmin/auth/reset-password", {
    email,
    newPassword,
    confirmPassword,
  });

// ── Special Coupons (/superadmin/coupons) ─────────────────────────
export const getSpecialCoupons = (params) =>
  saApi.get("superadmin/coupons", { params });
export const getSpecialCouponById = (id) =>
  saApi.get(`superadmin/coupons/${id}`);
export const createSpecialCoupon = (data) =>
  saApi.post("superadmin/coupons", data);
export const updateSpecialCoupon = (id, data) =>
  saApi.put(`superadmin/coupons/${id}`, data);
export const deleteSpecialCoupon = (id) =>
  saApi.delete(`superadmin/coupons/${id}`);

// ── Used Coupons (/superadmin/coupons/used) ───────────────────────
export const superAdminGetUsedCoupons = (params) =>
  saApi.get("superadmin/coupons/used", { params });
export const superAdminAddUsedCoupon = (data) =>
  saApi.post("superadmin/coupons/used", data);
export const superAdminUpdateUsedCoupon = (id, data) =>
  saApi.put(`superadmin/coupons/used/${id}`, data);
export const superAdminDeleteUsedCoupon = (id) =>
  saApi.delete(`superadmin/coupons/used/${id}`);

// ── Image Upload (/api/upload) ────────────────────────────────────
export const superAdminUploadImage = (formData) =>
  saApi.post("api/upload", formData);

// ── Categories (/api/category) ────────────────────────────────────
export const getSuperAdminCategories = () => saApi.get("api/category/all");
export const getSuperAdminCategoryById = (id) =>
  saApi.get(`api/category/${id}`);
export const getSuperAdminCategoriesWithSub = () =>
  saApi.get("api/categories/with-subcategories");
export const createSuperAdminCategory = (data) =>
  saApi.post("api/category/create", data);
export const updateSuperAdminCategory = (id, data) =>
  saApi.put(`api/category/update/${id}`, data);
export const deleteSuperAdminCategory = (id) =>
  saApi.delete(`api/category/delete/${id}`);

// ── Sub-Categories (/api/subcategory) ─────────────────────────────
export const getSuperAdminSubCategories = () =>
  saApi.get("api/subcategory/all");
export const getSuperAdminSubCategoryById = (id) =>
  saApi.get(`api/subcategory/${id}`);
export const createSuperAdminSubCategory = (data) =>
  saApi.post("api/subcategory/create", data);
export const updateSuperAdminSubCategory = (id, data) =>
  saApi.put(`api/subcategory/update/${id}`, data);
export const deleteSuperAdminSubCategory = (id) =>
  saApi.delete(`api/subcategory/delete/${id}`);

// ── Sub-Sub-Categories (/api/sub-subcategory) ─────────────────────
export const getSuperAdminSubSubCategories = () =>
  saApi.get("api/sub-subcategory/all");
export const getSuperAdminSubSubCategoryById = (id) =>
  saApi.get(`api/sub-subcategory/${id}`);
export const getSuperAdminSubSubByCategory = (categoryId) =>
  saApi.get(`api/sub-subcategory/by-category/${categoryId}`);
export const createSuperAdminSubSubCategory = (data) =>
  saApi.post("api/sub-subcategory/create", data);
export const updateSuperAdminSubSubCategory = (id, data) =>
  saApi.put(`api/sub-subcategory/update/${id}`, data);
export const deleteSuperAdminSubSubCategory = (id) =>
  saApi.delete(`api/sub-subcategory/delete/${id}`);

// ── Products (/api/product) ───────────────────────────────────────
export const getSuperAdminProducts = () => saApi.get("api/products");
export const getSuperAdminProductCount = () => saApi.get("api/products");
export const getSuperAdminProductById = (id) => saApi.get(`api/product/${id}`);
export const createSuperAdminProduct = (data) =>
  saApi.post("api/product/create", data);
export const updateSuperAdminProduct = (id, data) =>
  saApi.put(`api/product/update/${id}`, data);
export const deleteSuperAdminProduct = (id) =>
  saApi.delete(`api/product/delete/${id}`);

// ── Users (/api/user) ─────────────────────────────────────────────
export const superAdminGetAllUsers = () => saApi.get("api/user/all");
export const superAdminDeleteUser = (id) => saApi.delete(`api/user/${id}`);

// ── Orders + Stats (/api/kitchen & /api/order) ────────────────────
export const superAdminGetOrders = () => saApi.get("api/kitchen/orders");
export const superAdminGetOrderCouponUsages = () =>
  saApi.get("api/kitchen/orders/coupon-usages"); // ← ADDED
export const superAdminGetStats = () => saApi.get("api/order/stats");
export const superAdminUpdateOrderStatus = (id, status) =>
  saApi.put(`api/kitchen/order/status/${id}`, { status });

// ── Regular Coupons (/api/coupon) ─────────────────────────────────
export const superAdminGetCoupons = () => saApi.get("api/coupon/all");
export const superAdminGetCouponByCode = (code) =>
  saApi.get(`api/coupon/${code}`);
export const superAdminCreateCoupon = (data) =>
  saApi.post("api/coupon/create", data);
export const superAdminApplyCoupon = (data) =>
  saApi.post("api/coupon/apply", data);
export const superAdminDeleteCoupon = (id) =>
  saApi.delete(`api/coupon/delete/${id}`);

// ── Banners (/api/banner) ─────────────────────────────────────────
export const superAdminGetBanners = () => saApi.get("api/banner");
export const superAdminCreateBanner = (data) =>
  saApi.post("api/banner/create", data);
export const superAdminUpdateBanner = (id, data) =>
  saApi.put(`api/banner/update/${id}`, data);
export const superAdminDeleteBanner = (index) =>
  saApi.delete(`api/banner/delete/${index}`);

// ── Reviews (/api/review) ─────────────────────────────────────────
export const superAdminGetAllReviews = () => saApi.get("api/review/all/data");
export const superAdminGetReview = (productId) =>
  saApi.get(`api/review/${productId}`);
export const superAdminAddReview = (data) => saApi.post("api/review/add", data);
export const superAdminUpdateReview = (id, data) =>
  saApi.put(`api/review/update/${id}`, data);
export const superAdminDeleteReview = (id) =>
  saApi.delete(`api/review/delete/${id}`);

// ── Logo (/api/logo) ──────────────────────────────────────────────
export const superAdminGetLogo = () => saApi.get("api/logo");
export const superAdminCreateLogo = (data) =>
  saApi.post("api/logo/create", data);
export const superAdminUpdateLogo = (id, data) =>
  saApi.put(`api/logo/update/${id}`, data);
export const superAdminDeleteLogo = (id) =>
  saApi.delete(`api/logo/delete/${id}`);

// ── Pincode (/api/pincode) ────────────────────────────────────────
export const superAdminGetPincodes = () => saApi.get("api/pincode/all");
export const superAdminSearchPincodes = (q) =>
  saApi.get("api/pincode/search", { params: { q } });
export const superAdminCreatePincode = (data) =>
  saApi.post("api/pincode/create", data);
export const superAdminUpdatePincode = (id, data) =>
  saApi.put(`api/pincode/update/${id}`, data);
export const superAdminDeletePincode = (id) =>
  saApi.delete(`api/pincode/delete/${id}`);
export const superAdminBulkUploadPincodes = (formData) =>
  saApi.post("api/pincode/bulk-upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const superAdminExportPincodes = () =>
  saApi.get("api/pincode/export", { responseType: "blob" });
export const superAdminDownloadPincodeSampleTemplate = () =>
  saApi.get("api/pincode/sample-template", { responseType: "blob" });

// ── SEO (/api/seo) ────────────────────────────────────────────────
export const superAdminGetAllSeo = () => saApi.get("api/seo/all");
export const superAdminGetSeoById = (id) => saApi.get(`api/seo/${id}`);
export const superAdminCreateSeo = (data) => saApi.post("api/seo/create", data);
export const superAdminUpdateSeo = (id, data) =>
  saApi.put(`api/seo/update/${id}`, data);
export const superAdminDeleteSeo = (id) => saApi.delete(`api/seo/delete/${id}`);

// ── Swipers (/api/swiper) ─────────────────────────────────────────
export const superAdminGetSwipers = () => saApi.get("api/swiper/all");
export const superAdminCreateSwiper = (data) =>
  saApi.post("api/swiper/create", data);
export const superAdminDeleteSwiper = (id) =>
  saApi.delete(`api/swiper/delete/${id}`);

// ── Addresses (/api/address) ──────────────────────────────────────
export const superAdminGetAddresses = () => saApi.get("api/address/all/data");
export const superAdminGetAddress = (userId) =>
  saApi.get(`api/address/${userId}`);

// ── Festival Discounts (/api/festival) ────────────────────────────
export const superAdminCreateFestivalDiscount = (data) =>
  saApi.post("api/festival/create", data);
export const superAdminUpdateFestivalDiscount = (id, data) =>
  saApi.put(`api/festival/update/${id}`, data);
export const superAdminGetAllFestivalDiscounts = () =>
  saApi.get("api/festival/all");
export const superAdminGetFestivalDiscountById = (id) =>
  saApi.get(`api/festival/${id}`);

// ── Aliases (backward compat) ─────────────────────────────────────
export const getReviews = getAllReviews;
export const getAddresses = getAllAddress;

export default api;
