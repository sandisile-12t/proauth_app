import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { colors } from '../theme/theme';

export default function HomeScreen({ navigation }) {
  const [role, setRole] = useState('Individual');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // ✅ Pass role to Login screen
    navigation.navigate('Login', { role });
  };

  const handleSignup = () => {
    // ✅ Pass role to Signup screen
    navigation.navigate('Signup', { role });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.subtitle}>Select your role:</Text>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={role}
          onValueChange={(itemValue) => setRole(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Individual" value="Individual" />
          <Picker.Item label="Company" value="Company" />
          <Picker.Item label="Organ of State" value="Organ" />
        </Picker>
      </View>


      <View style={styles.actions}>
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleSignup}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: colors.primary },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.accent, marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 18, color: '#fff', marginBottom: 20, textAlign: 'center' },
  pickerContainer: { backgroundColor: '#fff', borderRadius: 8, marginBottom: 20 },
  picker: { height: 50, width: '100%' },
  input: { backgroundColor: '#fff', padding: 10, marginVertical: 10, borderRadius: 8 },
  actions: { flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 10 },
  button: { backgroundColor: colors.accent, paddingVertical: 12, paddingHorizontal: 25, borderRadius: 25 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
