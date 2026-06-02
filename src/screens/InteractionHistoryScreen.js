import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/theme';
import { collection, query, where, onSnapshot, getDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getAuth } from 'firebase/auth';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
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
      const companyId = (decision.companyId || '').toString();
      const companyName = (decision.companyName || '').toString().trim();
      const tenderId = (decision.tenderId || '').toString();
      const tenderNumber = (decision.tenderNumber || '').toString().trim();
      const groupKey = `${companyId || companyName}::${tenderId || tenderNumber}`;

      if (!groups[groupKey]) {
        groups[groupKey] = {
          id: groupKey,
          companyId: companyId || null,
          companyName: companyName || decision.companyName || 'N/A',
          tenderId: tenderId || null,
          tenderNumber: tenderNumber || decision.tenderNumber || 'N/A',
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

  const PDF_DOWNLOAD_URL = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

  const handleDownloadGroup = async (group) => {
    const html = `
      <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            h1 { color: #0a4a8d; margin-bottom: 12px; }
            h2 { color: #333; margin-top: 24px; margin-bottom: 8px; }
            .person { border: 1px solid #ddd; border-radius: 8px; padding: 12px; margin-bottom: 12px; }
            .label { font-weight: 700; }
          </style>
        </head>
        <body>
          <h1>Tender Interaction</h1>
          <div>
            <div><span class="label">Company:</span> ${group.companyName || 'N/A'}</div>
            <div><span class="label">Tender:</span> ${group.tenderNumber || 'N/A'}</div>
            <div><span class="label">Description:</span> ${group.tenderDescription || 'N/A'}</div>
            <div><span class="label">Closing Date:</span> ${group.tenderClosingDate || 'N/A'}</div>
          </div>
          <h2>Requested Professionals</h2>
          ${group.personnel.map((person, index) => {
            const individual = person.individual || {};
            const createdAt = person.createdAt?.seconds
              ? new Date(person.createdAt.seconds * 1000).toLocaleString()
              : person.createdAt
                ? new Date(person.createdAt).toLocaleString()
                : 'N/A';
            return `
              <div class="person">
                <div><span class="label">#${index + 1}</span></div>
                <div><span class="label">Name:</span> ${individual.firstName ? `${individual.firstName} ${individual.lastName || ''}`.trim() : 'N/A'}</div>
                <div><span class="label">Profession:</span> ${individual.profession || 'N/A'}</div>
                <div><span class="label">Email:</span> ${individual.email || 'N/A'}</div>
                <div><span class="label">Decision:</span> ${person.decision || 'N/A'}</div>
                <div><span class="label">Date:</span> ${createdAt}</div>
              </div>
            `;
          }).join('')}
        </body>
      </html>
    `;

    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
          throw new Error('Unable to open print window');
        }
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        return;
      }

      // Generate PDF from HTML
      const { uri: tempUri } = await Print.printToFileAsync({ html });

      // Create filename with company and tender info
      const filename = `Tender_${group.tenderNumber || 'interaction'}_${group.companyName || 'company'}_${Date.now()}.pdf`.replace(/[^a-zA-Z0-9._-]/g, '_');

      // Save to app's document directory
      const documentsDir = FileSystem.documentDirectory;
      const filePath = `${documentsDir}${filename}`;

      // Copy PDF to permanent location
      await FileSystem.copyAsync({
        from: tempUri,
        to: filePath,
      });

      // Show confirmation and option to share
      Alert.alert('Download Complete', `PDF saved as: ${filename}`, [
        {
          text: 'OK',
          onPress: () => {},
        },
        {
          text: 'Share File',
          onPress: async () => {
            await Sharing.shareAsync(filePath, {
              mimeType: 'application/pdf',
              dialogTitle: 'Share interaction PDF',
            });
          },
        },
      ]);
    } catch (error) {
      console.error('Download failed:', error);
      Alert.alert('Download failed', 'Unable to generate or save the PDF file.');
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
                group.personnel.map((person) => deleteDoc(doc(db, 'approval_decisions', person.id)))
              );
              setDecisions((prevDecisions) =>
                prevDecisions.filter((d) => !group.personnel.some((p) => p.id === d.id))
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
        <ScrollView
          style={styles.list}
          contentContainerStyle={[styles.listContent, styles.listContentContainer]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
        >
          {groupedDecisions.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.company}>Company: {item.companyName || 'N/A'}</Text>
              <Text style={styles.detail}>Tender: {item.tenderNumber || 'N/A'}</Text>
              <Text style={styles.detail}>Description: {item.tenderDescription || 'No description'}</Text>
              <Text style={styles.detail}>Closing Date: {item.tenderClosingDate || 'N/A'}</Text>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.iconButton]}
                  onPress={() => handleDownloadGroup(item)}
                  accessibilityLabel="Download PDF"
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
                  const createdAt = person.createdAt?.seconds
                    ? new Date(person.createdAt.seconds * 1000).toLocaleString()
                    : person.createdAt
                      ? new Date(person.createdAt).toLocaleString()
                      : 'N/A';
                  return (
                    <View key={person.id} style={styles.personRow}>
                      <Text style={styles.personDetail}>
                        Name: {individual ? `${individual.firstName} ${individual.lastName || ''}`.trim() : 'N/A'}
                      </Text>
                      <Text style={styles.personDetail}>
                        Profession: {individual?.profession || 'N/A'}
                      </Text>
                      <Text style={styles.personDetail}>
                        Email: {individual?.email || 'N/A'}
                      </Text>
                      <Text style={[styles.personDetail, styles.personStatus]}>
                        Decision: {person.decision || 'N/A'}
                      </Text>
                      {person.createdAt && (
                        <Text style={styles.personDetail}>
                          Date: {createdAt}
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
          <View style={styles.listFooter} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary, padding: 20, height: Platform.select({ web: '100vh', default: 'auto' }) },
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
    width: '100%',
  },
  listContent: {
    paddingBottom: 20,
  },
  listContentContainer: {
    flexGrow: 1,
  },
  listFooter: {
    height: 40,
  },
});