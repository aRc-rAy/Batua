/**
 * SpendBook App
 * Professional payment tracking app with analytics
 *
 * @format
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

function App(): React.JSX.Element {
  return (
    <ThemeProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <AppNavigator />
    </ThemeProvider>
  );
}

export default App;
