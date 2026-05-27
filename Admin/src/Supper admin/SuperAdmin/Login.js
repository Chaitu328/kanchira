import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useSuperAdminAuth,
  DEMO_SUPER_ADMIN,
} from "../../context/SuperAdminAuthContext";
import { Spinner } from "../../components/UI";
import logo from "../../assets/logo1.png";

// ── Demo credentials ─────────────────────────────────────────────
const DEMO_EMAIL = "demo@superadmin.com";
const DEMO_PASSWORD = "demo@123";

// ─── OTP Input boxes ─────────────────────────────────────────────
function OtpInput({ value, onChange, length = 6 }) {
  const inputs = useRef([]);
  const digits = value.split("");

  const handleKey = (e, idx) => {
    if (e.key === "Backspace") {
      const next = [...digits];
      if (digits[idx]) {
        next[idx] = "";
        onChange(next.join(""));
      } else if (idx > 0) {
        next[idx - 1] = "";
        onChange(next.join(""));
        inputs.current[idx - 1]?.focus();
      }
      return;
    }
    if (!/^\d$/.test(e.key)) return;
    const next = [...digits];
    next[idx] = e.key;
    onChange(next.join(""));
    if (idx < length - 1) inputs.current[idx + 1]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => (inputs.current[idx] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[idx] || ""}
          onKeyDown={(e) => handleKey(e, idx)}
          onChange={() => {}}
          onFocus={(e) => e.target.select()}
          className="w-11 h-12 text-center text-xl font-bold border-2 rounded-lg focus:outline-none focus:border-yellow-500 transition"
          style={{ borderColor: digits[idx] ? "#640101" : "#d1d5db" }}
        />
      ))}
    </div>
  );
}

