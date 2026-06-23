import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {  getWishlist } from './home';
import { setWish } from '../redux/slices/wishlist';

const LoadWish = () => {
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

        const data = await getWishlist({ userId });
          console.log(data, "cartItems");
dispatch(setWish(data.cart?.items || [])); // ✅ only send actual items array
              }
              else {
        // ✅ Get local cart from AsyncStorage
        const localCartStr = await AsyncStorage.getItem('localWish');
        const localCart = localCartStr ? JSON.parse(localCartStr) : [];
        if (Array.isArray(localCart.items)) {
          const totalCount = (localCart.items).reduce((sum, item) => sum + item.quantity, 0);
          console.log(totalCount, "wishLoad");
          dispatch(setWish(localCart.items || []));
        }
              
      }
    }catch (error) {
        console.log("Failed to load cart:", error);
      }
    };
    fetchCart();
  }, [userId]);

  return null;
};

export default LoadWish;
