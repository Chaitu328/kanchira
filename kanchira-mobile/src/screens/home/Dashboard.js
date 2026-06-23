import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  Modal,
  SafeAreaView,
  Dimensions,
  FlatList,
  Animated,
  Easing,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { AllCategories, AllCategoriesWithSubSubCategories, AllSubCategoriesParam } from '../../services/home';
import { fetchCartFromBackend } from '../../redux/slices/cart';
import { useSelector } from 'react-redux';
import LoadCart from '../../services/cartLoad';
import LoadWish from '../../services/wishLoad';
import LoaderSVG from '../../assets/load.svg';

const { width,height } = Dimensions.get('window');
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  G,
  Text as SvgText,
  Path,
} from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FullscreenLoader from '../info/loading';
import LoaderModal from '../info/loading';

const cx = 150;
const cy = 150;

// Convert polar coordinates to cartesian
const size = width * 0.8;
const radius = size / 2;
const segmentCount = 8;


// Create path for each triangle segment

const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

const describeArc = (x, y, radius, startAngle, endAngle) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  const d = [
    'M', x, y,
    'L', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    'Z',
  ].join(' ');

  return d;
};


// Offers with gradient colors
const offers = [
  { id: 1, label: '5%', number: '5', color: ['#fdc43f', '#fcefb4'] },
  { id: 2, label: '10%', number: '10', color: ['#fdc43f', '#fcefb4'] },
  { id: 3, label: '15%', number: '15', color: ['#fdc43f', '#fcefb4'] },
  { id: 4, label: '20%', number: '20', color: ['#fdc43f', '#fcefb4'] },
  { id: 5, label: '25%', number: '25', color: ['#fdc43f', '#fcefb4'] },
  { id: 6, label: '30%', number: '30', color: ['#fdc43f', '#fcefb4'] },
    { id: 7, label: '35%', number: '35', color: ['#fdc43f', '#fcefb4'] },

      { id: 8, label: '40%', number: '40', color: ['#fdc43f', '#fcefb4'] },

];
const AnimatedView = Animated.createAnimatedComponent(View);
// Wheel component using SVG
const GradientWheel = ({ spinTransform }) => {
  return (
    <AnimatedView style={{ transform: [{ rotate: spinTransform }] }}>

        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: [{ rotate: spinTransform }] }}>
        <Defs>
          {offers.map((segment, index) => (
            <LinearGradient key={index} id={`grad${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={segment.color[0]} />
              <Stop offset="100%" stopColor={segment.color[1]} />
            </LinearGradient>
          ))}
        </Defs>

        {offers.map((segment, index) => {
          const startAngle = index * (360 / segmentCount);
          const endAngle = startAngle + (360 / segmentCount);
          const path = describeArc(radius, radius, radius, startAngle, endAngle);

          // Text angle and position
          const midAngle = (startAngle + endAngle) / 2;
          const textRadius = radius * 0.65;
          const { x, y } = polarToCartesian(radius, radius, textRadius, midAngle);

          return (
            <G key={index}>
              <Path d={path} fill={`url(#grad${index})`} />
              <SvgText
                x={x}
                y={y}
                fill="#681117"
                fontSize="16"
                fontWeight="bold"
                textAnchor="middle"
                alignmentBaseline="middle"
                transform={`rotate(${midAngle}, ${x}, ${y})`}
              >
                {segment.label}
              </SvgText>
            </G>
          );
        })}
      </Svg>
      </AnimatedView>

  );
};


