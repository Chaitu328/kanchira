import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const orders = [
  { id: '1', item: 'T-Shirt', date: '2024-01-01' },
  { id: '2', item: 'Shoes', date: '2024-01-02' },
];

const OrdersScreen = () => (
  <View style={styles.container}>
    <FlatList
      data={orders}
      keyExtractor={item => item.id}
      renderItem={({ item }) => <Text>{item.item} - {item.date}</Text>}
    />
  </View>
);

const styles = StyleSheet.create({
  container: { padding: 20 },
});

export default OrdersScreen;
