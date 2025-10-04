import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES } from '../constants';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';
import DriverScreen from '../screens/DriverScreen';
import StudentScreen from '../screens/StudentScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoadingScreen from '../screens/LoadingScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, userRole, profileCompleted, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2196F3',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {!user ? (
          // Auth screens
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : !userRole ? (
          // Role selection
          <Stack.Screen 
            name="RoleSelection" 
            component={RoleSelectionScreen}
            options={{ title: 'Select Your Role' }}
          />
        ) : !profileCompleted ? (
          // Profile setup
          <Stack.Screen 
            name="ProfileSetup" 
            component={ProfileSetupScreen}
            options={{ 
              title: 'Profile Setup',
              headerLeft: () => null,
              gestureEnabled: false
            }}
          />
        ) : (
          // Main app screens based on role
          <>
            {userRole === USER_ROLES.DRIVER ? (
              <Stack.Screen 
                name="Driver" 
                component={DriverScreen}
                options={{ 
                  title: 'Bus Tracking',
                  headerLeft: () => null,
                  gestureEnabled: false
                }}
              />
            ) : (
              <Stack.Screen 
                name="Student" 
                component={StudentScreen}
                options={{ 
                  title: 'Bus Tracker',
                  headerLeft: () => null,
                  gestureEnabled: false
                }}
              />
            )}
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ title: 'Profile' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 