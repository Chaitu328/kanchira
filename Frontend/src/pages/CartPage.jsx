
import { useEffect, useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import { useApp } from '../context/AppContext'
import {
  getCart,
  updateCartQuantity,
  removeItemCart,
  getAddress,
  getCouponByCode,
} from '../services/api'

import AddressModal from '../components/AddressModal'
import CouponModal from '../components/CouponModal'
import emptyCartImg from '../assets/images/short_anim.png'

// ─── Constants ────────────────────────────────────────────────────────────────
const GUEST_CART_KEY   = 'guestCart'
const SPIN_DISCOUNT_KEY = 'checkout_spin_discount'
const COUPON_CODE_KEY   = 'checkout_coupon_code'

// ─── Guest-cart helpers ────────────────────────────────────────────────────────
const readGuestCart = () => {
  try { return JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]') } catch { return [] }
}
const writeGuestCart = (items) => {
  try { localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items)) } catch {}
}

// ─── Spin-discount helper ──────────────────────────────────────────────────────
const readSpinDiscount = () => {
  try {
    const s = localStorage.getItem(SPIN_DISCOUNT_KEY)
    return s ? JSON.parse(s) : null
  } catch { return null }
}

// ─── Resolve userId from various shapes ───────────────────────────────────────
const resolveUserId = (user) => {
  if (!user) return null
  if (typeof user === 'string') return user
  return user._id || user.userId || null
}

// ─── Best available image for a cart item ─────────────────────────────────────
// Priority: stored `image` → productId.image (top-level thumbnail) → variant image
const resolveImage = (item) => {
  if (item?.image) return item.image
  const product = item?.productId
  if (!product || typeof product !== 'object') return ''
  if (product.image) return product.image
  // Try to find the matching variant's first image
  const variant = product.variants?.find(
    (v) => v.color === item?.variant?.color,
  )
  return variant?.images?.[0]?.url || product.variants?.[0]?.images?.[0]?.url || ''
}

