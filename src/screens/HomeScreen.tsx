import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Payment, PaymentCategory } from '../types';
import { PaymentService } from '../services/PaymentService';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [todaySpending, setTodaySpending] = useState(0);
  const [monthSpending, setMonthSpending] = useState(0);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  
  const getCategoryIcon = (category: PaymentCategory): string => {
    const iconMap: Record<PaymentCategory, string> = {
      Food: '🍽️',
      Travel: '✈️',
      Clothes: '👕',
      Entertainment: '🎬',
      Bills: '🧾',
      Healthcare: '🏥',
      Others: '📦'
    };
    return iconMap[category];
  };
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [spending, payments] = await Promise.all([
        PaymentService.getTotalSpending(),
        PaymentService.getAllPayments()
      ]);
      
      setTodaySpending(spending.today);
      setMonthSpending(spending.month);
      setRecentPayments(payments.slice(-5).reverse()); // Show last 5 payments
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data when screen focuses (important for updates from AddPayment)
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const handleAddPayment = () => {
    navigation.navigate('AddPayment');
  };

  const handleEditPayment = (payment: Payment) => {
    navigation.navigate('EditPayment', { payment });
    setSelectedPaymentId(null);
  };

  const handleDeletePayment = async (paymentId: string) => {
    try {
      await PaymentService.deletePayment(paymentId);
      setSelectedPaymentId(null);
      loadData(); // Reload data after deletion
    } catch (error) {
      console.error('Error deleting payment:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* App Name Header */}
        <View style={styles.appHeader}>
          <View style={styles.appTitleRow}>
            <Text style={styles.appIcon}>💼</Text>
            <Text style={styles.appName}>Batua</Text>
          </View>
          <View style={styles.headerDivider} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.dateText}>{currentDate}</Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Today's Spending</Text>
            <Text style={styles.summaryAmount}>
              {loading ? '...' : `₹${todaySpending.toFixed(2)}`}
            </Text>
          </View>
          
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>This Month</Text>
            <Text style={styles.summaryAmount}>
              {loading ? '...' : `₹${monthSpending.toFixed(2)}`}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleAddPayment}>
            <Text style={styles.actionButtonText}>+ Add Payment</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Transactions */}
        <View style={styles.recentContainer}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Loading...</Text>
            </View>
          ) : recentPayments.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No transactions yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Tap "Add Payment" to get started
              </Text>
            </View>
          ) : (
            <View>
              {recentPayments.map((payment) => (
                <View key={payment.id}>
                  <TouchableOpacity 
                    style={[
                      styles.transactionCard,
                      selectedPaymentId === payment.id && styles.transactionCardSelected
                    ]}
                    onPress={() => setSelectedPaymentId(
                      selectedPaymentId === payment.id ? null : payment.id
                    )}
                  >
                    <View style={styles.transactionIcon}>
                      <Text style={styles.transactionEmoji}>
                        {getCategoryIcon(payment.category)}
                      </Text>
                    </View>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionDescription}>
                        {payment.category}
                      </Text>
                      <Text style={styles.transactionCategory}>
                        {payment.description}
                      </Text>
                    </View>
                    <View style={styles.transactionAmount}>
                      <Text style={styles.transactionAmountText}>
                        ₹{payment.amount.toFixed(2)}
                      </Text>
                      <Text style={styles.transactionDate}>
                        {new Date(payment.date).toLocaleDateString()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  
                  {/* Edit/Delete buttons */}
                  {selectedPaymentId === payment.id && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleEditPayment(payment)}
                      >
                        <Text style={styles.editButtonText}>✏️ Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeletePayment(payment.id)}
                      >
                        <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
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
  appHeader: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  appTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  appIcon: {
    fontSize: 28,
    marginRight: 8,
    textShadowColor: 'rgba(52, 73, 94, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2980b9',
    letterSpacing: 1,
    textShadowColor: 'rgba(41, 128, 185, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
    paddingVertical: 4,
    lineHeight: 34,
  },
  headerDivider: {
    height: 4,
    width: 120,
    backgroundColor: '#2980b9',
    borderRadius: 4,
    marginTop: 4,
    shadowColor: '#2980b9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
    paddingVertical: 4,
    lineHeight: 34,
  },
  dateText: {
    fontSize: 16,
    color: '#7f8c8d',
    paddingVertical: 2,
    lineHeight: 20,
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 15,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
    paddingVertical: 2,
    lineHeight: 18,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    paddingVertical: 4,
    lineHeight: 30,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
    paddingVertical: 4,
    lineHeight: 26,
  },
  actionButton: {
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#ecf0f1',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    paddingVertical: 2,
    lineHeight: 20,
  },
  secondaryButtonText: {
    color: '#2c3e50',
  },
  recentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyState: {
    backgroundColor: '#ffffff',
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#bdc3c7',
    textAlign: 'center',
  },
  transactionCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionIcon: {
    marginRight: 12,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionEmoji: {
    fontSize: 24,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
    paddingVertical: 2,
    lineHeight: 20,
  },
  transactionCategory: {
    fontSize: 12,
    color: '#7f8c8d',
    textTransform: 'uppercase',
    paddingVertical: 1,
    lineHeight: 16,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionAmountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 2,
    paddingVertical: 2,
    lineHeight: 20,
  },
  transactionDate: {
    fontSize: 12,
    color: '#95a5a6',
    paddingVertical: 1,
    lineHeight: 16,
  },
  transactionCardSelected: {
    backgroundColor: '#e8f4fd',
    borderColor: '#3498db',
    borderWidth: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  editButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    flex: 0.45,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    flex: 0.45,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
});

export default HomeScreen;
