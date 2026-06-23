import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCart } from './home';
import { addToCart, setCart } from '../redux/slices/cart';

const LoadCart = () => {
  const dispatch = useDispatch();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem("userId");
      setUserId(id);
    };
    fetchUserId();
  }, []);

useEffect(() => {
  const fetchCart = async () => {
    try {
      if (userId) {
        // ✅ Get cart from server
        const data = await getCart({ userId });
        console.log(data, "cartItems");
        dispatch(setCart(data.cart?.items || []));
      } 
      else {
        // ✅ Get local cart from AsyncStorage
        const localCartStr = await AsyncStorage.getItem('localCart');
        const localCart = localCartStr ? JSON.parse(localCartStr) : [];

        if (Array.isArray(localCart.items)) {
          const totalCount = (localCart.items).reduce((sum, item) => sum + item.quantity, 0);
          console.log(totalCount, "cardLoad");
          
          dispatch(setCart(localCart.items));
        } else {
          console.log("Local cart is not an array", localCart);
          dispatch(setCart([]));
        }
      }
    } catch (error) {
      console.log("Failed to load cart:", error);
    }
  };

  fetchCart();
}, [userId]);

  return null;
};

export default LoadCart;
