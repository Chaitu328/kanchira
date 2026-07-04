import axios from 'axios'

// ─── Base URL ──────────────────────────────────────────────────────────────────
// Backend mounts all routes at /api (app.use("/api", authRoutes) in index.js)
// BASE_URL already includes /api so all paths below are relative to it — no prefix needed.
const BASE_URL = 'http://localhost:3007/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ─── Token Interceptor ────────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ─── Auto-logout on 401 ───────────────────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('admin')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  },
)

// ─────────────────────────────────────────────────────────────────────────────
//  👤  AUTH / USERS
// ─────────────────────────────────────────────────────────────────────────────
export const userRegister   = (data)     => api.post('/user/register', data)
export const verifyOtp      = (data)     => api.post('/user/verify', data)
export const resendOtp      = (data)     => api.post('/user/resend-otp', data)
export const userLogin      = (data)     => api.post('/user/login', data)
export const sentOtp        = (data)     => api.post('/user/send-otp', data)
export const sentVerifyOtp  = (data)     => api.post('/user/verify-otp', data)
export const setPassword    = (data)     => api.post('/user/set-password', data)
export const updateUser     = (id, data) => api.put(`/user/update/${id}`, data)
export const getSearchSlugs = ()         => api.get('/user/search-slugs')
export const getAllUsers     = ()         => api.get('/user/all')
export const deleteUser     = (id)       => api.delete(`/user/${id}`)
export const getProfile     = (id)       => api.get(`/user/profile/${id}`)

export const adminRegister  = (data)     => api.post('/admin/register', data)
export const adminLogin     = (data)     => api.post('/admin/login', data)

// ─────────────────────────────────────────────────────────────────────────────
//  🖼️  IMAGE UPLOAD
// ─────────────────────────────────────────────────────────────────────────────
export const uploadImage = (formData) =>
  api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

// ─────────────────────────────────────────────────────────────────────────────
//  🛍️  PRODUCTS
// ─────────────────────────────────────────────────────────────────────────────
export const createProduct               = (data)             => api.post('/product/create', data)
export const updateProduct               = (id, data)         => api.put(`/product/update/${id}`, data)
export const deleteProduct               = (id)               => api.delete(`/product/delete/${id}`)
export const searchProducts              = (query)            => api.get('/product/search', { params: { query } })
export const getAllProducts               = ()                 => api.get('/product/all')
export const getProductById              = (id)               => api.get(`/product/${id}`)
export const getProductsByCategory       = (categoryId)       => api.get(`/products/category/${categoryId}`)
export const getProductsByFilter         = (params)           => api.get('/products/filter', { params })
export const getProductsBySubSubCategory = (subSubcategoryId) => api.get(`/products/sub-subcategory/${subSubcategoryId}`)
export const getProducts                 = ()                 => api.get('/products')

// ─────────────────────────────────────────────────────────────────────────────
//  🎯  BANNERS
// ─────────────────────────────────────────────────────────────────────────────
export const getBanners   = ()         => api.get('/banner')
export const createBanner = (data)     => api.post('/banner/create', data)
export const updateBanner = (id, data) => api.put(`/banner/update/${id}`, data)

// ─────────────────────────────────────────────────────────────────────────────
//  🏷️  OFFERS
// ─────────────────────────────────────────────────────────────────────────────
export const getOffers   = ()         => api.get('/offer')
export const createOffer = (data)     => api.post('/offer/create', data)
export const updateOffer = (id, data) => api.put(`/offer/update/${id}`, data)
export const deleteOffer = (id)       => api.delete(`/offer/delete/${id}`)

// ─────────────────────────────────────────────────────────────────────────────
//  📂  CATEGORIES
// ─────────────────────────────────────────────────────────────────────────────
export const createCategory                 = (data)     => api.post('/category/create', data)
export const updateCategory                 = (id, data) => api.put(`/category/update/${id}`, data)
export const deleteCategory                 = (id)       => api.delete(`/category/delete/${id}`)
export const getCategories                  = ()         => api.get('/category/all')
export const getCategoryById                = (id)       => api.get(`/category/${id}`)
export const getCategoriesWithSubcategories = ()         => api.get('/categories/with-subcategories')

