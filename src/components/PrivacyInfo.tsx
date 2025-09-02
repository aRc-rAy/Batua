import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity } from 'react-native';

export const PrivacyInfo: React.FC = () => {
  const openPrivacyPolicy = () => {
    // You can replace this with your actual hosted privacy policy URL
    Linking.openURL('https://github.com/aRc-rAy/Batua/blob/main/PRIVACY_POLICY.md');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🛡️ Your Privacy Matters</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Complete Privacy</Text>
        <Text style={styles.text}>
          • All data stored locally on your device only{'\n'}
          • No cloud storage or external data sharing{'\n'}
          • Works completely offline, no internet required{'\n'}
          • Zero data transmission to external servers
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Security</Text>
        <Text style={styles.text}>
          • All payment data stays on your device{'\n'}
          • You have full control over your data{'\n'}
          • Export to Excel for backup purposes{'\n'}
          • Manual tracking for complete control
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Features</Text>
        <Text style={styles.text}>
          • Manual expense entry with categories{'\n'}
          • Excel export for data portability{'\n'}
          • Analytics and spending insights{'\n'}
          • Dark mode support
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={openPrivacyPolicy}>
        <Text style={styles.buttonText}>View Full Privacy Policy</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2c3e50',
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#34495e',
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
  button: {
    backgroundColor: '#3498db',
    marginTop: 20,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
