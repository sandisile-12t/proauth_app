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
    if (!userData) {
      Alert.alert('Loading', 'Please wait while your profile is loading...');
      return;
    }
    const uid = auth.currentUser?.uid;
    navigation.navigate('Signup', {
      role: 'Individual',
      edit: true,
      profileData: userData,
      userId: uid,
    });
  };

  const handleDeleteProfile = () => {
    const uid = auth.currentUser?.uid;
    console.log('Delete button pressed for user:', uid);
    
    if (!uid) {
      Alert.alert('Error', 'No authenticated user found.');
      return;
    }

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
              // Delete from Firestore
              await deleteDoc(doc(db, 'users', uid));
              console.log('Deleted from Firestore');

              // Delete from Firebase Auth
              if (auth.currentUser) {
                await deleteUser(auth.currentUser);
                console.log('Deleted auth user');
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

  const getInitials = () => {
    if (!userData) return '?';
    const first = userData.firstName?.[0] || '';
    const last = userData.lastName?.[0] || '';
    return (first + last).toUpperCase();
  };

  const StatusBadge = ({ uploaded, label }) => (
    <View style={[styles.statusBadge, uploaded ? styles.statusSuccess : styles.statusPending]}>
      <Icon
        name={uploaded ? 'check-circle' : 'error-outline'}
        size={16}
        color={uploaded ? colors.success : colors.warning}
      />
      <Text style={[styles.statusText, { color: uploaded ? colors.success : colors.warning }]}>
        {uploaded ? 'Uploaded' : 'Missing'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const completion = calculateCompletion();

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <ScreenHeader title="My Profile" navigation={navigation} />

      {/* Header Card with Avatar */}
      <View style={styles.headerCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials()}</Text>
          </View>
        </View>

        <Text style={styles.nameText}>
          {userData?.firstName} {userData?.lastName}
        </Text>
        <Text style={styles.roleText}>{userData?.profession || 'Professional'}</Text>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.editBtn, loading && styles.disabledBtn]}
            onPress={handleEditProfile}
            activeOpacity={0.7}
            disabled={loading}
          >
            <Icon name="edit" size={18} color={colors.surface} />
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.deleteBtn, loading && styles.disabledBtn]}
            onPress={handleDeleteProfile}
            activeOpacity={0.7}
            useForeground={true}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            disabled={loading}
          >
            <Icon name="delete" size={18} color={colors.surface} />
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      {userData ? (
        <>
          {/* Profile Completion Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Profile Completion</Text>
              <Text style={styles.completionPercent}>{Math.round(completion * 100)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${completion * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {Math.round(completion * 100) === 100
                ? '✓ Profile Complete!'
                : `Complete your profile to stand out`}
            </Text>
          </View>

          {/* Contact Information Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Contact Information</Text>
            <View style={styles.infoRow}>
              <Icon name="email" size={20} color={colors.accent} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{auth.currentUser?.email || 'Not specified'}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Icon name="phone" size={20} color={colors.accent} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{userData?.phone || 'Not specified'}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Icon name="location-on" size={20} color={colors.accent} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue}>{userData?.address || 'Not specified'}</Text>
              </View>
            </View>
          </View>

          {/* Professional Information Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Professional Information</Text>
            <View style={styles.infoField}>
              <Text style={styles.fieldLabel}>Profession</Text>
              <Text style={styles.fieldValue}>{userData?.profession || 'Not specified'}</Text>
            </View>
            <View style={styles.infoField}>
              <Text style={styles.fieldLabel}>Bio</Text>
              <Text style={styles.fieldValue}>
                {userData?.bio || 'No bio provided yet'}
              </Text>
            </View>
          </View>

          {/* Documents Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Documents</Text>
            <View style={styles.documentRow}>
              <View style={styles.documentInfo}>
                <Icon name="description" size={24} color={colors.accent} />
                <Text style={styles.documentLabel}>Curriculum Vitae</Text>
              </View>
              <StatusBadge uploaded={userData?.cvUploaded} label="CV" />
            </View>
            <View style={styles.documentRow}>
              <View style={styles.documentInfo}>
                <Icon name="school" size={24} color={colors.accent} />
                <Text style={styles.documentLabel}>Certificates</Text>
              </View>
              <StatusBadge uploaded={userData?.certUploaded} label="Cert" />
            </View>
            <View style={styles.documentRow}>
              <View style={styles.documentInfo}>
                <Icon name="card-membership" size={24} color={colors.accent} />
                <Text style={styles.documentLabel}>ID Document</Text>
              </View>
              <StatusBadge uploaded={userData?.idUploaded} label="ID" />
            </View>
          </View>
        </>
      ) : (
        <View style={styles.card}>
          <Text style={styles.noDataText}>No profile data found</Text>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 31, 63, 0.1)',
    elevation: 5,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.accent,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.accent,
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  roleText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  editBtnText: {
    color: colors.surface,
    fontWeight: '600',
    fontSize: 14,
  },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  deleteBtnText: {
    color: colors.surface,
    fontWeight: '600',
    fontSize: 14,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    boxShadow: '0px 1px 4px rgba(0, 31, 63, 0.1)',
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  completionPercent: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.accent,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  infoField: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  fieldLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  fieldValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    lineHeight: 20,
  },
  documentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  documentLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  statusSuccess: {
    backgroundColor: colors.success + '15',
  },
  statusPending: {
    backgroundColor: colors.warning + '15',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  noDataText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
});

