import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/theme';
import { getAuth } from 'firebase/auth';
import ScreenHeader from '../components/ScreenHeader';
import { Ionicons } from '@expo/vector-icons';

export default function CompanyDashboardScreen({ navigation }) {
  const auth = getAuth();
  const loggedInCompanyId = auth.currentUser?.uid;

  const Card = ({ icon, title, subtitle, onPress }) => (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.iconWrap}>{icon}</View>
      <View style={styles.cardText}>
        <Text style={styles.cardTitle}>{title}</Text>
        {subtitle ? <Text style={styles.cardSubtitle}>{subtitle}</Text> : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="Company Dashboard" navigation={navigation} showBack={false} />

      <Text style={styles.welcome}>Welcome, Company</Text>

      <View style={styles.grid}>
        <Card
          icon={<Ionicons name="person-circle" size={36} color={colors.accent} />}
          title="Profile"
          subtitle="Manage company details"
          onPress={() => navigation.navigate('CProfile', { companyId: loggedInCompanyId })}
        />

        <Card
          icon={<Ionicons name="briefcase" size={36} color={colors.accent} />}
          title="Available Tenders"
          subtitle="View and request"
          onPress={() => navigation.navigate('Tenders')}
        />

        <Card
          icon={<Ionicons name="time" size={36} color={colors.accent} />}
          title="Interaction History"
          subtitle="Approvals and responses"
          onPress={() => navigation.navigate('History')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
  welcome: { color: '#fff', fontSize: 20, fontWeight: '600', marginTop: 18, marginLeft: 16 },
  grid: { padding: 16, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    backgroundColor: colors.background,
    width: '48%',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  iconWrap: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  cardSubtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
});
