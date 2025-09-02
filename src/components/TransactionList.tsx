import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Payment, PaymentCategory } from '../types';
import { useTheme } from '../context/ThemeContext';
import { textStyles } from '../utils/typography';
import { formatAmount, formatAmountCompact } from '../utils/formatting';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface GroupedTransactions {
  date: string;
  label: string;
  payments: Payment[];
}

interface TransactionListProps {
  payments: Payment[];
  onPaymentPress?: (payment: Payment) => void;
  selectedPaymentId?: string | null;
  showScrollView?: boolean;
  maxHeight?: number;
  removeHorizontalMargins?: boolean;
}

const TransactionList: React.FC<TransactionListProps> = ({
  payments,
  onPaymentPress,
  selectedPaymentId,
  showScrollView = true,
  maxHeight,
  removeHorizontalMargins = false,
}) => {
  const { theme } = useTheme();

  const getCategoryIcon = (category: PaymentCategory): string => {
    const iconMap: Record<PaymentCategory, string> = {
      Food: 'restaurant',
      Travel: 'airplane',
      Clothes: 'shirt',
      Entertainment: 'film',
      Bills: 'document-text',
      Healthcare: 'medical',
      Others: 'ellipsis-horizontal',
    };
    return iconMap[category];
  };

  const getDateLabel = (dateString: string): string => {
    const paymentDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // Create new date objects for comparison without modifying originals
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const yesterdayStart = new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate(),
    );
    const paymentDateStart = new Date(
      paymentDate.getFullYear(),
      paymentDate.getMonth(),
      paymentDate.getDate(),
    );

    if (paymentDateStart.getTime() === todayStart.getTime()) {
      return 'Today';
    } else if (paymentDateStart.getTime() === yesterdayStart.getTime()) {
      return 'Yesterday';
    } else {
      return paymentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const getDateTimeFromDate = (dateString: string) => {
    const paymentDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // Create new date objects for comparison without modifying originals
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const yesterdayStart = new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate(),
    );
    const paymentDateStart = new Date(
      paymentDate.getFullYear(),
      paymentDate.getMonth(),
      paymentDate.getDate(),
    );

    const timeStr = paymentDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    if (paymentDateStart.getTime() === todayStart.getTime()) {
      return `Today • ${timeStr}`;
    } else if (paymentDateStart.getTime() === yesterdayStart.getTime()) {
      return `Yesterday • ${timeStr}`;
    } else {
      const dateStr = paymentDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      return `${dateStr} • ${timeStr}`;
    }
  };

  const groupPaymentsByDate = (
    paymentList: Payment[],
  ): GroupedTransactions[] => {
    const grouped: { [key: string]: Payment[] } = {};

    paymentList.forEach(payment => {
      const dateKey = payment.date.split('T')[0]; // Get YYYY-MM-DD format
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(payment);
    });

    // Sort dates (newest first) and return as array
    return Object.keys(grouped)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .map(dateKey => ({
        date: dateKey,
        label: getDateLabel(dateKey),
        payments: grouped[dateKey].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        ),
      }));
  };

  const groupedTransactions = groupPaymentsByDate(payments);

  const renderTransaction = (payment: Payment) => {
    const isSelected = selectedPaymentId === payment.id;

    return (
      <TouchableOpacity
        key={payment.id}
        style={[
          styles.transactionCard,
          removeHorizontalMargins && styles.noHorizontalMargins,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
          isSelected && {
            backgroundColor: theme.colors.primary + '08',
            borderColor: theme.colors.primary + '40',
          },
        ]}
        onPress={() => onPaymentPress?.(payment)}
        activeOpacity={0.6}
      >
        <View style={styles.cardContent}>
          {/* Top Row: Icon, Description, Amount */}
          <View style={styles.topRow}>
            <View style={styles.iconDescriptionContainer}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: theme.colors.primary + '12' },
                ]}
              >
                <Ionicons
                  name={getCategoryIcon(payment.category)}
                  size={18}
                  color={theme.colors.primary}
                />
              </View>
              <Text
                style={[styles.description, { color: theme.colors.text }]}
                numberOfLines={1}
              >
                {payment.description}
              </Text>
            </View>
            <Text style={[styles.amount, { color: theme.colors.text }]}>
              ₹{formatAmountCompact(payment.amount)}
            </Text>
          </View>

          {/* Bottom Row: Category, Time */}
          <View style={styles.bottomRow}>
            <Text
              style={[styles.category, { color: theme.colors.textSecondary }]}
            >
              {payment.category}
            </Text>
            <Text style={[styles.time, { color: theme.colors.textSecondary }]}>
              {getDateTimeFromDate(payment.date)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDateGroup = (group: GroupedTransactions) => {
    return (
      <View key={group.date} style={styles.dateGroup}>
        <Text
          style={[
            styles.dateLabel,
            {
              color: theme.colors.textSecondary,
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border + '40',
            },
          ]}
        >
          {group.label}
        </Text>
        {group.payments.map(renderTransaction)}
      </View>
    );
  };

  const content = (
    <View style={styles.container}>
      {groupedTransactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text
            style={[styles.emptyText, { color: theme.colors.textSecondary }]}
          >
            No transactions found
          </Text>
        </View>
      ) : (
        groupedTransactions.map(renderDateGroup)
      )}
    </View>
  );

  if (showScrollView) {
    return (
      <ScrollView
        style={[styles.scrollContainer, ...(maxHeight ? [{ maxHeight }] : [])]}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {content}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  dateGroup: {
    marginBottom: 12,
  },
  dateLabel: {
    ...textStyles.smallMedium,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    borderRadius: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '600',
  },
  transactionItem: {
    marginBottom: 12,
  },
  transactionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    marginHorizontal: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    marginTop: 4,
    shadowRadius: 3,
    elevation: 1,
  },
  noHorizontalMargins: {
    marginHorizontal: 0,
  },
  cardContent: {
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconDescriptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  description: {
    ...textStyles.bodyMedium,
    fontWeight: '600',
    flex: 1,
  },
  amount: {
    ...textStyles.bodyMedium,
    fontWeight: '500',
    fontSize: 14,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    ...textStyles.caption,
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  time: {
    ...textStyles.caption,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    ...textStyles.bodyMedium,
    textAlign: 'center',
    opacity: 0.7,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default TransactionList;
