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
  Dimensions, Modal, TextInput,
  ActivityIndicator
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import { AddCart, deleteCart, deleteWishlist, getCart, getWishlist, otpVerify, userRegister } from '../../services/home';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { setCart } from '../../redux/slices/cart';
import { setWish } from '../../redux/slices/wishlist';

const { width, height } = Dimensions.get('window');

const WishlistScreen = ({ navigation }) => {
  const navigate = useNavigation()
  const [cart, setCarts] = useState([])
  const [userId, setUserId] = useState(null);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);
  const [timer, setTimer] = useState(30);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [visible]);


  const [visible, setVisible] = useState(false);



  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        setUserId(storedUserId);
      } catch (e) {
        console.log("Error fetching userId", e);
      }
    };

    fetchUserId();
  }, []);
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const localCartStr = await AsyncStorage.getItem('localWish');
        const localCart = localCartStr ? JSON.parse(localCartStr) : [];
        if (Array.isArray(localCart.items)) {
          setCarts(localCart);
          dispatch(setWish(localCart.items));
        } else {
          setCarts({ items: [] });
          dispatch(setWish([]));
        }
      } catch (err) {
        console.error('Error fetching wishlist:', err);
      }
    };
    fetchCart();
  }, []);

  const cartCount = useSelector(state => (state.cart.items));

  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [added, setAdded] = useState(false)
  const handleAddToBag = async (item) => {
    console.log(item, "wish")
    setAdded(true);
    try {
      const userId = await AsyncStorage.getItem("userId");


      // Use selectedSizeIndex or fallback to index 0

      const cartItem = {
        productId: item._id,
        name: item?.name || "",
        image: item?.image || "",
        variant: {
          variantId: item.variant?.variantId || "",
          color: item?.variant?.color || "",
          size: item?.variant?.size || "", // use selected size
          material: item?.material || "",
          price:
            item?.variant?.size?.price?.toString() ||
            item?.variant?.size?.price?.toString() ||
            "",
          storage: "",
          fabric: item?.fabric || "",
          discountPercentage: item?.discountPercentage?.toString() || "0",
          rating: item?.rating?.toString() || "0",
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

        updatedCart.push(cartItem);
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

  const removeItem = async (item) => {
    try {
      setLoading(true); // ✅ Start loading indicator

      // 🗃️ Update AsyncStorage
      const localCartStr = await AsyncStorage.getItem("localWish");
      let localCart = localCartStr ? JSON.parse(localCartStr) : [];

      console.log(localCart, "Before Removal");

      // ✅ Filter item from wishlist
      const updatedCart = (localCart.items || []).filter(
        (cartItem) =>
          !(
            (cartItem.productId?._id || cartItem.productId) === (item.productId?._id || item.productId) &&
            cartItem.variant?.variantId === item.variant?.variantId
          )
      );

      console.log(updatedCart, "After Removal");

      // ✅ Save updated cart array (not object)
      await AsyncStorage.setItem("localWish", JSON.stringify({ items: updatedCart }));

      // ✅ Refetch from AsyncStorage to stay in sync
      const refreshedCartStr = await AsyncStorage.getItem("localWish");
      const refreshedCart = refreshedCartStr ? JSON.parse(refreshedCartStr) : { items: [] };

      // ✅ Update local state + Redux
      setCarts(refreshedCart);
      dispatch(setWish(refreshedCart.items || []));
    } catch (error) {
      console.log("Failed to remove item:", error);
    } finally {
      setLoading(false); // ✅ End loading indicator
    }
  };



  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>WISHLIST ({cart.items?.length || 0})</Text>

        <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('Cart')} >
          <Ionicons name="bag-outline" size={24} color="#333" />
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

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {cart.items?.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Your wishlist is empty!</Text>
          </View>
        )}

        {cart.items?.map((item, index) => {
          const sizeInfo = item?.variant?.size || {};
          const brand = item?.productId?.brand || item?.variant?.color || 'Brand';
          const productName = item?.productId?.name || item?.name || 'Product';
          const finalPrice = sizeInfo?.finalPrice || item.variant?.price || 0;
          const originalPrice = sizeInfo?.price || item.variant?.price || 0;
          const discount = originalPrice > finalPrice ? ((1 - finalPrice / originalPrice) * 100).toFixed(0) : 0;

          return (
            <View key={index} style={styles.productCard}>
              {/* Product Header */}
              <View style={styles.productHeader}>
                <View style={styles.productCheckbox}>
                  <MaterialIcons name="check" size={16} color="#fff" />
                </View>
                <TouchableOpacity style={styles.closeButton} onPress={() => removeItem(item)}>
                  <Ionicons name="close" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Product Content */}
              <View style={styles.productContent}>
                <View style={styles.productImageContainer}>
                  <View style={styles.productImage}>
                    <Image
                      source={{ uri: item?.productId?.image || item?.image || 'https://dummyimage.com/100x140/eee/aaa' }}
                      style={{ width: 100, height: 140, resizeMode: 'cover' }}
                    />
                  </View>
                  <View style={styles.mChoiceBadge}>
                    <Text style={styles.mChoiceText}>{sizeInfo?.size || 'M'} Choice</Text>
                  </View>
                </View>

                <View style={styles.productDetails}>
                  <Text style={styles.brandName}>{brand}</Text>
                  <Text style={styles.productName}>{productName}</Text>
                  <Text style={styles.soldBy}>Sold by: Vision Star</Text>

                  <View style={styles.productOptions}>
                    <View style={styles.sizeSelector}>
                      <Text style={styles.sizeLabel}>Size: {sizeInfo?.size}</Text>
                      <Ionicons name="chevron-down" size={14} color="#333" />
                    </View>

                    <View style={styles.quantitySelector}>
                      <Text style={styles.quantityLabel}>Qty: {item.quantity}</Text>
                      <Ionicons name="chevron-down" size={14} color="#333" />
                    </View>
                  </View>

                  <View style={styles.priceSection}>
                    <Text style={styles.currentPrice}>₹{finalPrice}</Text>
                    <Text style={styles.originalPrice}>₹{originalPrice}</Text>
                    <Text style={styles.discount}>{discount}% OFF</Text>
                  </View>

                  <View style={styles.returnPolicy}>
                    <MaterialIcons name="cached" size={14} color="#666" />
                    <Text style={styles.returnText}>14 days return available</Text>
                  </View>

                  <View style={styles.deliveryInfo}>
                    <MaterialIcons name="check" size={14} color="#00b894" />
                    <Text style={styles.deliveryText}>Delivery by 31 May 2025</Text>
                  </View>

                  <TouchableOpacity style={styles.moveToBagButton} onPress={() => handleAddToBag(item)}>
                    <Text style={styles.moveToBagText}>MOVE TO BAG</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  heartButton: {
    padding: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  progressStep: {
    alignItems: 'center',
  },
  activeStepCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#00b894',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeStepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  inactiveStepCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ddd',
    marginBottom: 8,
  },
  activeStepText: {
    fontSize: 12,
    color: '#00b894',
    fontWeight: '600',
  },
  inactiveStepText: {
    fontSize: 12,
    color: '#999',
  },
  progressLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
    marginHorizontal: 16,
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
  },
  deliverySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  deliveryText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  changeText: {
    fontSize: 14,
    color: '#681117',
    fontWeight: '600',
  },
  offersSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
  },
  offersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  offersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  offerDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  showMoreText: {
    fontSize: 14,
    color: '#681117',
    fontWeight: '600',
    marginRight: 4,
  },
  savingsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  savingsText: {
    fontSize: 14,
    color: '#00b894',
    fontWeight: '500',
  },
  savingsAmount: {
    fontSize: 14,
    color: '#00b894',
    fontWeight: 'bold',
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  itemsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    backgroundColor: '#681117',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  itemsSelectedText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  itemsPrice: {
    fontSize: 14,
    color: '#681117',
    fontWeight: '600',
  },
  itemsActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    padding: 4,
  },
  productCard: {
    backgroundColor: '#fff',
    marginBottom: 8,
    paddingTop: 12,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  productCheckbox: {
    width: 20,
    height: 20,
    backgroundColor: '#681117',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    padding: 4,
  },
  productContent: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  productImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  productImage: {
    width: 120,
    height: 160,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImageText: {
    fontSize: 40,
  },
  mChoiceBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#681117',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  mChoiceText: {
    fontSize: 8,
    color: '#fff',
    fontWeight: 'bold',
  },
  productDetails: {
    flex: 1,
  },
  brandName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  soldBy: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  productOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 16,
  },
  sizeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  sizeLabel: {
    fontSize: 12,
    color: '#333',
    marginRight: 4,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  quantityLabel: {
    fontSize: 12,
    color: '#333',
    marginRight: 4,
  },
  stockIndicator: {
    backgroundColor: '#fff3e0',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#ff9800',
  },
  stockText: {
    fontSize: 10,
    color: '#ff9800',
    fontWeight: '600',
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discount: {
    fontSize: 12,
    color: '#ff9800',
    fontWeight: '600',
  },
  returnPolicy: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  returnText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryText: {
    fontSize: 12,
    color: '#00b894',
    marginLeft: 4,
    fontWeight: '500',
  },
  loginSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
  },
  loginImageContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  loginImagePlaceholder: {
    fontSize: 20,
  },
  loginText: {
    fontSize: 14,
    color: '#666',
  },
  orderSummary: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 100,
  },
  orderSummaryText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },

  moveToBagButton: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#000',
    borderRadius: 4,
    alignItems: 'center'
  },
  moveToBagText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});

export default WishlistScreen;