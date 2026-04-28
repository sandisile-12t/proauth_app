import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import CustomButton from '../components/CustomButton';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'UploadDocuments'>;
};

const UploadDocumentsScreen: React.FC<Props> = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Documents</Text>
      <View style={styles.uploadArea}>
        <Text style={styles.placeholder}>Tap to select files</Text>
      </View>
      <CustomButton title="Select Files" onPress={() => {}} />
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
  uploadArea: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  placeholder: {
    fontSize: 16,
    color: '#999',
  },
});

export default UploadDocumentsScreen;