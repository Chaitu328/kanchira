export default function SortDrawer({ open, onClose, sortOption, setSortOption }) {
  if (!open) return null

  const choose = (value) => {
    setSortOption(value)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end z-50">
      <div className="bg-white w-full p-4 rounded-t-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Sort by</h3>
          <button type="button" onClick={onClose} className="text-xl">✕</button>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => choose('')}
            className={`block w-full text-left py-2 px-2 rounded hover:bg-gray-100 ${!sortOption ? 'font-semibold text-[#800000]' : ''}`}
          >
            Relevance
          </button>
          <button
            type="button"
            onClick={() => choose('price_low')}
            className={`block w-full text-left py-2 px-2 rounded hover:bg-gray-100 ${sortOption === 'price_low' ? 'font-semibold text-[#800000]' : ''}`}
          >
            Price Low to High
          </button>
          <button
            type="button"
            onClick={() => choose('price_high')}
            className={`block w-full text-left py-2 px-2 rounded hover:bg-gray-100 ${sortOption === 'price_high' ? 'font-semibold text-[#800000]' : ''}`}
          >
            Price High to Low
          </button>
        </div>
      </div>
    </div>
  )
}

