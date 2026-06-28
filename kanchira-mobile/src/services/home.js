import api from "./api";

export const AllCategoriesWithSubCategories = async (payload) => {
  try {
    const response = await api.get('/categories/with-subcategories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories with subcategories:', error);
    throw error;
  }
};

export const AllCategoriesWithSubSubCategories = async (payload) => {
  try {
    const categoryId = payload?.categoryId || payload;
    const response = await api.get(`/sub-subcategory/by-category/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sub-subcategories by category:', error);
    throw error;
  }
};

export const AllCategories = async (payload) => {
  try {
    const response = await api.get('/category/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching all categories:', error);
    throw error;
  }
};

export const AllSubCategoriesParam = async (payload) => {
  try {
    const id = payload?.id || payload?.categoryId || payload;
    const response = await api.get(`/category/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching category by ID:', error);
    throw error;
  }
};

export const AllSubCategories = async (payload) => {
  try {
    const response = await api.get('/subcategory/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching all subcategories:', error);
    throw error;
  }
};

export const AllSubSubCategories = async (payload) => {
  try {
    const id = payload?.id || payload?.subSubcategoryId || payload;
    const response = await api.get(`/sub-subcategory/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sub-subcategory by ID:', error);
    throw error;
  }
};

export const SubSubCategoryByProducts = async (payload) => {
  try {
    const id = payload?.subsubcategoryId || payload;
    const response = await api.get(`/products/sub-subcategory/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching products by sub-subcategory:', error);
    throw error;
  }
};

// Cart
export const AddCart = async (payload) => {
  try {
    const response = await api.post('/cart/add', payload);
    return response.data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

export const getCart = async (payload) => {
  try {
    const id = payload?.userId || payload;
    const response = await api.get(`/cart/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error getting cart:', error);
    throw error;
  }
};

export const deleteCart = async (payload) => {
  try {
    const response = await api.delete('/cart/remove', { data: payload });
    return response.data;
  } catch (error) {
    console.error('Error deleting cart item:', error);
    throw error;
  }
};

// Wishlist
export const addWishlist = async (payload) => {
  try {
    const response = await api.post('/addWishlist', payload);
    return response.data;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

export const getWishlist = async (payload) => {
  try {
    const response = await api.post('/allwishlist', payload);
    return response.data;
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    throw error;
  }
};

export const deleteWishlist = async (payload) => {
  try {
    const response = await api.delete('/removewishlist', { data: payload });
    return response.data;
  } catch (error) {
    console.error('Error deleting wishlist item:', error);
    throw error;
  }
};

// User / Auth
export const userRegister = async (payload) => {
  try {
    const response = await api.post('/user/register', payload);
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const otpVerify = async (payload) => {
  try {
    const response = await api.post('/user/verify', payload);
    return response.data;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

// Address
export const AddAddress = async (payload) => {
  try {
    const response = await api.post('/address/add', payload);
    return response.data;
  } catch (error) {
    console.error('Error adding address:', error);
    throw error;
  }
};

export const getAddress = async (payload) => {
  try {
    const id = payload?.userId || payload;
    const response = await api.get(`/address/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error getting address:', error);
    throw error;
  }
};

export const updateAddress = async (payload) => {
  try {
    const id = payload?._id || payload?.id;
    const response = await api.put(`/address/update/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error('Error updating address:', error);
    throw error;
  }
};

export const deleteAddress = async (payload) => {
  try {
    const id = payload?._id || payload?.id || payload;
    const response = await api.delete(`/address/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting address:', error);
    throw error;
  }
};

// Profile / User Details
export const updateUser = async (payload) => {
  try {
    const id = payload?._id || payload?.id;
    const response = await api.put(`/user/update/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const getUser = async (payload) => {
  try {
    const id = payload?._id || payload?.id || payload?.userId;
    const response = await api.get(`/user/profile/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Coupons & Payments (New functions matching web parity)
export const getCouponByCode = async (code) => {
  try {
    const response = await api.get(`/coupon/${code}`);
    return response.data;
  } catch (error) {
    console.error('Error getting coupon by code:', error);
    throw error;
  }
};

export const validateSuperCoupon = async (payload) => {
  try {
    const response = await api.post('/superadmin/coupons/validate', payload);
    return response.data;
  } catch (error) {
    console.error('Error validating super coupon:', error);
    throw error;
  }
};

export const createPayment = async (payload) => {
  try {
    const response = await api.post('/order/create', payload);
    return response.data;
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
};

export const verifyPayment = async (payload) => {
  try {
    const response = await api.post('/order/verify', payload);
    return response.data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

export const getBanners = async () => {
  try {
    const response = await api.get('/banner');
    return response.data;
  } catch (error) {
    console.error('Error fetching banners:', error);
    throw error;
  }
};

export const recordSuperCouponUse = async (payload) => {
  try {
    const response = await api.post('/superadmin/coupons/use', payload);
    return response.data;
  } catch (error) {
    console.error('Error recording super coupon usage:', error);
    throw error;
  }
};