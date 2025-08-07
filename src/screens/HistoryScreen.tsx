import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Payment, RootStackParamList } from '../types';
import { PaymentService } from '../services/PaymentService';

type FilterType = 'all' | 'manual' | 'sms';
type NavigationProp = StackNavigationProp<RootStackParamList>;

const HistoryScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      const allPayments = await PaymentService.getAllPayments();
      setPayments(allPayments);
      applyFilter(allPayments, filter);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const applyFilter = (allPayments: Payment[], filterType: FilterType) => {
    let filtered = allPayments;
    
    // Apply filter based on payment type
    if (filterType === 'manual') {
      filtered = allPayments.filter(payment => payment.type === 'manual' && !payment.isFromSMS);
    } else if (filterType === 'sms') {
      filtered = allPayments.filter(payment => payment.type === 'sms' || payment.isFromSMS);
    }
    // 'all' shows everything, so no additional filtering needed
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setFilteredPayments(filtered);
  };

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    applyFilter(payments, newFilter);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadPayments();
    }, [loadPayments])
  );

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      Food: '🍽️',
      Travel: '✈️',
      Entertainment: '🎬',
      Clothes: '👕',
      Bills: '💡',
      Healthcare: '🏥',
      Others: '🔍'
    };
    return icons[category] || '💰';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleExport = async () => {
    try {
      console.log('Export button pressed'); // Debug log
      const csvData = await PaymentService.exportToCSV();
      console.log('CSV data generated:', csvData ? 'Success' : 'No data'); // Debug log
      
      if (csvData) {
        await Share.share({
          message: csvData,
          title: 'Payment History Export',
        });
        console.log('Share completed'); // Debug log
      } else {
        Alert.alert('No Data', 'No payments to export');
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const handleDeletePayment = (payment: Payment) => {
    Alert.alert(
      'Delete Payment',
      `Are you sure you want to delete this payment?\n\nAmount: ₹${payment.amount.toLocaleString()}\nDescription: ${payment.description || 'No description'}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await PaymentService.deletePayment(payment.id);
              loadPayments(); // Reload payments after deletion
              Alert.alert('Success', 'Payment deleted successfully');
            } catch (error) {
              console.error('Error deleting payment:', error);
              Alert.alert('Error', 'Failed to delete payment');
            }
          }
        }
      ]
    );
  };

  const handleEditPayment = (payment: Payment) => {
    // Navigate to EditPayment screen with payment data
    navigation.navigate('EditPayment', { payment });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Payment History</Text>
          <Text style={styles.headerSubtitle}>Track your spending patterns</Text>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          {(['all', 'manual', 'sms'] as FilterType[]).map((filterOption) => (
            <TouchableOpacity
              key={filterOption}
              style={[
                styles.filterButton,
                filter === filterOption && styles.activeFilterButton
              ]}
              onPress={() => handleFilterChange(filterOption)}
            >
              <Text style={[
                styles.filterButtonText,
                filter === filterOption && styles.activeFilterButtonText
              ]}>
                {filterOption === 'all' ? 'All' : filterOption === 'manual' ? 'Manual' : 'SMS'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Export Button */}
        <View style={styles.exportContainer}>
          <TouchableOpacity 
            style={styles.exportButton} 
            onPress={handleExport}
            activeOpacity={0.7}
          >
            <View style={styles.exportButtonContent}>
              <View style={styles.exportIconContainer}>
                <Text style={styles.exportIcon}>📊</Text>
              </View>
              <Text style={styles.exportButtonText}>Export to CSV</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Transactions List */}
        <View style={styles.transactionsContainer}>
          {loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Loading...</Text>
            </View>
          ) : filteredPayments.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No payments found</Text>
              <Text style={styles.emptyStateSubtext}>
                {filter === 'all' ? 'Add some payments to see them here' : 
                 filter === 'manual' ? 'No manual payments recorded' :
                 'No SMS payments detected'}
              </Text>
            </View>
          ) : (
            filteredPayments.map((payment) => (
              <View key={payment.id}>
                <TouchableOpacity 
                  style={[
                    styles.paymentItem,
                    selectedPaymentId === payment.id && styles.paymentItemSelected
                  ]}
                  onPress={() => {
                    if (selectedPaymentId === payment.id) {
                      setSelectedPaymentId(null); // Hide actions if already selected
                    } else {
                      setSelectedPaymentId(payment.id); // Show actions for this payment
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.paymentLeft}>
                    <View style={styles.categoryContainer}>
                      <Text style={styles.categoryIcon}>
                        {getCategoryIcon(payment.category)}
                      </Text>
                    </View>
                    <View style={styles.paymentDetails}>
                      <Text style={styles.paymentDescription} numberOfLines={1}>
                        {payment.category}
                      </Text>
                      <Text style={styles.paymentCategory}>
                        {payment.description || 'No description'}
                      </Text>
                      <Text style={styles.paymentDate}>
                        {formatDate(payment.date)} at {formatTime(payment.date)} • {payment.type === 'sms' || payment.isFromSMS ? 'SMS Entry' : 'Manual Entry'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.paymentRight}>
                    <Text style={styles.paymentAmount}>
                      -₹{payment.amount.toLocaleString()}
                    </Text>
                  </View>
                </TouchableOpacity>
                
                {/* Edit/Delete buttons outside the card */}
                {selectedPaymentId === payment.id && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => handleEditPayment(payment)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.editButtonText}>✏️ Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeletePayment(payment)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
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
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
    paddingVertical: 4,
    lineHeight: 34,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    paddingVertical: 2,
    lineHeight: 22,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activeFilterButton: {
    backgroundColor: '#3498db',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    paddingVertical: 2,
    lineHeight: 20,
  },
  activeFilterButtonText: {
    color: '#ffffff',
  },
  exportContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  exportButton: {
    backgroundColor: '#f0f7ff',
    borderWidth: 2,
    borderColor: '#3498db',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 3,
  },
  exportButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportIconContainer: {
    backgroundColor: '#3498db',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  exportIcon: {
    fontSize: 14,
    color: '#ffffff',
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3498db',
    paddingVertical: 2,
    lineHeight: 22,
  },
  transactionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyState: {
    backgroundColor: '#ffffff',
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    paddingVertical: 3,
    lineHeight: 24,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    paddingVertical: 2,
    lineHeight: 20,
  },
  paymentItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  paymentItemSelected: {
    backgroundColor: '#f0f8ff',
    borderWidth: 2,
    borderColor: '#3498db',
  },
  paymentLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryIcon: {
    fontSize: 20,
  },
  paymentDetails: {
    flex: 1,
  },
  paymentDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
    paddingVertical: 2,
    lineHeight: 22,
  },
  paymentCategory: {
    fontSize: 13,
    color: '#7f8c8d',
    marginBottom: 2,
    paddingVertical: 1,
    lineHeight: 18,
  },
  paymentDate: {
    fontSize: 12,
    color: '#95a5a6',
    paddingVertical: 1,
    lineHeight: 16,
  },
  paymentRight: {
    alignItems: 'flex-end',
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
    paddingVertical: 2,
    lineHeight: 22,
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

export default HistoryScreen;
