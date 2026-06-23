// store/slices/cartSlice.js
import { createSlice } from '@reduxjs/toolkit';


const initialState = {
  items: [], // array of products
};
const cartSlice = createSlice({
  name: 'wish',
  initialState,
  reducers: {
    addToWish(state, action) {
      console.log(state,"reduxxxxxxx")
      state.items.push(action.payload);
    },
    removeFromWish(state, action) {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    setWish(state, action) {
      state.items = action.payload;
    },
    clearWish(state) {
      state.items = [];
    }
  }
});

export const { addToWish, removeFromWish, setWish, clearWish } = cartSlice.actions;
export default cartSlice.reducer;
