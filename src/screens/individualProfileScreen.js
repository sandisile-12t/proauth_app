import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { colors } from '../theme/theme';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as DocumentPicker from 'expo-document-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';


export default function IndividualProfileScreen() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
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

  const handleSaveProfile = async () => {
    try {
      if (!userData) return;
      const uid = auth.currentUser?.uid;
      const ref = doc(db, userData.role, uid);

      await updateDoc(ref, {
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        profession: userData.profession || '',
        phone: userData.phone || '',
        address: userData.address || '',
        bio: userData.bio || '',
      });

      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Could not update profile');
    }
  };

// Upload handler
const handleUpload = async (type) => {
  try {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
    if (result.canceled) return;

    const file = result.assets[0];
    const uid = auth.currentUser?.uid;
    const storage = getStorage();
    const storageRef = ref(storage, `uploads/${uid}/${type}-${file.name}`);

    // Upload file
    const response = await fetch(file.uri);
    const blob = await response.blob();
    await uploadBytes(storageRef, blob);

    // Get download URL
    const url = await getDownloadURL(storageRef);

    // Save metadata in Firestore
    const refDoc = doc(db, userData.role, uid);
    await updateDoc(refDoc, {
      [`${type}Uploaded`]: true,
      [`${type}Url`]: url,
    });

    Alert.alert('Success', `${type.toUpperCase()} uploaded successfully`);
    setUserData({ ...userData, [`${type}Uploaded`]: true, [`${type}Url`]: url });
  } catch (error) {
    console.error('Upload error:', error);
    Alert.alert('Error', `Could not upload ${type}`);
  }
};

  const handleDeleteProfile = async () => {
    try {
      if (!userData) return;
      const uid = auth.currentUser?.uid;
      const ref = doc(db, userData.role, uid);

      await deleteDoc(ref);
      setUserData(null);
      Alert.alert('Deleted', 'Profile deleted successfully');
    } catch (error) {
      Alert.alert('Error', 'Could not delete profile');
    }
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
    <View style={styles.container}>
      {/* Header row with icons */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>My Profile</Text>
        <View style={styles.iconRow}>
          <TouchableOpacity onPress={() => setEditing(!editing)}>
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
          {editing ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="First Name"
                placeholderTextColor="#ccc"
                value={userData.firstName}
                onChangeText={text => setUserData({ ...userData, firstName: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Last Name"
                placeholderTextColor="#ccc"
                value={userData.lastName}
                onChangeText={text => setUserData({ ...userData, lastName: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Profession"
                placeholderTextColor="#ccc"
                value={userData.profession}
                onChangeText={text => setUserData({ ...userData, profession: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor="#ccc"
                value={userData.phone}
                onChangeText={text => setUserData({ ...userData, phone: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Address"
                placeholderTextColor="#ccc"
                value={userData.address}
                onChangeText={text => setUserData({ ...userData, address: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Short Bio"
                placeholderTextColor="#ccc"
                value={userData.bio}
                onChangeText={text => setUserData({ ...userData, bio: text })}
              />
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile}>
                <Text style={styles.saveText}>Save Changes</Text>
              </TouchableOpacity>
            </>
          ) : (
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
          )}
        </>
      ) : (
        <Text style={styles.label}>No profile data found</Text>
      )}
    </View>
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
