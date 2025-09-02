import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PaymentService } from '../services/PaymentService';
import { useTheme } from '../context/ThemeContext';
import { textStyles } from '../utils/typography';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../types';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface SettingItemProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightComponent?: React.ReactNode;
  icon?: string;
  type?: 'default' | 'danger';
}

const SettingItem: React.FC<SettingItemProps> = ({
  title,
  subtitle,
  onPress,
  rightComponent,
  icon,
  type = 'default',
}) => {
  const { theme } = useTheme();

  const settingItemStyles = StyleSheet.create({
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: theme.colors.surface,
      borderBottomColor: theme.colors.border,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    itemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    iconContainer: {
      width: 30,
      alignItems: 'center',
      marginRight: 12,
    },
    textContainer: {
      flex: 1,
    },
    title: {
      ...textStyles.body,
      color: type === 'danger' ? '#dc3545' : theme.colors.text,
      fontWeight: '500',
    },
    subtitle: {
      ...textStyles.caption,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
  });

  return (
    <TouchableOpacity style={settingItemStyles.settingItem} onPress={onPress}>
      <View style={settingItemStyles.itemLeft}>
        {icon && (
          <View style={settingItemStyles.iconContainer}>
            <Ionicons name={icon} size={20} color={theme.colors.textSecondary} />
          </View>
        )}
        <View style={settingItemStyles.textContainer}>
          <Text style={settingItemStyles.title}>{title}</Text>
          {subtitle && <Text style={settingItemStyles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent}
    </TouchableOpacity>
  );
};

interface SectionHeaderProps {
  title: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => {
  const { theme } = useTheme();

  const sectionHeaderStyles = StyleSheet.create({
    sectionHeader: {
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 8,
      backgroundColor: theme.colors.background,
    },
    sectionHeaderText: {
      ...textStyles.caption,
      color: theme.colors.textSecondary,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
  });

  return (
    <View style={sectionHeaderStyles.sectionHeader}>
      <Text style={sectionHeaderStyles.sectionHeaderText}>{title}</Text>
    </View>
  );
};

const SettingsScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [selectedQrType, setSelectedQrType] = useState<'upi' | 'gpay' | null>(null);

  // Handle QR modal display
  const showQrModal = (type: 'upi' | 'gpay') => {
    setSelectedQrType(type);
    setQrModalVisible(true);
  };

  // Export functionality
  const handleExportAll = () => {
    navigation.navigate('Export');
  };

  const handleClearAllPayments = async () => {
    try {
      const stats = await PaymentService.getPaymentStats();
      
      if (stats.total === 0) {
        Alert.alert(
          'No Payments',
          "You don't have any payments to clear.",
          [{ text: 'OK' }]
        );
        return;
      }

      Alert.alert(
        'Clear All Payments? 🗑️',
        `You have ${stats.total} payments.\n\nThis will permanently delete all your payment history. This action cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Clear All',
            style: 'destructive',
            onPress: async () => {
              try {
                await PaymentService.clearAllPayments();
                Alert.alert(
                  'Success',
                  `Cleared all ${stats.total} payments.`,
                  [{ text: 'OK' }]
                );
              } catch (error) {
                console.error('Error clearing payments:', error);
                Alert.alert('Error', 'Failed to clear payments');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error getting payment stats:', error);
      Alert.alert('Error', 'Failed to get payment statistics');
    }
  };

  const settingsStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      ...textStyles.heading,
      color: theme.colors.text,
      marginLeft: 16,
    },
    section: {
      backgroundColor: theme.colors.surface,
      marginBottom: 1,
    },
    // QR Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 20,
      alignItems: 'center',
      margin: 20,
      maxWidth: 320,
      minHeight: 200,
      justifyContent: 'center',
    },
    modalTitle: {
      ...textStyles.subheading,
      color: theme.colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    qrImage: {
      width: 200,
      height: 200,
      marginBottom: 16,
    },
    modalDescription: {
      ...textStyles.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 20,
      lineHeight: 20,
    },
    modalButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 25,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalButtonText: {
      ...textStyles.body,
      color: theme.colors.surface,
      fontWeight: '600',
      textAlign: 'center',
    },
    footer: {
      padding: 20,
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 40,
    },
    footerText: {
      ...textStyles.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
  });

  return (
    <SafeAreaView style={settingsStyles.container}>
      <View style={settingsStyles.header}>
        <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
        <Text style={settingsStyles.headerTitle}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Data Management Card */}
        <SectionHeader title="Data Management" />
        <View style={settingsStyles.section}>
          <SettingItem
            title="Export to Excel"
            subtitle="Download payment history as Excel file"
            icon="document-text-outline"
            onPress={handleExportAll}
          />
          <SettingItem
            title="Clear All Payments"
            subtitle="Permanently delete all payment records"
            icon="trash-outline"
            onPress={handleClearAllPayments}
            type="danger"
          />
        </View>

        {/* Support & Information Card */}
        <SectionHeader title="Support" />
        <View style={settingsStyles.section}>
          <SettingItem
            title="Donate via UPI"
            subtitle="Support the development with UPI payment"
            icon="card-outline"
            onPress={() => showQrModal('upi')}
          />
          <SettingItem
            title="Donate via Google Pay"
            subtitle="Support the development with Google Pay"
            icon="logo-google"
            onPress={() => showQrModal('gpay')}
          />
        </View>

        {/* Privacy & Security */}
        <SectionHeader title="Privacy & Security" />
        <View style={settingsStyles.section}>
          <SettingItem
            title="Privacy Policy"
            subtitle="Your data stays on your device only"
            icon="shield-checkmark-outline"
          />
        </View>

        {/* App Info Card */}
        <SectionHeader title="App Information" />
        <View style={settingsStyles.section}>
          <SettingItem
            title="About"
            subtitle="SpendBook helps you track expenses easily"
            icon="information-circle-outline"
          />
          <SettingItem
            title="App Version"
            subtitle="4.0.0"
            icon="code-outline"
          />
        </View>

        {/* Footer */}
        <View style={settingsStyles.footer}>
          <Text style={settingsStyles.footerText}>
            Made with ❤️ in India
          </Text>
        </View>
      </ScrollView>

      {/* QR Code Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={qrModalVisible}
        onRequestClose={() => setQrModalVisible(false)}
      >
        <View style={settingsStyles.modalOverlay}>
          <View style={settingsStyles.modalContent}>
            <Text style={settingsStyles.modalTitle}>
              {selectedQrType === 'upi' ? 'UPI Payment' : 'Google Pay'}
            </Text>
            <Image
              source={
                selectedQrType === 'upi'
                  ? require('../assets/upi_qr.jpg')
                  : require('../assets/qr_gpay.png')
              }
              style={settingsStyles.qrImage}
              resizeMode="contain"
            />
            <Text style={settingsStyles.modalDescription}>
              Scan this QR code with your {selectedQrType === 'upi' ? 'UPI app' : 'Google Pay'} to support SpendBook development.{'\n\n'}
              Thank you for your support! 🙏
            </Text>
            <TouchableOpacity
              style={settingsStyles.modalButton}
              onPress={() => setQrModalVisible(false)}
            >
              <Text style={settingsStyles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SettingsScreen;
