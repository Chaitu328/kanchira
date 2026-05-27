import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { getLogo, getCart, addToCart } from "../services/api";

const AppContext = createContext();

const GUEST_CART_KEY = "guestCart"; // must match CartPage.jsx

const readGuestCart = () => {
  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY) || "[]");
  } catch {
    return [];
  }
};

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("kanchira_user")) || null;
    } catch {
      return null;
    }
  });

  const [cartItems, setCartItems] = useState([]);

  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("kanchira_wishlist")) || [];
    } catch {
      return [];
    }
  });

  const [logoUrl, setLogoUrl] = useState("");
  const [brandName, setBrandName] = useState("Kanchira");
  const [brandData, setBrandData] = useState(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  /* ---------- LOAD BRAND ---------- */
  useEffect(() => {
    getLogo()
      .then((res) => {
        const d = res.data?.data?.[0] || res.data?.[0] || {};
        setLogoUrl(d.logo || "");
        setBrandName(d.brandName || "Kanchira");
        setBrandData(d);
      })
      .catch(() => {});
  }, []);

  /* ---------- LOAD CART ---------- */
  const loadCart = useCallback(() => {
    const userId = user?._id || user?.id;
    if (!userId) {
      setCartItems([]);
      return;
    }
    getCart(userId)
      .then((res) => {
        const data = res?.data;
        const items =
          data?.cart?.items || data?.data?.cart?.items || data?.items || [];
        setCartItems(Array.isArray(items) ? items : []);
      })
      .catch(() => setCartItems([]));
  }, [user]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  /* ---------- AUTH ---------- */
  const login = async (userData) => {
    const userId = userData?._id || userData?.userId || userData?.id;
    const guestItems = readGuestCart();

    // ✅ FIX: merge guest cart FIRST, then setUser
    // setUser triggers loadCart via useEffect — we must save items before that fires
    if (userId && guestItems.length > 0) {
      try {
        const sanitized = guestItems.map((item) => ({
          // guest cart stores full product object in productId — extract just the _id
          productId: item.productId?._id || item.productId,
          image: item.image || "",
          variant: {
            color: String(item.variant?.color ?? ""),
            size: String(item.variant?.size ?? ""),
            price: String(item.variant?.price ?? ""),
            discountPercentage: String(item.variant?.discountPercentage ?? ""),
            material: String(item.variant?.material ?? ""),
            fabric: String(item.variant?.fabric ?? ""),
          },
          quantity: Number(item.quantity) || 1,
        }));
        await addToCart({ userId, items: sanitized });
      } catch (e) {
        console.error("Failed to merge guest cart:", e);
      } finally {
        localStorage.removeItem(GUEST_CART_KEY);
      }
    }

    // Only NOW set user — this triggers loadCart which will find the merged items
    localStorage.setItem("kanchira_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    setCartItems([]);
    localStorage.removeItem("kanchira_user");
    localStorage.removeItem("token");
  };

  /* ---------- WISHLIST ---------- */
  const addToWishlistLocal = (product) => {
    setWishlist((prev) => {
      const exists = prev.find((p) => p._id === product._id);
      let updated;
      if (exists) {
        updated = prev.filter((p) => p._id !== product._id);
      } else {
        updated = [...prev, product];
      }
      localStorage.setItem("kanchira_wishlist", JSON.stringify(updated));
      return updated;
    });
  };

  const isInWishlist = (id) => {
    return wishlist.some((p) => p._id === id);
  };

  const cartCount = cartItems.reduce((s, i) => s + (i.quantity || 1), 0);

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
  );
}

export const useApp = () => useContext(AppContext);
