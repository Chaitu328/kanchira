import axios from 'axios'

// ─── Base URL ──────────────────────────────────────────────────────────────────
const BASE_URL = 'https://kanchira-backend-fdlk.onrender.com'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ─── Global Token Interceptor ──────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ─────────────────────────────────────────────────────────────────────────────
//  👤  AUTH / USERS
//  Backend routes: POST /userRegister, POST /userLogin, POST /verifyOtp,
//                  POST /resendOtp, POST /sentOtp, POST /sentVerifyOtp,
//                  POST /setPassword, POST /updateUser, GET /users,
//                  DELETE /deleteUserById, POST /getDetails
// ─────────────────────────────────────────────────────────────────────────────
/** Register user — sends OTP to phone.
 *  Body: { phone, name?, email?, password? }
 *  Response: { responseCode, message, userId }
 */
export const userRegister = (data) => api.post('/userRegister', data)

/** Login user.
 *  Body: { emailOrPhone, password }
 *  Response: { responseCode, token, userId, name, phone, email }
 */
export const userLogin = (data) => api.post('/userLogin', data)

/** Verify OTP after registration.
 *  Body: { phone, OTP }
 *  Response: { responseCode, message, token, userId }
 */
export const verifyOtp = (data) => api.post('/verifyOtp', data)

/** Resend OTP.
 *  Body: { phone }
 */
export const resendOtp = (data) => api.post('/resendOtp', data)

/** Send OTP for forgot-password flow.
 *  Body: { phone }
 */
export const sentOtp = (data) => api.post('/sentOtp', data)

/** Verify OTP for forgot-password flow.
 *  Body: { phone, OTP }
 */
export const sentVerifyOtp = (data) => api.post('/sentVerifyOtp', data)

/** Set new password after OTP verify.
 *  Body: { phone, password }
 */
export const setPassword = (data) => api.post('/setPassword', data)

/** Get all users (admin).
 *  Response: [{ _id, name, phone, email, isVerified, createdAt }]
 */
export const getUsers = () => api.get('/users')


/** Delete user by ID (admin).
 *  Body: { userId }
 */
export const deleteUserById = (userId) =>
  api.delete('/deleteUserById', { data: { userId } })

/** Get profile of logged-in user.
 *  Body: { userId }  (userId from localStorage)
 *  Response: { user: { _id, name, phone, email } }
 */
export const getProfile = (userId) => api.post('/getDetails', { userId })

/** Update user profile.
 *  Body: { userId, name?, email?, phone? }
 */
export const updateUser = (data) => api.post('/updateUser', data)


// ─────────────────────────────────────────────────────────────────────────────
//  🖼️  LOGO
//  Routes: GET /getLogo, PUT /updateLogo
// ─────────────────────────────────────────────────────────────────────────────
export const getLogo = () => api.get('/getLogo')

/** Update logo.
 *  Body: { logoUrl }
 */
export const updateLogo = (data) => api.put('/updateLogo', data)

// ─────────────────────────────────────────────────────────────────────────────
//  📂  CATEGORIES
//  Routes: GET /getCategories, POST /getCategoryWithSubCategories,
//          POST /createCategory, PUT /updateCategory, DELETE /deleteCategory,
//          POST /getCategory/:categoryId
// ─────────────────────────────────────────────────────────────────────────────
export const getCategories = () => api.get('/getCategories')

/** Get single category by ID.
 *  Param: categoryId in URL
 */
export const getCategoryById = (categoryId) =>
  api.post(`/getCategory/${categoryId}`)

/** Get categories with their subcategories nested.
 *  Response: [{ _id, name, subCategories: [...] }]
 */
export const getCategoriesWithSubcategories = () =>
  api.post('/getCategoryWithSubCategories')

export const createCategory = (data) => api.post('/createCategory', data)
export const updateCategory = (data) => api.put('/updateCategory', data)
export const deleteCategory = (categoryId) =>
  api.delete('/deleteCategory', { data: { categoryId } })

