/**
 * SpendBook App
 * Professional payment tracking app with analytics and SMS integration
 *
 * @format
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import { SMSService } from './src/services/SMSService';

function App(): React.JSX.Element {
  useEffect(() => {
    // Initialize SMS service when app starts
    SMSService.initialize().catch(error => {
      console.error('Failed to initialize SMS service:', error);
    });
  }, []);

  return (
    <ThemeProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <AppNavigator />
    </ThemeProvider>
  );
}

export default App;
