import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// Category
import { CategoryList, CategoryCreate, CategoryUpdate } from './pages/Category/index';
// Sub-Category
import { SubCategoryList, SubCategoryCreate, SubCategoryUpdate } from './pages/SubCategory/index';
// Sub-Sub-Category
import { SubSubCategoryList, SubSubCategoryCreate, SubSubCategoryUpdate } from './pages/SubSubCategory/index';
// Products
import { ProductList, ProductCreate, ProductUpdate } from './pages/Product/index';
// Others
import {
  Banners, BannerCreate, BannerUpdate,
  Reviews, ReviewCreate,
  AllUsers, Orders, Sales,
  Logo, LogoUpdate,
  Pincode, FestivalDiscount, CouponCodes, Address
} from './pages/OtherPages';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          draggable
          theme="colored"
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            {/* Dashboard */}
            <Route index element={<Dashboard />} />

            {/* Category */}
            <Route path="category" element={<CategoryList />} />
            <Route path="category/create" element={<CategoryCreate />} />
            <Route path="category/update" element={<CategoryUpdate />} />

            {/* Sub-Category */}
            <Route path="sub-category" element={<SubCategoryList />} />
            <Route path="sub-category/create" element={<SubCategoryCreate />} />
            <Route path="sub-category/update" element={<SubCategoryUpdate />} />

            {/* Sub-Sub-Category */}
            <Route path="sub-subcategory" element={<SubSubCategoryList />} />
            <Route path="sub-subcategory/create" element={<SubSubCategoryCreate />} />
            <Route path="sub-subcategory/update" element={<SubSubCategoryUpdate />} />

            {/* Products */}
            <Route path="products" element={<ProductList />} />
            <Route path="products/create" element={<ProductCreate />} />
            <Route path="products/update" element={<ProductUpdate />} />

            {/* Banners */}
            <Route path="banners" element={<Banners />} />
            <Route path="banners/create" element={<BannerCreate />} />
            <Route path="banners/update" element={<BannerUpdate />} />

            {/* Reviews */}
            <Route path="reviews" element={<Reviews />} />
            <Route path="reviews/create" element={<ReviewCreate />} />

            {/* Other */}
            <Route path="users" element={<AllUsers />} />
            <Route path="orders" element={<Orders />} />
            <Route path="sales" element={<Sales />} />
            <Route path="logo" element={<Logo />} />
            <Route path="logo/update" element={<LogoUpdate />} />
            <Route path="pincode" element={<Pincode />} />
            <Route path="festival" element={<FestivalDiscount />} />
            <Route path="coupons" element={<CouponCodes />} />
            <Route path="address" element={<Address />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
