import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth, signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import ScreenHeader from '../components/ScreenHeader';
import { colors } from '../theme/theme';

export default function IndividualDashboard({ navigation }) {
  const auth = getAuth();
  const user = auth.currentUser;
  const userName = user?.displayName || user?.email?.split('@')[0] || 'User';

  const [pendingRequests, setPendingRequests] = useState(0);
  const [decisionsTotal, setDecisionsTotal] = useState(0);
  const [acceptedDecisions, setAcceptedDecisions] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const requestsQuery = query(
      collection(db, 'permission_requests'),
      where('individualIds', 'array-contains', user.uid),
      where('status', '==', 'Pending')
    );

    const decisionsQuery = query(
      collection(db, 'approval_decisions'),
      where('individualId', '==', user.uid)
    );

    const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
      setPendingRequests(snapshot.size);
    });

    const unsubscribeDecisions = onSnapshot(decisionsQuery, (snapshot) => {
      const allDecisions = snapshot.docs.map((doc) => doc.data());
      const accepted = allDecisions.filter((item) => item.decision === 'Accepted').length;
      setDecisionsTotal(allDecisions.length);
      setAcceptedDecisions(accepted);
      setLoading(false);
    });

    return () => {
      unsubscribeRequests();
      unsubscribeDecisions();
    };
  }, [user?.uid]);

  const responseRate = decisionsTotal > 0 ? Math.round((acceptedDecisions / decisionsTotal) * 100) : 0;

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    }
  };

  const ActionCard = ({ icon, title, subtitle, onPress }) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardIcon}>{icon}</View>
      <View style={styles.cardText}>
        <Text style={styles.cardTitle}>{title}</Text>
        {subtitle ? <Text style={styles.cardSubtitle}>{subtitle}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={22} color="#999" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.homeContainer, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.homeContainer} contentContainerStyle={styles.homeContent}>
      <ScreenHeader title="Individual Dashboard" />

      <View style={styles.heroHeader}>
        <View style={styles.heroTextBlock}>
          <Text style={styles.heroTitle}>Hello, {userName}</Text>
          <Text style={styles.heroSubtitle}>Your individual summary is ready. Review requests, activity, and quick actions.</Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={18} color="#fff" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsSection}>
        <Text style={styles.sectionHeading}>Your summary</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{pendingRequests}</Text>
            <Text style={styles.statLabel}>Pending Requests</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{decisionsTotal}</Text>
            <Text style={styles.statLabel}>Decisions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{responseRate}%</Text>
            <Text style={styles.statLabel}>Response Rate</Text>
          </View>
        </View>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionHeading}>Quick actions</Text>
        <ActionCard
          icon={<Ionicons name="person-circle" size={28} color={colors.accent} />}
          title="My Profile"
          subtitle="Update your personal details"
          onPress={() => navigation.navigate('Profile')}
        />
        <ActionCard
          icon={<Ionicons name="document-text" size={28} color={colors.accent} />}
          title="Pending Requests"
          subtitle="Review permissions assigned to you"
          onPress={() => navigation.navigate('Requests')}
        />
        <ActionCard
          icon={<Ionicons name="time" size={28} color={colors.accent} />}
          title="Interaction History"
          subtitle="See past approvals and responses"
          onPress={() => navigation.navigate('History')}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  homeContainer: { flex: 1, backgroundColor: colors.background, height: Platform.select({ web: '100vh', default: 'auto' }) },
  homeContent: { paddingBottom: 30 },
  loadingContainer: { justifyContent: 'center', alignItems: 'center' },
  heroHeader: { paddingHorizontal: 20, paddingTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroTextBlock: { flex: 1, paddingRight: 12 },
  heroTitle: { fontSize: 26, fontWeight: '800', color: colors.primary, marginBottom: 8 },
  heroSubtitle: { fontSize: 15, color: '#555', lineHeight: 22 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
  },
  logoutButtonText: { color: '#fff', marginLeft: 8, fontWeight: '700' },
  quickActions: { marginTop: 28, paddingHorizontal: 20 },
  sectionHeading: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 14 },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#f9f4e7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  cardSubtitle: { fontSize: 13, color: '#777', marginTop: 4 },
  statsSection: { marginTop: 24, paddingHorizontal: 20 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' },
  statCard: {
    backgroundColor: '#fff',
    width: '32%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.primary },
  statLabel: { fontSize: 12, color: '#777', marginTop: 6, textAlign: 'center' },
});

