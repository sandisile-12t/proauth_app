import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { colors } from '../theme/theme';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

export default function UnifiedSignupScreen({ route, navigation }) {
  const { role } = route.params;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profession, setProfession] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyReg, setCompanyReg] = useState('');
  const [organName, setOrganName] = useState('');
  const [department, setDepartment] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [companies, setCompanies] = useState([]);
  const auth = getAuth();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'company_users'));
        const companyList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCompanies(companyList);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };
    fetchCompanies();
  }, []);

  const handleSignup = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      let targetCollection = 'users';
      if (role === 'Company') targetCollection = 'company_users';
      else if (role === 'Organ') targetCollection = 'organ';

      let companyData = {};
      if (role === 'Individual' && selectedCompanyId) {
        // ✅ Fetch selected company profile
        const companyDoc = await getDoc(doc(db, 'company_users', selectedCompanyId));
        if (companyDoc.exists()) {
          companyData = companyDoc.data();
        }
      }

      await setDoc(doc(db, targetCollection, user.uid), {
        uid: user.uid,
        role,
        firstName,
        lastName,
        profession,
        companyId: selectedCompanyId || null,
        companyName: role === 'Individual' ? (companyData.companyName || '') : companyName,
        companyReg: role === 'Individual' ? (companyData.companyReg || '') : companyReg,
        organName,
        department,
        email,
        createdAt: new Date(),
      });

      alert('Signup successful!');
      navigation.navigate('Login', { role });
    } catch (error) {
      console.error("Error signing up:", error);
      alert('Signup failed: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up as {role}</Text>

      {role === 'Individual' && (
        <>
          <TextInput
            style={styles.input}
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
          />

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedCompanyId}
              onValueChange={(itemValue) => setSelectedCompanyId(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select Company" value="" />
              {companies.map((company) => (
                <Picker.Item 
                  key={company.id} 
                  label={company.companyName || company.id} 
                  value={company.id}
                />
              ))}
            </Picker>
          </View>

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={profession}
              onValueChange={(itemValue) => setProfession(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select Profession" value="" />
              <Picker.Item label="Quantity Surveyor (QS)" value="Quantity Surveyor" />
              <Picker.Item label="Electrical Engineer" value="Electrical Engineer" />
              <Picker.Item label="Structural Engineer" value="Structural Engineer" />
              <Picker.Item label="Architect" value="Architect" />
              <Picker.Item label="Town Planner" value="Town Planner" />
              <Picker.Item label="Civil Engineer" value="Civil Engineer" />
              <Picker.Item label="Mechanical Engineer" value="Mechanical Engineer" />
            </Picker>
          </View>
        </>
      )}

      {role === 'Company' && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Company Name"
            value={companyName}
            onChangeText={setCompanyName}
          />
          <TextInput
            style={styles.input}
            placeholder="Company Registration Number"
            value={companyReg}
            onChangeText={setCompanyReg}
          />
        </>
      )}

      {role === 'Organ' && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Name of Organ of State"
            value={organName}
            onChangeText={setOrganName}
          />
          <TextInput
            style={styles.input}
            placeholder="Department"
            value={department}
            onChangeText={setDepartment}
          />
        </>
      )}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Text style={styles.eye}>{showPassword ? '🙈' : '👁️'}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: colors.primary },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.accent, marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#fff', padding: 12, marginVertical: 10, borderRadius: 8 },
  pickerContainer: { backgroundColor: '#fff', borderRadius: 8, marginVertical: 10 },
  picker: { height: 50, width: '100%' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, marginVertical: 10 },
  passwordInput: { flex: 1, padding: 12 },
  eye: { fontSize: 20, paddingHorizontal: 10 },
  button: { backgroundColor: colors.accent, paddingVertical: 14, borderRadius: 25, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
