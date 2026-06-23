import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AddAddress, getAddress } from '../../services/home';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.015;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const AddressScreen = () => {
  const navigation=useNavigation()
  const [region, setRegion] = useState({
    latitude: 17.4933,
    longitude: 78.3986,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });

   const [userId, setUserId] = useState(null);
const [address,setAddresses]=useState("")
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
  
  // Address form state
  const [form, setForm] = useState({
    userId: '',
    fullName: '',
    phoneNumber: '',
    houseNumber: '',
    currentAddress: '',
    state: '',
    city: '',
    district: '',
    pincode: '',
  });

  const handleChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

 const handleSubmit = async () => {
    const dataToSend = {
    ...form,
    userId:userId ,  // override or set userId here
  };

  try {
    const response = await AddAddress(dataToSend)
        Alert.alert('Success', 'Address saved successfully!');

    navigation.navigate("Checkout")
    console.log('Response from API:', response);
  } catch (error) {
    console.error('API error:', error);
    Alert.alert('Error', 'Something went wrong. Please try again.');
  }
};
  useEffect(() => {
    const fetchAddress = async () => {
      const id = await AsyncStorage.getItem('userId');
      const response = await getAddress({ userId: id })
      console.log(response)
      setAddresses(response.address)
    };
    fetchAddress();
  }, []);

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        
        <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Select Delivery Address</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <TextInput
          placeholder="Please enter your society details for better delivery"
          placeholderTextColor="#999"
          style={styles.searchInput}
          value={form.currentAddress}
          onChangeText={text => handleChange('currentAddress', text)}
        />
      </View>

     

      {/* Delivery Details / Form */}
      <View style={styles.deliveryDetails}>
        <Text style={styles.deliveryToLabel}>Delivery Details</Text>

      

        {/* Full Name */}
        <TextInput
          placeholder="Full Name *"
          style={styles.input}
          value={form.fullName}
          onChangeText={text => handleChange('fullName', text)}
        />

        {/* Phone Number */}
        <TextInput
          placeholder="Phone Number *"
          keyboardType="phone-pad"
          style={styles.input}
          value={form.phoneNumber}
          onChangeText={text => handleChange('phoneNumber', text)}
        />

        {/* House Number */}
        <TextInput
          placeholder="House Number"
          style={styles.input}
          value={form.houseNumber}
          onChangeText={text => handleChange('houseNumber', text)}
        />

        {/* State */}
        <TextInput
          placeholder="State"
          style={styles.input}
          value={form.state}
          onChangeText={text => handleChange('state', text)}
        />

        {/* City */}
        <TextInput
          placeholder="City"
          style={styles.input}
          value={form.city}
          onChangeText={text => handleChange('city', text)}
        />

        {/* District */}
        <TextInput
          placeholder="District"
          style={styles.input}
          value={form.district}
          onChangeText={text => handleChange('district', text)}
        />

        {/* Pincode */}
        <TextInput
          placeholder="Pincode"
          keyboardType="number-pad"
          style={styles.input}
          value={form.pincode}
          onChangeText={text => handleChange('pincode', text)}
        />

        <TouchableOpacity style={styles.completeBtn} onPress={handleSubmit}>
          <Text style={styles.completeBtnText}>Save Address</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default AddressScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
    color: '#333',
  },
  searchBar: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#000',
  },
  mapWrapper: {
    height: 250,
    width: '100%',
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  pinTooltip: {
    backgroundColor: '#1e1e2f',
    padding: 10,
    borderRadius: 8,
    position: 'absolute',
    top: 20,
    left: '10%',
    zIndex: 2,
    maxWidth: '80%',
  },
  tooltipText: {
    color: '#fff',
    fontSize: 13,
  },
  currentLocationButton: {
    position: 'absolute',
    bottom: 15,
    alignSelf: 'center',
    backgroundColor: '#fff0f5',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderColor: '#ff3c6f',
    borderWidth: 1,
  },
  currentLocationText: {
    color: '#ff3c6f',
    fontWeight: '600',
    fontSize: 14,
  },
  deliveryDetails: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  deliveryToLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 14,
    color: '#000',
  },
  completeBtn: {
    backgroundColor: '#681117',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  completeBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
