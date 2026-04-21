

import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'

import { useApp } from '../context/AppContext'
import { getAddress, getCouponByCode, createPayment } from '../services/api'

import AddressModal from '../components/AddressModal'
import CouponModal from '../components/CouponModal'
import emptyCartImg from '../assets/images/short_anim.png'

/* ================= PAYMENT CALLBACK ================= */

export function PaymentCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('processing')
  const { setCartItems, loadCart } = useApp()

  useEffect(() => {
    const verifyPayment = async () => {
      const code = searchParams.get('code') || searchParams.get('status')
      const ok     = code === 'PAYMENT_SUCCESS' || code === 'success'
      const failed = code === 'PAYMENT_FAILED'  || code === 'failed'

      if (ok) {
        setStatus('success')
        toast.success('Payment successful!')
        try {
          localStorage.removeItem('buynow_product')
          localStorage.removeItem('checkout_coupon_code')
          localStorage.removeItem('checkout_spin_discount')
          localStorage.removeItem('merchantTransactionId')
          localStorage.removeItem('pending_order_amount')
          localStorage.removeItem('pending_order_mode')
        } catch {}
        setCartItems([])
        loadCart?.()
        return
      }

      if (failed) { setStatus('failed'); toast.error('Payment failed'); return }
      setStatus(code ? 'unknown' : 'processing')
    }

    verifyPayment()
  }, [searchParams, setCartItems, loadCart])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-sm w-full">
        {status === 'success' ? (
          <>
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
            <p className="text-gray-500 text-sm mb-6">Your order has been placed successfully.</p>
          </>
        ) : status === 'failed' ? (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h2>
            <p className="text-gray-500 text-sm mb-6">Something went wrong. Please try again.</p>
          </>
        ) : status === 'unknown' ? (
          <>
            <div className="text-6xl mb-4">ℹ️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Status Unknown</h2>
            <p className="text-gray-500 text-sm mb-6">We couldn&apos;t read payment status from the callback.</p>
          </>
        ) : (
          <>
            <div className="spinner-loader mx-auto mb-4" />
            <p className="text-gray-500">Processing payment...</p>
          </>
        )}
        <button className="btn-maroon" onClick={() => navigate('/')}>Continue Shopping</button>
        <button
          className="mt-3 text-sm text-[#800000] hover:underline block mx-auto"
          onClick={() => navigate('/cart')}
        >
          Back to Cart
        </button>
      </div>
    </div>
  )
}

/* ================= CHECKOUT / PAYMENT ================= */

