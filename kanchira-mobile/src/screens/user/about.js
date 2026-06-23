import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const AboutUsScreen = ({ navigation }) => (
  <View style={styles.container}>
     <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>About</Text>
        </View>
    <ScrollView style={styles.content}>
      <Text style={styles.text}>
        We are committed to delivering the best shopping experience. Our platform offers a wide variety of products tailored to your needs.
      </Text>
      <Text style={styles.text}>
        Founded in 2023, we aim to bridge the gap between quality and affordability. Thank you for being a part of our journey!
      </Text>
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
  },
  backButton: {
    paddingRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    padding: 16,
  },
  text: {
    fontSize: 15,
    color: '#444',
    marginBottom: 15,
    lineHeight: 22,
  },
});

export default AboutUsScreen;
