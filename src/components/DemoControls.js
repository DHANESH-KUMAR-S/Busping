import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { updateBusLocation } from '../services/firebase';
import { getCurrentLocation } from '../utils/location';

const DemoControls = ({ driverId, busNumber }) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationInterval, setSimulationInterval] = useState(null);

  const startSimulation = async () => {
    if (isSimulating) return;
    if (!driverId) {
      Alert.alert('Demo Mode', 'You must be logged in to start simulation.');
      return;
    }

    setIsSimulating(true);
    // Simulate bus movement around the driver's current location if available
    let center = { latitude: 37.78825, longitude: -122.4324 };
    try {
      const here = await getCurrentLocation();
      if (here?.latitude && here?.longitude) {
        center = { latitude: here.latitude, longitude: here.longitude };
      }
    } catch (_) {
      // Fallback to default center
    }

    const campusArea = {
      center,
      radius: 0.01, // Small radius for demo
    };

    let angle = 0;
    const interval = setInterval(() => {
      // Create circular movement pattern
      const lat = campusArea.center.latitude + Math.cos(angle) * campusArea.radius;
      const lng = campusArea.center.longitude + Math.sin(angle) * campusArea.radius;
      
      const location = {
        latitude: lat,
        longitude: lng,
        accuracy: 10,
        timestamp: Date.now(),
      };

      // Update Firebase with simulated location and bus number
      if (driverId) {
        updateBusLocation(driverId, location, busNumber);
      }
      
      angle += 0.1; // Move slowly around the circle
    }, 5000); // Update every 5 seconds

    setSimulationInterval(interval);
    Alert.alert('Demo Mode', 'Bus location simulation started! Students can now see the bus moving.');
  };

  const stopSimulation = () => {
    if (!isSimulating) return;

    if (simulationInterval) {
      clearInterval(simulationInterval);
      setSimulationInterval(null);
    }

    setIsSimulating(false);
    Alert.alert('Demo Mode', 'Bus location simulation stopped.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Demo Controls</Text>
      <Text style={styles.description}>
        Use these controls to simulate bus movement for testing
      </Text>
      
      <TouchableOpacity
        style={[
          styles.button,
          isSimulating ? styles.stopButton : styles.startButton,
        ]}
        onPress={isSimulating ? stopSimulation : startSimulation}
      >
        <Text style={styles.buttonText}>
          {isSimulating ? 'Stop Simulation' : 'Start Simulation'}
        </Text>
      </TouchableOpacity>
      
      <Text style={styles.note}>
        Note: This creates fake bus movement for demo purposes. 
        Students will see the bus moving in a circular pattern.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    margin: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  description: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  note: {
    fontSize: 10,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default DemoControls; 