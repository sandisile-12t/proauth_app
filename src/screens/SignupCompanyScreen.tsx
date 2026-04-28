import React, {useState} from 'react';
import {View, StyleSheet, TouchableOpacity, Text, Alert} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import CustomTextField from '../components/CustomTextField';
import CustomButton from '../components/CustomButton';
import {useAuth} from '../context/AuthContext';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SignupCompany'>;
};

const SignupCompanyScreen: React.FC<Props> = ({navigation}) => {
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const {signUp} = useAuth();

  const handleSignup = async () => {
    if (!companyName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password);
      navigation.navigate('CompanyDashboard');
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Company Registration</Text>
      
      <CustomTextField
        label="Company Name"
        placeholder="Enter company name"
        value={companyName}
        onChangeText={setCompanyName}
      />
      
      <CustomTextField
        label="Email"
        placeholder="Enter company email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <CustomTextField
        label="Password"
        placeholder="Create a password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <CustomTextField
        label="Confirm Password"
        placeholder="Confirm your password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <CustomButton title="Register" onPress={handleSignup} loading={loading} />

      <View style={styles.loginSection}>
        <Text style={styles.loginText}>Already have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('LoginCompany')}>
          <Text style={styles.loginLink}>Sign In</Text>
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
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 32,
  },
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default SignupCompanyScreen;