import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import { AddCart, deleteCart, getCart, otpVerify, userRegister, getCouponByCode, validateSuperCoupon } from '../../services/home';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setCart } from '../../redux/slices/cart';
import { useDispatch, useSelector } from 'react-redux';
import { RefreshControl } from 'react-native-gesture-handler';
import LoaderModal from '../info/loading';

const { width, height } = Dimensions.get('window');

const CartScreen = ({ navigation }) => {
    const dispatch = useDispatch();
  const navigate = useNavigation()
  const [cart, setCarts] = useState([])
  const [userId, setUserId] = useState(null);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [spinDiscount, setSpinDiscount] = useState(null);
  const [spinDiscountApplied, setSpinDiscountApplied] = useState(false);

  const [couponApplied, setCouponApplied] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponType, setCouponType] = useState('flat');
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const loadSpinDiscount = async () => {
    try {
      const discStr = await AsyncStorage.getItem("checkout_spin_discount");
      if (discStr) {
        const disc = JSON.parse(discStr);
        setSpinDiscount(disc);
        setSpinDiscountApplied(true);
      } else {
        setSpinDiscount(null);
        setSpinDiscountApplied(false);
      }
    } catch (e) {
      console.log("Error loading spin discount", e);
    }
  };

  const handleApplyCoupon = async () => {
    if (spinDiscountApplied) {
      alert('Remove your spin discount first');
      return;
    }
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      alert('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    try {
      // Try SuperAdmin coupon first
      try {
        const res = await validateSuperCoupon({ code, orderAmount: subtotal });
        const d = res?.data || res;
        const discountType = d?.discountType || d?.type || 'flat';
        const discountValue = d?.discountValue || d?.discountAmount || d?.value || 0;
        setCouponApplied(true);
        setCouponType(discountType);
        setCouponDiscount(discountValue);
        setCouponCode(d?.code || code);
        const label = discountType === 'percentage' ? `${discountValue}% off` : `₹${discountValue} off`;
        alert(`Coupon applied! ${label}`);
        return;
      } catch (superErr) {
        const status = superErr?.response?.status;
        if (status !== 404 && status !== 400) throw superErr;
        const superMsg = superErr?.response?.data?.message || '';
        if (superMsg && !superMsg.toLowerCase().includes('not found') && !superMsg.toLowerCase().includes('inactive')) {
          alert(superMsg);
          return;
        }
      }

      // Fallback: Try regular Admin coupon
      const res = await getCouponByCode(code);
      const c = res?.coupon || res?.data?.coupon || res?.data || res;

      if (!c) {
        alert('Coupon not found');
        return;
      }

      const exp = c.expiryDate || c.expiry || c.expiredAt;
      if (exp) {
        const expDate = new Date(exp);
        expDate.setHours(23, 59, 59, 999);
        if (expDate < new Date()) {
          alert('This coupon has expired');
          return;
        }
      }

      const discountType = c.type || c.discountType || 'flat';
      const discountValue = c.value || c.discountValue || 0;
      setCouponApplied(true);
      setCouponType(discountType);
      setCouponDiscount(discountValue);
      setCouponCode(code);
      const label = discountType === 'percentage' ? `${discountValue}% off` : `₹${discountValue} off`;
      alert(`Coupon applied! ${label}`);

    } catch (err) {
      const msg = err?.response?.data?.message || 'Coupon not found or invalid';
      alert(msg);
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponApplied(false);
    setCouponDiscount(0);
    setCouponType('');
    setCouponCode('');
    setCouponInput('');
    alert('Coupon removed');
  };

  const removeSpinDiscount = async () => {
    try {
      await AsyncStorage.removeItem("checkout_spin_discount");
      await AsyncStorage.removeItem("discountSpinTime");
      setSpinDiscount(null);
      setSpinDiscountApplied(false);
      alert('Spin discount removed');
    } catch (e) {
      console.log("Error removing spin discount", e);
    }
  };
  const inputRefs = useRef([]);
  const [timer, setTimer] = useState(30);
  const wishCount = useSelector(state => (state.wish.items));
  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [visible]);

  const handleOTPChange = (value, index) => {
    if (/^\d$/.test(value) || value === '') {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < otp?.length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
      if (!value && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const [visible, setVisible] = useState(false);
  const handleSubmit = async () => {
    const otpCode = otp.join('');
    if (otpCode?.length < 4) {
      Alert.alert('Error', 'Please enter the complete 4-digit OTP');
      return;
    }

    const payload = {
      phone: mobileNumber,
      OTP: otpCode,
    };

    try {
      setLoading(true);
      const response = await otpVerify(payload);
      console.log('API Response:', response);

      if (response.responseCode === 200) {
        setVisible(false)
      } else {
        Alert.alert('OTP Failed', response.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('OTP Error:', error.message);
      Alert.alert('Error', 'Something went wrong while verifying OTP.');
    } finally {
      setLoading(false);
    }
  };
 
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        setUserId(storedUserId);
      } catch (e) {
        console.log("Error fetching userId", e);
      }
    };

  const fetchCart = async () => {
    setLoading(true)
    console.log(userId)
    try {
      if (userId) {
        // ✅ Get cart from server
        const data = await getCart({ userId });
        console.log(data,"jhbhbikhi")
        setCarts(data.cart.items)
        dispatch(setCart(data.cart?.items || []));
        setLoading(false)
      } else {
        // ✅ Get local cart from AsyncStorage
        const localCartStr = await AsyncStorage.getItem('localCart');
        const localCart = localCartStr ? JSON.parse(localCartStr) : [];
        if (Array.isArray(localCart.items)) {
          const totalCount = (localCart.items).reduce((sum, item) => sum + item.quantity, 0);
          setCarts(localCart.items)
          dispatch(setCart(localCart.items));
          setLoading(false)
        } else {
          console.log("Local cart is not an array", localCart);
          dispatch(setCart([]));
          setLoading(false)
        }
      }
    } catch (error) {
      console.log("Failed to load cart:", error);
    }
  };

useFocusEffect(
  useCallback(() => {
    // This runs every time the screen comes into focus
    fetchCart();
    fetchUserId();
    loadSpinDiscount();
  }, [userId])
);

  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const subtotal = cart.reduce((sum, item) => {
    const finalPrice = parseFloat(item?.variant?.price) || 0;
    return sum + (finalPrice * item.quantity);
  }, 0);

  const subtotalMRP = cart.reduce((sum, item) => {
    const discountPct = parseFloat(item?.variant?.discountPercentage) || 0;
    const finalPrice = parseFloat(item?.variant?.price) || 0;
    const originalPrice = discountPct > 0 ? Math.round(finalPrice / (1 - discountPct / 100)) : finalPrice;
    return sum + (originalPrice * item.quantity);
  }, 0);

  const spinDiscountAmt = spinDiscountApplied && spinDiscount?.value
    ? Math.round((subtotal * spinDiscount.value) / 100)
    : 0;

  const couponDiscountAmt = couponApplied
    ? (couponType === 'percentage' ? Math.round((subtotal * couponDiscount) / 100) : couponDiscount)
    : 0;

  const activeDiscountAmt = spinDiscountApplied ? spinDiscountAmt : couponDiscountAmt;
  const totalPrice = Math.max(0, subtotal - activeDiscountAmt);

  const gotoCheckout = (item) => {
    // setLoginModalVisible(true);
    navigate.navigate("Checkout", {
      product: item,
      couponCode: couponApplied ? couponCode : null,
      couponDiscount: couponApplied ? couponDiscountAmt : 0,
      spinDiscount: spinDiscountApplied ? spinDiscount : null,
      spinDiscountAmt: spinDiscountApplied ? spinDiscountAmt : 0,
    })
  };

const removeItem = async (item) => {
  try {
    setLoading(true); // ✅ Start loading indicator

    if (userId) {
      // 🔄 Logged-in user → call API
      const payload = {
        userId,
        productId: item.productId,
        variantId: item.variant?.variantId || "",
      };
      const response = await deleteCart(payload);
      dispatch(setCart(response.cart?.items || []));
    } else {
      // 🗃️ Guest user → update AsyncStorage
      const localCartStr = await AsyncStorage.getItem("localCart");
      let localCart = localCartStr ? JSON.parse(localCartStr) : [];

      console.log(localCart, "Before Removal");

      // ✅ Filter item from cart
      const updatedCart = (localCart.items).filter(
        (cartItem) =>
          !(
            cartItem.productId === item.productId &&
            cartItem.variant?.variantId === item.variant?.variantId
          )
      );

      console.log(updatedCart, "After Removal");
      // ✅ Save updated cart array (not object)
      await AsyncStorage.setItem("localCart", JSON.stringify({items:updatedCart}));
      // ✅ Refetch from AsyncStorage to stay in sync
      const refreshedCartStr = await AsyncStorage.getItem("localCart");
      const refreshedCart = refreshedCartStr ? JSON.parse(refreshedCartStr) : [];

      // ✅ Update local state + Redux
      setCarts(refreshedCart);
      dispatch(setCart(updatedCart));
    }
  } catch (error) {
    console.log("Failed to remove item:", error);
  } finally {
    setLoading(false); // ✅ End loading indicator
  }
};


  const openLoginModal = (item) => {
    console.log(item)
    setLoginModalVisible(true);
    // navigate.navigate("Checkout", {
    //   product: item
    // })
  };
  const handleLogin = async () => {
    console.log("sfnsosjj0siji")
    const payload = {
      phone: mobileNumber
    }
    console.log(payload)
    const data = await userRegister(payload);
    if (data.responseCode == 200) {
      console.log(data)
      await AsyncStorage.setItem("userId", String(data.userId)); // Store safely
      const localCartData = await AsyncStorage.getItem('localCart');
      const parsed = JSON.parse(localCartData);
      const localItems = parsed.items || [];
              dispatch(setCart(parsed.items || [])); // 👈 preload into Redux

                    console.log(data.userId,localItems)


      if (localItems?.length > 0) {
        await AddCart({ userId: data.userId, items: localItems }); // bulk add
        await AsyncStorage.removeItem("localCart"); // clear localCart
        console.log("Local cart merged to backend");
      }
      // navigation.navigate("Otp", { phone: mobileNumber,routes:"Checkout" });
      setLoginModalVisible(false)
      setVisible(true)
    }
  }
const [refreshing, setRefreshing] = useState(false);

const onRefresh = async () => {
  setRefreshing(true);
  fetchCart()
};
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>SHOPPING BAG</Text>

          <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate("Wishlist")}>
          <Ionicons name="heart-outline" size={24} color="#333" />
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
      </View>



      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}
       refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
>





        {/* Product Card */}
       <View style={styles.productCard}>
  {cart && cart.length> 0 ? (
    cart.map((item, index) => {
      const sizeInfo = item?.variant?.size || {};
      return (
        <View key={index}>
          {/* Product Header */}
          <View style={styles.productHeader}>
            <View style={styles.productCheckbox}>
              <MaterialIcons name="check" size={16} color="#fff" />
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => removeItem(item)}
            >
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Product Content */}
          <View style={styles.productContent}>
            <View style={styles.productImageContainer}>
              <View style={styles.productImage}>
                <Image
                  source={{ uri: item?.productId?.image || item?.image }}
                  style={{ width: 100, height: 140, resizeMode: "cover" }}
                />
              </View>
              <View style={styles.mChoiceBadge}>
                <Text style={styles.mChoiceText}>
                  {sizeInfo?.size || item.variant.size} Choice
                </Text>
              </View>
            </View>

            <View style={styles.productDetails}>
              <Text style={styles.brandName}>
                {item?.productId?.name || item?.name}
              </Text>
              <Text style={styles.productName}>
                {item?.productId?.brand || item?.variant?.color}
              </Text>
              <Text style={styles.soldBy}>Sold by: Vision Star</Text>

              <View style={styles.productOptions}>
                <View style={styles.sizeSelector}>
                  <Text style={styles.sizeLabel}>
                    Size: {sizeInfo?.size || item?.variant?.size}
                  </Text>
                  <Ionicons name="chevron-down" size={14} color="#333" />
                </View>

                <View style={styles.quantitySelector}>
                  <Text style={styles.quantityLabel}>Qty: {item.quantity}</Text>
                  <Ionicons name="chevron-down" size={14} color="#333" />
                </View>
              </View>

              <View style={styles.priceSection}>
                <Text style={styles.currentPrice}>
                  ₹{sizeInfo?.finalPrice || item.variant.price}
                </Text>
                <Text style={styles.originalPrice}>
                  ₹{sizeInfo?.price || item.variant.price}
                </Text>
                <Text style={styles.discount}>
                  {sizeInfo?.discountPercentage || item.discount || 10}% OFF
                </Text>
              </View>

              <View style={styles.returnPolicy}>
                <MaterialIcons name="cached" size={14} color="#666" />
                <Text style={styles.returnText}>14 days return available</Text>
              </View>

              <View style={styles.deliveryInfo}>
                <MaterialIcons name="check" size={14} color="#00b894" />
                <Text style={styles.deliveryText}>Delivery by 31 May 2025</Text>
              </View>
            </View>
          </View>
        </View>
      );
    })
  ) : (
    <View style={styles.emptyBagContainer}>
      <Image
        source={require('../../assets/cart.jpg')} // Replace with your empty bag image
        style={{ width: 200, height: 200, resizeMode: 'contain' }}
      />
      <Text style={styles.emptyBagText}>Your shopping bag is empty!</Text>
      <TouchableOpacity
        style={styles.shopNowButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.shopNowText}>Continue Shopping</Text>
      </TouchableOpacity>
    </View>
  )}
