import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../theme/theme';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function ProfileScreen() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) {
          console.log('No logged-in user');
          setLoading(false);
          return;
        }

        // Try fetching from all possible collections
        const collections = ['users', 'company_users', 'organ'];
        let foundData = null;

        for (const col of collections) {
          const ref = doc(db, col, uid);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            foundData = { ...snap.data(), role: col };
            break;
          }
        }

        setUserData(foundData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
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
      <Text style={styles.title}>My Profile</Text>
      {userData ? (
        <>
          {/* Show name for all roles */}
          <Text style={styles.label}>
            Name: {userData.firstName || ''} {userData.lastName || ''}
          </Text>

          {/* Show profession if Individual */}
          {userData.role === 'users' && (
            <Text style={styles.label}>
              Profession: {userData.profession || 'Not specified'}
            </Text>
          )}

          {/* Show company info if Company */}
          {userData.role === 'company_users' && (
            <>
              <Text style={styles.label}>
                Company Name: {userData.companyName || 'Not specified'}
              </Text>
              <Text style={styles.label}>
                Registration No: {userData.companyReg || 'Not specified'}
              </Text>
            </>
          )}

          {/* Show organ info if Organ */}
          {userData.role === 'organ' && (
            <>
              <Text style={styles.label}>
                Organ: {userData.organName || 'Not specified'}
              </Text>
              <Text style={styles.label}>
                Department: {userData.department || 'Not specified'}
              </Text>
            </>
          )}
        </>
      ) : (
        <Text style={styles.label}>No profile data found</Text>
      )}

      <Button title="Upload CV" color={colors.accent} onPress={() => {}} />
      <Button title="Upload Certificates" color={colors.accent} onPress={() => {}} />
      <Button title="Upload ID Copy" color={colors.accent} onPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.primary },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.accent, marginBottom: 20 },
  label: { color: '#fff', marginBottom: 10, fontSize: 16 },
});
