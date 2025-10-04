# BusPing Quick Setup Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Firebase Setup (Required)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password)
4. Enable Realtime Database
5. Copy your Firebase config

### Step 3: Update Firebase Configuration
Open `src/services/firebase.js` and replace the config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### Step 4: Run the App
```bash
# Start the development server
npm start

# Or run directly on device/simulator
npm run android  # For Android
npm run ios      # For iOS
npm run web      # For web browser
```

## 🧪 Testing the App

### Driver Testing:
1. Sign up with any email/password
2. Select "Driver" role
3. Grant location permissions
4. Use "Demo Controls" to simulate bus movement
5. Start tracking to share real location

### Student Testing:
1. Sign up with a different email/password
2. Select "Student/Faculty" role
3. Grant location permissions
4. You'll see the bus moving (if driver is simulating)
5. Select stops to see ETA

## 🔧 Demo Mode

The app includes demo controls for testing:
- **Driver Screen**: Has "Demo Controls" section
- **Simulation**: Creates fake bus movement in circular pattern
- **Real-time**: Students can see the simulated bus moving

## 🐛 Common Issues

### Firebase Connection Error
- Check your Firebase config in `src/services/firebase.js`
- Ensure Authentication and Realtime Database are enabled
- Verify internet connection

### Location Permission Error
- Go to device settings → Apps → BusPing → Permissions
- Enable location permissions
- Restart the app

### Maps Not Loading
- Check internet connection
- The app uses default maps (no API key required)

## 📱 Features to Test

### Driver Features:
- ✅ Location permission handling
- ✅ Real-time location tracking
- ✅ Firebase location updates
- ✅ Demo simulation controls
- ✅ Start/Stop tracking

### Student Features:
- ✅ Live bus location viewing
- ✅ Multiple bus stop selection
- ✅ ETA calculations
- ✅ User location tracking
- ✅ Real-time updates

## 🎯 Next Steps

1. **Customize Bus Stops**: Update coordinates in `StudentScreen.js`
2. **Add Real Routes**: Implement actual bus route data
3. **Push Notifications**: Add arrival notifications
4. **Multiple Buses**: Support multiple drivers
5. **Offline Mode**: Add offline functionality

## 📞 Need Help?

- Check the main README.md for detailed documentation
- Review Firebase console for any setup issues
- Test with demo controls first before real deployment

---

**Happy Testing! 🚌✨** 