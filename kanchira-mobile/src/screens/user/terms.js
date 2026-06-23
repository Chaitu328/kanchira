import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const TermsScreen = ({ navigation }) => (
  <View style={styles.container}>
    <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>FAQs</Text>
        </View>
    <ScrollView style={styles.content}>
      <Text style={styles.sectionTitle}>1. Acceptance</Text>
      <Text style={styles.text}>
        By using this app, you agree to the terms listed here. Please read carefully.
      </Text>

      <Text style={styles.sectionTitle}>2. Usage</Text>
      <Text style={styles.text}>
        You may not misuse the app in any way that violates applicable laws.
      </Text>

      <Text style={styles.sectionTitle}>3. Changes</Text>
      <Text style={styles.text}>
        We reserve the right to modify these terms at any time without notice.
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

export default TermsScreen;
