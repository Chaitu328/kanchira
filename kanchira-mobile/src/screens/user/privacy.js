import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const PrivacyScreen = ({ navigation }) => (
  <View style={styles.container}>
    <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>FAQs</Text>
        </View>
    <ScrollView style={styles.content}>
      <Text style={styles.sectionTitle}>1. Information Collection</Text>
      <Text style={styles.text}>
        We collect personal data for account creation, usage analytics, and service improvement.
      </Text>

      <Text style={styles.sectionTitle}>2. Data Usage</Text>
      <Text style={styles.text}>
        Your information is used strictly for improving app functionality and customer service.
      </Text>

      <Text style={styles.sectionTitle}>3. Data Security</Text>
      <Text style={styles.text}>
        We ensure data security using industry-standard encryption and safe practices.
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
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 20,
    color: '#222',
  },
  text: {
    fontSize: 15,
    color: '#444',
    marginTop: 8,
    lineHeight: 22,
  },
});

export default PrivacyScreen;
