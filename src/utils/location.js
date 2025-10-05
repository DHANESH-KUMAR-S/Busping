import * as Location from 'expo-location';

// Calculate distance between two coordinates in kilometers
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
};

// Format distance given in kilometers to a human-friendly string
export const formatDistance = (km) => {
  if (km < 1) {
    const meters = Math.round(km * 1000);
    return `${meters} m`;
  }
  return `${km.toFixed(1)} km`;
};

// Calculate ETA based on distance and average speed (km/h)
export const calculateETA = (distance, averageSpeed = 30) => {
  const timeInHours = distance / averageSpeed;
  const timeInMinutes = Math.round(timeInHours * 60);
  return timeInMinutes;
};

// Calculate ETA with decimal minutes precision (e.g., 2.4 minutes)
export const calculateETAFloat = (distance, averageSpeed = 30) => {
  const timeInHours = distance / averageSpeed;
  const timeInMinutes = timeInHours * 60;
  return timeInMinutes; // caller can format to desired precision
};

// Format ETA for display
export const formatETA = (minutes) => {
  if (minutes < 1) return 'Less than 1 minute';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  
  return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
};

// Request location permissions
export const requestLocationPermission = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission denied');
    }
    
    const backgroundStatus = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus.status !== 'granted') {
      console.warn('Background location permission not granted');
    }
    
    return true;
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
};

// Get current location
export const getCurrentLocation = async () => {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
      timeInterval: 5000,
      distanceInterval: 10
    });
    
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      timestamp: location.timestamp
    };
  } catch (error) {
    throw error;
  }
};

// Start location tracking
export const startLocationTracking = async (callback) => {
  try {
    const locationSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 3000,
        distanceInterval: 5
      },
      (location) => {
        const locationData = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
          timestamp: location.timestamp
        };
        callback(locationData);
      }
    );
    
    return locationSubscription;
  } catch (error) {
    console.error('Error starting location tracking:', error);
    throw error;
  }
};