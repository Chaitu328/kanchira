import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { otpVerify } from '../../services/home';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OTPVerifyScreen = () => {
  const [timer, setTimer] = useState(30); // increased to 30s
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);
  const navigation=useNavigation()

    const route = useRoute();
  const { phone,routes } = route.params || {}; // receives phone number

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOTPChange = (value, index) => {
  if (/^\d$/.test(value) || value === '') {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    if (!value && index > 0) {
      inputRefs.current[index - 1]?.focus(); // optional: go back on delete
    }
  }
};


  const handleSubmit = async () => {
    const otpCode = otp.join('');
    if (otpCode.length < 4) {
      Alert.alert('Error', 'Please enter the complete 4-digit OTP');
      return;
    }

    const payload = {
      phone,
      OTP: otpCode,
    };

    try {
      setLoading(true);
      const response = await otpVerify(payload);
      console.log('API Response:', response);
      if (response.responseCode === 200) {
        if (response.token) {
          await AsyncStorage.setItem("userToken", response.token);
        }
        if (response.userId) {
          await AsyncStorage.setItem("userId", String(response.userId));
        }
        Alert.alert("Success", "Verified successfully!");
        navigation.navigate(routes || 'Main');
      } else {
        Alert.alert("Verification Failed", response.message || "Invalid OTP");
      }

   
    } catch (error) {
      console.error('OTP Error:', error.message);
      Alert.alert('Error', 'Something went wrong while verifying OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Verify with OTP</Text>
      <Text style={styles.sentTo}>Sent to {phone}</Text>

      <View style={styles.otpContainer}>
  {otp.map((digit, index) => (
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  sentTo: {
    fontSize: 14,
    color: '#555',
    marginBottom: 30,
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
    backgroundColor: '#681117',
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
});

export default OTPVerifyScreen;
