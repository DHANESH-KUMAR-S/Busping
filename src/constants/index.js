export const USER_ROLES = {
  DRIVER: 'driver',
  STUDENT: 'student'
};

export const APP_CONFIG = {
  LOCATION_UPDATE_INTERVAL: 10000, // 10 seconds
  BACKGROUND_LOCATION_UPDATE_INTERVAL: 30000, // 30 seconds
  ETA_CALCULATION_INTERVAL: 5000, // 5 seconds
};

export const PERMISSIONS = {
  LOCATION: 'location',
  BACKGROUND_LOCATION: 'backgroundLocation'
};

export const ERROR_MESSAGES = {
  LOCATION_PERMISSION_DENIED: 'Location permission is required for bus tracking',
  NETWORK_ERROR: 'Network error. Please check your connection',
  AUTHENTICATION_ERROR: 'Authentication failed. Please try again',
  LOCATION_SERVICES_DISABLED: 'Location services are disabled. Please enable them in settings'
};

export const SUCCESS_MESSAGES = {
  TRACKING_STARTED: 'Bus tracking started successfully',
  TRACKING_STOPPED: 'Bus tracking stopped',
  LOCATION_UPDATED: 'Location updated successfully'
}; 