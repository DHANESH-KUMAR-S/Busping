import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { updateBusLocation, stopTracking } from '../services/firebase';
import {
  requestLocationPermission,
  startLocationTracking,
  getCurrentLocation,
} from '../utils/location';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants';
import DemoControls from '../components/DemoControls';
import OSMMap from '../components/OSMMap';
import FooterNav from '../components/FooterNav';

const DriverScreen = () => {
  const { user, logout, userProfile } = useAuth();
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationSubscription, setLocationSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busNumber, setBusNumber] = useState(null);

  useEffect(() => {
    initializeLocation();
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  // Sync bus number from user profile when it loads/changes
  useEffect(() => {
    if (userProfile?.busNumber) {
      setBusNumber(userProfile.busNumber);
    }
  }, [userProfile?.busNumber]);

  const initializeLocation = async () => {
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert('Permission Required', ERROR_MESSAGES.LOCATION_PERMISSION_DENIED);
        return;
      }

      const location = await getCurrentLocation();
      setCurrentLocation(location);
    } catch (error) {
      Alert.alert('Error', ERROR_MESSAGES.LOCATION_SERVICES_DISABLED);
    }
  };

  const startTracking = async () => {
    if (!busNumber) {
      Alert.alert('Missing Bus Number', 'Please set your Bus Number in your profile first.');
      return;
    }
    if (!currentLocation) {
      Alert.alert('Error', 'Unable to get current location');
      return;
    }

    setLoading(true);
    try {
      const driverId = user?.uid;
      if (!driverId) {
        throw new Error('No logged in user');
      }
      // Send an immediate location update so students see you right away
      updateBusLocation(driverId, currentLocation, busNumber);

      // Start location tracking
      const subscription = await startLocationTracking((location) => {
        setCurrentLocation(location);
        // Update Firebase with new location and bus number
        if (driverId) {
          updateBusLocation(driverId, location, busNumber);
        }
      });

      setLocationSubscription(subscription);
      setIsTracking(true);
      Alert.alert('Success', SUCCESS_MESSAGES.TRACKING_STARTED);
    } catch (error) {
      Alert.alert('Error', 'Failed to start tracking');
      console.error('Tracking error:', error);
    } finally {
      setLoading(false);
    }
  };

  const stopTrackingBus = async () => {
    setLoading(true);
    try {
      if (locationSubscription) {
        locationSubscription.remove();
        setLocationSubscription(null);
      }
      const driverId = user?.uid;
      if (driverId) {
        await stopTracking(driverId);
      }
      setIsTracking(false);
      Alert.alert('Success', SUCCESS_MESSAGES.TRACKING_STOPPED);
    } catch (error) {
      Alert.alert('Error', 'Failed to stop tracking');
      console.error('Stop tracking error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? This will stop tracking if active.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            if (isTracking) {
              await stopTrackingBus();
            }
            logout();
          },
        },
      ]
    );
  };

  const region = currentLocation
    ? {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };

  return (
    <View style={styles.container}>
      <OSMMap
        style={styles.map}
        region={region}
        userLocation={currentLocation}
        busLocation={null}
        pinLocation={null}
        autoFit={false}
      />

      <View style={styles.overlay}>
        <View style={styles.statusContainer}>
          <Text style={styles.statusTitle}>
            {isTracking ? '🟢 Tracking Active' : '🔴 Tracking Inactive'}
          </Text>
          <Text style={styles.statusText}>
            {isTracking
              ? 'Your location is being shared with students'
              : 'Tap "Start Tracking" to begin sharing your location'}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              isTracking ? styles.stopButton : styles.startButton,
              loading && styles.buttonDisabled,
            ]}
            onPress={isTracking ? stopTrackingBus : startTracking}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>
                {isTracking ? 'Stop Tracking' : 'Start Tracking'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Demo Controls for testing */}
        {user && (
          <DemoControls driverId={user.uid} busNumber={busNumber} />
        )}
      </View>
      <FooterNav />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100, // keep clear of FooterNav
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 6,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 10,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#f44336',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: '#666',
    fontSize: 14,
  },
});

export default DriverScreen;