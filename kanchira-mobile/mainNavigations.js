import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Screens
import SplashScreen from './src/screens/info/splash';
import LoginScreen from './src/screens/auth/login';
import ProductDetailsScreen from './src/screens/home/productDetails';
import CheckoutScreen from './src/screens/checkout/checkout';
import OnboardingScreen from './src/screens/info/onboard';
import OrdersScreen from './src/screens/user/order';
import CartScreen from './src/screens/cart/cart';
import ProfileScreen from './src/screens/user/profile';
import HomeScreen from './src/screens/home/home';
import CategoryProducts from './src/screens/home/categoryProducts';
import CategoriesScreen from './src/screens/home/mainCategories';
import UserLogin from './src/screens/user/userLogin';
import OTPVerifyScreen from './src/screens/user/otp';
import AddressScreen from './src/screens/user/address';
import CategoryList from './src/screens/home/categories';
import WishlistScreen from './src/screens/cart/wishlist';
import UpdateProfileScreen from './src/screens/user/updateProfile';
import FAQScreen from './src/screens/user/faq';
import AboutUsScreen from './src/screens/user/about';
import TermsScreen from './src/screens/user/terms';
import PrivacyScreen from './src/screens/user/privacy';
import { useSelector } from 'react-redux';
import { StyleSheet, Text, View } from 'react-native';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main bottom tab navigator
const MainTab = () => {
const cartCount = useSelector(state => (state.cart.items));

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
            return <Ionicons name={iconName} size={22} color={color} />;
          } else if (route.name === 'Cart') {
            iconName = focused ? 'bag' : 'bag-outline';
            return (
              <View>
                <Ionicons name={iconName} size={22} color={color} />
                {cartCount?.length > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{cartCount?.length}</Text>
                  </View>
                )}
              </View>
            );
          } else if (route.name === 'UserProfile') {
            iconName = focused ? 'person-circle' : 'person-circle-outline';
            return <Ionicons name={iconName} size={22} color={color} />;
          }
        },
        tabBarActiveTintColor: '#681117',
        tabBarInactiveTintColor: 'black',
        tabBarStyle: {
          height: 60,
          paddingTop: 6,
          paddingBottom: 6,
          borderTopColor: '#ddd',
          borderTopWidth: 0.5,
          backgroundColor: '#fff',
          elevation: 8,
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 10.5,
          fontWeight: '600',
          textTransform: 'none',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Cart" component={CartScreen} options={{ tabBarLabel: 'Cart' }} />
      <Tab.Screen name="UserProfile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
};



const MainNavigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={MainTab} />
        <Stack.Screen name="CategoryProducts" component={CategoryProducts} />
        <Stack.Screen name="UserProfile" component={ProfileScreen} />
        <Stack.Screen name="UserLogin" component={UserLogin} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="Wishlist" component={WishlistScreen} />
                <Stack.Screen name="UpdateProfile" component={UpdateProfileScreen} />
        <Stack.Screen name="Otp" component={OTPVerifyScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Address" component={AddressScreen} />
    <Stack.Screen name="Home" component={HomeScreen}/>
        <Stack.Screen name="Faq" component={FAQScreen}/>
    <Stack.Screen name="About" component={AboutUsScreen}/>
    <Stack.Screen name="Terms" component={TermsScreen}/>
    <Stack.Screen name="Privacy" component={PrivacyScreen}/>
        <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="Orders" component={OrdersScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: -6,
    top: -4,
    backgroundColor: '#b11226',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});



export default MainNavigation;
