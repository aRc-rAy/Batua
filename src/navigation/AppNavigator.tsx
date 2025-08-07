import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AddPaymentScreen from '../screens/AddPaymentScreen';
import EditPaymentScreen from '../screens/EditPaymentScreen';
import { TabParamList, RootStackParamList } from '../types';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

// Simple emoji icons that work everywhere
const renderHomeIcon = ({ color }: { color: string }) => (
  <Text style={[styles.tabIcon, { color }]}>🏠</Text>
);
const renderHistoryIcon = ({ color }: { color: string }) => (
  <Text style={[styles.tabIcon, { color }]}>📋</Text>
);
const renderAnalyticsIcon = ({ color }: { color: string }) => (
  <Text style={[styles.tabIcon, { color }]}>📊</Text>
);
const renderSettingsIcon = ({ color }: { color: string }) => (
  <Text style={[styles.tabIcon, { color }]}>⚙️</Text>
);

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2980b9',
        tabBarInactiveTintColor: '#95a5a6',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e1e8ed',
          borderTopWidth: 1,
          paddingTop: 5,
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: -2,
          paddingVertical: 1,
          lineHeight: 15,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: renderHomeIcon,
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: renderHistoryIcon,
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          tabBarLabel: 'Analytics',
          tabBarIcon: renderAnalyticsIcon,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: renderSettingsIcon,
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen 
          name="AddPayment" 
          component={AddPaymentScreen}
          options={{
            headerShown: true,
            headerTitle: '',
            headerStyle: {
              backgroundColor: '#f8f9fa',
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTintColor: '#2c3e50',
          }}
        />
        <Stack.Screen 
          name="EditPayment" 
          component={EditPaymentScreen}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabIcon: {
    fontSize: 20,
  },
});

export default AppNavigator;
