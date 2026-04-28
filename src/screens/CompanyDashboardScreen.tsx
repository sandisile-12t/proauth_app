import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CompanyDashboard'>;
};

const CompanyDashboardScreen: React.FC<Props> = ({navigation}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Company Dashboard</Text>
      
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('ApproveDecline', {
          companyName: 'ABC Construction',
          bidNumber: 'BID12345',
          bidDescription: 'Bid for construction of a new bridge.',
        })}>
        <Text style={styles.menuText}>Pending Requests</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('UploadDocuments')}>
        <Text style={styles.menuText}>Upload Documents</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('InteractionHistory')}>
        <Text style={styles.menuText}>Interaction History</Text>
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
    marginBottom: 24,
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

export default CompanyDashboardScreen;