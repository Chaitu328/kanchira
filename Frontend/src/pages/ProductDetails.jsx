

// import { useEffect, useState, useRef } from 'react'
// import { useParams, useNavigate } from 'react-router-dom'
// import { getProducts, addToCart, getReview, getPincodes } from '../services/api'
// import { useApp } from '../context/AppContext'
// import toast from 'react-hot-toast'
// import ReviewDialog from '../components/ReviewDialog'
// import ImagePopup from '../components/ImagePopup'

// /* ─────────────────────────────────────────────
//    SIZE CHART DATA
//    Keys match what you store in product.categoryId.name
//    (case-insensitive check is done below)
// ───────────────────────────────────────────── */
// const SIZE_CHART = {
//   women: {
//     unit: 'in',
//     columns: ['Brand Size', 'Size', 'Bust (in)', 'Waist (in)', 'Hips (in)', 'Front Length (in)'],
//     rows: [
//       { brandSize: 32, size: 'S',   bust: 35, waist: 30, hips: 38, frontLength: 48 },
//       { brandSize: 34, size: 'M',   bust: 37, waist: 32, hips: 40, frontLength: 48 },
//       { brandSize: 36, size: 'L',   bust: 40, waist: 34, hips: 43, frontLength: 49 },
//       { brandSize: 38, size: 'XL',  bust: 42, waist: 36, hips: 45, frontLength: 49 },
//       { brandSize: 40, size: 'XXL', bust: 44, waist: 38, hips: 48, frontLength: 50, disabled: true },
//       { brandSize: 42, size: '3XL', bust: 46, waist: 40, hips: 51, frontLength: 50 },
//     ],
//   },
//   men: {
//     unit: 'in',
//     columns: ['Brand Size', 'Size', 'Chest (in)', 'Waist (in)', 'Shoulder (in)', 'Length (in)'],
//     rows: [
//       { brandSize: 36, size: 'S',   chest: 36, waist: 30, shoulder: 16.5, length: 27 },
//       { brandSize: 38, size: 'M',   chest: 38, waist: 32, shoulder: 17.5, length: 28 },
//       { brandSize: 40, size: 'L',   chest: 40, waist: 34, shoulder: 18.5, length: 29 },
//       { brandSize: 42, size: 'XL',  chest: 42, waist: 36, shoulder: 19.5, length: 30 },
//       { brandSize: 44, size: 'XXL', chest: 44, waist: 38, shoulder: 20.5, length: 31 },
//       { brandSize: 46, size: '3XL', chest: 46, waist: 40, shoulder: 21.5, length: 32 },
//     ],
//   },
// }

// /* helper: pick chart by category name */
// function getChartType(categoryName = '') {
//   const n = categoryName.toLowerCase()
//   if (n.includes('women') || n.includes('girl') || n.includes('female') || n.includes('ladies')) return 'women'
//   if (n.includes('men') || n.includes('boy') || n.includes('male') || n.includes('gent')) return 'men'
//   return 'women' // default
// }

// /* ─────────────────────────────────────────────
//    SIZE CHART MODAL
// ───────────────────────────────────────────── */
// function SizeChartModal({ product, selectedVariant, onClose, onSizeSelect }) {
//   const [unit, setUnit] = useState('in')
//   const [tab, setTab] = useState('chart')
//   const chartType = getChartType(product?.categoryId?.name)
//   const chart = SIZE_CHART[chartType]

//   const toValue = (val) => {
//     if (unit === 'cm') return (val * 2.54).toFixed(1)
//     return val
//   }

//   return (
//     <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
//       <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col">
//         {/* Header */}
//         <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
//           <div className="flex items-center gap-3">
//             {product?.variants?.[0]?.images?.[0] && (
//               <img
//                 src={selectedVariant?.images?.[0]?.url || selectedVariant?.images?.[0] || product?.image}
//                 alt={product?.name}
//                 className="w-14 h-14 object-cover rounded-lg border border-gray-200"
//               />
//             )}
//             <div>
//               <p className="font-bold text-gray-800 text-sm leading-tight line-clamp-2 max-w-[220px]">{product?.name}</p>
//               {product?.variants?.[0]?.sizes?.[0]?.finalPrice && (
//                 <div className="flex items-center gap-1.5 mt-0.5">
//                   <span className="text-[#800000] font-bold text-sm">₹{product.variants[0].sizes[0].finalPrice}</span>
//                   {product.variants[0].sizes[0].discountPercentage > 0 && (
//                     <span className="text-gray-400 line-through text-xs">₹{product.variants[0].sizes[0].price}</span>
//                   )}
//                   {product.variants[0].sizes[0].discountPercentage > 0 && (
//                     <span className="text-green-600 text-xs font-medium">({product.variants[0].sizes[0].discountPercentage}% OFF)</span>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//           <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors flex-shrink-0">
//             <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </button>
//         </div>

//         {/* Tabs */}
//         <div className="flex border-b border-gray-100 flex-shrink-0">
//           {['chart', 'measure'].map(t => (
//             <button
//               key={t}
//               onClick={() => setTab(t)}
//               className={`flex-1 py-3 text-sm font-semibold transition-colors ${
//                 tab === t
//                   ? 'border-b-2 border-[#800000] text-[#800000]'
//                   : 'text-gray-500 hover:text-gray-700'
//               }`}
//             >
//               {t === 'chart' ? 'Size Chart' : 'How to Measure'}
//             </button>
//           ))}
//         </div>

//         {tab === 'chart' && (
//           <>
//             {/* Unit toggle */}
//             <div className="flex justify-end px-4 py-2 flex-shrink-0">
//               <div className="flex bg-gray-100 rounded-full p-0.5 gap-0.5">
//                 {['in', 'cm'].map(u => (
//                   <button
//                     key={u}
//                     onClick={() => setUnit(u)}
//                     className={`px-4 py-1 rounded-full text-xs font-semibold transition-all ${
//                       unit === u ? 'bg-[#800000] text-white shadow' : 'text-gray-500'
//                     }`}
//                   >
//                     {u}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Table */}
//             <div className="overflow-auto flex-1 px-2 pb-4">
//               <table className="w-full text-xs">
//                 <thead>
//                   <tr className="bg-gray-50">
//                     {chart.columns.map((col, i) => (
//                       <th key={i} className="px-3 py-2.5 text-center text-gray-600 font-semibold whitespace-nowrap border-b border-gray-200 first:text-left">
//                         {col}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {chart.rows.map((row, i) => {
//                     const vals = Object.values(row).filter(v => v !== true && v !== false)
//                     return (
//                       <tr
//                         key={i}
//                         className={`border-b border-gray-100 transition-colors ${
//                           row.disabled ? 'opacity-40' : 'hover:bg-[#fff5f5] cursor-pointer'
//                         }`}
//                         onClick={() => {
//                           if (!row.disabled && onSizeSelect) {
//                             const matchedSize = selectedVariant?.sizes?.find(sz => sz.size === row.size)
//                             if (matchedSize) { onSizeSelect(matchedSize); onClose() }
//                           }
//                         }}
//                       >
//                         <td className="px-3 py-2.5 text-center font-semibold text-gray-700">{row.brandSize}</td>
//                         <td className="px-3 py-2.5 text-center font-bold text-[#800000]">{row.size}</td>
//                         {Object.entries(row)
//                           .filter(([k]) => !['brandSize', 'size', 'disabled'].includes(k))
//                           .map(([k, v], j) => (
//                             <td key={j} className="px-3 py-2.5 text-center text-gray-600">{toValue(v)}</td>
//                           ))}
//                       </tr>
//                     )
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           </>
//         )}

