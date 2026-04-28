import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RoleSelection'>;
};

const RoleSelectionScreen: React.FC<Props> = ({navigation}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>ProAuth</Text>
      <Text style={styles.subtitle}>Choose your role</Text>
      
      <TouchableOpacity
        style={styles.roleCard}
        onPress={() => navigation.navigate('SignupCompany')}>
        <Text style={styles.roleTitle}>Company</Text>
        <Text style={styles.roleDescription}>
          Register as a company to post projects and manage workers
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.roleCard}
        onPress={() => navigation.navigate('SignupIndividual')}>
        <Text style={styles.roleTitle}>Individual</Text>
        <Text style={styles.roleDescription}>
          Register as an individual professional
        </Text>
      </TouchableOpacity>

      <View style={styles.loginSection}>
        <Text style={styles.loginText}>Already have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('LoginCompany')}>
          <Text style={styles.loginLink}>Sign In as Company</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('LoginIndividual')}>
          <Text style={styles.loginLink}>Sign In as Individual</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#007AFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
    marginBottom: 48,
  },
  roleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: 14,
    color: '#666',
  },
  loginSection: {
    marginTop: 32,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#666',
  },
  loginLink: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginTop: 8,
  },
});

export default RoleSelectionScreen;