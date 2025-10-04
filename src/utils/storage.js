import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'busping:';

const buildKey = (key) => `${PREFIX}${key}`;

export const storage = {
  async get(key, defaultValue = null) {
    try {
      const value = await AsyncStorage.getItem(buildKey(key));
      if (value == null) return defaultValue;
      return JSON.parse(value);
    } catch (e) {
      console.warn('[Storage] get error', key, e);
      return defaultValue;
    }
  },
  async set(key, value) {
    try {
      await AsyncStorage.setItem(buildKey(key), JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn('[Storage] set error', key, e);
      return false;
    }
  },
  async remove(key) {
    try {
      await AsyncStorage.removeItem(buildKey(key));
      return true;
    } catch (e) {
      console.warn('[Storage] remove error', key, e);
      return false;
    }
  },
  async clearAll() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const ours = keys.filter((k) => k.startsWith(PREFIX));
      await AsyncStorage.multiRemove(ours);
    } catch (e) {
      console.warn('[Storage] clearAll error', e);
    }
  }
};
