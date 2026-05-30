import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Share, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/theme';
import { collection, query, where, onSnapshot, getDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getAuth } from 'firebase/auth';
import ScreenHeader from '../components/ScreenHeader';

export default function InteractionHistoryScreen({ navigation }) {
  const auth = getAuth();
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const normalizedRole = userRole ? userRole.toLowerCase() : null;
  const [tenderCount, setTenderCount] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [individualDetails, setIndividualDetails] = useState({});

  const groupedDecisions = useMemo(() => {
    const groups = {};

    decisions.forEach((decision) => {
      const groupKey = decision.tenderId
        ? `${decision.companyId || 'unknown'}_${decision.tenderId}`
        : `${decision.companyId || 'unknown'}_${decision.tenderNumber || decision.id}`;

      if (!groups[groupKey]) {
        groups[groupKey] = {
          id: groupKey,
          companyName: decision.companyName || 'N/A',
          tenderNumber: decision.tenderNumber || 'N/A',
          tenderDescription: decision.tenderDescription || 'No description',
          tenderClosingDate: decision.tenderClosingDate || 'N/A',
          personnel: [],
        };
      }

      groups[groupKey].personnel.push({
        id: decision.id,
        decision: decision.decision || 'N/A',
        createdAt: decision.createdAt,
        individual: individualDetails[decision.individualId] || null,
      });
    });

    return Object.values(groups);
  }, [decisions, individualDetails]);

  const handleShareGroup = async (group) => {
    const lines = [
      `Company: ${group.companyName}`,
      `Tender: ${group.tenderNumber}`,
      `Description: ${group.tenderDescription}`,
      `Closing Date: ${group.tenderClosingDate}`,
      '',
      'Requested Professionals:',
      ...group.personnel.flatMap((person, index) => {
        const individual = person.individual;
        return [
          `#${index + 1}`,
          `Name: ${individual ? `${individual.firstName} ${individual.lastName}` : 'N/A'}`,
          `Profession: ${individual?.profession || 'N/A'}`,
          `Email: ${individual?.email || 'N/A'}`,
          `Decision: ${person.decision}`,
          `Date: ${person.createdAt?.seconds
            ? new Date(person.createdAt.seconds * 1000).toLocaleString()
            : person.createdAt
              ? new Date(person.createdAt).toLocaleString()
              : 'N/A'}`,
          '',
        ];
      }),
    ];

    try {
      await Share.share({
        title: `Tender ${group.tenderNumber}`,
        message: lines.join('\n'),
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleDeleteGroup = (group) => {
    Alert.alert(
      'Delete card',
      'Are you sure you want to delete this card and all related decisions?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await Promise.all(
                group.personnel.map((person) =>
                  deleteDoc(doc(db, 'approval_decisions', person.id))
                )
              );
              setDecisions((prevDecisions) =>
                prevDecisions.filter(
                  (decision) => !group.personnel.some((person) => person.id === decision.id)
                )
              );
              setStatusMessage('Card deleted successfully.');
            } catch (error) {
              console.error('Failed to delete card:', error);
              Alert.alert('Deletion failed', 'Unable to delete this card. Please try again.');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    const fetchRole = async () => {
      const user = auth.currentUser;
      if (!user) return;
      
      // ✅ Check users collection first
      let userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserRole(String(userDoc.data().role || '').trim());
        return;
      }
      
      // ✅ Check company_users collection
      userDoc = await getDoc(doc(db, 'company_users', user.uid));
      if (userDoc.exists()) {
        setUserRole(String(userDoc.data().role || '').trim());
        return;
      }
      
      // ✅ Check organ collection
      userDoc = await getDoc(doc(db, 'organ', user.uid));
      if (userDoc.exists()) {
        setUserRole(String(userDoc.data().role || '').trim());
        return;
      }
    };
    fetchRole();
  }, [auth.currentUser?.uid]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user || !userRole) {
      setLoading(false);
      return;
    }

    let unsub;
    
    const fetchIndividualDetails = async (individualId) => {
      if (!individualId || individualDetails[individualId]) return;
      try {
        const indDoc = await getDoc(doc(db, 'users', individualId));
        if (indDoc.exists()) {
          setIndividualDetails(prev => ({
            ...prev,
            [individualId]: indDoc.data()
          }));
        }
      } catch (error) {
        console.error('Error fetching individual details:', error);
      }
    };

    const handleSnapshot = (snapshot) => {
      const decisionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDecisions(decisionsData);
      setStatusMessage(decisionsData.length === 0 ? 'No interaction history found.' : '');
      
      // Fetch individual details for all decisions
      decisionsData.forEach(decision => {
        if (decision.individualId) {
          fetchIndividualDetails(decision.individualId);
        }
      });
      
      setLoading(false);
    };

    if (normalizedRole === 'individual') {
      // Show decisions made by this individual
      const q = query(collection(db, 'approval_decisions'), where('individualId', '==', user.uid));
      unsub = onSnapshot(q, handleSnapshot);
    } else if (normalizedRole === 'company') {
      // Show decisions on tenders posted by this company (where companyId matches the user's UID)
      const q = query(collection(db, 'approval_decisions'), where('companyId', '==', user.uid));
      unsub = onSnapshot(q, handleSnapshot);
    } else if (normalizedRole === 'organ' || normalizedRole === 'organofstate') {
      // Show all interactions/decisions on tenders posted by this organ
      const tendersQuery = query(collection(db, 'tenders'), where('organId', '==', user.uid));
      const decisionListeners = [];

      unsub = onSnapshot(tendersQuery, async (tenderSnap) => {
        const tenderIds = tenderSnap.docs.map(doc => doc.id);
        setTenderCount(tenderIds.length);

        if (tenderIds.length > 0) {
          setDecisions([]);
          setStatusMessage(`${tenderIds.length} tender(s) found. Loading decisions...`);

          for (let i = 0; i < tenderIds.length; i += 10) {
            const chunk = tenderIds.slice(i, i + 10);
            const decisionsQuery = query(
              collection(db, 'approval_decisions'),
              where('tenderId', 'in', chunk)
            );

            const decisionUnsub = onSnapshot(decisionsQuery, (snapshot) => {
              const chunkDecisions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

              chunkDecisions.forEach(decision => {
                if (decision.individualId) {
                  fetchIndividualDetails(decision.individualId);
                }
              });

              setDecisions(prevDecisions => {
                const combined = [...prevDecisions, ...chunkDecisions];
                const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
                setStatusMessage(unique.length === 0
                  ? `${tenderIds.length} tender(s) found, but no decisions yet.`
                  : `${tenderIds.length} tender(s) found, ${unique.length} decision(s) loaded.`);
                return unique;
              });
            });

            decisionListeners.push(decisionUnsub);
          }

          setLoading(false);
        } else {
          setDecisions([]);
          setStatusMessage('No tenders found for this organ account.');
          setLoading(false);
        }
      });

      return () => {
        if (unsub) unsub();
        decisionListeners.forEach(listener => listener());
      };
    }

    return () => unsub && unsub();
  }, [userRole, auth.currentUser?.uid]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Interaction History" navigation={navigation} />
      {groupedDecisions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.empty}>{statusMessage || 'No interaction history found.'}</Text>
          {normalizedRole === 'organ' && tenderCount > 0 && (
            <Text style={styles.hint}>Waiting for individuals to submit approvals...</Text>
          )}
        </View>
      ) : (
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={groupedDecisions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.company}>Company: {item.companyName || 'N/A'}</Text>
                <Text style={styles.detail}>Tender: {item.tenderNumber || 'N/A'}</Text>
                <Text style={styles.detail}>Description: {item.tenderDescription || 'No description'}</Text>
                <Text style={styles.detail}>Closing Date: {item.tenderClosingDate || 'N/A'}</Text>
                
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.iconButton]}
                    onPress={() => handleShareGroup(item)}
                    accessibilityLabel="Download card"
                  >
                    <Ionicons name="download-outline" size={22} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.iconButton, styles.deleteButton]}
                    onPress={() => handleDeleteGroup(item)}
                    accessibilityLabel="Delete card"
                  >
                    <Ionicons name="trash-outline" size={22} color="#fff" />
                  </TouchableOpacity>
                </View>

                <View style={styles.personnelSection}>
                  <Text style={styles.personnelTitle}>Requested Professionals</Text>
                {item.personnel.map((person) => {
                  const individual = person.individual;
                  return (
                    <View key={person.id} style={styles.personRow}>
                      <Text style={styles.personDetail}>
                        Name: {individual ? `${individual.firstName} ${individual.lastName}` : 'N/A'}
                      </Text>
                      <Text style={styles.personDetail}>
                        Profession: {individual?.profession || 'N/A'}
                      </Text>
                      <Text style={styles.personDetail}>
                        Email: {individual?.email || 'N/A'}
                      </Text>
                      <Text style={[styles.personDetail, styles.personStatus]}>
                        Decision: {person.decision}
                      </Text>
                      {person.createdAt && (
                        <Text style={styles.personDetail}>
                          Date: {person.createdAt?.seconds
                            ? new Date(person.createdAt.seconds * 1000).toLocaleString()
                            : new Date(person.createdAt).toLocaleString()}
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: colors.accent, marginBottom: 20, textAlign: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  empty: { color: '#fff', fontSize: 16, textAlign: 'center', marginTop: 20 },
  hint: { color: colors.accent, fontSize: 14, marginTop: 10, fontStyle: 'italic', textAlign: 'center' },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  company: { fontSize: 16, fontWeight: 'bold', color: colors.accent },
  detail: { fontSize: 14, color: '#333', marginTop: 4 },
  personnelSection: { 
    backgroundColor: '#f9f9f9', 
    padding: 12, 
    borderRadius: 8, 
    marginTop: 12, 
    borderLeftWidth: 3, 
    borderLeftColor: colors.accent 
  },
  personnelTitle: { fontSize: 14, fontWeight: '600', color: colors.accent, marginBottom: 8 },
  personRow: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  personDetail: {
    fontSize: 13,
    color: '#333',
    marginTop: 4,
  },
  personStatus: {
    fontWeight: 'bold',
    marginTop: 8,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  actionButton: {
    borderRadius: 10,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    width: 42,
    height: 42,
  },
  iconButton: {
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: '#d9534f',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
});
