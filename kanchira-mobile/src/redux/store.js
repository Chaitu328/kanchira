// redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './slices/cart';
import wishReducer from './slices/wishlist';


export const store = configureStore({
  reducer: {
    cart: cartReducer,
    wish: wishReducer

  },
});
