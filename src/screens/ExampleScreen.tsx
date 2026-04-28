import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Example'>;
};

const ExampleScreen: React.FC<Props> = ({navigation}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>ProAuth Example</Text>
      
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('SignupCompany')}>
        <Text style={styles.buttonText}>Go to Signup Company</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('LoginCompany')}>
        <Text style={styles.buttonText}>Sign in as Company</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('LoginIndividual')}>
        <Text style={styles.buttonText}>Sign in as Individual</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('SignupIndividual')}>
        <Text style={styles.buttonText}>Go to Individual Signup</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate('ApproveDecline', {
            companyName: 'ABC Construction',
            bidNumber: 'BID12345',
            bidDescription: 'Bid for construction of a new bridge.',
          })
        }>
        <Text style={styles.buttonText}>Go to Approve/Decline Screen</Text>
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
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ExampleScreen;