import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/theme';

export default function OrganDashboardScreen({ navigation }) {
  // Example: hardcoded tenderId for now. Replace with actual tender.id from Firestore.
  const sampleTenderId = 'abc123';

  const menuItems = [
    { title: 'Profile', route: 'OrganProfile' },
    { title: 'Post Tender', route: 'PostTenders' },
    { title: 'Interactions', route: 'History', params: { tenderId: sampleTenderId } },
    { title: 'History', route: 'PostTenderHistory' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Organ of State Dashboard</Text>
      <View style={styles.card}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.button}
            onPress={() => navigation.navigate(item.route, item.params)}
          >
            <Text style={styles.buttonText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: colors.primary, 
    padding: 20 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: colors.accent, 
    marginBottom: 20, 
    textAlign: 'center' 
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: 8,
    marginVertical: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.textOnAccent,
    fontSize: 16,
    fontWeight: '600',
  },
});
