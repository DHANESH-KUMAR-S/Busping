import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { saveUserProfile } from '../services/firebase';

const ProfileScreen = () => {
  const { user, userRole, userProfile, logout } = useAuth();
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [busNumber, setBusNumber] = useState('');
  const [driverLicense, setDriverLicense] = useState('');
  const [busStopName, setBusStopName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setPhoneNumber(userProfile.phoneNumber || '');
      setBusNumber(userProfile.busNumber || '');
      setDriverLicense(userProfile.driverLicense || '');
      setBusStopName(userProfile.busStopName || '');
    }
  }, [userProfile]);

  const handleSave = async () => {
    if (!name || !phoneNumber || !busNumber) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    if (!user?.uid) return;

    setSaving(true);
    try {
      const profile = {
        name,
        phoneNumber,
        busNumber,
        ...(userRole === 'driver' ? { driverLicense } : {}),
        ...(userRole === 'student' ? { busStopName } : {}),
      };

      await saveUserProfile(user.uid, profile);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (e) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Your Profile</Text>

        <TextInput style={styles.input} placeholder="Full Name *" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Phone Number *" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" />
        <TextInput style={styles.input} placeholder="Bus Number *" value={busNumber} onChangeText={setBusNumber} autoCapitalize="characters" />

        {userRole === 'driver' && (
          <TextInput style={styles.input} placeholder="Driver License Number" value={driverLicense} onChangeText={setDriverLicense} autoCapitalize="characters" />
        )}
        {userRole === 'student' && (
          <TextInput style={styles.input} placeholder="Bus Stop Name" value={busStopName} onChangeText={setBusStopName} autoCapitalize="words" />
        )}

        <TouchableOpacity style={[styles.button, saving && styles.buttonDisabled]} onPress={handleSave} disabled={saving}>
          <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContainer: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 15, marginBottom: 15, backgroundColor: '#fff' },
  button: { backgroundColor: '#2196F3', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#ccc' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  logoutButton: { marginTop: 10, padding: 12, alignItems: 'center' },
  logoutText: { color: '#f44336', fontWeight: 'bold' },
});

export default ProfileScreen;


