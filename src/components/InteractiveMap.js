import React, { useMemo } from 'react';
import { Platform } from 'react-native';
import WebMap from './WebMap';

// Use expo-maps which is supported in Expo Go
let MapView, Marker;
if (Platform.OS !== 'web') {
  try {
    const ExpoMaps = require('expo-maps');
    MapView = ExpoMaps.MapView;
    Marker = ExpoMaps.Marker;
  } catch (e) {
    // Will fallback to WebMap below if import fails
  }
}

const InteractiveMap = ({ region, userLocation, busLocation, style, children }) => {
  // Web fallback or if expo-maps could not be required
  if (Platform.OS === 'web' || !MapView || !Marker) {
    return (
      <WebMap region={region} style={style}>
        {children}
      </WebMap>
    );
  }

  const initialCamera = useMemo(() => {
    const lat = region?.latitude ?? 37.78825;
    const lon = region?.longitude ?? -122.4324;
    const zoom = region?.latitudeDelta ? Math.max(4, 16 - Math.log2(region.latitudeDelta / 0.01)) : 14;
    return {
      center: { latitude: lat, longitude: lon },
      zoom,
      pitch: 0,
      heading: 0,
    };
  }, [region?.latitude, region?.longitude, region?.latitudeDelta]);

  return (
    <MapView style={[{ flex: 1 }, style]} initialCamera={initialCamera}>
      {busLocation && (
        <Marker
          coordinate={{ latitude: busLocation.latitude, longitude: busLocation.longitude }}
          title="Bus Location"
          description={`${busLocation.latitude?.toFixed(4)}, ${busLocation.longitude?.toFixed(4)}`}
          color="#2196F3"
        />
      )}
      {userLocation && (
        <Marker
          coordinate={{ latitude: userLocation.latitude, longitude: userLocation.longitude }}
          title="Your Location"
          description={`${userLocation.latitude?.toFixed(4)}, ${userLocation.longitude?.toFixed(4)}`}
          color="#4CAF50"
        />
      )}
      {children}
    </MapView>
  );
};

export default InteractiveMap;
