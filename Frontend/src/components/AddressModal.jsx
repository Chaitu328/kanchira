import { useState, useEffect } from 'react'
import { addAddress, getAddress, deleteAddress } from '../services/api'
import { useApp } from '../context/AppContext'
import { statesData } from '../data/statesData'
import toast from 'react-hot-toast'

export default function AddressModal({ onClose, onSave }) {
  const { user } = useApp()
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [addingNew, setAddingNew] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    fullName: '',
    phoneNumber: '',
    houseNumber: '',
    currentAddress: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
  })
  const [saving, setSaving] = useState(false)

  // Fetch all saved addresses for user
  const fetchAddresses = () => {
    const userId = user?._id || user?.id
    if (!userId) {
      setLoading(false)
      return
    }
    setLoading(true)
    getAddress(userId)
      .then(res => {
        setAddresses(res.data?.address || [])
      })
      .catch(() => {
        toast.error('Failed to load saved addresses')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchAddresses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Handle state change for cascading dropdown
  const handleStateChange = (e) => {
    const selectedState = e.target.value
    setForm(prev => ({
      ...prev,
      state: selectedState,
      district: '', // Reset district when state changes
    }))
  }

  // Find districts for currently selected state
  const selectedStateObj = statesData.find(s => s.state === form.state)
  const districts = selectedStateObj ? selectedStateObj.districts : []

  const handleSave = async () => {
    setError('')
    setSuccess('')
    if (!form.fullName || !form.phoneNumber || !form.houseNumber || !form.currentAddress || !form.city || !form.district || !form.state || !form.pincode) {
      setError('Please fill all required fields')
      toast.error('Please fill all required fields')
      return
    }

    const payload = { ...form, userId: user?._id || user?.id }

    setSaving(true)
    addAddress(payload)
      .then((res) => {
        const savedAddr = res.data?.address || payload
        setSuccess('Address saved successfully!')
        toast.success('Address saved!')
        // Auto-select the newly added address
        onSave?.(savedAddr)
        setTimeout(() => {
          onClose?.()
        }, 800)
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || 'Address save failed'
        setError(msg)
        toast.error(msg)
      })
      .finally(() => setSaving(false))
  }

  const handleDelete = (id, e) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this address?')) return

    deleteAddress(id)
      .then(() => {
        toast.success('Address deleted')
        fetchAddresses()
      })
      .catch(() => {
        toast.error('Failed to delete address')
      })
  }

  return (
    <div className="modal-overlay z-[9999]">
      <div className="modal-box max-w-lg w-full">
        <button className="absolute top-3 right-4 text-2xl text-gray-400" onClick={onClose}>×</button>
        
        {loading ? (
          <div className="py-8 text-center text-gray-500">Loading addresses...</div>
        ) : !addingNew && addresses.length > 0 ? (
          // LIST MODE
          <div>
            <h3 className="text-lg font-bold mb-4 text-[#800000]">Select Delivery Address</h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto mb-4 pr-1">
              {addresses.map((addr) => (
                <div 
                  key={addr._id}
                  onClick={() => {
                    onSave?.(addr)
                    onClose?.()
                  }}
                  className="p-3 border border-gray-200 rounded-lg hover:border-[#800000] cursor-pointer bg-gray-50 hover:bg-orange-50/20 transition-all flex justify-between items-start"
                >
                  <div className="flex-1 text-sm text-[#3b1a00]">
                    <p className="font-bold">{addr.fullName} <span className="font-normal text-xs text-gray-500">({addr.phoneNumber})</span></p>
                    <p className="mt-1 text-xs text-gray-600">
                      {addr.houseNumber}, {addr.currentAddress}, {addr.city}, {addr.district}, {addr.state} — {addr.pincode}
                    </p>
                  </div>
                  <button 
                    onClick={(e) => handleDelete(addr._id, e)}
                    className="text-red-500 hover:text-red-700 text-xs font-semibold p-1 hover:bg-red-50 rounded"
                    title="Delete address"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 mt-4 pt-3 border-t">
              {addresses.length < 3 ? (
                <button 
                  type="button"
                  onClick={() => {
                    setError('')
                    setSuccess('')
                    setAddingNew(true)
                  }}
                  className="btn-maroon w-full py-2.5 rounded-lg text-sm font-semibold"
                >
                  + Add New Address
                </button>
              ) : (
                <p className="text-xs text-center text-red-600 font-medium">
                  Maximum of 3 addresses saved. Delete an address to add a new one.
                </p>
              )}
            </div>
          </div>
        ) : (
          // FORM MODE
          <div>
            <h3 className="text-lg font-bold mb-4 text-[#800000]">Add Delivery Address</h3>
            <div className="flex flex-col gap-3">
              <input
                className="form-input"
                placeholder="Full Name *"
                value={form.fullName}
                onChange={e => setForm({ ...form, fullName: e.target.value })}
              />
              <input
                className="form-input"
                placeholder="Phone Number *"
                value={form.phoneNumber}
                onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
              />
              <input
                className="form-input"
                placeholder="House / Flat No. *"
                value={form.houseNumber}
                onChange={e => setForm({ ...form, houseNumber: e.target.value })}
              />
              <input
                className="form-input"
                placeholder="Street / Area *"
                value={form.currentAddress}
                onChange={e => setForm({ ...form, currentAddress: e.target.value })}
              />
              <input
                className="form-input"
                placeholder="City *"
                value={form.city}
                onChange={e => setForm({ ...form, city: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-3">
                {/* State Dropdown */}
                <select
                  className="form-input bg-white cursor-pointer"
                  value={form.state}
                  onChange={handleStateChange}
                >
                  <option value="">Select State *</option>
                  {statesData.map(s => (
                    <option key={s.state} value={s.state}>{s.state}</option>
                  ))}
                </select>

                {/* District Dropdown */}
                <select
                  className="form-input bg-white cursor-pointer"
                  value={form.district}
                  onChange={e => setForm({ ...form, district: e.target.value })}
                  disabled={!form.state}
                >
                  <option value="">Select District *</option>
                  {districts.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <input
                className="form-input"
                placeholder="Pincode *"
                value={form.pincode}
                onChange={e => setForm({ ...form, pincode: e.target.value })}
              />

              <div className="mt-4">
                <button className="btn-maroon w-full py-2.5 rounded-lg text-sm font-semibold" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Address'}
                </button>
                {/* Error/Success Alert Displayed Directly Underneath Save Button */}
                {success && (
                  <p className="text-green-600 text-sm mt-2 text-center font-semibold">
                    {success}
                  </p>
                )}
                {error && (
                  <p className="text-red-600 text-sm mt-2 text-center font-semibold">
                    {error}
                  </p>
                )}
              </div>

              {addresses.length > 0 && (
                <button 
                  type="button" 
                  onClick={() => setAddingNew(false)}
                  className="text-gray-500 hover:text-gray-700 text-xs font-semibold text-center mt-2 underline"
                >
                  Back to saved addresses
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}