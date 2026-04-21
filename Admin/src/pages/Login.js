import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loginAdmin, registerAdmin } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/UI';
import logo from '../assets/logo1.png';


export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [regForm, setRegForm] = useState({ name: '', email: '', password: '' });
  const [regLoading, setRegLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Please enter a valid email.';
    if (!form.password) e.password = 'Password is required.';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      const { data } = await loginAdmin(form);
      login(data);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch {
      toast.error('Invalid email or password.');
    } finally { setLoading(false); }
  };

  const handleRegister = async (ev) => {
    ev.preventDefault();
    setRegLoading(true);
    try {
      await registerAdmin(regForm);
      toast.success('Registration successful! You can now login.');
      setShowRegister(false);
      setRegForm({ name: '', email: '', password: '' });
    } catch {
      toast.error('Registration failed. Please try again.');
    } finally { setRegLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #640101 0%, #810202 50%, #975607 100%)' }}>
      <div className="w-full max-w-sm mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
  <div className="w-32 h-32 rounded-2xl flex items-center justify-center mx-auto mb-3">
  <img
    src={logo}
    alt="Kanchira Logo"
    className="w-full h-full object-cover rounded-2xl"
  />
</div>

  <h1 className="text-white font-black text-3xl tracking-wide">KANCHIRA</h1>
  <p className="text-yellow-200 text-sm mt-1">Admin Dashboard</p>
</div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-center text-xl font-bold mb-6" style={{ color: '#640101' }}>Admin Login</h2>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="kanchira-input"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                onBlur={() => setErrors(validate())}
                placeholder="admin@kanchira.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="kanchira-input pr-10"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 border-0 bg-transparent cursor-pointer" onClick={() => setShowPwd(s => !s)}>
                  <i className={`fa ${showPwd ? 'fa-eye' : 'fa-eye-slash'}`} />
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 py-2.5" disabled={loading}>
              {loading ? <><Spinner /> Signing in...</> : 'Login'}
            </button>
          </form>

          <div className="text-right mt-3">
            <button className="text-sm text-green-700 hover:underline cursor-pointer border-0 bg-transparent" onClick={() => setShowRegister(s => !s)}>
              {showRegister ? 'Back to Login' : 'Register'}
            </button>
          </div>

          {showRegister && (
            <div className="mt-5 pt-5 border-t border-gray-100">
              <h3 className="text-center font-semibold mb-4" style={{ color: '#640101' }}>Register Admin</h3>
              <form onSubmit={handleRegister} className="space-y-3">
                <input className="kanchira-input" placeholder="Full Name" value={regForm.name} onChange={e => setRegForm({ ...regForm, name: e.target.value })} required />
                <input type="email" className="kanchira-input" placeholder="Email" value={regForm.email} onChange={e => setRegForm({ ...regForm, email: e.target.value })} required />
                <input type="password" className="kanchira-input" placeholder="Password" value={regForm.password} onChange={e => setRegForm({ ...regForm, password: e.target.value })} required />
                <button type="submit" className="btn-success w-full flex items-center justify-center gap-2" disabled={regLoading}>
                  {regLoading ? <><Spinner /> Registering...</> : 'Register'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
