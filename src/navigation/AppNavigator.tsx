import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import LoginCompanyScreen from '../screens/LoginCompanyScreen';
import LoginIndividualScreen from '../screens/LoginIndividualScreen';
import SignupCompanyScreen from '../screens/SignupCompanyScreen';
import SignupIndividualScreen from '../screens/SignupIndividualScreen';
import ApproveDeclineScreen from '../screens/ApproveDeclineScreen';
import HomeScreen from '../screens/HomeScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationScreen from '../screens/NotificationScreen';
import RequestPermissionScreen from '../screens/RequestPermissionScreen';
import UserDashboardScreen from '../screens/UserDashboardScreen';
import CompanyDashboardScreen from '../screens/CompanyDashboardScreen';
import UploadDocumentsScreen from '../screens/UploadDocumentsScreen';
import UserPermissionResponseScreen from '../screens/UserPermissionResponseScreen';
import InteractionHistoryScreen from '../screens/InteractionHistoryScreen';
import UnknownRouteScreen from '../screens/UnknownRouteScreen';

export type RootStackParamList = {
  RoleSelection: undefined;
  LoginCompany: undefined;
  LoginIndividual: undefined;
  SignupCompany: undefined;
  SignupIndividual: undefined;
  ApproveDecline: {
    companyName?: string;
    bidNumber?: string;
    bidDescription?: string;
  };
  Home: undefined;
  ForgotPassword: undefined;
  Profile: undefined;
  Notifications: undefined;
  RequestPermission: undefined;
  UserDashboard: undefined;
  CompanyDashboard: undefined;
  UploadDocuments: undefined;
  UserPermissionResponse: undefined;
  InteractionHistory: undefined;
  UnknownRoute: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="RoleSelection"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
        <Stack.Screen name="LoginCompany" component={LoginCompanyScreen} />
        <Stack.Screen name="LoginIndividual" component={LoginIndividualScreen} />
        <Stack.Screen name="SignupCompany" component={SignupCompanyScreen} />
        <Stack.Screen name="SignupIndividual" component={SignupIndividualScreen} />
        <Stack.Screen name="ApproveDecline" component={ApproveDeclineScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Notifications" component={NotificationScreen} />
        <Stack.Screen name="RequestPermission" component={RequestPermissionScreen} />
        <Stack.Screen name="UserDashboard" component={UserDashboardScreen} />
        <Stack.Screen name="CompanyDashboard" component={CompanyDashboardScreen} />
        <Stack.Screen name="UploadDocuments" component={UploadDocumentsScreen} />
        <Stack.Screen name="UserPermissionResponse" component={UserPermissionResponseScreen} />
        <Stack.Screen name="InteractionHistory" component={InteractionHistoryScreen} />
        <Stack.Screen name="UnknownRoute" component={UnknownRouteScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;