// ─────────────────────────────────────────────────────────────────────────────
export default function CartPage() {
  const navigate = useNavigate()
  const { user, setCartItems: setGlobalCartCount, setLoginModalOpen } = useApp()

  const userId = resolveUserId(user)

  // ── Local cart items — initialised directly from localStorage for guests ──
  // This avoids the "empty flash on refresh" because the value is available
  // synchronously on the first render.
  const [items, setItems] = useState(() => (userId ? [] : readGuestCart()))

  const [address,          setAddress]          = useState(null)
  const [couponCode,       setCouponCode]       = useState('')
  const [couponApplied,    setCouponApplied]    = useState(false)
  const [couponDiscount,   setCouponDiscount]   = useState(0)
  const [couponType,       setCouponType]       = useState('')
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [showCouponModal,  setShowCouponModal]  = useState(false)
  const [loading,          setLoading]          = useState(false)

  // Spin discount is read-only (won on Home page)
  const [spinDiscount] = useState(() => readSpinDiscount())
  const spinDiscountApplied = !!spinDiscount

  useEffect(() => { window.scrollTo(0, 0) }, [])

  // ── Load cart ─────────────────────────────────────────────────────────────
  const loadCart = useCallback(() => {
    if (!userId) {
      // GUEST: read from localStorage (already done as initial state, but
      // re-read here so it stays in sync if something else writes to it)
      const guestItems = readGuestCart()
      setItems(guestItems)
      setGlobalCartCount(guestItems) // keep badge in sync
      return
    }

    setLoading(true)
    getCart(userId)
      .then((res) => {
        // Backend: { data: { cart: { items: [...populated...] } } }
        const serverItems = res?.data?.cart?.items || []
        setItems(serverItems)
        setGlobalCartCount(serverItems)
      })
      .catch(() => toast.error('Failed to load cart'))
      .finally(() => setLoading(false))
  }, [userId, setGlobalCartCount])

  const loadAddress = useCallback(() => {
    if (!userId) return
    getAddress(userId)
      .then((res) => {
        const list = res?.data?.address || []
        if (list.length > 0) setAddress(list[0])
      })
      .catch(() => {})
  }, [userId])

  useEffect(() => {
    loadCart()
    loadAddress()
  }, [loadCart, loadAddress])

  // ── Normalise raw items into display lines ────────────────────────────────
  const lines = useMemo(() => {
    return items.map((item, index) => {
      const product  = (typeof item?.productId === 'object' ? item.productId : null) || {}
      const name     = product?.name   || item?.name  || 'Product'
      const image    = resolveImage(item)
      const qty      = Number(item?.quantity) || 1

      // Price stored in variant at add-to-cart time
      const mrp      = Number(item?.variant?.price ?? 0)
      const discount = Number(item?.variant?.discountPercentage ?? 0)
      const price    = discount > 0 ? Math.round(mrp - (mrp * discount) / 100) : mrp

      const size     = item?.variant?.size
      const color    = item?.variant?.color

      return { index, item, name, image, qty, price, mrp, discount, size, color }
    })
  }, [items])

  // ── Quantity update ───────────────────────────────────────────────────────
  const updateQty = async (index, delta) => {
    const line   = lines[index]
    if (!line) return
    const newQty = line.qty + delta
    if (newQty < 1) return

    if (!userId) {
      // Guest path
      const updated = readGuestCart().map((it, i) =>
        i === index ? { ...it, quantity: newQty } : it,
      )
      writeGuestCart(updated)
      setItems(updated)
      setGlobalCartCount(updated)
      return
    }

    // Optimistic
    setItems((prev) => {
      const arr = [...prev]
      if (arr[index]) arr[index] = { ...arr[index], quantity: newQty }
      return arr
    })

    try {
      const raw       = line.item
      // productId may be a populated object or a plain ID string
      const productId = raw?.productId?._id || raw?.productId || ''
      await updateCartQuantity({ userId, productId, variant: raw?.variant || {}, quantity: newQty })
    } catch {
      toast.error('Failed to update quantity')
      loadCart() // revert
    }
  }

  // ── Remove item ───────────────────────────────────────────────────────────
  const removeItem = async (index) => {
    if (!userId) {
      const updated = readGuestCart().filter((_, i) => i !== index)
      writeGuestCart(updated)
      setItems(updated)
      setGlobalCartCount(updated)
      toast.success('Item removed')
      return
    }

    const raw       = lines[index]?.item
    const productId = raw?.productId?._id || raw?.productId || ''

    // Optimistic
    setItems((prev) => prev.filter((_, i) => i !== index))
    toast.success('Item removed')

    try {
      await removeItemCart({ userId, productId, variant: raw?.variant || {} })
    } catch {
      loadCart() // revert
    }
  }

  // ── Totals ────────────────────────────────────────────────────────────────
  const subtotal       = useMemo(() => lines.reduce((s, l) => s + l.price * l.qty, 0), [lines])
  const totalMRP       = useMemo(() => lines.reduce((s, l) => s + l.mrp   * l.qty, 0), [lines])
  const totalQty       = useMemo(() => lines.reduce((s, l) => s + l.qty,            0), [lines])
  const productDiscount = totalMRP - subtotal

  const couponDiscountAmt = couponApplied
    ? couponType === 'percentage'
      ? Math.round((subtotal * couponDiscount) / 100)
      : couponDiscount
    : 0

  const spinDiscountAmt = spinDiscountApplied && spinDiscount
    ? Math.round((subtotal * spinDiscount.value) / 100)
    : 0

  const activeDiscountAmt = spinDiscountApplied ? spinDiscountAmt : couponDiscountAmt
  const totalPrice        = Math.max(0, subtotal - activeDiscountAmt)

  // ── Coupon helpers ────────────────────────────────────────────────────────
  const applyCouponCode = async (rawCode) => {
    if (spinDiscountApplied) {
      toast.error('Remove your spin discount first before applying a coupon.')
      return
    }
    const code = String(rawCode || '').trim()
    if (!code) return
    try {
      const res = await getCouponByCode(code)
      const c   = res.data?.coupon || res.data
      if (c && new Date(c.expiryDate) >= new Date()) {
        setCouponApplied(true)
        setCouponType(c.type)
        setCouponDiscount(c.value)
        setCouponCode(code)
        try { localStorage.setItem(COUPON_CODE_KEY, code) } catch {}
        toast.success(
          `Coupon applied! ${c.type === 'percentage' ? c.value + '%' : '₹' + c.value} off`,
        )
      } else {
        toast.error('Invalid or expired coupon')
      }
    } catch {
      toast.error('Coupon not found')
    }
  }

  const removeCoupon = () => {
    setCouponApplied(false)
    setCouponDiscount(0)
    setCouponType('')
    setCouponCode('')
    try { localStorage.removeItem(COUPON_CODE_KEY) } catch {}
    toast.success('Coupon removed')
  }

  const removeSpinDiscount = () => {
    localStorage.removeItem(SPIN_DISCOUNT_KEY)
    toast.success('Spin discount removed')
    window.location.reload()
  }

  // ── Place order ───────────────────────────────────────────────────────────
  const handlePlaceOrder = () => {
    if (!userId) { setLoginModalOpen(true); return }
    if (lines.length === 0) { toast.error('Your cart is empty'); return }
    navigate('/payment?mode=cart&step=cart', {
      state: {
        address,
        couponCode:      couponApplied && !spinDiscountApplied ? couponCode    : null,
        couponDiscount:  couponApplied && !spinDiscountApplied ? couponDiscountAmt : 0,
        spinDiscount:    spinDiscountApplied ? spinDiscount    : null,
        spinDiscountAmt: spinDiscountApplied ? spinDiscountAmt : 0,
      },
    })
  }

  const isCartEmpty = lines.length === 0

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white px-4">
      <div className="mx-auto w-full max-w-6xl">

        {/* Address bar */}
        <div className="checkout-topbar">
          <span className="label">
            {userId ? 'Delivering to' : 'Sign in to checkout'}
          </span>
          {userId && (
            <button
              type="button"
              className="action-btn"
              onClick={() => setShowAddressModal(true)}
            >
              {address ? 'Change Address' : 'Add Address'}
            </button>
          )}
        </div>

        {address && (
          <p className="text-xs text-gray-500 pb-2 px-1">
            {[address.houseNumber, address.currentAddress, address.city,
              address.district, address.state, address.pincode]
              .filter(Boolean).join(', ')}
          </p>
        )}

        <div className="checkout-rule" />

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-[#800000] border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-400 text-sm">Loading your cart…</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-6">

            {/* ── Cart items ──────────────────────────────────────────── */}
            <div className="lg:col-span-7">
              {isCartEmpty ? (
                <div className="flex flex-col items-center gap-4 text-center py-12">
                  <img src={emptyCartImg} alt="Empty cart" className="w-48 opacity-70" />
                  <p className="text-gray-500 text-sm">
                    {userId
                      ? "You don't have any items in your cart."
                      : 'Your cart is empty. Add items to continue.'}
                  </p>
                  {!userId && (
                    <button
                      type="button"
                      className="bg-[#800000] text-white px-6 py-2 rounded-lg text-sm"
                      onClick={() => setLoginModalOpen(true)}
                    >
                      Sign In
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {lines.map((line) => (
                    <div
                      key={line.index}
                      className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4"
                    >
                      {/* Image */}
                      <div className="w-24 h-24 bg-gray-50 rounded-lg border border-gray-100 overflow-hidden flex-shrink-0">
                        {line.image ? (
                          <img
                            src={line.image}
                            alt={line.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full grid place-items-center text-xs text-gray-400">
                            No image
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold capitalize line-clamp-2 text-sm">{line.name}</p>

                        <div className="text-xs text-gray-500 mt-1 flex gap-3 flex-wrap">
                          {line.size  && <span>Size: <strong>{line.size}</strong></span>}
                          {line.color && (
                            <span>Color: <strong className="capitalize">{line.color}</strong></span>
                          )}
                          {line.discount > 0 && (
                            <span className="text-green-600 font-medium">{line.discount}% off</span>
                          )}
                        </div>

                        {/* Price row */}
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="font-bold text-sm">
                            ₹{Math.round(line.price * line.qty).toLocaleString('en-IN')}
                          </span>
                          {line.mrp > line.price && (
                            <span className="text-xs text-gray-400 line-through">
                              ₹{Math.round(line.mrp * line.qty).toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>

                        {/* Qty + remove */}
                        <div className="mt-3 flex items-center gap-3">
                          <button
                            className="w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-50 text-lg leading-none disabled:opacity-40"
                            onClick={() => updateQty(line.index, -1)}
                            disabled={line.qty <= 1}
                          >−</button>
                          <span className="min-w-[1.5rem] text-center text-sm font-medium">
                            {line.qty}
                          </span>
                          <button
                            className="w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-50 text-lg leading-none"
                            onClick={() => updateQty(line.index, 1)}
                          >+</button>

                          <button
                            className="ml-auto text-xs text-red-500 hover:underline"
                            onClick={() => removeItem(line.index)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Order Summary ────────────────────────────────────────── */}
            <div className="lg:col-span-5">
              <div className="checkout-order-card p-6 lg:sticky lg:top-24">
                <div className="checkout-order-title mb-4">Order Details</div>

                <div className="space-y-2 text-sm">
                  <div className="checkout-row">
                    <span className="muted">MRP Total ({totalQty} items)</span>
                    <span>₹{Math.round(totalMRP).toLocaleString('en-IN')}</span>
                  </div>
                  {productDiscount > 0 && (
                    <div className="checkout-row text-green-700">
                      <span className="muted">Product Discount</span>
                      <span>− ₹{Math.round(productDiscount).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="checkout-row">
                    <span className="muted">Delivery fee</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="checkout-row">
                    <span className="muted">Platform fee</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  {couponApplied && !spinDiscountApplied && (
                    <div className="checkout-row text-green-700">
                      <span className="muted">Coupon ({couponCode})</span>
                      <span>− ₹{Math.round(couponDiscountAmt).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {spinDiscountApplied && (
                    <div className="checkout-row text-green-700">
                      <span className="muted">Spin discount ({spinDiscount.label})</span>
                      <span>− ₹{Math.round(spinDiscountAmt).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 checkout-pill-warning text-xs">
                  ℹ️ Only one discount can be applied at a time
                </div>

                {/* Spin box */}
                {spinDiscountApplied ? (
                  <div className="mt-4 bg-green-50 border-2 border-green-400 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🎉</span>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-green-700">
                          Spin Discount Active! ({spinDiscount.label})
                        </div>
                        <div className="text-xs text-green-600 mt-0.5">
                          You save ₹{Math.round(spinDiscountAmt).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="mt-2 text-xs text-red-500 hover:underline"
                      onClick={removeSpinDiscount}
                    >
                      Remove spin discount
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 bg-yellow-50 border border-yellow-300 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🎡</span>
                      <div>
                        <div className="text-sm font-bold text-[#800000]">No Spin Discount</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          Go to the Home page to spin the wheel and win a discount!
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Coupon box */}
                <div
                  className="mt-4 rounded-lg border p-3 cursor-pointer transition-colors"
                  style={{
                    opacity: spinDiscountApplied ? 0.5 : 1,
                    cursor:  spinDiscountApplied ? 'not-allowed' : 'pointer',
                    borderColor: couponApplied && !spinDiscountApplied ? '#16a34a' : '#e5e7eb',
                    backgroundColor: couponApplied && !spinDiscountApplied ? '#f0fdf4' : '#fafafa',
                  }}
                  onClick={() => !spinDiscountApplied && setShowCouponModal(true)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !spinDiscountApplied) setShowCouponModal(true)
                  }}
                >
                  <div className="text-sm font-bold text-[#800000]">🎟️ Apply Coupon</div>
                  {couponApplied && !spinDiscountApplied ? (
                    <div className="mt-1 text-xs text-gray-600">
                      Applied: <span className="font-semibold">{couponCode}</span>{' '}
                      <span className="text-green-700">
                        ({couponType === 'percentage' ? `${couponDiscount}% off` : `₹${couponDiscount} off`})
                      </span>
                    </div>
                  ) : spinDiscountApplied ? (
                    <div className="mt-1 text-xs text-gray-400">Disabled — spin discount is active</div>
                  ) : (
                    <div className="mt-1 text-xs text-gray-500">Tap to view &amp; apply available coupons</div>
                  )}
                </div>

                {couponApplied && !spinDiscountApplied && (
                  <button
                    type="button"
                    className="mt-2 text-xs text-red-500 hover:underline"
                    onClick={removeCoupon}
                  >
                    Remove Coupon
                  </button>
                )}

                {/* Total */}
                <div className="mt-5 flex items-center justify-between bg-[#800000]/5 rounded-lg px-4 py-3">
                  <span className="font-semibold text-sm">Total Amount</span>
                  <div className="text-right">
                    <span className="font-bold text-lg text-[#800000]">
                      ₹{Math.round(totalPrice).toLocaleString('en-IN')}
                    </span>
                    {totalMRP > totalPrice && (
                      <p className="text-xs text-green-600">
                        You save ₹{Math.round(totalMRP - totalPrice).toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isCartEmpty}
                  onClick={handlePlaceOrder}
                  className={`mt-4 w-full py-3 rounded-lg font-semibold text-black bg-yellow-400 text-sm tracking-wide ${
                  isCartEmpty 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-yellow-500 active:bg-yellow-600'
                    }`}
                >
                  {userId ? 'PLACE ORDER' :
                   ' PLACE ORDER'}
                  

                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddressModal && (
        <AddressModal
          userId={userId}
          currentAddress={address}
          onClose={() => setShowAddressModal(false)}
          onSave={(addr) => { setAddress(addr); setShowAddressModal(false) }}
        />
      )}
      {showCouponModal && (
        <CouponModal
          onClose={() => setShowCouponModal(false)}
          onApply={(code) => { setShowCouponModal(false); applyCouponCode(code) }}
        />
      )}
    </div>
  )
}