import React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

import { USER_ROLES } from '../constants';

const RoleSelectionScreen = () => {
  const { setRole, logout } = useAuth();

  const handleRoleSelection = (role) => {
    Alert.alert(
      'Confirm Role',
      `Are you sure you want to continue as a ${role === USER_ROLES.DRIVER ? 'Driver' : 'Student'}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => setRole(role),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Your Role</Text>
        <Text style={styles.subtitle}>
          Choose how you'll use BusPing
        </Text>
      </View>

      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={styles.roleCard}
          onPress={() => handleRoleSelection(USER_ROLES.DRIVER)}
        >
          <View style={styles.roleIcon}>
            <Text style={styles.iconText}>🚌</Text>
          </View>
          <Text style={styles.roleTitle}>Driver</Text>
          <Text style={styles.roleDescription}>
            Share your bus location with students and faculty
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.roleCard}
          onPress={() => handleRoleSelection(USER_ROLES.STUDENT)}
        >
          <View style={styles.roleIcon}>
            <Text style={styles.iconText}>👨‍🎓</Text>
          </View>
          <Text style={styles.roleTitle}>Student/Faculty</Text>
          <Text style={styles.roleDescription}>
            Track bus location and get real-time updates
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          💡 You can change your role later by logging out and signing in again
        </Text>
      </View>

      {/* Logout button so users can exit onboarding */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  roleContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  roleCard: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 15,
    marginBottom: 20,
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
  roleIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconText: {
    fontSize: 40,
  },
  roleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  roleDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  infoContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e8f5e8',
    borderRadius: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#2e7d32',
    textAlign: 'center',
  },
  logoutContainer: {
    marginTop: 10,
    padding: 10,
    alignItems: 'center',
  },
  logoutButton: {
    padding: 10,
  },
  logoutText: {
    color: '#666',
    fontSize: 14,
  },
});

export default RoleSelectionScreen;