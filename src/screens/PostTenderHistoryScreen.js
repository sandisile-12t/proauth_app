import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/theme';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import ScreenHeader from '../components/ScreenHeader';

export default function PostTenderHistoryScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [tenderHistory, setTenderHistory] = useState([]);

  useEffect(() => {
    // Real-time listener for tenders collection
    const unsubscribe = onSnapshot(collection(db, 'tenders'), (snapshot) => {
      const tenders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTenderHistory(tenders);
    });

    return () => unsubscribe(); // cleanup listener
  }, []);

  const filteredTenders = tenderHistory.filter(
    (item) =>
      item.description?.toLowerCase().includes(search.toLowerCase()) ||
      item.tenderNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="Tender History" navigation={navigation} />
      <Text style={styles.title}>Posted Tender History</Text>

      <TextInput
        style={styles.searchBox}
        placeholder="Search by tender number or description..."
        placeholderTextColor={colors.textSecondary}
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filteredTenders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => navigation.navigate('TenderDetails', { tender: item })}
          >
            <Text style={styles.tenderTitle}>{item.tenderNumber}</Text>
            <Text style={styles.detail}>{item.description}</Text>
            <Text style={styles.detail}>Closing: {new Date(item.closingDate).toDateString()}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.accent, marginBottom: 20 },
  searchBox: {
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
    color: colors.text,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  tenderTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  detail: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
});
