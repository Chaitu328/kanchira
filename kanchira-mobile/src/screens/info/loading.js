import React, { useEffect, useRef } from 'react';
import { Modal, View, StyleSheet, Animated, Easing } from 'react-native';

const LoaderModal = ({ visible }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000, // Slower fade-in
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0.3,
            duration: 1000, // Slower fade-out
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      fadeAnim.stopAnimation();
      fadeAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.Image
          source={require('../../assets/kanchiralogo.png')} // Adjust your path as needed
          style={[styles.loaderImage, { opacity: fadeAnim }]}
          resizeMode="contain"
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
  },
});

export default LoaderModal;
