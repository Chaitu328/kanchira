import React, { createContext, useContext, useState } from "react";
import {
  superAdminLogin,
  superAdminRegister,
  superAdminForgotPassword,
  superAdminRefreshToken,
  superAdminGetProfile,
  superAdminLogout,
} from "../services/superAdminApi";

const SuperAdminAuthContext = createContext(null);

// ── localStorage keys ─────────────────────────────────────────────
const KEY_ADMIN = "superAdmin";
const KEY_TOKEN = "superAdminToken";
const KEY_REFRESH = "superAdminRefreshToken";

// ── Read localStorage synchronously (called once at module load) ──
const readToken = () => {
  try {
    return localStorage.getItem(KEY_TOKEN) || null;
  } catch {
    return null;
  }
};
const readAdmin = () => {
  try {
    const d = localStorage.getItem(KEY_ADMIN);
    return d ? JSON.parse(d) : null;
  } catch {
    return null;
  }
};

export const DEMO_SUPER_ADMIN = {
  id: 1,
  name: "Demo Super Admin",
  email: "demo@superadmin.com",
  role: "SUPERADMIN",
};

// ═══════════════════════════════════════════════════════════════
// PROVIDER — NO isLoading, NO useEffect for init
// State is seeded directly from localStorage on first render.
// ═══════════════════════════════════════════════════════════════
export function SuperAdminAuthProvider({ children }) {
  // ── Seed state synchronously from localStorage ────────────────
  const [token, setToken] = useState(() => readToken());
  const [superAdmin, setSuperAdmin] = useState(() => readAdmin());
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!(readToken() && readAdmin()),
  );

  // ── Persist to localStorage + state ──────────────────────────
  const persistSuperAdmin = (data, accessToken, refreshToken) => {
    if (!data || !accessToken) return;
    localStorage.setItem(KEY_ADMIN, JSON.stringify(data));
    localStorage.setItem(KEY_TOKEN, accessToken);
    if (refreshToken) localStorage.setItem(KEY_REFRESH, refreshToken);
    setSuperAdmin(data);
    setToken(accessToken);
    setIsAuthenticated(true);
  };

  // ── Login via API ─────────────────────────────────────────────
  const loginSuperAdminWithApi = async (credentials) => {
    const { data } = await superAdminLogin(credentials);
    const responseData = data?.data || data;
    const adminData =
      responseData?.superAdmin || responseData?.admin || responseData;
    const accessToken = responseData?.accessToken || responseData?.token;
    const refreshToken = responseData?.refreshToken;
    persistSuperAdmin(adminData, accessToken, refreshToken);
    return adminData;
  };

  // ── Login without API (demo) ──────────────────────────────────
  const loginSuperAdmin = (data, accessToken = "demo-token") => {
    persistSuperAdmin(data, accessToken);
  };

  // ── Register ──────────────────────────────────────────────────
  const registerSuperAdminWithApi = async (payload) => {
    const { data } = await superAdminRegister(payload);
    return data?.data || data;
  };

  // ── Forgot password ───────────────────────────────────────────
  const forgotSuperAdminPassword = async (email) => {
    const { data } = await superAdminForgotPassword(email);
    return data?.data || data;
  };

  // ── Refresh token ─────────────────────────────────────────────
  const refreshSuperAdminToken = async () => {
    const refreshTokenValue = localStorage.getItem(KEY_REFRESH);
    if (!refreshTokenValue) throw new Error("No refresh token");
    const { data } = await superAdminRefreshToken(refreshTokenValue);
    const auth = data?.data || data;
    const adminData = auth?.superAdmin || auth?.admin || auth;
    const accessToken = auth?.accessToken || auth?.token;
    persistSuperAdmin(adminData, accessToken, refreshTokenValue);
    return auth;
  };

  // ── Load profile ──────────────────────────────────────────────
  const loadSuperAdminProfile = async () => {
    const { data } = await superAdminGetProfile();
    const profile = data?.data || data;
    localStorage.setItem(KEY_ADMIN, JSON.stringify(profile));
    setSuperAdmin(profile);
    return profile;
  };

  // ── Logout ────────────────────────────────────────────────────
  const logoutSuperAdmin = async () => {
    try {
      if (token) await superAdminLogout();
    } catch {
      /* ignore */
    }
    localStorage.removeItem(KEY_ADMIN);
    localStorage.removeItem(KEY_TOKEN);
    localStorage.removeItem(KEY_REFRESH);
    setSuperAdmin(null);
    setToken(null);
    setIsAuthenticated(false);
  };

  // ── Auth check (plain boolean, no function) ───────────────────
  const isSuperAdminAuthenticated = isAuthenticated && !!token && !!superAdmin;
  const getSuperAdminToken = () => token;

  return (
    <SuperAdminAuthContext.Provider
      value={{
        superAdmin,
        token,
        isLoading: false, // always false — no async init
        isAuthenticated,
        isSuperAdminAuthenticated, // now a BOOLEAN, not a function
        loginSuperAdmin,
        loginSuperAdminWithApi,
        registerSuperAdminWithApi,
        forgotSuperAdminPassword,
        refreshSuperAdminToken,
        loadSuperAdminProfile,
        logoutSuperAdmin,
        getSuperAdminToken,
        logout: logoutSuperAdmin,
      }}
    >
      {children}
    </SuperAdminAuthContext.Provider>
  );
}

export const useSuperAdminAuth = () => {
  const context = useContext(SuperAdminAuthContext);
  if (!context)
    throw new Error(
      "useSuperAdminAuth must be used within SuperAdminAuthProvider",
    );
  return context;
};