// ─────────────────────────────────────────────────────────────────────────────
//  📂  SUB-CATEGORIES
// ─────────────────────────────────────────────────────────────────────────────
export const createSubCategory  = (data)     => api.post('/subcategory/create', data)
export const updateSubCategory  = (id, data) => api.put(`/subcategory/update/${id}`, data)
export const deleteSubCategory  = (id)       => api.delete(`/subcategory/delete/${id}`)
export const getSubCategories   = ()         => api.get('/subcategory/all')
export const getSubCategoryById = (id)       => api.get(`/subcategory/${id}`)

// ─────────────────────────────────────────────────────────────────────────────
//  📂  SUB-SUB-CATEGORIES
//
//  FIX — getSub_SubCategoryByCategoryId:
//  The old frontend api.js passed categoryId in the URL correctly, but the backend
//  controller was reading req.body.categoryId (always undefined on GET requests).
//  The backend controller is now fixed to use req.params.categoryId.
//  The route ordering in route.js is also fixed (/by-category/:categoryId now
//  appears BEFORE /:id so Express doesn't swallow "by-category" as an id value).
// ─────────────────────────────────────────────────────────────────────────────
export const createSub_SubCategory          = (data)       => api.post('/sub-subcategory/create', data)
export const updateSub_SubCategory          = (id, data)   => api.put(`/sub-subcategory/update/${id}`, data)
export const deleteSub_SubCategory          = (id)         => api.delete(`/sub-subcategory/delete/${id}`)
export const getSub_SubCategories           = ()           => api.get('/sub-subcategory/all')
export const getSub_SubCategoryById         = (id)         => api.get(`/sub-subcategory/${id}`)
// Correctly passes categoryId in the URL — backend is now fixed to read req.params
export const getSub_SubCategoryByCategoryId = (categoryId) => api.get(`/sub-subcategory/by-category/${categoryId}`)

// ─────────────────────────────────────────────────────────────────────────────
//  🛒  CART
// ─────────────────────────────────────────────────────────────────────────────
export const addToCart          = (data)   => api.post('/cart/add', data)
export const getCart            = (userId) => api.get(`/cart/${userId}`)
export const updateCartQuantity = (data)   => api.put('/cart/update', data)
export const removeItemCart     = (data)   => api.delete('/cart/remove', { data })
export const clearCart          = (userId) => api.delete(`/cart/clear/${userId}`)
export const getAllCartData      = ()       => api.get('/cart/all/data')

// ─────────────────────────────────────────────────────────────────────────────
//  💳  PAYMENT & ORDERS
// ─────────────────────────────────────────────────────────────────────────────
export const createPayment   = (data)   => api.post('/order/create', data)
export const verifyPayment   = (data)   => api.post('/order/verify', data)
export const getOrdersByUser = (userId) => api.get(`/order/user/${userId}`)
export const getStats        = ()       => api.get('/order/stats')

// ─────────────────────────────────────────────────────────────────────────────
//  🍳  KITCHEN / ORDER MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────
export const getOrders         = ()           => api.get('/kitchen/orders')
export const updateOrderStatus = (id, status) => api.put(`/kitchen/order/status/${id}`, { status })

// ─────────────────────────────────────────────────────────────────────────────
//  🎟️  COUPONS — Normal Admin
// ─────────────────────────────────────────────────────────────────────────────
export const getCoupons      = ()     => api.get('/coupon/all')
export const getCouponByCode = (code) => api.get(`/coupon/${code}`)
export const applyCoupon     = (data) => api.post('/coupon/apply', data)
export const createCoupon    = (data) => api.post('/coupon/create', data)
export const deleteCoupon    = (id)   => api.delete(`/coupon/delete/${id}`)

// ─────────────────────────────────────────────────────────────────────────────
//  🎟️  COUPONS — Special (SuperAdmin)
// ─────────────────────────────────────────────────────────────────────────────
export const validateSuperCoupon  = (code, orderAmount = 0) =>
  api.post('/superadmin/coupons/validate', { code, orderAmount })
export const recordSuperCouponUse = (data) =>
  api.post('/superadmin/coupons/use', data)

