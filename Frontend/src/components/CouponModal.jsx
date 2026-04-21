// ─── CouponModal ─────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react'
import { getCoupons } from '../services/api'
import toast from 'react-hot-toast'

export default function CouponModal({ onClose, onApply }) {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCoupons()
      .then(r => { setCoupons(r.data?.coupons || r.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <button className="absolute top-3 right-4 text-2xl text-gray-400" onClick={onClose}>×</button>
        <h3 className="text-lg font-bold mb-4">Available Coupons</h3>
        {loading ? <div className="spinner-loader" /> : (
          <div className="space-y-3">
            {coupons.length === 0 && <p className="text-gray-400 text-sm">No coupons available</p>}
            {coupons.map(c => (
              <div key={c._id} className="border border-dashed border-[#800000] rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#800000]">{c.code}</p>
                  <p className="text-xs text-gray-500">
                    {c.type === 'percentage' ? `${c.value}% OFF` : `₹${c.value} OFF`}
                    {c.expiryDate && ` · Expires ${new Date(c.expiryDate).toLocaleDateString()}`}
                  </p>
                </div>
                <button
                  className="text-sm border border-[#800000] text-[#800000] px-3 py-1 rounded-lg hover:bg-[#800000] hover:text-white transition-all"
                  onClick={() => { onApply?.(c.code); toast.success('Coupon applied!') }}>
                  Apply
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