//         {tab === 'measure' && (
//           <div className="flex-1 overflow-auto px-5 py-4 space-y-4 text-sm text-gray-600">
//             {chartType === 'women' ? (
//               <>
//                 <div>
//                   <p className="font-semibold text-gray-800 mb-1">Bust</p>
//                   <p>Measure around the fullest part of your chest, keeping the tape parallel to the floor.</p>
//                 </div>
//                 <div>
//                   <p className="font-semibold text-gray-800 mb-1">Waist</p>
//                   <p>Measure around the narrowest part of your natural waistline.</p>
//                 </div>
//                 <div>
//                   <p className="font-semibold text-gray-800 mb-1">Hips</p>
//                   <p>Measure around the fullest part of your hips and buttocks.</p>
//                 </div>
//                 <div>
//                   <p className="font-semibold text-gray-800 mb-1">Front Length</p>
//                   <p>Measure from the highest point of the shoulder down to the hem.</p>
//                 </div>
//               </>
//             ) : (
//               <>
//                 <div>
//                   <p className="font-semibold text-gray-800 mb-1">Chest</p>
//                   <p>Measure around the fullest part of your chest, keeping the tape under your armpits.</p>
//                 </div>
//                 <div>
//                   <p className="font-semibold text-gray-800 mb-1">Waist</p>
//                   <p>Measure around your natural waistline, just above the hip bone.</p>
//                 </div>
//                 <div>
//                   <p className="font-semibold text-gray-800 mb-1">Shoulder</p>
//                   <p>Measure from the edge of one shoulder to the other across the back.</p>
//                 </div>
//                 <div>
//                   <p className="font-semibold text-gray-800 mb-1">Length</p>
//                   <p>Measure from the highest point of the shoulder down to the desired hem length.</p>
//                 </div>
//               </>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// /* ─────────────────────────────────────────────
//    MAIN COMPONENT
// ───────────────────────────────────────────── */
// export default function ProductDetails() {
//   const { id } = useParams()
//   const navigate = useNavigate()
//   const { user, loadCart, setLoginModalOpen, addToWishlistLocal, isInWishlist, setCartItems } = useApp()

//   const [product, setProduct] = useState(null)
//   const [selectedVariant, setSelectedVariant] = useState(null)
//   const [selectedSize, setSelectedSize] = useState(null)
//   const [reviews, setReviews] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [popupImg, setPopupImg] = useState(null)
//   const [zipcodes, setZipcodes] = useState([])
//   const [pincodeInput, setPincodeInput] = useState('')
//   const [zipMsg, setZipMsg] = useState('')
//   const [isZipValid, setIsZipValid] = useState(null)
//   const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
//   const [addingCart, setAddingCart] = useState(false)
//   const [similarProducts, setSimilarProducts] = useState([])
//   const [showPriceDetails, setShowPriceDetails] = useState(false)
//   const [showSizeChart, setShowSizeChart] = useState(false)   // ← NEW
//   const pricePopupRef = useRef(null)

//   useEffect(() => {
//     window.scrollTo({ top: 0, behavior: 'smooth' })
//     setProduct(null)
//     setSelectedVariant(null)
//     setSelectedSize(null)
//     setReviews([])
//     setSimilarProducts([])
//     setLoading(true)

//     if (!id) return

//     getProducts()
//       .then(r => {
//         const all = Array.isArray(r.data) ? r.data : r.data?.products || []
//         const found = all.find(p => p._id === id)
//         if (found) {
//           setProduct(found)
//           setSelectedVariant(found.variants?.[0] || null)
//           const foundSubcategoryId = found.subcategoryId?._id || found.subcategoryId
//           const similar = all.filter((p) => {
//             const productSubcategoryId = p.subcategoryId?._id || p.subcategoryId
//             return productSubcategoryId === foundSubcategoryId && p._id !== found._id
//           }).slice(0, 6)
//           setSimilarProducts(similar)
//         }
//         setLoading(false)
//       })
//       .catch(() => setLoading(false))

//     getReview(id)
//       .then(r => setReviews(r.data?.reviews || r.data || []))
//       .catch(() => {})

//     getPincodes()
//       .then(r => setZipcodes(r.data?.pincodes || r.data || []))
//       .catch(() => {})
//   }, [id])

//   // Close price popup on outside click
//   useEffect(() => {
//     const handleOutside = (e) => {
//       if (pricePopupRef.current && !pricePopupRef.current.contains(e.target)) {
//         setShowPriceDetails(false)
//       }
//     }
//     if (showPriceDetails) {
//       document.addEventListener('mousedown', handleOutside)
//     }
//     return () => document.removeEventListener('mousedown', handleOutside)
//   }, [showPriceDetails])

//   const onColorSelect = (variant) => {
//     setSelectedVariant(variant)
//     setSelectedSize(null)
//   }

//   const onSizeSelect = (size) => {
//     setSelectedSize(size)
//   }

//   const toggleWishlist = (product) => {
//     const wasInWishlist = isInWishlist(product?._id)
//     addToWishlistLocal(product)
//     toast.success(wasInWishlist ? 'Removed from wishlist' : 'Added to wishlist!')
//   }

//   const addToGuestCart = () => {
//     if (!selectedSize?.size) { toast.error('Please select a size'); return }
//     const guestCart = localStorage.getItem('guestCart')
//     let cart = []
//     if (guestCart) { try { cart = JSON.parse(guestCart) } catch { cart = [] } }
//     const basePrice = selectedSize?.price ?? selectedSize?.finalPrice ?? 0
//     const discountPercentage = selectedSize?.discountPercentage ?? 0
//     const image = selectedVariant?.images?.[0]?.url || selectedVariant?.images?.[0] || product.image
//     const existingIndex = cart.findIndex(item =>
//       item.productId?._id === product._id &&
//       item.variant?.color === selectedVariant?.color &&
//       item.variant?.size === selectedSize?.size
//     )
//     if (existingIndex >= 0) {
//       cart[existingIndex].quantity += 1
//     } else {
//       cart.push({
//         _id: Date.now().toString(),
//         productId: product,
//         name: product.name,
//         image,
//         quantity: 1,
//         price: Number(basePrice) || 0,
//         variant: {
//           color: selectedVariant?.color,
//           size: selectedSize?.size,
//           price: Number(basePrice) || 0,
//           discountPercentage: Number(discountPercentage) || 0,
//         }
//       })
//     }
//     localStorage.setItem('guestCart', JSON.stringify(cart))
//     setCartItems(cart)
//     toast.success('Added to cart!')
//   }

//   const handleAddToCart = async () => {
//     if (!product?._id) { toast.error('Product not found'); return }
//     if (!selectedSize?.size) { toast.error('Please select a size'); return }
//     if (!user) { addToGuestCart(); return }
//     const userId = user?._id || user?.id
//     if (!userId) { toast.error('Please login again'); setLoginModalOpen(true); return }
//     const basePrice = selectedSize?.price ?? selectedSize?.finalPrice ?? 0
//     const discountPercentage = selectedSize?.discountPercentage ?? 0
//     const image = selectedVariant?.images?.[0]?.url || selectedVariant?.images?.[0] || product.image
//     setAddingCart(true)
//     try {
//       await addToCart({
//         userId,
//         items: [{
//           productId: product._id,
//           image,
//           variant: {
//             color: selectedVariant?.color,
//             size: selectedSize.size,
//             price: Number(basePrice) || 0,
//             discountPercentage: Number(discountPercentage) || 0,
//           },
//           quantity: 1,
//         }],
//       })
//       await loadCart()
//       toast.success('Added to cart!')
//     } catch (err) {
//       if (err?.response?.status === 401) {
//         toast.error('Session expired. Please login again.')
//         setLoginModalOpen(true)
//         return
//       }
//       const message = err?.response?.data?.message || err?.response?.data?.error || err?.message
//       toast.error(message || 'Failed to add to cart')
//     } finally {
//       setAddingCart(false)
//     }
//   }

//   const handleBuyNow = async () => {
//     if (!user) { setLoginModalOpen(true); toast.info('Please login to continue with Buy Now'); return }
//     if (!selectedSize) { toast.error('Please select a size'); return }
//     try {
//       const payload = {
//         product: { _id: product?._id, name: product?.name, image: product?.image, metaTitle: product?.metaTitle },
//         selectedVariant: selectedVariant ? {
//           color: selectedVariant?.color, colorCode: selectedVariant?.colorCode,
//           rating: selectedVariant?.rating, images: selectedVariant?.images,
//         } : null,
//         selectedSize: selectedSize ? {
//           size: selectedSize?.size, price: selectedSize?.price,
//           finalPrice: selectedSize?.finalPrice, discountPercentage: selectedSize?.discountPercentage,
//         } : null,
//       }
//       localStorage.setItem('buynow_product', JSON.stringify(payload))
//       navigate('/buynow')
//     } catch (e) {
//       toast.error('Buy now failed. Please try again.')
//     }
//   }

