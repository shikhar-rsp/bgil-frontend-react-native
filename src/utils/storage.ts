import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Generic key/value persistence (React Native), replacing the web `localStorage`
 * used for non-token app data such as the cached user list. Async by nature.
 */
export const setItem = async (key: string, value: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error(`[storage] setItem(${key}) failed:`, error);
  }
};

export const getItem = async (key: string): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.error(`[storage] getItem(${key}) failed:`, error);
    return null;
  }
};

export const removeItem = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`[storage] removeItem(${key}) failed:`, error);
  }
};
