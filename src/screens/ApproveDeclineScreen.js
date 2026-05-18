import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, ActivityIndicator, FlatList } from 'react-native';
import { colors } from '../theme/theme';
import { collection, query, where, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getAuth } from 'firebase/auth';

export default function ApproveDeclineScreen() {
  const auth = getAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    // 🔎 Find requests that include this individual’s UID
    const q = query(
      collection(db, 'permission_requests'),
      where('individualIds', 'array-contains', user.uid) // ✅ match by UID
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else {
        setRequests([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDecision = async (decision, request) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'You must be logged in.');
        return;
      }

      await addDoc(collection(db, 'approval_decisions'), {
        tenderId: request.tenderId,
        tenderNumber: request.tenderNumber,
        individualId: user.uid,       // ✅ decision tied to this individual
        decision,                     // "Accepted" or "Declined"
        companyId: request.companyId, // ✅ include company info
        companyName: request.companyName, // ✅ now shows correct company
        createdAt: new Date(),
      });

      Alert.alert('Success', `You have ${decision.toLowerCase()} this tender.`);
    } catch (error) {
      console.error('Error saving decision:', error);
      Alert.alert('Error', 'Failed to save decision.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {requests.length === 0 ? (
        <Text style={{ color: '#fff', fontSize: 16 }}>No requests assigned to you.</Text>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.detailsCard}>
              {/* Tender Details */}
              <Text style={styles.company}>{item.companyName ?? 'Unknown Company'}</Text>
              <Text style={styles.bidNumber}>Bid No: {item.tenderNumber ?? 'N/A'}</Text>
              <Text style={styles.description}>{item.description ?? 'No description provided'}</Text>
              <Text style={styles.closingDate}>Closing Date: {item.closingDate ?? 'N/A'}</Text>

              {/* Actions */}
              <View style={styles.actions}>
                <Button
                  title="Accept"
                  color={colors.accent}
                  onPress={() => handleDecision('Accepted', item)}
                />
                <Button
                  title="Decline"
                  color="red"
                  onPress={() => handleDecision('Declined', item)}
                />
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.primary },
  detailsCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  company: { fontSize: 20, fontWeight: 'bold', color: colors.accent, marginBottom: 6 },
  bidNumber: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 },
  description: { fontSize: 14, color: '#555', marginBottom: 6 },
  closingDate: { fontSize: 13, fontStyle: 'italic', color: '#777' },
  actions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
});
