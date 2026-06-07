import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../theme/theme';
import { getAuth, deleteUser, signOut } from 'firebase/auth';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ScreenHeader from '../components/ScreenHeader';

export default function IndividualProfileScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) {
          setLoading(false);
          return;
        }

        const ref = doc(db, 'users', uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setUserData({ ...snap.data(), role: 'users' });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleEditProfile = () => {
    if (!userData) return;
    const uid = auth.currentUser?.uid;
    navigation.navigate('Signup', {
      role: 'Individual',
      edit: true,
      profileData: userData,
      userId: uid,
    });
  };

  const handleDeleteProfile = () => {
    if (!userData) return;

    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const uid = auth.currentUser?.uid;
              if (!uid) {
                throw new Error('No authenticated user found.');
              }

              await deleteDoc(doc(db, userData.role, uid));

              if (auth.currentUser) {
                await deleteUser(auth.currentUser);
              }

              Alert.alert('Deleted', 'Account deleted successfully.');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              });
            } catch (error) {
              console.error('Delete profile error:', error);
              try {
                if (auth.currentUser) {
                  await signOut(auth);
                }
              } catch (signOutError) {
                console.error('Error signing out after failed delete:', signOutError);
              }
              Alert.alert('Error', 'Could not delete account. Please try again.');
            }
          },
        },
      ],
    );
  };

  // Simple progress calculation
  const calculateCompletion = () => {
    if (!userData) return 0;
    const fields = [
      userData.firstName,
      userData.lastName,
      userData.profession,
      userData.phone,
      userData.address,
      userData.bio,
      userData.cvUploaded,
      userData.certUploaded,
      userData.idUploaded,
    ];
    const filled = fields.filter(f => f && f !== '').length;
    return filled / fields.length;
  };

  const ProgressBar = ({ progress }) => (
    <View style={{ height: 12, backgroundColor: '#444', borderRadius: 6 }}>
      <View
        style={{
          width: `${progress * 100}%`,
          height: 12,
          backgroundColor: colors.accent,
          borderRadius: 6,
        }}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <ScreenHeader title="My Profile" navigation={navigation} />
      {/* Header row with icons */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>My Profile</Text>
        <View style={styles.iconRow}>
          <TouchableOpacity onPress={handleEditProfile}>
            <Icon name="edit" size={26} color={colors.accent} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDeleteProfile}>
            <Icon name="delete" size={26} color="red" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile completion bar */}
      {userData && (
        <View style={styles.progressContainer}>
          <Text style={styles.label}>Profile Completion</Text>
          <ProgressBar progress={calculateCompletion()} />
          <Text style={styles.label}>
            {Math.round(calculateCompletion() * 100)}% complete
          </Text>
        </View>
      )}

      {userData ? (
        <>
          <Text style={styles.label}>
            Name: {userData.firstName || ''} {userData.lastName || ''}
          </Text>
          <Text style={styles.label}>
            Email: {auth.currentUser?.email || 'Not specified'}
          </Text>
          <Text style={styles.label}>
            Phone: {userData.phone || 'Not specified'}
          </Text>
          <Text style={styles.label}>
            Address: {userData.address || 'Not specified'}
          </Text>
          <Text style={styles.label}>
            Profession: {userData.profession || 'Not specified'}
          </Text>
          <Text style={styles.label}>
            Bio: {userData.bio || 'Not specified'}
          </Text>

          {/* Uploads Section */}
          <Text style={[styles.label, { marginTop: 15 }]}>Uploads</Text>
          <Text style={styles.label}>
            CV: {userData.cvUploaded ? '✅ Uploaded' : '❌ Missing'}
          </Text>
          <Text style={styles.label}>
            Certificates: {userData.certUploaded ? '✅ Uploaded' : '❌ Missing'}
          </Text>
          <Text style={styles.label}>
            ID Copy: {userData.idUploaded ? '✅ Uploaded' : '❌ Missing'}
          </Text>
        </>
      ) : (
        <Text style={styles.label}>No profile data found</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.primary },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.accent },
  iconRow: { flexDirection: 'row', gap: 15 },
  label: { color: '#fff', marginTop: 10, fontSize: 16 },
  progressContainer: { marginVertical: 15 },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 10,
    marginVertical: 8,
    borderRadius: 6,
  },
  saveBtn: {
    backgroundColor: colors.accent,
    padding: 12,
    borderRadius: 6,
    marginTop: 10,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: 'bold' },
});
