import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/theme';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function LoginScreen({ route, navigation }) {
  const { role } = route.params;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const auth = getAuth();

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // Determine which collection to check based on selected role
      let targetCollection = 'users';
      if (role === 'Company') targetCollection = 'company_users';
      else if (role === 'Organ') targetCollection = 'organ';

      // Fetch the user’s record from Firestore
      const userDoc = await getDoc(doc(db, targetCollection, user.uid));

      if (!userDoc.exists()) {
        alert(`${role} account does not exist. Please log in with the correct role.`);
        return;
      }

      const actualRole = userDoc.data().role;

      if (actualRole !== role) {
        alert(`You selected "${role}" but this account is registered as "${actualRole}".`);
        return;
      }

      // Navigate based on actual role
      if (actualRole === 'Individual') navigation.navigate('Dashboard');
      else if (actualRole === 'Company') navigation.navigate('CompanyDashboard');
      else if (actualRole === 'Organ') navigation.navigate('OrganofStateDashboard');

    } catch (error) {
      alert('Login failed: ' + error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Login as {role}</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword', { role })}>
        <Text style={styles.link}>Forgot password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: colors.primary },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.accent, marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#fff', padding: 12, marginVertical: 10, borderRadius: 8 },
  button: { backgroundColor: colors.accent, paddingVertical: 14, borderRadius: 25, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  link: { color: colors.accent, textAlign: 'center', marginTop: 8, textDecorationLine: 'underline' },
});
