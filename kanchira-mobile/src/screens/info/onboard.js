import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }) => (
  <View style={styles.container}>
    <Image
        source={require('../../assets/kanchiralogo.png')} // Replace with your image path
      style={styles.image}
      resizeMode="contain"
    />
    <Text style={styles.title}>Welcome to Trendy Shopping</Text>
    <Text style={styles.subtitle}>Get the latest fashion at your fingertips</Text>
    <TouchableOpacity style={styles.button} onPress={() => navigation.replace('Main')}>
      <Text style={styles.buttonText}>Get Started</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width * 0.8,
    height: height * 0.4,
    marginBottom: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#681117',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default OnboardingScreen;
