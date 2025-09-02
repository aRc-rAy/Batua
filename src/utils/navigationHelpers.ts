import { StackNavigationProp } from '@react-navigation/stack';
import { Payment, RootStackParamList } from '../types';

/**
 * Navigation helper utilities for consistent navigation patterns across the app
 */

type NavigationProp = StackNavigationProp<RootStackParamList>;

/**
 * Navigate to payment details/actions screen
 * This provides a consistent way to view payment details across the app
 */
export const navigateToPaymentDetails = (
  navigation: NavigationProp,
  payment: Payment
) => {
  navigation.navigate('PaymentActions', { payment });
};

/**
 * Navigate to edit payment screen
 * For cases where direct editing is needed
 */
export const navigateToEditPayment = (
  navigation: NavigationProp,
  payment: Payment
) => {
  navigation.navigate('EditPayment', { payment });
};

/**
 * Navigate to add payment screen
 */
export const navigateToAddPayment = (navigation: NavigationProp) => {
  navigation.navigate('AddPayment');
};

/**
 * Create a reusable payment press handler
 * This ensures consistent behavior when tapping on payment cards
 */
export const createPaymentPressHandler = (navigation: NavigationProp) => {
  return (payment: Payment) => {
    navigateToPaymentDetails(navigation, payment);
  };
};
