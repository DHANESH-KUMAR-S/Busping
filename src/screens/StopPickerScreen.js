import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import OSMMap from '../components/OSMMap';
import { getCurrentLocation } from '../utils/location';

const nominatimSearch = async (query) => {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`;
  const res = await fetch(url, { headers: { 'Accept': 'application/json', 'User-Agent': 'BusPing/1.0' } });
  if (!res.ok) throw new Error('Search failed');
  const data = await res.json();
  return data.map((it) => ({
    id: String(it.place_id),
    name: it.display_name,
    latitude: parseFloat(it.lat),
    longitude: parseFloat(it.lon),
  }));
};

const StopPickerScreen = ({ navigation, route }) => {
  const onSelect = route?.params?.onSelect;
  const [region, setRegion] = useState({ latitude: 37.78825, longitude: -122.4324, latitudeDelta: 0.05, longitudeDelta: 0.05 });
  const [pin, setPin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const loc = await getCurrentLocation();
        setRegion({ latitude: loc.latitude, longitude: loc.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 });
      } catch (_) {}
      setLoading(false);
    })();
  }, []);

  const handleSearch = async () => {
    if (!q.trim()) return;
    setSearching(true);
    try {
      const items = await nominatimSearch(q.trim());
      setResults(items);
      if (items[0]) {
        const p = items[0];
        setRegion({ latitude: p.latitude, longitude: p.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 });
        setPin({ latitude: p.latitude, longitude: p.longitude });
      }
    } catch (e) {
      Alert.alert('Search Error', 'Unable to search. Check your internet connection.');
    } finally {
      setSearching(false);
    }
  };

  const confirm = (labelOverride) => {
    if (!pin) { Alert.alert('No location selected', 'Tap on the map or choose a search result.'); return; }
    const name = labelOverride || (results.find(r => Math.abs(r.latitude - pin.latitude) < 1e-6 && Math.abs(r.longitude - pin.longitude) < 1e-6)?.name) || 'Selected Stop';
    const payload = { busStopName: name, busStopLat: pin.latitude, busStopLon: pin.longitude };
    if (typeof onSelect === 'function') {
      onSelect(payload);
      navigation.goBack();
    } else {
      navigation.navigate('ProfileSetup', { selectedStop: payload });
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="Search place or stop name"
          value={q}
          onChangeText={setQ}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} disabled={searching}>
          <Text style={styles.searchBtnText}>{searching ? '...' : 'Search'}</Text>
        </TouchableOpacity>
      </View>

      <OSMMap
        style={{ flex: 1 }}
        region={region}
        pinLocation={pin}
        onMapTap={(p) => setPin(p)}
      />

      {results.length > 0 && (
        <View style={styles.resultsBox}>
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => {
                  setPin({ latitude: item.latitude, longitude: item.longitude });
                  setRegion({ latitude: item.latitude, longitude: item.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 });
                }}
              >
                <Text numberOfLines={1} style={styles.resultText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      <TouchableOpacity style={styles.confirmBtn} onPress={() => confirm()}>
        <Text style={styles.confirmText}>Use This Location</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchRow: { flexDirection: 'row', padding: 12, gap: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, height: 44 },
  searchBtn: { paddingHorizontal: 14, backgroundColor: '#2196F3', borderRadius: 8, justifyContent: 'center' },
  searchBtnText: { color: '#fff', fontWeight: '600' },
  resultsBox: { position: 'absolute', top: 64, left: 12, right: 12, maxHeight: 180, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#eee' },
  resultItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  resultText: { fontSize: 12, color: '#333' },
  confirmBtn: { margin: 12, backgroundColor: '#4CAF50', padding: 14, borderRadius: 10, alignItems: 'center' },
  confirmText: { color: '#fff', fontWeight: '700' },
});

export default StopPickerScreen;
