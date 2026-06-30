import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { colors } from '../theme/theme';
import { collection, query, where, onSnapshot, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getAuth } from 'firebase/auth';
import ScreenHeader from '../components/ScreenHeader';

export default function RequestPermissionScreen({ route, navigation }) {
  const { tender } = route.params;
  const [individuals, setIndividuals] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const auth = getAuth();

  // helper to normalize strings
  const normalize = (str) => str?.trim().toLowerCase();

  useEffect(() => {
    if (!auth.currentUser?.uid) return;

    const q = query(collection(db, 'users'), where('companyId', '==', auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setIndividuals(data);
    });

    return () => unsubscribe();
  }, [auth.currentUser?.uid]);

  const toggleSelect = (id, profession) => {
    const required = (tender.keyPersonnel || []).map(normalize);
    if (!required.includes(normalize(profession))) {
      Alert.alert('Invalid Selection', 'This profession is not listed on the tender.');
      return;
    }

    if (selected.includes(id)) {
      setSelected(selected.filter(s => s !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleSubmit = async () => {
    if (selected.length === 0) {
      Alert.alert('No selection', 'Please select at least one individual.');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'You must be logged in.');
        return;
      }

      const selectedIndividuals = individuals.filter(ind => selected.includes(ind.id));

      // ✅ Validate professions against tender keyPersonnel
      const required = (tender.keyPersonnel || []).map(normalize);
      const invalid = selectedIndividuals.filter(ind =>
        !required.includes(normalize(ind.profession))
      );

      if (invalid.length > 0) {
        Alert.alert(
          'Invalid Selection',
          `The following individuals do not match tender requirements:\n${invalid.map(i => `${i.firstName} ${i.lastName}`).join(', ')}`
        );
        return;
      }

      const q = query(collection(db, 'company_users'), where('uid', '==', user.uid));
      const snapshot = await getDocs(q);
      let companyData = {};
      if (!snapshot.empty) {
        companyData = snapshot.docs[0].data();
      }

      for (const ind of selectedIndividuals) {
        await addDoc(collection(db, 'approval_decisions'), {
          tenderId: tender.id,
          tenderNumber: tender.tenderNumber,
          tenderDescription: tender.description,
          tenderClosingDate: tender.closingDate,
          companyId: user.uid,
          companyName: companyData.companyName || 'Unknown Company',
          companyReg: companyData.companyReg || '',
          individualId: ind.uid,
          decision: 'pending',
          createdAt: new Date(),
        });
      }

      Alert.alert('Submitted', `Request sent to ${selectedIndividuals.length} individuals.`);
      setSelected([]);
      navigation.goBack();
    } catch (error) {
      console.error('Error saving request:', error);
      Alert.alert('Error', 'Failed to save request.');
    }
  };

  const filtered = individuals.filter(
    (ind) =>
      ind.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      ind.lastName?.toLowerCase().includes(search.toLowerCase()) ||
      ind.profession?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="Request Permission" navigation={navigation} />
      <Text style={styles.title}>Request Permission</Text>
      <TextInput
        style={styles.searchBox}
        placeholder="Search individuals..."
        placeholderTextColor={colors.textSecondary}
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const required = (tender.keyPersonnel || []).map(normalize);
          const isValid = required.includes(normalize(item.profession));
          return (
            <TouchableOpacity
              style={[styles.row, !isValid && styles.disabledRow]}
              onPress={() => toggleSelect(item.id, item.profession)}
              disabled={!isValid}
            >
              <View style={[styles.checkbox, selected.includes(item.id) && styles.checkboxSelected]} />
              <View>
                <Text style={[styles.name, !isValid && styles.disabledText]}>
                  {item.firstName} {item.lastName}
                </Text>
                <Text style={[styles.profession, !isValid && styles.disabledText]}>
                  {item.profession}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <Text style={styles.footer}>Selected: {selected.length}</Text>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Submit Request</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: colors.accent, marginBottom: 20 },
  searchBox: {
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
    color: colors.text,
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  disabledRow: { opacity: 0.5 },
  checkbox: {
    width: 20, height: 20, borderWidth: 2, borderColor: colors.accent,
    marginRight: 10, borderRadius: 4,
  },
  checkboxSelected: { backgroundColor: colors.accent },
  name: { fontSize: 16, color: '#fff' },
  profession: { fontSize: 14, color: '#fff' },
  disabledText: { color: '#aaa' },
  footer: { marginTop: 20, fontSize: 16, color: colors.textSecondary },
  submitButton: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  submitText: { color: colors.textOnAccent, fontSize: 16, fontWeight: '600' },
});
