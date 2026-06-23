import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Modal,
  Dimensions,
  FlatList,
  Image,
  TextInput,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';

import { AddCart, AllSubSubCategories, SubSubCategoryByProducts } from '../../services/home';
import { useDispatch, useSelector } from 'react-redux';
import LoaderModal from '../info/loading';
import { setCart } from '../../redux/slices/cart';
import AsyncStorage from '@react-native-async-storage/async-storage';
const { width, height } = Dimensions.get('window');

const CategoryProducts = ({navigation}) => {
  const dispatch=useDispatch()
    const cartCount = useSelector(state => (state.cart.items));
    const wishCount = useSelector(state => (state?.wish?.items));
    
console.log(cartCount,"kfmoim")
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedSort, setSelectedSort] = useState('What\'s new');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState('Country of Origin');
  const [selectedFilters, setSelectedFilters] = useState({});
 const navigate = useNavigation();
   const [added, setAdded] = useState(false);
 
        const route = useRoute();
  const { subcategoryId, subcategoryName } = route.params;
  console.log(subcategoryId,subcategoryName)
    const [subsubcategories, setSubSubCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [products,setProducts]=useState([])
    const [searchMode, setSearchMode] = useState(false);
const [searchQuery, setSearchQuery] = useState('');

 const sortOptions = [
  { label: "Price - high to low", value: "price_desc" },
  { label: "Price - low to high", value: "price_asc" },
  { label: "Popularity", value: "popularity" },
  { label: "Discount", value: "discount" },
  { label: "Customer Rating", value: "rating" },
];

  const filterCategories = [
    'Quick Filters',
    'Size',
    'Color',
    'Brand',
    'Categories',
    'Country of Origin',
    'More Filters',
    'Price Range',
    'Discount',
    'Delivery Time'
  ];

  const filterOptions = {
    'Country of Origin': [
      { name: 'All Countries', count: 51560 },
      { name: 'Bangladesh', count: 19 },
      { name: 'Cambodia', count: 2 },
      { name: 'China', count: 11 },
      { name: 'Egypt', count: 1 },
      { name: 'Hong Kong', count: 1 },
      { name: 'INDIA', count: 1 },
      { name: 'India', count: 45407 },
      { name: 'Indonesia', count: 2 },
      { name: 'Philippines', count: 1 },
      { name: 'Sri Lanka', count: 2 },
      { name: 'Turkey', count: 4 },
      { name: 'Vietnam', count: 4 }
    ],
    'Size': [
      { name: 'XS', count: 1200 },
      { name: 'S', count: 15000 },
      { name: 'M', count: 20000 },
      { name: 'L', count: 18000 },
      { name: 'XL', count: 12000 },
      { name: 'XXL', count: 8000 }
    ],
    'Color': [
      { name: 'Black', count: 8500 },
      { name: 'White', count: 7200 },
      { name: 'Blue', count: 6800 },
      { name: 'Red', count: 4500 },
      { name: 'Green', count: 3200 },
      { name: 'Yellow', count: 2100 }
    ],
    'Brand': [
      { name: 'Nike', count: 2500 },
      { name: 'Adidas', count: 2200 },
      { name: 'Puma', count: 1800 },
      { name: 'Reebok', count: 1500 },
      { name: 'Under Armour', count: 1200 }
    ]
  };

  const fetchCategories = async () => {
            setLoading(true);
            try {
              const data = await AllSubSubCategories({ subCategoryId: subcategoryId });
              console.log(data.sub_SubCategories)
              if (data) {
                setSubSubCategories(data.sub_SubCategories);
                fetchProducts((data.sub_SubCategories)[0])
                // setActiveCategory(data[0]);
              }
            } catch (err) {
              console.error('Error fetching categories:', err);
            } finally {
              setLoading(false);
            }
          };
          const fetchProducts = async (id) => {
            setLoading(true);
            try {
              const data = await SubSubCategoryByProducts({ subsubcategoryId: id });
              console.log(data,"products")
              if (data) {
                setProducts(data.products);
                setFilteredData(data.products)
                // setActiveCategory(data[0]);
              }
            } catch (err) {
              console.error('Error fetching categories:', err);
            } finally {
              setLoading(false);
            }
          };
        
          useEffect(() => { fetchCategories(); }, []);
 const handleSortSelect = (option) => {
  console.log(option,"noojjiojoijoj")
  setSelectedSort(option.value);
  setSortModalVisible(false);
  const sorted = sortProducts(products, option.value);
  setProducts(sorted);
};

  const sortProducts = (products, sortType) => {
    console.log(products,sortType,"jjjjj")
  let sortedProducts = [...products]; // copy so we don’t mutate original
  switch (sortType) {
    case "price_desc":
      sortedProducts.sort(
        (a, b) => Number(b.variant?.sizes?.[0]?.price || 0) - Number(a.variant?.sizes?.[0]?.price || 0)
      );
      break;

    case "price_asc":
      sortedProducts.sort(
        (a, b) => Number(a.variant?.sizes?.[0]?.price || 0) - Number(b.variant?.sizes?.[0]?.price || 0)
      );
      break;

    case "discount":
      sortedProducts.sort(
        (a, b) => Number(b.discountPercentage || 0) - Number(a.discountPercentage || 0)
      );
      break;

    case "rating":
      sortedProducts.sort(
        (a, b) => Number(b.variant?.rating || 0) - Number(a.variant?.rating || 0)
      );
      break;

    case "popularity":
      // if you have popularity count (e.g., views or purchases), sort by that
      sortedProducts.sort(
        (a, b) => Number(b.popularity || 0) - Number(a.popularity || 0)
      );
      break;

    default:
      break;
  }

  return sortedProducts;
};


  const handleFilterSelect = (category, option) => {
    const key = `${category}_${option.name}`;
    setSelectedFilters(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const clearAllFilters = () => {
    setSelectedFilters({});
  };
//   const handleSearchToggle = () => {
//   setSearchMode(!searchMode);
//   setSearchQuery('');
//   setFilteredData([]);
// };

const handleSearch = (text) => {
  setSearchQuery(text);

  // Example: Dummy data filtering
  const filtered = products.filter((item) =>
    item.name.toLowerCase().includes(text.toLowerCase())
  );
  setFilteredData(filtered);
};


  const applyFilters = () => {
    setFilterModalVisible(false);
    // Apply filter logic here
  };
  const addWishlist=async()=>{
            setLoading(true);
            try {
              const data = await AllSubSubCategories({ subCategoryId: subcategoryId });
              console.log(data.sub_SubCategories)
              if (data) {
                setSubSubCategories(data.sub_SubCategories);
                fetchProducts((data.sub_SubCategories)[0])
                // setActiveCategory(data[0]);
              }
            } catch (err) {
              console.error('Error fetching categories:', err);
            } finally {
              setLoading(false);
            }
          
  }
  const handleAddToBag = async (item) => {
  setAdded(true);
  try {
    const userId = await AsyncStorage.getItem("userId");

    const firstVariant = item.variants && item.variants.length > 0 ? item.variants[0] : null;

    // Use selectedSizeIndex or fallback to index 0
    const selectedSize = firstVariant?.sizes?.[0] || firstVariant?.sizes?.[0];

    const cartItem = {
      productId: item._id,
      name: item?.name || "",
      image: item?.image || "",
      variant: {
        variantId: firstVariant?._id || "",
        color: firstVariant?.color || "",
        size: selectedSize?.size || "", // use selected size
        material: item?.material || "",
        price:
          selectedSize?.price?.toString() ||
          firstVariant?.price?.toString() ||
          "",
        storage: "",
        fabric: item?.fabric || "",
        discountPercentage: item?.discountPercentage?.toString() || "0",
        rating: firstVariant?.rating?.toString() || "0",
      },
      quantity: 1,
    };

    if (!userId) {
  // 🟡 User not logged in → store locally
  const existingCart = await AsyncStorage.getItem("localCart");
  let updatedCart = [];

  if (existingCart) {
    const parsed = JSON.parse(existingCart);
    updatedCart = parsed.items || [];
  }

  // Check if product with same productId + variantId already exists
  const existingIndex = updatedCart.findIndex(
    (item) =>
      item.productId === cartItem.productId &&
      item.variant?.variantId === cartItem.variant?.variantId
  );

  if (existingIndex !== -1) {
    // ✅ Product already exists → update quantity
    updatedCart[existingIndex].quantity += cartItem.quantity || 1;
  } else {
    // ✅ New product → push to cart
    updatedCart.push({ ...cartItem, quantity: cartItem.quantity || 1 });
  }

  await AsyncStorage.setItem("localCart", JSON.stringify({ items: updatedCart }));
  dispatch(setCart(updatedCart));
  console.log("Stored locally (user not logged in):", updatedCart);
  setAdded(false);
  return;
}

    // 🟢 User logged in → send to backend
    const payload = {
      userId,
      items: [cartItem],
    };

    const response = await AddCart(payload);
    console.log("Item added to backend cart:", response);

    if (response?.cart?.items) {
      dispatch(setCart(response.cart.items)); // ✅ just the items
    }

    setAdded(false);

  } catch (error) {
    console.error("Error adding item to bag:", error);
    setAdded(false);
  }
};
const [filteredData, setFilteredData] = useState([]);

  const renderFilterOption = ({ item }) => {
    const key = `${selectedFilterCategory}_${item.name}`;
    const isSelected = selectedFilters[key];

    return (
      <TouchableOpacity
        style={styles.filterOption}
        onPress={() => handleFilterSelect(selectedFilterCategory, item)}
      >
        <View style={styles.filterOptionLeft}>
          <View style={[styles.checkbox, isSelected && styles.checkedBox]}>
            {isSelected && <MaterialIcons name="check" size={14} color="#fff" />}
          </View>
          <Text style={styles.filterOptionText}>{item.name}</Text>
        </View>
        <Text style={styles.filterOptionCount}>{item.count}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={()=>navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333"  />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
                  {!searchMode?
<>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>K</Text>
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>{subcategoryName.toUpperCase()}</Text>
            <Text style={styles.itemCount}>{products?.length || 0} Items</Text>
          </View>
          </>
        :
        <View style={styles.searchInputContainer}>
    <TextInput
      style={styles.searchInput}
      placeholder="Search items..."
      value={searchQuery}
    onChangeText={handleSearch}
      autoFocus
    />
    </View>
}
    </View>


        <View style={styles.headerIcons}>
                            {!searchMode?

    <TouchableOpacity onPress={() =>setSearchMode(true) }>
            <Ionicons name="search" size={22} color="#681117" />
          </TouchableOpacity>
          :
          <TouchableOpacity onPress={() =>setSearchMode(false) }>
            <Ionicons name="close" size={22} color="#681117" />
          </TouchableOpacity>}


          <TouchableOpacity style={styles.headerIcon} onPress={() => navigate.navigate("Wishlist")}>
            <Ionicons name="heart-outline" size={22} color="#681117" />
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
          <TouchableOpacity style={styles.headerIcon} onPress={() => navigate.navigate('Cart')} >
            <Ionicons name="bag-outline" size={22} color="#681117" />
                    {cartCount?.length > 0 && (
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
                      <Text style={{ color: '#fff', fontSize: 10 }}>{cartCount.length}</Text>
                    </View>
                  )}
          </TouchableOpacity>
        </View>
      </View>



      {/* Location */}
      {/* <View style={styles.locationContainer}>
        <Ionicons name="location-outline" size={16} color="#333" />
        <Text style={styles.locationText}>500001</Text>
        <Ionicons name="chevron-down" size={16} color="#333" />
      </View> */}

      {/* Category Tabs
      <View style={styles.categoryTabs}>
        <TouchableOpacity style={styles.activeTab}>
          <Text style={styles.activeTabText}>Shopping</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Trends</Text>
        </TouchableOpacity>
      </View> */}

      {/* Filter Pills */}
      {/* <View style={styles.filterPills}>
        <TouchableOpacity style={styles.pill}>
          <MaterialIcons name="local-offer" size={16} color="#666" />
          <Text style={styles.pillText}>Crazy deal</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.pill}>
          <MaterialIcons name="trending-down" size={16} color="#666" />
          <Text style={styles.pillText}>Price Crash</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.pill}>
          <MaterialIcons name="local-shipping" size={16} color="#666" />
          <Text style={styles.pillText}>Express Delivery</Text>
        </TouchableOpacity>
      </View> */}

   {/* Placeholder for products */}
       <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
               {/* Category Circles */}
               <View style={styles.categoryContainer}>
                 <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                   {subsubcategories?.map((item,index)=>(
                  <TouchableOpacity
         key={item._id}
         onPress={() => fetchProducts(item._id)}
       >
         <View style={styles.categoryItem}>
           <View >
             <Image
               source={{ uri: item.image }}
 style={styles.categoryCircle }             />
           </View>
           {/* Optional Label */}
           <Text style={styles.categoryLabel}>{item.name}</Text>
         </View>
       </TouchableOpacity>
       
                   ))
       }
                   
                 
                 </ScrollView>
               </View>
       <LoaderModal visible={loading} />

               {/* Promotional Banner
               <View style={styles.promoBanner}>
                 <View style={styles.promoContent}>
                   <Text style={styles.promoText}>Sarees That Speak Elegance</Text>
                   <TouchableOpacity style={styles.exploreButton}>
                     <Text style={styles.exploreText}>Explore</Text>
                     <View style={styles.exploreIcon}>
                       <Ionicons name="chevron-forward" size={12} color="#fff" />
                     </View>
                   </TouchableOpacity>
                 </View>
               </View> */}
       
               {/* Product Grid */}
              {Array.from({ length: Math.ceil(filteredData?.length / 2) }, (_, rowIndex) => {
  const rowItems = filteredData.slice(rowIndex * 2, rowIndex * 2 + 2);
  return (
    <View key={rowIndex} style={styles.productRow}>
      {rowItems.map((item, index) => {
        console.log(item,"km")
const sizeInfo = item?.variants[0]?.sizes[0];
console.log(sizeInfo,"size")

// get price from size, discount from product
const originalPrice = Number(sizeInfo?.price) || 0;
const discountPercentage = Number(sizeInfo?.discountPercentage) || 0;
// calculate discount & sale price
const discountAmount = Math.round((originalPrice * discountPercentage) / 100);

        return(
        <TouchableOpacity
          key={item._id || index}
          style={styles.productCard}
          onPress={() =>
            navigate.navigate('ProductDetails', {
              product: item,
            })
          }
        >
          <View style={styles.productImageContainer}>
            <View style={styles.productImage}>
              <Image
                source={{ uri: item.image }}
                style={{ width: 200, height: 200 }}
              />
            </View>
            {/* <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>2.2</Text>
              <AntDesign name="star" size={10} color="#ffa726" />
              <Text style={styles.reviewCount}>62</Text>
            </View> */}
          </View>

          <View style={styles.productInfo}>
            <Text style={styles.brandName}>{item.name}</Text>

            {/* <View style={styles.saleBadge}>
              <Text style={styles.saleBadgeText}>Sale Price Live</Text>
            </View> */}
            <View style={styles.priceContainer}>
              <Text style={styles.originalPrice}>₹{sizeInfo.price}</Text>
              <Text style={styles.salePrice}>₹{sizeInfo.finalPrice}</Text>
              <Text style={styles.discount}>Rs.{discountAmount} OFF</Text>
            </View>

       {  /*   <View style={styles.bestPriceContainer}>
              <Text style={styles.bestPriceLabel}>Best Price</Text>
            </View>
            */}
           <View style={styles.bestPriceContainer}>
  <TouchableOpacity 
    style={styles.cartButton} 
    onPress={()=>handleAddToBag(item)}
  >
    <Text style={styles.cartButtonText}> Move to Bag</Text>
  </TouchableOpacity>
</View>


          </View>
        </TouchableOpacity>
      )})}
    </View>
  );
})}

             </ScrollView>

      {/* Bottom Filter Bar */}
      <View style={styles.bottomFilterBar}>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setSortModalVisible(true)}
        >
          <MaterialIcons name="sort" size={20} color="#681117" />
          <Text style={styles.filterButtonText}>SORT</Text>
        </TouchableOpacity>
        
        <View style={styles.filterDivider} />
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <MaterialIcons name="filter-list" size={20} color="#681117" />
          <Text style={styles.filterButtonText}>FILTER</Text>
          <View style={styles.filterDot} />
        </TouchableOpacity>
      </View>

      {/* Sort Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={sortModalVisible}
        onRequestClose={() => setSortModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={() => setSortModalVisible(false)}
          />
          
          <View style={styles.sortModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>SORT BY</Text>
            </View>
            
            <ScrollView style={styles.sortOptions} showsVerticalScrollIndicator={false}>
              {sortOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.sortOption,
                    selectedSort === option && styles.selectedSortOption
                  ]}
                  onPress={() => handleSortSelect(option)}
                >
                  <Text style={[
                    styles.sortOptionText,
                    selectedSort === option && styles.selectedSortOptionText
                  ]}>
                    {option.label}
                  </Text>
                  {selectedSort === option && (
                    <MaterialIcons name="check" size={20} color="#ff3f6c" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={() => setFilterModalVisible(false)}
          />
          
          <View style={styles.filterModal}>
            {/* Filter Header */}
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Filters</Text>
              <TouchableOpacity onPress={clearAllFilters}>
                <Text style={styles.clearAllText}>CLEAR ALL</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.filterContent}>
              {/* Filter Categories */}
              <View style={styles.filterCategories}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {filterCategories.map((category, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.filterCategory,
                        selectedFilterCategory === category && styles.selectedFilterCategory
                      ]}
                      onPress={() => setSelectedFilterCategory(category)}
                    >
                      <Text style={[
                        styles.filterCategoryText,
                        selectedFilterCategory === category && styles.selectedFilterCategoryText
                      ]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              {/* Filter Options */}
              <View style={styles.filterOptionsContainer}>
                {filterOptions[selectedFilterCategory] ? (
                  <FlatList
                    data={filterOptions[selectedFilterCategory]}
                    renderItem={renderFilterOption}
                    keyExtractor={(item, index) => `${selectedFilterCategory}_${index}`}
                    showsVerticalScrollIndicator={false}
                  />
                ) : (
                  <View style={styles.noOptionsContainer}>
                    <Text style={styles.noOptionsText}>No options available</Text>
                  </View>
                )}
              </View>
            </View>
            
            {/* Filter Actions */}
            <View style={styles.filterActions}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setFilterModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>CLOSE</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.applyButton}
                onPress={applyFilters}
              >
                <Text style={styles.applyButtonText}>APPLY</Text>
              </TouchableOpacity>
            </View>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    marginRight: 12,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#681117',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logo: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  titleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itemCount: {
    fontSize: 12,
    color: '#666',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  headerIcon: {
    padding: 2,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
  },
  locationText: {
    marginLeft: 6,
    marginRight: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#681117',
  },
  categoryTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 24,
  },
  activeTab: {
    backgroundColor: '#2c3e50',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  activeTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  tab: {
    paddingVertical: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#681117',
  },
  filterPills: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pillText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  content: {
    flex: 1,
  },
  categoryContainer: {
    paddingVertical: 16,
  },
  categoryScroll: {
    paddingHorizontal: 16,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
  },
  categoryCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryLabel: {
    fontSize: 12,
    color: '#681117',
    fontWeight: '500',
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#f8f9fa',
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  feature: {
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  featureSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  productsPlaceholder: {
    padding: 40,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  productGrid: {
  padding: 10,
},
productRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 10,
},
productCard: {
  width: '49%', // Two cards per row
  backgroundColor: '#fff',
  borderRadius: 8,
  padding: 10,
  elevation: 1,
},

  productImageContainer: {
    position: 'relative',
    height: 200,
 borderRadius:8,
    overflow: 'hidden',
  },
  productImage: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImagePlaceholder: {
    fontSize: 60,
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 2,
  },
  reviewCount: {
    fontSize: 10,
    color: '#666',
    marginLeft: 4,
  },
  myntraUniqueBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#6c5ce7',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  myntraUniqueText: {
    fontSize: 8,
    color: '#fff',
    fontWeight: 'bold',
  },
  mChoiceBadge: {
    position: 'absolute',
    top: 32,
    left: 8,
    backgroundColor: '#00b894',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  mChoiceText: {
    fontSize: 8,
    color: '#fff',
    fontWeight: 'bold',
  },
  adBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  adBadgeText: {
    fontSize: 8,
    color: '#666',
    fontWeight: 'bold',
  },
  productInfo: {
    padding: 12,
  },
  brandName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  saleBadge: {
    backgroundColor: '#681117',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  saleBadgeText: {
    fontSize: 8,
    color: '#fff',
    fontWeight: 'bold',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  originalPrice: {
    fontSize: 10,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 6,
  },
  salePrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 6,
  },
  discount: {
    fontSize: 10,
    color: '#ff9800',
    fontWeight: 'bold',
  },
bestPriceContainer: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  borderRadius: 8
},
bestPriceLabel: {
  fontSize: 18,
  fontWeight: "bold",
  color: "#333"
},
cartButton: {
  backgroundColor: "#681117",
  paddingVertical: 6,
  paddingHorizontal: 14,
  borderRadius: 6
},
cartButtonText: {
  color: "#fff",
  fontWeight: "bold",
  fontSize: 14
}
,
  bestPrice: {
    fontSize: 12,
    color: '#00b894',
    fontWeight: 'bold',
    marginRight: 4,
  },
  couponText: {
    fontSize: 10,
    color: '#666',
  },
  bottomFilterBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  filterButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#681117',
  },
  filterDivider: {
    width: 1,
    backgroundColor: '#eee',
  },
  filterDot: {
    position: 'absolute',
    top: 8,
    right: 40,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#681117',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackground: {
    flex: 1,
  },
  sortModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: height * 0.6,
    paddingBottom: 20,
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#999',
    letterSpacing: 1,
  },
  sortOptions: {
    paddingHorizontal: 20,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  selectedSortOption: {
    backgroundColor: '#fff5f5',
  },
  sortOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  selectedSortOptionText: {
    color: '#681117',
    fontWeight: '600',
  },
  filterModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: height * 0.8,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#681117',
  },
  filterContent: {
    flex: 1,
    flexDirection: 'row',
  },
  filterCategories: {
    width: width * 0.4,
    backgroundColor: '#f8f9fa',
    paddingVertical: 10,
  },
  filterCategory: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedFilterCategory: {
    backgroundColor: '#fff',
    borderRightWidth: 3,
    borderRightColor: '#681117',
  },
  filterCategoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedFilterCategoryText: {
    color: '#333',
    fontWeight: '600',
  },
  filterOptionsContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  filterOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 3,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#681117',
    borderColor: '#681117',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  filterOptionCount: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  noOptionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noOptionsText: {
    fontSize: 16,
    color: '#999',
  },
  filterActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  closeButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#eee',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#681117',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchInputContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#f2f2f2',
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: 8,
  marginLeft: 10,
  marginRight: 10,
},

searchInput: {
  fontSize: 16,
  color: '#333',
  paddingVertical: 4,
},

});

export default CategoryProducts;