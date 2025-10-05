import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getBusLocation, setStudentWaiting } from '../services/firebase';
import {
  requestLocationPermission,
  getCurrentLocation,
  calculateDistance,
  calculateETAFloat,
  formatETA,
  formatDistance,
} from '../utils/location';
import { ERROR_MESSAGES } from '../constants';
import OSMMap from '../components/OSMMap';
import FooterNav from '../components/FooterNav';

const StudentScreen = () => {
  const { user, logout, userProfile } = useAuth();
  const [busLocation, setBusLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [eta, setEta] = useState(null);
  const [distanceKm, setDistanceKm] = useState(null);
  // Route ETA (map-driven) not used in the pre-feature version
  const [loading, setLoading] = useState(true);
  const [selectedStop, setSelectedStop] = useState(null);
  const [pinLocation, setPinLocation] = useState(null);
  const [isWaiting, setIsWaiting] = useState(false);
  const [markPrompted, setMarkPrompted] = useState(false);
  

  // Sample bus stops - in a real app, these would come from a database
  const busStops = [
    { id: 1, name: 'Main Campus', latitude: 37.78825, longitude: -122.4324 },
    { id: 2, name: 'North Campus', latitude: 37.78925, longitude: -122.4334 },
    { id: 3, name: 'South Campus', latitude: 37.78725, longitude: -122.4314 },
  ];

  useEffect(() => {
    initializeApp();
    return () => {
      // Cleanup Firebase listeners if needed
    };
  }, []);

  const toggleWaiting = async () => {
    try {
      const busNumber = userProfile?.busNumber;
      if (!user?.uid || !busNumber || !selectedStop) {
        Alert.alert('Missing info', 'Make sure your profile has a bus number and a saved stop.');
        return;
      }
      const next = !isWaiting;
      setIsWaiting(next);
      await setStudentWaiting(user.uid, busNumber, selectedStop, next);
    } catch (e) {
      setIsWaiting((prev) => !prev); // revert
      Alert.alert('Error', 'Failed to update waiting status.');
    }
  };

  // Initialize student's saved stop from profile
  useEffect(() => {
    const lat = userProfile?.busStopLat;
    const lon = userProfile?.busStopLon;
    const name = userProfile?.busStopName || 'My Stop';
    if (typeof lat === 'number' && typeof lon === 'number') {
      const stop = { id: 'saved', name, latitude: lat, longitude: lon };
      setSelectedStop(stop);
      setPinLocation({ latitude: lat, longitude: lon });
      if (busLocation) calculateETAForSelectedStop(busLocation);
      // After login/return, prompt once to re-mark stop so user can center map
      if (!markPrompted) {
        setMarkPrompted(true);
        Alert.alert(
          'Mark my stop',
          'Do you want to highlight your saved stop on the map?',
          [
            { text: 'No', style: 'cancel' },
            {
              text: 'Mark my stop',
              onPress: () => setPinLocation({ latitude: lat, longitude: lon }),
            },
          ]
        );
      }
    }
  }, [userProfile?.busStopLat, userProfile?.busStopLon, userProfile?.busStopName]);

  const initializeApp = async () => {
    try {
      // Request location permission for ETA calculation
      await requestLocationPermission();
      const location = await getCurrentLocation();
      setUserLocation(location);

      // Start listening for bus location updates
      startBusTracking();
    } catch (error) {
      Alert.alert('Error', ERROR_MESSAGES.LOCATION_SERVICES_DISABLED);
    } finally {
      setLoading(false);
    }
  };

  const startBusTracking = () => {
    // Track by bus number from user profile (fallback to demo)
    const studentBusNumber = userProfile?.busNumber || 'BUS001';
    
    const unsubscribe = getBusLocation(studentBusNumber, (data) => {
      if (data && data.isActive) {
        setBusLocation(data.location);
        calculateETAForSelectedStop(data.location);
      } else {
        setBusLocation(null);
        setEta(null);
      }
    });

    return unsubscribe;
  };

  

  const calculateETAForSelectedStop = (busLoc) => {
    if (!selectedStop || !busLoc) return;

    const distance = calculateDistance(
      busLoc.latitude,
      busLoc.longitude,
      selectedStop.latitude,
      selectedStop.longitude
    );

    // Use float ETA for responsiveness; store as rounded minutes for legacy format,
    // but prefer formatting with 1 decimal when under 10 minutes
    const etaMinFloat = calculateETAFloat(distance);
    const etaMinutes = Math.round(etaMinFloat);
    setEta(etaMinFloat);
    setDistanceKm(distance);
  };

  const handleStopSelection = (stop) => {
    setSelectedStop(stop);
    if (busLocation) {
      calculateETAForSelectedStop(busLocation);
    }
  };

  // Recompute ETA/distance whenever bus moves or stop changes
  useEffect(() => {
    if (busLocation && selectedStop) {
      calculateETAForSelectedStop(busLocation);
    }
  }, [busLocation?.latitude, busLocation?.longitude, selectedStop?.latitude, selectedStop?.longitude]);

  

  

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  // Center near the bus if available (previous behavior)
  const region = busLocation
    ? {
        latitude: busLocation.latitude,
        longitude: busLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading bus location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <OSMMap
        style={styles.map}
        region={region}
        userLocation={userLocation}
        busLocation={busLocation}
        pinLocation={pinLocation}
      />

      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.overlayContent}>
        <View style={styles.statusContainer}>
          <Text style={styles.statusTitle}>
            {busLocation ? '🟢 Bus Active' : '🔴 No Bus Available'}
          </Text>
          <Text style={styles.statusText}>
            {busLocation
              ? 'Bus is currently in service'
              : 'No buses are currently being tracked'}
          </Text>
        </View>

        

        {busLocation && selectedStop && (
          <View style={styles.etaContainer}>
            <Text style={styles.etaTitle}>Your stop: {selectedStop.name}</Text>
            {(eta !== null || distanceKm !== null) && (
              <View style={styles.etaInfo}>
                {distanceKm !== null && (
                  <Text style={styles.etaText}>Distance: {formatDistance(distanceKm)}</Text>
                )}
                {eta !== null && (
                  <Text style={styles.etaText}>ETA: {eta < 10 ? `${eta.toFixed(1)} min` : formatETA(Math.round(eta))}</Text>
                )}
              </View>
            )}
            
          </View>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {selectedStop && (
          <TouchableOpacity
            style={[styles.waitingButton, isWaiting ? styles.waitingOn : styles.waitingOff]}
            onPress={toggleWaiting}
          >
            <Text style={styles.waitingText}>{isWaiting ? "I'm no longer waiting" : "I'm waiting at my stop"}</Text>
          </TouchableOpacity>
        )}
        </ScrollView>
      </View>
      <FooterNav />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
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
    maxHeight: '60%',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 6,
  },
  overlayContent: {
    paddingBottom: 12,
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
  etaContainer: {
    marginBottom: 20,
  },
  etaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  stopsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  stopButton: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  selectedStopButton: {
    backgroundColor: '#FF9800',
    borderColor: '#FF9800',
  },
  stopButtonText: {
    fontSize: 12,
    color: '#333',
  },
  selectedStopButtonText: {
    color: '#fff',
  },
  etaInfo: {
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#e8f5e8',
    borderRadius: 5,
  },
  etaText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  logoutButton: {
    padding: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: '#666',
    fontSize: 14,
  },
  waitingButton: {
    marginTop: 6,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  waitingOn: {
    backgroundColor: '#FF7043',
  },
  waitingOff: {
    backgroundColor: '#4CAF50',
  },
  waitingText: {
    color: '#fff',
    fontWeight: '700',
  },
  busMarker: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    margin: 5,
    alignItems: 'center',
  },
  userMarker: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    margin: 5,
    alignItems: 'center',
  },
  stopMarker: {
    backgroundColor: '#FFC107',
    padding: 10,
    borderRadius: 5,
    margin: 5,
    alignItems: 'center',
  },
  selectedStopMarker: {
    backgroundColor: '#FF9800',
  },
  markerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  markerCoords: {
    color: '#fff',
    fontSize: 10,
    marginTop: 2,
  },
});

export default StudentScreen; 