import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../theme/theme';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getAuth } from 'firebase/auth';
import ScreenHeader from '../components/ScreenHeader';

export default function PostTenderHistoryScreen({ navigation }) {
  const auth = getAuth();
  const [search, setSearch] = useState('');
  const [tenderHistory, setTenderHistory] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setTenderHistory([]);
      return;
    }

    const q = query(collection(db, 'tenders'), where('organId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tenders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTenderHistory(tenders);
    });

    return () => unsubscribe(); // cleanup listener
  }, [auth.currentUser]);

  const filteredTenders = tenderHistory.filter(
    (item) =>
      item.description?.toLowerCase().includes(search.toLowerCase()) ||
      item.tenderNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteTender = (item) => {
    Alert.alert(
      'Delete Tender',
      'Are you sure you want to delete this tender?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'tenders', item.id));
            } catch (error) {
              console.error('Error deleting tender:', error);
              Alert.alert('Delete failed', 'Unable to delete the tender.');
            }
          },
        },
      ]
    );
  };

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
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.tenderTitle}>{item.tenderNumber}</Text>
              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('PostTenders', { tender: item })}>
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDeleteTender(item)}>
                  <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.detail}>{item.description}</Text>
            <Text style={styles.detail}>Closing: {item.closingDate ? new Date(item.closingDate).toDateString() : 'N/A'}</Text>
          </View>
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardActions: {
    flexDirection: 'row',
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#e9ecef',
    marginLeft: 8,
  },
  actionText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  deleteButton: {
    backgroundColor: '#f8d7da',
  },
  deleteText: {
    color: '#c82333',
  },
  tenderTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  detail: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: 16,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 12,
    color: colors.text,
    marginBottom: 12,
  },
  multilineInput: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  dateButton: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  dateText: {
    color: colors.text,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
});
