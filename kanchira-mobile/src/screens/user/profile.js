import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Dimensions,
  Modal,
  TextInput,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { userRegister } from '../../services/home';
import AsyncStorage from '@react-native-async-storage/async-storage';
const { width, height } = Dimensions.get('window');

const ProfileScreen = () => {
          const navigation = useNavigation();
           const [loginModalVisible, setLoginModalVisible] = useState(false);
             const [selectedSection, setSelectedSection] = useState('');

  const [mobileNumber, setMobileNumber] = useState('');
  // const userId=AsyncStorage.getItem("userId")
  const [agreeTerms, setAgreeTerms] = useState(false);

  const openLoginModal =async () => {
    setLoginModalVisible(true);
  };

  
  const closeLoginModal = () => {
    setLoginModalVisible(false);
    setMobileNumber('');
    setAgreeTerms(false);
  };
  const handleLogin=async()=>{
    console.log("sfnsosjj0siji")
    const payload={
      phone:mobileNumber
    }
    console.log(payload)
    const data=await userRegister(payload);
    console.log(data)
    if(data.responseCode==200){
    await AsyncStorage.setItem("userId", String(data.userId)); // Store safely
    setLoginModalVisible(false)
navigation.navigate("Otp", { phone: mobileNumber,routes:"Profile" });
    }
  }
 const handleLogout = async () => {
  await AsyncStorage.removeItem("userId");
  setUserId(null); // update local state to reflect logout
};

  const [userId, setUserId] = useState(null);

    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        setUserId(storedUserId);
      } catch (e) {
        console.log("Error fetching userId", e);
      }
    };

  
  useFocusEffect(
    useCallback(() => {
      // This runs every time the screen comes into focus
      fetchUserId()
    }, [])
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
 {/* Header */}

<View style={styles.header}>
  <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
    <Ionicons name="arrow-back" size={24} color="#333" />
  </TouchableOpacity>
  <Text style={styles.headerTitle}>Profile</Text>
</View>

{/* Profile Banner */}
 

  {/* <View style={styles.loginSection}>
    {userId == null ? (
      <TouchableOpacity style={styles.loginButton} onPress={openLoginModal}>
        <Text style={styles.loginButtonText}>LOG IN / SIGN UP</Text>
      </TouchableOpacity>
    ) : ( 
      <TouchableOpacity style={styles.loginButton}>
        <Text style={styles.loginButtonText}>Profile</Text>
      </TouchableOpacity>
    )}
  </View> */}


      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
     
{userId?
        <View style={styles.menuSection}>
          {/* Orders */}
             <TouchableOpacity style={styles.menuItem} onPress={()=>navigation.navigate("Address")}>
            <View style={styles.menuItemLeft}>
              <Feather name="package" size={24} color="#999" style={styles.menuIcon} />
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Address</Text>
                <Text style={styles.menuDescription}>Check your list of Address</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
             <TouchableOpacity style={styles.menuItem} onPress={()=>navigation.navigate("UpdateProfile")}>
            <View style={styles.menuItemLeft}>
              <Feather name="package" size={24} color="#999" style={styles.menuIcon} />
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Profile</Text>
                <Text style={styles.menuDescription}>Check Your Prodile Details</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Feather name="package" size={24} color="#999" style={styles.menuIcon} />
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Orders</Text>
                <Text style={styles.menuDescription}>Check your order status</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          
          {/* Help Center */}
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Feather name="help-circle" size={24} color="#999" style={styles.menuIcon} />
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Help Center</Text>
                <Text style={styles.menuDescription}>Help regarding your recent purchases</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          
          {/* Wishlist */}
          {/* <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Feather name="heart" size={24} color="#999" style={styles.menuIcon} />
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Wishlist</Text>
                <Text style={styles.menuDescription}>Your most loved styles</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity> */}
        </View>
:
<View>
       <View style={styles.loginSections}>
  <View style={styles.loginCard}>
    <Text style={styles.loginPrompt}>You're not logged in</Text>
    <TouchableOpacity style={styles.loginCardButton} onPress={openLoginModal}>
      <Text style={styles.loginCardButtonText}>Log In / Sign Up</Text>
    </TouchableOpacity>
  </View>
</View>
        <View style={styles.legalSection}>
          <TouchableOpacity style={styles.legalItem} onPress={()=>navigation.navigate("Faq")}>
            <Text style={styles.legalText}>FAQs</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.legalItem} onPress={()=>navigation.navigate("About")}>
            <Text style={styles.legalText}>ABOUT US</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.legalItem} onPress={()=>navigation.navigate("Terms")}>
            <Text style={styles.legalText}>TERMS OF USE</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.legalItem} onPress={()=>navigation.navigate("Privacy")}>
            <Text style={styles.legalText}>PRIVACY POLICY</Text>
          </TouchableOpacity>
          
          
        </View>
        </View>
}
        { userId&&
          <TouchableOpacity style={styles.backButton} onPress={handleLogout}>

 <View style={styles.logoutContainer}>
          <Text style={styles.logoutText}>LogOut</Text>
        </View>
        </TouchableOpacity>
       
}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>APP VERSION 4.2505.12</Text>
        </View>
      </ScrollView>
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
                      <TouchableOpacity  onPress={handleLogin}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
  },
  content: {
    flex: 1,
  },
 profileBanner: {
  backgroundColor: '#4c5366',
  paddingTop:70, // space for image
  paddingBottom:10,
  paddingHorizontal: 10,
  alignItems: 'center', // center login button
},

profileImageContainer: {
  position: 'absolute',
  alignSelf: 'center',
  zIndex: 2,
  paddingTop:10
},

profileImage: {
  width: 120,
  height: 120,
  backgroundColor: '#fff',
  borderRadius: 20,
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 4,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 6,
},

loginSection: {
  marginTop: 70,
  width: '100%',
  paddingHorizontal: 16,
},

loginButton: {
  backgroundColor: '#ff3f6c',
  borderRadius: 8,
  paddingVertical: 14,
  alignItems: 'center',
},

loginButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
},

  menuSection: {
    backgroundColor: '#fff',
    paddingVertical: 8,
  },
    loginSections: {
    paddingVertical: 8,
    margin:10
  },
  loginCard: {
  backgroundColor: '#fff',
  padding: 20,
  borderRadius: 16,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 6,
  elevation: 5,
  alignItems: 'center',
  margin: 20,
},

loginPrompt: {
  fontSize: 16,
  color: '#333',
  marginBottom: 12,
},

loginCardButton: {
  backgroundColor: '#681117',
  borderRadius: 25,
  paddingVertical: 10,
  paddingHorizontal: 30,
},

loginCardButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '600',
},

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 12,
    color: '#999',
  },
  legalSection: {
    backgroundColor: '#fff',
    marginTop: 8,
  },
  legalItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  legalText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 14,

  },
   logoutContainer: {
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: '#681117',
    borderRadius: 4,
    margin:10,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: '#999',
  },
   logoutText: {
    fontSize: 14,
    color: '#fff',
    fontWeight:"bold"
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
    backgroundColor: '#681117',
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

export default ProfileScreen;

