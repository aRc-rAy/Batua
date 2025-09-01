import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  TextInput,
  Modal,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Payment } from '../types';
import { PaymentService } from '../services/PaymentService';
import { BudgetService } from '../services/BudgetService';
import { WidgetService } from '../services/WidgetService';
import { useTheme } from '../context/ThemeContext';
import { textStyles, fontFamilies } from '../utils/typography';
import { formatAmount } from '../utils/formatting';
import TransactionList from '../components/TransactionList';
import Ionicons from 'react-native-vector-icons/Ionicons';

type NavigationProp = StackNavigationProp<RootStackParamList>;

// Slide Switch Component
const SlideSwitch: React.FC<{
  value: boolean;
  onToggle: () => void;
  theme: any;
}> = ({ value, onToggle, theme }) => {
  const [animation] = useState(new Animated.Value(value ? 1 : 0));

  React.useEffect(() => {
    Animated.timing(animation, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value, animation]);

  const translateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 26],
  });

  const switchBackgroundColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.border, theme.colors.primary],
  });

  const switchStyles = StyleSheet.create({
    container: {
      width: 50,
      height: 26,
      borderRadius: 13,
      padding: 2,
      justifyContent: 'center',
    },
    thumb: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: '#ffffff',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
      justifyContent: 'center',
      alignItems: 'center',
    },
    icon: {
      ...textStyles.caption,
    },
  });

  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.8}>
      <Animated.View
        style={[
          switchStyles.container,
          { backgroundColor: switchBackgroundColor },
        ]}
      >
        <Animated.View
          style={[switchStyles.thumb, { transform: [{ translateX }] }]}
        >
          {value ? (
            <Ionicons name="sunny" size={16} color={theme.colors.primary} />
          ) : (
            <Ionicons name="moon" size={16} color={theme.colors.primary} />
          )}
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { theme, toggleTheme } = useTheme();

  const screenHeight = Dimensions.get('window').height;
  const tabBarHeight = 65;
  const safeAreaBottom = 30;
  const appHeaderHeight = 65;
  const welcomeSectionHeight = 60;
  const summaryHeight = 80;
  const actionButtonHeight = 60;
  const sectionTitleHeight = 30;
  const extraPadding = 50;
  const availableHeight =
    screenHeight -
    tabBarHeight -
    safeAreaBottom -
    appHeaderHeight -
    welcomeSectionHeight -
    summaryHeight -
    actionButtonHeight -
    sectionTitleHeight -
    extraPadding;

  const [todaySpending, setTodaySpending] = useState(0);
  const [monthSpending, setMonthSpending] = useState(0);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetStatus, setBudgetStatus] = useState<any>(null);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour >= 19 || hour < 5) return 'night';
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'noon';
    return 'evening';
  };

  const getTimeIcon = () => {
    const hour = new Date().getHours();
    if (hour >= 19 || hour < 5) return 'moon';
    if (hour >= 5 && hour < 12) return 'sunny';
    if (hour >= 12 && hour < 17) return 'sunny';
    return 'partly-sunny';
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [spending, payments] = await Promise.all([
        PaymentService.getTotalSpending(),
        PaymentService.getRecentPayments(3),
      ]);

      setTodaySpending(spending.today);
      setMonthSpending(spending.month);
      setRecentPayments(payments);

      const budgetStatusWithSpending = await BudgetService.getBudgetStatus(
        spending.month,
      );
      setBudgetStatus(budgetStatusWithSpending);

      WidgetService.updateWidget(spending.today, spending.month).catch(
        console.warn,
      );
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
    }, []),
  );

  const handleAddPayment = () => {
    navigation.navigate('AddPayment');
  };

  const handleSetBudget = async () => {
    const amount = parseFloat(budgetAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid budget amount');
      return;
    }

    try {
      await BudgetService.setMonthlyBudget(amount);
      setBudgetModalVisible(false);
      setBudgetAmount('');
      setIsEditingBudget(false);
      loadData();
      Alert.alert(
        'Success',
        isEditingBudget
          ? 'Monthly budget updated successfully!'
          : 'Monthly budget set successfully!',
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to set budget');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      flex: 1,
    },
    appHeader: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 16,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    appTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    appTitleLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    appIcon: {
      width: 42,
      height: 42,
      resizeMode: 'cover',
    },
    appIconContainer: {
      width: 42,
      height: 42,
      marginRight: 12,
      backgroundColor: 'transparent',
      overflow: 'visible',
    },
    appName: {
      ...textStyles.heading,
      color: theme.colors.text,
    },
    welcomeSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    welcomeLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    welcomeIcon: {
      marginRight: 12,
    },
    welcomeRight: {
      alignItems: 'flex-end',
      backgroundColor: theme.colors.card,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    welcomeText: {
      ...textStyles.large,
      color: theme.colors.text,
      fontWeight: '600',
    },
    dateText: {
      ...textStyles.caption,
      color: theme.colors.primary,
      fontWeight: '500',
      fontFamily: fontFamilies.regular,
    },
    summaryContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 8,
      gap: 10,
    },
    summaryCard: {
      flex: 1,
      backgroundColor: theme.colors.card,
      padding: 10,
      borderRadius: 8,
      alignItems: 'center',
    },
    summaryLabel: {
      ...textStyles.caption,
      color: theme.colors.textSecondary,
      marginBottom: 3,
      textAlign: 'center',
    },
    summaryAmount: {
      ...textStyles.bodySemibold,
      color: theme.colors.primary,
    },
    budgetContainer: {
      marginHorizontal: 20,
      marginVertical: 4,
    },
    budgetHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    budgetTitle: {
      ...textStyles.bodySemibold,
      color: theme.colors.text,
      flex: 1,
    },
    editBudgetButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    editBudgetButtonText: {
      ...textStyles.captionMedium,
      color: theme.colors.primary,
    },
    budgetCardsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 8,
    },
    budgetCard: {
      flex: 1,
      minWidth: '47%',
      backgroundColor: theme.colors.card,
      padding: 8,
      borderRadius: 6,
      alignItems: 'center',
    },
    budgetCardLabel: {
      ...textStyles.caption,
      color: theme.colors.textSecondary,
      marginBottom: 3,
      textAlign: 'center',
    },
    budgetCardValue: {
      ...textStyles.smallSemibold,
      color: theme.colors.primary,
      textAlign: 'center',
    },
    budgetCardValueSuccess: {
      color: theme.colors.success,
    },
    budgetCardValueError: {
      color: theme.colors.error,
    },
    setBudgetButton: {
      marginTop: 8,
      paddingVertical: 14,
      paddingHorizontal: 24,
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      alignItems: 'center',
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    setBudgetButtonText: {
      ...textStyles.button,
      color: theme.colors.surface,
      fontWeight: '600',
    },
    budgetLabelWithMargin: {
      ...textStyles.small,
      color: theme.colors.textSecondary,
      marginBottom: 15,
      textAlign: 'center',
    },
    actionsContainer: {
      paddingHorizontal: 20,
      paddingVertical: 4,
    },
    sectionTitle: {
      ...textStyles.bodySemibold,
      color: theme.colors.text,
      marginBottom: 6,
    },
    actionButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignItems: 'center',
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
      marginBottom: 8,
    },
    actionButtonText: {
      ...textStyles.button,
      color: theme.colors.surface,
      fontWeight: '600',
    },
    recentContainer: {
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 20, // Add bottom padding for better spacing
    },
    transactionListContainer: {
      height: availableHeight,
      backgroundColor: 'transparent',
    },
    recentTransactionsList: {
      maxHeight: 400, // Use maxHeight but increase it to use more space
      flexGrow: 0,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 20,
    },
    emptyStateText: {
      ...textStyles.body,
      color: theme.colors.textSecondary,
      marginBottom: 8,
    },
    emptyStateSubtext: {
      ...textStyles.small,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    dateHeader: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: theme.colors.background,
      borderTopWidth: 0.5,
      borderTopColor: theme.colors.border,
    },
    dateHeaderText: {
      ...textStyles.smallSemibold,
      color: theme.colors.textSecondary,
    },
    transactionCard: {
      backgroundColor: theme.colors.card,
      marginBottom: 1,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    transactionContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    transactionIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    transactionEmoji: {
      fontSize: 18, // Keep emoji size as is
    },
    transactionInfo: {
      flex: 1,
    },
    transactionDescription: {
      ...textStyles.smallSemibold,
      color: theme.colors.text,
      marginBottom: 2,
    },
    transactionCategory: {
      ...textStyles.caption,
      color: theme.colors.textSecondary,
    },
    transactionAmount: {
      alignItems: 'flex-end',
    },
    transactionAmountText: {
      ...textStyles.smallSemibold,
      color: theme.colors.text,
    },
    transactionDate: {
      ...textStyles.caption,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    transactionCardSelected: {
      borderWidth: 2,
      borderColor: theme.colors.primary,
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
      padding: 20,
      borderRadius: 12,
      width: '80%',
    },
    modalTitle: {
      ...textStyles.large,
      color: theme.colors.text,
      marginBottom: 15,
      textAlign: 'center',
    },
    modalInput: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      padding: 12,
      ...textStyles.body,
      color: theme.colors.text,
      marginBottom: 15,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 10,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 10,
      alignItems: 'center',
    },
    modalButtonPrimary: {
      backgroundColor: theme.colors.primary,
    },
    modalButtonSecondary: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    modalButtonText: {
      ...textStyles.buttonSmall,
      fontWeight: '600',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />

      {/* App Header */}
      <View style={styles.appHeader}>
        <View style={styles.appTitleRow}>
          <View style={styles.appTitleLeft}>
            <View style={styles.appIconContainer}>
              <Image
                source={require('../assets/app_icon.png')}
                style={styles.appIcon}
              />
            </View>
            <Text style={styles.appName}>SpendBook</Text>
          </View>
          <SlideSwitch
            value={theme.isDark}
            onToggle={toggleTheme}
            theme={theme}
          />
        </View>
      </View>

      <View style={styles.scrollContent}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeLeft}>
            <Ionicons
              name={getTimeIcon()}
              size={24}
              color={theme.colors.primary}
              style={styles.welcomeIcon}
            />
            <Text style={styles.welcomeText}>Good {getTimeOfDay()}!</Text>
          </View>
          <View style={styles.welcomeRight}>
            <Text style={styles.dateText}>{currentDate}</Text>
          </View>
        </View>

        {/* Monthly Budget Plan */}
        {budgetStatus?.budget ? (
          <View style={styles.budgetContainer}>
            <View style={styles.budgetHeader}>
              <Text style={styles.budgetTitle}>Monthly Budget</Text>
              <TouchableOpacity
                style={styles.editBudgetButton}
                onPress={() => {
                  setBudgetAmount(budgetStatus.budget.monthlyLimit.toString());
                  setIsEditingBudget(true);
                  setBudgetModalVisible(true);
                }}
              >
                <Text style={styles.editBudgetButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>

            {/* Budget Cards */}
            <View style={styles.budgetCardsContainer}>
              {/* Today's Spending */}
              <View style={styles.budgetCard}>
                <Text style={styles.budgetCardLabel}>Today's Spending</Text>
                <Text style={styles.budgetCardValue}>
                  {loading ? '...' : `₹${formatAmount(todaySpending)}`}
                </Text>
              </View>

              {/* This Month Spending */}
              <View style={styles.budgetCard}>
                <Text style={styles.budgetCardLabel}>This Month</Text>
                <Text style={styles.budgetCardValue}>
                  {loading ? '...' : `₹${formatAmount(monthSpending)}`}
                </Text>
              </View>

              {/* Budget Remaining */}
              <View style={styles.budgetCard}>
                <Text style={styles.budgetCardLabel}>Budget Remaining</Text>
                <Text
                  style={[
                    styles.budgetCardValue,
                    budgetStatus.remainingBudget > 0
                      ? styles.budgetCardValueSuccess
                      : styles.budgetCardValueError,
                  ]}
                >
                  ₹{formatAmount(budgetStatus.remainingBudget)}
                </Text>
              </View>

              {/* Suggested Daily Spend */}
              <View style={styles.budgetCard}>
                <Text style={styles.budgetCardLabel}>Suggested Daily</Text>
                <Text style={styles.budgetCardValue}>
                  ₹{formatAmount(budgetStatus.suggestedDailySpend)}
                </Text>
              </View>

              {/* Days Remaining */}
              <View style={styles.budgetCard}>
                <Text style={styles.budgetCardLabel}>Days Remaining</Text>
                <Text style={styles.budgetCardValue}>
                  {budgetStatus.daysRemaining} days
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.budgetContainer}>
            <Text style={styles.budgetTitle}>Set Monthly Budget</Text>
            <Text style={styles.budgetLabelWithMargin}>
              Track spending and get daily insights
            </Text>

            {/* Today's and This Month spending cards even without budget */}
            <View style={styles.budgetCardsContainer}>
              <View style={styles.budgetCard}>
                <Text style={styles.budgetCardLabel}>Today's Spending</Text>
                <Text style={styles.budgetCardValue}>
                  {loading ? '...' : `₹${formatAmount(todaySpending)}`}
                </Text>
              </View>

              <View style={styles.budgetCard}>
                <Text style={styles.budgetCardLabel}>This Month</Text>
                <Text style={styles.budgetCardValue}>
                  {loading ? '...' : `₹${formatAmount(monthSpending)}`}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.setBudgetButton}
              onPress={() => {
                setBudgetAmount('');
                setIsEditingBudget(false);
                setBudgetModalVisible(true);
              }}
            >
              <Text style={styles.setBudgetButtonText}>Set Monthly Budget</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleAddPayment}
          >
            <Text style={styles.actionButtonText}>+ Add Payment</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Transactions */}
        <View style={styles.recentContainer}>
          <Text style={styles.sectionTitle}>
            Recent ({recentPayments.length})
          </Text>
          {loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Loading...</Text>
            </View>
          ) : recentPayments.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No transactions yet</Text>
            </View>
          ) : (
            <View style={styles.transactionListContainer}>
              <TransactionList
                payments={recentPayments}
                onPaymentPress={payment => {
                  navigation.navigate('PaymentActions', { payment });
                }}
                selectedPaymentId={null}
                showScrollView={true}
                maxHeight={availableHeight}
              />
            </View>
          )}
        </View>
      </View>

      {/* Budget Modal */}
      <Modal
        visible={budgetModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setBudgetModalVisible(false);
          setBudgetAmount('');
          setIsEditingBudget(false);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditingBudget ? 'Edit Monthly Budget' : 'Set Monthly Budget'}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter budget amount"
              placeholderTextColor={theme.colors.textSecondary}
              value={budgetAmount}
              onChangeText={setBudgetAmount}
              keyboardType="numeric"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => {
                  setBudgetModalVisible(false);
                  setBudgetAmount('');
                  setIsEditingBudget(false);
                }}
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    { color: theme.colors.primary },
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleSetBudget}
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    { color: theme.colors.surface },
                  ]}
                >
                  {isEditingBudget ? 'Update Budget' : 'Set Budget'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default HomeScreen;