</View>

{cart && cart.length > 0 && (
  <View style={styles.summaryContainer}>
    {/* Spin Discount Status */}
    {spinDiscountApplied && (
      <View style={styles.discountBadgeContainer}>
        <View style={styles.discountBadgeContent}>
          <Ionicons name="gift" size={18} color="#00b894" />
          <Text style={styles.discountBadgeText}>
            Spin Discount Active: {spinDiscount?.label}
          </Text>
        </View>
        <TouchableOpacity onPress={removeSpinDiscount} style={styles.removeDiscountBtn}>
          <Text style={styles.removeDiscountText}>REMOVE</Text>
        </TouchableOpacity>
      </View>
    )}

    {/* Coupon Code Section */}
    <View style={styles.couponContainer}>
      <Text style={styles.sectionTitle}>Apply Coupon</Text>
      <View style={styles.couponInputWrapper}>
        <TextInput
          style={[
            styles.couponInput,
            (spinDiscountApplied || couponApplied) && styles.disabledInput
          ]}
          placeholder={spinDiscountApplied ? "Remove spin discount first" : "Enter coupon code"}
          value={couponInput}
          onChangeText={setCouponInput}
          autoCapitalize="characters"
          editable={!spinDiscountApplied && !couponApplied}
        />
        {couponApplied ? (
          <TouchableOpacity style={styles.couponButtonRemove} onPress={removeCoupon}>
            <Text style={styles.couponButtonText}>REMOVE</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.couponButton,
              (spinDiscountApplied || !couponInput.trim()) && styles.disabledCouponBtn
            ]}
            onPress={handleApplyCoupon}
            disabled={spinDiscountApplied || !couponInput.trim() || couponLoading}
          >
            {couponLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.couponButtonText}>APPLY</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
      {couponApplied && (
        <Text style={styles.couponSuccessMsg}>
          Coupon "{couponCode}" applied successfully!
        </Text>
      )}
    </View>

    {/* Order Details Card */}
    <View style={styles.orderDetailsContainer}>
      <Text style={styles.sectionTitle}>Order Details</Text>
      
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>MRP Total</Text>
        <Text style={styles.detailValue}>₹{subtotalMRP}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Product Discount</Text>
        <Text style={[styles.detailValue, styles.greenText]}>-₹{subtotalMRP - subtotal}</Text>
      </View>

      {spinDiscountApplied && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Spin Discount ({spinDiscount?.label})</Text>
          <Text style={[styles.detailValue, styles.greenText]}>-₹{spinDiscountAmt}</Text>
        </View>
      )}

      {couponApplied && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Coupon Discount ({couponCode})</Text>
          <Text style={[styles.detailValue, styles.greenText]}>-₹{couponDiscountAmt}</Text>
        </View>
      )}

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Platform Fee</Text>
        <Text style={[styles.detailValue, styles.greenText]}>FREE</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Shipping Fee</Text>
        <Text style={[styles.detailValue, styles.greenText]}>FREE</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total Amount</Text>
        <Text style={styles.totalValue}>₹{totalPrice}</Text>
      </View>
    </View>
  </View>
)}

