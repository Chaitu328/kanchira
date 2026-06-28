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
        const localCartStr = await AsyncStorage.getItem('localWish');
        const localCart = localCartStr ? JSON.parse(localCartStr) : [];
        if (Array.isArray(localCart.items)) {
          dispatch(setWish(localCart.items || []));
        } else {
          dispatch(setWish([]));
        }
      } catch (error) {
        console.log("Failed to load wishlist:", error);
      }
    };
    fetchCart();
  }, []);

  return null;
};

export default LoadWish;
