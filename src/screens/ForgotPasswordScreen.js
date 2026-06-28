import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { colors } from '../theme/theme';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function ForgotPasswordScreen({ route }) {
  const initialRole = route?.params?.role || 'Individual';
  const [role, setRole] = useState(initialRole);
  const [email, setEmail] = useState('');

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handlePasswordReset = async () => {
    if (!isValidEmail(email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    try {
      // First, check if the account exists in the correct role collection
      let targetCollection = 'users';
      if (role === 'Company') targetCollection = 'company_users';
      else if (role === 'Organ') targetCollection = 'organ';

      // Try to find the user record by email
      // Note: Firestore doesn’t allow direct lookup by email unless you query.
      // For simplicity, we assume email is unique and stored in the doc.
      // In production, you’d use a query with where("email", "==", email).
      const userDoc = await getDoc(doc(db, targetCollection, email.trim()));

      if (!userDoc.exists()) {
        Alert.alert('Role Mismatch', `${role} account does not exist for this email.`);
        return;
      }

      const actualRole = userDoc.data().role;
      if (actualRole !== role) {
        Alert.alert(
          'Role Mismatch',
          `You selected "${role}" but this account is registered as "${actualRole}".`
        );
        return;
      }

      // If role matches, send reset email
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert('Success', 'Password reset email sent. Please check your inbox.');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to send password reset email.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Reset Password as {role}</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <View style={styles.button}>
        <Text style={styles.buttonText} onPress={handlePasswordReset}>
          Send Reset Link
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: colors.primary },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.accent, marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#fff', padding: 12, marginVertical: 10, borderRadius: 8 },
  button: { backgroundColor: colors.accent, paddingVertical: 14, borderRadius: 25, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
