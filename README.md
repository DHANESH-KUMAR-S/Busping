# BusPing - Real-time College Bus Tracking App

A React Native (Expo) app for real-time bus tracking with Firebase integration. The app serves both drivers and students/faculty with role-based functionality.

## 🚀 Features

### For Drivers:
- **Location Sharing**: Share real-time bus location with students
- **Simple Interface**: Minimal UI with map showing current position
- **Background Tracking**: Continuous location updates even when app is minimized
- **One-tap Start/Stop**: Easy tracking control

### For Students/Faculty:
- **Live Bus Tracking**: View real-time bus location on map
- **ETA Calculation**: Get estimated time of arrival to selected stops
- **Multiple Stops**: Choose from different campus locations
- **User Location**: See your position relative to the bus

## 🛠 Tech Stack

- **Frontend**: React Native with Expo CLI
- **Backend**: Firebase (Authentication + Realtime Database)
- **Maps**: React Native Maps (MapView)
- **Location**: Expo Location API
- **Navigation**: React Navigation v6
- **State Management**: React Context API

## 📱 Screenshots

### Driver Interface
- Map showing current bus location
- Start/Stop tracking buttons
- Status indicators

### Student Interface
- Live bus location on map
- Multiple bus stop selection
- ETA calculations
- User location tracking

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development) or Android Studio (for Android)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd BusPing
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Setup**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Enable Realtime Database
   - Get your Firebase config and update `src/services/firebase.js`

4. **Update Firebase Configuration**
   ```javascript
   // In src/services/firebase.js
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     databaseURL: "https://your-project-default-rtdb.firebaseio.com",
     projectId: "your-project",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id"
   };
   ```

5. **Run the app**
   ```bash
   # Start the development server
   npx expo start
   
   # Run on iOS
   npx expo run:ios
   
   # Run on Android
   npx expo run:android
   
   # Run on web
   npx expo run:web
   ```

## 📁 Project Structure

```
BusPing/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/            # App screens
│   │   ├── LoginScreen.js
│   │   ├── RoleSelectionScreen.js
│   │   ├── DriverScreen.js
│   │   ├── StudentScreen.js
│   │   └── LoadingScreen.js
│   ├── services/           # Firebase and API services
│   │   └── firebase.js
│   ├── utils/              # Utility functions
│   │   └── location.js
│   ├── constants/          # App constants
│   │   └── index.js
│   ├── context/            # React Context
│   │   └── AuthContext.js
│   └── navigation/         # Navigation setup
│       └── AppNavigator.js
├── assets/                 # Images, fonts, etc.
├── App.js                  # Main app component
└── package.json
```

## 🔧 Configuration

### Firebase Setup

1. **Authentication Rules**
   ```json
   {
     "rules": {
       ".read": "auth != null",
       ".write": "auth != null"
     }
   }
   ```

2. **Realtime Database Rules**
   ```json
   {
     "rules": {
       "buses": {
         "$driverId": {
           ".read": "auth != null",
           ".write": "auth != null && auth.uid == $driverId"
         }
       }
     }
   }
   ```

### Environment Variables

Create a `.env` file in the root directory:
```env
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
FIREBASE_PROJECT_ID=your-project
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
```

## 🎯 Usage

### Driver Mode
1. Sign in with email/password
2. Select "Driver" role
3. Grant location permissions
4. Tap "Start Tracking" to begin sharing location
5. The app will continuously update your location to Firebase

### Student Mode
1. Sign in with email/password
2. Select "Student/Faculty" role
3. Grant location permissions
4. View live bus location on the map
5. Select a bus stop to see ETA

## 🔒 Security Features

- **Authentication**: Email/password authentication via Firebase
- **Role-based Access**: Different interfaces for drivers and students
- **Location Permissions**: Proper permission handling with graceful fallbacks
- **Data Validation**: Input validation and error handling

## 🚨 Permissions Required

### iOS
- `NSLocationWhenInUseUsageDescription`: "BusPing needs location access to track bus location"
- `NSLocationAlwaysAndWhenInUseUsageDescription`: "BusPing needs background location access for continuous tracking"

### Android
- `ACCESS_FINE_LOCATION`: For precise location tracking
- `ACCESS_COARSE_LOCATION`: For approximate location tracking
- `ACCESS_BACKGROUND_LOCATION`: For background location updates

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Connection Error**
   - Verify Firebase configuration in `src/services/firebase.js`
   - Check internet connection
   - Ensure Firebase project is properly set up

2. **Location Permission Denied**
   - Go to device settings and enable location permissions
   - Restart the app after granting permissions

3. **Maps Not Loading**
   - Check internet connection
   - Verify Google Maps API key (if using custom maps)

4. **Build Errors**
   - Clear cache: `npx expo start --clear`
   - Delete node_modules and reinstall: `rm -rf node_modules && npm install`

## 📈 Future Enhancements

- [ ] Multiple bus routes support
- [ ] Push notifications for bus arrivals
- [ ] Offline mode with cached data
- [ ] Route optimization
- [ ] Driver schedule management
- [ ] Student favorites and alerts
- [ ] Analytics dashboard
- [ ] Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Firebase for backend services
- Expo for the development platform
- React Native Maps for mapping functionality
- React Navigation for navigation

## 📞 Support

For support, email support@busping.com or create an issue in the repository.

---

**Note**: This app is designed for educational purposes and uses Firebase's free tier. For production use, consider upgrading to paid plans for better performance and features. 