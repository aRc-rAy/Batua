import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Payment, RootStackParamList } from '../types';
import { PaymentService } from '../services/PaymentService';
import { useTheme } from '../context/ThemeContext';
import { textStyles } from '../utils/typography';
import RNFS from 'react-native-fs';
import TransactionList from '../components/TransactionList';

type FilterType = 'all' | 'manual' | 'sms';
type NavigationProp = StackNavigationProp<RootStackParamList>;

const HistoryScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [exportProgress, setExportProgress] = useState<{
    visible: boolean;
    step: 'generating' | 'ready' | 'downloading';
    filePath?: string;
    fileName?: string;
    cancelled: boolean;
  }>({
    visible: false,
    step: 'generating',
    cancelled: false,
  });

  // Function to filter payments without loading state
  const applyFilter = useCallback(
    (allPayments: Payment[], filterType: FilterType) => {
      let filtered = allPayments;
      if (filterType === 'manual') {
        filtered = allPayments.filter(
          payment => payment.type === 'manual' && !payment.isFromSMS,
        );
      } else if (filterType === 'sms') {
        filtered = allPayments.filter(
          payment => payment.type === 'sms' || payment.isFromSMS,
        );
      }
      return filtered;
    },
    [],
  );

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);

      const allPayments = await PaymentService.getAllPayments();
      setPayments(allPayments);

      // Apply all filter will be handled by useEffect
      setFilteredPayments(allPayments);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Separate effect to handle filter changes without reloading data
  React.useEffect(() => {
    if (payments.length > 0) {
      const filtered = applyFilter(payments, filter);
      setFilteredPayments(filtered);
    }
  }, [filter, payments, applyFilter]);

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    // Filter will be applied automatically by useEffect above
  };

  useFocusEffect(
    React.useCallback(() => {
      loadPayments();
    }, [loadPayments]),
  );

  const handleExportAll = async () => {
    try {
      // Reset progress state
      setExportProgress({
        visible: true,
        step: 'generating',
        cancelled: false,
      });

      // Simulate some processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if user cancelled during generation
      if (exportProgress.cancelled) {
        setExportProgress(prev => ({ ...prev, visible: false }));
        return;
      }

      const filePath = await PaymentService.exportToExcel();
      const fileName = filePath.split('/').pop() || 'SpendBook.xlsx';

      // Update progress to ready state
      setExportProgress(prev => ({
        ...prev,
        step: 'ready',
        filePath,
        fileName,
      }));
    } catch (error) {
      setExportProgress(prev => ({ ...prev, visible: false }));
      Alert.alert('Error', 'Failed to generate Excel file');
    }
  };

  const handleDownload = async () => {
    try {
      setExportProgress(prev => ({ ...prev, step: 'downloading' }));

      if (!exportProgress.filePath) {
        throw new Error('No file path available');
      }

      // Add a small delay to show the downloading state
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if file exists
      const fileExists = await RNFS.exists(exportProgress.filePath);

      if (fileExists) {
        setExportProgress(prev => ({ ...prev, visible: false }));

        Alert.alert(
          'Download Complete! 🎉',
          `Excel file successfully saved!\n\n📁 Location: Downloads/${exportProgress.fileName}\n\n💡 You can find it in your device's Downloads folder or File Manager`,
          [
            {
              text: 'Open File Manager',
              onPress: () => {
                // Try to open Downloads folder
                if (Platform.OS === 'android') {
                  Linking.openURL(
                    'content://com.android.externalstorage.documents/document/primary%3ADownload',
                  ).catch(() => {
                    // Fallback to generic file manager intent
                    Linking.openURL(
                      'content://com.android.providers.downloads.documents/root/downloads',
                    ).catch(() => console.log('Cannot open file manager'));
                  });
                }
              },
            },
            { text: 'Great!', style: 'default' },
          ],
        );
      } else {
        throw new Error('File was not created successfully');
      }
    } catch (error) {
      setExportProgress(prev => ({ ...prev, visible: false }));
      Alert.alert(
        'Download Error',
        'There was an issue saving the file. Please try again.',
        [{ text: 'OK' }],
      );
    }
  };

  const handleCancelExport = () => {
    if (exportProgress.step === 'generating') {
      setExportProgress(prev => ({ ...prev, cancelled: true, visible: false }));
    } else {
      setExportProgress(prev => ({ ...prev, visible: false }));
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 16,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      ...textStyles.heading,
      color: theme.colors.text,
    },
    filterSection: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    filterContainer: {
      flexDirection: 'row',
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      padding: 4,
    },
    filterButton: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    filterButtonActive: {
      backgroundColor: theme.colors.primary,
    },
    filterButtonText: {
      ...textStyles.body,
      color: theme.colors.textSecondary,
    },
    filterButtonTextActive: {
      color: '#ffffff',
    },
    exportButton: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
      flex: 1,
    },
    actionButtonsContainer: {
      flexDirection: 'row',
      marginTop: 8,
      paddingHorizontal: 20,
      gap: 10,
    },
    actionSeparator: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginHorizontal: 20,
      marginTop: 12,
      marginBottom: 8,
    },
    actionButtonPrimary: {
      backgroundColor: theme.colors.primary,
    },
    actionButtonSecondary: {
      backgroundColor: theme.colors.accent,
    },
    exportButtonText: {
      ...textStyles.body,
      color: '#ffffff',
      fontWeight: '600',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      ...textStyles.body,
      color: theme.colors.textSecondary,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
    },
    emptyStateText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 8,
    },
    emptyStateSubtext: {
      ...textStyles.caption,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    monthSection: {
      marginBottom: 20,
    },
    monthHeader: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    dateHeader: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: theme.colors.background,
      borderTopWidth: 0.5,
      borderTopColor: theme.colors.border,
    },
    dateHeaderText: {
      ...textStyles.caption,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    recentTransactionsList: {
      flex: 1,
      paddingHorizontal: 20,
    },
    transactionCard: {
      backgroundColor: theme.colors.card,
      marginBottom: 1,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    transactionContainer: {
      flex: 1,
      paddingHorizontal: 20,
    },
    monthTitle: {
      ...textStyles.heading,
      color: theme.colors.text,
    },
    monthTotal: {
      ...textStyles.caption,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    paymentCard: {
      backgroundColor: theme.colors.card,
      marginBottom: 1,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    paymentContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    paymentIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    paymentEmoji: {
      fontSize: 18,
    },
    paymentInfo: {
      flex: 1,
    },
    paymentDescription: {
      ...textStyles.body,
      fontWeight: '600',
      color: theme.colors.text,
    },
    paymentCategory: {
      ...textStyles.caption,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    paymentRight: {
      alignItems: 'flex-end',
    },
    paymentAmount: {
      ...textStyles.body,
      fontWeight: '600',
      color: theme.colors.text,
    },
    paymentType: {
      ...textStyles.caption,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    paymentDate: {
      ...textStyles.caption,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      margin: 20,
      borderRadius: 12,
      width: '85%',
      maxHeight: '70%',
    },
    modalHeader: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    modalTitle: {
      ...textStyles.heading,
      color: theme.colors.text,
      textAlign: 'center',
    },
    modalButtons: {
      padding: 20,
      gap: 10,
    },
    modalButton: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 8,
    },
    modalButtonPrimary: {
      backgroundColor: theme.colors.primary,
    },
    modalButtonSecondary: {
      backgroundColor: theme.colors.accent,
    },
    modalButtonText: {
      ...textStyles.body,
      color: '#ffffff',
      fontWeight: '600',
    },
    progressContent: {
      paddingVertical: 30,
      paddingHorizontal: 20,
      alignItems: 'center',
    },
    progressText: {
      ...textStyles.body,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: 8,
    },
    progressSubtext: {
      ...textStyles.caption,
      textAlign: 'center',
      fontStyle: 'italic',
    },
    modalButtonTextWhite: {
      fontSize: 16,
      fontWeight: '600',
      color: '#fff',
      textAlign: 'center',
    },
    progressIndicator: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(0, 122, 255, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    progressEmoji: {
      fontSize: 32,
    },
    progressBar: {
      width: '100%',
      height: 4,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      borderRadius: 2,
      marginTop: 20,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      width: '70%',
      borderRadius: 2,
    },
    downloadingAnimation: {
      width: '100%',
    },
    successBadge: {
      backgroundColor: 'rgba(52, 199, 89, 0.1)',
      borderRadius: 20,
      paddingVertical: 8,
      paddingHorizontal: 16,
      marginTop: 16,
    },
    successText: {
      fontSize: 14,
      color: '#34C759',
      fontWeight: '500',
      textAlign: 'center',
    },
    cancelButton: {
      borderWidth: 1,
    },
    downloadButton: {
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading payment history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>History</Text>
      </View>

      {/* Filter Options */}
      <View style={styles.filterSection}>
        <View style={styles.filterContainer}>
          {(['all', 'manual', 'sms'] as FilterType[]).map(filterType => (
            <TouchableOpacity
              key={filterType}
              style={[
                styles.filterButton,
                filter === filterType && styles.filterButtonActive,
              ]}
              onPress={() => handleFilterChange(filterType)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filter === filterType && styles.filterButtonTextActive,
                ]}
              >
                {filterType === 'all'
                  ? 'All'
                  : filterType === 'manual'
                  ? 'Manual'
                  : 'SMS'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={[styles.exportButton, styles.actionButtonPrimary]}
          onPress={handleExportAll}
        >
          <Text style={styles.exportButtonText}>Download Excel</Text>
        </TouchableOpacity>
      </View>

      {/* Separator */}
      <View style={styles.actionSeparator} />

      {/* Content */}
      {loading ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Loading history...</Text>
        </View>
      ) : filteredPayments.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No payment history found</Text>
          <Text style={styles.emptyStateSubtext}>
            {filter !== 'all'
              ? `No ${filter} payments found`
              : 'Add some payments to see history'}
          </Text>
        </View>
      ) : (
        <View style={styles.transactionContainer}>
          <TransactionList
            payments={filteredPayments}
            onPaymentPress={payment => {
              navigation.navigate('PaymentActions', { payment });
            }}
            selectedPaymentId={null}
            showScrollView={true}
          />
        </View>
      )}

      {/* Export Progress Modal */}
      <Modal
        visible={exportProgress.visible}
        transparent
        animationType="fade"
        onRequestClose={handleCancelExport}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {exportProgress.step === 'generating' && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    🔄 Generating Excel File
                  </Text>
                </View>
                <View style={styles.progressContent}>
                  <View style={styles.progressIndicator}>
                    <Text style={styles.progressEmoji}>📊</Text>
                  </View>
                  <Text
                    style={[styles.progressText, { color: theme.colors.text }]}
                  >
                    Preparing your payment data for Excel export
                  </Text>
                  <Text
                    style={[
                      styles.progressSubtext,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Processing {payments.length} transactions...
                  </Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { backgroundColor: theme.colors.primary },
                      ]}
                    />
                  </View>
                </View>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      styles.cancelButton,
                      {
                        backgroundColor: theme.colors.error + '20',
                        borderColor: theme.colors.error,
                      },
                    ]}
                    onPress={handleCancelExport}
                  >
                    <Text
                      style={[
                        styles.modalButtonText,
                        { color: theme.colors.error },
                      ]}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {exportProgress.step === 'ready' && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>✅ Excel File Ready!</Text>
                </View>
                <View style={styles.progressContent}>
                  <View style={styles.progressIndicator}>
                    <Text style={styles.progressEmoji}>🎉</Text>
                  </View>
                  <Text
                    style={[styles.progressText, { color: theme.colors.text }]}
                  >
                    {exportProgress.fileName}
                  </Text>
                  <Text
                    style={[
                      styles.progressSubtext,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Ready to download to Downloads folder
                  </Text>
                  <View style={styles.successBadge}>
                    <Text style={styles.successText}>
                      📋 {payments.length} transactions included
                    </Text>
                  </View>
                </View>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      styles.cancelButton,
                      {
                        backgroundColor: theme.colors.textSecondary + '20',
                        borderColor: theme.colors.textSecondary,
                      },
                    ]}
                    onPress={handleCancelExport}
                  >
                    <Text
                      style={[
                        styles.modalButtonText,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      styles.downloadButton,
                      { backgroundColor: theme.colors.primary },
                    ]}
                    onPress={handleDownload}
                  >
                    <Text style={styles.modalButtonTextWhite}>💾 Download</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {exportProgress.step === 'downloading' && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>💾 Downloading...</Text>
                </View>
                <View style={styles.progressContent}>
                  <View style={styles.progressIndicator}>
                    <Text style={styles.progressEmoji}>⬇️</Text>
                  </View>
                  <Text
                    style={[styles.progressText, { color: theme.colors.text }]}
                  >
                    Saving to Downloads folder
                  </Text>
                  <Text
                    style={[
                      styles.progressSubtext,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Almost done...
                  </Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressBarFill,
                        styles.downloadingAnimation,
                        { backgroundColor: theme.colors.primary },
                      ]}
                    />
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default HistoryScreen;