const Dashboard = () => {
    const [firstTime, setFirstTime] = useState(true);
  const [showSpinWheel, setShowSpinWheel] = useState(false);

  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
const wishCount = useSelector(state => (state?.wish?.items));
console.log(wishCount,"count")
  const [activeCategory, setActiveCategory] = useState([]);
  const [loading, setLoading] = useState(true);
  const categoriescategories = [
    {
      title: 'Jeans',
      image:  'https://th.bing.com/th/id/OIP.Ge6jqSIlvgRds9iarmzJCAHaEK?r=0&rs=1&pid=ImgDetMain',
    },
    {
      title: 'Sports Shoes',
      image: 'https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/f479e2139283039.622cd75b367f7.jpg',
    },
    {
      title: 'Trousers',
      image: 'https://assets.indiadesire.com/images/myntra%20right%20to%20fashion%20sale%20jan%202023.jpg',
    },
    {
      title: 'Flip Flops',
      image: 'https://mir-s3-cdn-cf.behance.net/project_modules/max_1200_webp/0bd04a181510145.651d49911a794.jpg',
    },
    
   

  ];
    const [subsubCategories, setSubSubCategories] = useState(categoriescategories);

  const banners = [
    { id: '1', image: 'https://th.bing.com/th/id/OIP.Ge6jqSIlvgRds9iarmzJCAHaEK?r=0&rs=1&pid=ImgDetMain' },
    { id: '2', image: 'https://mir-s3-cdn-cf.behance.net/project_modules/max_1200_webp/0bd04a181510145.651d49911a794.jpg' },
    { id: '3', image: 'https://th.bing.com/th/id/OIP.Ge6jqSIlvgRds9iarmzJCAHaEK?r=0&rs=1&pid=ImgDetMain' },
    { id: '4', image: 'https://th.bing.com/th/id/OIP.-l5u-_qT6Po4FfSpnpkSlAHaHa?r=0&rs=1&pid=ImgDetMain' },
  ];
 const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  // Define your offers with percentages (must add up to 100)
const spinValue = useRef(new Animated.Value(0)).current;

const spinTransform = spinValue.interpolate({
  inputRange: [0, 1],
  outputRange: ['0deg', '360deg'], // This can scale to multiple turns
});

const spinWheel = () => {
  if (spinning) return;

  setSpinning(true);
  setResult(null);

  const selectedIndex = Math.floor(Math.random() * offers.length);
  const selectedOffer = offers[selectedIndex];

  const segmentAngle = 360 / offers.length;

  const rotations = 5; // full spins
  const endAngle =
    rotations * 360 +
    (360 - (selectedIndex * segmentAngle + segmentAngle / 2));

  spinValue.setValue(0);

  Animated.timing(spinValue, {
    toValue: endAngle,
    duration: 5000,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
  }).start(() => {
    setSpinning(false);
    setResult(selectedOffer);
  });
};

const claimNow = async () => {
  if (!result) return;
  try {
    const wonPercentage = parseFloat(result.number || result.label) || 0;
    const spinDiscountObj = {
      value: wonPercentage,
      label: `${wonPercentage}% OFF`,
      type: "percentage"
    };
    await AsyncStorage.setItem("checkout_spin_discount", JSON.stringify(spinDiscountObj));
    await AsyncStorage.setItem("discountSpinTime", Date.now().toString());
    console.log("Spin discount claimed successfully:", spinDiscountObj);
    setShowSpinWheel(false);
  } catch (error) {
    console.error("Error claiming spin discount:", error);
  }
};

console.log(result)


  // Calculate wheel segments based on percentages
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


  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await AllCategories({ categoryId: '' });
      if (data?.length) {
        setCategories(data);
        setActiveCategory({ _id: "all", name: "All" }); // Use consistent structure
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };
  const fetchSub=(categoryId)=>{
    fetchSubCategories(categoryId)
    fetchSubSubCategories(categoryId)
  }
  const fetchSubCategories = async (categoryId) => {
    setLoading(true);
    try {
      const data = await AllSubCategoriesParam({ categoryId: categoryId ? categoryId : "" });
      if (data) {
        setSubCategories(data.subCategory);
        // setActiveCategory(data[0]);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };
    const fetchSubSubCategories = async (categoryId) => {
    setLoading(true);
    try {
      const data = await AllCategoriesWithSubSubCategories({ categoryId: categoryId ? categoryId : "" });
      if (data) {
        setSubSubCategories(data);
        // setActiveCategory(data[0]);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); fetchSubCategories();fetchSubSubCategories() }, []);

  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [pincode, setPincode] = useState('534145');
  const [inputPincode, setInputPincode] = useState('534145');
const [visible,setVisible]=useState(true)
const [visibled,setVisibled]=useState(true)

  const openLocationModal = () => {
    setLocationModalVisible(true);
    setInputPincode(pincode);
  };
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleScroll = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };


  const closeLocationModal = () => {
    setLocationModalVisible(false);
  };

  const handleNumberPress = (number) => {
    if (inputPincode.length < 6) {
      setInputPincode(inputPincode + number);
    }
  };

  const handleBackspace = () => {
    setInputPincode(inputPincode.slice(0, -1));
  };

  const handleCheckPincode = () => {
    setPincode(inputPincode);
    setLocationModalVisible(false);
  };





  const NumberPad = () => {
    const numbers = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      [',', '0', '.']
    ];




    return (
      <View style={styles.numberPad}>
        {numbers.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.numberRow}>
            {row.map((num, numIndex) => (
              <TouchableOpacity
                key={numIndex}
                style={styles.numberButton}
                onPress={() => {
                  if (num === ',' || num === '.') return;
                  handleNumberPress(num);
                }}
              >
                <Text style={styles.numberText}>{num}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Action buttons row */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>—</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>⌫</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleBackspace}
          >
            <Ionicons name="backspace-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Bottom row */}
        <View style={styles.bottomRow}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chevron-down" size={24} color="#333" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCheckPincode}
          >
            <Ionicons name="checkmark" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  const claimNow= async()=>{
  await AsyncStorage.setItem("number", String(result.number)); // Store safely
    setVisible(false)
    console.log(result.number)
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
       <LoadCart />
      <LoadWish/> 
      
      {/* Search Bar and Icons */}
    

      <View style={styles.searchSection}>
      

<View style={styles.searchBar}>
  <TouchableOpacity
          style={styles.deliverySection}
          onPress={openLocationModal}
        >
          <Ionicons name="location-outline" size={18} color="#681117" />
          <Text style={styles.deliveryText}>Deliver to {pincode}</Text>
          <Ionicons name="chevron-down" size={14} color="#333" />
        </TouchableOpacity>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton} >
            <Ionicons name="notifications-outline" size={24} color="#681117" />
          </TouchableOpacity>
           <TouchableOpacity style={styles.iconButton} onPress={()=>navigation.navigate("Wishlist")}>

            <Ionicons name="heart-outline" size={24} color="#681117" />
                  {wishCount?.length > 0 && (
                    <View style={{
                      position: 'absolute',
                      top: -4,
                      right: -8,
                      backgroundColor: '#681117',
                      borderRadius: 10,
                      width: 18,
                      height: 18,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      <Text style={{ color: '#fff', fontSize: 10 }}>{wishCount.length}</Text>
                    </View>
                  )}
          </TouchableOpacity>
          
        </View>
      </View>
      <View style={styles.categoryTabs}>
        {/* Static "All" Tab */}

        <TouchableOpacity
          key={"All"}
          style={[styles.tab, activeCategory?.name === "All" && styles.activeTab]}
          onPress={() => {
            setActiveCategory({ _id: "all", name: "All" }); // Use consistent structure
            fetchSub(""); // Send empty string or "All" depending on API
          }}

        >
          <Text style={[styles.tabText, activeCategory?.name === "All" && styles.activeTabText]}>
            All
          </Text>
        </TouchableOpacity>

        {/* Dynamic Tabs */}
        {categories.map((category, index) => {
          const isActive = activeCategory?._id === category._id;
          return (
            <TouchableOpacity
              key={category._id}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => {
                setActiveCategory(category); // Update state
                fetchSub(category._id); // Pass categoryName to API
              }}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

       


      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Category Cards */}

        <View style={styles.categoryCards}>
          {subCategories?.length > 0 && (
            subCategories?.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.categoryCard}
                onPress={() =>
                  navigation.navigate('CategoryProducts', {
                    subcategoryId: item._id,
                    subcategoryName: item.name,
                  })
                }
              >
                <View style={styles.categoryImage}>
                  <Image
                    source={{ uri: item.image }}
                    style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                  />
                </View>
                <Text style={styles.categoryLabel}>{item.name}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>


        {/* Discount Banner */}

<LoaderModal visible={loading} />



        {/* Main Banner */}
        <View style={{ margin: 10 }}>
          <FlatList
            ref={flatListRef}
            data={banners}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            onScroll={handleScroll}
            renderItem={({ item }) => (
              <View style={styles.bannerContainer}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.bannerImage}
                />
              </View>
            )}
          />

          {/* Pagination Dots */}
          <View style={styles.pagination}>
            {banners.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, activeIndex === index && styles.activeDot]}
              />
            ))}
          </View>
        </View>


        <View style={styles.gridContainer}>
          {subsubCategories.map((item, index) => (
            <TouchableOpacity style={styles.gridItem} key={index}>
              <Image
                source={{ uri: item.image }}
                style={styles.productIcon}
              />

              {/* <Text style={styles.gridText}>{item.title}</Text> */}
            </TouchableOpacity>
          ))}
        </View>



        <View style={styles.discountBanner}>
          <View style={styles.discountContent}>
            <Text style={styles.flatText}>FLAT </Text>
            <Text style={styles.priceText}>₹300 OFF</Text>
            <Text style={styles.freeShippingText}>+ FREE SHIPPING ON ALL ORDERS</Text>
          </View>
          <View style={styles.couponSection}>
            <View style={styles.couponCode}>
              <Text style={styles.couponLabel}>COUPON CODE</Text>
              <Text style={styles.couponText}>FLAT300</Text>
            </View>
            <Text style={styles.percentageText}>%</Text>
          </View>
          <Text style={styles.termsText}>*On your first order | T&C apply</Text>
        </View>
      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={locationModalVisible}
        onRequestClose={closeLocationModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={closeLocationModal}
          />

          <View style={styles.locationModal}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Delivery Location</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeLocationModal}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Pincode Input */}
            <View style={styles.pincodeSection}>
              <View style={styles.pincodeInputContainer}>
                <TextInput
                  style={styles.pincodeInput}
                  value={inputPincode}
                  onChangeText={setInputPincode}
                  keyboardType="numeric"
                  maxLength={6}
                  editable={false}
                />
                <TouchableOpacity
                  style={styles.checkButton}
                  onPress={handleCheckPincode}
                >
                  <Text style={styles.checkButtonText}>Check Pincode</Text>
                </TouchableOpacity>
              </View>
            </View>

          

            {/* Number Pad */}
            <NumberPad />
          </View>
        </View>
      </Modal>
 <Modal visible={visible} transparent animationType="fade">
        <View style={styles.spinWheelModalContainer}>
          <View style={styles.spinWheelModalContent}>
             <TouchableOpacity style={styles.cancelButton} onPress={()=>setVisible(false)}>
        <Text style={styles.cancelButtonText}>✕</Text>
      </TouchableOpacity>
            <Text style={styles.spinWheelTitle}>Exclusive Offers!</Text>
            <Text style={styles.spinWheelSubtitle}>Spin to win amazing prizes</Text>

            <View style={styles.spinWheelOuterContainer}>
              <Animated.View style={{ transform: [{ rotate: spinTransform }] }}>
                <GradientWheel spinTransform="0deg" />
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
                <Text style={styles.spinWheelResultPrize}>{result.label}</Text>
                           <Text style={styles.spinWheelResultSubtext}>{`${result.label} Applied on Products`}</Text>

                <TouchableOpacity style={styles.spinWheelClaimButton} onPress={claimNow}>
                  <Text style={styles.spinWheelClaimButtonText}>CLAIM NOW</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop:12
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  deliverySection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryText: {
    marginLeft: 6,
    marginRight: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#681117',
  },
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    alignItems: 'center',
  },
  statusBar:{
backgroundColor:"fff"
  }
,

  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    paddingVertical: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  logoContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#681117',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logo: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 2,
  },
  categoryTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    alignItems: 'center',
  },
  activeTab: {
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: '#681117',
    paddingBottom: 4,
  },
  activeTabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#681117',
  },
  tab: {
    marginRight: 24,
    paddingBottom: 4,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  gridIcon: {
    marginLeft: 'auto',
    backgroundColor: '#2c3e50',
    borderRadius: 8,
    padding: 8,
  },
  gridIconContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 16,
    height: 16,
  },
  gridDot: {
    width: 6,
    height: 6,
    backgroundColor: '#fff',
    margin: 1,
    borderRadius: 1,
  },
  content: {
    flex: 1,
  },
  categoryCards: {
    flexDirection: 'row',
    paddingHorizontal: 6,
    marginBottom: 4,
    justifyContent: 'space-between',
  },
  categoryCard: {
    alignItems: 'center',
    width: (width - 16) / 5 - 8,
  },
  categoryImage: {
    width: 50,
    height: 50,
    borderRadius: 35, // makes it circular
    backgroundColor: '#f5f5f5', // light background behind image
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // clip image inside the round
    marginBottom: 8,
  },

  categoryImageText: {
    fontSize: 20,
  },
  categoryLabel: {
    textAlign: 'center',
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  bannerContainer: {
    width: 340,              // Match your screen width or desired size
    height: 180,             // Desired banner height
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 10,         // Space between banners
  },

  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },

  activeDot: {
    backgroundColor: '#681117', // Active color
  }

  ,
  discountBanner: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#ff9800',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  discountContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  flatText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  freeShippingText: {
    fontSize: 10,
    color: '#333',
    flex: 1,
  },
  couponSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  couponCode: {
    backgroundColor: '#d32f2f',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  couponLabel: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  couponText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  percentageText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  termsText: {
    fontSize: 9,
    color: '#666',
  },
  mainBanner: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  bannerImage: {
    width,
    height: 200,
    resizeMode: 'cover',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    margin: 4,
  },
  activeDot: {
    backgroundColor: '#000',
  },
  sponsorsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  sponsor: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  titleSponsor: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#8e24aa',
    paddingVertical: 12,
    borderRadius: 8,
    position: 'relative',
  },
  sponsorLabel: {
    fontSize: 8,
    color: '#666',
    marginBottom: 4,
  },
  titleSponsorLabel: {
    fontSize: 8,
    color: '#fff',
    marginBottom: 4,
  },
  lakmeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  libasText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  poloText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  sponsorIcon: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#333',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sponsorIconText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  bankOffer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  bankOfferText: {
    flex: 1,
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  brandOffers: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 100,
    justifyContent: 'space-between',
  },
  brandOffer: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    position: 'relative',
  },
  superBrandContainer: {
    alignItems: 'center',
  },
  adText: {
    fontSize: 10,
    color: '#666',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 8,
  },
  adTextTop: {
    fontSize: 10,
    color: '#666',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 8,
    alignSelf: 'center',
  },
  superBrandBadge: {
    backgroundColor: '#ffc107',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  superText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  brandText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#333',
  },
  dayText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#333',
  },
  sportsPartner: {
    backgroundColor: '#ff9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  sportsText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  partnerText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  nikeText: {
    fontSize: 24,
    color: '#333',
  },
  endOfSeason: {
    backgroundColor: '#9c27b0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  endText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  reasonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  saleText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  feedContainer: {
    alignItems: 'center',
  },
  feedButton: {
    backgroundColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  feedText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '600',
    fontSize: 12,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navLogo: {
    color: '#ff3f6c',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  navIcon: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '600',
  },
  navText: {
    fontSize: 10,
    color: '#666',
  },
  activeNavText: {
    color: '#ff3f6c',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackground: {
    flex: 1,
  },
  locationModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  pincodeSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  pincodeInputContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  pincodeInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  checkButton: {
    backgroundColor: '#681117',
    paddingHorizontal: 20,
    paddingVertical: 16,
    justifyContent: 'center',
  },
  checkButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  locationOptions: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  locationIconContainer: {
    marginRight: 16,
  },
  locationOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#681117',
    fontWeight: '500',
  },
  numberPad: {
    paddingHorizontal: 20,
  },
  numberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  numberButton: {
    width: (width - 80) / 3,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  numberText: {
    fontSize: 24,
    fontWeight: '500',
    color: '#333',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  actionButton: {
    width: (width - 80) / 3,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  actionText: {
    fontSize: 24,
    fontWeight: '500',
    color: '#333',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    backgroundColor:"#edede9",
    margin:10
  },
  gridItem: {
    width: '25%',
    alignItems: 'center',
    marginVertical: 10,
  },
  productIcon: {
    height: 60,
    width: 60,
    borderRadius: 8,
    marginBottom: 5,
  },
  gridText: { fontSize: 12, fontWeight: "bold" },
    overlay: {
    flex: 1,
    backgroundColor: '#0008',
    justifyContent: 'center',
    alignItems: 'center',
  },

 
  spinWheelModalContainer: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinWheelModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    width: '90%',
  },
  spinWheelTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  spinWheelSubtitle: {
    fontSize: 16,
    marginBottom: 15,
    color: '#666',
  },
  spinWheelOuterContainer: {
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  spinWheelCenterCircle: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  spinWheelButton: {
    backgroundColor: '#681117',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
  },
  spinWheelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  spinWheelPointer: {
    position: 'absolute',
    top: -10,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#681117',
  },
  spinWheelResultContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  spinWheelResultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  spinWheelResultPrize: {
    fontSize: 22,
    color: '#681117',
    marginVertical: 5,
  },
  spinWheelResultSubtext: {
    fontSize: 16,
    color: '#333',
  },
  spinWheelClaimButton: {
    marginTop: 10,
    backgroundColor: '#681117',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  spinWheelClaimButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
  position: 'absolute',
  top: 10,
  right: 10,
  zIndex: 10,
  backgroundColor: '#fff',
  borderRadius: 15,
  padding: 5,
  elevation: 5, // Android shadow
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 3,
},

cancelButtonText: {
  fontSize: 18,
  color: '#000',
},
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },

});


export default Dashboard;