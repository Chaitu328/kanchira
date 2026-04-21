import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { verifyOtp, resendOtp } from "../services/api";
import toast from "react-hot-toast";

export default function OtpVerifyPage() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);
  const phone = localStorage.getItem("reg_phone") || "";

  const handleChange = (val, i) => {
    if (!/^\d*$/.test(val)) return;
    const updated = [...otp];
    updated[i] = val.slice(-1);
    setOtp(updated);
    if (val && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (e, i) => {
    if (e.key === "Backspace" && !otp[i] && i > 0)
      inputs.current[i - 1]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      toast.error("Enter 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const res = await verifyOtp({ phone, OTP: code });
      if (
        res.data?.responseCode === 200 ||
        res.data?.message?.toLowerCase().includes("success")
      ) {
        toast.success("OTP verified! Please login.");
        localStorage.removeItem("reg_phone");
        navigate("/home");
      } else {
        toast.error(res.data?.message || "Invalid OTP");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Verification failed");
    }
    setLoading(false);
  };

  const handleResend = async () => {
    try {
      await resendOtp({ phone });
      toast.success("OTP resent!");
    } catch {
      toast.error("Failed to resend OTP");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-2">Verify OTP</h2>
        <p>
          Enter the 6-digit OTP sent to <strong>{phone}</strong>
        </p>
        <div className="flex gap-2 justify-center mb-6">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className="otp-input"
            />
          ))}
        </div>
        <button
          className="btn-maroon mb-3"
          onClick={handleVerify}
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
        <button
          className="w-full text-center text-sm text-[#800000] hover:underline"
          onClick={handleResend}
        >
          Resend OTP
        </button>
      </div>
    </div>
  );
}