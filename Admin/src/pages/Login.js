
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loginAdmin, registerAdmin } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSuperAdminAuth } from '../context/SuperAdminAuthContext';
import { Spinner } from '../components/UI';
import logo from '../assets/logo1.png';

export default function Login() {
  const navigate = useNavigate();
  const { login }                                                    = useAuth();
  const { loginSuperAdminWithApi, registerSuperAdminWithApi,
          forgotSuperAdminPassword }                                  = useSuperAdminAuth();

  // ── Role tab: 'admin' | 'superadmin' ─────────────────────────
  const [role, setRole] = useState('admin');

  // ─────────────────────────────────────────────────────────────
  // ADMIN STATE
  // ─────────────────────────────────────────────────────────────
  const [form,        setForm]        = useState({ email: '', password: '' });
  const [errors,      setErrors]      = useState({});
  const [showPwd,     setShowPwd]     = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [showRegister,setShowRegister]= useState(false);
  const [regForm,     setRegForm]     = useState({ name: '', email: '', phone: '', password: '' });
  const [regLoading,  setRegLoading]  = useState(false);

  // ─────────────────────────────────────────────────────────────
  // SUPER ADMIN STATE
  // ─────────────────────────────────────────────────────────────
  const [saMode,       setSaMode]       = useState('login'); // 'login' | 'register' | 'forgot'
  const [saForm,       setSaForm]       = useState({ email: '', password: '' });
  const [saErrors,     setSaErrors]     = useState({});
  const [showSaPwd,    setShowSaPwd]    = useState(false);
  const [saLoading,    setSaLoading]    = useState(false);
  const [saRegForm,    setSaRegForm]    = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [saRegErrors,  setSaRegErrors]  = useState({});
  const [showSaRegPwd, setShowSaRegPwd] = useState(false);
  const [forgotEmail,  setForgotEmail]  = useState('');
  const [forgotSent,   setForgotSent]   = useState(false);

  // ─────────────────────────────────────────────────────────────
  // ADMIN HANDLERS
  // ─────────────────────────────────────────────────────────────
  const handleAdminLogin = async (ev) => {
    ev.preventDefault();
    const e = {};
    if (!form.email)    e.email    = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email.';
    if (!form.password) e.password = 'Password is required.';
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      const { data } = await loginAdmin(form);
      if (data.responseCode !== 200) { toast.error(data.error || 'Invalid credentials.'); return; }
      login(data);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch {
      toast.error('Invalid email/phone or password.');
    } finally { setLoading(false); }
  };

  const handleAdminRegister = async (ev) => {
    ev.preventDefault();
    if (!regForm.phone) { toast.error('Phone number is required.'); return; }
    setRegLoading(true);
    try {
      const { data } = await registerAdmin(regForm);
      if (data.responseCode === 201) {
        toast.success('Registered! You can now login.');
        setShowRegister(false);
        setRegForm({ name: '', email: '', phone: '', password: '' });
      } else {
        toast.error(data.message || 'Registration failed.');
      }
    } catch { toast.error('Registration failed. Please try again.'); }
    finally { setRegLoading(false); }
  };

  // ─────────────────────────────────────────────────────────────
  // SUPER ADMIN HANDLERS
  // ─────────────────────────────────────────────────────────────
  const handleSuperAdminLogin = async (ev) => {
    ev.preventDefault();
    const e = {};
    if (!saForm.email)    e.email    = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(saForm.email)) e.email = 'Enter a valid email.';
    if (!saForm.password) e.password = 'Password is required.';
    if (Object.keys(e).length) { setSaErrors(e); return; }
    setSaLoading(true);
    try {
      await loginSuperAdminWithApi(saForm);
      toast.success('Welcome, Super Admin!');
      navigate('/superadmin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials.');
    } finally { setSaLoading(false); }
  };

  const handleSuperAdminRegister = async (ev) => {
    ev.preventDefault();
    const e = {};
    if (!saRegForm.name)    e.name    = 'Full name is required.';
    if (!saRegForm.email)   e.email   = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(saRegForm.email)) e.email = 'Enter a valid email.';
    if (!saRegForm.password)  e.password = 'Password is required.';
    else if (saRegForm.password.length < 6) e.password = 'Minimum 6 characters.';
    if (saRegForm.password !== saRegForm.confirmPassword) e.confirmPassword = 'Passwords do not match.';
    if (Object.keys(e).length) { setSaRegErrors(e); return; }
    setSaLoading(true);
    try {
      await registerSuperAdminWithApi(saRegForm);
      toast.success('Super Admin registered! You can now login.');
      setSaMode('login');
      setSaRegForm({ name: '', email: '', password: '', confirmPassword: '' });
    } catch (err) {
      const errs = err.response?.data?.errors;
      if (Array.isArray(errs)) errs.forEach(msg => toast.error(msg));
      else if (err.response?.status === 409) toast.error('Email already exists.');
      else toast.error(err.response?.data?.message || 'Registration failed.');
    } finally { setSaLoading(false); }
  };

  const handleForgotPassword = async (ev) => {
    ev.preventDefault();
    if (!forgotEmail || !/\S+@\S+\.\S+/.test(forgotEmail)) {
      toast.error('Enter a valid email address.'); return;
    }
    setSaLoading(true);
    try {
      await forgotSuperAdminPassword(forgotEmail);
      setForgotSent(true);
      toast.success('OTP sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'No account found with this email.');
    } finally { setSaLoading(false); }
  };

  // ── Switch tab — reset all state ─────────────────────────────
  const switchRole = (newRole) => {
    setRole(newRole);
    setForm({ email: '', password: '' }); setSaForm({ email: '', password: '' });
    setErrors({}); setSaErrors({}); setSaRegErrors({});
    setShowPwd(false); setShowSaPwd(false); setShowSaRegPwd(false);
    setShowRegister(false); setSaMode('login');
    setForgotSent(false); setForgotEmail('');
  };

  // ─────────────────────────────────────────────────────────────
  // SHARED UI HELPERS
  // ─────────────────────────────────────────────────────────────
  const Err = ({ msg }) => msg ? <p className="text-red-500 text-xs mt-1">{msg}</p> : null;
  const EyeBtn = ({ show, onToggle }) => (
    <button type="button"
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 border-0 bg-transparent cursor-pointer"
      onClick={onToggle}>
      <i className={`fa ${show ? 'fa-eye' : 'fa-eye-slash'}`} />
    </button>
  );

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex items-center justify-center py-8"
      style={{ background: 'linear-gradient(135deg, #640101 0%, #810202 50%, #975607 100%)' }}
    >
      <div className="w-full max-w-sm mx-4">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-28 h-28 rounded-2xl flex items-center justify-center mx-auto mb-3 overflow-hidden">
            <img src={logo} alt="Kanchira Logo" className="w-full h-full object-cover rounded-2xl" />
          </div>
          <h1 className="text-white font-black text-3xl tracking-wide">KANCHIRA</h1>
          <p className="text-yellow-200 text-sm mt-1">
            {role === 'admin' ? 'Admin Dashboard' : 'Super Admin Portal'}
          </p>
        </div>

        {/* Role Tabs */}
        <div className="flex rounded-xl overflow-hidden mb-4 border-2 border-yellow-400">
          {['admin', 'superadmin'].map(r => (
            <button key={r} type="button"
              className="flex-1 py-2.5 text-sm font-bold transition-all"
              style={{ backgroundColor: role === r ? '#fbbf24' : 'transparent', color: role === r ? '#640101' : '#fde68a' }}
              onClick={() => switchRole(r)}>
              <i className={`fa ${r === 'admin' ? 'fa-user' : 'fa-shield'} mr-2`} />
              {r === 'admin' ? 'Admin' : 'Super Admin'}
            </button>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">

          {/* ══ ADMIN LOGIN ══ */}
          {role === 'admin' && !showRegister && (
            <>
              <h2 className="text-center text-xl font-bold mb-6" style={{ color: '#640101' }}>Admin Login</h2>
              <form onSubmit={handleAdminLogin} className="space-y-4" noValidate>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" className="kanchira-input" placeholder="admin@kanchira.com"
                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  <Err msg={errors.email} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <input type={showPwd ? 'text' : 'password'} className="kanchira-input pr-10" placeholder="••••••••"
                      value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                    <EyeBtn show={showPwd} onToggle={() => setShowPwd(s => !s)} />
                  </div>
                  <Err msg={errors.password} />
                </div>
                <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 py-2.5" disabled={loading}>
                  {loading ? <><Spinner /> Signing in...</> : 'Login'}
                </button>
              </form>
              <div className="text-right mt-3">
                <button className="text-sm text-green-700 hover:underline cursor-pointer border-0 bg-transparent"
                  onClick={() => setShowRegister(true)}>Register</button>
              </div>
            </>
          )}

          {/* ══ ADMIN REGISTER ══ */}
          {role === 'admin' && showRegister && (
            <>
              <h2 className="text-center text-xl font-bold mb-6" style={{ color: '#640101' }}>Register Admin</h2>
              <form onSubmit={handleAdminRegister} className="space-y-3">
                <input className="kanchira-input" placeholder="Full Name"
                  value={regForm.name} onChange={e => setRegForm({ ...regForm, name: e.target.value })} />
                <input type="email" className="kanchira-input" placeholder="Email"
                  value={regForm.email} onChange={e => setRegForm({ ...regForm, email: e.target.value })} />
                <input type="tel" className="kanchira-input" placeholder="Phone Number (required)"
                  value={regForm.phone} onChange={e => setRegForm({ ...regForm, phone: e.target.value })} required />
                <input type="password" className="kanchira-input" placeholder="Password"
                  value={regForm.password} onChange={e => setRegForm({ ...regForm, password: e.target.value })} required />
                <button type="submit" className="btn-success w-full flex items-center justify-center gap-2" disabled={regLoading}>
                  {regLoading ? <><Spinner /> Registering...</> : 'Register'}
                </button>
              </form>
              <div className="text-center mt-3">
                <button className="text-sm text-gray-500 hover:underline cursor-pointer border-0 bg-transparent"
                  onClick={() => setShowRegister(false)}>← Back to Login</button>
              </div>
            </>
          )}

          {/* ══ SUPER ADMIN LOGIN ══ */}
          {role === 'superadmin' && saMode === 'login' && (
            <>
              <div className="flex items-center gap-2 justify-center mb-5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#640101' }}>
                  <i className="fa fa-shield text-white text-sm" />
                </div>
                <h2 className="text-xl font-bold" style={{ color: '#640101' }}>Super Admin Login</h2>
              </div>
              <form onSubmit={handleSuperAdminLogin} className="space-y-4" noValidate>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" className="kanchira-input" placeholder="superadmin@kanchira.com"
                    value={saForm.email} onChange={e => setSaForm({ ...saForm, email: e.target.value })} />
                  <Err msg={saErrors.email} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <input type={showSaPwd ? 'text' : 'password'} className="kanchira-input pr-10" placeholder="••••••••"
                      value={saForm.password} onChange={e => setSaForm({ ...saForm, password: e.target.value })} />
                    <EyeBtn show={showSaPwd} onToggle={() => setShowSaPwd(s => !s)} />
                  </div>
                  <Err msg={saErrors.password} />
                </div>
                <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 py-2.5" disabled={saLoading}>
                  {saLoading ? <><Spinner /> Signing in...</> : '🔐 Login as Super Admin'}
                </button>
              </form>
              {/* Forgot + Register links */}
              <div className="text-center mt-4 space-y-2">
                <div>
                  <button className="text-sm hover:underline cursor-pointer border-0 bg-transparent" style={{ color: '#640101' }}
                    onClick={() => { setSaMode('forgot'); setForgotEmail(''); setForgotSent(false); }}>
                    Forgot Password?
                  </button>
                </div>
                <div>
                  <button className="text-sm hover:underline cursor-pointer border-0 bg-transparent" style={{ color: '#640101' }}
                    onClick={() => { setSaMode('register'); setSaRegErrors({}); }}>
                    Don't have an account? Register
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ══ SUPER ADMIN REGISTER ══ */}
          {role === 'superadmin' && saMode === 'register' && (
            <>
              <div className="flex items-center gap-2 justify-center mb-5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#640101' }}>
                  <i className="fa fa-shield text-white text-sm" />
                </div>
                <h2 className="text-xl font-bold" style={{ color: '#640101' }}>Register Super Admin</h2>
              </div>
              <form onSubmit={handleSuperAdminRegister} className="space-y-3" noValidate>
                <div>
                  <input className="kanchira-input" placeholder="Full Name"
                    value={saRegForm.name} onChange={e => setSaRegForm({ ...saRegForm, name: e.target.value })} />
                  <Err msg={saRegErrors.name} />
                </div>
                <div>
                  <input type="email" className="kanchira-input" placeholder="Email"
                    value={saRegForm.email} onChange={e => setSaRegForm({ ...saRegForm, email: e.target.value })} />
                  <Err msg={saRegErrors.email} />
                </div>
                <div>
                  <div className="relative">
                    <input type={showSaRegPwd ? 'text' : 'password'} className="kanchira-input pr-10" placeholder="Password"
                      value={saRegForm.password} onChange={e => setSaRegForm({ ...saRegForm, password: e.target.value })} />
                    <EyeBtn show={showSaRegPwd} onToggle={() => setShowSaRegPwd(s => !s)} />
                  </div>
                  <Err msg={saRegErrors.password} />
                </div>
                <div>
                  <input type={showSaRegPwd ? 'text' : 'password'} className="kanchira-input" placeholder="Confirm Password"
                    value={saRegForm.confirmPassword} onChange={e => setSaRegForm({ ...saRegForm, confirmPassword: e.target.value })} />
                  <Err msg={saRegErrors.confirmPassword} />
                </div>
                <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 py-2.5" disabled={saLoading}>
                  {saLoading ? <><Spinner /> Registering...</> : '📝 Register Super Admin'}
                </button>
              </form>
              <div className="text-center mt-3">
                <button className="text-sm text-gray-500 hover:underline cursor-pointer border-0 bg-transparent"
                  onClick={() => { setSaMode('login'); setSaRegErrors({}); }}>
                  Already have an account? Login
                </button>
              </div>
            </>
          )}

          {/* ══ SUPER ADMIN FORGOT PASSWORD ══ */}
          {role === 'superadmin' && saMode === 'forgot' && (
            <>
              {!forgotSent ? (
                <>
                  <div className="text-center mb-6">
                    <div className="text-5xl mb-3">📧</div>
                    <h2 className="text-xl font-bold mb-1" style={{ color: '#640101' }}>Forgot Password</h2>
                    <p className="text-gray-500 text-sm">
                      Enter your Super Admin email.<br />We'll send an OTP to reset your password.
                    </p>
                  </div>
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input type="email" className="kanchira-input" placeholder="superadmin@kanchira.com"
                        value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 py-2.5" disabled={saLoading}>
                      {saLoading ? <><Spinner /> Sending...</> : '📨 Send OTP'}
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="text-6xl mb-4">✅</div>
                  <h2 className="text-xl font-bold mb-2" style={{ color: '#640101' }}>OTP Sent!</h2>
                  <p className="text-gray-600 text-sm mb-2">A reset OTP has been sent to:</p>
                  <p className="font-bold text-sm mb-4" style={{ color: '#640101' }}>{forgotEmail}</p>
                  <p className="text-gray-500 text-xs">Check your inbox and use the OTP to reset your password.</p>
                </div>
              )}
              <div className="text-center mt-4">
                <button className="text-sm text-gray-500 hover:underline cursor-pointer border-0 bg-transparent"
                  onClick={() => { setSaMode('login'); setForgotSent(false); }}>
                  ← Back to Login
                </button>
              </div>
            </>
          )}

        </div>
        {/* end card */}

      </div>
    </div>
  );
}