//   const handlePincodeChange = (e) => {
//     const value = e.target.value.replace(/\D/g, '').slice(0, 6)
//     setPincodeInput(value)
//     setZipMsg('')
//     setIsZipValid(null)
//     if (value.length === 6) checkPincode(value)
//   }

//   const checkPincode = (pin) => {
//     const pinToCheck = pin || pincodeInput
//     if (!pinToCheck || pinToCheck.length !== 6) return
//     const valid = zipcodes.some(z => {
//       const pinValue = typeof z === 'string' ? z : z?.pincode?.toString() || z?.toString()
//       return pinValue === pinToCheck
//     })
//     setIsZipValid(valid)
//     setZipMsg('Delivery available')
//   }

//   const avgRating = reviews.length
//     ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
//     : null

//   if (loading) return <div className="flex justify-center py-20"><div className="spinner-loader" /></div>
//   if (!product) return <div className="text-center py-20 text-gray-500">Product not found</div>

//   const allImages = selectedVariant?.images || []

//   const mrp = selectedSize?.price ?? product.variants?.[0]?.sizes?.[0]?.price ?? 0
//   const finalPrice = selectedSize?.finalPrice ?? product.variants?.[0]?.sizes?.[0]?.finalPrice ?? 0
//   const discountPct = selectedSize?.discountPercentage ?? product.variants?.[0]?.sizes?.[0]?.discountPercentage ?? 0

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Breadcrumb */}
//       <div className="flex gap-2 items-center px-4 py-3 text-xs text-gray-500 flex-wrap">
//         <span className="cursor-pointer hover:text-[#800000]" onClick={() => navigate('/')}>Home</span>
//         <span>›</span>
//         {product.categoryId?.name && <><span className="capitalize">{product.categoryId.name}</span><span>›</span></>}
//         {product.subcategoryId?.name && <><span className="capitalize">{product.subcategoryId.name}</span><span>›</span></>}
//         {product.subsubcategoryId?.name && (
//           <span className="cursor-pointer capitalize hover:text-[#800000]" onClick={() => navigate(-1)}>
//             {product.subsubcategoryId.name}
//           </span>
//         )}
//         <span>›</span>
//         <strong className="text-gray-800">{product.name}</strong>
//       </div>

//       {/* Main Product Section */}
//       <div className="flex flex-col lg:flex-row gap-6 px-4 pb-8">

//         {/* Gallery */}
//         <div className="w-full lg:w-[55%] xl:w-[50%]">
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//             {allImages.map((img, i) => (
//               <div key={i} className="relative aspect-[3/4]">
//                 <img
//                   src={img.url || img}
//                   alt={`${product.name} ${i + 1}`}
//                   className="w-full h-full object-cover rounded-xl border border-gray-200 cursor-pointer hover:border-[#800000] transition-all"
//                   onClick={() => setPopupImg(img.url || img)}
//                   onError={e => { e.target.src = 'https://via.placeholder.com/400' }}
//                 />
//                 {i === 0 && (
//                   <button
//                     type="button"
//                     onClick={(e) => { e.stopPropagation(); toggleWishlist(product) }}
//                     className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-lg hover:scale-110 active:scale-95 transition z-10"
//                   >
//                     <svg className="w-6 h-6" fill={isInWishlist(product._id) ? '#800000' : 'none'} stroke="#800000" strokeWidth="1.8" viewBox="0 0 24 24">
//                       <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
//                     </svg>
//                   </button>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Info Panel */}
//         <div className="w-full lg:w-[45%] xl:w-[50%] max-w-xl">
//           <h1 className="text-2xl lg:text-3xl font-semibold capitalize mb-1">{product.name}</h1>
//           <p className="text-gray-400 text-sm lg:text-base mb-3">{product.metaTitle}</p>

//           {selectedVariant?.rating && (
//             <span className="inline-flex items-center gap-1 bg-gray-100 text-[#800000] px-3 py-1 rounded-full text-sm font-medium mb-3">
//               {selectedVariant.rating} <span className="text-yellow-400">★</span>
//             </span>
//           )}

//           {/* ═══════════════════════════════════════════
//               PRICE + POPUP  (unchanged logic, same UI)
//           ═══════════════════════════════════════════ */}
//           <div className="mb-4 relative" ref={pricePopupRef}>
//             <div
//               className="flex items-center gap-3 flex-wrap cursor-pointer select-none"
//               onClick={() => setShowPriceDetails(prev => !prev)}
//             >
//               <span className="text-3xl font-bold text-gray-900">₹{finalPrice}</span>
//               {discountPct > 0 && (
//                 <>
//                   <span className="text-lg text-gray-400 line-through">₹{mrp}</span>
//                   <span className="text-[#800000] font-semibold text-base">({discountPct}% OFF)</span>
//                 </>
//               )}
//             </div>

//             {selectedSize && (
//               <p className="text-sm text-gray-600 mt-1">
//                 Selected Size: <span className="font-semibold">{selectedSize.size}</span>
//               </p>
//             )}

//             {showPriceDetails && (
//               <div className="absolute top-12 left-0 z-40 border border-gray-200 rounded-xl p-4 bg-white shadow-xl w-72">
//                 <h5 className="font-semibold text-gray-800 text-sm mb-2">Price Details</h5>
//                 <div className="flex justify-between items-start py-2.5 border-b border-gray-100">
//                   <div>
//                     <p className="text-gray-600 text-sm">Maximum Retail Price</p>
//                     <p className="text-gray-400 text-xs">(Incl. of all taxes)</p>
//                   </div>
//                   <span className="font-semibold text-gray-800 text-sm">Rs. {mrp}</span>
//                 </div>
//                 {discountPct > 0 && (
//                   <div className="flex justify-between items-center py-2.5 border-b border-gray-100">
//                     <p className="text-gray-600 text-sm">Discount</p>
//                     <span className="font-bold text-[#800000] text-sm">{discountPct}% OFF</span>
//                   </div>
//                 )}
//                 <div className="flex justify-between items-start pt-2.5">
//                   <div>
//                     <p className="text-gray-800 font-semibold text-sm">Selling Price</p>
//                     <p className="text-gray-400 text-xs">(Incl. of all taxes)</p>
//                   </div>
//                   <span className="font-bold text-gray-900 text-sm">Rs. {finalPrice}</span>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* ═══════════════════════════════════════════
//               SIZES  — "Size Chart" link opens modal
//           ═══════════════════════════════════════════ */}
//           {selectedVariant?.sizes?.length > 0 && (
//             <div className="mb-4">
//               <div className="flex items-center justify-between mb-2">
//                 <label className="text-sm font-semibold text-[#800000]">Available Sizes</label>
//                 <button
//                   type="button"
//                   onClick={() => setShowSizeChart(true)}
//                   className="text-xs text-gray-500 cursor-pointer hover:text-[#800000] underline transition-colors"
//                 >
//                   Size Chart
//                 </button>
//               </div>
//               <div className="flex flex-wrap gap-2">
//                 {selectedVariant.sizes.map(sz => (
//                   <button
//                     key={sz.size}
//                     onClick={() => onSizeSelect(sz)}
//                     disabled={sz.isAvailable === false}
//                     className={`min-w-[50px] px-4 py-2 rounded-full border text-sm font-medium transition-all ${
//                       selectedSize?.size === sz.size
//                         ? 'border-[#800000] bg-[#800000] text-white'
//                         : 'border-gray-300 bg-white text-gray-700 hover:border-[#800000]'
//                     } ${sz.isAvailable === false ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}>
//                     {sz.size}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Colors */}
//           {product.variants?.length > 0 && (
//             <div className="mb-4">
//               <label className="text-sm font-semibold block mb-2">Color</label>
//               <div className="flex gap-3">
//                 {product.variants.map(v => (
//                   <button
//                     key={v.color}
//                     title={v.color}
//                     onClick={() => onColorSelect(v)}
//                     className={`w-8 h-8 rounded-full border-2 transition-all ${selectedVariant?.color === v.color ? 'border-[#800000] scale-110 ring-2 ring-offset-2 ring-[#800000]' : 'border-gray-300'}`}
//                     style={{ backgroundColor: v.colorCode }}
//                   />
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Action Buttons */}
//           <div className="flex flex-col gap-3 mb-6">
//             <button type="button" onClick={handleAddToCart} disabled={addingCart}
//               className="w-full bg-[#800000] text-white py-3.5 rounded-lg text-base font-semibold hover:bg-[#600000] disabled:opacity-60 transition-colors">
//               {addingCart ? 'Adding...' : '🛒 Add to Cart'}
//             </button>
//             <button type="button" onClick={handleBuyNow} disabled={!selectedSize}
//               className="w-full py-3.5 rounded-lg text-white font-semibold text-base bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-300 hover:from-yellow-600 hover:to-yellow-400 shadow-md hover:shadow-lg transition-all duration-300">
//               ⚡ Buy Now
//             </button>
//             <button
//               type="button"
//               onClick={() => toggleWishlist(product)}
//               className={`w-full py-3.5 rounded-lg text-base font-semibold border-2 transition-all duration-300 flex items-center justify-center gap-2
//                 ${isInWishlist(product._id)
//                   ? 'border-red-500 text-red-500 hover:bg-red-50'
//                   : 'border-[#800000] text-[#800000] hover:bg-[#800000] hover:text-white'}`}>
//               <svg className="w-5 h-5" fill={isInWishlist(product._id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
//                 <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
//               </svg>
//               {isInWishlist(product._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
//             </button>
//           </div>

