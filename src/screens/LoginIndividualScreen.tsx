import React, {useState} from 'react';
import {View, StyleSheet, TouchableOpacity, Text, Alert} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import CustomTextField from '../components/CustomTextField';
import CustomButton from '../components/CustomButton';
import {useAuth} from '../context/AuthContext';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'LoginIndividual'>;
};

const LoginIndividualScreen: React.FC<Props> = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const {signIn} = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
      navigation.navigate('UserDashboard');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Individual Login</Text>
      
      <CustomTextField
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <CustomTextField
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity
        style={styles.forgotPassword}
        onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      <CustomButton title="Sign In" onPress={handleLogin} loading={loading} />

      <View style={styles.signupSection}>
        <Text style={styles.signupText}>Don't have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignupIndividual')}>
          <Text style={styles.signupLink}>Sign Up</Text>
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
  forgotPassword: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#007AFF',
    fontSize: 14,
  },
  signupSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  signupText: {
    color: '#666',
    fontSize: 14,
  },
  signupLink: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default LoginIndividualScreen;