function readStoredAddress() {
  try {
    const raw = localStorage.getItem('kanchira_address')
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function storeAddress(addr) {
  try { localStorage.setItem('kanchira_address', JSON.stringify(addr)) } catch {}
}

function StepHeader({ step }) {
  const steps = [
    { key: 'cart',    label: 'CART'    },
    { key: 'address', label: 'ADDRESS' },
    { key: 'payment', label: 'PAYMENT' },
  ]

  return (
    <div className="flex items-center justify-center gap-5 text-sm font-extrabold tracking-wider my-5">
      {steps.map((s, idx) => {
        const active = s.key === step
        return (
          <div key={s.key} className="flex items-center gap-6">
            <span className={active ? 'text-[#800000]' : 'text-gray-400'}>{s.label}</span>
            {idx < steps.length - 1 ? <span className="text-gray-200">----------</span> : null}
          </div>
        )
      })}
    </div>
  )
}

export function CheckoutPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const mode        = (searchParams.get('mode') || 'cart').toLowerCase()
  const initialStep = (searchParams.get('step') || 'cart').toLowerCase()

  const { user, cartItems, setLoginModalOpen, setCartItems, loadCart } = useApp()

  const [step, setStep] = useState(
    ['cart', 'address', 'payment'].includes(initialStep) ? initialStep : 'cart'
  )

  const [address, setAddress]               = useState(() => location?.state?.address || readStoredAddress())
  const [showAddressModal, setShowAddressModal] = useState(false)

  // ── Coupon state (from cart page via location.state) ──────────────────────
  const [couponCode, setCouponCode]         = useState(() => {
    try { return location?.state?.couponCode || localStorage.getItem('checkout_coupon_code') || '' } catch { return '' }
  })
  const [couponApplied, setCouponApplied]   = useState(false)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponType, setCouponType]         = useState('')
  const [showCouponModal, setShowCouponModal] = useState(false)

  // ── Spin discount state — READ ONLY from cart page, no spin wheel here ────
  // Reads from location.state (passed from CartPage) OR from localStorage
  const [spinDiscount] = useState(() => {
    // Prefer location.state, fallback to localStorage
    if (location?.state?.spinDiscount) return location.state.spinDiscount
    try {
      const saved = localStorage.getItem('checkout_spin_discount')
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })
  const [spinDiscountApplied] = useState(() => {
    return !!(location?.state?.spinDiscount || localStorage.getItem('checkout_spin_discount'))
  })

  // ── Payment options state ─────────────────────────────────────────────────
  const [isPlacing, setIsPlacing]               = useState(false)
  const [showPaymentOptions, setShowPaymentOptions] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('')

  // ── Auth guard ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) setLoginModalOpen(true)
  }, [user, setLoginModalOpen])

  // ── Auto-load address ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return
    if (location?.state?.address) { storeAddress(location.state.address); return }
    if (address) return
    getAddress()
      .then(r => {
        const data = r?.data
        const candidates = [data?.address, data?.addresses, data?.data?.address, data?.data?.addresses, data?.data]
        const list = candidates.find(v => Array.isArray(v)) || []
        const first = list?.[0] || null
        if (first) { setAddress(first); storeAddress(first) }
      })
      .catch(() => {})
  }, [user, location?.state?.address, address])

  useEffect(() => {
    if (step === 'address' && !address) setShowAddressModal(true)
  }, [step, address])

  // ── Buy Now data ──────────────────────────────────────────────────────────
  const buyNowData = useMemo(() => {
    if (mode !== 'buynow') return null
    try { return JSON.parse(localStorage.getItem('buynow_product') || 'null') } catch { return null }
  }, [mode])

  // ── Cart lines ────────────────────────────────────────────────────────────
  const lines = useMemo(() => {
    if (mode === 'buynow') {
      const product = buyNowData?.product
      if (!product) return []
      const selectedVariant = buyNowData?.selectedVariant
      const selectedSize    = buyNowData?.selectedSize
      const image = selectedVariant?.images?.[0]?.url || selectedVariant?.images?.[0] || product?.image || ''
      const price = Number(selectedSize?.finalPrice ?? selectedSize?.price ?? 0) || 0
      return [{
        index: 0,
        name:  product?.name || 'Product',
        image,
        qty:   1,
        price,
        size:  selectedSize?.size,
        color: selectedVariant?.color,
        productId: product?._id || product?.id,
      }]
    }

    const items = Array.isArray(cartItems) ? cartItems : []
    return items.map((item, index) => {
      const product = item?.productId || item?.product || item?.productData || {}
      return {
        index,
        name:  product?.name || item?.name || 'Product',
        image: item?.image || product?.image || product?.thumbnail || '',
        qty:   item?.quantity || 1,
        price: Number(item?.variant?.price ?? item?.price ?? 0) || 0,
        size:  item?.variant?.size,
        color: item?.variant?.color,
        productId: product?._id || product?.id || item?.productId,
      }
    })
  }, [mode, cartItems, buyNowData])

  // ── Totals ────────────────────────────────────────────────────────────────
  const subtotal = useMemo(
    () => lines.reduce((s, line) => s + line.price * (line.qty || 1), 0),
    [lines]
  )
  const totalQty = useMemo(
    () => lines.reduce((s, line) => s + (line.qty || 1), 0),
    [lines]
  )

  const couponDiscountAmt = couponApplied
    ? couponType === 'percentage'
      ? (subtotal * couponDiscount) / 100
      : couponDiscount
    : 0

  const spinDiscountAmt = spinDiscountApplied && spinDiscount
    ? (subtotal * spinDiscount.value) / 100
    : 0

  // Only one discount active — spin takes priority if both somehow set
  const activeDiscountAmt = spinDiscountApplied ? spinDiscountAmt : couponDiscountAmt
  const deliveryCharge    = 0
  const grandTotal        = Math.round(Math.max(0, subtotal - activeDiscountAmt) + deliveryCharge)

  // ── Build order payload ───────────────────────────────────────────────────
  const buildOrderPayload = (paymentMethod) => ({
    userId: user?._id || user?.id,
    address,
    items: lines.map(line => ({
      productId: line.productId,
      name:      line.name  || '',
      image:     line.image || '',
      quantity:  line.qty,
      price:     line.price,
      variant: {
        color: line.color || '',
        size:  line.size  || '',
        price: line.price,
      },
      finalPrice: line.price,
    })),
    totalAmount:     grandTotal,
    paymentMethod,
    orderType:       mode === 'buynow' ? 'buynow' : 'cart',
    couponCode:      couponApplied && !spinDiscountApplied ? couponCode : '',
    couponDiscount:  couponApplied && !spinDiscountApplied ? Math.round(couponDiscountAmt) : 0,
    spinDiscount:    spinDiscountApplied ? Math.round(spinDiscountAmt) : 0,
    festivalDiscount: 0,
  })

  // ── Coupon helpers ────────────────────────────────────────────────────────
  const applyCouponCode = async (rawCode) => {
    if (spinDiscountApplied) {
      toast.error('Remove spin discount first to apply a coupon')
      return
    }
    const code = String(rawCode || '').trim()
    if (!code) return
    try {
      setCouponCode(code)
      const r = await getCouponByCode(code)
      const c = r.data?.coupon || r.data
      if (c && new Date(c.expiryDate) >= new Date()) {
        setCouponApplied(true)
        setCouponType(c.type)
        setCouponDiscount(c.value)
        localStorage.setItem('checkout_coupon_code', code)
        toast.success(`Coupon applied! ${c.type === 'percentage' ? c.value + '%' : '₹' + c.value} off`)
      } else {
        toast.error('Invalid or expired coupon')
      }
    } catch {
      toast.error('Coupon not found')
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Auto-apply saved coupon on mount (only if no spin discount)
  useEffect(() => {
    if (!couponCode || couponApplied || spinDiscountApplied) return
    applyCouponCode(couponCode)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const removeCoupon = () => {
    setCouponApplied(false)
    setCouponDiscount(0)
    setCouponType('')
    setCouponCode('')
    localStorage.removeItem('checkout_coupon_code')
    toast.success('Coupon removed')
  }

  // ── Step navigation ───────────────────────────────────────────────────────
  const startAddressStep = () => {
    setStep('address')
    if (!address) setShowAddressModal(true)
  }

  const saveAddress = (addr) => {
    setAddress(addr)
    storeAddress(addr)
    setStep('payment')
  }

  const handlePrimary = () => {
    if (step === 'cart')    { startAddressStep(); return }
    if (step === 'address') { if (!address) { setShowAddressModal(true); return } setStep('payment'); return }
    if (step === 'payment') { setShowPaymentOptions(true); return }
  }

  // ── Payment handlers ──────────────────────────────────────────────────────
  const handlePaymentSelect = (method) => {
    setSelectedPaymentMethod(method)
    if (method === 'COD') finalizeCODOrder()
  }

  const handleOnlinePayment = async () => {
    if (!selectedPaymentMethod || selectedPaymentMethod === 'COD') return
    if (!address) { toast.error('Please add a delivery address'); return }

    setIsPlacing(true)
    try {
      const payload  = buildOrderPayload('ONLINE')
      const response = await createPayment(payload)
      const paymentData = response?.data

      const paymentUrl =
        paymentData?.redirectUrlRes ||
        paymentData?.redirectUrl    ||
        paymentData?.paymentUrl     ||
        paymentData?.url            ||
        paymentData?.data?.redirectUrl ||
        paymentData?.data?.redirectUrlRes

      const merchantTransactionId =
        paymentData?.merchantTransactionId ||
        paymentData?.data?.merchantTransactionId

      if (paymentUrl) {
        if (merchantTransactionId) localStorage.setItem('merchantTransactionId', merchantTransactionId)
        localStorage.setItem('pending_order_amount', grandTotal.toString())
        localStorage.setItem('pending_order_mode', mode)
        window.location.href = paymentUrl
        return
      }

      toast.error('Payment link not available. Please try again.')
    } catch (error) {
      console.error('Payment creation error:', error)
      toast.error(error?.response?.data?.message || 'Failed to initiate payment. Please try again.')
    } finally {
      setIsPlacing(false)
    }
  }

  const finalizeCODOrder = async () => {
    if (!address) { toast.error('Please add a delivery address'); startAddressStep(); return }
    if (lines.length === 0) { toast.error('Your cart is empty'); return }

    setIsPlacing(true)
    try {
      const payload = buildOrderPayload('COD')
      await createPayment(payload)

      toast.success('Order placed successfully!')
      localStorage.removeItem('buynow_product')
      localStorage.removeItem('checkout_coupon_code')
      localStorage.removeItem('checkout_spin_discount')

      if (mode !== 'buynow') {
        setCartItems([])
        loadCart?.()
      }

      navigate('/payment_callback?status=success')
    } catch (e) {
      console.error('COD order error:', e?.response?.data)
      toast.error(e?.response?.data?.message || 'Order failed. Please try again.')
    } finally {
      setIsPlacing(false)
    }
  }

  // ── Guards ────────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl border p-6 text-center max-w-sm w-full">
          <p className="text-gray-600 text-sm">Please login to continue.</p>
          <button className="btn-maroon mt-4" onClick={() => navigate('/cart')}>Go to Cart</button>
        </div>
      </div>
    )
  }

  if (mode === 'buynow' && !buyNowData?.product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl border p-6 text-center max-w-sm w-full">
          <p className="text-gray-600 text-sm">No product selected.</p>
          <button className="btn-maroon mt-4" onClick={() => navigate('/')}>Continue Shopping</button>
        </div>
      </div>
    )
  }

  const primaryLabel = isPlacing
    ? 'PROCESSING...'
    : step === 'cart'
      ? 'PLACE ORDER'
      : step === 'address'
        ? 'CONTINUE'
        : showPaymentOptions
          ? 'SELECT PAYMENT METHOD'
          : 'CHOOSE PAYMENT OPTION'

  const paymentMethods = [
    { id: 'ONLINE', name: 'PhonePe / UPI / Card', icon: '📱', description: 'Pay securely via PhonePe' },
    { id: 'COD',    name: 'Cash on Delivery',      icon: '💵', description: `Pay ₹${grandTotal} on delivery` },
  ]

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white px-4">
      <div className="max-w-6xl mx-auto">

        {/* Top address bar */}
        <div className="checkout-topbar">
          <span className="label">Delivering to</span>
          <button type="button" className="action-btn" onClick={() => setShowAddressModal(true)}>
            {address ? 'Change Address' : 'Add Address'}
          </button>
          {address && (
            <span className="text-sm text-gray-600">
              {[address.currentAddress || address.street, address.city, address.state, address.pincode]
                .filter(Boolean).join(', ')}
            </span>
          )}
        </div>
        <div className="checkout-rule" />

        <StepHeader step={step} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10">

          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-7 space-y-4">

            {/* CART STEP */}
            {step === 'cart' && (
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-extrabold text-[#800000]">Cart</h2>
                  <button className="text-sm text-[#800000] hover:underline" onClick={() => navigate('/cart')}>
                    Back
                  </button>
                </div>

                {lines.length === 0 ? (
                  <div className="checkout-empty">
                    <div>
                      <img src={emptyCartImg} alt="Empty cart" />
                      <div className="msg">You don&apos;t have any orders yet.</div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {lines.map(line => (
                      <div key={line.index} className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4">
                        <div className="w-24 h-24 bg-gray-50 rounded-lg border border-gray-100 overflow-hidden flex-shrink-0">
                          {line.image
                            ? <img src={line.image} alt={line.name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full grid place-items-center text-xs text-gray-400">No image</div>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold capitalize line-clamp-2">{line.name}</p>
                          <div className="text-xs text-gray-500 mt-1 flex gap-3 flex-wrap">
                            {line.size  && <span>Size: {line.size}</span>}
                            {line.color && <span>Color: {line.color}</span>}
                          </div>
                          <div className="mt-3 flex items-center justify-between gap-3">
                            <span className="text-sm text-gray-600">Qty: {line.qty}</span>
                            <span className="font-bold">₹{Math.round(line.price * (line.qty || 1))}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ADDRESS STEP */}
            {step === 'address' && (
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-extrabold text-[#800000]">Delivery Address</h2>
                  <button className="text-sm text-[#800000] hover:underline" onClick={() => setStep('cart')}>
                    Back to Cart
                  </button>
                </div>

                {address ? (
                  <div className="border border-gray-100 rounded-xl p-4 flex items-start justify-between gap-4">
                    <div className="text-sm">
                      <p className="font-semibold">
                        {address.fullName || address.name || 'Customer'}
                        {address.pincode ? `, ${address.pincode}` : ''}
                      </p>
                      <p className="text-gray-600 mt-1">
                        {[address.houseNumber, address.currentAddress || address.street, address.city, address.district, address.state]
                          .filter(Boolean).join(', ')}
                      </p>
                      {address.phone && <p className="text-gray-500 mt-1">Phone: {address.phone}</p>}
                    </div>
                    <button
                      type="button"
                      className="px-4 py-2 border border-[#800000] text-[#800000] rounded-lg text-sm font-semibold hover:bg-[#800000] hover:text-white transition-all"
                      onClick={() => setShowAddressModal(true)}
                    >
                      Change Address
                    </button>
                  </div>
                ) : (
                  <div className="border border-dashed border-gray-200 rounded-xl p-4 text-sm text-gray-600">
                    No address saved.{' '}
                    <button className="text-[#800000] underline" onClick={() => setShowAddressModal(true)}>
                      Add Address
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* PAYMENT STEP */}
            {step === 'payment' && (
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-extrabold text-[#800000]">Payment</h2>
                  <button className="text-sm text-[#800000] hover:underline" onClick={() => setStep('address')}>
                    Change Address
                  </button>
                </div>

                <div className="border border-gray-100 rounded-xl p-4 mb-4 text-sm">
                  <p className="font-semibold mb-1">Deliver to</p>
                  {address ? (
                    <p className="text-gray-600">
                      {[address.fullName || address.name, address.houseNumber, address.currentAddress || address.street,
                        address.city, address.state, address.pincode].filter(Boolean).join(', ')}
                    </p>
                  ) : (
                    <p className="text-gray-500">No address selected.</p>
                  )}
                </div>

                {showPaymentOptions ? (
                  <div className="border-2 border-[#800000] rounded-xl p-4 mb-4 bg-[#fff5f5]">
                    <h3 className="font-bold text-[#800000] mb-3 flex items-center gap-2">
                      <span>🔒</span> Secure Payment
                    </h3>

                    <div className="mb-3 p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Amount to Pay:</span>
                        <span className="font-bold text-xl text-[#800000]">₹{grandTotal}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {paymentMethods.map((method) => (
                        <div
                          key={method.id}
                          onClick={() => !isPlacing && handlePaymentSelect(method.id)}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                            ${isPlacing ? 'opacity-50 cursor-not-allowed' : ''}
                            ${selectedPaymentMethod === method.id
                              ? 'border-[#800000] bg-white shadow-md ring-2 ring-[#800000]/20'
                              : 'border-gray-200 bg-white hover:border-[#800000]/50'
                            }`}
                        >
                          <span className="text-2xl">{method.icon}</span>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{method.name}</p>
                            <p className="text-xs text-gray-500">{method.description}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                            ${selectedPaymentMethod === method.id ? 'border-[#800000]' : 'border-gray-300'}`}
                          >
                            {selectedPaymentMethod === method.id && (
                              <div className="w-3 h-3 rounded-full bg-[#800000]" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {selectedPaymentMethod === 'ONLINE' && (
                      <button
                        onClick={handleOnlinePayment}
                        disabled={isPlacing}
                        className="w-full mt-4 bg-[#800000] text-white py-3 rounded-lg font-bold hover:bg-[#600000] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {isPlacing
                          ? <><span className="animate-spin">⏳</span> Processing...</>
                          : <><span>🔒</span> Pay ₹{grandTotal} with PhonePe</>
                        }
                      </button>
                    )}

                    {selectedPaymentMethod === 'COD' && isPlacing && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                        <span className="animate-spin inline-block mr-2">⏳</span>
                        <span className="text-sm text-yellow-800">Placing your order...</span>
                      </div>
                    )}

                    {selectedPaymentMethod === 'COD' && !isPlacing && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800 text-center">✅ Cash on Delivery selected</p>
                      </div>
                    )}

                    <button
                      onClick={() => { setShowPaymentOptions(false); setSelectedPaymentMethod('') }}
                      disabled={isPlacing}
                      className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700 py-2 disabled:opacity-50"
                    >
                      ← Go Back
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-6 border border-dashed border-gray-300 rounded-xl">
                    <p className="text-gray-500 text-sm mb-2">Ready to complete your order?</p>
                    <p className="text-xs text-gray-400">Click the button below to see payment options</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN — ORDER SUMMARY ── */}
          <div className="lg:col-span-5">
            <div className="checkout-order-card p-6 lg:sticky lg:top-24">
              <div className="checkout-order-title mb-3">Order Details</div>

              <div className="space-y-1">
                <div className="checkout-row">
                  <span className="muted">Item Total</span>
                  <span>₹{Math.round(subtotal)}</span>
                </div>
                <div className="checkout-row">
                  <span className="muted">Total Quantity</span>
                  <span>{totalQty}</span>
                </div>
                <div className="checkout-row">
                  <span className="muted">Delivery fee</span>
                  <span>{deliveryCharge === 0 ? 'Free' : `₹${deliveryCharge}`}</span>
                </div>
                <div className="checkout-row">
                  <span className="muted">Platform fee</span>
                  <span>Free</span>
                </div>
                {couponApplied && !spinDiscountApplied && (
                  <div className="checkout-row text-green-600">
                    <span className="muted">Coupon Discount</span>
                    <span>-₹{Math.round(couponDiscountAmt)}</span>
                  </div>
                )}
                {spinDiscountApplied && spinDiscount && (
                  <div className="checkout-row text-green-600">
                    <span className="muted">Spin Discount ({spinDiscount.label})</span>
                    <span>-₹{Math.round(spinDiscountAmt)}</span>
                  </div>
                )}
              </div>

              <div className="mt-3 checkout-pill-warning">Only One Discount Can be Applied</div>

              {/* Coupon section — disabled if spin discount is active */}
              {/* <div
                className="mt-4 checkout-box clickable"
                onClick={() => !spinDiscountApplied && setShowCouponModal(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' && !spinDiscountApplied) setShowCouponModal(true) }}
                style={{ opacity: spinDiscountApplied ? 0.5 : 1, cursor: spinDiscountApplied ? 'not-allowed' : 'pointer' }}
              >
                <div className="text-[15px] font-bold text-[#800000]">Apply Coupon</div>
                {couponApplied && !spinDiscountApplied
                  ? <div className="mt-1 text-sm text-gray-600">
                      Applied: <span className="font-semibold">{couponCode}</span>{' '}
                      ({couponType === 'percentage' ? `${couponDiscount}%` : `₹${couponDiscount}`})
                    </div>
                  : spinDiscountApplied
                    ? <div className="mt-1 text-sm text-gray-500">Coupon disabled (Spin discount active)</div>
                    : <div className="mt-1 text-sm text-gray-500">Tap to view available coupons</div>
                }
              </div>
              {couponApplied && !spinDiscountApplied && (
                <button type="button" className="mt-2 checkout-link-danger" onClick={removeCoupon}>
                  Remove Coupon
                </button>
              )} */}

              {/* Show spin discount info (read-only, no wheel here) */}
              {/* {spinDiscountApplied && spinDiscount && (
                <div className="mt-4 checkout-box bg-green-50 border border-green-200">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎰</span>
                    <div>
                      <div className="text-[15px] font-bold text-green-700">
                        Spin Discount Applied! ({spinDiscount.label})
                      </div>
                      <div className="mt-1 text-sm text-green-600">
                        You saved ₹{Math.round(spinDiscountAmt)} with your spin 🎉
                      </div>
                    </div>
                  </div>
                </div>
              )} */}

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

              {/* Grand total */}
              <div className="mt-5 checkout-total-box">
                <span>Total Amount</span>
                <span className="amount">₹{grandTotal}</span>
              </div>

              {/* Primary CTA */}
              <button
                disabled={
                  isPlacing ||
                  lines.length === 0 ||
                  (step === 'payment' && showPaymentOptions && !selectedPaymentMethod)
                }
                onClick={handlePrimary}
                className="checkout-primary mt-4"
              >
                {primaryLabel}
              </button>

              {step === 'payment' && showPaymentOptions && !selectedPaymentMethod && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  Please select a payment method to continue
                </p>
              )}

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                <span>🔒</span>
                <span>Secure SSL Encryption</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        {showAddressModal && (
          <AddressModal onClose={() => setShowAddressModal(false)} onSave={saveAddress} />
        )}
        {showCouponModal && (
          <CouponModal
            onClose={() => setShowCouponModal(false)}
            onApply={(code) => { setShowCouponModal(false); applyCouponCode(code) }}
          />
        )}
      </div>
    </div>
  )
}

/* ================= BUY NOW (LEGACY ROUTE) ================= */

export function BuynowPage() {
  const navigate = useNavigate()
  useEffect(() => {
    navigate('/payment?mode=buynow', { replace: true })
  }, [navigate])
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="spinner-loader" />
    </div>
  )
}