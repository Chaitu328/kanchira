import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';

import { AllCategories } from '../../services/home';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import BannerSlider from './banner';
import ProductCard from './Dashboard';
import { ScrollView } from 'react-native-gesture-handler';

const screenWidth = Dimensions.get('window').width;
const itemWidth = screenWidth / 4.5; // Myntra shows 4-5 subcategories visible at once

const CategoryList = () => {
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scrollY] = useState(new Animated.Value(0));
const [prevScrollY, setPrevScrollY] = useState(0);
const [isTabVisible, setIsTabVisible] = useState(true);

const tabTranslateY = scrollY.interpolate({
  inputRange: [0, 100],
  outputRange: [0, -100], // Hide height
  extrapolate: 'clamp',
});


  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await AllCategories({ categoryId: '' });
      if (data?.length) {
        setCategories(data);
        setActiveCategory(data[0]);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  return (
  <Animated.ScrollView
    onScroll={Animated.event(
      [{ nativeEvent: { contentOffset: { y: scrollY } } }],
      {
        useNativeDriver: true,
        listener: (event) => {
          const currentY = event.nativeEvent.contentOffset.y;
          if (currentY > prevScrollY && currentY > 50) {
            setIsTabVisible(false);
          } else if (currentY < prevScrollY) {
            setIsTabVisible(true);
          }
          setPrevScrollY(currentY);
        }
      }
    )}
    scrollEventThrottle={16}
    contentContainerStyle={styles.scrollContent}
  >
    <View style={styles.container}>
      {/* Header line */}
      <View style={styles.headerLine} />

      {/* Category Tabs */}
      {loading ? (
        <SkeletonPlaceholder backgroundColor="#e0e0e0" highlightColor="#f5f5f5">
          <View style={styles.skeletonHeader}>
            {[...Array(5)].map((_, i) => (
              <View key={i} style={styles.skeletonTab} />
            ))}
          </View>
        </SkeletonPlaceholder>
      ) : (
        <Animated.View style={{ transform: [{ translateY: tabTranslateY }] }}>
          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabContainer}
            renderItem={({ item }) => {
              const isActive = activeCategory?.id === item.id;
              return (
                <TouchableOpacity
                  onPress={() => setActiveCategory(item)}
                  style={[styles.tabItem, isActive && styles.activeTabItem]}
                >
                  <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              );
            }}
            keyExtractor={(item) => item.id}
          />
        </Animated.View>
      )}

      {/* Subcategories */}
      {activeCategory && (
        <View style={styles.subcategoryContainer}>
          <FlatList
            data={activeCategory?.subcategories || []}
            numColumns={4}
            columnWrapperStyle={styles.subcategoryRow}
            keyExtractor={(item) => item.id}
            scrollEnabled={false} // Important: prevent nested scroll
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.subcategoryItem}
                onPress={() =>
                  navigation.navigate('CategoryProducts', {
                  })
                }
              >
                <View style={styles.imageContainer}>
                  <Image source={{ uri: item.image }} style={styles.subcategoryImage} />
                </View>
                <Text style={styles.subcategoryText} numberOfLines={2}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

    </View>
  </Animated.ScrollView>
);

};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
tabContainer: {
  flexDirection: 'row',
  paddingHorizontal: 12,
  paddingBottom: 8,
},
scrollContent: {
  paddingBottom: 100, // ensures space to scroll at bottom
},
bannerContainer: {
  marginVertical: 16,
},



tabItem: {
  paddingHorizontal: 12,
  paddingVertical: 4,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: '#681117',
  marginRight: 8,
},

activeTabItem: {
  backgroundColor: '#681117',
  borderColor: '#681117',
},

tabText: {
  fontSize: 12,
  fontWeight: '500',
  color: '#681117',
  textTransform: 'capitalize',
},

activeTabText: {
  color: '#fff',
  fontWeight: '600',
},


baseLine: {
  height: 1,
  backgroundColor: '#ccc',
  width: '100%',
},

 

activeIndicator: {
  backgroundColor: '#007BFF', // or your active color
  borderRadius: 2,
  width: '100%', // or a fixed width like 60
},

  subcategoryContainer: {
    
  },
  subcategoryRow: {
    // justifyContent: 'space-between',
    marginTop:4
  },
  subcategoryItem: {
    width: (screenWidth - 48) / 4,
    alignItems: 'center'
  },
  imageContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#f5f5f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
    overflow: 'hidden'
  },
  subcategoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  subcategoryText: {
    fontSize: 12,
    color: '#681117',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 14,
    paddingHorizontal: 3
  },
  skeletonHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  skeletonTab: {
    width: 80,
    height: 20,
    borderRadius: 4,
    marginRight: 16
  }
});

export default CategoryList;