

import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import toast from 'react-hot-toast'

export default function WishlistPage() {
  const navigate = useNavigate()

  const {
    wishlist,
    addToWishlistLocal,
    addToCartLocal,
    isInWishlist,
    setCartItems
  } = useApp()

  // ✅ ADD THIS HERE
 
  /* ---------- WISHLIST TOGGLE ---------- */
  const toggleWishlist = (product) => {
    const wasInWishlist = isInWishlist(product?._id);
    addToWishlistLocal(product);
    toast.success(
      wasInWishlist
        ? "Removed from wishlist"
        : "Added to wishlist!"
    );
  };

  // ✅ ADD TO CART - Auto-select first variant and size, NO size selection needed
  const handleAddToCart = (pro) => {
    console.log("CLICKED ADD TO CART FROM WISHLIST:", pro)

    try {
      // Auto-select first variant and first size
      const firstVariant = pro?.variants?.[0]
      const firstSize = firstVariant?.sizes?.[0]

      if (!firstSize) {
        toast.error('No size available for this product')
        return
      }

      const basePrice = firstSize?.finalPrice || firstSize?.price || 0
      const originalPrice = firstSize?.price || basePrice
      const discountPercentage = firstSize?.discountPercentage || 0
      const size = firstSize?.size || 'M'
      const color = firstVariant?.color || ''
      const image = firstVariant?.images?.[0]?.url || firstVariant?.images?.[0] || pro.image

      const item = {
        _id: Date.now().toString(),
        productId: pro, // Full product object
        name: pro.name,
        image: image,
        quantity: 1,
        price: Number(basePrice) || 0,
        variant: {
          color: color,
          size: size,
          price: Number(basePrice) || 0,
          originalPrice: Number(originalPrice) || 0,
          discountPercentage: Number(discountPercentage) || 0,
        }
      }

      console.log("ADDING ITEM FROM WISHLIST:", item)

      // Check if user is logged in
      const user = localStorage.getItem('user')
      
      if (!user) {
        // Guest user - add to localStorage directly
        const guestCart = localStorage.getItem('guestCart')
        let cart = []
        if (guestCart) {
          try {
            cart = JSON.parse(guestCart)
          } catch {
            cart = []
          }
        }

        // Check if item already exists
        const existingIndex = cart.findIndex(cartItem => 
          cartItem.productId?._id === pro._id && 
          cartItem.variant?.color === color &&
          cartItem.variant?.size === size
        )

        if (existingIndex >= 0) {
          cart[existingIndex].quantity += 1
          toast.success('Quantity updated in cart')
        } else {
          cart.push(item)
          toast.success('🛒 Added to cart')
        }

        localStorage.setItem('guestCart', JSON.stringify(cart))
        setCartItems(cart)
      } else {
        // Logged in user - use context function
        addToCartLocal(item)
        toast.success('🛒 Added to cart')
      }

    } catch (err) {
      console.error("ADD TO CART ERROR:", err)
      toast.error('Something went wrong')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-[28px] lg:text-[36px] font-bold text-[#8B1E3F] tracking-wide uppercase">
          This is Your Wishlist
        </h1>
        <div className="w-24 h-1 bg-[#8B1E3F] mx-auto mt-2 rounded-full"></div>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-20">
          <div className="mb-6">
            <svg className="w-20 h-20 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <p className="text-gray-500 mb-6 text-lg">
            Your wishlist is empty
          </p>
          <button
            className="bg-[#800000] text-white px-8 py-3 rounded-lg hover:opacity-90 transition shadow-lg"
            onClick={() => navigate('/')}
          >
            Shop Now
          </button>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            
            {wishlist.map((pro) => (
              <div
                key={pro._id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                {/* IMAGE */}
                <div className="relative overflow-hidden">
                  <img
                    src={pro.image}
                    alt={pro.name}
                    className="w-full h-64 object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300"
                    onClick={() => navigate(`/product-details/${pro._id}`)}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300'
                    }}
                  />
                  
                  {/* ❤️ WISHLIST TOGGLE BUTTON - Top Right */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleWishlist(pro)
                    }}
                    className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-lg hover:scale-110 active:scale-95 transition z-10"
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

                  {/* Category Tag */}
                  <div className="absolute top-3 left-3 bg-[#800000] text-white text-xs px-3 py-1 rounded-full">
                    {pro.categoryId?.name || pro.category || 'Product'}
                  </div>
                </div>

                {/* DETAILS */}
                <div className="p-4">
                  <h3 
                    className="font-semibold text-gray-800 capitalize line-clamp-2 mb-1 cursor-pointer hover:text-[#800000] transition"
                    onClick={() => navigate(`/product-details/${pro._id}`)}
                  >
                    {pro.name}
                  </h3>
                  
                  <p className="text-sm text-gray-500 mb-3 capitalize">
                    {pro.subcategoryId?.name || pro.subcategory || 'Category'}
                  </p>

                  {/* Price Display */}
                  <div className="mb-4">
                    {pro?.variants?.[0]?.sizes?.[0] ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg font-bold text-gray-900">
                          ₹{pro.variants[0].sizes[0].finalPrice}
                        </span>
                        {pro.variants[0].sizes[0].discountPercentage > 0 && (
                          <>
                            <span className="text-sm text-gray-400 line-through">
                              ₹{pro.variants[0].sizes[0].price}
                            </span>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                              {pro.variants[0].sizes[0].discountPercentage}% OFF
                            </span>
                          </>
                        )}
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-gray-900">
                        ₹{pro.price || 0}
                      </span>
                    )}
                  </div>

                  {/* ✅ ADD TO CART BUTTON - Green with cart icon */}
                  {/* <button
                    type="button"
                    onClick={() => handleAddToCart(pro)}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md hover:shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Add to Cart
                  </button> */}
                </div>

              </div>
            ))}

          </div>
        </div>
      )}
    </div>
  )
}