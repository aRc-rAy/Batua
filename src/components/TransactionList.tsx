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
import { formatAmount } from '../utils/formatting';
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
}

const TransactionList: React.FC<TransactionListProps> = ({
  payments,
  onPaymentPress,
  selectedPaymentId,
  showScrollView = true,
  maxHeight,
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
      Others: 'ellipsis-horizontal'
    };
    return iconMap[category];
  };

  // Clean and modern category colors - not too dull, not too bright
  const getCategoryColors = (category: PaymentCategory) => {
    const categoryColorMap: Record<PaymentCategory, { background: string; border: string; text: string }> = {
      Food: { 
        background: theme.isDark ? '#1F2937' : '#FFFFFF', 
        border: theme.isDark ? '#10B981' : '#10B981',
        text: theme.isDark ? '#A3A3A3' : '#6B7280'
      },
      Travel: { 
        background: theme.isDark ? '#1F2937' : '#FFFFFF', 
        border: theme.isDark ? '#3B82F6' : '#3B82F6',
        text: theme.isDark ? '#A3A3A3' : '#6B7280'
      },
      Clothes: { 
        background: theme.isDark ? '#1F2937' : '#FFFFFF', 
        border: theme.isDark ? '#8B5CF6' : '#8B5CF6',
        text: theme.isDark ? '#A3A3A3' : '#6B7280'
      },
      Entertainment: { 
        background: theme.isDark ? '#1F2937' : '#FFFFFF', 
        border: theme.isDark ? '#F59E0B' : '#F59E0B',
        text: theme.isDark ? '#A3A3A3' : '#6B7280'
      },
      Bills: { 
        background: theme.isDark ? '#1F2937' : '#FFFFFF', 
        border: theme.isDark ? '#EF4444' : '#EF4444',
        text: theme.isDark ? '#A3A3A3' : '#6B7280'
      },
      Healthcare: { 
        background: theme.isDark ? '#1F2937' : '#FFFFFF', 
        border: theme.isDark ? '#06B6D4' : '#06B6D4',
        text: theme.isDark ? '#A3A3A3' : '#6B7280'
      },
      Others: { 
        background: theme.isDark ? '#1F2937' : '#FFFFFF', 
        border: theme.isDark ? '#6B7280' : '#6B7280',
        text: theme.isDark ? '#A3A3A3' : '#6B7280'
      }
    };
    return categoryColorMap[category];
  };

  const getDateLabel = (dateString: string): string => {
    const paymentDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // Reset time for accurate comparison
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    paymentDate.setHours(0, 0, 0, 0);

    if (paymentDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (paymentDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else {
      return paymentDate.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getTimeFromDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const groupPaymentsByDate = (paymentList: Payment[]): GroupedTransactions[] => {
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
        payments: grouped[dateKey].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      }));
  };

  const groupedTransactions = groupPaymentsByDate(payments);

  const renderTransaction = (payment: Payment) => {
    const isSelected = selectedPaymentId === payment.id;
    const categoryColors = getCategoryColors(payment.category);
    
    return (
      <TouchableOpacity
        key={payment.id}
        style={[
          styles.transactionItem,
          styles.transactionCard,
          { 
            backgroundColor: isSelected ? theme.colors.primary + '08' : categoryColors.background,
            borderLeftColor: isSelected ? theme.colors.primary : categoryColors.border,
            borderColor: theme.colors.border + '15',
          },
          isSelected && styles.selectedCard
        ]}
        onPress={() => onPaymentPress?.(payment)}
        activeOpacity={0.7}
      >
        <View style={styles.transactionRow}>
          <View style={styles.leftSection}>
            <Ionicons 
              name={getCategoryIcon(payment.category)} 
              size={20} 
              color={theme.colors.primary} 
              style={styles.categoryIcon}
            />
            <View style={styles.transactionDetails}>
              <Text 
                style={[styles.transactionDescription, { color: theme.colors.text }]} 
                numberOfLines={1}
              >
                {payment.description}
              </Text>
              <View style={styles.metaRow}>
                <Text style={[styles.categoryText, { color: theme.colors.textSecondary }]}>
                  {payment.category}
                </Text>
                {payment.isFromSMS && (
                  <Text style={[styles.smsIndicator, { color: theme.colors.textSecondary }]}>
                    • SMS
                  </Text>
                )}
              </View>
            </View>
          </View>
          <View style={styles.rightSection}>
            <Text style={[styles.amountText, { color: theme.colors.primary }]}>
              ₹{formatAmount(payment.amount)}
            </Text>
            <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>
              {getTimeFromDate(payment.date)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDateGroup = (group: GroupedTransactions) => {
    return (
      <View key={group.date} style={styles.dateGroup}>
        <Text style={[styles.dateLabel, { 
          color: theme.colors.textSecondary,
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border + '40'
        }]}>
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
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
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
        style={[
          styles.scrollContainer, 
          ...(maxHeight ? [{ maxHeight }] : [])
        ]}
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
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  transactionCard: {
    borderRadius: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    marginHorizontal: 8,
    paddingHorizontal: 18,
    paddingVertical: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedCard: {
    elevation: 6,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  categoryIcon: {
    marginRight: 16,
    opacity: 0.9,
    alignSelf: 'center',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    ...textStyles.body,
    marginBottom: 4,
    letterSpacing: 0.2,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
  ...textStyles.captionMedium,
    textTransform: 'capitalize',
  },
  timeText: {
  ...textStyles.caption,
  },
  smsIndicator: {
  ...textStyles.captionMedium,
  },
  amountText: {
    ...textStyles.bodyMedium,
    letterSpacing: 0.3,
    fontWeight: '600',
    fontSize: 16,
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
