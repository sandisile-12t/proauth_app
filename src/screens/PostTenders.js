import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../theme/theme';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getAuth } from 'firebase/auth';

export default function PostTenderScreen({ navigation }) {
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
  ];

  const [selectedEngineers, setSelectedEngineers] = useState([]);

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

      // ✅ Add tender and capture Firestore doc ID
      const docRef = await addDoc(collection(db, 'tenders'), {
        tenderNumber,
        description,
        closingDate: closingDate.toISOString(),
        keyPersonnel: selectedEngineers,
        organId: user.uid,   // logged-in organ’s UID
        createdAt: new Date(),
      });

      alert('Tender posted successfully!');

      // ✅ Pass tender with Firestore ID forward
      navigation.navigate('AvailableTendersScreen', {
        tender: {
          id: docRef.id,          // Firestore doc ID
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
      <Text style={styles.header}>Post a Tender</Text>

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

      <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.dateText}>Closing Date: {closingDate.toDateString()}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={closingDate}
          mode="date"
          minimumDate={new Date()}
          display="calendar"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setClosingDate(selectedDate);
          }}
        />
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

      <Button title="Post Tender" color={colors.accent} onPress={handlePostTender} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.primary },
  header: { fontSize: 22, fontWeight: 'bold', color: colors.accent, marginBottom: 20 },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 12 },
  dateButton: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 20 },
  dateText: { color: colors.text, fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.accent, marginBottom: 10 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  checkbox: { width: 20, height: 20, borderWidth: 2, borderColor: colors.accent, marginRight: 10, borderRadius: 4 },
  checkboxSelected: { backgroundColor: colors.accent },
  checkboxLabel: { fontSize: 16, color: colors.text },
});
