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
        <Text style={styles.sectionTitle}>SMS Permission Usage</Text>
        <Text style={styles.text}>
          • Only reads messages from banks and payment services{'\n'}
          • Automatically detects transaction amounts and merchants{'\n'}
          • No personal messages are ever accessed{'\n'}
          • All SMS processing happens locally on your device{'\n'}
          • No SMS data is sent to external servers
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Security</Text>
        <Text style={styles.text}>
          • All payment data stays on your device{'\n'}
          • No cloud storage or external data sharing{'\n'}
          • You have full control over your data{'\n'}
          • SMS detection can be disabled anytime in settings
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trusted Sources Only</Text>
        <Text style={styles.text}>
          We only read SMS from verified financial institutions including:{'\n'}
          • Major banks (HDFC, ICICI, SBI, Axis, etc.){'\n'}
          • Digital wallets (PayTM, GPay, PhonePe, etc.){'\n'}
          • UPI payment services{'\n'}
          • Credit/Debit card networks
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
