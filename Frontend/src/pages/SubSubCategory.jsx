import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getProducts, getProductsBySubCategory, getSub_SubCategoryById } from '../services/api'
import { useApp } from '../context/AppContext'

import FilterSidebar from '../components/auth/FilterSidebar'
import SortDrawer from '../components/auth/SortDrawer'

function uniqStrings(values) {
  const out = []
  values.forEach((v) => {
    const s = String(v || '').trim()
    if (!s) return
    if (!out.includes(s)) out.push(s)
  })
  return out
}

function getFinalPrices(product) {
  const out = []
  product?.variants?.forEach((v) => {
    v?.sizes?.forEach((s) => {
      const n = Number(s?.finalPrice)
      if (Number.isFinite(n)) out.push(n)
    })
  })
  return out
}

function getMinFinalPrice(product) {
  const prices = getFinalPrices(product)
  if (!prices.length) return null
  return Math.min(...prices)
}

function getMaxFinalPriceFromProducts(list) {
  const prices = []
  list.forEach((p) => prices.push(...getFinalPrices(p)))
  const max = prices.length ? Math.max(...prices) : 0
  return max > 0 ? max : 5000
}

export default function SubSubCategory() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user, setLoginModalOpen, addToWishlistLocal, isInWishlist } = useApp()

  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])

  const [subSubCats, setSubSubCats] = useState([])
  const [selectedSubSubId, setSelectedSubSubId] = useState(null)

  const [loadingCats, setLoadingCats] = useState(true)
  const [loading, setLoading] = useState(false)

  // FILTER STATES
  const [maxRange, setMaxRange] = useState(5000)
  const [maxPrice, setMaxPrice] = useState(5000)
  const [selectedColors, setSelectedColors] = useState([])
  const [discounts, setDiscounts] = useState([])
  const [selectedBrands, setSelectedBrands] = useState([])
  const [sortOption, setSortOption] = useState('')
  const [brandsOpen, setBrandsOpen] = useState(true)

  // MOBILE
  const [showFilters, setShowFilters] = useState(false)
  const [showSort, setShowSort] = useState(false)

  // EXTRA
  const [quickView, setQuickView] = useState(null)

  const subCategoryId = id || localStorage.getItem('subCategoryId')

  const selectedSubSub = useMemo(() => {
    return subSubCats.find((s) => s?._id === selectedSubSubId) || null
  }, [subSubCats, selectedSubSubId])

  const brands = useMemo(() => {
    return uniqStrings(products.map((p) => p.brand))
  }, [products])

  const applyLoadedProducts = (list) => {
    const safeList = Array.isArray(list) ? list : []
    const range = getMaxFinalPriceFromProducts(safeList)
    setProducts(safeList)
    setFilteredProducts(safeList)
    setMaxRange(range)
    setMaxPrice(range)
    setSelectedColors([])
    setDiscounts([])
    setSelectedBrands([])
    setSortOption('')
  }

  const clearFilters = () => {
    setMaxPrice(maxRange)
    setSelectedColors([])
    setDiscounts([])
    setSelectedBrands([])
    setSortOption('')
  }
  // ✅ ADD THIS
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  /* ---------- LOAD SUB SUB CATEGORY ---------- */
  useEffect(() => {
    if (!subCategoryId) return

    setLoadingCats(true)
    getSub_SubCategoryById(subCategoryId)
      .then((r) => {
        const list = r?.data?.Sub_SubCategories || r?.data?.sub_SubCategories || r?.data || []
        const safeList = Array.isArray(list) ? list : []
        setSubSubCats(safeList)

        if (safeList.length > 0) {
          loadProducts(safeList[0]._id)
        } else {
          setProducts([])
          setFilteredProducts([])
          setLoading(false)
        }
      })
      .finally(() => setLoadingCats(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subCategoryId])

  /* ---------- LOAD PRODUCTS ---------- */
  const loadProducts = (subSubId) => {
    setSelectedSubSubId(subSubId)
    setLoading(true)

    getProductsBySubCategory(subSubId)
      .then((r) => {
        const list = r?.data?.products || r?.data?.Products || r?.data || []
        if (Array.isArray(list) && list.length) {
          applyLoadedProducts(list)
          return
        }

        return getProducts().then((res) => {
          const all = res.data?.products || res.data || []
          const safeAll = Array.isArray(all) ? all : []
          const filtered = safeAll.filter(
            (p) => (p.subsubcategoryId?._id || p.subsubcategoryId) === subSubId
          )
          applyLoadedProducts(filtered)
        })
      })
      .finally(() => setLoading(false))
  }

  /* ---------- FILTER + SORT ---------- */
  useEffect(() => {
    let temp = [...products]
     
    // PRICE (max)
    temp = temp.filter((p) => {
      const min = getMinFinalPrice(p)
      if (min == null) return true
      return min <= maxPrice
    })

    // COLOR (multi)
    if (Array.isArray(selectedColors) && selectedColors.length) {
      const set = new Set(selectedColors)
      temp = temp.filter((p) => p.variants?.some((v) => set.has(v.color)))
    }

    // DISCOUNT
    if (discounts.length > 0) {
      temp = temp.filter((p) =>
        p.variants?.some((v) =>
          v.sizes?.some((s) => {
            const dis = Number(s.discountPercentage || 0);
            return discounts.some(
              (range) => dis >= range.min && dis < range.max
            );
          })
        )
      );
    }

    // BRANDS
    if (selectedBrands.length) {
      temp = temp.filter((p) => selectedBrands.includes(String(p.brand || '').trim()))
    }

    // SORT
    if (sortOption === 'price_low') {
      temp.sort((a, b) => (getMinFinalPrice(a) ?? Infinity) - (getMinFinalPrice(b) ?? Infinity))
    } else if (sortOption === 'price_high') {
      temp.sort((a, b) => (getMinFinalPrice(b) ?? -Infinity) - (getMinFinalPrice(a) ?? -Infinity))
    }

    setFilteredProducts(temp)
  }, [products, maxPrice, selectedColors, discounts, selectedBrands, sortOption])

  /* ---------- WISHLIST ---------- */
  const toggleWishlist = (product) => {
    const wasInWishlist = isInWishlist(product?._id);
    addToWishlistLocal(product);
    toast.success(
      wasInWishlist
        ? "Removed from wishlist"
        : "Added to wishlist!"
    );
  };

  // Helper to get price display data
  const getPriceData = (pro) => {
    const variant = pro?.variants?.[0]
    const size = variant?.sizes?.[0]
    const originalPrice = size?.price || size?.mrp || null
    const finalPrice = size?.finalPrice || size?.salePrice || null
    const discountPercentage = Number(size?.discountPercentage || 0)
    
    return {
      originalPrice,
      finalPrice,
      discountPercentage,
      hasDiscount: discountPercentage > 0 && originalPrice && originalPrice > finalPrice
    }
  }

  return (
    <div className="min-h-screen bg-white pb-16" style={{ fontFamily: '"DM Sans","Roboto",sans-serif' }}>
      <div className="w-full px-[10px] py-[10px]">
        <div className="text-sm text-black/60">
          Home <span className="px-1">/</span> {selectedSubSub?.name || 'Products'}
        </div>

        <div className="mt-4 flex gap-[10px]">
          <div className="hidden lg:block shrink-0">
            <FilterSidebar
              products={products}
              maxPrice={maxPrice}
              maxRange={maxRange}
              setMaxPrice={setMaxPrice}
              selectedColors={selectedColors}
              setSelectedColors={setSelectedColors}
              discounts={discounts}
              setDiscounts={setDiscounts}
              selectedBrands={selectedBrands}
              setSelectedBrands={setSelectedBrands}
              showBrands={false}
              onClear={clearFilters}
            />
          </div>

          <div className="flex-1 min-w-0">
            {/* SUB SUB CATEGORY STRIP */}
            <div className="flex gap-8 overflow-x-auto py-3">
              {subSubCats.map((ss) => {
                const selected = selectedSubSubId === ss?._id
                return (
                  <button
                    key={ss?._id}
                    type="button"
                    onClick={() => loadProducts(ss._id)}
                    className="flex flex-col items-center shrink-0"
                  >
                    <div
                      className={`rounded-full p-1 border-2 ${selected ? 'border-[#800000]' : 'border-black/10'}`}
                    >
                      <img
                        src={ss?.image || ss?.img || ss?.thumbnail || 'https://via.placeholder.com/120'}
                        alt={ss?.name || 'Subcategory'}
                        className="w-24 h-24 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/120'
                        }}
                      />
                    </div>
                    <div className={`mt-2 text-sm ${selected ? 'text-[#800000] font-semibold' : 'text-black/80'}`}>
                      {ss?.name}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* BRANDS (like screenshot) */}
            {brands.length ? (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => setBrandsOpen((v) => !v)}
                  className="flex items-center gap-2 text-sm font-medium text-black/80"
                >
                  Brands
                  <span className="text-xs text-black/50">{brandsOpen ? '▲' : '▼'}</span>
                </button>

                {brandsOpen ? (
                  <div className="mt-2 border border-black/10 rounded bg-white p-[10px] flex flex-wrap gap-x-6 gap-y-2">
                    {brands.map((b) => (
                      <label key={b} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(b)}
                          onChange={() =>
                            setSelectedBrands((prev) => (prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]))
                          }
                          className="accent-[#800000]"
                        />
                        {b}
                      </label>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* META ROW */}
            <div className="mt-2 flex items-center justify-between gap-3">
              <div className="text-sm text-black/70">Showing {filteredProducts.length} Products</div>

              <div className="hidden md:flex items-center gap-2">
                
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="border border-black/50 rounded-md bg-white px-3 py-2 text-sm"
                >
                  <option value="">Sort by</option>
                  <option value="price_low">Price Low to High</option>
                  <option value="price_high">Price High to Low</option>
                </select>
              </div>
            </div>

            {/* PRODUCTS */}
            <div className="mt-4">
              {loadingCats || loading ? (
                <div className="text-center py-20">Loading...</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {filteredProducts.map((pro) => {
                    const { originalPrice, finalPrice, discountPercentage, hasDiscount } = getPriceData(pro)
                    

                    
                    return (
                      <div key={pro._id} className="bg-white p-2 rounded shadow relative group">
                        {/* Discount Badge - Top Left */}
                        {hasDiscount && (
                          <div className="absolute top-2 left-2 bg-[#800000] text-white text-xs px-2 py-1 rounded z-10">
                            {discountPercentage}% OFF
                          </div>
                        )}

                        <img
                          src={pro.image}
                          className="w-[300px] h-[320px] object-cover rounded cursor-pointer"
                          onClick={() => navigate(`/product-details/${pro._id}`)}
                          alt={pro?.name || 'Product'}
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/400'
                          }}
                        />

                        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleWishlist(pro)
                            }}
                            className="bg-white p-1.5 rounded-full shadow"
                          >
                            <svg
                              className="w-5 h-5"
                              fill={isInWishlist(pro._id) ? '#800000' : 'none'}
                              stroke="#800000"
                              strokeWidth="1.8"
                              viewBox="0 0 24 24"
                            >
                              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setQuickView(pro)
                            }}
                            className="bg-white p-1.5 rounded-full shadow"
                          >
                            👁
                          </button>
                        </div>

                        <p className="text-xs mt-2 line-clamp-2">{pro.name}</p>

                        {/* UPDATED PRICE DISPLAY - Matches Screenshot */}
                        <div className="flex items-center gap-2 mt-2 mb-3">
                          {/* Original Price with Strikethrough (only if discount exists) */}
                          {hasDiscount && originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              ₹{originalPrice}
                            </span>
                          )}
                          
                          {/* Final Price - Always shown */}
                          <span className="text-lg font-bold text-[#800000]">
                            ₹{finalPrice || 'N/A'}
                          </span>
                          
                          {/* Discount Percentage Text (optional, shown next to price) */}
                          {hasDiscount && (
                            <span className="text-xs text-green-600 font-medium">
                              ({discountPercentage}% OFF)
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* QUICK VIEW */}
      {quickView && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] max-w-3xl rounded-lg p-4 relative">
            <button type="button" onClick={() => setQuickView(null)} className="absolute top-2 right-2 text-xl">
              ✕
            </button>

            <div className="grid md:grid-cols-2 gap-4">
              <img src={quickView.image} className="w-full h-80 object-cover rounded" alt="" />

              <div className="space-y-3">
                <h2 className="text-lg font-semibold">{quickView.name}</h2>

                {/* UPDATED QUICK VIEW PRICE */}
                {(() => {
                  const { originalPrice, finalPrice, hasDiscount, discountPercentage } = getPriceData(quickView)
                  return (
                    <div className="flex items-center gap-2">
                      {hasDiscount && originalPrice && (
                        <span className="text-sm text-gray-500 line-through">₹{originalPrice}</span>
                      )}
                      <span className="text-[#800000] font-bold text-lg">₹{finalPrice || 'N/A'}</span>
                      {hasDiscount && (
                        <span className="text-xs text-green-600 font-medium">({discountPercentage}% OFF)</span>
                      )}
                    </div>
                  )
                })()}

                <p className="text-sm text-gray-600">{quickView.description || 'No description'}</p>

                <button
                  type="button"
                  onClick={() => navigate(`/product-details/${quickView._id}`)}
                  className="bg-[#800000] text-white px-4 py-2 rounded"
                >
                  View Full Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE FILTER */}
      {showFilters && (
        <div className="fixed inset-0 z-50 bg-black/40">
          <div className="bg-white w-80 h-full p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">Filters</div>
              <button type="button" onClick={() => setShowFilters(false)} className="text-xl">
                ✕
              </button>
            </div>

            <FilterSidebar
              products={products}
              maxPrice={maxPrice}
              maxRange={maxRange}
              setMaxPrice={setMaxPrice}
              selectedColors={selectedColors}
              setSelectedColors={setSelectedColors}
              discounts={discounts}
              setDiscounts={setDiscounts}
              selectedBrands={selectedBrands}
              setSelectedBrands={setSelectedBrands}
              showBrands
              onClear={clearFilters}
            />
          </div>
        </div>
      )}

      {/* SORT */}
      <SortDrawer open={showSort} onClose={() => setShowSort(false)} sortOption={sortOption} setSortOption={setSortOption} />

      {/* MOBILE BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex lg:hidden gap-2 p-2">
        <button
          type="button"
          onClick={() => setShowSort(true)}
          className="flex-1 py-3 border-r border-[#800000] bg-[#800000] text-white hover:bg-white hover:text-[#800000] transition"
        >
          Sort
        </button>
        <button
          type="button"
          onClick={() => setShowFilters(true)}
          className="flex-1 py-3 border-r border-[#800000] bg-[#800000] text-white hover:bg-white hover:text-[#800000] transition"
        >
          Filter
        </button>
      </div>
    </div>
  )
}