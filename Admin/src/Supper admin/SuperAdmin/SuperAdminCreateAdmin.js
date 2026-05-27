import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { superAdminRegister } from "../../services/superAdminApi";
import { toast } from "react-toastify";

const SuperAdminCreateAdmin = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await superAdminRegister(form);
      if (res.data.success) {
        toast.success("New Super Admin created successfully!");
        setForm({ name: "", email: "", password: "" });
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create admin";
      const errors = err.response?.data?.errors;
      if (errors && Array.isArray(errors)) {
        errors.forEach((error) => toast.error(error));
      } else if (err.response?.status === 409) {
        toast.error("Super Admin with this email already exists");
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <span className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </span>
          Create Super Admin
        </h2>
        <p className="text-gray-500 text-sm mt-1">Register a new super admin account with full privileges.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-yellow-700">New super admins will have full access to all special coupon routes and super admin features.</p>
        </div>

        {[
          { label: "Full Name *", name: "name", type: "text", placeholder: "John Doe" },
          { label: "Email *",     name: "email", type: "email", placeholder: "admin@example.com" },
          { label: "Password *",  name: "password", type: "password", placeholder: "Min 6 characters" },
        ].map(({ label, name, type, placeholder }) => (
          <div key={name}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
            <input
              type={type}
              name={name}
              value={form[name]}
              onChange={handleChange}
              required
              minLength={name === "password" ? 6 : undefined}
              placeholder={placeholder}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white transition"
            />
          </div>
        ))}

        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button type="button" onClick={() => navigate("/superadmin/dashboard")}
            className="px-6 py-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition font-medium">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 px-6 py-2.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:from-green-600 hover:to-emerald-600 transition disabled:opacity-50 shadow-lg flex items-center justify-center gap-2">
            {loading
              ? <><span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> Creating...</>
              : <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg> Create Super Admin
                </>
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default SuperAdminCreateAdmin;
