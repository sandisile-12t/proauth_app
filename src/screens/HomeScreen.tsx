import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

const HomeScreen: React.FC<Props> = ({navigation}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>ProAuth Home</Text>
      
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('Profile')}>
        <Text style={styles.menuText}>Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('Notifications')}>
        <Text style={styles.menuText}>Notifications</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('RequestPermission')}>
        <Text style={styles.menuText}>Request Permission</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('UploadDocuments')}>
        <Text style={styles.menuText}>Upload Documents</Text>
      </TouchableOpacity>
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
    marginBottom: 32,
  },
  menuItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
});

export default HomeScreen;