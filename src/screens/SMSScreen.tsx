import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Payment } from '../types';
import { PaymentService } from '../services/PaymentService';
import { useTheme } from '../context/ThemeContext';
import { textStyles } from '../utils/typography';
import { formatAmount } from '../utils/formatting';

interface GroupedPayments {
  date: string;
  dateLabel: string;
  payments: Payment[];
}

const SMSScreen: React.FC = () => {
  const { theme } = useTheme();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [groupedPayments, setGroupedPayments] = useState<GroupedPayments[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const groupPaymentsByDate = useCallback(
    (paymentList: Payment[]): GroupedPayments[] => {
      const groups: { [key: string]: Payment[] } = {};

      paymentList.forEach(payment => {
        const date = new Date(payment.date);
        const dateKey = date.toDateString();

        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(payment);
      });

      return Object.entries(groups)
        .map(([dateKey, groupPayments]) => ({
          date: dateKey,
          dateLabel: getDateLabel(new Date(dateKey)),
          payments: groupPayments.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          ),
        }))
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
    },
    [],
  );

  const loadSMSPayments = useCallback(async () => {
    try {
      const allPayments = await PaymentService.getAllPayments();
      const smsPayments = allPayments.filter(
        payment => payment.type === 'sms' || payment.isFromSMS,
      );

      setPayments(smsPayments);

      // Group payments by date
      const grouped = groupPaymentsByDate(smsPayments);
      setGroupedPayments(grouped);

      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error loading SMS payments:', error);
      setLoading(false);
      setRefreshing(false);
    }
  }, [groupPaymentsByDate]);

  const getDateLabel = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  };

  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'Food':
        return '🍽️';
      case 'Travel':
        return '✈️';
      case 'Clothes':
        return '👕';
      case 'Entertainment':
        return '🎬';
      case 'Bills':
        return '💳';
      case 'Healthcare':
        return '🏥';
      default:
        return '💰';
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadSMSPayments();
  }, [loadSMSPayments]);

  useFocusEffect(
    useCallback(() => {
      loadSMSPayments();
    }, [loadSMSPayments]),
  );

  const renderPaymentItem = (payment: Payment) => {
    return (
      <View
        key={payment.id}
        style={[styles.paymentItem, { backgroundColor: theme.colors.surface }]}
      >
        <View style={styles.paymentHeader}>
          <View style={styles.leftContent}>
            <Text style={styles.categoryIcon}>
              {getCategoryIcon(payment.category)}
            </Text>
            <View style={styles.paymentInfo}>
              <Text
                style={[styles.description, { color: theme.colors.text }]}
                numberOfLines={1}
              >
                {payment.description}
              </Text>
              <Text
                style={[styles.category, { color: theme.colors.textSecondary }]}
              >
                {payment.category} • SMS Auto-Parse
              </Text>
            </View>
          </View>
          <Text style={[styles.amount, { color: theme.colors.error }]}>
            -{formatAmount(payment.amount, true)}
          </Text>
        </View>
      </View>
    );
  };

  const renderDateGroup = (group: GroupedPayments) => {
    return (
      <View key={group.date} style={styles.dateGroup}>
        <Text style={[styles.dateLabel, { color: theme.colors.text }]}>
          {group.dateLabel}
        </Text>
        {group.payments.map(renderPaymentItem)}
      </View>
    );
  };

  if (loading && payments.length === 0) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            SMS Payments
          </Text>
          <Text
            style={[styles.subtitle, { color: theme.colors.textSecondary }]}
          >
            Automatically parsed from SMS
          </Text>
        </View>
        <View style={styles.centerContainer}>
          <Text
            style={[styles.loadingText, { color: theme.colors.textSecondary }]}
          >
            Loading SMS payments...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (payments.length === 0) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            SMS Payments
          </Text>
          <Text
            style={[styles.subtitle, { color: theme.colors.textSecondary }]}
          >
            Automatically parsed from SMS
          </Text>
        </View>
        <View style={styles.centerContainer}>
          <Text
            style={[styles.emptyIcon, { color: theme.colors.textSecondary }]}
          >
            📱
          </Text>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            No SMS Payments Found
          </Text>
          <Text
            style={[
              styles.emptySubtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            Enable SMS auto-parsing in Settings to automatically detect payments
            from SMS messages
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          SMS Payments
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {payments.length} payment{payments.length !== 1 ? 's' : ''} from SMS
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {groupedPayments.map(renderDateGroup)}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    ...textStyles.display,
    marginBottom: 4,
  },
  subtitle: {
    ...textStyles.bodyMedium,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    ...textStyles.bodyMedium,
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    ...textStyles.subheading,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...textStyles.bodyMedium,
    textAlign: 'center',
    lineHeight: 24,
  },
  dateGroup: {
    marginBottom: 24,
  },
  dateLabel: {
    ...textStyles.bodyMedium,
    marginBottom: 12,
    paddingLeft: 4,
  },
  paymentItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    ...textStyles.heading,
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  description: {
    ...textStyles.bodyMedium,
    marginBottom: 2,
  },
  category: {
    ...textStyles.body,
  },
  amount: {
    ...textStyles.large,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default SMSScreen;
