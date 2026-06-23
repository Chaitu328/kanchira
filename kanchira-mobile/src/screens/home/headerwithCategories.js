import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import CategoryList from './categories';

const HeaderWithCategories = ({ navigation }) => {
  return (
    <>
      {/* Status bar */}

      {/* Main Header */}
      <View style={styles.headerContainer}>
        {/* Delivery location row */}
        <View style={styles.locationRow}>
          <MaterialIcons name="location-pin" size={18} color="#fff" />
          <Text style={styles.deliveryText}>Delivery to </Text>
          <Text style={styles.locationText}>Home - 400001</Text>
          <MaterialIcons name="keyboard-arrow-down" size={18} color="#fff" />
        </View>

        {/* Search and icons row */}
        <View style={styles.searchRow}>
          <TouchableOpacity style={styles.searchContainer}>
            <FontAwesome name="search" size={14} color="#696e79" style={styles.searchIcon} />
            <Text style={styles.searchText}>Search for products, brands and more</Text>
          </TouchableOpacity>

          <View style={styles.iconsContainer}>
            {/* <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Notifications')}>
              <Ionicons name="notifications-outline" size={20} color="#fff" />
            </TouchableOpacity> */}
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Wishlist')}>
              <Ionicons name="heart-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoryContainer}>
        <CategoryList />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#681117',
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  deliveryText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
    fontFamily: 'Helvetica',
  },
  locationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
    fontFamily: 'Helvetica',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 4,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchText: {
    color: '#696e79',
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  iconsContainer: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 15,
  },
  categoryContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9e9ed',
  },
});

export default HeaderWithCategories;