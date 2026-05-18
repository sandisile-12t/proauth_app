import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../theme/theme';
import { getAuth } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function CompanyDashboardScreen({ navigation }) {
  const auth = getAuth();
  const loggedInCompanyId = auth.currentUser?.uid;

  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loggedInCompanyId) {
      setLoading(false);
      return;
    }

    // 🔎 Fetch tenders belonging to this company
    const q = query(collection(db, 'tenders'), where('companyId', '==', loggedInCompanyId));
    const unsub = onSnapshot(q, (snapshot) => {
      const tenderData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTenders(tenderData);
      setLoading(false);
    });

    return () => unsub();
  }, [loggedInCompanyId]);

  const DashboardButton = ({ title, onPress }) => (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Company Dashboard</Text>

      <DashboardButton
        title="Profile"
        onPress={() =>
          navigation.navigate('CProfile', { companyId: loggedInCompanyId })
        }
      />

      <DashboardButton
        title="Available Tenders"
        onPress={() => navigation.navigate('Tenders')}
      />

      <DashboardButton
        title="Interaction History"
        onPress={() => {
          if (tenders.length > 0) {
            navigation.navigate('History', { tenderId: tenders[0].id });
          } else {
            alert('No tenders found for this company.');
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: colors.primary, 
    padding: 20 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: colors.accent, 
    marginBottom: 40 
  },
  button: { 
    backgroundColor: colors.accent, 
    paddingVertical: 15, 
    paddingHorizontal: 30, 
    borderRadius: 12, 
    marginVertical: 10, 
    width: '80%', 
    alignItems: 'center', 
    elevation: 3 
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: '600' 
  },
});
