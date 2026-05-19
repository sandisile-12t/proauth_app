import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { colors } from '../theme/theme';

export default function ForgotPasswordScreen({ route }) {
  const initialRole = route?.params?.role || 'Individual';
  const [role, setRole] = useState(initialRole);
  const [email, setEmail] = useState('');

  const handleReset = () => {
    // TODO: send reset request to backend based on role
    alert(`Password reset link sent to ${email} for ${role}`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Forgot Password</Text>

      <View style={styles.roleButtons}>
        <Button title="Individual" color={role === 'Individual' ? colors.accent : '#fff'} onPress={() => setRole('Individual')} />
        <Button title="Company" color={role === 'Company' ? colors.accent : '#fff'} onPress={() => setRole('Company')} />
        <Button title="Organ of State" color={role === 'Organ' ? colors.accent : '#fff'} onPress={() => setRole('Organ')} />
      </View>

      <TextInput style={styles.input} placeholder="Enter your email" value={email} onChangeText={setEmail} />
      <Button title="Reset Password" color={colors.accent} onPress={handleReset} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: colors.primary },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.accent, marginBottom: 20, textAlign: 'center' },
  roleButtons: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  input: { backgroundColor: '#fff', padding: 10, marginVertical: 10, borderRadius: 8 },
});
