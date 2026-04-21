


import { useState } from 'react'
import { addAddress } from '../services/api'
import { useApp } from '../context/AppContext'
import toast from 'react-hot-toast'

export default function AddressModal({ onClose, onSave }) {
  const { user } = useApp()
  const [form, setForm] = useState({
    fullName: '',
    phoneNumber: '',     // ✅ was "phone" — backend requires "phoneNumber"
    houseNumber: '',     // ✅ was missing
    currentAddress: '',  // ✅ was "street"
    city: '',
    district: '',        // ✅ was missing — backend requires it
    state: '',
    pincode: '',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!form.fullName || !form.phoneNumber || !form.houseNumber || !form.currentAddress || !form.city || !form.district || !form.state || !form.pincode) {
      toast.error('Please fill all required fields')
      return
    }

    const payload = { ...form, userId: user?._id || user?.id }

    setSaving(true)
    onSave?.(form)
    onClose?.()

    addAddress(payload)
      .then(() => toast.success('Address saved!'))
      .catch(() => toast.error('Address save failed (saved locally)'))
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <button className="absolute top-3 right-4 text-2xl text-gray-400" onClick={onClose}>×</button>
        <h3 className="text-lg font-bold mb-4">Add Delivery Address</h3>
        <div className="flex flex-col gap-3">
          {[
            { key: 'fullName',       placeholder: 'Full Name *' },
            { key: 'phoneNumber',    placeholder: 'Phone Number *' },
            { key: 'houseNumber',    placeholder: 'House / Flat No. *' },
            { key: 'currentAddress', placeholder: 'Street / Area *' },
            { key: 'city',           placeholder: 'City *' },
            { key: 'district',       placeholder: 'District *' },
            { key: 'state',          placeholder: 'State *' },
            { key: 'pincode',        placeholder: 'Pincode *' },
          ].map(f => (
            <input
              key={f.key}
              className="form-input"
              placeholder={f.placeholder}
              value={form[f.key]}
              onChange={e => setForm({ ...form, [f.key]: e.target.value })}
            />
          ))}
          <button className="btn-maroon" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Address'}
          </button>
        </div>
      </div>
    </div>
  )
}