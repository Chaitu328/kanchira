


import { useEffect, useMemo, useState } from 'react'

function uniqStrings(values) {
  const out = []
  values.forEach((v) => {
    const s = String(v || '').trim()
    if (!s) return
    if (!out.includes(s)) out.push(s)
  })
  return out
}

export default function FilterSidebar({
  products = [],
  maxPrice,
  maxRange,
  setMaxPrice,
  selectedColors,
  setSelectedColors,
  discounts,
  setDiscounts,
  selectedBrands,
  setSelectedBrands,
  showBrands = true,
  onClear
}) {
  const [showAllColors, setShowAllColors] = useState(false)
  const [showAllBrands, setShowAllBrands] = useState(false)

  const colors = useMemo(() => {
    const uniqueColors = []
    products.forEach((p) => {
      p.variants?.forEach((v) => {
        if (!v?.color) return
        if (!uniqueColors.find((c) => c.name === v.color)) {
          uniqueColors.push({
            name: v.color,
            code: v.colorCode || '#ccc'
          })
        }
      })
    })
    return uniqueColors
  }, [products])

  const brands = useMemo(() => {
    return uniqStrings(products.map((p) => p.brand))
  }, [products])

  useEffect(() => {
    setShowAllColors(false)
    setShowAllBrands(false)
  }, [products])

 const toggleDiscount = (range) => {
  setDiscounts((prev) => {
    const exists = prev.some(
      (d) => d.min === range.min && d.max === range.max
    );

    if (exists) {
      return prev.filter(
        (d) => !(d.min === range.min && d.max === range.max)
      );
    } else {
      return [...prev, range];
    }
  });
};
  const toggleBrand = (b) => {
    setSelectedBrands((prev) => (prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]))
  }

  const visibleColors = showAllColors ? colors : colors.slice(0, 7)
  const visibleBrands = showAllBrands ? brands : brands.slice(0, 8)

  const toggleColor = (colorName) => {
    setSelectedColors((prev) => {
      const safePrev = Array.isArray(prev) ? prev : []
      return safePrev.includes(colorName) ? safePrev.filter((c) => c !== colorName) : [...safePrev, colorName]
    })
  }

  return (
    <div className="w-72 bg-white border border-black/5 rounded-lg shadow-sm">
      <div className="flex items-center justify-between px-[10px] py-[10px] border-b">
        <h3 className="font-semibold text-black">Filters</h3>
        <button
          type="button"
          onClick={onClear}
          className="text-sm font-medium text-[#800000] hover:underline"
        >
          Clear All
        </button>
      </div>

      <div className="p-[15px] space-y-6">
        <div className="space-y-2">
          <p className="text-lg font-15 text-black/80">Price Range</p>
          <input
            type="range"
            min="0"
            max={maxRange || 5000}
            value={Math.min(Number(maxPrice || 0), Number(maxRange || 5000))}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full accent-[#800000] cursor-pointer"
          />
          <p className="text-sm text-black/70">Price Range: {Number(maxPrice || 0)}</p>
        </div>

        <div className="space-y-3">
          <p className="text-lg font-15 text-black/80">Color</p>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-md cursor-pointer">
              <input
                type="checkbox"
                checked={!Array.isArray(selectedColors) || selectedColors.length === 0}
                onChange={() => setSelectedColors([])}
                className="hidden peer"
              />
               <div className="w-4 h-4 rounded-full border-2 border-[#800000] flex items-center justify-center peer-checked:bg-[#800000]">
    <div className="w-2.5 h-2.5 rounded-full bg-white hidden peer-checked:block"></div>
  </div>
              All
            </label>

            {visibleColors.map((c) => (
              <label key={c.name} className="flex items-center gap-2 text-md cursor-pointer">
              <label key={c.name} className="flex items-center gap-2 cursor-pointer">
  <input
    type="checkbox"
    checked={Array.isArray(selectedColors) && selectedColors.includes(c.name)}
    onChange={() => toggleColor(c.name)}
    className="hidden peer"
  />

  {/* Circle */}
  <div className="w-4 h-4 rounded-full border-2 border-[#800000] flex items-center justify-center peer-checked:bg-[#800000]">
    <div className="w-1.5 h-1.5 rounded-full bg-white hidden peer-checked:block"></div>
  </div>

  {/* Color + Name */}
  <span className="inline-flex items-center gap-2">
    <span
      className="w-4 h-4 rounded-full border border-black/10"
      style={{ backgroundColor: c.name }}
    />
    <span className="capitalize">{c.name}</span>
  </span>
</label>
               
              </label>
            ))}

            {colors.length > 7 ? (
              <button
                type="button"
                onClick={() => setShowAllColors((v) => !v)}
                className="text-sm text-[#800000] hover:underline"
              >
                {showAllColors ? 'View Less' : 'View More'}
              </button>
            ) : null}
          </div>
        </div>
{/* 🔥 DISCOUNT */}
<div className="space-y-3">
  <p className="text-md font-15 text-black/80">Discount %</p>

  <div className="space-y-2">
    {[
      { label: "0 - 10%", min: 0, max: 10 },
      { label: "10 - 15%", min: 10, max: 15 },
      { label: "15 - 20%", min: 15, max: 20 },
      { label: "20 - 25%", min: 20, max: 25 },
      { label: "30% & above", min: 30, max: 100 },
    ].map((range, i) => (
      <label key={i} className="flex items-center gap-2 text-md cursor-pointer">
      <label key={i} className="flex items-center gap-2 cursor-pointer">
  <input
    type="checkbox"
    checked={discounts.some(
      (d) => d.min === range.min && d.max === range.max
    )}
    onChange={() => toggleDiscount(range)}
    className="hidden peer"
  />

  {/* Circle */}
  <div className="w-4 h-4 rounded-full border-2 border-[#800000] flex items-center justify-center peer-checked:bg-[#800000]">
    <div className="w-2.5 h-2.5 rounded-full bg-white hidden peer-checked:block"></div>
  </div>

  {range.label}
</label>
       
      </label>
    ))}
  </div>
</div>

        {showBrands ? (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-black/80">Brands</p>
            <div className="space-y-2">
              {visibleBrands.length ? (
                visibleBrands.map((b) => (
                  <label key={b} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(b)}
                      onChange={() => toggleBrand(b)}
                      className="accent-[#800000]"
                    />
                    {b}
                  </label>
                ))
              ) : (
                <div className="text-sm text-black/50">No brands</div>
              )}

              {brands.length > 8 ? (
                <button
                  type="button"
                  onClick={() => setShowAllBrands((v) => !v)}
                  className="text-sm text-[#800000] hover:underline"
                >
                  {showAllBrands ? 'View Less' : 'View More'}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}