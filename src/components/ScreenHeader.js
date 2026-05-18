import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth, signOut } from 'firebase/auth';
import { colors } from '../theme/theme';

export default function ScreenHeader({ title, navigation, showBack = true }) {
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (error) {
      console.error('Logout failed:', error);
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    }
  };

  const canGoBack = showBack && navigation?.canGoBack && navigation.canGoBack();

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {canGoBack ? (
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={styles.buttonPlaceholder} />
        )}
      </View>

      <Text style={styles.title}>{title}</Text>

      <View style={styles.right}>
        <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.textSecondary || '#666',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
  },
  left: {
    width: 80,
  },
  right: {
    width: 80,
    alignItems: 'flex-end',
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.accent,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonPlaceholder: {
    width: 80,
    height: 32,
  },
});
