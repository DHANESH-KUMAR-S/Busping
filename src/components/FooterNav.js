import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const FooterNav = () => {
  const navigation = useNavigation();
  const { userRole } = useAuth();

  const goHome = () => {
    const homeRoute = userRole === 'driver' ? 'Driver' : 'Student';
    navigation.navigate(homeRoute);
  };

  const goProfile = () => {
    navigation.navigate('Profile');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.navButton} onPress={goHome}>
        <Text style={styles.navText}>🏠 Home</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={goProfile}>
        <Text style={styles.navText}>👤 Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  navButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  navText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
});

export default FooterNav;


