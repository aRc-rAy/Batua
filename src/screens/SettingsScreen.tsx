import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PaymentService } from '../services/PaymentService';

const SettingItem = ({ 
  title, 
  subtitle, 
  onPress, 
  rightComponent,
  icon,
  type = 'default'
}: {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightComponent?: React.ReactNode;
  icon: string;
  type?: 'default' | 'export' | 'danger';
}) => (
  <TouchableOpacity 
    style={[
      styles.settingItem, 
      type === 'export' && styles.exportItem,
      type === 'danger' && styles.dangerItem
    ]} 
    onPress={onPress}
    disabled={!onPress && !rightComponent}
  >
    <View style={styles.settingLeft}>
      <View style={[
        styles.settingIconContainer,
        type === 'export' && styles.exportIconContainer,
        type === 'danger' && styles.dangerIconContainer
      ]}>
        <Text style={[
          styles.settingIcon,
          type === 'export' && styles.exportIcon,
          type === 'danger' && styles.dangerIcon
        ]}>{icon}</Text>
      </View>
      <View style={styles.settingText}>
        <Text style={[
          styles.settingTitle,
          type === 'export' && styles.exportTitle,
          type === 'danger' && styles.dangerTitle
        ]}>{title}</Text>
        {subtitle && (
          <Text style={[
            styles.settingSubtitle,
            type === 'export' && styles.exportSubtitle,
            type === 'danger' && styles.dangerSubtitle
          ]}>{subtitle}</Text>
        )}
      </View>
    </View>
    {rightComponent && (
      <View style={styles.settingRight}>
        {rightComponent}
      </View>
    )}
    {onPress && !rightComponent && (
      <View style={styles.settingArrow}>
        <Text style={styles.arrowText}>›</Text>
      </View>
    )}
  </TouchableOpacity>
);

const SettingsScreen: React.FC = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);

  const handleExportData = async () => {
    try {
      const csvData = await PaymentService.exportToCSV();
      if (csvData) {
        Alert.alert(
          'Export Successful',
          'Your payment data has been exported to CSV format.',
          [
            {
              text: 'OK',
              style: 'default',
            },
          ]
        );
      } else {
        Alert.alert('No Data', 'No payment data to export.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This action will permanently delete all your payment records. This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              await PaymentService.clearAllPayments();
              Alert.alert('Success', 'All payment data has been cleared.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>Customize your experience</Text>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <SettingItem
            icon="🔔"
            title="Notifications"
            subtitle="Get notified about spending alerts"
            rightComponent={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#e0e0e0', true: '#3498db' }}
                thumbColor={notificationsEnabled ? '#ffffff' : '#f4f3f4'}
              />
            }
          />

          <SettingItem
            icon="🌙"
            title="Dark Mode"
            subtitle="Enable dark theme"
            rightComponent={
              <Switch
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
                trackColor={{ false: '#e0e0e0', true: '#3498db' }}
                thumbColor={darkModeEnabled ? '#ffffff' : '#f4f3f4'}
              />
            }
          />

          <SettingItem
            icon="☁️"
            title="Auto Backup"
            subtitle="Automatically backup your data"
            rightComponent={
              <Switch
                value={autoBackupEnabled}
                onValueChange={setAutoBackupEnabled}
                trackColor={{ false: '#e0e0e0', true: '#3498db' }}
                thumbColor={autoBackupEnabled ? '#ffffff' : '#f4f3f4'}
              />
            }
          />
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <SettingItem
            icon="📊"
            title="Export Data"
            subtitle="Download your payment history as CSV"
            onPress={handleExportData}
            type="export"
          />

          <SettingItem
            icon="🗑️"
            title="Clear All Data"
            subtitle="Delete all payment records permanently"
            onPress={handleClearAllData}
            type="danger"
          />
        </View>

        {/* App Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          
          <SettingItem
            icon="📱"
            title="Version"
            subtitle="Batua v1.0.0"
          />

          <SettingItem
            icon="📋"
            title="Privacy Policy"
            subtitle="How we handle your data"
            onPress={() => Alert.alert('Privacy Policy', 'Your data is stored locally on your device and never shared with third parties.')}
          />

          <SettingItem
            icon="❓"
            title="Help & Support"
            subtitle="Get help using the app"
            onPress={() => Alert.alert(
              'Help & Support',
              'Features:\n\n• Add payments manually\n• View spending analytics\n• Export data as CSV\n• Filter transaction history\n• Track spending by categories\n\nFor more help, contact support.'
            )}
          />
        </View>

        {/* About Section */}
        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>💼 Batua</Text>
          <Text style={styles.aboutText}>
            Smart payment tracker for effortless expense management.
          </Text>
          <Text style={styles.licenseText}>
            © 2025 Batua. Licensed under MIT License. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
    paddingVertical: 2,
    lineHeight: 34,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    paddingVertical: 2,
    lineHeight: 22,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
    marginLeft: 20,
    paddingVertical: 2,
    lineHeight: 24,
  },
  settingItem: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  exportItem: {
    backgroundColor: '#f8f9ff',
    borderWidth: 1,
    borderColor: '#e3f2fd',
  },
  dangerItem: {
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#ffebee',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f2f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exportIconContainer: {
    backgroundColor: '#e3f2fd',
  },
  dangerIconContainer: {
    backgroundColor: '#ffebee',
  },
  settingIcon: {
    fontSize: 18,
  },
  exportIcon: {
    fontSize: 18,
  },
  dangerIcon: {
    fontSize: 18,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
    paddingVertical: 2,
    lineHeight: 22,
  },
  exportTitle: {
    color: '#1976d2',
  },
  dangerTitle: {
    color: '#d32f2f',
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#7f8c8d',
    paddingVertical: 1,
    lineHeight: 18,
  },
  exportSubtitle: {
    color: '#1565c0',
  },
  dangerSubtitle: {
    color: '#c62828',
  },
  settingRight: {
    marginLeft: 12,
  },
  settingArrow: {
    marginLeft: 8,
  },
  arrowText: {
    fontSize: 18,
    color: '#bdc3c7',
    fontWeight: '300',
  },
  aboutSection: {
    backgroundColor: '#ffffff',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  aboutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    paddingVertical: 3,
    lineHeight: 30,
  },
  aboutText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
    paddingVertical: 2,
  },
  licenseText: {
    fontSize: 12,
    color: '#95a5a6',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 1,
    lineHeight: 16,
  },
});

export default SettingsScreen;
