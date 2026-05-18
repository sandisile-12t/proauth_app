import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../theme/theme';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function OrganInteractionsScreen() {
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInteractions = async () => {
      try {
        // 🔹 Adjust collection name to match your Firestore setup
        const querySnapshot = await getDocs(collection(db, 'interactions'));
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setInteractions(data);
      } catch (error) {
        console.error("Error fetching interactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInteractions();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tender Interactions</Text>
      <FlatList
        data={interactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.tenderTitle}>{item.tenderTitle}</Text>
            <Text style={styles.company}>Company: {item.companyName}</Text>
            <Text style={styles.subtitle}>Professionals:</Text>
            {item.professionals && item.professionals.map((prof) => (
              <Text key={prof.id} style={styles.professional}>
                {prof.name} - {prof.role} ({prof.status})
              </Text>
            ))}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.primary },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.accent, marginBottom: 20 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginVertical: 8 },
  tenderTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  company: { fontSize: 16, color: colors.text, marginVertical: 4 },
  subtitle: { fontSize: 16, fontWeight: 'bold', marginTop: 10, color: colors.accent },
  professional: { fontSize: 14, color: colors.text, marginLeft: 10 },
});
