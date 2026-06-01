import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import your screens
import HomePageScreen from '../screens/HomePageScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';  
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import InteractionHistoryScreen from '../screens/InteractionHistoryScreen';


// Individual
import individualdashboard from '../screens/individualdashboard';
import individualProfileScreen from '../screens/individualProfileScreen';
import ApproveDeclineScreen from '../screens/ApproveDeclineScreen';


// Company
import CompanyDashboardScreen from '../screens/CompanyDashboardScreen';
import RequestPermissionScreen from '../screens/RequestPermissionScreen';
import CompanyProfile from '../screens/CompanyProfile';
import AvailableTenders from '../screens/AvailableTenders';

// Organ
import OrganOfStateDashboard from '../screens/OrganOfStateDashboard';
import PostTenders from '../screens/PostTenders';
import PostTenderHistoryScreen from '../screens/PostTenderHistoryScreen';
import OrganProfile from '../screens/OrganProfile';

const Stack = createStackNavigator();
const linking = {
  prefixes: [],
  config: {
    screens: {
      Home: '',
      Login: 'login',
      Signup: 'signup',
      ForgotPassword: 'forgot-password',
      Dashboard: 'dashboard',
      Profile: 'profile',
      Requests: 'requests',
      CompanyDashboard: 'company',
      CProfile: 'company-profile',
      Employees: 'employees',
      Tenders: 'tenders',
      OrganofStateDashboard: 'organ',
      PostTenders: 'post-tenders',
      PostTenderHistory: 'post-tender-history',
      OrganProfile: 'organ-profile',
      History: 'history',
    },
  },
};

export default function AppNavigator() {
  
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        {/* Auth */}
        <Stack.Screen name="Home" component={HomePageScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

        {/* Individual */}
        <Stack.Screen name="Dashboard" component={individualdashboard} />
        <Stack.Screen name="Profile" component={individualProfileScreen} />
        <Stack.Screen name="Requests" component={ApproveDeclineScreen} />

        {/* Company */}
        <Stack.Screen name="CompanyDashboard" component={CompanyDashboardScreen} />
        <Stack.Screen name="CProfile" component={CompanyProfile} />
        <Stack.Screen name="Employees" component={RequestPermissionScreen} />
        <Stack.Screen name="Tenders" component={AvailableTenders} />

        {/* Organ */}
        <Stack.Screen name="OrganofStateDashboard" component={OrganOfStateDashboard} />
        <Stack.Screen name="PostTenders" component={PostTenders} />
        <Stack.Screen name="PostTenderHistory" component={PostTenderHistoryScreen} /> 
        <Stack.Screen name="OrganProfile" component={OrganProfile} />

        {/* Interaction History */}
        <Stack.Screen name="History" component={InteractionHistoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
