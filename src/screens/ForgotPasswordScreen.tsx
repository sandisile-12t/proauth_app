import React, {useState} from 'react';
import {View, StyleSheet, Text, Alert} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import CustomTextField from '../components/CustomTextField';
import CustomButton from '../components/CustomButton';
import {sendPasswordResetEmail} from 'firebase/auth';
import {auth} from '../services/firebase';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>;
};

const ForgotPasswordScreen: React.FC<Props> = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Success', 'Password reset email sent');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>
        Enter your email and we'll send you a password reset link
      </Text>
      
      <CustomTextField
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <CustomButton
        title="Send Reset Link"
        onPress={handleResetPassword}
        loading={loading}
      />
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
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
});

export default ForgotPasswordScreen;