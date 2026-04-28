import React, {useState} from 'react';
import {View, StyleSheet, Text, Alert} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import CustomTextField from '../components/CustomTextField';
import CustomButton from '../components/CustomButton';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RequestPermission'>;
};

const RequestPermissionScreen: React.FC<Props> = ({navigation}) => {
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (!reason) {
      Alert.alert('Error', 'Please provide a reason for the request');
      return;
    }
    Alert.alert('Success', 'Permission request submitted');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Request Permission</Text>
      
      <CustomTextField
        label="Reason"
        placeholder="Explain why you need access"
        value={reason}
        onChangeText={setReason}
        multiline
        numberOfLines={4}
        style={styles.textArea}
      />

      <CustomButton title="Submit Request" onPress={handleSubmit} />
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
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
});

export default RequestPermissionScreen;