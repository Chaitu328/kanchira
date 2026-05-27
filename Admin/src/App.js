import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ── Auth Contexts ────────────────────────────────────────────────
import { AuthProvider, useAuth } from "./context/AuthContext";
import {
  SuperAdminAuthProvider,
  useSuperAdminAuth,
} from "./context/SuperAdminAuthContext";

// ── Unified Login ────────────────────────────────────────────────
import Login from "./pages/Login";

// ── Regular Admin Layout + Pages ─────────────────────────────────
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import {
  CategoryList,
  CategoryCreate,
  CategoryUpdate,
} from "./pages/Category/index";
import {
  SubCategoryList,
  SubCategoryCreate,
  SubCategoryUpdate,
} from "./pages/SubCategory/index";
import {
  SubSubCategoryList,
  SubSubCategoryCreate,
  SubSubCategoryUpdate,
} from "./pages/SubSubCategory/index";
import {
  ProductList,
  ProductCreate,
  ProductUpdate,
} from "./pages/Product/index";
import {
  Banners,
  BannerCreate,
  BannerUpdate,
  Reviews,
  ReviewCreate,
  AllUsers,
  Orders,
  Sales,
  Logo,
  LogoUpdate,
  Pincode,
  CouponCodes,
  Address,
} from "./pages/OtherPages";

// ── Super Admin Layout + Pages ────────────────────────────────────
import SuperAdminLayout from "./Supper admin/SuperAdmin/SuperAdminLayout";
import SuperAdminDashboard from "./Supper admin/SuperAdmin/SuperAdminDashboard";
import SuperAdminProfile from "./Supper admin/SuperAdmin/SuperAdminProfile";
import SuperAdminUsers from "./Supper admin/SuperAdmin/SuperAdminUsers";
import SuperAdminProducts, {
  ProductUpdate as SuperAdminProductUpdate,
  ProductCreate as SuperAdminProductCreate,
} from "./Supper admin/SuperAdmin/SuperAdminProducts";
import SuperAdminBrands from "./Supper admin/SuperAdmin/SuperAdminBrands";
import SuperAdminCreateAdmin from "./Supper admin/SuperAdmin/SuperAdminCreateAdmin";
import {
  SpecialCouponsList,
  SpecialCouponCreate,
  SpecialCouponUpdate,
} from "./Supper admin/SuperAdmin/SpecialCoupons";
import UsedCoupons from "./Supper admin/SuperAdmin/UsedCoupons";
import {
  SuperAdminCategoryList,
  SuperAdminCategoryCreate,
  SuperAdminCategoryUpdate,
} from "./Supper admin/SuperAdmin/SuperAdminCategory";
import {
  SuperAdminSubCategoryList,
  SuperAdminSubCategoryCreate,
  SuperAdminSubCategoryUpdate,
} from "./Supper admin/SuperAdmin/SuperAdminSubCategory";
import {
  SuperAdminSubSubCategoryList,
  SuperAdminSubSubCategoryCreate,
  SuperAdminSubSubCategoryUpdate,
} from "./Supper admin/SuperAdmin/SuperAdminSubSubCategory";

import {
  Banners as SABanners,
  BannerCreate as SABannerCreate,
  BannerUpdate as SABannerUpdate,
  Reviews as SAReviews,
  ReviewCreate as SAReviewCreate,
  Orders as SAOrders,
  Sales as SASales,
  Logo as SALogo,
  LogoUpdate as SALogoUpdate,
  Pincode as SAPincode,
  CouponCodes as SACouponCodes,
  Address as SAAddress,
} from "./Supper admin/SuperAdminOtherPages";

// ── Route Guards ─────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

function SuperAdminProtectedRoute({ children }) {
  const { isSuperAdminAuthenticated } = useSuperAdminAuth();
  return isSuperAdminAuthenticated ? (
    children
  ) : (
    <Navigate to="/login" replace />
  );
}

