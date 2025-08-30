import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Tab Icons
import HomeScreen from '../screens/HomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AddPaymentScreen from '../screens/AddPaymentScreen';
import EditPaymentScreen from '../screens/EditPaymentScreen';
import PaymentActionsScreen from '../screens/PaymentActionsScreen';
import { TabParamList, RootStackParamList } from '../types';
import { useTheme } from '../context/ThemeContext';
import { textStyles } from '../utils/typography';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

const TabNavigator: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName = '';
          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'History':
              iconName = focused ? 'time' : 'time-outline';
              break;
            case 'Analytics':
              iconName = focused ? 'bar-chart' : 'bar-chart-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
          }
          return <Ionicons name={iconName} size={22} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.tabInactive,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 0.5,
          height: 65,
          paddingBottom: 8,
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        },
        tabBarLabelStyle: {
          ...textStyles.caption,
          fontSize: 11,
          marginBottom: 4,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  const { theme } = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Main"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddPayment"
          component={AddPaymentScreen}
          options={{
            headerShown: true,
            headerTitle: 'Add Payment',
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: theme.colors.surface,
              shadowOpacity: 0,
              elevation: 0,
            },
            headerTitleStyle: {
              ...textStyles.heading,
              fontSize: 18,
              color: theme.colors.text,
            },
            headerTintColor: theme.colors.primary,
          }}
        />
        <Stack.Screen
          name="EditPayment"
          component={EditPaymentScreen}
          options={{
            headerShown: true,
            headerTitle: 'Edit Payment',
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: theme.colors.surface,
            },
            headerTitleStyle: {
              ...textStyles.heading,
              color: theme.colors.text,
            },
            headerTintColor: theme.colors.primary,
          }}
        />
        <Stack.Screen
          name="PaymentActions"
          component={PaymentActionsScreen}
          options={{
            headerShown: false,
            presentation: 'modal',
            gestureEnabled: true,
            cardStyleInterpolator: ({ current, layouts }) => ({
              cardStyle: {
                transform: [
                  {
                    translateY: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.height, 0],
                    }),
                  },
                ],
              },
            }),
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