// ─────────────────────────────────────────────────────────────────────────────
//  📂  SUB-CATEGORIES
//  Routes: GET /getSubCategories, POST /getCategoryById,
//          POST /createSubCategory, PUT /updateSubCategory,
//          DELETE /deleteSubCategory
// ─────────────────────────────────────────────────────────────────────────────
export const getSubCategories = () => api.get('/getSubCategories')

/** Get subcategory by ID.
 *  Body: { subCategoryId }
 */
export const getSubCategoryById = (subCategoryId) =>
  api.post('/getCategoryById', { subCategoryId })

export const createSubCategory = (data) => api.post('/createSubCategory', data)
export const updateSubCategory = (data) => api.put('/updateSubCategory', data)
export const deleteSubCategory = (subCategoryId) =>
  api.delete('/deleteSubCategory', { data: { subCategoryId } })

// ─────────────────────────────────────────────────────────────────────────────
//  📂  SUB-SUB-CATEGORIES
//  Routes: GET /getSub_SubCategories, POST /getSub_SubCategoryById,
//          POST /getSub_SubCategoryByCategoryId,
//          POST /createSub_SubCategory, PUT /updateSub_SubCategory,
//          DELETE /deleteSub_SubCategory
// ─────────────────────────────────────────────────────────────────────────────
export const getSub_SubCategories = () => api.get('/getSub_SubCategories')

/** Get sub-subcategory by ID.
 *  Body: { subCategoryId }
 */
export const getSub_SubCategoryById = (subCategoryId) =>
  api.post('/getSub_SubCategoryById', { subCategoryId })

/** Get all sub-subcategories under a category.
 *  Body: { categoryId }
 */
export const getSub_SubCategoryByCategoryId = (categoryId) =>
  api.post('/getSub_SubCategoryByCategoryId', { categoryId })

export const createSub_SubCategory = (data) =>
  api.post('/createSub_SubCategory', data)
export const updateSub_SubCategory = (data) =>
  api.put('/updateSub_SubCategory', data)
export const deleteSub_SubCategory = (subCategoryId) =>
  api.delete('/deleteSub_SubCategory', { data: { subCategoryId } })

// ─────────────────────────────────────────────────────────────────────────────
//  🛍️  PRODUCTS
//  Routes: GET /getproducts, GET /getproductsbyid/:productId,
//          POST /getProductsBySubCategory, POST /getProductsByIds,
//          POST /getByCategoryId, POST /getSubSubCategorieIdByProducts,
//          POST /createproduct, PUT /updateproduct, DELETE /deleteproduct,
//          POST /search
// ─────────────────────────────────────────────────────────────────────────────
export const getProducts = () => api.get('/getproducts')

export const getProductById = (productId) =>
  api.get(`/getproductsbyid/${productId}`)

/** Get products filtered by sub-subcategory.
 *  Body: { subsubcategoryId }
 */
export const getProductsBySubCategory = (subsubcategoryId) =>
  api.post('/getProductsBySubCategory', { subsubcategoryId })

/** Get products by array of IDs.
 *  Body: { ids: [...] }
 */
export const getProductsByIds = (data) => api.post('/getProductsByIds', data)

/** Get products by category ID.
 *  Body: { categoryId }
 */
export const getProductsByCategory = (categoryId) =>
  api.post('/getByCategoryId', { categoryId })

/** Search products.
 *  Body: { query }
 */
export const searchProducts = (query) => api.post('/search', { query })

export const createProduct = (data) => api.post('/createproduct', data)
export const updateProduct = (data) => api.put('/updateproduct', data)
export const deleteProduct = (productId) =>
  api.delete('/deleteproduct', { data: { productId } })

// ─────────────────────────────────────────────────────────────────────────────
//  🛒  CART
//  Routes: POST /addcart, POST /getcart, POST /updatecartQunatity,
//          DELETE /removeItemCart, POST /clearCart, GET /getAllCartData
//
//  IMPORTANT – cart is stored server-side per userId.
//  For GUEST users, manage cart in localStorage (see CartPage).
// ─────────────────────────────────────────────────────────────────────────────

/** Get cart for a user.
 *  Body: { userId }
 *  Response: { cart: { userId, items: [{ productId, variant, quantity, image }] } }
 */
