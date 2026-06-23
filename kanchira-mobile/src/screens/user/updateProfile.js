import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUser, updateUser } from '../../services/home';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const UpdateProfileScreen = () => {
      const navigates=useNavigation()
    
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
  });

  const [userId, setUserId] = useState(null);

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  // Fetch userId once
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setUserId(storedUserId);
        }
      } catch (e) {
        console.log("Error fetching userId", e);
      }
    };

    fetchUserId();
  }, []);

  // Fetch user details and populate inputs
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        if (userId) {
          const response = await getUser({ userId });
          const userData = response.user;
          console.log("Fetched user:", userData);

          if (userData) {
            setProfile({
              name: userData.name || '',
              email: userData.email || '',
              phone: userData.phone || '',
              gender: userData.gender || '',
            });
          }
        }
      } catch (err) {
        console.log("❌ Error fetching profile:", err);
      }
    };

    fetchDetails();
  }, [userId]);

  const handleSubmit = async () => {
    const { name, email, phone, gender } = profile;

    if (!name || !email || !phone) {
      Alert.alert('Validation', 'Please fill all required fields.');
      return;
    }

    try {
      const dataToSend = {
        userId,
        name,
        email,
        phone,
        gender,
      };

      const response = await updateUser(dataToSend);
      Alert.alert('✅ Success', 'User details updated successfully!');
      console.log('✅ Update response:', response);
    } catch (error) {
      console.error('❌ API error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
<View style={styles.header}>
    <TouchableOpacity style={styles.backButton} onPress={() => navigates.goBack()}>
      <Ionicons name="arrow-back" size={24} color="#333" />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Update Profile</Text>
  </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          value={profile.name}
          onChangeText={text => handleChange('name', text)}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          keyboardType="email-address"
          value={profile.email}
          onChangeText={text => handleChange('email', text)}
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your phone"
          keyboardType="numeric"
          value={profile.phone}
          onChangeText={text => handleChange('phone', text)}
        />

        <Text style={styles.label}>Gender</Text>
        <TextInput
          style={styles.input}
          placeholder="Male / Female / Other"
          value={profile.gender}
          onChangeText={text => handleChange('gender', text)}
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Update</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 20,
},
backButton: {
  padding: 8,
  marginRight: 10,
},
headerTitle: {
  fontSize: 20,
  fontWeight: '600',
  color: '#111',
},

  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
    color: '#111',
  },
  label: {
    marginTop: 12,
    fontSize: 14,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 5,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  button: {
    marginTop: 30,
    backgroundColor: '#681117',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UpdateProfileScreen;
