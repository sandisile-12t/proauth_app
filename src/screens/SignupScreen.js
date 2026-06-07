import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { colors } from '../theme/theme';
import { collection, getDocs, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

export default function UnifiedSignupScreen({ route, navigation }) {
  const { role, edit = false, profileData = {}, userId: routeUserId, companyId: routeCompanyId } = route.params || {};
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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [companies, setCompanies] = useState([]);
  const [currentUserId, setCurrentUserId] = useState('');
  const auth = getAuth();
  const isEditMode = Boolean(edit);

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
        console.error('Error fetching companies:', error);
      }
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (!isEditMode) return;

    setFirstName(profileData.firstName || '');
    setLastName(profileData.lastName || '');
    setProfession(profileData.profession || '');
    setSelectedCompanyId(profileData.companyId || '');
    setCompanyName(profileData.companyName || '');
    setCompanyReg(profileData.companyReg || '');
    setOrganName(profileData.organName || '');
    setDepartment(profileData.department || '');
    setEmail(profileData.email || auth.currentUser?.email || '');
    setCurrentUserId(routeUserId || routeCompanyId || auth.currentUser?.uid || '');
  }, [isEditMode, profileData, routeUserId, routeCompanyId, auth.currentUser]);

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const validateSignup = () => {
    if (!email.trim()) {
      setError('Email is required.');
      return false;
    }
    if (!isValidEmail(email.trim())) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (!isEditMode) {
      if (!password) {
        setError('Password is required.');
        return false;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters.');
        return false;
      }
    }

    if (role === 'Individual') {
      if (!firstName.trim()) {
        setError('First name is required.');
        return false;
      }
      if (!lastName.trim()) {
        setError('Last name is required.');
        return false;
      }
      if (!selectedCompanyId) {
        setError('Please select a company.');
        return false;
      }
      if (!profession) {
        setError('Please select your profession.');
        return false;
      }
    }

    if (role === 'Company') {
      if (!companyName.trim()) {
        setError('Company name is required.');
        return false;
      }
      if (!companyReg.trim()) {
        setError('Company registration number is required.');
        return false;
      }
    }

    if (role === 'Organ') {
      if (!organName.trim()) {
        setError('Organ of state name is required.');
        return false;
      }
      if (!department.trim()) {
        setError('Department is required.');
        return false;
      }
    }

    setError('');
    return true;
  };

  const handleSignup = async () => {
    if (!validateSignup()) {
      return;
    }
    setLoading(true);
    try {
      if (isEditMode) {
        const targetCollection = role === 'Company' ? 'company_users' : role === 'Organ' ? 'organ' : 'users';
        const docId = currentUserId || auth.currentUser?.uid;
        if (!docId) {
          throw new Error('Missing user ID for update.');
        }

        let companyData = {};
        if (role === 'Individual' && selectedCompanyId) {
          const companyDoc = await getDoc(doc(db, 'company_users', selectedCompanyId));
          if (companyDoc.exists()) {
            companyData = companyDoc.data();
          }
        }

        const updateData = {
          role,
          email: email.trim(),
        };

        if (role === 'Individual') {
          updateData.firstName = firstName.trim();
          updateData.lastName = lastName.trim();
          updateData.profession = profession;
          updateData.companyId = selectedCompanyId || null;
          updateData.companyName = companyData.companyName || '';
          updateData.companyReg = companyData.companyReg || '';
        }

        if (role === 'Company') {
          updateData.companyName = companyName.trim();
          updateData.companyReg = companyReg.trim();
        }

        if (role === 'Organ') {
          updateData.organName = organName.trim();
          updateData.department = department.trim();
        }

        await updateDoc(doc(db, targetCollection, docId), updateData);
        alert('Profile updated successfully.');

        if (role === 'Individual') {
          navigation.navigate('Profile');
        } else if (role === 'Company') {
          navigation.navigate('CProfile', { companyId: docId });
        } else if (role === 'Organ') {
          navigation.navigate('OrganProfile');
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const user = userCredential.user;

        let targetCollection = 'users';
        if (role === 'Company') targetCollection = 'company_users';
        else if (role === 'Organ') targetCollection = 'organ';

        let companyData = {};
        if (role === 'Individual' && selectedCompanyId) {
          const companyDoc = await getDoc(doc(db, 'company_users', selectedCompanyId));
          if (companyDoc.exists()) {
            companyData = companyDoc.data();
          }
        }

        await setDoc(doc(db, targetCollection, user.uid), {
          uid: user.uid,
          role,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          profession,
          companyId: selectedCompanyId || null,
          companyName: role === 'Individual' ? (companyData.companyName || '') : companyName.trim(),
          companyReg: role === 'Individual' ? (companyData.companyReg || '') : companyReg.trim(),
          organName: organName.trim(),
          department: department.trim(),
          email: email.trim(),
          createdAt: new Date(),
        });

        alert('Signup successful!');
        navigation.navigate('Login', { role });
      }
    } catch (error) {
      console.error('Error signing up or updating profile:', error);
      setError(error.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>{isEditMode ? `Edit ${role} Profile` : `Sign Up as ${role}`}</Text>

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
        style={[styles.input, isEditMode && styles.disabledInput]}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        editable={!isEditMode}
        onChangeText={(value) => {
          if (!isEditMode) {
            setEmail(value);
          }
          if (error) setError('');
        }}
      />
      {!isEditMode && (
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              if (error) setError('');
            }}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.eye}>{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {isEditMode && (
        <Text style={styles.noteText}>
          Editing profile: email cannot be changed here. To change login credentials, use account settings.
        </Text>
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSignup} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? (isEditMode ? 'Saving...' : 'Signing Up...') : isEditMode ? 'Save Changes' : 'Sign Up'}</Text>
      </TouchableOpacity>
    </ScrollView>
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
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  errorText: { color: '#FF6961', marginTop: 8, textAlign: 'center', fontWeight: '600' },
});
