const express = require("express");
const router = express.Router();
const multer = require("multer");

// ─── Middleware ───────────────────────────────────────────────────────────────
const { verifyToken, isAdmin, isAdminOrSuperAdmin } = require("../middleware/authMiddleware");
const upload = multer({ storage: multer.memoryStorage() });

// ─── Controllers ─────────────────────────────────────────────────────────────
const { registerAdmin, adminLogin } = require("../controllers/authControllers");

const {
  createUser, verifyUser, resendOtp, userLogin,
  sendOTP, VerifyOTP, setPassword,
  updateUser, getSearchSlugs, getAllusers,
  deleteUserById, getProfileUser,
} = require("../controllers/userController");

const {
  createProduct, search, getAllProducts, getProducts,
  createBanner, updateLogo, getLogo, getBanner, updateBanner, deleteBanner,
  createOffer, getOffer, updateOffer, deleteOffer,
  getByProduct, getBycategory, updatedProduct, deleteProduct,
  getProductsByCategorySubcategorySubsubcategory,
  getProductsBySubsubcategoryId,
} = require("../controllers/menuControllers");

const {
  createCategory, updateCategory, deleteCategory,
  getCategories, getCategory, getCategoriesWithSubcategories,
} = require("../controllers/categoriesControllers");

const {
  createSubCategory, updateSubCategory, deleteSubCategory,
  getSubCategories, getSubCategory,
} = require("../controllers/subCategoriesControllers");

const {
  createSub_SubCategory, updateSub_SubCategory, deleteSub_SubCategory,
  getSub_SubCategories, getSub_SubCategory, getSubSubcategoriesByCategory,
} = require("../controllers/sub-subCategoriesControllers");

const {
  addToCart, getCart, updateQuantity,
  removeItemCart, clearCart, getAllCartData,
} = require("../controllers/cartController");

const {
  createPayment, verifyPayment, getOrdersByUser, getStats,
} = require("../controllers/orderController");

const {
  getOrders, updateOrderStatus, getOrderCouponUsages,
} = require("../controllers/getOrderKitchen");

const {
  createCoupon, getCoupons, getCouponByCode,
  applyCoupon, deleteCoupon,
} = require("../controllers/couponcodeController");

const {
  addAddress, updateAddress, getAddress, getAllAddress, deleteAddress
} = require("../controllers/address");

const {
  addReview, getReview, getAllReviews, updateReview, deleteReview,
} = require("../controllers/review");

const { createEnquery } = require("../controllers/enqueryController");

const {
  createFestivalDiscount, updateFestivalDiscount,
  getAllFestivalDiscounts, getFestivalDiscountById,
} = require("../controllers/festivalController");

const { CreateLogo, GetLogo, UpdateLogo, DeleteLogo } = require("../controllers/logoController");

const { CreateSeo, GetSeo, GetSeoById, UpdateSeo, DeleteSeo } = require("../controllers/seo");

const {
  createPinCode, getPincode, updatePinCode, deletePinCode,
  searchPinCode, bulkUploadPinCodes, exportPinCodes, downloadSamplePinCodeFile,
} = require("../controllers/pinController");

const { getSwipers, createSwiper, deleteSwiper } = require("../controllers/swiperController");

const { uploadImage } = require("../middleware/uploadImages");

// ─── Health Check ─────────────────────────────────────────────────────────────
router.get("/", (req, res) => res.json({ message: "API is running ✅" }));

// ─── Admin Auth ───────────────────────────────────────────────────────────────
router.post("/admin/register", registerAdmin);
router.post("/admin/login", adminLogin);

// ─── User Auth ────────────────────────────────────────────────────────────────
router.post("/user/register", createUser);
router.post("/user/verify", verifyUser);
router.post("/user/resend-otp", resendOtp);
router.post("/user/login", userLogin);
router.post("/user/send-otp", sendOTP);
router.post("/user/verify-otp", VerifyOTP);
router.post("/user/set-password", setPassword);
router.put("/user/update/:id", updateUser);
router.get("/user/search-slugs", getSearchSlugs);
router.get("/user/all", verifyToken, isAdminOrSuperAdmin, getAllusers);
router.delete("/user/:id", verifyToken, isAdminOrSuperAdmin, deleteUserById);
router.get("/user/profile/:id", getProfileUser);