<LoaderModal visible={loading} />


      </ScrollView>

      {/* Place Order Button */}
      {cart.length >0 && 
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.placeOrderButton}
          onPress={async () => {
            const token = await AsyncStorage.getItem('userId'); // or whatever key you used

            if (token) {
              gotoCheckout(cart)
            } else {
              openLoginModal(cart)

            }
          }}



        >




          <Text style={styles.placeOrderText}>PLACE ORDER</Text>
        </TouchableOpacity>
      </View>
}
      <Modal
        animationType="slide"
        transparent={true}
        visible={loginModalVisible}
        onRequestClose={() => setLoginModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.loginModal}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.logoContainer}>
                <Text style={styles.logo}>M</Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setLoginModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Promotional Banner */}
              <View style={styles.promoBanner}>
                <View style={styles.promoContent}>
                  <View style={styles.saleBadge}>
                    <Text style={styles.endOfText}>END OF</Text>
                    <Text style={styles.reasonText}>REASON</Text>
                    <Text style={styles.saleText}>SALE</Text>
                  </View>

                  <View style={styles.promoTextContainer}>
                    <Text style={styles.welcomeText}>WELCOME TO MYNTRA</Text>
                    <Text style={styles.offerText}>FLAT ₹500 OFF</Text>
                    <Text style={styles.freeShippingText}>+ FREE SHIPPING ON ALL ORDERS</Text>
                  </View>

                  <View style={styles.promoRight}>
                    <Text style={styles.startsText}>STARTS</Text>
                    <Text style={styles.dateText}>MAY 31</Text>
                    <TouchableOpacity style={styles.shopNowButton}>
                      <Text style={styles.shopNowText}>Shop Now</Text>
                      <Ionicons name="chevron-forward" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.promoImageContainer}>
                  <Text style={styles.promoImagePlaceholder}>👫</Text>
                </View>
              </View>

              {/* Login Form */}
              <View style={styles.loginForm}>
                <Text style={styles.loginTitle}>Login <Text style={styles.orText}>or</Text> Signup</Text>

                {/* Mobile Number Input */}
                <View style={styles.inputContainer}>
                  <View style={styles.countryCode}>
                    <Text style={styles.countryCodeText}>+91</Text>
                  </View>
                  <TextInput
                    style={styles.mobileInput}
                    placeholder="Mobile Number*"
                    placeholderTextColor="#999"
                    value={mobileNumber}
                    onChangeText={setMobileNumber}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>

                {/* Terms and Conditions */}
                <View style={styles.termsContainer}>
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => setAgreeTerms(!agreeTerms)}
                  >
                    {agreeTerms && (
                      <Ionicons name="checkmark" size={14} color="#ff3f6c" />
                    )}
                  </TouchableOpacity>

                  <View style={styles.termsTextContainer}>
                    <Text style={styles.termsText}>
                      By continuing, you confirm that you are above 18 years of age, and you agree to Myntra's{' '}
                      <Text style={styles.linkText}>Terms of Use</Text>
                      {' & '}
                      <Text style={styles.linkText}>Privacy Policy</Text>
                    </Text>
                  </View>
                </View>

                {/* Login Button */}
                <TouchableOpacity onPress={handleLogin}
                  style={[
                    styles.loginButton,
                    (!mobileNumber || !agreeTerms) && styles.loginButtonDisabled
                  ]}
                  disabled={!mobileNumber || !agreeTerms}
                >
                  <Text style={[
                    styles.loginButtonText,
                    (!mobileNumber || !agreeTerms) && styles.loginButtonTextDisabled
                  ]}>
                    Login using OTP
                  </Text>
                </TouchableOpacity>

                {/* Help Text */}
                <View style={styles.helpContainer}>
                  <Text style={styles.helpText}>Having trouble logging in? </Text>
                  <TouchableOpacity>
                    <Text style={styles.helpLinkText}>Get help</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.headers}>Verify with OTP</Text>
            <Text style={styles.sentTo}>Sent to {mobileNumber}</Text>

            <View style={styles.otpContainer}>
              {otp?.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={styles.otpBox}
                  maxLength={1}
                  keyboardType="numeric"
                  value={digit}
                  onChangeText={(value) => handleOTPChange(value, index)}
                />
              ))}
            </View>

            <Text style={styles.autoFillText}>
              {timer > 0 ? `Auto-fill in 00:${timer < 10 ? `0${timer}` : timer}` : 'Resend OTP'}
            </Text>

            <TouchableOpacity style={styles.loginButton} onPress={handleSubmit} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Submit</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setVisible(false)} style={{ marginTop: 15 }}>
              <Text style={{ color: '#888' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  bottomContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  placeOrderButton: {
    backgroundColor: '#681117',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  placeOrderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: width - 32,
    maxHeight: height * 0.85,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logoContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ff3f6c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  closeButton: {
    padding: 4,
  },
  promoBanner: {
    backgroundColor: '#ffa726',
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  promoContent: {
    flex: 1,
  },
  saleBadge: {
    backgroundColor: '#9c27b0',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  endOfText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  reasonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  saleText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  promoTextContainer: {
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
    marginBottom: 2,
  },
  offerText: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  freeShippingText: {
    fontSize: 10,
    color: '#333',
    fontWeight: '500',
  },
  promoRight: {
    alignItems: 'flex-start',
  },
  startsText: {
    fontSize: 10,
    color: '#333',
    fontWeight: '600',
  },
  dateText: {
    fontSize: 12,
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  shopNowButton: {
    backgroundColor: '#333',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopNowText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  promoImageContainer: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  promoImagePlaceholder: {
    fontSize: 40,
  },
  loginForm: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  orText: {
    fontWeight: 'normal',
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginBottom: 20,
    overflow: 'hidden',
  },
  countryCode: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  countryCodeText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  mobileInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#333',
  },
  termsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 3,
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  linkText: {
    color: '#ff3f6c',
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#ff3f6c',
    borderRadius: 4,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonDisabled: {
    backgroundColor: '#ccc',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginButtonTextDisabled: {
    color: '#999',
  },
  helpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpText: {
    fontSize: 14,
    color: '#666',
  },
  helpLinkText: {
    fontSize: 14,
    color: '#ff3f6c',
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    width: '90%',
    padding: 24,
    borderRadius: 10,
    alignItems: 'center',
  },
  headers: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  sentTo: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 15,
  },
  otpBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    width: 50,
    height: 55,
    fontSize: 22,
    textAlign: 'center',
    borderRadius: 6,
  },
  autoFillText: {
    fontSize: 14,
    color: '#888',
    marginTop: 10,
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: '#ff3f6c',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    width: '80%',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyBagContainer: {
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 40,
},
emptyBagText: {
  fontSize: 16,
  color: '#555',
  marginTop: 20,
},
shopNowButton: {
  marginTop: 20,
  backgroundColor: '#681117',
  paddingHorizontal: 20,
  paddingVertical: 10,
  borderRadius: 5,
},
shopNowText: {
  color: '#fff',
  fontWeight: 'bold',
},

  summaryContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 8,
    borderTopColor: '#f5f5f5',
  },
  discountBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e6f7ff',
    borderWidth: 1,
    borderColor: '#91d5ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  discountBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  discountBadgeText: {
    fontSize: 14,
    color: '#0050b3',
    fontWeight: '600',
  },
  removeDiscountBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  removeDiscountText: {
    fontSize: 12,
    color: '#ff4d4f',
    fontWeight: 'bold',
  },
  couponContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  couponInputWrapper: {
    flexDirection: 'row',
    gap: 10,
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#fff',
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#999',
  },
  couponButton: {
    backgroundColor: '#681117',
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  couponButtonRemove: {
    backgroundColor: '#ff4d4f',
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledCouponBtn: {
    backgroundColor: '#ccc',
  },
  couponButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  couponSuccessMsg: {
    fontSize: 12,
    color: '#52c41a',
    marginTop: 6,
    fontWeight: '500',
  },
  orderDetailsContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  greenText: {
    color: '#52c41a',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#681117',
  },
});

export default CartScreen;