//           {/* Delivery Info */}
//           <div className="border border-gray-200 rounded-xl p-4 mb-4 bg-white">
//             <p className="text-sm text-gray-500 mb-3 font-medium">100% Original Products</p>
//             <div className="flex gap-2 mb-3">
//               <div className="flex-1 relative">
//                 <input
//                   type="text"
//                   value={pincodeInput}
//                   onChange={handlePincodeChange}
//                   placeholder="Enter 6 digit pincode"
//                   maxLength={6}
//                   className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000]"
//                 />
//                 {isZipValid === true && (
//                   <div className="absolute right-3 top-1/2 -translate-y-1/2">
//                     <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                     </svg>
//                   </div>
//                 )}
//               </div>
//             </div>
//             {zipMsg && (
//               <div className="flex items-center gap-2 text-sm font-medium text-green-600">
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                 </svg>
//                 {zipMsg}
//               </div>
//             )}
//             <ul className="space-y-2 text-sm text-gray-600 mt-4">
//               <li className="flex items-center gap-2">
//                 <svg className="w-4 h-4 text-[#800000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
//                 </svg>
//                 Get it by May 8 — Fast Delivery available
//               </li>
//               <li className="flex items-center gap-2">
//                 <svg className="w-4 h-4 text-[#800000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
//                 </svg>
//                 Best Price
//               </li>
//               <li className="flex items-center gap-2">
//                 <span className="text-[#800000] font-bold">₹</span>
//                 Cash on Delivery
//               </li>
//               <li className="flex items-center gap-2">
//                 <svg className="w-4 h-4 text-[#800000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//                 8 days Return
//               </li>
//             </ul>
//             <p className="text-sm font-semibold text-gray-800 mt-3">Kanchira Trusted</p>
//           </div>

//           {/* ═══════════════════════════════════════════
//               PRODUCT DETAILS  — redesigned card
//           ═══════════════════════════════════════════ */}
//           <div className="border border-gray-200 rounded-xl p-4 mb-4 bg-white">
//             <h5 className="font-semibold text-[#800000] flex items-center gap-2 mb-4 text-base">
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
//               </svg>
//               Product Details
//             </h5>

//             {/* Description — full width row */}
//             {product.description && (
//               <p className="text-gray-600 text-sm mb-4 leading-relaxed">{product.description}</p>
//             )}

//             {/* Key-value rows with dividers */}
//             <div className="divide-y divide-gray-100">
//               {selectedSize?.size && (
//                 <div className="flex justify-between py-2.5">
//                   <span className="text-gray-500 text-sm font-medium">Size</span>
//                   <span className="text-gray-800 text-sm font-semibold">{selectedSize.size}</span>
//                 </div>
//               )}
//               {product.brand && (
//                 <div className="flex justify-between py-2.5">
//                   <span className="text-gray-500 text-sm font-medium">Brand</span>
//                   <span className="text-gray-800 text-sm font-semibold">{product.brand}</span>
//                 </div>
//               )}
//               {product.speciality && (
//                 <div className="flex justify-between py-2.5">
//                   <span className="text-gray-500 text-sm font-medium">Speciality</span>
//                   <span className="text-gray-800 text-sm font-semibold">{product.speciality}</span>
//                 </div>
//               )}
//               {product.metaTitle && (
//                 <div className="flex justify-between py-2.5">
//                   <span className="text-gray-500 text-sm font-medium">Material</span>
//                   <span className="text-gray-800 text-sm font-semibold">{product.metaTitle}</span>
//                 </div>
//               )}
//               {product.categoryId?.name && (
//                 <div className="flex justify-between py-2.5">
//                   <span className="text-gray-500 text-sm font-medium">Category</span>
//                   <span className="text-gray-800 text-sm font-semibold capitalize">{product.categoryId.name}</span>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Customer Reviews Summary */}
//           <div className="border border-gray-200 rounded-xl p-4 bg-white">
//             <div className="flex items-center justify-between mb-3">
//               <h4 className="font-semibold text-base">Customer Reviews</h4>
//               <button onClick={() => navigate(`/all-reviews/${id}`)} className="text-sm text-[#800000] hover:underline font-medium">
//                 View All ({reviews.length})
//               </button>
//             </div>
//             {avgRating && (
//               <div className="flex items-center gap-2 mb-3">
//                 {[1,2,3,4,5].map(n => (
//                   <span key={n} className={`text-lg ${n <= Math.round(avgRating) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
//                 ))}
//                 <span className="text-sm text-gray-600 font-medium">{avgRating} / 5</span>
//               </div>
//             )}
//             <div className="space-y-2 mb-4">
//               {[5,4,3,2,1].map(star => {
//                 const count = reviews.filter(r => Math.round(r.rating) === star).length
//                 const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0
//                 return (
//                   <div key={star} className="flex items-center gap-2">
//                     <span className="text-xs w-6 font-medium">{star} ★</span>
//                     <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
//                       <div className="h-full bg-[#800000] rounded-full" style={{ width: `${pct}%` }} />
//                     </div>
//                     <span className="text-xs text-gray-500 w-8">{pct}%</span>
//                   </div>
//                 )
//               })}
//             </div>
//             <button
//               onClick={() => { if (!user) { setLoginModalOpen(true); return }; setReviewDialogOpen(true) }}
//               className="w-full border border-[#800000] text-[#800000] py-2.5 rounded-lg text-sm font-semibold hover:bg-[#800000] hover:text-white transition-all">
//               Write a Review
//             </button>
//             {reviews.slice(0, 3).map((r, i) => (
//               <div key={i} className="border-t border-gray-100 pt-3 mt-3">
//                 <div className="flex items-center gap-2 mb-1">
//                   {[1,2,3,4,5].map(n => (
//                     <span key={n} className={`text-sm ${n <= r.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
//                   ))}
//                   <span className="text-xs text-gray-500 font-medium">{r.userId?.name || 'Customer'}</span>
//                 </div>
//                 <p className="text-sm text-gray-600">{r.text}</p>
//                 {r.images?.length > 0 && (
//                   <div className="flex gap-2 mt-2">
//                     {r.images.map((img, j) => (
//                       <img key={j} src={img} alt="" className="w-12 h-12 rounded object-cover cursor-pointer" onClick={() => setPopupImg(img)} />
//                     ))}
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Similar Products */}
//       {similarProducts.length > 0 && (
//         <div className="px-4 pb-12">
//           <h2 className="text-center text-[24px] lg:text-[28px] font-bold text-[#8B1E3F] bg-[rgba(255,192,203,0.25)] py-4 mb-6 rounded-lg">
//             Similar Products
//           </h2>
//           <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
//             {similarProducts.map((p) => (
//               <div key={p._id} className="cursor-pointer text-center bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-2 md:p-3 group relative">
//                 <div className="overflow-hidden rounded-lg relative">
//                   <img
//                     src={p.variants?.[0]?.images?.[0]?.url || p.variants?.[0]?.images?.[0] || p.image || 'https://via.placeholder.com/400'}
//                     alt={p.name}
//                     className="w-full h-[120px] md:h-[180px] lg:h-[220px] object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
//                     onClick={() => navigate(`/product-details/${p._id}`)}
//                     onError={e => { e.target.src = 'https://via.placeholder.com/400' }}
//                   />
//                   <button
//                     type="button"
//                     onClick={(e) => { e.stopPropagation(); toggleWishlist(p) }}
//                     className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow hover:scale-110 active:scale-95 transition"
//                   >
//                     <svg className="w-4 h-4" fill={isInWishlist(p._id) ? '#800000' : 'none'} stroke="#800000" strokeWidth="1.8" viewBox="0 0 24 24">
//                       <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
//                     </svg>
//                   </button>
//                 </div>
//                 <h6 className="text-[#8B1E3F] text-[10px] md:text-[12px] lg:text-[14px] mt-2 font-medium truncate px-1" onClick={() => navigate(`/product-details/${p._id}`)}>
//                   {p.name}
//                 </h6>
//                 <div className="flex items-center justify-center gap-2 mt-1">
//                   <span className="text-gray-900 font-bold text-[11px] md:text-[13px] lg:text-[14px]">
//                     ₹{p.variants?.[0]?.sizes?.[0]?.finalPrice || p.price}
//                   </span>
//                   {p.variants?.[0]?.sizes?.[0]?.discountPercentage > 0 && (
//                     <>
//                       <span className="text-gray-400 text-[10px] md:text-[11px] line-through">₹{p.variants?.[0]?.sizes?.[0]?.price}</span>
//                       <span className="text-green-600 text-[9px] md:text-[10px] font-medium">({p.variants?.[0]?.sizes?.[0]?.discountPercentage}% OFF)</span>
//                     </>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Image Popup */}
//       {popupImg && <ImagePopup src={popupImg} onClose={() => setPopupImg(null)} />}