// ─── Image Upload ─────────────────────────────────────────────────────────────
router.post("/upload", upload.single("file"), uploadImage);

// ─── Products / Menu ──────────────────────────────────────────────────────────
router.post("/product/create", verifyToken, isAdminOrSuperAdmin, createProduct);
router.put("/product/update/:id", verifyToken, isAdminOrSuperAdmin, updatedProduct);
router.delete("/product/delete/:id", verifyToken, isAdminOrSuperAdmin, deleteProduct);
router.get("/product/search", search);
router.get("/product/all", getAllProducts);
router.get("/product/:id", getByProduct);
router.get("/products/category/:categoryId", getBycategory);
router.get("/products/filter", getProductsByCategorySubcategorySubsubcategory);
router.get("/products/sub-subcategory/:subSubcategoryId", getProductsBySubsubcategoryId);
router.get("/products", getProducts);

// ─── Banners ──────────────────────────────────────────────────────────────────
router.post("/banner/create", verifyToken, isAdminOrSuperAdmin, createBanner);
router.get("/banner", getBanner);
router.put("/banner/update/:id", verifyToken, isAdminOrSuperAdmin, updateBanner);
router.delete("/banner/delete/:index", verifyToken, isAdminOrSuperAdmin, deleteBanner);

// ─── Offers ───────────────────────────────────────────────────────────────────
router.post("/offer/create", verifyToken, isAdmin, createOffer);
router.get("/offer", getOffer);
router.put("/offer/update/:id", verifyToken, isAdmin, updateOffer);
router.delete("/offer/delete/:id", verifyToken, isAdmin, deleteOffer);

// ─── Categories ───────────────────────────────────────────────────────────────
router.post("/category/create", verifyToken, isAdminOrSuperAdmin, createCategory);
router.put("/category/update/:id", verifyToken, isAdminOrSuperAdmin, updateCategory);
router.delete("/category/delete/:id", verifyToken, isAdminOrSuperAdmin, deleteCategory);
router.get("/category/all", getCategories);
router.get("/category/:id", getCategory);
router.get("/categories/with-subcategories", getCategoriesWithSubcategories);

// ─── Subcategories ────────────────────────────────────────────────────────────
router.post("/subcategory/create", verifyToken, isAdminOrSuperAdmin, createSubCategory);
router.put("/subcategory/update/:id", verifyToken, isAdminOrSuperAdmin, updateSubCategory);
router.delete("/subcategory/delete/:id", verifyToken, isAdminOrSuperAdmin, deleteSubCategory);
router.get("/subcategory/all", getSubCategories);
router.get("/subcategory/:id", getSubCategory);

// ─── Sub-Subcategories ────────────────────────────────────────────────────────
router.post("/sub-subcategory/create", verifyToken, isAdminOrSuperAdmin, createSub_SubCategory);
router.put("/sub-subcategory/update/:id", verifyToken, isAdminOrSuperAdmin, updateSub_SubCategory);
router.delete("/sub-subcategory/delete/:id", verifyToken, isAdminOrSuperAdmin, deleteSub_SubCategory);
router.get("/sub-subcategory/all", getSub_SubCategories);
// ✅ FIX: by-category MUST come before /:id or Express matches "by-category" as the id
router.get("/sub-subcategory/by-category/:categoryId", getSubSubcategoriesByCategory);
router.get("/sub-subcategory/:id", getSub_SubCategory);

// ─── Cart ─────────────────────────────────────────────────────────────────────
router.post("/cart/add", addToCart);
router.get("/cart/:userId", getCart);
router.put("/cart/update", updateQuantity);
router.delete("/cart/remove", removeItemCart);
router.delete("/cart/clear/:userId", clearCart);
router.get("/cart/all/data", verifyToken, isAdmin, getAllCartData);

// ─── Orders ───────────────────────────────────────────────────────────────────
router.post("/order/create", createPayment);
router.post("/order/verify", verifyPayment);
router.get("/order/user/:userId", getOrdersByUser);
router.get("/order/stats", verifyToken, isAdminOrSuperAdmin, getStats);

