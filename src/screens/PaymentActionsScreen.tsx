import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, PaymentCategory } from '../types';
import { PaymentService } from '../services/PaymentService';
import { useTheme } from '../context/ThemeContext';
import { textStyles } from '../utils/typography';
import { formatAmount } from '../utils/formatting';

type NavigationProp = StackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'PaymentActions'>;

const PaymentActionsScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { payment } = route.params;

  const getCategoryIcon = (category: PaymentCategory): string => {
    const iconMap: Record<PaymentCategory, string> = {
      Food: '🍽️',
      Travel: '✈️',
      Clothes: '👕',
      Entertainment: '🎬',
      Bills: '🧾',
      Healthcare: '🏥',
      Others: '📦',
    };
    return iconMap[category];
  };

  const handleEditPayment = () => {
    navigation.navigate('EditPayment', { payment });
  };

  const handleDeletePayment = async () => {
    Alert.alert(
      'Delete Payment',
      'Are you sure you want to delete this payment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await PaymentService.deletePayment(payment.id);
              // Navigate back to refresh the previous screen
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting payment:', error);
              Alert.alert('Error', 'Failed to delete payment');
            }
          },
        },
      ],
    );
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 24,
    },
    paymentCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 20,
      marginBottom: 24,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    paymentHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    categoryIcon: {
      ...textStyles.heading,
      marginRight: 12,
    },
    paymentDescription: {
      ...textStyles.large,
      color: theme.colors.text,
      flex: 1,
    },
    paymentAmount: {
      ...textStyles.heading,
      color: theme.colors.primary,
      textAlign: 'center',
      marginBottom: 16,
    },
    paymentDetails: {
      gap: 8,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    detailLabel: {
      ...textStyles.body,
      color: theme.colors.textSecondary,
    },
    detailValue: {
      ...textStyles.bodyMedium,
      color: theme.colors.text,
    },
    smsIndicator: {
      backgroundColor: theme.colors.primary + '20',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: 'flex-start',
    },
    smsText: {
      ...textStyles.caption,
      color: theme.colors.primary,
    },
    actionsContainer: {
      gap: 16,
      paddingBottom: 40,
    },
    editButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    editButtonText: {
      ...textStyles.button,
      color: '#ffffff',
    },
    deleteButton: {
      backgroundColor: 'transparent',
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.error,
    },
    deleteButtonText: {
      ...textStyles.button,
      color: theme.colors.error,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.surface}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.paymentCard}>
          <View style={styles.paymentHeader}>
            <Text style={styles.categoryIcon}>
              {getCategoryIcon(payment.category)}
            </Text>
            <Text style={styles.paymentDescription} numberOfLines={2}>
              {payment.description}
            </Text>
          </View>

          <Text style={styles.paymentAmount}>
            {formatAmount(payment.amount, true)}
          </Text>

          <View style={styles.paymentDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Category</Text>
              <Text style={styles.detailValue}>{payment.category}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{formatDate(payment.date)}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>{formatTime(payment.date)}</Text>
            </View>

            {payment.isFromSMS && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Source</Text>
                <View style={styles.smsIndicator}>
                  <Text style={styles.smsText}>SMS Auto-detected</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditPayment}
            activeOpacity={0.8}
          >
            <Text style={styles.editButtonText}>Edit Payment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeletePayment}
            activeOpacity={0.8}
          >
            <Text style={styles.deleteButtonText}>Delete Payment</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PaymentActionsScreen;