//       {/* Review Dialog */}
//       {reviewDialogOpen && (
//         <ReviewDialog
//           productId={id}
//           userId={user?._id || user?.id}
//           onClose={() => setReviewDialogOpen(false)}
//           onSuccess={() => {
//             setReviewDialogOpen(false)
//             getReview(id).then(r => setReviews(r.data?.reviews || r.data || [])).catch(() => {})
//           }}
//         />
//       )}

//       {/* ═══════════════════════════════════════════
//           SIZE CHART MODAL  ← NEW
//       ═══════════════════════════════════════════ */}
//       {showSizeChart && (
//         <SizeChartModal
//           product={product}
//           selectedVariant={selectedVariant}
//           onClose={() => setShowSizeChart(false)}
//           onSizeSelect={(sz) => {
//             onSizeSelect(sz)
//             setShowSizeChart(false)
//           }}
//         />
//       )}
//     </div>
//   )
// }
















import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProducts, addToCart, getReview, getPincodes } from '../services/api'
import { useApp } from '../context/AppContext'
import toast from 'react-hot-toast'
import ReviewDialog from '../components/ReviewDialog'
import ImagePopup from '../components/ImagePopup'

/* ─────────────────────────────────────────────
   SIZE CHART DATA
───────────────────────────────────────────── */
const SIZE_CHART = {
  women: {
    unit: 'in',
    columns: ['Brand Size', 'Size', 'Bust (in)', 'Waist (in)', 'Hips (in)', 'Front Length (in)'],
    rows: [
      { brandSize: 32, size: 'S',   bust: 35, waist: 30, hips: 38, frontLength: 48 },
      { brandSize: 34, size: 'M',   bust: 37, waist: 32, hips: 40, frontLength: 48 },
      { brandSize: 36, size: 'L',   bust: 40, waist: 34, hips: 43, frontLength: 49 },
      { brandSize: 38, size: 'XL',  bust: 42, waist: 36, hips: 45, frontLength: 49 },
      { brandSize: 40, size: 'XXL', bust: 44, waist: 38, hips: 48, frontLength: 50, disabled: true },
      { brandSize: 42, size: '3XL', bust: 46, waist: 40, hips: 51, frontLength: 50 },
    ],
  },
  men: {
    unit: 'in',
    columns: ['Brand Size', 'Size', 'Chest (in)', 'Waist (in)', 'Shoulder (in)', 'Length (in)'],
    rows: [
      { brandSize: 36, size: 'S',   chest: 36, waist: 30, shoulder: 16.5, length: 27 },
      { brandSize: 38, size: 'M',   chest: 38, waist: 32, shoulder: 17.5, length: 28 },
      { brandSize: 40, size: 'L',   chest: 40, waist: 34, shoulder: 18.5, length: 29 },
      { brandSize: 42, size: 'XL',  chest: 42, waist: 36, shoulder: 19.5, length: 30 },
      { brandSize: 44, size: 'XXL', chest: 44, waist: 38, shoulder: 20.5, length: 31 },
      { brandSize: 46, size: '3XL', chest: 46, waist: 40, shoulder: 21.5, length: 32 },
    ],
  },
}

function getChartType(categoryName = '') {
  const n = categoryName.toLowerCase()
  if (n.includes('women') || n.includes('girl') || n.includes('female') || n.includes('ladies')) return 'women'
  if (n.includes('men') || n.includes('boy') || n.includes('male') || n.includes('gent')) return 'men'
  return 'women'
}

