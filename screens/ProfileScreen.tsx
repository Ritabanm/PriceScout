import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  Switch,
  StyleSheet
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../assets/context/ThemeContext';

export default function ProfileScreen() {
  const { isDark, toggleTheme } = useTheme();
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const pickProfileImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: false
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setProfileImage(uri);
    }
  };

  const handleLogout = () => {
    console.log('Logging out...');
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#111' : '#fff' }]}>
      <Pressable onPress={pickProfileImage}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={{ color: '#888' }}>Select Photo</Text>
          </View>
        )}
      </Pressable>

      <View style={styles.toggleRow}>
        <Text style={[styles.label, { color: isDark ? '#fff' : '#000' }]}>Dark Mode</Text>
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{ false: '#888', true: '#a259ff' }}
          thumbColor={isDark ? '#fff' : '#f4f3f4'}
        />
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 40
  },
  label: {
    fontSize: 16,
    fontWeight: '600'
  },
  logoutButton: {
    backgroundColor: '#a259ff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  }
});
