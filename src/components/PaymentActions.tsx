import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Payment, RootStackParamList } from '../types';
import { useTheme } from '../context/ThemeContext';
import { textStyles } from '../utils/typography';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface PaymentActionsProps {
  selectedPaymentId: string | null;
  payments: Payment[];
  onPaymentDeleted: () => void;
  onSelectionClear: () => void;
}

const PaymentActions: React.FC<PaymentActionsProps> = ({
  selectedPaymentId,
  payments,
  onPaymentDeleted: _onPaymentDeleted,
  onSelectionClear,
}) => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const selectedPayment = selectedPaymentId 
    ? payments.find(p => p.id === selectedPaymentId) 
    : null;

  if (!selectedPaymentId || !selectedPayment) {
    return null;
  }

  const handleOpenActions = () => {
    navigation.navigate('PaymentActions', { payment: selectedPayment });
    onSelectionClear();
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: 'transparent',
      paddingHorizontal: 20,
      paddingVertical: 12,
      paddingBottom: 100,
      marginTop: 8,
    },
    actionButton: {
      backgroundColor: theme.colors.primary + '15',
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.primary + '30',
    },
    actionButtonText: {
  ...textStyles.body,
  color: theme.colors.primary,
    },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleOpenActions}
        activeOpacity={0.8}
      >
        <Text style={styles.actionButtonText}>View Payment Details</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PaymentActions;