export const getUsedCoupons       = ()         => api.get('/superadmin/coupons/used')
export const addUsedCoupon        = (data)     => api.post('/superadmin/coupons/used', data)
export const updateUsedCoupon     = (id, data) => api.put(`/superadmin/coupons/used/${id}`, data)
export const deleteUsedCoupon     = (id)       => api.delete(`/superadmin/coupons/used/${id}`)
export const getSpecialCoupons    = (params)   => api.get('/superadmin/coupons', { params })
export const getSpecialCouponById = (id)       => api.get(`/superadmin/coupons/${id}`)
export const createSpecialCoupon  = (data)     => api.post('/superadmin/coupons', data)
export const updateSpecialCoupon  = (id, data) => api.put(`/superadmin/coupons/${id}`, data)
export const deleteSpecialCoupon  = (id)       => api.delete(`/superadmin/coupons/${id}`)

// ─────────────────────────────────────────────────────────────────────────────
//  🏠  ADDRESS
// ─────────────────────────────────────────────────────────────────────────────
export const addAddress    = (data)     => api.post('/address/add', data)
export const updateAddress = (id, data) => api.put(`/address/update/${id}`, data)
export const getAddress    = (userId)   => api.get(`/address/${userId}`)
export const deleteAddress = (id)       => api.delete(`/address/${id}`)
export const getAllAddress  = ()        => api.get('/address/all/data')

// ─────────────────────────────────────────────────────────────────────────────
//  ⭐  REVIEWS
// ─────────────────────────────────────────────────────────────────────────────
export const addReview    = (data)      => api.post('/review/add', data)
export const getReview    = (productId) => api.get(`/review/${productId}`)
export const getAllReviews = ()          => api.get('/review/all/data')
export const updateReview = (id, data)  => api.put(`/review/update/${id}`, data)
export const deleteReview = (id)        => api.delete(`/review/delete/${id}`)

// ─────────────────────────────────────────────────────────────────────────────
//  📩  ENQUIRY
// ─────────────────────────────────────────────────────────────────────────────
export const createEnquiry = (data) => api.post('/enquiry/create', data)

// ─────────────────────────────────────────────────────────────────────────────
//  🎉  FESTIVALS
// ─────────────────────────────────────────────────────────────────────────────
export const createFestival  = (data)     => api.post('/festival/create', data)
export const updateFestival  = (id, data) => api.put(`/festival/update/${id}`, data)
export const getFestivals    = ()         => api.get('/festival/all')
export const getFestivalById = (id)       => api.get(`/festival/${id}`)

// ─────────────────────────────────────────────────────────────────────────────
//  🖼️  LOGO
// ─────────────────────────────────────────────────────────────────────────────
export const createLogo = (data)     => api.post('/logo/create', data)
export const getLogo    = ()         => api.get('/logo')
export const updateLogo = (id, data) => api.put(`/logo/update/${id}`, data)
export const deleteLogo = (id)       => api.delete(`/logo/delete/${id}`)

// ─────────────────────────────────────────────────────────────────────────────
//  🔍  SEO
// ─────────────────────────────────────────────────────────────────────────────
export const createSeo  = (data)     => api.post('/seo/create', data)
export const getAllSeo   = ()         => api.get('/seo/all')
export const getSeoById = (id)       => api.get(`/seo/${id}`)
export const updateSeo  = (id, data) => api.put(`/seo/update/${id}`, data)
export const deleteSeo  = (id)       => api.delete(`/seo/delete/${id}`)

// ─────────────────────────────────────────────────────────────────────────────
//  📍  PINCODES
// ─────────────────────────────────────────────────────────────────────────────
export const createPincode = (data)     => api.post('/pincode/create', data)
export const getPincodes   = ()         => api.get('/pincode/all')
export const updatePincode = (id, data) => api.put(`/pincode/update/${id}`, data)
export const deletePincode = (id)       => api.delete(`/pincode/delete/${id}`)

// ─────────────────────────────────────────────────────────────────────────────
//  🎠  SWIPERS
// ─────────────────────────────────────────────────────────────────────────────
export const createSwiper = (data) => api.post('/swiper/create', data)
export const getSwipers   = ()     => api.get('/swiper/all')
export const deleteSwiper = (id)   => api.delete(`/swiper/delete/${id}`)

// ─────────────────────────────────────────────────────────────────────────────
//  ❤️  WISHLIST
// ─────────────────────────────────────────────────────────────────────────────
export const addWishlist    = (data)       => api.post('/wishlist/add', data)
export const getWishlist    = (userId)     => api.get(`/wishlist/${userId}`)
export const removeWishlist = (wishlistId) => api.delete(`/wishlist/remove/${wishlistId}`)

export default api