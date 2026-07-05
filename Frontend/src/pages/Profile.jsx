import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

const BASE_URL = "https://api.kanchira.com";

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, login } = useApp(); 

  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // ✅ Load user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  // ✅ SAVE PROFILE
  const handleSave = async () => {
    setError("");
    setSuccess("");

    // 🔴 Validation
    if (!formData.name || !formData.email || !formData.phone) {
      setError("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        userId: user?._id || user?.userId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      };

      console.log("📤 Sending Data:", payload);

     const res = await fetch(`${BASE_URL}/updateUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("📥 Response:", data);

    
        // ✅ Update context
       if (data.responseCode === 200) {
  login({
    ...user,
    name: data.user?.name,
    email: data.user?.email,
    phone: data.user?.phone,
  })
  setSuccess("Profile updated successfully!");
  setIsEdit(false);
}

      else {
        setError(data.message || "Update failed");
      }
    } catch (err) {
      console.error("❌ Error:", err);
      setError("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Logout
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="relative w-[350px] p-6 rounded-md bg-gradient-to-r from-[#c69a3b] via-[#d2ae4e] to-[#efdd7a]">

        {/* Close Profile */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-2 right-3 text-[#800000] text-2xl font-bold"
        >
          ×
        </button>

        <h2 className="text-xl font-bold text-[#800000] mb-4">
          Profile
        </h2>



        {!isEdit ? (
          <>
            {/* VIEW MODE */}
            <div className="space-y-2 text-[#3b1a00]">
              <p><b>Name:</b> {formData.name || "-"}</p>
              <p><b>Email:</b> {formData.email || "-"}</p>
              <p><b>Phone:</b> {formData.phone || "-"}</p>
            </div>

            <div className="flex justify-end mt-5">
              <button
                onClick={() => {
                  setIsEdit(true);
                  setError("");
                  setSuccess("");
                }}
                className="bg-yellow-200 px-4 py-1.5 rounded font-semibold text-[#800000] hover:bg-yellow-300 transition"
              >
                Edit
              </button>
            </div>
            {/* Messages below button */}
            {success && (
              <p className="text-green-700 text-sm mt-2 text-right font-medium">
                {success}
              </p>
            )}
            {error && (
              <p className="text-red-700 text-sm mt-2 text-right font-medium">
                {error}
              </p>
            )}
          </>
        ) : (
          <>
            {/* EDIT MODE */}
            <div className="space-y-2">
              <input
                className="w-full p-2 rounded border border-yellow-600 focus:outline-none"
                placeholder="Enter Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />

              <input
                className="w-full p-2 rounded border border-yellow-600 focus:outline-none"
                placeholder="Enter Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />

              <input
                className="w-full p-2 rounded border border-yellow-600 focus:outline-none"
                placeholder="Enter Phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setIsEdit(false);
                  setError("");
                }}
                className="px-3 py-1.5 rounded text-[#800000] font-semibold hover:underline"
                disabled={loading}
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={loading}
                className="bg-yellow-200 px-4 py-1.5 rounded font-semibold text-[#800000] hover:bg-yellow-300 transition disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
            {/* Messages below buttons */}
            {success && (
              <p className="text-green-700 text-sm mt-2 text-right font-medium">
                {success}
              </p>
            )}
            {error && (
              <p className="text-red-700 text-sm mt-2 text-right font-medium">
                {error}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}