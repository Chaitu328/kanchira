
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { userLogin, userRegister } from "../../services/api";
import toast from "react-hot-toast";

export default function LoginModal({ onClose }) {
  const navigate = useNavigate();
  const { login } = useApp();
  const [tab, setTab] = useState("login");
  const [showPwd, setShowPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [loginData, setLoginData] = useState({
    emailOrPhone: "",
    password: "",
  });
  const [regData, setRegData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginData.emailOrPhone || !loginData.password) {
      toast.error("All fields required");
      return;
    }
    setIsLoading(true);
    try {
      const res = await userLogin(loginData);
      const data = res?.data;

      if (data?.responseCode === 200) {
        // Store token
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);

        // Set user in context
        login({
          _id: data.userId,
          name: data.name,
          phone: data.phone,
          email: data.email,
        });

        toast.success("Login successful! 🎉");
        onClose();
      } else {
        toast.error(data?.message || "Login failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Login failed");
    }
    setIsLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (
      !regData.name ||
      !regData.email ||
      !regData.phone ||
      !regData.password
    ) {
      toast.error("All fields required");
      return;
    }
    if (!/^[a-zA-Z ]+$/.test(regData.name)) {
      toast.error("Name must contain only letters");
      return;
    }
    if (regData.phone.length !== 10) {
      toast.error("Enter a valid 10-digit phone number");
      return;
    }
    setIsLoading(true);
    try {
      const res = await userRegister(regData);
      if (res.data?.responseCode === 200) {
        toast.success("OTP sent to your mobile number!");
        localStorage.setItem("reg_phone", regData.phone);
        onClose();
        navigate("/OTP-verify");
      } else {
        toast.error(res.data?.message || "Registration failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed");
    }
    setIsLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="relative w-[350px] p-6 rounded-md
      bg-gradient-to-r from-[#c69a3b] via-[#d2ae4e] to-[#efdd7a]" onClick={(e) => e.stopPropagation()}>
        <button
          className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-2xl"
          onClick={onClose}
        >
          ×
        </button>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {["login", "register"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-semibold capitalize transition-colors ${
                tab === t
                  ? "text-[#800000] border-b-2 border-[#800000]"
                  : "text-gray-500"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Login Form */}
        {tab === "login" && (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              className="form-input"
              placeholder="Email or Phone"
              value={loginData.emailOrPhone}
              onChange={(e) =>
                setLoginData({ ...loginData, emailOrPhone: e.target.value })
              }
            />
            <div className="relative">
              <input
                className="form-input pr-10"
                type={showPwd ? "text" : "password"}
                placeholder="Password"
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
              />
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400"
                onClick={() => setShowPwd(!showPwd)}
              >
                <i className="material-icons text-lg">
                  {showPwd ? "visibility_off" : "visibility"}
                </i>
              </span>
            </div>
            <button className="btn-maroon" type="submit" disabled={isLoading}>
              {isLoading ? (
                <span
                  className="spinner-loader w-5 h-5 mx-auto"
                  style={{ width: 20, height: 20, borderWidth: 3 }}
                />
              ) : (
                "Login"
              )}
            </button>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span
                className="cursor-pointer hover:text-[#800000]"
                onClick={() => {
                  onClose();
                  navigate("/forgotpassword");
                }}
              >
                Forgot Password?
              </span>
              <span
                className="cursor-pointer hover:text-[#800000]"
                onClick={() => {
                  onClose();
                  navigate("/termsConditions");
                }}
              >
                Terms & Conditions
              </span>
            </div>
          </form>
        )}

        {/* Register Form */}
        {tab === "register" && (
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <input
              className="form-input"
              placeholder="Full Name"
              value={regData.name}
              onChange={(e) =>
                setRegData({
                  ...regData,
                  name: e.target.value.replace(/[^a-zA-Z ]/g, ""),
                })
              }
            />
            <input
              className="form-input"
              type="email"
              placeholder="Email"
              value={regData.email}
              onChange={(e) =>
                setRegData({ ...regData, email: e.target.value })
              }
            />
            <input
              className="form-input"
              type="tel"
              maxLength={10}
              placeholder="Phone Number"
              value={regData.phone}
              onChange={(e) =>
                setRegData({
                  ...regData,
                  phone: e.target.value.replace(/\D/g, ""),
                })
              }
            />
            <div className="relative">
              <input
                className="form-input pr-10"
                type={showPwd ? "text" : "password"}
                placeholder="Password"
                value={regData.password}
                onChange={(e) =>
                  setRegData({ ...regData, password: e.target.value })
                }
              />
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400"
                onClick={() => setShowPwd(!showPwd)}
              >
                <i className="material-icons text-lg">
                  {showPwd ? "visibility_off" : "visibility"}
                </i>
              </span>
            </div>
            <button className="btn-maroon" type="submit" disabled={isLoading}>
              {isLoading ? "Registering..." : "Register"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}