// ── App ───────────────────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <SuperAdminAuthProvider>
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
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/superadmin/login"
              element={<Navigate to="/login" replace />}
            />
            <Route
              path="/superadmin/auth/login"
              element={<Navigate to="/login" replace />}
            />

            {/* ── Regular Admin Routes ─────────────────────── */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="category" element={<CategoryList />} />
              <Route path="category/create" element={<CategoryCreate />} />
              <Route path="category/update" element={<CategoryUpdate />} />
              <Route path="sub-category" element={<SubCategoryList />} />
              <Route
                path="sub-category/create"
                element={<SubCategoryCreate />}
              />
              <Route
                path="sub-category/update"
                element={<SubCategoryUpdate />}
              />
              <Route path="sub-subcategory" element={<SubSubCategoryList />} />
              <Route
                path="sub-subcategory/create"
                element={<SubSubCategoryCreate />}
              />
              <Route
                path="sub-subcategory/update"
                element={<SubSubCategoryUpdate />}
              />
              <Route path="products" element={<ProductList />} />
              <Route path="products/create" element={<ProductCreate />} />
              <Route path="products/update" element={<ProductUpdate />} />
              <Route path="banners" element={<Banners />} />
              <Route path="banners/create" element={<BannerCreate />} />
              <Route path="banners/update" element={<BannerUpdate />} />
              <Route path="reviews" element={<Reviews />} />
              <Route path="reviews/create" element={<ReviewCreate />} />
              <Route path="users" element={<AllUsers />} />
              <Route path="orders" element={<Orders />} />
              <Route path="sales" element={<Sales />} />
              <Route path="logo" element={<Logo />} />
              <Route path="logo/update" element={<LogoUpdate />} />
              <Route path="pincode" element={<Pincode />} />
              <Route path="coupons" element={<CouponCodes />} />
              <Route path="address" element={<Address />} />
            </Route>

            {/* ── Super Admin Routes ───────────────────────── */}
            <Route
              path="/superadmin"
              element={
                <SuperAdminProtectedRoute>
                  <SuperAdminLayout />
                </SuperAdminProtectedRoute>
              }
            >
              <Route
                index
                element={<Navigate to="/superadmin/dashboard" replace />}
              />
              <Route path="dashboard" element={<SuperAdminDashboard />} />
              <Route path="profile" element={<SuperAdminProfile />} />
              <Route path="users" element={<SuperAdminUsers />} />
              <Route path="products" element={<SuperAdminProducts />} />
              <Route
                path="products/create"
                element={<SuperAdminProductCreate />}
              />
              <Route
                path="products/update"
                element={<SuperAdminProductUpdate />}
              />
              <Route path="brands" element={<SuperAdminBrands />} />
              <Route path="create-admin" element={<SuperAdminCreateAdmin />} />
              <Route path="coupons" element={<SpecialCouponsList />} />
              <Route path="coupons/create" element={<SpecialCouponCreate />} />
              <Route
                path="coupons/update/:id"
                element={<SpecialCouponUpdate />}
              />
              <Route path="used-coupons" element={<UsedCoupons />} />
              <Route path="category" element={<SuperAdminCategoryList />} />
              <Route
                path="category/create"
                element={<SuperAdminCategoryCreate />}
              />
              <Route
                path="category/update"
                element={<SuperAdminCategoryUpdate />}
              />
              <Route
                path="sub-category"
                element={<SuperAdminSubCategoryList />}
              />
              <Route
                path="sub-category/create"
                element={<SuperAdminSubCategoryCreate />}
              />
              <Route
                path="sub-category/update"
                element={<SuperAdminSubCategoryUpdate />}
              />
              <Route
                path="sub-subcategory"
                element={<SuperAdminSubSubCategoryList />}
              />
              <Route
                path="sub-subcategory/create"
                element={<SuperAdminSubSubCategoryCreate />}
              />
              <Route
                path="sub-subcategory/update"
                element={<SuperAdminSubSubCategoryUpdate />}
              />
              <Route path="banners" element={<SABanners />} />
              <Route path="banners/create" element={<SABannerCreate />} />
              <Route path="banners/update" element={<SABannerUpdate />} />
              <Route path="reviews" element={<SAReviews />} />
              <Route path="reviews/create" element={<SAReviewCreate />} />
              <Route path="orders" element={<SAOrders />} />
              <Route path="sales" element={<SASales />} />
              <Route path="logo" element={<SALogo />} />
              <Route path="logo/update" element={<SALogoUpdate />} />
              <Route path="pincode" element={<SAPincode />} />
              <Route path="coupon-codes" element={<SACouponCodes />} />
              <Route path="address" element={<SAAddress />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </SuperAdminAuthProvider>
    </AuthProvider>
  );
}

export default App;
