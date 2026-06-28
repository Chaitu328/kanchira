import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  SafeAreaView,
  Dimensions,
  Easing,
  Animated,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AddCart, addWishlist } from '../../services/home';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, setCart } from '../../redux/slices/cart';
import LoadCart from '../../services/cartLoad';
import { addToWish, setWish } from '../../redux/slices/wishlist';

const { width } = Dimensions.get('window');

const ProductDetailsScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const navigates = useNavigation()
  const route = useRoute();
  const { product } = route.params;

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const [added, setAdded] = useState(false);
  const [wishAdded, setWishAdded] = useState(false);

  const [userId, setUserId] = useState(null);
  const cartCount = useSelector(state => (state.cart.items));
  const wishCount = useSelector(state => (state.wish.items));
  console.log(cartCount)
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        setUserId(storedUserId);
      } catch (e) {
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    if (wishCount && product) {
      const exists = wishCount.some(
        (item) => (item.productId?._id || item.productId) === product._id
      );
      setWishAdded(exists);
    }
  }, [wishCount, product]);
const handleAddToBag = async (item) => {
  setAdded(true);
  try {
    const userId = await AsyncStorage.getItem("userId");

    const currentVariant = item.variants && item.variants.length > selectedVariantIndex ? item.variants[selectedVariantIndex] : (item.variants?.[0] || null);
    const currentSize = currentVariant?.sizes?.[selectedSizeIndex] || currentVariant?.sizes?.[0];

    const cartItem = {
      productId: item._id,
      name: item?.name || "",
      image: item?.image || "",
      variant: {
        variantId: currentVariant?._id || "",
        color: currentVariant?.color || "",
        size: currentSize?.size || "",
        material: item?.material || "",
        price: currentSize?.finalPrice?.toString() || currentSize?.price?.toString() || currentVariant?.price?.toString() || "",
        storage: "",
        fabric: item?.fabric || "",
        discountPercentage: currentSize?.discountPercentage?.toString() || item?.discountPercentage?.toString() || "0",
        rating: currentVariant?.rating?.toString() || "0",
      },
      quantity: 1,
    };

    if (!userId) {
      // 🟡 User not logged in → store locally
      const existingCart = await AsyncStorage.getItem("localCart");
      let updatedCart = [];

      if (existingCart) {
        const parsed = JSON.parse(existingCart);
        updatedCart = parsed.items || [];
      }

      // Check if product with same productId + variantId already exists
      const existingIndex = updatedCart.findIndex(
        (item) =>
          item.productId === cartItem.productId &&
          item.variant?.variantId === cartItem.variant?.variantId
      );

      if (existingIndex !== -1) {
        // ✅ Product already exists → update quantity
        updatedCart[existingIndex].quantity += cartItem.quantity || 1;
      } else {
        // ✅ New product → push to cart
        updatedCart.push({ ...cartItem, quantity: cartItem.quantity || 1 });
      }

      await AsyncStorage.setItem("localCart", JSON.stringify({ items: updatedCart }));
      dispatch(setCart(updatedCart));
      console.log("Stored locally (user not logged in):", updatedCart);
      setAdded(false);
      return;
    }

    // 🟢 User logged in → send to backend
    const payload = {
      userId,
      items: [cartItem],
    };

    const response = await AddCart(payload);
    console.log("Item added to backend cart:", response);

    if (response?.cart?.items) {
      dispatch(setCart(response.cart.items)); // ✅ just the items
    }

    setAdded(false);

  } catch (error) {
    console.error("Error adding item to bag:", error);
    setAdded(false);
  }
};

  const handleAddToWish = async (item) => {
    try {
      const currentVariant = item.variants && item.variants.length > selectedVariantIndex ? item.variants[selectedVariantIndex] : (item.variants?.[0] || null);
      const currentSize = currentVariant?.sizes?.[selectedSizeIndex] || currentVariant?.sizes?.[0];
      const cartItem = {
        productId: item._id,
        name: item?.name || "",
        image: item?.image || "",
        variant: {
          variantId: currentVariant?._id || "",
          color: currentVariant?.color || "",
          size: currentSize?.size || "",
          material: item?.material || "",
          price: currentSize?.finalPrice?.toString() || currentSize?.price?.toString() || currentVariant?.price?.toString() || "",
          storage: "",
          fabric: item?.fabric || "",
          discountPercentage: currentSize?.discountPercentage?.toString() || item?.discountPercentage?.toString() || "0",
          rating: currentVariant?.rating?.toString() || "0"
        },
        quantity: 1,
      };

      const existingWish = await AsyncStorage.getItem("localWish");
      let updatedWish = [];
      if (existingWish) {
        const parsed = JSON.parse(existingWish);
        updatedWish = parsed.items || [];
      }

      const existingIndex = updatedWish.findIndex(
        (wItem) =>
          (wItem.productId?._id || wItem.productId) === cartItem.productId &&
          wItem.variant?.variantId === cartItem.variant?.variantId
      );

      if (existingIndex !== -1) {
        // Toggle behavior: remove if exists
        updatedWish.splice(existingIndex, 1);
        setWishAdded(false);
      } else {
        // Add if not exists
        updatedWish.push(cartItem);
        setWishAdded(true);
      }

      await AsyncStorage.setItem("localWish", JSON.stringify({ items: updatedWish }));
      dispatch(setWish(updatedWish));
      console.log("Stored wishlist locally:", updatedWish);
    } catch (error) {
      console.error("Error toggling wishlist item:", error);
    }
  };
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);

  const selectedVariant = product?.variants?.[selectedVariantIndex];
  const selectedSize = selectedVariant?.sizes?.[selectedSizeIndex];


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>K</Text>
          </View>
          <Text style={styles.brandName}>{product.name}</Text>
        </View>

        <View style={styles.headerIcons}>
          {/* <TouchableOpacity style={styles.headerIcon}>
            <Feather name="share" size={20} color="#681117" />
          </TouchableOpacity> */}
          <TouchableOpacity style={styles.headerIcon} onPress={() => navigates.navigate("Wishlist")}>
            <Ionicons name="heart-outline" size={22} color="#681117" />
            {wishCount?.length > 0 && (
              <View style={{
                position: 'absolute',
                top: -4,
                right: -8,
                backgroundColor: '#681117',
                borderRadius: 10,
                width: 18,
                height: 18,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Text style={{ color: '#fff', fontSize: 10 }}>{wishCount.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          {/* <TouchableOpacity style={styles.headerIcon} onPress={()=>navigates.navigate("Cart")}>
            <Ionicons name="bag-outline" size={22} color="#681117" />
          </TouchableOpacity> */}
          <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('Cart')} >
            <Ionicons name="bag-outline" size={22} color="#333" />
            {cartCount?.length > 0 && (
              <View style={{
                position: 'absolute',
                top: -4,
                right: -8,
                backgroundColor: '#681117',
                borderRadius: 10,
                width: 18,
                height: 18,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Text style={{ color: '#fff', fontSize: 10 }}>{cartCount.length}</Text>
              </View>
            )}
          </TouchableOpacity>

        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          {selectedVariant && (
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
              {selectedVariant.images?.map((imgObj, imgIndex) => (
                <View key={imgIndex} style={styles.productImage}>
                  <Image
                    source={{ uri: imgObj.url }}
                    style={{ height: 400, width: width, resizeMode: "cover", borderRadius: 10 }}
                  />
                </View>
              ))}
            </ScrollView>
          )}

          {/* Rating */}
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>{product.rating || 4}</Text>
            <AntDesign name="star" size={12} color="#ffa726" />
            <Text style={styles.reviewCount}>62</Text>
          </View>
        </View>

        {/* --- VARIANT LIST --- */}
        {product.variants && product.variants.length > 1 && (
          <View style={styles.variantSection}>
            <Text style={styles.sizeLabel}>Select Color: <Text style={{fontWeight: 'normal', color: '#666'}}>{selectedVariant?.color}</Text></Text>
            <View style={styles.variantList}>
              {product.variants.map((variant, index) => {
                const colorVal = variant.colorCode || '#ccc';
                return (
                  <TouchableOpacity
                    key={variant._id || index}
                    style={[
                      styles.colorCircle,
                      selectedVariantIndex === index && styles.colorCircleSelected
                    ]}
                    onPress={() => {
                      setSelectedVariantIndex(index);
                      setSelectedSizeIndex(0); // reset size index for new variant
                    }}
                  >
                    <View style={[styles.colorInner, { backgroundColor: colorVal }]} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* --- PRODUCT INFO --- */}
        <View style={styles.productInfo}>
          <Text style={styles.productTitle}>{product.description}</Text>

          {/* Price */}
          <View style={styles.priceSection}>
            <Text style={styles.mrpLabel}>MRP </Text>
            <Text style={styles.originalPrice}>₹{selectedSize?.price || "1,199"}</Text>
            <Text style={styles.salePrice}>₹{selectedSize?.finalPrice || "269"}</Text>
            <Text style={styles.discount}>
              ({selectedSize?.discountPercentage || "0"}% OFF)
            </Text>
          </View>

          {/* Size Options */}
          <View style={styles.sizeSection}>
            <Text style={styles.sizeLabel}>Select Size:</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {selectedVariant?.sizes?.map((sizeObj, sizeIndex) => (
                <TouchableOpacity
                  key={sizeObj._id}
                  style={[
                    styles.sizeButton,
                    selectedSizeIndex === sizeIndex && styles.sizeButtonSelected,
                  ]}
                  onPress={() => setSelectedSizeIndex(sizeIndex)}
                >
                  <Text style={[
                    styles.sizeButtonText,
                    selectedSizeIndex === sizeIndex && styles.sizeButtonTextSelected
                  ]}>{sizeObj.size}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Deal Section */}
          {/* <View style={styles.dealSection}>
          <View style={styles.dealLeft}>
            <View style={styles.megaDealBadge}>
              <Text style={styles.megaDealText}>MEGA</Text>
              <Text style={styles.dealText}>DEAL</Text>
            </View>
            <View style={styles.getAtContainer}>
              <Text style={styles.getAtText}>Get at </Text>
              <Text style={styles.dealPrice}>₹{selectedSize?.dealPrice || 157}</Text>
              <View style={styles.underline} />
            </View>
          </View>
          <TouchableOpacity style={styles.extraOffButton}>
            <Text style={styles.extraOffText}>Extra ₹112 Off</Text>
          </TouchableOpacity>
        </View> */}

          {/* Coupon Section */}
          <View style={styles.couponSection}>
            <Text style={styles.couponText}>With Coupon + </Text>
            <MaterialIcons name="account-balance" size={16} color="#681117" />
            <Text style={styles.bankOfferText}> Bank Offer</Text>
            <TouchableOpacity style={styles.detailsButton}>
              <Text style={styles.detailsText}>Details</Text>
              <Ionicons name="chevron-forward" size={14} color="#ff3f6c" />
            </TouchableOpacity>
          </View>

          {/* Price Repeat */}
          <View style={styles.priceRepeat}>
            <Text style={styles.originalPriceRepeat}>₹{selectedSize?.price || "1,199"}</Text>
            <Text style={styles.salePriceRepeat}>₹{selectedSize?.finalPrice || "269"}</Text>
            <Text style={styles.discountRepeat}>
              ({selectedSize?.discountPercentage || "0"}% OFF)
            </Text>
          </View>

          <Text style={styles.deliveryInfo}>Delivery by Sun, 1 Jun - 500001</Text>

          <View style={styles.sellerInfo}>
            <Text style={styles.sellerLabel}>Seller: </Text>
            <Text style={styles.sellerName}>VASUDEV CREATION</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.wishlistButton} onPress={() => handleAddToWish(product)}
        >
          <Ionicons name="heart-outline" size={20} color="#333" />
          <Text style={styles.wishlistText}>
            {wishAdded ? '✔ Wishlisted!' : 'Wishlist'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addToBagButton}
          onPress={() => handleAddToBag(product)}
        >
          <Ionicons name="bag" size={20} color="#fff" />
          <Text style={styles.addToBagText}>
            {added ? '✔ Added!' : 'Add to Bag'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    marginRight: 12,
  },
  animatedBox: {
    marginTop: 20,
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 20,
  },
  successText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },



  logoContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#681117',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logo: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  headerIcon: {
    padding: 2,
  },





  content: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    height: 400,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  productImage: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,

  },
  productImagePlaceholder: {
    fontSize: 120,
  },
  viewSimilarButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  viewSimilarText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ddd',
  },
  activeDot: {
    backgroundColor: '#333',
  },
  productInfo: {
    padding: 16
  },
  productTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  mrpLabel: {
    fontSize: 14,
    color: '#999',
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  salePrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  discount: {
    fontSize: 14,
    color: '#ff9800',
    fontWeight: '600',
  },
  dealSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#681117',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  dealLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  megaDealBadge: {
    backgroundColor: '#fff',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 12,
  },
  megaDealText: {
    fontSize: 8,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dealText: {
    fontSize: 8,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  getAtContainer: {
    position: 'relative',
  },
  getAtText: {
    fontSize: 14,
    color: '#fff',
  },
  dealPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  underline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#333',
  },
  extraOffButton: {
    backgroundColor: '#00b894',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  extraOffText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  couponSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  couponText: {
    fontSize: 14,
    color: '#666',
  },
  bankOfferText: {
    fontSize: 14,
    color: '#681117',
    fontWeight: '600',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  detailsText: {
    fontSize: 14,
    color: '#681117',
    fontWeight: '600',
  },
  sizeSection: {
    marginBottom: 20,
  },
  sizeLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  sizeButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizeButtonSelected: {
    backgroundColor: '#681117',
    borderColor: '#681117',
  },
  sizeButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  sizeButtonTextSelected: {
    color: '#fff',
  },
  variantSection: {
    marginBottom: 20,
  },
  variantList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorCircleSelected: {
    borderColor: '#681117',
    transform: [{ scale: 1.1 }],
  },
  colorInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  priceRepeat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  originalPriceRepeat: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  salePriceRepeat: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  discountRepeat: {
    fontSize: 14,
    color: '#ff9800',
    fontWeight: '600',
  },
  deliveryInfo: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 100,
  },
  sellerLabel: {
    fontSize: 14,
    color: '#681117',
  },
  sellerName: {
    fontSize: 14,
    color: '#681117',
    fontWeight: '600',
  },
  bottomActions: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  wishlistButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRightWidth: 1,
    borderRightColor: '#eee',
  },
  wishlistText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#681117',
  },
  addToBagButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#681117',
  },
  addToBagText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ProductDetailsScreen