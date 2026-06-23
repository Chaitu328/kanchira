// HomeScreen.js
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import Dashboard from './Dashboard';

const HomeScreen = ({ navigation }) => (
  <View style={styles.container}>
          <Dashboard />
  
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
  },
 
});

export default HomeScreen;
