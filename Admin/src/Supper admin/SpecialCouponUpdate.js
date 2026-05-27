
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSpecialCouponById, updateSpecialCoupon } from "../../api";
import { toast } from "react-toastify";

const SpecialCouponUpdate = () => {
  const { id } = useParams();
  const [form, setForm] = useState({
    description: "",
    discountValue: "",
    minOrderAmount: "",
    maxDiscountAmount: "",
    usageLimit: "",
    isActive: true,
    expiryDate: "",
  });
  const [original, setOriginal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCoupon();
  }, [id]);

  const fetchCoupon = async () => {
    try {
      const res = await getSpecialCouponById(id);
      const coupon = res.data.data.coupon;
      setOriginal(coupon);
      setForm({
        description: coupon.description || "",
        discountValue: coupon.discountValue || "",
        minOrderAmount: coupon.minOrderAmount || "",
        maxDiscountAmount: coupon.maxDiscountAmount || "",
        usageLimit: coupon.usageLimit || "",
        isActive: coupon.isActive,
        expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().slice(0, 16) : "",
      });
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load coupon";
      toast.error(msg);
      navigate("/superadmin/coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {};
      if (form.description) data.description = form.description;
      if (form.discountValue) data.discountValue = Number(form.discountValue);
      if (form.minOrderAmount !== "") data.minOrderAmount = Number(form.minOrderAmount);
      if (form.maxDiscountAmount !== "") data.maxDiscountAmount = Number(form.maxDiscountAmount);
      if (form.usageLimit) data.usageLimit = Number(form.usageLimit);
      data.isActive = form.isActive;
      if (form.expiryDate) data.expiryDate = new Date(form.expiryDate).toISOString();

      const res = await updateSpecialCoupon(id, data);
      if (res.data.success) {
        toast.success("Coupon updated successfully!");
        navigate("/superadmin/coupons");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update coupon";
      const errors = err.response?.data?.errors;
      if (errors && Array.isArray(errors)) {
        errors.forEach((error) => toast.error(error));
      } else {
        toast.error(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white transition";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-2";

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <span className="w-10 h-10 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </span>
          Update Coupon
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Editing: <span className="font-mono font-bold text-indigo-600">{original?.code}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
        {/* Original Info Card */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-lg font-mono font-bold">
              {original?.code}
            </div>
            <div>
              <p className="font-semibold text-gray-700">
                {original?.discountType === "percentage" ? `${original?.discountValue}%` : `₹${original?.discountValue}`} OFF
              </p>
              <p className="text-xs text-gray-500">
                Used: {original?.usedCount} / {original?.usageLimit}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Discount Value */}
          <div>
            <label className={labelClass}>Discount Value</label>
            <input
              type="number"
              name="discountValue"
              value={form.discountValue}
              onChange={handleChange}
              min={1}
              placeholder={original?.discountValue}
              className={inputClass}
            />
          </div>

          {/* Min Order Amount */}
          <div>
            <label className={labelClass}>Minimum Order Amount (₹)</label>
            <input
              type="number"
              name="minOrderAmount"
              value={form.minOrderAmount}
              onChange={handleChange}
              min={0}
              placeholder={original?.minOrderAmount}
              className={inputClass}
            />
          </div>

          {/* Max Discount Amount */}
          {original?.discountType === "percentage" && (
            <div>
              <label className={labelClass}>Maximum Discount Amount (₹)</label>
              <input
                type="number"
                name="maxDiscountAmount"
                value={form.maxDiscountAmount}
                onChange={handleChange}
                min={0}
                placeholder={original?.maxDiscountAmount}
                className={inputClass}
              />
            </div>
          )}

          {/* Usage Limit */}
          <div>
            <label className={labelClass}>Usage Limit</label>
            <input
              type="number"
              name="usageLimit"
              value={form.usageLimit}
              onChange={handleChange}
              min={1}
              placeholder={original?.usageLimit}
              className={inputClass}
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label className={labelClass}>Expiry Date</label>
            <input
              type="datetime-local"
              name="expiryDate"
              value={form.expiryDate}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          {/* Is Active */}
          <div className="flex items-center">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="text-sm font-semibold text-gray-700">Active</span>
            </label>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className={labelClass}>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            placeholder={original?.description}
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate("/superadmin/coupons")}
            className="px-6 py-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:from-blue-600 hover:to-cyan-600 transition disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
          >
            {saving ? (
              <><span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> Saving...</>
            ) : (
              <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Update Coupon</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SpecialCouponUpdate;

