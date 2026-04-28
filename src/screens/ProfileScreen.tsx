import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Profile'>;
};

const ProfileScreen: React.FC<Props> = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.profileCard}>
        <Text style={styles.placeholder}>Profile information will appear here</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  placeholder: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default ProfileScreen;