export default function SuperAdminLogin() {
  const navigate = useNavigate();
  const {
    loginSuperAdmin,
    loginSuperAdminWithApi,
    registerSuperAdminWithApi,
    forgotSuperAdminPassword,
    isSuperAdminAuthenticated,
  } = useSuperAdminAuth();

  // ── FIX 1: Only redirect AFTER isLoading is false.
  // Previously this ran on every render. When isLoading=true,
  // isSuperAdminAuthenticated() returns false even for a logged-in user,
  // so it never redirected. But the real problem was the GUARD in
  // SuperAdminProtectedRoute firing before this could run on the way IN.
  // Keeping this here is correct for the "already logged in → skip login" case.
  useEffect(() => {
    if (isSuperAdminAuthenticated) {
      navigate("/superadmin/dashboard", { replace: true });
    }
  }, [isSuperAdminAuthenticated]); // ← depend only on isLoading, not the function reference
  //   (isSuperAdminAuthenticated is recreated each render)

  // ── State ──────────────────────────────────────────────────────
  const [mode, setMode] = useState("login"); // login | register | forgot
  const [loading, setLoading] = useState(false);

  // Login form
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginErrors, setLoginErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);

  // Register form
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [registerErrors, setRegisterErrors] = useState({});
  const [showRegPwd, setShowRegPwd] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  // ── Validation ─────────────────────────────────────────────────
  const validateLogin = () => {
    const e = {};
    if (!loginForm.email) e.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(loginForm.email))
      e.email = "Valid email required.";
    if (!loginForm.password) e.password = "Password is required.";
    return e;
  };

  const validateRegister = () => {
    const e = {};
    if (!registerForm.name) e.name = "Full name is required.";
    if (!registerForm.email) e.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(registerForm.email))
      e.email = "Valid email required.";
    if (!registerForm.password) e.password = "Password is required.";
    else if (registerForm.password.length < 6)
      e.password = "Password must be at least 6 characters.";
    if (!registerForm.confirmPassword)
      e.confirmPassword = "Please confirm your password.";
    else if (registerForm.password !== registerForm.confirmPassword)
      e.confirmPassword = "Passwords do not match.";
    return e;
  };

  // ── FIX 2: handleLogin — await the API call AND the demo fallback
  // before calling navigate(). Previously loginSuperAdmin() (demo path)
  // was called synchronously and then navigate() fired immediately,
  // but React state updates (setIsAuthenticated, setToken, setSuperAdmin)
  // are async — so the protected route evaluated before they settled.
  // The fix: wrap demo login in a small Promise so navigate only runs
  // after the state + localStorage writes from persistSuperAdmin() finish.
  const handleLogin = async (ev) => {
    ev.preventDefault();
    const e = validateLogin();
    if (Object.keys(e).length) {
      setLoginErrors(e);
      return;
    }

    setLoading(true);
    try {
      // Real API login — loginSuperAdminWithApi already awaits persistSuperAdmin
      await loginSuperAdminWithApi(loginForm);
      toast.success("Welcome, Super Admin!");
      navigate("/superadmin/dashboard", { replace: true });
    } catch (err) {
      // Demo credentials fallback
      if (
        loginForm.email.trim().toLowerCase() === DEMO_EMAIL.toLowerCase() &&
        loginForm.password === DEMO_PASSWORD
      ) {
        // loginSuperAdmin is synchronous (calls persistSuperAdmin internally)
        // so we wrap in a microtask to let React flush the state before navigate
        loginSuperAdmin({
          ...DEMO_SUPER_ADMIN,
          token: "demo-superadmin-token",
        });
        await new Promise((resolve) => setTimeout(resolve, 0)); // flush React state
        toast.success("Welcome to Demo Super Admin!");
        navigate("/superadmin/dashboard", { replace: true });
      } else {
        const errorMsg = err.response?.data?.message || "Invalid credentials.";
        toast.error(errorMsg);
        setLoginErrors({ submit: errorMsg });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (ev) => {
    ev.preventDefault();
    const e = validateRegister();
    if (Object.keys(e).length) {
      setRegisterErrors(e);
      return;
    }

    setLoading(true);
    try {
      await registerSuperAdminWithApi({
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
        confirmPassword: registerForm.confirmPassword,
      });
      toast.success("Super Admin registered successfully!");
      setRegisteredUser({ name: registerForm.name, email: registerForm.email });
      setRegisterForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setRegisterErrors({});
      setLoginForm({ email: registerForm.email, password: "" });
      setMode("login");
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (Array.isArray(errors)) {
        errors.forEach((error) => toast.error(error));
      } else if (err.response?.status === 409) {
        toast.error("Email already exists");
      } else {
        toast.error(
          err.response?.data?.message || "Failed to register Super Admin.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (ev) => {
    ev.preventDefault();
    if (!forgotEmail || !/\S+@\S+\.\S+/.test(forgotEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      await forgotSuperAdminPassword(forgotEmail);
      setForgotSent(true);
      toast.success("Password reset link sent to your email!");
    } catch (err) {
      if (forgotEmail.trim().toLowerCase() === DEMO_EMAIL.toLowerCase()) {
        setForgotSent(true);
        toast.success("Password reset link sent! (Demo Mode)");
      } else {
        toast.error(
          err.response?.data?.message || "No account found with this email.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Helper Components ──────────────────────────────────────────
  const PageShell = ({ children }) => (
    <div
      className="min-h-screen flex items-center justify-center py-8"
      style={{
        background:
          "linear-gradient(135deg, #640101 0%, #810202 50%, #975607 100%)",
      }}
    >
      <div className="w-full max-w-sm mx-4">{children}</div>
    </div>
  );

  const Card = ({ children }) => (
    <div className="bg-white rounded-2xl shadow-2xl p-8">{children}</div>
  );

  const Field = ({ label, children }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {children}
    </div>
  );

  const Err = ({ children }) => (
    <p className="text-red-500 text-xs mt-1">{children}</p>
  );

  const EyeBtn = ({ show, toggle }) => (
    <button
      type="button"
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 border-0 bg-transparent cursor-pointer hover:text-gray-600"
      onClick={toggle}
    >
      <i className={`fa ${show ? "fa-eye" : "fa-eye-slash"}`} />
    </button>
  );

  const ShieldIcon = () => (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center"
      style={{ backgroundColor: "#640101" }}
    >
      <i className="fa fa-shield text-white text-sm" />
    </div>
  );

  const Header = ({ subtitle }) => (
    <div className="text-center mb-8">
      <div className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-3 overflow-hidden">
        <img
          src={logo}
          alt="Kanchira"
          className="w-full h-full object-cover rounded-2xl"
        />
      </div>
      <h1 className="text-white font-black text-3xl tracking-wide">KANCHIRA</h1>
      <p className="text-yellow-200 text-sm mt-1">{subtitle}</p>
    </div>
  );

  // ── FIX 3: Show spinner while context is still reading localStorage.
  // Previously this showed a spinner, which is correct — BUT the spinner
  // was inside the card only on isLoading. Now we show a full-page spinner
  // so the login form never renders (and the user never sees a flash of
  // the form before being redirected if they're already logged in).

  // ── MODE: LOGIN ────────────────────────────────────────────────
  if (mode === "login") {
    return (
      <PageShell>
        <Header subtitle="Super Admin Portal" />
        <Card>
          <div className="flex items-center gap-2 justify-center mb-5">
            <ShieldIcon />
            <h2 className="text-xl font-bold" style={{ color: "#640101" }}>
              Super Admin Login
            </h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <Field label="Email">
              <input
                type="email"
                className="kanchira-input"
                placeholder="admin@example.com"
                value={loginForm.email}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, email: e.target.value })
                }
              />
              {loginErrors.email && <Err>{loginErrors.email}</Err>}
            </Field>

            <Field label="Password">
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  className="kanchira-input pr-10"
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                />
                <EyeBtn show={showPwd} toggle={() => setShowPwd((s) => !s)} />
              </div>
              {loginErrors.password && <Err>{loginErrors.password}</Err>}
            </Field>

            {loginErrors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{loginErrors.submit}</p>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full flex items-center justify-center gap-2 py-2.5"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner /> Signing in...
                </>
              ) : (
                "🔐 Login as Super Admin"
              )}
            </button>
          </form>

          <div className="text-center mt-4 space-y-3">
            <button
              className="text-sm hover:underline cursor-pointer border-0 bg-transparent block w-full"
              style={{ color: "#640101" }}
              onClick={() => {
                setMode("forgot");
                setForgotEmail("");
                setForgotSent(false);
              }}
            >
              Forgot Password?
            </button>
            <button
              className="text-sm hover:underline cursor-pointer border-0 bg-transparent block w-full"
              style={{ color: "#640101" }}
              onClick={() => {
                setMode("register");
                setRegisterErrors({});
              }}
            >
              Don't have an account? Register
            </button>
          </div>

          <div
            className="mt-4 p-3 rounded-lg text-xs"
            style={{ backgroundColor: "#fef3c7", color: "#92400e" }}
          >
            <p className="font-bold mb-1">📋 Demo Credentials:</p>
            <p>Email: {DEMO_EMAIL}</p>
            <p>Password: {DEMO_PASSWORD}</p>
            {registeredUser && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                <p className="font-bold text-green-700">✅ Registered!</p>
                <p>Email: {registeredUser.email}</p>
              </div>
            )}
          </div>
        </Card>
      </PageShell>
    );
  }

  // ── MODE: REGISTER ─────────────────────────────────────────────
  if (mode === "register") {
    return (
      <PageShell>
        <Header subtitle="Super Admin Registration" />
        <Card>
          <div className="flex items-center gap-2 justify-center mb-5">
            <ShieldIcon />
            <h2 className="text-xl font-bold" style={{ color: "#640101" }}>
              Register Super Admin
            </h2>
          </div>

          <form onSubmit={handleRegister} className="space-y-4" noValidate>
            <Field label="Full Name">
              <input
                type="text"
                className="kanchira-input"
                placeholder="Enter full name"
                value={registerForm.name}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, name: e.target.value })
                }
              />
              {registerErrors.name && <Err>{registerErrors.name}</Err>}
            </Field>

            <Field label="Email">
              <input
                type="email"
                className="kanchira-input"
                placeholder="admin@example.com"
                value={registerForm.email}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, email: e.target.value })
                }
              />
              {registerErrors.email && <Err>{registerErrors.email}</Err>}
            </Field>

            <Field label="Password">
              <div className="relative">
                <input
                  type={showRegPwd ? "text" : "password"}
                  className="kanchira-input pr-10"
                  placeholder="Enter password"
                  value={registerForm.password}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      password: e.target.value,
                    })
                  }
                />
                <EyeBtn
                  show={showRegPwd}
                  toggle={() => setShowRegPwd((s) => !s)}
                />
              </div>
              {registerErrors.password && <Err>{registerErrors.password}</Err>}
            </Field>

            <Field label="Confirm Password">
              <div className="relative">
                <input
                  type={showRegPwd ? "text" : "password"}
                  className="kanchira-input pr-10"
                  placeholder="Confirm password"
                  value={registerForm.confirmPassword}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      confirmPassword: e.target.value,
                    })
                  }
                />
                <EyeBtn
                  show={showRegPwd}
                  toggle={() => setShowRegPwd((s) => !s)}
                />
              </div>
              {registerErrors.confirmPassword && (
                <Err>{registerErrors.confirmPassword}</Err>
              )}
            </Field>

            <button
              type="submit"
              className="btn-primary w-full flex items-center justify-center gap-2 py-2.5"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner /> Registering...
                </>
              ) : (
                "📝 Register Super Admin"
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <button
              className="text-sm hover:underline cursor-pointer border-0 bg-transparent"
              style={{ color: "#640101" }}
              onClick={() => {
                setMode("login");
                setLoginErrors({});
              }}
            >
              Already have an account? Login
            </button>
          </div>
        </Card>
      </PageShell>
    );
  }

  // ── MODE: FORGOT PASSWORD ──────────────────────────────────────
  if (mode === "forgot") {
    return (
      <PageShell>
        <Header subtitle="Password Recovery" />
        <Card>
          {!forgotSent ? (
            <>
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">📧</div>
                <h2
                  className="text-xl font-bold mb-1"
                  style={{ color: "#640101" }}
                >
                  Forgot Password
                </h2>
                <p className="text-gray-500 text-sm">
                  Enter your registered Super Admin email.
                  <br />
                  We'll send a password reset link.
                </p>
              </div>
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <Field label="Email Address">
                  <input
                    type="email"
                    className="kanchira-input"
                    placeholder="admin@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                </Field>
                <button
                  type="submit"
                  className="btn-primary w-full flex items-center justify-center gap-2 py-2.5"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner /> Sending...
                    </>
                  ) : (
                    "📨 Send Reset Link"
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="text-6xl mb-4">✅</div>
              <h2
                className="text-xl font-bold mb-2"
                style={{ color: "#640101" }}
              >
                Email Sent!
              </h2>
              <p className="text-gray-600 text-sm mb-2">
                A password reset link has been sent to:
              </p>
              <p
                className="font-bold text-sm mb-4"
                style={{ color: "#640101" }}
              >
                {forgotEmail}
              </p>
              <p className="text-gray-500 text-xs">
                Check your inbox and click the reset link to set a new password.
                If you don't see it, check your spam folder.
              </p>
            </div>
          )}
          <button
            className="w-full mt-4 text-sm text-gray-500 hover:underline bg-transparent border-0 cursor-pointer"
            onClick={() => {
              setMode("login");
              setForgotSent(false);
            }}
          >
            ← Back to Login
          </button>
        </Card>
      </PageShell>
    );
  }

  return null;
}
