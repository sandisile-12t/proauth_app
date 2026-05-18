import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import individualProfileScreen from '../screens/individualProfileScreen';
import InteractionHistoryScreen from '../screens/InteractionHistoryScreen';
import ApproveDeclineScreen from '../screens/ApproveDeclineScreen';

const Tab = createBottomTabNavigator();

export default function IndividualDashboard() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = 'home-outline';
          else if (route.name === 'Profile') iconName = 'person-circle-outline';
          else if (route.name === 'Requests') iconName = 'document-text-outline';
          else if (route.name === 'History') iconName = 'time-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Profile" component={individualProfileScreen} />
      <Tab.Screen name="Requests" component={ApproveDeclineScreen} options={{ title: 'Requests' }}/>
      <Tab.Screen name="History" component={InteractionHistoryScreen} />
    </Tab.Navigator>
  );
}
