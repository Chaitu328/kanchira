import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated } from 'react-native';

const SpinWheelModal = ({ visible, onClose }) => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const spinValue = new Animated.Value(0);
  
  // Updated offers based on the reference image
  const offers = [
    { id: 1, product: 'Switch to Arte!', subtext: 'Postpaid', color: '#FF0000', percentage: 20, icon: '🎨' },
    { id: 2, product: 'Get $550 Free*', subtext: 'Ludo Cash', color: '#00A859', percentage: 15, icon: '💰' },
    { id: 3, product: '1,000 Zepio Cash', subtext: '', color: '#FFA500', percentage: 25, icon: '🪙' },
    { id: 4, product: 'Spin to Win', subtext: 'Try Again', color: '#4169E1', percentage: 20, icon: '🎡' },
    { id: 5, product: '500 Bonus Points', subtext: '', color: '#800080', percentage: 20, icon: '⭐' },
  ];

  // Calculate wheel segments
  const wheelSegments = [];
  let cumulativePercent = 0;
  
  offers.forEach(offer => {
    const segment = {
      ...offer,
      startAngle: cumulativePercent * 3.6,
      endAngle: (cumulativePercent + offer.percentage) * 3.6
    };
    wheelSegments.push(segment);
    cumulativePercent += offer.percentage;
  });

  const spinWheel = () => {
    if (spinning) return;
    
    setSpinning(true);
    setResult(null);
    
    const random = Math.random() * 100;
    let cumulative = 0;
    let selectedOffer = null;
    
    for (const offer of offers) {
      cumulative += offer.percentage;
      if (random <= cumulative) {
        selectedOffer = offer;
        break;
      }
    }
    
    const rotations = 5;
    const segmentAngle = 360 / 100 * (selectedOffer.percentage / 2 + cumulative - selectedOffer.percentage);
    const endAngle = rotations * 360 + (360 - segmentAngle);
    
    Animated.timing(spinValue, {
      toValue: endAngle,
      duration: 5000,
      useNativeDriver: true,
    }).start(() => {
      setSpinning(false);
      setResult(selectedOffer);
    });
    
    spinValue.setValue(0);
  };

  const getSegmentStyle = (startAngle, endAngle, color) => {
    const angle = endAngle - startAngle;
    return {
      backgroundColor: color,
      width: '50%',
      height: '50%',
      position: 'absolute',
      transform: [
        { rotate: `${startAngle}deg` },
      ],
      overflow: 'hidden',
      borderTopRightRadius: angle >= 180 ? 0 : '100%',
      borderBottomRightRadius: angle >= 180 ? 0 : '100%',
    };
  };

  const spinTransform = spinValue.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.spinWheelModalContainer}>
        <View style={styles.spinWheelModalContent}>
          <Text style={styles.spinWheelTitle}>Exclusive Offers!</Text>
          <Text style={styles.spinWheelSubtitle}>Spin to win amazing prizes</Text>
          
          <View style={styles.spinWheelOuterContainer}>
            <Animated.View style={[styles.spinWheel, { transform: [{ rotate: spinTransform }] }]}>
              {wheelSegments.map((segment, index) => (
                <View key={index} style={getSegmentStyle(segment.startAngle, segment.endAngle, segment.color)}>
                  <View style={styles.spinWheelSegmentContent}>
                    <Text style={styles.spinWheelSegmentIcon}>{segment.icon}</Text>
                    <Text style={styles.spinWheelSegmentText}>{segment.product}</Text>
                    {segment.subtext ? <Text style={styles.spinWheelSegmentSubtext}>{segment.subtext}</Text> : null}
                  </View>
                </View>
              ))}
            </Animated.View>
            
            <View style={styles.spinWheelCenterCircle}>
              <TouchableOpacity 
                style={styles.spinWheelButton} 
                onPress={spinWheel}
                disabled={spinning}
              >
                <Text style={styles.spinWheelButtonText}>{spinning ? '...' : 'SPIN'}</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.spinWheelPointer} />
          </View>
          
          {result && (
            <View style={styles.spinWheelResultContainer}>
              <Text style={styles.spinWheelResultTitle}>You Won!</Text>
              <Text style={styles.spinWheelResultPrize}>{result.product}</Text>
              {result.subtext ? <Text style={styles.spinWheelResultSubtext}>{result.subtext}</Text> : null}
              <TouchableOpacity style={styles.spinWheelClaimButton} onPress={onClose}>
                <Text style={styles.spinWheelClaimButtonText}>CLAIM NOW</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const App = () => {
  const [firstTime, setFirstTime] = useState(true);
  const [showSpinWheel, setShowSpinWheel] = useState(false);

  useEffect(() => {
    if (firstTime) {
      setTimeout(() => setShowSpinWheel(true), 1000);
      setFirstTime(false);
    }
  }, []);

  return (
    <View style={styles.appContainer}>
      <Text style={styles.appTitle}>Dashboard</Text>
      
      <SpinWheelModal 
        visible={showSpinWheel} 
        onClose={() => setShowSpinWheel(false)} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  // App styles
  appContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  // Spin wheel modal styles
  spinWheelModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  spinWheelModalContent: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    width: '90%',
    maxWidth: 350,
  },
  spinWheelTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  spinWheelSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 25,
  },

  // Wheel container styles
  spinWheelOuterContainer: {
    position: 'relative',
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  spinWheel: {
    width: 300,
    height: 300,
    borderRadius: 150,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  spinWheelSegmentContent: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 30,
    transformOrigin: 'left center',
  },
  spinWheelSegmentIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  spinWheelSegmentText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
    width: 100,
  },
  spinWheelSegmentSubtext: {
    color: 'white',
    fontSize: 10,
    marginTop: 3,
  },
  spinWheelCenterCircle: {
    position: 'absolute',
    backgroundColor: 'white',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 5,
    borderColor: '#FF5722',
  },
  spinWheelButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF5722',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinWheelButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  spinWheelPointer: {
    position: 'absolute',
    top: -10,
    width: 30,
    height: 30,
    backgroundColor: 'white',
    borderWidth: 3,
    borderColor: '#FF5722',
    borderRadius: 15,
    zIndex: 9,
    transform: [{ rotate: '45deg' }],
  },

  // Result styles
  spinWheelResultContainer: {
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
  },
  spinWheelResultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#FF5722',
  },
  spinWheelResultPrize: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  spinWheelResultSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  spinWheelClaimButton: {
    backgroundColor: '#FF5722',
    padding: 12,
    borderRadius: 25,
    width: '80%',
    alignItems: 'center',
    marginTop: 10,
  },
  spinWheelClaimButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default App;