import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList } from 'react-native';
import { colors } from '../theme/theme';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function AvailableTendersScreen({ navigation }) {
  const [tenders, setTenders] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'tenders'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTenders(data);
    });
    return () => unsubscribe();
  }, []);

  if (tenders.length === 0) return <Text style={{color: colors.text}}>No tenders available</Text>;

  return (
    <View style={styles.container}>
      <FlatList
        data={tenders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.company}>{item.tenderNumber}</Text>
            <Text style={styles.description}>{item.description}</Text>
            <Text style={styles.closingDate}>Closing Date: {new Date(item.closingDate).toDateString()}</Text>

            {/* ✅ Show key personnel */}
            <Text style={styles.sectionTitle}>Key Personnel:</Text>
            {item.keyPersonnel && item.keyPersonnel.length > 0 ? (
              item.keyPersonnel.map((person, index) => (
                <Text key={index} style={styles.personnel}>{person}</Text>
              ))
            ) : (
              <Text style={styles.personnel}>No personnel listed</Text>
            )}

<Button
  title="Request Permission"
  color={colors.accent}
  onPress={() => navigation.navigate('Employees', { tender: item })}
/>


          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.primary },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  company: { fontSize: 20, fontWeight: 'bold', color: colors.accent },
  description: { fontSize: 14, color: '#555', marginBottom: 6 },
  closingDate: { fontSize: 13, fontStyle: 'italic', color: '#777' },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginTop: 10, color: colors.accent },
  personnel: { fontSize: 14, color: colors.textSecondary, marginLeft: 10 },
});
