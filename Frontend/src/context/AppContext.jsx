

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getLogo, getCart } from '../services/api'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('kanchira_user')) || null
    } catch {
      return null
    }
  })

  const [cartItems, setCartItems] = useState([])

  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('kanchira_wishlist')) || []
    } catch {
      return []
    }
  })

  const [logoUrl, setLogoUrl] = useState('')
  const [brandName, setBrandName] = useState('Kanchira')
  const [brandData, setBrandData] = useState(null)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)

  /* ---------- LOAD BRAND ---------- */
  useEffect(() => {
    getLogo()
      .then(res => {
        const d = res.data?.data?.[0] || res.data?.[0] || {}
        setLogoUrl(d.logo || '')
        setBrandName(d.brandName || 'Kanchira')
        setBrandData(d)
      })
      .catch(() => {})
  }, [])

  /* ---------- LOAD CART ---------- */
  const loadCart = useCallback(() => {
    const userId = user?._id || user?.id
    if (!userId) {
      setCartItems([])
      return
    }

    getCart(userId)
      .then(res => {
        const data = res?.data
        const items =
          data?.cart?.items ||
          data?.data?.cart?.items ||
          data?.items ||
          []

        setCartItems(Array.isArray(items) ? items : [])
      })
      .catch(() => setCartItems([]))
  }, [user])

  useEffect(() => {
    loadCart()
  }, [loadCart])

  /* ---------- AUTH ---------- */
  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('kanchira_user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    setCartItems([])
    localStorage.removeItem('kanchira_user')
    localStorage.removeItem('token')
  }

  /* ---------- 🔥 WISHLIST ---------- */
  const addToWishlistLocal = (product) => {
    setWishlist((prev) => {
      const exists = prev.find((p) => p._id === product._id)

      let updated

      if (exists) {
        // REMOVE
        updated = prev.filter((p) => p._id !== product._id)
      } else {
        // ADD
        updated = [...prev, product]
      }

      localStorage.setItem('kanchira_wishlist', JSON.stringify(updated))
      return updated
    })
  }

  const isInWishlist = (id) => {
    return wishlist.some((p) => p._id === id)
  }

  const cartCount = cartItems.reduce((s, i) => s + (i.quantity || 1), 0)

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        logout,

        cartItems,
        setCartItems,
        loadCart,
        cartCount,

        wishlist,
        addToWishlistLocal,
        isInWishlist,

        logoUrl,
        brandName,
        brandData,

        loginModalOpen,
        setLoginModalOpen,

        selectedCategoryId,
        setSelectedCategoryId,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)