export const getCart = (userId) => api.post('/getcart', { userId })

/** Add item(s) to cart.
 *  Body: { userId, items: [{ productId, variant, quantity, image }] }
 *  Note: productId must be a MongoDB ObjectId string.
 */
export const addToCart = (data) => api.post('/addcart', data)

/** Update quantity of a specific cart item.
 *  Body: { userId, productId, variant, quantity }
 */
export const updateCartQuantity = (data) =>
  api.post('/updatecartQunatity', data)

/** Remove a specific item from cart.
 *  Body: { userId, productId, variant }
 *  Note: backend matches on productId + variant.fabric
 */
export const removeItemCart = (data) =>
  api.delete('/removeItemCart', { data })

/** Clear entire cart for a user.
 *  Body: { userId }
 */
export const clearCart = (userId) => api.post('/clearCart', { userId })

/** Get all cart data (admin).
 *  Response: [Cart]
 */
export const getAllCartData = () => api.get('/getAllCartData')

// ─────────────────────────────────────────────────────────────────────────────
//  ❤️  WISHLIST
//  Routes: POST /addWishlist, POST /allwishlist, DELETE /removewishlist
// ─────────────────────────────────────────────────────────────────────────────

/** Add product to wishlist.
 *  Body: { userId, productId }
 *  Response: { message, item }
 */
export const addWishlist = (data) => api.post('/addWishlist', data)

/** Get all wishlist items for a user.
 *  Body: { userId }
 *  Response: [{ _id, userId, productId: <populated product> }]
 */
export const getWishlist = (userId) => api.post('/allwishlist', { userId })

/** Remove item from wishlist.
 *  Body: { wishlistId }  — use the wishlist document _id, NOT productId
 */
export const removeWishlist = (wishlistId) =>
  api.delete('/removewishlist', { data: { wishlistId } })

// ─────────────────────────────────────────────────────────────────────────────
//  ⭐  REVIEWS
//  Routes: POST /addreview, POST /getreview, POST /updatereview,
//          POST /deletereview, GET /getReviews
// ─────────────────────────────────────────────────────────────────────────────

/** Add a review.
 *  Body: { userId, productId, rating, comment }
 */
export const addReview = (data) => api.post('/addreview', data)

/** Get reviews for a product.
 *  Body: { productId }
 */
export const getReview = (productId) => api.post('/getreview', { productId })

/** Update a review.
 *  Body: { reviewId, rating?, comment? }
 */
export const updateReview = (data) => api.post('/updatereview', data)

/** Delete a review.
 *  Body: { reviewId }
 */
export const deleteReview = (reviewId) =>
  api.post('/deletereview', { reviewId })

/** Get all reviews (admin).
 */
export const getAllReviews = () => api.get('/getReviews')

// ─────────────────────────────────────────────────────────────────────────────
//  🎟️  COUPONS
//  Routes: GET /getCoupons, GET /getCouponByCode/:code,
//          POST /createCouponcode, POST /getCoupons (apply)
// ─────────────────────────────────────────────────────────────────────────────
export const getCoupons = () => api.get('/getCoupons')

/** Get coupon details by code string.
 *  Response: { coupon: { _id, code, type, value, expiryDate } }
 */
export const getCouponByCode = (code) => api.get(`/getCouponByCode/${code}`)

/** Apply / validate a coupon (returns discount info).
 *  Body: { code, totalAmount }
 */
export const applyCoupon = (data) => api.post('/getCoupons', data)

export const createCoupon = (data) => api.post('/createCouponcode', data)

// ─────────────────────────────────────────────────────────────────────────────
//  🎉  FESTIVALS
//  Routes: GET /getfestival, POST /createfistival, PUT /festival/:id
// ─────────────────────────────────────────────────────────────────────────────
export const getFestival = () => api.get('/getfestival')
export const createFestival = (data) => api.post('/createfistival', data)
export const updateFestival = (id, data) => api.put(`/festival/${id}`, data)

