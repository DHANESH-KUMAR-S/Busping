import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { saveUserProfile } from '../services/firebase';

const ProfileScreen = ({ navigation }) => {
  const { user, userRole, userProfile, logout } = useAuth();
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [busNumber, setBusNumber] = useState('');
  const [driverLicense, setDriverLicense] = useState('');
  const [busPlateNumber, setBusPlateNumber] = useState('');
  const [busStopName, setBusStopName] = useState('');
  const [busStopLat, setBusStopLat] = useState(null);
  const [busStopLon, setBusStopLon] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setPhoneNumber(userProfile.phoneNumber || '');
      setBusNumber(userProfile.busNumber || '');
      setDriverLicense(userProfile.driverLicense || '');
      setBusPlateNumber(userProfile.busPlateNumber || '');
      setBusStopName(userProfile.busStopName || '');
      setBusStopLat(typeof userProfile.busStopLat === 'number' ? userProfile.busStopLat : null);
      setBusStopLon(typeof userProfile.busStopLon === 'number' ? userProfile.busStopLon : null);
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
        ...(userRole === 'driver' ? { driverLicense, busPlateNumber } : {}),
        ...(userRole === 'student' ? { busStopName, busStopLat, busStopLon } : {}),
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
          <>
            <TextInput style={styles.input} placeholder="Driver License Number" value={driverLicense} onChangeText={setDriverLicense} autoCapitalize="characters" />
            <TextInput style={styles.input} placeholder="Bus Plate Number" value={busPlateNumber} onChangeText={setBusPlateNumber} autoCapitalize="characters" />
          </>
        )}
        {userRole === 'student' && (
          <>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                navigation.navigate('StopPicker', {
                  onSelect: ({ busStopName: name, busStopLat: lat, busStopLon: lon }) => {
                    setBusStopName(name);
                    setBusStopLat(lat);
                    setBusStopLon(lon);
                  },
                });
              }}
            >
              <Text style={styles.secondaryButtonText}>{busStopName ? 'Change Stop on Map' : 'Pick Stop on Map'}</Text>
            </TouchableOpacity>
            {busStopName ? (
              <View style={styles.selectionBox}>
                <Text style={styles.infoText}>Selected: {busStopName}</Text>
                {typeof busStopLat === 'number' && typeof busStopLon === 'number' && (
                  <Text style={styles.infoText}>{busStopLat.toFixed(5)}, {busStopLon.toFixed(5)}</Text>
                )}
              </View>
            ) : null}
          </>
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
  selectionBox: { backgroundColor: '#f0f7ff', borderRadius: 8, padding: 10, marginTop: 8 },
  infoText: { fontSize: 14, color: '#1976d2', marginBottom: 5, lineHeight: 20 },
  secondaryButton: { marginTop: 8, paddingVertical: 12, alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: '#2196F3' },
  secondaryButtonText: { color: '#2196F3', fontWeight: '600' },
});

export default ProfileScreen;


