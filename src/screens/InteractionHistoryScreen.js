import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../theme/theme';
import { collection, query, where, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getAuth } from 'firebase/auth';

export default function InteractionHistoryScreen({ route }) {
  const { tenderId } = route.params; // Organ of State passes tenderId
  const auth = getAuth();
  const [decisions, setDecisions] = useState([]);
  const [tender, setTender] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenderId) {
      setLoading(false);
      return;
    }

    // 🔎 Fetch tender details
    const fetchTender = async () => {
      const tenderDoc = await getDoc(doc(db, 'tenders', tenderId));
      if (tenderDoc.exists()) {
        setTender(tenderDoc.data());
      }
    };

    fetchTender();

    // 🔎 Fetch all approval decisions for this tender
    const q = query(collection(db, 'approval_decisions'), where('tenderId', '==', tenderId));
    const unsub = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setDecisions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else {
        setDecisions([]);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [tenderId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {tender && (
        <View style={styles.tenderCard}>
          <Text style={styles.title}>Tender: {tender.tenderNumber}</Text>
          <Text style={styles.detail}>Description: {tender.description}</Text>
          <Text style={styles.detail}>Closing Date: {tender.closingDate}</Text>
          <Text style={styles.detail}>Key Personnel: {tender.keyPersonnel?.join(', ')}</Text>
        </View>
      )}

      {decisions.length === 0 ? (
        <Text style={styles.empty}>No interaction history found.</Text>
      ) : (
        <FlatList
          data={decisions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.company}>Company: {item.companyName}</Text>
              <Text style={styles.detail}>Individual ID: {item.individualId}</Text>
              <Text style={styles.detail}>Decision: {item.decision}</Text>
              <Text style={styles.detail}>Date: {new Date(item.createdAt.seconds * 1000).toLocaleString()}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary, padding: 20 },
  tenderCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  title: { fontSize: 18, fontWeight: 'bold', color: colors.accent },
  detail: { fontSize: 14, color: '#333', marginTop: 4 },
  empty: { color: '#fff', fontSize: 16, textAlign: 'center', marginTop: 20 },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  company: { fontSize: 16, fontWeight: 'bold', color: colors.accent },
});
