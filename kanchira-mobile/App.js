import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider, useSelector } from 'react-redux';
import MainNavigation from './mainNavigations';
import { store } from './src/redux/store';
import LoadCart from './src/services/cartLoad';
import LoadWish from './src/services/wishLoad';

const App = () => (
  <Provider store={store}>
      <LoadCart />
      <LoadWish/> 
      <MainNavigation />
  </Provider>
);

export default App;
