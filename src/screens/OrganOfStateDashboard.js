import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/theme';
import ScreenHeader from '../components/ScreenHeader';
import { Ionicons } from '@expo/vector-icons';
import { getAuth, signOut } from 'firebase/auth';

export default function OrganDashboardScreen({ navigation }) {
  const auth = getAuth();
  const sampleTenderId = 'abc123';

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    }
  };

  const Card = ({ icon, title, onPress }) => (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.iconWrap}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="Organ Dashboard" />

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>Manage tenders and view interactions</Text>

      <View style={styles.grid}>
        <Card
          icon={<Ionicons name="person" size={28} color={colors.accent} />}
          title="Profile"
          onPress={() => navigation.navigate('OrganProfile')}
        />

        <Card
          icon={<Ionicons name="add-circle" size={28} color={colors.accent} />}
          title="Post Tender"
          onPress={() => navigation.navigate('PostTenders')}
        />

        <Card
          icon={<Ionicons name="time" size={28} color={colors.accent} />}
          title="Interactions"
          onPress={() => navigation.navigate('History', { tenderId: sampleTenderId })}
        />

        <Card
          icon={<Ionicons name="list" size={28} color={colors.accent} />}
          title="Tender History"
          onPress={() => navigation.navigate('PostTenderHistory')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
  subtitle: { color: '#fff', fontSize: 18, marginTop: 14, marginLeft: 16 },
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
    elevation: 3,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  actionRow: { paddingHorizontal: 16, marginTop: 16, alignItems: 'flex-end' },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  logoutText: { color: '#fff', fontWeight: '700', marginLeft: 8 },
});
