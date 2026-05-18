import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/theme';
import { getAuth } from 'firebase/auth';
import ScreenHeader from '../components/ScreenHeader';

export default function CompanyDashboardScreen({ navigation }) {
  const auth = getAuth();
  const loggedInCompanyId = auth.currentUser?.uid;

  const DashboardButton = ({ title, onPress }) => (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="Company Dashboard" navigation={navigation} showBack={false} />

      <DashboardButton
        title="Profile"
        onPress={() =>
          navigation.navigate('CProfile', { companyId: loggedInCompanyId })
        }
      />

      <DashboardButton
        title="Available Tenders"
        onPress={() => navigation.navigate('Tenders')}
      />

      <DashboardButton
        title="Interaction History"
        onPress={() => navigation.navigate('History')}
      />
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
    marginBottom: 40 
  },
  button: { 
    backgroundColor: colors.accent, 
    paddingVertical: 15, 
    paddingHorizontal: 30, 
    borderRadius: 12, 
    marginVertical: 10, 
    width: '80%', 
    alignItems: 'center', 
    elevation: 3 
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: '600' 
  },
});
