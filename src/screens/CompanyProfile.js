import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../theme/theme';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import ScreenHeader from '../components/ScreenHeader';

export default function CompanyProfile({ route, navigation }) {
  // Expecting companyId (doc ID) passed via navigation
  
  const { companyId } = route.params || {};
if (!companyId) {
  return <Text>No company ID provided</Text>;
}

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const docRef = doc(db, 'company_users', companyId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCompany({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error fetching company profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [companyId]);

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
    <View style={styles.container}>
      <ScreenHeader title="Company Profile" navigation={navigation} />
      <Text style={styles.title}>{company.companyId}</Text>
      <Text style={styles.detail}>Registration No: {company.companyReg}</Text>
      <Text style={styles.detail}>Email: {company.email}</Text>
      {company.department && (
        <Text style={styles.detail}>Department: {company.department}</Text>
      )}
      {company.organName && (
        <Text style={styles.detail}>Organ: {company.organName}</Text>
      )}
      {company.createdAt && company.createdAt.seconds && (
        <Text style={styles.detail}>
          Created: {new Date(company.createdAt.seconds * 1000).toDateString()}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.primary },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.accent, marginBottom: 20 },
  detail: { fontSize: 16, color: colors.text, marginBottom: 10 },
  error: { fontSize: 18, color: 'red' },
});
