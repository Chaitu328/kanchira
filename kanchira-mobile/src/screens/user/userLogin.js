import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Modal,
  Dimensions,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userRegister } from '../../services/home';

const { width, height } = Dimensions.get('window');

const UserLogin = () => {
    
  const [loginModalVisible, setLoginModalVisible] = useState(true);
  const [mobileNumber, setMobileNumber] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!mobileNumber || !agreeTerms) return;
    setLoading(true);
    try {
      const response = await userRegister({ phone: mobileNumber });
      if (response.responseCode === 200) {
        setLoginModalVisible(false);
        navigation.navigate('Otp', { phone: mobileNumber, routes: 'Main' });
      } else {
        alert(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Background Profile Screen */}
      <View style={styles.backgroundScreen}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Profile Banner */}
        <View style={styles.profileBanner}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImage}>
              <Feather name="user" size={50} color="#5c6178" />
            </View>
          </View>
        </View>
      </View>

      {/* Login Modal */}
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
                <TouchableOpacity 
                  style={[
                    styles.loginButton,
                    (!mobileNumber || !agreeTerms || loading) && styles.loginButtonDisabled
                  ]}
                  disabled={!mobileNumber || !agreeTerms || loading}
                  onPress={handleLogin}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  backgroundScreen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
  },
  profileBanner: {
    backgroundColor: '#4c5366',
    height: 200,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  profileImageContainer: {
    position: 'absolute',
    top: 20,
    left: 32,
  },
  profileImage: {
    width: 120,
    height: 120,
    backgroundColor: '#b0b0b0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default UserLogin;