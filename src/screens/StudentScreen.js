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
import { getBusLocation } from '../services/firebase';
import {
  requestLocationPermission,
  getCurrentLocation,
  calculateDistance,
  calculateETA,
  formatETA,
} from '../utils/location';
import { ERROR_MESSAGES } from '../constants';
import OSMMap from '../components/OSMMap';
import FooterNav from '../components/FooterNav';

const StudentScreen = () => {
  const { user, logout, userProfile } = useAuth();
  const [busLocation, setBusLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [eta, setEta] = useState(null);
  // Route ETA (map-driven) not used in the pre-feature version
  const [loading, setLoading] = useState(true);
  const [selectedStop, setSelectedStop] = useState(null);
  

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

    const etaMinutes = calculateETA(distance);
    setEta(etaMinutes);
  };

  const handleStopSelection = (stop) => {
    setSelectedStop(stop);
    if (busLocation) {
      calculateETAForSelectedStop(busLocation);
    }
  };

  

  

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
      />

      <View style={styles.overlay}>
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

        

        {busLocation && (
          <View style={styles.etaContainer}>
            <Text style={styles.etaTitle}>Select a stop to see ETA:</Text>
            <View style={styles.stopsContainer}>
              {busStops.map((stop) => (
                <TouchableOpacity
                  key={stop.id}
                  style={[
                    styles.stopButton,
                    selectedStop?.id === stop.id && styles.selectedStopButton,
                  ]}
                  onPress={() => handleStopSelection(stop)}
                >
                  <Text
                    style={[
                      styles.stopButtonText,
                      selectedStop?.id === stop.id && styles.selectedStopButtonText,
                    ]}
                  >
                    {stop.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedStop && eta && (
              <View style={styles.etaInfo}>
                <Text style={styles.etaText}>
                  ETA to {selectedStop.name}: {formatETA(eta)}
                </Text>
              </View>
            )}
            
          </View>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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