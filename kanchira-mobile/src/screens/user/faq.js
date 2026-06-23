import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const FAQScreen = ({ navigation }) => (
  <View style={styles.container}>
    
    {/* Header with back arrow */}
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>FAQs</Text>
    </View>

    <ScrollView style={styles.content}>
      <Text style={styles.question}>Q: How do I create an account?</Text>
      <Text style={styles.answer}>A: Go to the signup screen and fill in your details.</Text>

      <Text style={styles.question}>Q: How can I reset my password?</Text>
      <Text style={styles.answer}>A: Tap "Forgot Password" on the login screen to reset it.</Text>

      <Text style={styles.question}>Q: Where can I view my orders?</Text>
      <Text style={styles.answer}>A: Go to the "My Orders" section in the profile tab.</Text>
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
  question: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 20,
    color: '#222',
  },
  answer: {
    fontSize: 15,
    color: '#444',
    marginTop: 8,
    lineHeight: 22,
  },
});

export default FAQScreen;
