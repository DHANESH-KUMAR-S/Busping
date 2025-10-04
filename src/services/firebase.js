import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase, ref, set, onValue, off } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCtyMqbhjS1fUmmxj5AT_pmYF_oAyKRhhI",
  authDomain: "busping-1b5a2.firebaseapp.com",
  databaseURL: "https://busping-1b5a2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "busping-1b5a2",
  storageBucket: "busping-1b5a2.firebasestorage.app",
  messagingSenderId: "332713345307",
  appId: "1:332713345307:web:dd1f45ca7e83c14f5a53be",
  measurementId: "G-K5G800V9QD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Auth with AsyncStorage persistence on React Native; fall back to default for web
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
} catch (e) {
  // initializeAuth may throw on web; use default getAuth there
  auth = getAuth(app);
}
const database = getDatabase(app);

// Authentication functions
export const signUp = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signIn = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logout = () => {
  return signOut(auth);
};

// Database functions for bus tracking
export const updateBusLocation = (driverId, location, busNumber) => {
  const busRef = ref(database, `buses/${driverId}`);
  return set(busRef, {
    location,
    busNumber,
    timestamp: Date.now(),
    isActive: true
  });
};

export const getBusLocation = (busNumber, callback) => {
  const busesRef = ref(database, 'buses');
  onValue(
    busesRef,
    (snapshot) => {
      const buses = snapshot.val();
      if (buses) {
        // Find the bus with matching bus number and active
        const busEntries = Object.entries(buses);
        const matching = busEntries.find(([id, data]) => data && data.busNumber === busNumber && data.isActive);
        callback(matching ? matching[1] : null);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('[Firebase] getBusLocation onValue error:', error?.message || error);
      callback(null);
    }
  );
  return () => off(busesRef);
};

export const stopTracking = (driverId) => {
  const busRef = ref(database, `buses/${driverId}`);
  return set(busRef, {
    isActive: false,
    timestamp: Date.now()
  });
};

// User profile/role persistence
export const persistUserRole = (uid, role) => {
  const roleRef = ref(database, `users/${uid}/role`);
  return set(roleRef, role);
};

export const saveUserProfile = (uid, profile) => {
  const profileRef = ref(database, `users/${uid}/profile`);
  const completedRef = ref(database, `users/${uid}/profileCompleted`);
  return Promise.all([
    set(profileRef, profile),
    set(completedRef, true)
  ]);
};

export const markProfileCompleted = (uid) => {
  const completedRef = ref(database, `users/${uid}/profileCompleted`);
  return set(completedRef, true);
};

export const listenToUserProfile = (uid, callback) => {
  const userRef = ref(database, `users/${uid}`);
  onValue(
    userRef,
    (snapshot) => {
      const value = snapshot.val();
      callback(value ?? {});
    },
    (error) => {
      console.error('[Firebase] listenToUserProfile onValue error:', error?.message || error);
      // Provide a safe empty payload so the app can continue (e.g., go to RoleSelection)
      callback({});
    }
  );
  return () => off(userRef);
};

// Listen to all active buses (for "All Buses" view)

export { auth, database }; 