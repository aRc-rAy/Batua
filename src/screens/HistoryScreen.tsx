import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Payment, RootStackParamList } from '../types';
import { PaymentService } from '../services/PaymentService';
import { useTheme } from '../context/ThemeContext';
import { textStyles } from '../utils/typography';
import { createPaymentPressHandler } from '../utils/navigationHelpers';
import TransactionList from '../components/TransactionList';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const HistoryScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const handlePaymentPress = createPaymentPressHandler(navigation);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      const allPayments = await PaymentService.getAllPayments();
      setPayments(allPayments);
    } catch (error) {
      console.error('Error loading payments:', error);
      Alert.alert('Error', 'Failed to load payment history');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadPayments();
    }, [loadPayments]),
  );

  const historyStyles = StyleSheet.create({
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
    content: {
      flex: 1,
    },
    transactionContainer: {
      paddingTop: 10,
      flex: 1,
      paddingHorizontal: 20,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    emptyText: {
      ...textStyles.subheading,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 20,
    },
    addButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 25,
    },
    addButtonText: {
      ...textStyles.body,
      color: theme.colors.surface,
      fontWeight: '600',
    },
  });

  if (loading) {
    return (
      <SafeAreaView style={historyStyles.container}>
        <View style={historyStyles.header}>
          <Ionicons name="time-outline" size={24} color={theme.colors.text} />
          <Text style={historyStyles.headerTitle}>Payment History</Text>
        </View>
        <View style={historyStyles.emptyContainer}>
          <Text style={historyStyles.emptyText}>Loading payments...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={historyStyles.container}>
      <View style={historyStyles.header}>
        <Ionicons name="time-outline" size={24} color={theme.colors.text} />
        <Text style={historyStyles.headerTitle}>History</Text>
      </View>

      <View style={historyStyles.content}>
        {payments.length === 0 ? (
          <View style={historyStyles.emptyContainer}>
            <Text style={historyStyles.emptyText}>
              No payments recorded yet.{'\n'}Start by adding your first payment!
            </Text>
            <TouchableOpacity
              style={historyStyles.addButton}
              onPress={() => navigation.navigate('AddPayment')}
            >
              <Text style={historyStyles.addButtonText}>Add Payment</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={historyStyles.transactionContainer}>
            <TransactionList
              payments={payments}
              onPaymentPress={handlePaymentPress}
              selectedPaymentId={null}
              showScrollView={true}
              removeHorizontalMargins={true}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default HistoryScreen;