// ─── Kitchen / Order Management ───────────────────────────────────────────────
router.get("/kitchen/orders", verifyToken, isAdminOrSuperAdmin, getOrders);
// Returns orders-with-coupon enriched with which admin created the coupon
router.get("/kitchen/orders/coupon-usages", verifyToken, isAdminOrSuperAdmin, getOrderCouponUsages);
router.put("/kitchen/order/status/:id", verifyToken, isAdminOrSuperAdmin, updateOrderStatus);

// ─── Coupons ──────────────────────────────────────────────────────────────────
router.post("/coupon/create", verifyToken, isAdminOrSuperAdmin, createCoupon);
router.get("/coupon/all", getCoupons);
router.get("/coupon/:code", getCouponByCode);
router.post("/coupon/apply", applyCoupon);
router.delete("/coupon/delete/:id", verifyToken, isAdminOrSuperAdmin, deleteCoupon);

// ─── Address ──────────────────────────────────────────────────────────────────
router.post("/address/add", addAddress);
router.put("/address/update/:id", updateAddress);
router.get("/address/:userId", getAddress);
router.delete("/address/:id", deleteAddress);
router.get("/address/all/data", verifyToken, isAdminOrSuperAdmin, getAllAddress);

// ─── Reviews ──────────────────────────────────────────────────────────────────
router.post("/review/add", addReview);
router.get("/review/:productId", getReview);
router.get("/review/all/data", verifyToken, isAdminOrSuperAdmin, getAllReviews);
router.put("/review/update/:id", updateReview);
router.delete("/review/delete/:id", verifyToken, isAdminOrSuperAdmin, deleteReview);

// ─── Enquiry ──────────────────────────────────────────────────────────────────
router.post("/enquiry/create", createEnquery);

// ─── Festival Discounts ───────────────────────────────────────────────────────
router.post("/festival/create", verifyToken, isAdminOrSuperAdmin, createFestivalDiscount);
router.put("/festival/update/:id", verifyToken, isAdminOrSuperAdmin, updateFestivalDiscount);
router.get("/festival/all", getAllFestivalDiscounts);
router.get("/festival/:id", getFestivalDiscountById);

// ─── Logo ─────────────────────────────────────────────────────────────────────
router.post("/logo/create", verifyToken, isAdminOrSuperAdmin, CreateLogo);
router.get("/logo", GetLogo);
router.put("/logo/update/:id", verifyToken, isAdminOrSuperAdmin, UpdateLogo);
router.delete("/logo/delete/:id", verifyToken, isAdminOrSuperAdmin, DeleteLogo);

// ─── SEO ──────────────────────────────────────────────────────────────────────
router.post("/seo/create", verifyToken, isAdminOrSuperAdmin, CreateSeo);
router.get("/seo/all", GetSeo);
router.get("/seo/:id", GetSeoById);
router.put("/seo/update/:id", verifyToken, isAdminOrSuperAdmin, UpdateSeo);
router.delete("/seo/delete/:id", verifyToken, isAdminOrSuperAdmin, DeleteSeo);

// ─── Pincode ──────────────────────────────────────────────────────────────────
router.post("/pincode/create", verifyToken, isAdminOrSuperAdmin, createPinCode);
router.get("/pincode/all", getPincode);
router.get("/pincode/search", verifyToken, isAdminOrSuperAdmin, searchPinCode);
router.get("/pincode/export", verifyToken, isAdminOrSuperAdmin, exportPinCodes);
router.get("/pincode/sample-template", verifyToken, isAdminOrSuperAdmin, downloadSamplePinCodeFile);
router.post("/pincode/bulk-upload", verifyToken, isAdminOrSuperAdmin, upload.single("file"), bulkUploadPinCodes);
router.put("/pincode/update/:id", verifyToken, isAdminOrSuperAdmin, updatePinCode);
router.delete("/pincode/delete/:id", verifyToken, isAdminOrSuperAdmin, deletePinCode);

// ─── Swipers ──────────────────────────────────────────────────────────────────
router.post("/swiper/create", verifyToken, isAdminOrSuperAdmin, createSwiper);
router.get("/swiper/all", getSwipers);
router.delete("/swiper/delete/:id", verifyToken, isAdminOrSuperAdmin, deleteSwiper);

module.exports = router;