/* ─────────────────────────────────────────────
   SIZE CHART MODAL
───────────────────────────────────────────── */
function SizeChartModal({ product, selectedVariant, onClose, onSizeSelect }) {
  const [unit, setUnit] = useState('in')
  const [tab, setTab] = useState('chart')
  const chartType = getChartType(product?.categoryId?.name)
  const chart = SIZE_CHART[chartType]

  const toValue = (val) => {
    if (unit === 'cm') return (val * 2.54).toFixed(1)
    return val
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            {product?.variants?.[0]?.images?.[0] && (
              <img
                src={selectedVariant?.images?.[0]?.url || selectedVariant?.images?.[0] || product?.image}
                alt={product?.name}
                className="w-14 h-14 object-cover rounded-lg border border-gray-200"
              />
            )}
            <div>
              <p className="font-bold text-gray-800 text-sm leading-tight line-clamp-2 max-w-[220px]">{product?.name}</p>
              {product?.variants?.[0]?.sizes?.[0]?.finalPrice && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[#800000] font-bold text-sm">₹{product.variants[0].sizes[0].finalPrice}</span>
                  {product.variants[0].sizes[0].discountPercentage > 0 && (
                    <span className="text-gray-400 line-through text-xs">₹{product.variants[0].sizes[0].price}</span>
                  )}
                  {product.variants[0].sizes[0].discountPercentage > 0 && (
                    <span className="text-green-600 text-xs font-medium">({product.variants[0].sizes[0].discountPercentage}% OFF)</span>
                  )}
                </div>
              )}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors flex-shrink-0">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex border-b border-gray-100 flex-shrink-0">
          {['chart', 'measure'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                tab === t
                  ? 'border-b-2 border-[#800000] text-[#800000]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'chart' ? 'Size Chart' : 'How to Measure'}
            </button>
          ))}
        </div>

        {tab === 'chart' && (
          <>
            <div className="flex justify-end px-4 py-2 flex-shrink-0">
              <div className="flex bg-gray-100 rounded-full p-0.5 gap-0.5">
                {['in', 'cm'].map(u => (
                  <button
                    key={u}
                    onClick={() => setUnit(u)}
                    className={`px-4 py-1 rounded-full text-xs font-semibold transition-all ${
                      unit === u ? 'bg-[#800000] text-white shadow' : 'text-gray-500'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-auto flex-1 px-2 pb-4">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    {chart.columns.map((col, i) => (
                      <th key={i} className="px-3 py-2.5 text-center text-gray-600 font-semibold whitespace-nowrap border-b border-gray-200 first:text-left">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chart.rows.map((row, i) => {
                    const vals = Object.values(row).filter(v => v !== true && v !== false)
                    return (
                      <tr
                        key={i}
                        className={`border-b border-gray-100 transition-colors ${
                          row.disabled ? 'opacity-40' : 'hover:bg-[#fff5f5] cursor-pointer'
                        }`}
                        onClick={() => {
                          if (!row.disabled && onSizeSelect) {
                            const matchedSize = selectedVariant?.sizes?.find(sz => sz.size === row.size)
                            if (matchedSize) { onSizeSelect(matchedSize); onClose() }
                          }
                        }}
                      >
                        <td className="px-3 py-2.5 text-center font-semibold text-gray-700">{row.brandSize}</td>
                        <td className="px-3 py-2.5 text-center font-bold text-[#800000]">{row.size}</td>
                        {Object.entries(row)
                          .filter(([k]) => !['brandSize', 'size', 'disabled'].includes(k))
                          .map(([k, v], j) => (
                            <td key={j} className="px-3 py-2.5 text-center text-gray-600">{toValue(v)}</td>
                          ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'measure' && (
          <div className="flex-1 overflow-auto px-5 py-4 space-y-4 text-sm text-gray-600">
            {chartType === 'women' ? (
              <>
                <div>
                  <p className="font-semibold text-gray-800 mb-1">Bust</p>
                  <p>Measure around the fullest part of your chest, keeping the tape parallel to the floor.</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 mb-1">Waist</p>
                  <p>Measure around the narrowest part of your natural waistline.</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 mb-1">Hips</p>
                  <p>Measure around the fullest part of your hips and buttocks.</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 mb-1">Front Length</p>
                  <p>Measure from the highest point of the shoulder down to the hem.</p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="font-semibold text-gray-800 mb-1">Chest</p>
                  <p>Measure around the fullest part of your chest, keeping the tape under your armpits.</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 mb-1">Waist</p>
                  <p>Measure around your natural waistline, just above the hip bone.</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 mb-1">Shoulder</p>
                  <p>Measure from the edge of one shoulder to the other across the back.</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 mb-1">Length</p>
                  <p>Measure from the highest point of the shoulder down to the desired hem length.</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, loadCart, setLoginModalOpen, addToWishlistLocal, isInWishlist, setCartItems } = useApp()

  const [product, setProduct] = useState(null)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [popupImg, setPopupImg] = useState(null)
  const [zipcodes, setZipcodes] = useState([])
  const [pincodeInput, setPincodeInput] = useState('')
  const [zipMsg, setZipMsg] = useState('')
  const [isZipValid, setIsZipValid] = useState(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [addingCart, setAddingCart] = useState(false)
  const [similarProducts, setSimilarProducts] = useState([])
  const [showProductDetailsPopup, setShowProductDetailsPopup] = useState(false)
  const [showSizeChart, setShowSizeChart] = useState(false)
  const productDetailsRef = useRef(null)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setProduct(null)
    setSelectedVariant(null)
    setSelectedSize(null)
    setReviews([])
    setSimilarProducts([])
    setLoading(true)

    if (!id) return

    getProducts()
      .then(r => {
        const all = Array.isArray(r.data) ? r.data : r.data?.products || []
        const found = all.find(p => p._id === id)
        if (found) {
          setProduct(found)
          setSelectedVariant(found.variants?.[0] || null)
          const foundSubcategoryId = found.subcategoryId?._id || found.subcategoryId
          const similar = all.filter((p) => {
            const productSubcategoryId = p.subcategoryId?._id || p.subcategoryId
            return productSubcategoryId === foundSubcategoryId && p._id !== found._id
          }).slice(0, 6)
          setSimilarProducts(similar)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))

    getReview(id)
      .then(r => setReviews(r.data?.reviews || r.data || []))
      .catch(() => {})

    getPincodes()
      .then(r => setZipcodes(r.data?.pincodes || r.data || []))
      .catch(() => {})
  }, [id])

  // Close product details popup on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (productDetailsRef.current && !productDetailsRef.current.contains(e.target)) {
        setShowProductDetailsPopup(false)
      }
    }
    if (showProductDetailsPopup) {
      document.addEventListener('mousedown', handleOutside)
    }
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [showProductDetailsPopup])

  const onColorSelect = (variant) => {
    setSelectedVariant(variant)
    setSelectedSize(null)
  }

  const onSizeSelect = (size) => {
    setSelectedSize(size)
  }

  const toggleWishlist = (product) => {
    const wasInWishlist = isInWishlist(product?._id)
    addToWishlistLocal(product)
    toast.success(wasInWishlist ? 'Removed from wishlist' : 'Added to wishlist!')
  }

  const addToGuestCart = () => {
    if (!selectedSize?.size) { toast.error('Please select a size'); return }
    const guestCart = localStorage.getItem('guestCart')
    let cart = []
    if (guestCart) { try { cart = JSON.parse(guestCart) } catch { cart = [] } }
    const basePrice = selectedSize?.price ?? selectedSize?.finalPrice ?? 0
    const discountPercentage = selectedSize?.discountPercentage ?? 0
    const image = selectedVariant?.images?.[0]?.url || selectedVariant?.images?.[0] || product.image
    const existingIndex = cart.findIndex(item =>
      item.productId?._id === product._id &&
      item.variant?.color === selectedVariant?.color &&
      item.variant?.size === selectedSize?.size
    )
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += 1
    } else {
      cart.push({
        _id: Date.now().toString(),
        productId: product,
        name: product.name,
        image,
        quantity: 1,
        price: Number(basePrice) || 0,
        variant: {
          color: selectedVariant?.color,
          size: selectedSize?.size,
          price: Number(basePrice) || 0,
          discountPercentage: Number(discountPercentage) || 0,
        }
      })
    }
    localStorage.setItem('guestCart', JSON.stringify(cart))
    setCartItems(cart)
    toast.success('Added to cart!')
  }

  const handleAddToCart = async () => {
    if (!product?._id) { toast.error('Product not found'); return }
    if (!selectedSize?.size) { toast.error('Please select a size'); return }
    if (!user) { addToGuestCart(); return }
    const userId = user?._id || user?.id
    if (!userId) { toast.error('Please login again'); setLoginModalOpen(true); return }
    const basePrice = selectedSize?.price ?? selectedSize?.finalPrice ?? 0
    const discountPercentage = selectedSize?.discountPercentage ?? 0
    const image = selectedVariant?.images?.[0]?.url || selectedVariant?.images?.[0] || product.image
    setAddingCart(true)
    try {
      await addToCart({
        userId,
        items: [{
          productId: product._id,
          image,
          variant: {
            color: selectedVariant?.color,
            size: selectedSize.size,
            price: Number(basePrice) || 0,
            discountPercentage: Number(discountPercentage) || 0,
          },
          quantity: 1,
        }],
      })
      await loadCart()
      toast.success('Added to cart!')
    } catch (err) {
      if (err?.response?.status === 401) {
        toast.error('Session expired. Please login again.')
        setLoginModalOpen(true)
        return
      }
      const message = err?.response?.data?.message || err?.response?.data?.error || err?.message
      toast.error(message || 'Failed to add to cart')
    } finally {
      setAddingCart(false)
    }
  }

  const handleBuyNow = async () => {
    if (!user) { setLoginModalOpen(true); toast.info('Please login to continue with Buy Now'); return }
    if (!selectedSize) { toast.error('Please select a size'); return }
    try {
      const payload = {
        product: { _id: product?._id, name: product?.name, image: product?.image, metaTitle: product?.metaTitle },
        selectedVariant: selectedVariant ? {
          color: selectedVariant?.color, colorCode: selectedVariant?.colorCode,
          rating: selectedVariant?.rating, images: selectedVariant?.images,
        } : null,
        selectedSize: selectedSize ? {
          size: selectedSize?.size, price: selectedSize?.price,
          finalPrice: selectedSize?.finalPrice, discountPercentage: selectedSize?.discountPercentage,
        } : null,
      }
      localStorage.setItem('buynow_product', JSON.stringify(payload))
      navigate('/buynow')
    } catch (e) {
      toast.error('Buy now failed. Please try again.')
    }
  }

  const handlePincodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setPincodeInput(value)
    setZipMsg('')
    setIsZipValid(null)
    if (value.length === 6) checkPincode(value)
  }

  const checkPincode = (pin) => {
    const pinToCheck = pin || pincodeInput
    if (!pinToCheck || pinToCheck.length !== 6) return
    const valid = zipcodes.some(z => {
      const pinValue = typeof z === 'string' ? z : z?.pincode?.toString() || z?.toString()
      return pinValue === pinToCheck
    })
    setIsZipValid(valid)
    setZipMsg('Delivery available')
  }

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null

  if (loading) return <div className="flex justify-center py-20"><div className="spinner-loader" /></div>
  if (!product) return <div className="text-center py-20 text-gray-500">Product not found</div>

  const allImages = selectedVariant?.images || []

  const mrp = selectedSize?.price ?? product.variants?.[0]?.sizes?.[0]?.price ?? 0
  const finalPrice = selectedSize?.finalPrice ?? product.variants?.[0]?.sizes?.[0]?.finalPrice ?? 0
  const discountPct = selectedSize?.discountPercentage ?? product.variants?.[0]?.sizes?.[0]?.discountPercentage ?? 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="flex gap-2 items-center px-4 py-3 text-xs text-gray-500 flex-wrap">
        <span className="cursor-pointer hover:text-[#800000]" onClick={() => navigate('/')}>Home</span>
        <span>›</span>
        {product.categoryId?.name && <><span className="capitalize">{product.categoryId.name}</span><span>›</span></>}
        {product.subcategoryId?.name && <><span className="capitalize">{product.subcategoryId.name}</span><span>›</span></>}
        {product.subsubcategoryId?.name && (
          <span className="cursor-pointer capitalize hover:text-[#800000]" onClick={() => navigate(-1)}>
            {product.subsubcategoryId.name}
          </span>
        )}
        <span>›</span>
        <strong className="text-gray-800">{product.name}</strong>
      </div>

      {/* Main Product Section */}
      <div className="flex flex-col lg:flex-row gap-6 px-4 pb-8">

        {/* Gallery */}
        <div className="w-full lg:w-[55%] xl:w-[50%]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {allImages.map((img, i) => (
              <div key={i} className="relative aspect-[3/4]">
                <img
                  src={img.url || img}
                  alt={`${product.name} ${i + 1}`}
                  className="w-full h-full object-cover rounded-xl border border-gray-200 cursor-pointer hover:border-[#800000] transition-all"
                  onClick={() => setPopupImg(img.url || img)}
                  onError={e => { e.target.src = 'https://via.placeholder.com/400' }}
                />
                {i === 0 && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(product) }}
                    className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-lg hover:scale-110 active:scale-95 transition z-10"
                  >
                    <svg className="w-6 h-6" fill={isInWishlist(product._id) ? '#800000' : 'none'} stroke="#800000" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Info Panel */}
        <div className="w-full lg:w-[45%] xl:w-[50%] max-w-xl">
          <h1 className="text-2xl lg:text-3xl font-semibold capitalize mb-1">{product.name}</h1>
          <p className="text-gray-400 text-sm lg:text-base mb-3">{product.metaTitle}</p>

          {selectedVariant?.rating && (
            <span className="inline-flex items-center gap-1 bg-gray-100 text-[#800000] px-3 py-1 rounded-full text-sm font-medium mb-3">
              {selectedVariant.rating} <span className="text-yellow-400">★</span>
            </span>
          )}

          {/* ═══════════════════════════════════════════
              PRICE ROW — clicking shows Product Details popup
          ═══════════════════════════════════════════ */}
          <div className="mb-4 relative" ref={productDetailsRef}>
            {/* Clickable Price Row */}
            <div
              className="flex items-center gap-3 flex-wrap cursor-pointer select-none"
              onClick={() => setShowProductDetailsPopup(prev => !prev)}
            >
              <span className="text-3xl font-bold text-gray-900">₹{finalPrice}</span>
              {discountPct > 0 && (
                <>
                  <span className="text-lg text-gray-400 line-through">₹{mrp}</span>
                  <span className="text-[#800000] font-semibold text-base">({discountPct}% OFF)</span>
                </>
              )}
            </div>

            {selectedSize && (
              <p className="text-sm text-gray-600 mt-1">
                Selected Size: <span className="font-semibold">{selectedSize.size}</span>
              </p>
            )}

            {/* ── Product Details Popup (replaces price popup) ── */}
            {showProductDetailsPopup && (
              <div className="absolute top-12 left-0 z-40 border border-gray-200 rounded-xl p-4 bg-white shadow-xl w-72">
                <h5 className="font-semibold text-[#800000] flex items-center gap-2 mb-3 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Product Details
                </h5>

                {product.description && (
                  <p className="text-gray-600 text-xs mb-3 leading-relaxed line-clamp-3">{product.description}</p>
                )}

                <div className="divide-y divide-gray-100">
                  {selectedSize?.size && (
                    <div className="flex justify-between py-2">
                      <span className="text-gray-500 text-xs font-medium">Size</span>
                      <span className="text-gray-800 text-xs font-semibold">{selectedSize.size}</span>
                    </div>
                  )}
                  {product.brand && (
                    <div className="flex justify-between py-2">
                      <span className="text-gray-500 text-xs font-medium">Brand</span>
                      <span className="text-gray-800 text-xs font-semibold">{product.brand}</span>
                    </div>
                  )}
                  {product.speciality && (
                    <div className="flex justify-between py-2">
                      <span className="text-gray-500 text-xs font-medium">Speciality</span>
                      <span className="text-gray-800 text-xs font-semibold">{product.speciality}</span>
                    </div>
                  )}
                  {product.metaTitle && (
                    <div className="flex justify-between py-2">
                      <span className="text-gray-500 text-xs font-medium">Material</span>
                      <span className="text-gray-800 text-xs font-semibold">{product.metaTitle}</span>
                    </div>
                  )}
                  {product.categoryId?.name && (
                    <div className="flex justify-between py-2">
                      <span className="text-gray-500 text-xs font-medium">Category</span>
                      <span className="text-gray-800 text-xs font-semibold capitalize">{product.categoryId.name}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sizes */}
          {selectedVariant?.sizes?.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-[#800000]">Available Sizes</label>
                <button
                  type="button"
                  onClick={() => setShowSizeChart(true)}
                  className="text-xs text-gray-500 cursor-pointer hover:text-[#800000] underline transition-colors"
                >
                  Size Chart
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedVariant.sizes.map(sz => (
                  <button
                    key={sz.size}
                    onClick={() => onSizeSelect(sz)}
                    disabled={sz.isAvailable === false}
                    className={`min-w-[50px] px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                      selectedSize?.size === sz.size
                        ? 'border-[#800000] bg-[#800000] text-white'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-[#800000]'
                    } ${sz.isAvailable === false ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}>
                    {sz.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colors */}
          {product.variants?.length > 0 && (
            <div className="mb-4">
              <label className="text-sm font-semibold block mb-2">Color</label>
              <div className="flex gap-3">
                {product.variants.map(v => (
                  <button
                    key={v.color}
                    title={v.color}
                    onClick={() => onColorSelect(v)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${selectedVariant?.color === v.color ? 'border-[#800000] scale-110 ring-2 ring-offset-2 ring-[#800000]' : 'border-gray-300'}`}
                    style={{ backgroundColor: v.colorCode }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 mb-6">
            <button type="button" onClick={handleAddToCart} disabled={addingCart}
              className="w-full bg-[#800000] text-white py-3.5 rounded-lg text-base font-semibold hover:bg-[#600000] disabled:opacity-60 transition-colors">
              {addingCart ? 'Adding...' : '🛒 Add to Cart'}
            </button>
            <button type="button" onClick={handleBuyNow} disabled={!selectedSize}
              className="w-full py-3.5 rounded-lg text-white font-semibold text-base bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-300 hover:from-yellow-600 hover:to-yellow-400 shadow-md hover:shadow-lg transition-all duration-300">
              ⚡ Buy Now
            </button>
            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              className={`w-full py-3.5 rounded-lg text-base font-semibold border-2 transition-all duration-300 flex items-center justify-center gap-2
                ${isInWishlist(product._id)
                  ? 'border-red-500 text-red-500 hover:bg-red-50'
                  : 'border-[#800000] text-[#800000] hover:bg-[#800000] hover:text-white'}`}>
              <svg className="w-5 h-5" fill={isInWishlist(product._id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {isInWishlist(product._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </button>
          </div>

          {/* Delivery Info */}
          <div className="border border-gray-200 rounded-xl p-4 mb-4 bg-white">
            <p className="text-sm text-gray-500 mb-3 font-medium">100% Original Products</p>
            <div className="flex gap-2 mb-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={pincodeInput}
                  onChange={handlePincodeChange}
                  placeholder="Enter 6 digit pincode"
                  maxLength={6}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000]"
                />
                {isZipValid === true && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
            {zipMsg && (
              <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {zipMsg}
              </div>
            )}
            <ul className="space-y-2 text-sm text-gray-600 mt-4">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#800000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Get it by May 8 — Fast Delivery available
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#800000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Best Price
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#800000] font-bold">₹</span>
                Cash on Delivery
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#800000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                8 days Return
              </li>
            </ul>
            <p className="text-sm font-semibold text-gray-800 mt-3">Kanchira Trusted</p>
          </div>

          {/* ═══════════════════════════════════════════
              PRODUCT DETAILS CARD (kept below)
          ═══════════════════════════════════════════ */}
          <div className="border border-gray-200 rounded-xl p-4 mb-4 bg-white">
            <h5 className="font-semibold text-[#800000] flex items-center gap-2 mb-4 text-base">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Product Details
            </h5>

            {product.description && (
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">{product.description}</p>
            )}

            <div className="divide-y divide-gray-100">
              {selectedSize?.size && (
                <div className="flex justify-between py-2.5">
                  <span className="text-gray-500 text-sm font-medium">Size</span>
                  <span className="text-gray-800 text-sm font-semibold">{selectedSize.size}</span>
                </div>
              )}
              {product.brand && (
                <div className="flex justify-between py-2.5">
                  <span className="text-gray-500 text-sm font-medium">Brand</span>
                  <span className="text-gray-800 text-sm font-semibold">{product.brand}</span>
                </div>
              )}
              {product.speciality && (
                <div className="flex justify-between py-2.5">
                  <span className="text-gray-500 text-sm font-medium">Speciality</span>
                  <span className="text-gray-800 text-sm font-semibold">{product.speciality}</span>
                </div>
              )}
              {product.metaTitle && (
                <div className="flex justify-between py-2.5">
                  <span className="text-gray-500 text-sm font-medium">Material</span>
                  <span className="text-gray-800 text-sm font-semibold">{product.metaTitle}</span>
                </div>
              )}
              {product.categoryId?.name && (
                <div className="flex justify-between py-2.5">
                  <span className="text-gray-500 text-sm font-medium">Category</span>
                  <span className="text-gray-800 text-sm font-semibold capitalize">{product.categoryId.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Customer Reviews Summary */}
          <div className="border border-gray-200 rounded-xl p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-base">Customer Reviews</h4>
              <button onClick={() => navigate(`/all-reviews/${id}`)} className="text-sm text-[#800000] hover:underline font-medium">
                View All ({reviews.length})
              </button>
            </div>
            {avgRating && (
              <div className="flex items-center gap-2 mb-3">
                {[1,2,3,4,5].map(n => (
                  <span key={n} className={`text-lg ${n <= Math.round(avgRating) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                ))}
                <span className="text-sm text-gray-600 font-medium">{avgRating} / 5</span>
              </div>
            )}
            <div className="space-y-2 mb-4">
              {[5,4,3,2,1].map(star => {
                const count = reviews.filter(r => Math.round(r.rating) === star).length
                const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs w-6 font-medium">{star} ★</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#800000] rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 w-8">{pct}%</span>
                  </div>
                )
              })}
            </div>
            <button
              onClick={() => { if (!user) { setLoginModalOpen(true); return }; setReviewDialogOpen(true) }}
              className="w-full border border-[#800000] text-[#800000] py-2.5 rounded-lg text-sm font-semibold hover:bg-[#800000] hover:text-white transition-all">
              Write a Review
            </button>
            {reviews.slice(0, 3).map((r, i) => (
              <div key={i} className="border-t border-gray-100 pt-3 mt-3">
                <div className="flex items-center gap-2 mb-1">
                  {[1,2,3,4,5].map(n => (
                    <span key={n} className={`text-sm ${n <= r.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                  ))}
                  <span className="text-xs text-gray-500 font-medium">{r.userId?.name || 'Customer'}</span>
                </div>
                <p className="text-sm text-gray-600">{r.text}</p>
                {r.images?.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {r.images.map((img, j) => (
                      <img key={j} src={img} alt="" className="w-12 h-12 rounded object-cover cursor-pointer" onClick={() => setPopupImg(img)} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div className="px-4 pb-12">
          <h2 className="text-center text-[24px] lg:text-[28px] font-bold text-[#8B1E3F] bg-[rgba(255,192,203,0.25)] py-4 mb-6 rounded-lg">
            Similar Products
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
            {similarProducts.map((p) => (
              <div key={p._id} className="cursor-pointer text-center bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-2 md:p-3 group relative">
                <div className="overflow-hidden rounded-lg relative">
                  <img
                    src={p.variants?.[0]?.images?.[0]?.url || p.variants?.[0]?.images?.[0] || p.image || 'https://via.placeholder.com/400'}
                    alt={p.name}
                    className="w-full h-[120px] md:h-[180px] lg:h-[220px] object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                    onClick={() => navigate(`/product-details/${p._id}`)}
                    onError={e => { e.target.src = 'https://via.placeholder.com/400' }}
                  />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(p) }}
                    className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow hover:scale-110 active:scale-95 transition"
                  >
                    <svg className="w-4 h-4" fill={isInWishlist(p._id) ? '#800000' : 'none'} stroke="#800000" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
                <h6 className="text-[#8B1E3F] text-[10px] md:text-[12px] lg:text-[14px] mt-2 font-medium truncate px-1" onClick={() => navigate(`/product-details/${p._id}`)}>
                  {p.name}
                </h6>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-gray-900 font-bold text-[11px] md:text-[13px] lg:text-[14px]">
                    ₹{p.variants?.[0]?.sizes?.[0]?.finalPrice || p.price}
                  </span>
                  {p.variants?.[0]?.sizes?.[0]?.discountPercentage > 0 && (
                    <>
                      <span className="text-gray-400 text-[10px] md:text-[11px] line-through">₹{p.variants?.[0]?.sizes?.[0]?.price}</span>
                      <span className="text-green-600 text-[9px] md:text-[10px] font-medium">({p.variants?.[0]?.sizes?.[0]?.discountPercentage}% OFF)</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Popup */}
      {popupImg && <ImagePopup src={popupImg} onClose={() => setPopupImg(null)} />}

      {/* Review Dialog */}
      {reviewDialogOpen && (
        <ReviewDialog
          productId={id}
          userId={user?._id || user?.id}
          onClose={() => setReviewDialogOpen(false)}
          onSuccess={() => {
            setReviewDialogOpen(false)
            getReview(id).then(r => setReviews(r.data?.reviews || r.data || [])).catch(() => {})
          }}
        />
      )}

      {/* Size Chart Modal */}
      {showSizeChart && (
        <SizeChartModal
          product={product}
          selectedVariant={selectedVariant}
          onClose={() => setShowSizeChart(false)}
          onSizeSelect={(sz) => {
            onSizeSelect(sz)
            setShowSizeChart(false)
          }}
        />
      )}
    </div>
  )
}