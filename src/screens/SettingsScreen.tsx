import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PaymentService } from '../services/PaymentService';
import { SMSService } from '../services/SMSService';
import { useTheme } from '../context/ThemeContext';
import { textStyles } from '../utils/typography';
import Ionicons from 'react-native-vector-icons/Ionicons';

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
    settingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    settingIconContainer: {
      width: 32,
      height: 32,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
      backgroundColor:
        type === 'danger' ? '#ff4444' + '20' : theme.colors.primary + '20',
    },
    settingIcon: {
      ...textStyles.body,
      color: type === 'danger' ? '#ff4444' : theme.colors.text,
    },
    settingText: {
      flex: 1,
    },
    settingTitle: {
      ...textStyles.bodyMedium,
      color: type === 'danger' ? '#ff4444' : theme.colors.text,
    },
    settingSubtitle: {
      ...textStyles.small,
      marginTop: 2,
      color: theme.colors.textSecondary,
    },
    settingArrow: {
      ...textStyles.body,
      marginLeft: 8,
      color: theme.colors.textSecondary,
    },
  });

  return (
    <TouchableOpacity
      style={settingItemStyles.settingItem}
      onPress={onPress}
      disabled={!onPress && !rightComponent}
    >
      <View style={settingItemStyles.settingLeft}>
        {icon && (
          <View style={settingItemStyles.settingIconContainer}>
            <Text style={settingItemStyles.settingIcon}>{icon}</Text>
          </View>
        )}
        <View style={settingItemStyles.settingText}>
          <Text style={settingItemStyles.settingTitle}>{title}</Text>
          {subtitle && (
            <Text style={settingItemStyles.settingSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      {rightComponent || <Text style={settingItemStyles.settingArrow}>›</Text>}
    </TouchableOpacity>
  );
};

const SectionHeader: React.FC<{ title: string }> = ({ title }) => {
  const { theme } = useTheme();

  const sectionHeaderStyles = StyleSheet.create({
    sectionHeader: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 8,
    },
    sectionHeaderText: {
      ...textStyles.captionMedium,
      textTransform: 'uppercase',
      color: theme.colors.textSecondary,
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
  const [smsParsingEnabled, setSmsParsingEnabled] = useState<boolean | null>(
    null,
  ); // null = loading
  const [isTogglingSms, setIsTogglingSms] = useState(false);

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data? 🗑️',
      'This will permanently delete all your payment records. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              await PaymentService.clearAllPayments();
              Alert.alert('Success! ✅', 'All payment data has been cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ],
    );
  };

  const handleClearSmsPayments = async () => {
    try {
      const stats = await PaymentService.getPaymentStats();

      if (stats.sms === 0) {
        Alert.alert(
          'No SMS Payments',
          "You don't have any SMS-detected payments to clear.",
        );
        return;
      }

      Alert.alert(
        'Clear SMS Payments? 📱',
        `You have ${stats.sms} SMS payments and ${stats.manual} manual payments.\n\nThis will permanently delete all ${stats.sms} SMS-detected payments. Manual payments will be kept.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Clear SMS Payments',
            style: 'destructive',
            onPress: async () => {
              try {
                await PaymentService.clearSmsPayments();
                Alert.alert(
                  'Success! ✅',
                  `Cleared ${stats.sms} SMS payments. ${stats.manual} manual payments preserved.`,
                );
              } catch (error) {
                Alert.alert('Error', 'Failed to clear SMS payments');
              }
            },
          },
        ],
      );
    } catch (error) {
      console.error('Error getting payment stats:', error);
      Alert.alert('Error', 'Failed to get payment statistics');
    }
  };

  // Handle SMS parsing toggle: single alert per action, processing lock to avoid duplicates
  const handleSmsParsingToggle = async (value: boolean) => {
    if (smsParsingEnabled === null || isTogglingSms) return;

    // Show confirmation dialog before proceeding
    const confirmationMessage = value
      ? 'Enable automatic SMS payment detection?'
      : 'Disable automatic SMS payment detection?';

    const confirmed = await new Promise<boolean>(resolve => {
      Alert.alert(
        value ? 'Enable SMS Detection' : 'Disable SMS Detection',
        confirmationMessage,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: value ? 'Enable' : 'Disable',
            style: value ? 'default' : 'destructive',
            onPress: () => resolve(true),
          },
        ],
      );
    });

    // If user cancelled, don't proceed
    if (!confirmed) return;

    setIsTogglingSms(true);
    try {
      const ok = await SMSService.setSmsParsingEnabled(value);
      if (ok) {
        // Only update state after success
        setSmsParsingEnabled(value);
        // No success alert - keep it smooth
      } else {
        Alert.alert(
          value ? 'Permission Required' : 'Error',
          value
            ? 'SMS permission is required to enable detection.'
            : 'Failed to update SMS detection setting.',
        );
        // Do not update toggle, just leave as is
      }
    } catch (e) {
      console.error('Error toggling SMS parsing', e);
      Alert.alert('Error', 'Failed to update SMS detection.');
      // Do not update toggle, just leave as is
    } finally {
      setIsTogglingSms(false);
    }
  };

  // Load SMS parsing setting on mount
  React.useEffect(() => {
    (async () => {
      setSmsParsingEnabled(null); // loading
      const enabled = await SMSService.isSmsParsingEnabled();
      setSmsParsingEnabled(enabled);
      if (enabled) {
        await SMSService.startSmsMonitoring();
      } else {
        SMSService.stopSmsMonitoring();
      }
    })();
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 20,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      ...textStyles.heading,
      color: theme.colors.text,
    },
    sectionHeaderText: {
      ...textStyles.smallMedium,
      textTransform: 'uppercase',
    },
    switchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 60,
      minHeight: 30,
    },
    footerSpacer: {
      height: 30,
    },
    footerContainer: {
      marginTop: 20,
      paddingHorizontal: 20,
      paddingVertical: 24,
    },
    footerDivider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginBottom: 20,
      opacity: 0.3,
    },
    footerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    footerEmoji: {
      ...textStyles.large,
      marginRight: 8,
    },
    footerText: {
      ...textStyles.body,
      color: theme.colors.text,
      textAlign: 'center',
      fontWeight: '500',
    },
    footerFlag: {
      ...textStyles.large,
      marginLeft: 8,
    },
    footerSubtext: {
      ...textStyles.small,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      fontStyle: 'italic',
    },
    // Support section styles
    supportContainer: {
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    supportText: {
      ...textStyles.body,
      color: theme.colors.text,
      textAlign: 'center',
      fontStyle: 'italic',
    },
    paymentContainer: {
      marginHorizontal: 20,
      marginBottom: 8,
    },
    paymentMethod: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    paymentIcon: {
      ...textStyles.body,
      marginRight: 12,
      fontSize: 18,
    },
    paymentText: {
      ...textStyles.body,
      color: theme.colors.text,
      flex: 1,
    },
    arrow: {
      ...textStyles.body,
      color: theme.colors.textSecondary,
      fontSize: 16,
    },
    contactMethod: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginHorizontal: 20,
      marginBottom: 20,
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    contactIcon: {
      ...textStyles.body,
      marginRight: 12,
      fontSize: 18,
    },
    contactText: {
      ...textStyles.body,
      color: theme.colors.text,
      flex: 1,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* SMS Parsing Card */}
        <SectionHeader title="SMS Parsing" />
        <SettingItem
          title="SMS Detection"
          subtitle={
            isTogglingSms
              ? 'Processing...'
              : smsParsingEnabled === null
              ? 'Loading...'
              : smsParsingEnabled
              ? 'Enabled'
              : 'Disabled'
          }
          rightComponent={
            <View style={styles.switchContainer}>
              {isTogglingSms ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <Switch
                  value={smsParsingEnabled ?? false}
                  onValueChange={handleSmsParsingToggle}
                  disabled={smsParsingEnabled === null || isTogglingSms}
                  trackColor={{
                    false: theme.colors.border,
                    true: theme.colors.primary,
                  }}
                  thumbColor={theme.isDark ? '#ffffff' : theme.colors.surface}
                />
              )}
            </View>
          }
        />

        {/* Data Management */}
        <SectionHeader title="Data Management" />
        <SettingItem
          title="Clear SMS Data"
          type="danger"
          onPress={handleClearSmsPayments}
        />
        <SettingItem
          title="Clear All Data"
          type="danger"
          onPress={handleClearAllData}
        />

        {/* Support Developer */}
        <SectionHeader title="Support" />

        {/* Support Message */}
        <View style={styles.supportContainer}>
          <Text style={styles.supportText}>
            Enjoying SpendBook? Consider supporting the Developer! 💝
          </Text>
        </View>

        {/* Payment Methods */}
        <View style={styles.paymentContainer}>
          <TouchableOpacity
            style={styles.paymentMethod}
            onPress={() => Linking.openURL('https://paypal.me/anidravi')}
          >
            <Ionicons
              name="logo-paypal"
              size={20}
              color={theme.colors.primary}
              style={styles.paymentIcon}
            />
            <Text style={styles.paymentText}>PayPal</Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.paymentMethod}
            onPress={() =>
              Linking.openURL(
                'upi://pay?pa=anidravi@upi&pn=Dilip%20Kumar%20Yadav&tn=Support%20SpendBook&cu=INR',
              )
            }
          >
            <Ionicons
              name="phone-portrait"
              size={20}
              color={theme.colors.primary}
              style={styles.paymentIcon}
            />
            <Text style={styles.paymentText}>UPI Payment</Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.paymentMethod}
            onPress={() =>
              Linking.openURL(
                'tez://upi/pay?pa=anidravi@upi&pn=Dilip%20Kumar%20Yadav&tn=Support%20SpendBook&cu=INR',
              )
            }
          >
            <Ionicons
              name="card"
              size={20}
              color={theme.colors.primary}
              style={styles.paymentIcon}
            />
            <Text style={styles.paymentText}>Google Pay</Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Contact */}
        <TouchableOpacity
          style={styles.contactMethod}
          onPress={() =>
            Linking.openURL(
              'mailto:fuleliji@gmail.com?subject=Appreciation%20for%20SpendBook',
            )
          }
        >
          <Ionicons
            name="mail"
            size={20}
            color={theme.colors.primary}
            style={styles.contactIcon}
          />
          <Text style={styles.contactText}>Write to Developer</Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>

        {/* About */}
        <SectionHeader title="About" />
        <SettingItem
          title="Privacy Policy"
          onPress={() =>
            Alert.alert(
              'Privacy Policy',
              'Privacy Policy for SpendBook\n\n' +
                'Last updated: August 30, 2025\n\n' +
                '🔒 Your Privacy is Protected\n\n' +
                'SpendBook stores ALL your data locally on your device. ' +
                'No data is sent to external servers or shared with third parties.\n\n' +
                'What We Store Locally:\n' +
                '• Payment records you enter manually\n' +
                '• SMS messages (only if you enable SMS detection)\n' +
                '• App preferences and settings\n\n' +
                "What We DON'T Do:\n" +
                '• ❌ No data sent to internet/cloud\n' +
                '• ❌ No tracking or analytics\n' +
                '• ❌ No data sharing with anyone\n' +
                '• ❌ No account creation required\n\n' +
                'Your Control:\n' +
                '• Delete SMS data anytime\n' +
                '• Clear all data anytime\n' +
                '• Data stays on your device only\n\n' +
                'Permissions:\n' +
                '• SMS permission (optional for auto-detection)\n' +
                '• No internet permission needed\n\n',
            )
          }
        />
        <SettingItem
          title="About SpendBook"
          onPress={() =>
            Alert.alert(
              'About SpendBook',
              'SpendBook - Payment Tracker\n\n' +
                'A simple payment tracking app for Android.\n\n' +
                'Features:\n' +
                '• SMS payment detection\n' +
                '• Manual payment entry\n' +
                '• Payment analytics\n' +
                '• Data export\n\n' +
                'Version: 2.0.1\n' +
                'Made in India 🇮🇳\n\n' +
                '💝 Support: If you find SpendBook helpful,\n' +
                'consider supporting the development!',
            )
          }
        />

        {/* Footer Message */}
        <View style={styles.footerContainer}>
          <View style={styles.footerDivider} />
          <View style={styles.footerContent}>
            <Text style={styles.footerEmoji}>💝</Text>
            <Text style={styles.footerText}>Made with love in India</Text>
            <Text style={styles.footerFlag}>🇮🇳</Text>
          </View>
          <Text style={styles.footerSubtext}>
            Crafting beautiful experiences
          </Text>
        </View>

        {/* Footer spacing */}
        <View style={styles.footerSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
