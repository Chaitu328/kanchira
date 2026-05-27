import React, { useEffect, useState } from "react";
import { useSuperAdminAuth } from "../../context/SuperAdminAuthContext";
import { superAdminGetProfile } from "../../services/superAdminApi";
import { toast } from "react-toastify";

const MAROON = "#640101";
const GOLD = "#D2AE4E";

export default function SuperAdminProfile() {
  const { superAdmin } = useSuperAdminAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await superAdminGetProfile();
        setProfile(data?.data || data);
      } catch {
        toast.error("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div
          className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent"
          style={{ borderColor: MAROON + "33", borderTopColor: MAROON }}
        />
      </div>
    );
  }

  const display = profile || superAdmin || {};

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div
        className="rounded-2xl p-6 mb-6 text-white text-center"
        style={{
          background: `linear-gradient(135deg, ${MAROON}, #810202, #975607)`,
        }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl font-bold"
          style={{ backgroundColor: GOLD, color: MAROON }}
        >
          {(display.name || "S")[0].toUpperCase()}
        </div>
        <h2 className="text-xl font-bold">{display.name || "Super Admin"}</h2>
        <p className="text-yellow-200 text-sm mt-1">{display.email || ""}</p>
        <span
          className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold"
          style={{ backgroundColor: GOLD, color: MAROON }}
        >
          {(display.role || "superadmin").toUpperCase()}
        </span>
      </div>
      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <h3
          className="text-sm font-bold uppercase tracking-wider"
          style={{ color: MAROON }}
        >
          Profile Details
        </h3>
        {[
          { label: "Name", value: display.name },
          { label: "Email", value: display.email },
          { label: "Role", value: display.role || "superadmin" },
          { label: "User ID", value: display._id || display.id },
          {
            label: "Joined",
            value: display.createdAt
              ? new Date(display.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "—",
          },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">
              {label}
            </p>
            <p className="text-sm font-semibold text-gray-700 font-mono">
              {value || "—"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
