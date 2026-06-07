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
    return <Text>No company ID provided</Text>;
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
    if (!company) return;
    navigation.navigate('Signup', {
      role: 'Company',
      edit: true,
      profileData: company,
      companyId: company.id,
    });
  };

  const handleDeleteProfile = () => {
    if (!company) return;

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
              await deleteDoc(doc(db, 'company_users', company.id));

              if (auth.currentUser?.uid === company.id) {
                await deleteUser(auth.currentUser);
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
        <Text style={styles.error}>Company not found</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <ScreenHeader title="Company Profile" navigation={navigation} />
      <View style={styles.headerRow}>
        <Text style={styles.title}>{company.companyName || company.companyId}</Text>
        <View style={styles.iconRow}>
          <TouchableOpacity onPress={handleEditProfile}>
            <Icon name="edit" size={26} color={colors.accent} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDeleteProfile}>
            <Icon name="delete" size={26} color="red" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.detail}>Registration No: {company.companyReg}</Text>
      <Text style={styles.detail}>Email: {company.email}</Text>
      {company.department && <Text style={styles.detail}>Department: {company.department}</Text>}
      {company.organName && <Text style={styles.detail}>Organ: {company.organName}</Text>}
      {company.createdAt && company.createdAt.seconds && (
        <Text style={styles.detail}>
          Created: {new Date(company.createdAt.seconds * 1000).toDateString()}
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.primary },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.accent,
    marginBottom: 20,
    flex: 1,
  },
  iconRow: { flexDirection: 'row', gap: 15 },
  detail: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
  },
  error: { fontSize: 18, color: 'red' },
});

