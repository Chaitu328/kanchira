import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3007/";

const api = axios.create({ baseURL: API_BASE });

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto logout on 401
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
export const loginAdmin = (data) => api.post("adminlogin", data);
export const registerAdmin = (data) => api.post("admin_register", data);

// ── UPLOAD ───────────────────────────────────────────────────────
export const uploadImage = (formData) => api.post("upload", formData);

// ── CATEGORIES ───────────────────────────────────────────────────
export const getCategories = () => api.get("getCategories");
export const getCategoryById = (id) => api.get(`getCategoryById/${id}`);
export const createCategory = (data) => api.post("createCategory", data);
export const updateCategory = (data) => api.put("updateCategory", data);
export const deleteCategory = (_id) =>
  api.delete("deleteCategory", { data: { _id } });

// ── SUB-CATEGORIES ───────────────────────────────────────────────
export const getSubCategories = () => api.get("getSubCategories");
export const getSubCategoriesByCategoryId = (categoryId) =>
  api.post("getCategoryWithSubCategories", { categoryId });
export const createSubCategory = (data) => api.post("createSubCategory", data);
export const updateSubCategory = (data) => api.put("updateSubCategory", data);
export const deleteSubCategory = (_id) =>
  api.delete("deleteSubCategory", { data: { _id } });

// ── SUB-SUB-CATEGORIES ───────────────────────────────────────────
export const getSubSubCategories = () => api.get("getSub_SubCategories");
export const getSubSubCategoryById = (subCategoryId) =>
  api.post("getSub_SubCategoryById", { subCategoryId });
export const createSubSubCategory = (data) =>
  api.post("createSub_SubCategory", data);
export const updateSubSubCategory = (data) =>
  api.put("updateSub_SubCategory", data);
export const deleteSubSubCategory = (_id) =>
  api.delete("deleteSub_SubCategory", { data: { _id } });

// ── PRODUCTS ─────────────────────────────────────────────────────
export const getProducts = () => api.get("getproducts");
export const getProductsBySubSubCategoryId = (subsubcategoryId) =>
  api.post("getproductsbyid", { subsubcategoryId });
export const createProduct = (data) => api.post("createproduct", data);
export const updateProduct = (data) => api.put("updateproduct", data);
export const deleteProduct = (_id) =>
  api.delete("deleteproduct", { data: { _id } });

// ── BANNERS ──────────────────────────────────────────────────────
export const getBanners = () => api.get("getBanners");
export const createBanner = (data) => api.post("createBanner", data);
export const updateBanner = (_id, bannerImage) =>
  api.put("updateBanner", { _id, bannerImage });

// ── REVIEWS ──────────────────────────────────────────────────────
export const getReviews = () => api.get("getReviews");
export const addReview = (data) => api.post("addreview", data);
export const updateReview = (data) => api.post("updatereview", data);
export const deleteReview = (_id) => api.post("deletereview", { _id });

// ── USERS ────────────────────────────────────────────────────────
export const getAllUsers = () => api.get("users");
export const deleteUser = (userId) =>
  api.delete("deleteUserById", { data: { userId } });

// ── LOGO / BRAND ─────────────────────────────────────────────────
export const getLogo = () => api.get("getLogo");
export const createLogo = (data) => api.post("createLogo", data);
export const updateLogo = (data) => api.put("updateLogo", data);
export const deleteLogo = (id) => api.delete("deleteLogo", { data: { id } });

// ── PINCODE ──────────────────────────────────────────────────────
export const getPincodes = () => api.get("getPincode");
export const createPincode = (data) => api.post("createpin", data);
export const deletePincode = (id) =>
  api.delete("deletePincode", { data: { id } });

// ── FESTIVAL DISCOUNT ────────────────────────────────────────────
export const getFestivalDiscounts = () => api.get("getfestival");
export const updateFestivalDiscount = (id, data) =>
  api.put(`festival/${id}`, data);

// ── COUPON CODES ─────────────────────────────────────────────────
export const getCoupons = () => api.get("getCoupons");
export const createCoupon = (data) => api.post("createCouponcode", data);
export const deleteCoupon = (id) => api.delete(`deleteCoupon/${id}`);

// ── ORDERS ───────────────────────────────────────────────────────
export const getOrders = () => api.get("getorders");
export const updateOrderStatus = (id, status) =>
  api.put(`updateOrder/${id}`, { status });
export const getStats = () => api.get("getStats");

// ── ADDRESS ──────────────────────────────────────────────────────
export const getAddresses = () => api.get("getAllAddress");
export const deleteAddress = (_id) =>
  api.delete("deleteAddress", { data: { _id } });

// ── SWIPER ───────────────────────────────────────────────────────
export const getSwipers = () => api.get("getSwiper");
export const createSwiper = (data) => api.post("createSwiper", data);
export const deleteSwiper = (_id) =>
  api.delete("deleteSwiper", { data: { _id } });

export default api;
