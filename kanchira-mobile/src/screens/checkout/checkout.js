import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  Modal,
  TextInput,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getAddress, createPayment } from '../../services/home';
import AsyncStorage from '@react-native-async-storage/async-storage';



const CartItem = ({ item }) => (
  <>
    <View style={styles.cartItem}>
      <Image
        source={{ uri: item?.productId?.image || item?.image }}
        style={styles.productImage} />
      <View style={styles.details}>
        <Text style={styles.productName}>{item.productId?.name || item.name}</Text>
        <Text style={styles.productInfo}>
          Size: {item.variant?.size?.size || item.variant?.size || ""} | Color: {item.variant?.color || ""} | Qty: {item.quantity}
        </Text>
        <Text style={styles.productPrice}>
          ₹{item.variant?.price}
        </Text>
      </View>
    </View>

  </>
);

const CheckoutScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState();
  const navigate = useNavigation()
  const route = useRoute();
  const { product, couponCode = '', couponDiscount = 0, spinDiscount = null, spinDiscountAmt = 0 } = route.params || {};
  const [paymentMethod, setPaymentMethod] = useState('ONLINE');
  console.log(product)

  const [userId, setUserId] = useState(null);

  const [form, setForm] = useState({
    fullName: '',
    phoneNumber: '',
    houseNumber: '',
    currentAddress: '',
    state: '',
    city: '',
    district: '',
    pincode: '',
  });

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id);
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchAddress = async () => {
      const id = await AsyncStorage.getItem('userId');
      const response = await getAddress({ userId: id })
      console.log(response)
      setAddresses(response.address)
    };
    fetchAddress();
  }, []);
  const handleChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        userId,
      };
      const response = await AddAddress(payload);
      Alert.alert('Success', 'Address saved!');
      // Close modal
      setModalVisible(false)
    } catch (error) {
      Alert.alert('Error', 'Failed to save address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      Alert.alert('Error', 'Please select a delivery address');
      return;
    }
    const selectedAddress = addresses.find(addr => addr._id === selectedAddressId);
    if (!selectedAddress) {
      Alert.alert('Error', 'Selected address is invalid');
      return;
    }

    try {
      const payload = {
        userId,
        address: selectedAddress,
        items: cartItems,
        totalAmount: total,
        spinDiscount: spinDiscount?.value || 0,
        couponCode: couponCode || "",
        couponDiscount: couponDiscount || 0,
        paymentMethod,
        orderType: "cart"
      };

      const res = await createPayment(payload);
      if (res?.responseCode === 200 || res?.message?.toLowerCase().includes("successfully")) {
        Alert.alert('Success', 'Order placed successfully!', [
          { text: 'OK', onPress: () => navigate.navigate('Home') }
        ]);
      } else if (res?.redirectUrlRes) {
        const redirectUrl = res.redirectUrlRes;
        Linking.openURL(redirectUrl)
          .then(supported => {
            if (supported) {
              Linking.openURL(redirectUrl);
            } else {
              Alert.alert('Error', 'Cannot open payment gateway link');
            }
          })
          .catch(err => {
            console.error('Redirection error:', err);
            Alert.alert('Error', 'Failed to launch payment gateway');
          });
      } else {
        Alert.alert('Error', res?.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Order processing error:', error);
      Alert.alert('Error', 'Failed to process order. Please try again.');
    }
  };

  const cartItems = Array.isArray(product) ? product : (product?.items || []);

  const subtotal = cartItems.reduce((sum, item) => {
    const price = parseFloat(item?.variant?.price) || 0;
    return sum + price * (item.quantity || 1);
  }, 0);

  const discountAmt = spinDiscountAmt || couponDiscount || 0;
  const shipping = 0;
  const total = Math.max(0, subtotal - discountAmt + shipping);

  const handleDeleteAddress = id => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updated = addresses.filter(addr => addr.id !== id);
            setAddresses(updated);
            if (selectedAddressId === id && updated.length > 0) {
              setSelectedAddressId(updated[0].id);
            } else if (updated.length === 0) {
              setSelectedAddressId(null);
            }
          },
        },
      ]
    );
  };

  const handleEditAddress = id => {
    Alert.alert('Edit Address', `Edit address ID: ${id}`);
    // You can replace this with navigation to edit screen or modal
  };

  const handleAddNewAddress = () => {
    setModalVisible(true)
    // Replace with your add address screen or modal logic
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Delivery Addresses List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Delivery Address</Text>
          {addresses.length === 0 && (
            <Text style={{ marginBottom: 10 }}>
              No saved addresses. Please add one.
            </Text>
          )}

          {addresses.map((addr,index) => {
            const selected = addr._id === selectedAddressId;
            return (
              <TouchableOpacity
                key={addr._id}
                style={[
                  styles.addressItem,
                  selected && styles.addressItemSelected,
                ]}
                onPress={() => setSelectedAddressId(addr._id)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.addressName}>{addr.fullName}</Text>
<Text style={styles.addressLine}>
  {`${addr.state}, ${addr.district}, ${addr.pincode}`}
</Text>
                  <Text style={styles.addressPhone}>{addr.phoneNumber}</Text>
                </View>
                <View style={styles.addressActions}>
                  <TouchableOpacity
                    onPress={() => handleEditAddress(addr._id)}
                    style={styles.actionButton}
                  >
                    <Text style={styles.actionText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteAddress(addr._id)}
                    style={styles.actionButton}
                  >
                    <Text style={[styles.actionText, { color: 'red' }]}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            onPress={handleAddNewAddress}
            style={styles.addAddressButton}
          >
            <Text style={styles.addAddressText}>+ Add New Address</Text>
          </TouchableOpacity>
        </View>

        {/* Selected Delivery Address Preview */}
        {/* {selectedAddressId && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <Text style={styles.addressText}>
              {
                addresses.find(addr => addr.id === selectedAddressId)
                  ?.name
              }
              {'\n'}
              {
                addresses.find(addr => addr.id === selectedAddressId)
                  ?.addressLine
              }
              {'\n'}
              {
                addresses.find(addr => addr.id === selectedAddressId)
                  ?.phone
              }
            </Text>
          </View>
        )} */}

        {/* Cart Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Items</Text>
          {cartItems.map((item, index) => (
            <CartItem key={item.productId || index} item={item} />
          ))}
        </View>

        {/* Payment Method Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Payment Method</Text>
          <View style={styles.paymentContainer}>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'ONLINE' && styles.paymentOptionSelected,
              ]}
              onPress={() => setPaymentMethod('ONLINE')}
            >
              <Ionicons
                name={paymentMethod === 'ONLINE' ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={paymentMethod === 'ONLINE' ? '#681117' : '#555'}
              />
              <Text style={styles.paymentText}>Pay Online (PhonePe / UPI / Card)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'COD' && styles.paymentOptionSelected,
              ]}
              onPress={() => setPaymentMethod('COD')}
            >
              <Ionicons
                name={paymentMethod === 'COD' ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={paymentMethod === 'COD' ? '#681117' : '#555'}
              />
              <Text style={styles.paymentText}>Cash on Delivery (COD)</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Subtotal</Text>
            <Text style={styles.summaryText}>₹{subtotal}</Text>
          </View>

          {spinDiscountAmt > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>Spin Discount ({spinDiscount?.label})</Text>
              <Text style={[styles.summaryText, { color: '#52c41a' }]}>-₹{spinDiscountAmt}</Text>
            </View>
          )}

          {couponDiscount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>Coupon Discount ({couponCode})</Text>
              <Text style={[styles.summaryText, { color: '#52c41a' }]}>-₹{couponDiscount}</Text>
            </View>
          )}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Shipping</Text>
            <Text style={[styles.summaryText, { color: '#52c41a' }]}>FREE</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryText, { fontWeight: 'bold' }]}>
              Total
            </Text>
            <Text style={[styles.summaryText, { fontWeight: 'bold' }]}>
              ₹{total}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Checkout Bar */}
      <View style={styles.checkoutBar}>
        <View>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>₹{total}</Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handlePlaceOrder}
        >
          <Text style={styles.checkoutText}>Place Order</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <ScrollView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.title}>Add New Address</Text>
          </View>

          <View style={styles.body}>
            <TextInput
              placeholder="Full Name"
              value={form.fullName}
              style={styles.input}
              onChangeText={text => handleChange('fullName', text)}
            />
            <TextInput
              placeholder="Phone Number"
              value={form.phoneNumber}
              keyboardType="phone-pad"
              style={styles.input}
              onChangeText={text => handleChange('phoneNumber', text)}
            />
            <TextInput
              placeholder="House Number"
              value={form.houseNumber}
              style={styles.input}
              onChangeText={text => handleChange('houseNumber', text)}
            />
            <TextInput
              placeholder="Current Address"
              value={form.currentAddress}
              style={styles.input}
              onChangeText={text => handleChange('currentAddress', text)}
            />
            <TextInput
              placeholder="State"
              value={form.state}
              style={styles.input}
              onChangeText={text => handleChange('state', text)}
            />
            <TextInput
              placeholder="City"
              value={form.city}
              style={styles.input}
              onChangeText={text => handleChange('city', text)}
            />
            <TextInput
              placeholder="District"
              value={form.district}
              style={styles.input}
              onChangeText={text => handleChange('district', text)}
            />
            <TextInput
              placeholder="Pincode"
              value={form.pincode}
              keyboardType="numeric"
              style={styles.input}
              onChangeText={text => handleChange('pincode', text)}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}>
              <Text style={styles.saveBtnText}>Save Address</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 15, paddingTop: 25 },
  title: { fontSize: 22, fontWeight: 'bold', paddingVertical: 15, color: '#000' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10, color: '#222' },
  addressItem: {
    flexDirection: 'row',
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  addressItemSelected: {
    borderWidth: 2,
    borderColor: '#681117',
  },
  addressName: { fontWeight: '600', fontSize: 16, marginBottom: 2 },
  addressLine: { color: '#555', fontSize: 14 },
  addressPhone: { color: '#555', fontSize: 14, marginTop: 2 },
  addressActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 12,
  },
  actionText: {
    fontSize: 14,
    color: '#681117',
    fontWeight: '600',
  },
  addAddressButton: {
    paddingVertical: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#681117',
    alignItems: 'center',
  },
  addAddressText: {
    color: '#681117',
    fontWeight: '600',
    fontSize: 16,
  },
  addressText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  details: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  productInfo: {
    fontSize: 14,
    color: '#666',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  summaryText: {
    fontSize: 15,
    color: '#444',
  },
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  totalLabel: {
    fontSize: 14,
    color: '#555',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  checkoutButton: {
    backgroundColor: '#681117',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 5,
  },
  checkoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  body: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    fontSize: 14,
  },
  saveBtn: {
    backgroundColor: '#681117',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  paymentContainer: {
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    padding: 10,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 8,
    gap: 12,
  },
  paymentOptionSelected: {
    borderWidth: 1.5,
    borderColor: '#681117',
  },
  paymentText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
});

export default CheckoutScreen;
