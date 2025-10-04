import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

const WebMap = ({ region, children, style }) => {
  // Always use web version for now to avoid import issues
  return (
    <View style={[styles.webMap, style]}>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapTitle}>🗺️ Interactive Map</Text>
        <Text style={styles.mapSubtitle}>
          Location: {region?.latitude?.toFixed(4)}, {region?.longitude?.toFixed(4)}
        </Text>
        <Text style={styles.mapNote}>
          Maps work best on mobile devices. Use Expo Go app for full functionality.
        </Text>
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  webMap: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholder: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    margin: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mapTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 10,
  },
  mapSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  mapNote: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default WebMap; 