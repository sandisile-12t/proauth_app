import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { colors } from '../theme/theme';
import { getAuth, deleteUser, signOut } from 'firebase/auth';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import ScreenHeader from '../components/ScreenHeader';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function CompanyProfile({ route, navigation }) {
  const { companyId } = route.params || {};
  if (!companyId) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>No company ID provided</Text>
      </View>
    );
  }

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const docRef = doc(db, 'company_users', companyId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCompany({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error('Error fetching company profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [companyId]);

  const handleEditProfile = () => {
    if (!company) {
      Alert.alert('Loading', 'Please wait while your profile is loading...');
      return;
    }
    navigation.navigate('Signup', {
      role: 'Company',
      edit: true,
      profileData: company,
      companyId: company.id,
    });
  };

  const handleDeleteProfile = () => {
    console.log('Delete company button pressed for:', companyId);
    
    if (!companyId) {
      Alert.alert('Error', 'No company ID found.');
      return;
    }

    Alert.alert(
      'Delete Company Account',
      'Are you sure you want to delete this company account? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete from Firestore
              await deleteDoc(doc(db, 'company_users', companyId));
              console.log('Deleted company from Firestore');

              // Delete from Firebase Auth if same user
              if (auth.currentUser?.uid === companyId) {
                await deleteUser(auth.currentUser);
                console.log('Deleted auth user');
              }

              Alert.alert('Deleted', 'Company account deleted successfully.');
              navigation.navigate('Home');
            } catch (error) {
              console.error('Error deleting company profile:', error);
              try {
                if (auth.currentUser) {
                  await signOut(auth);
                }
              } catch (signOutError) {
                console.error('Error signing out after failed delete:', signOutError);
              }
              Alert.alert(
                'Error',
                'Could not delete the company account. You have been signed out for security reasons.',
              );
              navigation.navigate('Home');
            }
          },
        },
      ],
    );
  };

  const getInitials = () => {
    if (!company?.companyName) return '?';
    const words = company.companyName.split(' ');
    return words.map(w => w[0]).join('').substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!company) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.error}>Company not found</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <ScreenHeader title="Company Profile" navigation={navigation} />

      {/* Header Card with Logo/Avatar */}
      <View style={styles.headerCard}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>{getInitials()}</Text>
          </View>
        </View>

        <Text style={styles.companyName}>{company.companyName || company.companyId}</Text>
        <Text style={styles.companyType}>
          {company.department || company.organName || 'Organization'}
        </Text>

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

      {/* Registration & Contact Information Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Registration Information</Text>
        <View style={styles.infoRow}>
          <Icon name="business" size={20} color={colors.accent} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Company Name</Text>
            <Text style={styles.infoValue}>{company.companyName || 'Not specified'}</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Icon name="assignment" size={20} color={colors.accent} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Registration Number</Text>
            <Text style={styles.infoValue}>{company.companyReg || 'Not specified'}</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Icon name="email" size={20} color={colors.accent} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{company.email || 'Not specified'}</Text>
          </View>
        </View>
      </View>

      {/* Organization Details Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Organization Details</Text>
        {company.department ? (
          <View style={styles.infoField}>
            <Text style={styles.fieldLabel}>Department</Text>
            <Text style={styles.fieldValue}>{company.department}</Text>
          </View>
        ) : null}
        {company.organName ? (
          <View style={styles.infoField}>
            <Text style={styles.fieldLabel}>Organization</Text>
            <Text style={styles.fieldValue}>{company.organName}</Text>
          </View>
        ) : null}
        {company.createdAt && company.createdAt.seconds ? (
          <View style={styles.infoField}>
            <Text style={styles.fieldLabel}>Created Date</Text>
            <View style={styles.dateRow}>
              <Icon name="event" size={16} color={colors.accent} />
              <Text style={styles.fieldValue}>
                {new Date(company.createdAt.seconds * 1000).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      {/* Status Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account Status</Text>
        <View style={styles.statusContainer}>
          <View style={styles.statusIndicator}>
            <Icon name="check-circle" size={24} color={colors.success} />
          </View>
          <View>
            <Text style={styles.statusTitle}>Active Account</Text>
            <Text style={styles.statusDescription}>Your company account is active and verified</Text>
          </View>
        </View>
      </View>

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
  logoContainer: {
    marginBottom: 16,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.accent,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.accent,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  companyType: {
    fontSize: 14,
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
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
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 12,
    backgroundColor: colors.success + '10',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  statusIndicator: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.success + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  statusDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  error: {
    fontSize: 16,
    color: colors.error,
    fontWeight: '500',
  },
});

