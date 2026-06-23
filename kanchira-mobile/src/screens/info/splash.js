import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace('Onboarding'); // Change to 'Login' or 'Main' as needed
    }, 2000);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/kanchiralogo.png')} // Replace with your image path
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  logo: { width: 150, height: 150, marginBottom: 30 }, // Adjust size as needed
  text: { marginTop: 20, fontSize: 18 },
});

export default SplashScreen;
