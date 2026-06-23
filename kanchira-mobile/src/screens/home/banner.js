import { ScrollView, Dimensions, Image, StyleSheet, View } from 'react-native';
import { useEffect, useRef, useState } from 'react';

const bannerImages = [
  require('../../assets/b1.jpg'),
  require('../../assets/b2.jpg'),
  require('../../assets/b3.jpg'),
];

const BannerSlider = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isForward, setIsForward] = useState(true);
  const scrollRef = useRef();
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (activeIndex + 1) % bannerImages.length;
  
      scrollRef.current?.scrollTo({
        x: nextIndex * screenWidth,
        animated: true,
      });
  
      setActiveIndex(nextIndex);
    }, 3000);
  
    return () => clearInterval(timer);
  }, [activeIndex]);
  

  return (
    <View style={styles.backgroundWrapper}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        ref={scrollRef}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
          setActiveIndex(index);
        }}
        contentContainerStyle={{  }}
      >
        {bannerImages.map((image, index) => (
          <View key={index} style={[styles.imageWrapper, { width: screenWidth  }]}>
            <Image source={image} style={styles.image} resizeMode="cover" />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default BannerSlider;

const styles = StyleSheet.create({
  backgroundWrapper: {
    margin:10
  },
  imageWrapper: {
    overflow: 'hidden',
    height: 160,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