// ─────────────────────────────────────────────────────────────────────────────
//  🎯  BANNERS
//  Routes: GET /getBanners, POST /createBanner, PUT /updateBanner
// ─────────────────────────────────────────────────────────────────────────────
export const getBanners = () => api.get('/getBanners')
export const createBanner = (data) => api.post('/createBanner', data)
export const updateBanner = (data) => api.put('/updateBanner', data)

// ─────────────────────────────────────────────────────────────────────────────
//  💳  PAYMENT & ORDERS
//  Routes: POST /createPayment, POST /verifyPayment, POST /getOrdersByUser
//
//  createPayment payload:
//  { userId, address, items, totalAmount, paymentMethod, orderType,
//    couponCode?, couponDiscount?, spinDiscount?, festivalDiscount? }
// ─────────────────────────────────────────────────────────────────────────────
export const createPayment = (payload) => api.post('/createPayment', payload)

/** Verify PhonePe payment.
 *  Body: { merchantOrderId }
 */
export const verifyPayment = (merchantOrderId) =>
  api.post('/verifyPayment', { merchantOrderId })

/** Get orders for a user.
 *  Body: { userId }
 */
export const getOrdersByUser = (userId) =>
  api.post('/getOrdersByUser', { userId })

/** Get all orders (admin/kitchen).
 */
export const getOrders = () => api.get('/getorders')

// ─────────────────────────────────────────────────────────────────────────────
//  📍  PINCODES
//  Routes: GET /getPincode, POST /createpin, POST /updatepin
// ─────────────────────────────────────────────────────────────────────────────
export const getPincodes = () => api.get('/getPincode')
export const createPinCode = (data) => api.post('/createpin', data)
export const updatePinCode = (data) => api.post('/updatepin', data)

// ─────────────────────────────────────────────────────────────────────────────
//  📩  CONTACT / ENQUIRY
//  Routes: POST /submitForm
// ─────────────────────────────────────────────────────────────────────────────
export const submitContactForm = (data) => api.post('/submitForm', data)

// ─────────────────────────────────────────────────────────────────────────────
//  🏠  ADDRESS
//  Routes: POST /addAddress, POST /getAddress, PUT /updateAddress,
//          POST /deleteAddress, GET /getAllAddress
//
//  Address fields: { userId, fullName, phoneNumber, houseNumber,
//                    currentAddress, state, city, district, pincode }
// ─────────────────────────────────────────────────────────────────────────────

/** Add address.
 *  Body: { userId, fullName, phoneNumber, houseNumber, currentAddress,
 *          state, city, district, pincode }
 */
export const addAddress = (data) => api.post('/addAddress', data)

/** Get addresses for logged-in user.
 *  Body: { userId }  — userId is read from token on backend.
 *  Response: { success, address: [...] }
 */
export const getAddress = (userId) => api.post('/getAddress', { userId })

/** Update address.
 *  Body: { _id, userId, fullName, phoneNumber, houseNumber,
 *          currentAddress, state, city, district, pincode }
 */
export const updateAddress = (data) => api.put('/updateAddress', data)

/** Delete address.
 *  Body: { _id }
 */
export const deleteAddress = (_id) =>
  api.post('/deleteAddress', { _id })

/** Get all addresses (admin).
 */
export const getAllAddress = () => api.get('/getAllAddress')

// ─────────────────────────────────────────────────────────────────────────────
//  🖼️  IMAGE UPLOAD
//  Route: POST /upload  (multipart/form-data, field name: "image")
//  Response: { url }
// ─────────────────────────────────────────────────────────────────────────────
export const uploadImage = (formData) =>
  api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

// ─────────────────────────────────────────────────────────────────────────────
//  🔍  SEO
//  Routes: POST /addSeo, PUT /updateSeo, GET /getSeo,
//          POST /getSeoById, DELETE /deleteSeo
// ─────────────────────────────────────────────────────────────────────────────
export const createSeo = (data) => api.post('/addSeo', data)
export const updateSeo = (data) => api.put('/updateSeo', data)
export const getSeo = () => api.get('/getSeo')
export const getSeoById = (data) => api.post('/getSeoById', data)
export const deleteSeo = (data) => api.delete('/deleteSeo', { data })





export default api


