import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { colors } from '../theme/theme';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function OrganProfileScreen({ navigation }) {
  const [organData, setOrganData] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const fetchOrganData = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) {
          console.log('No logged-in user');
          setLoading(false);
          return;
        }

        // Fetch the organ profile from Firestore using UID
        const organRef = doc(db, 'organ', uid);
        const organSnap = await getDoc(organRef);

        if (organSnap.exists()) {
          setOrganData(organSnap.data());
        } else {
          console.log('No organ profile found');
        }
      } catch (error) {
        console.error('Error fetching organ profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganData();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Organ Profile</Text>

      {organData ? (
        <View style={styles.card}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{organData.organName || 'Not specified'}</Text>

          <Text style={styles.label}>Department</Text>
          <Text style={styles.value}>{organData.department || 'Not specified'}</Text>

          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{organData.email || 'Not specified'}</Text>

          {/* Add other fields you saved during signup */}
          {organData.phone && (
            <>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.value}>{organData.phone}</Text>
            </>
          )}
          {organData.address && (
            <>
              <Text style={styles.label}>Address</Text>
              <Text style={styles.value}>{organData.address}</Text>
            </>
          )}
        </View>
      ) : (
        <Text style={styles.value}>No profile data found</Text>
      )}

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('EditOrganProfile')}
      >
        <Text style={styles.buttonText}>Edit Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: colors.primary, 
    padding: 20 
  },
  title: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: colors.accent, 
    marginBottom: 20 
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 5,
  },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: colors.textOnAccent,
    fontSize: 16,
    fontWeight: '600',
  },
});
