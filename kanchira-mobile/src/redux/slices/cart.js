// store/slices/cartSlice.js
import { createSlice } from '@reduxjs/toolkit';


const initialState = {
  items: [], // array of products
};
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action) {
      console.log(state,"reduxxxxxxx")
      state.items.push(action.payload);
    },
    removeFromCart(state, action) {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    setCart(state, action) {
      state.items = action.payload;
    },
    clearCart(state) {
      state.items = [];
    }
  }
});

export const { addToCart, removeFromCart, setCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
