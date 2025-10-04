import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { saveUserProfile } from '../services/firebase';
import { USER_ROLES } from '../constants';
 

const ProfileSetupScreen = ({ navigation }) => {
  const { user, userRole, setRole, completeProfile, logout } = useAuth();

  const [loading, setLoading] = useState(false);
  
  // Common fields
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [busNumber, setBusNumber] = useState('');
  
  // Student specific field
  const [busStopName, setBusStopName] = useState('');
  
  // Driver specific field
  const [driverLicense, setDriverLicense] = useState('');

  const handleProfileSetup = async () => {
    if (!name || !phoneNumber || !busNumber) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (userRole === USER_ROLES.STUDENT && !busStopName) {
      Alert.alert('Error', 'Please enter your bus stop name');
      return;
    }

    if (userRole === USER_ROLES.DRIVER && !driverLicense) {
      Alert.alert('Error', 'Please enter your driver license number');
      return;
    }

    setLoading(true);
    try {
      // Persist profile to Firebase
      const profile = {
        name,
        phoneNumber,
        busNumber,
        ...(userRole === USER_ROLES.DRIVER ? { driverLicense } : {}),
        ...(userRole === USER_ROLES.STUDENT ? { busStopName } : {}),
      };

      await saveUserProfile(user.uid, profile);

      // Complete the profile setup
      completeProfile();
      
      Alert.alert('Success', 'Profile created successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create profile. Please try again.');
      console.error('Profile setup error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    return userRole === USER_ROLES.DRIVER ? 'Driver Profile Setup' : 'Student Profile Setup';
  };

  const getSubtitle = () => {
    return userRole === USER_ROLES.DRIVER 
      ? 'Please provide your driver information'
      : 'Please provide your student information';
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>{getTitle()}</Text>
          <Text style={styles.subtitle}>{getSubtitle()}</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Full Name *"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <TextInput
            style={styles.input}
            placeholder="Phone Number *"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />

          <TextInput
            style={styles.input}
            placeholder="Bus Number *"
            value={busNumber}
            onChangeText={setBusNumber}
            autoCapitalize="characters"
          />

          {userRole === USER_ROLES.DRIVER && (
            <>
              <Text style={styles.sectionTitle}>Driver Information</Text>
              <TextInput
                style={styles.input}
                placeholder="Driver License Number *"
                value={driverLicense}
                onChangeText={setDriverLicense}
                autoCapitalize="characters"
              />
            </>
          )}

          {userRole === USER_ROLES.STUDENT && (
            <>
              <Text style={styles.sectionTitle}>Student Information</Text>
              <TextInput
                style={styles.input}
                placeholder="Bus Stop Name *"
                value={busStopName}
                onChangeText={setBusStopName}
                autoCapitalize="words"
              />
            </>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleProfileSetup}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating Profile...' : 'Create Profile'}
            </Text>
          </TouchableOpacity>

          <View style={styles.logoutContainer}>
            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              💡 Your bus number will be used to match you with the correct bus route.
            </Text>
            {userRole === USER_ROLES.STUDENT && (
              <Text style={styles.infoText}>
                📍 You'll be able to track buses with the same bus number.
              </Text>
            )}
            {userRole === USER_ROLES.DRIVER && (
              <Text style={styles.infoText}>
                🚌 Students will track your location using this bus number.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutContainer: {
    marginTop: 10,
    padding: 10,
    alignItems: 'center',
  },
  logoutButton: {
    padding: 10,
  },
  logoutText: {
    color: '#666',
    fontSize: 14,
  },
  infoContainer: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#1976d2',
    marginBottom: 5,
    lineHeight: 20,
  },
});

export default ProfileSetupScreen;