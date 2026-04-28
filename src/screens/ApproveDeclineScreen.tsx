import React, {useState} from 'react';
import {View, Text, StyleSheet, Alert} from 'react-native';
import {NativeStackScreenProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/AppNavigator';
import CustomButton from '../components/CustomButton';

type Props = {
  route: RouteProp<RootStackParamList, 'ApproveDecline'>;
  navigation: NativeStackScreenProp<RootStackParamList, 'ApproveDecline'>;
};

const ApproveDeclineScreen: React.FC<Props> = ({route}) => {
  const {companyName, bidNumber, bidDescription} = route.params || {};

  const handleApprove = () => {
    Alert.alert('Approved', 'Permission has been approved');
  };

  const handleDecline = () => {
    Alert.alert('Declined', 'Permission has been declined');
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Permission Request</Text>
        {companyName && <Text style={styles.label}>Company: {companyName}</Text>}
        {bidNumber && <Text style={styles.label}>Bid Number: {bidNumber}</Text>}
        {bidDescription && (
          <Text style={styles.description}>{bidDescription}</Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <CustomButton
          title="Approve"
          onPress={handleApprove}
          variant="primary"
        />
        <CustomButton
          title="Decline"
          onPress={handleDecline}
          variant="outline"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 40,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  buttonContainer: {
    marginTop: 32,
  },
});

export default ApproveDeclineScreen;