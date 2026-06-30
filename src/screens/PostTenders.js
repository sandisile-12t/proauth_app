import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, FlatList, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../theme/theme';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getAuth } from 'firebase/auth';
import ScreenHeader from '../components/ScreenHeader';

export default function PostTenderScreen({ navigation, route }) {
  const { tender } = route.params || {};
  const editing = Boolean(tender?.id);
  const [tenderNumber, setTenderNumber] = useState('');
  const [description, setDescription] = useState('');
  const [closingDate, setClosingDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const auth = getAuth();

  const engineers = [
    { id: '1', name: 'Civil Engineer' },
    { id: '2', name: 'Structural Engineer' },
    { id: '3', name: 'Electrical Engineer' },
    { id: '4', name: 'Mechanical Engineer' },
    { id: '5', name: 'Environmental Engineer' },
    { id: '6', name: 'Geotechnical Engineer' },
    { id: '7', name: 'Transportation Engineer' },
    { id: '8', name: 'Quantity Suveyor' },
    { id: '9', name: 'Environmental Engineer' },

  ];

  const [selectedEngineers, setSelectedEngineers] = useState([]);

  useEffect(() => {
    if (editing && tender) {
      setTenderNumber(tender.tenderNumber || '');
      setDescription(tender.description || '');
      setClosingDate(tender.closingDate ? new Date(tender.closingDate) : new Date());
      setSelectedEngineers(tender.keyPersonnel || []);
    }
  }, [editing, tender]);

  const toggleEngineer = (name) => {
    if (selectedEngineers.includes(name)) {
      setSelectedEngineers(selectedEngineers.filter(e => e !== name));
    } else {
      setSelectedEngineers([...selectedEngineers, name]);
    }
  };

  const handlePostTender = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        alert('You must be logged in as an organ of state to post a tender.');
        return;
      }

      if (editing && tender?.id) {
        const tenderRef = doc(db, 'tenders', tender.id);
        await updateDoc(tenderRef, {
          tenderNumber,
          description,
          closingDate: closingDate.toISOString(),
          keyPersonnel: selectedEngineers,
        });
        alert('Tender updated successfully!');
        navigation.goBack();
        return;
      }

      const docRef = await addDoc(collection(db, 'tenders'), {
        tenderNumber,
        description,
        closingDate: closingDate.toISOString(),
        keyPersonnel: selectedEngineers,
        organId: user.uid,
        createdAt: new Date(),
      });

      alert('Tender posted successfully!');

      navigation.navigate('Tenders', {
        tender: {
          id: docRef.id,
          tenderNumber,
          description,
          closingDate: closingDate.toISOString(),
          keyPersonnel: selectedEngineers,
          organId: user.uid,
        }
      });
    } catch (error) {
      console.error('Error posting tender:', error);
      alert('Failed to post tender');
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title={editing ? 'Edit Tender' : 'Post Tender'} navigation={navigation} />
      <Text style={styles.header}>{editing ? 'Edit Tender' : 'Post a Tender'}</Text>

      <TextInput
        style={styles.input}
        placeholder="Tender Number"
        value={tenderNumber}
        onChangeText={setTenderNumber}
      />
      <TextInput
        style={styles.input}
        placeholder="Tender Description"
        value={description}
        onChangeText={setDescription}
      />

      {/* Hybrid Date Picker */}
      {Platform.OS === 'web' ? (
        <View style={styles.dateButton}>
          <Text style={styles.dateText}>Closing Date:</Text>
          <input
            type="date"
            value={closingDate.toISOString().split("T")[0]}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setClosingDate(new Date(e.target.value))}
            style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
          />
        </View>
      ) : (
        <>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateText}>Closing Date: {closingDate.toDateString()}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={closingDate}
              mode="date"
              minimumDate={new Date()}
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={(event, selectedDate) => {
                if (Platform.OS === 'android') setShowDatePicker(false);
                if (selectedDate) setClosingDate(selectedDate);
              }}
            />
          )}
        </>
      )}

      <Text style={styles.sectionTitle}>Key Personnel</Text>
      <FlatList
        data={engineers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => toggleEngineer(item.name)}
          >
            <View style={[
              styles.checkbox,
              selectedEngineers.includes(item.name) && styles.checkboxSelected
            ]}/>
            <Text style={styles.checkboxLabel}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      <Button title={editing ? 'Save Changes' : 'Post Tender'} color={colors.accent} onPress={handlePostTender} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.primary },
  header: { fontSize: 22, fontWeight: 'bold', color: colors.accent, marginBottom: 20 },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 12 },
  dateButton: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 20 },
  dateText: { color: colors.text, fontSize: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.accent, marginBottom: 10 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  checkbox: { 
    width: 20, 
    height: 20, 
    borderWidth: 2, 
    borderColor: colors.accent, 
    marginRight: 10, 
    borderRadius: 4 
  },
  checkboxSelected: { backgroundColor: colors.accent },
  checkboxLabel: { fontSize: 16, color: '#fff' },
});
