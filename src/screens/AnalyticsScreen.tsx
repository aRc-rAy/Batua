import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Payment, PaymentCategory } from '../types';
import { PaymentService } from '../services/PaymentService';
import { useTheme } from '../context/ThemeContext';
import { textStyles, fontWeights } from '../utils/typography';
import { formatAmount, formatAmountChart, formatAmountCompact } from '../utils/formatting';
import { PieChart } from 'react-native-chart-kit';
import { BarChart } from 'react-native-gifted-charts';
import Ionicons from 'react-native-vector-icons/Ionicons';

type ChartType = 'bar' | 'pie';
type TimeGrouping = 'week' | 'month' | 'year';

const screenWidth = Dimensions.get('window').width;

const AnalyticsScreen: React.FC = () => {
  const { theme } = useTheme();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeGrouping, setTimeGrouping] = useState<TimeGrouping>('week');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [spendingInsights, setSpendingInsights] = useState<any>(null);

  // Process data by time grouping
  const processTimeGroupedData = (
    paymentsData: Payment[],
    grouping: TimeGrouping,
  ) => {
    const now = new Date();
    const dataMap = new Map<string, number>();
    const labels: string[] = [];

    let periods: number;
    let formatLabel: (date: Date) => string;
    let getKey: (date: Date) => string;

    if (grouping === 'week') {
      periods = 7; // Last 7 days
      formatLabel = (date: Date) => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const dayIndex = (date.getDay() + 6) % 7; // Convert to Monday = 0
        return days[dayIndex];
      };
      getKey = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
    } else if (grouping === 'month') {
      periods = 12; // Last 12 months
      formatLabel = (date: Date) => {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          year: '2-digit',
        });
      };
      getKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}`;
    } else {
      periods = 4; // Last 4 years
      formatLabel = (date: Date) => {
        return date.getFullYear().toString();
      };
      getKey = (date: Date) => date.getFullYear().toString();
    }

    // Initialize periods with correct dates
    for (let i = 0; i < periods; i++) {
      let date = new Date();
      if (grouping === 'week') {
        const today = new Date(now);
        const dayOfWeek = (today.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
        const monday = new Date(today);
        monday.setDate(today.getDate() - dayOfWeek);

        date = new Date(monday);
        date.setDate(monday.getDate() + i);
      } else if (grouping === 'month') {
        date.setMonth(now.getMonth() - (periods - 1 - i));
        date.setDate(1);
      } else {
        date.setFullYear(now.getFullYear() - (periods - 1 - i));
        date.setMonth(0, 1);
      }

      const key = getKey(date);
      const label = formatLabel(date);
      dataMap.set(key, 0);
      labels.push(label);
    }

    // Filter payments to only include relevant time range
    const relevantPayments = paymentsData.filter(payment => {
      const paymentDate = new Date(payment.date);
      const today = new Date();

      if (grouping === 'week') {
        const dayOfWeek = (today.getDay() + 6) % 7;
        const monday = new Date(today);
        monday.setDate(today.getDate() - dayOfWeek);
        monday.setHours(0, 0, 0, 0);

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        return paymentDate >= monday && paymentDate <= sunday;
      } else if (grouping === 'month') {
        const twelveMonthsAgo = new Date(today);
        twelveMonthsAgo.setMonth(today.getMonth() - 11);
        twelveMonthsAgo.setDate(1);
        twelveMonthsAgo.setHours(0, 0, 0, 0);

        return paymentDate >= twelveMonthsAgo;
      } else {
        const fourYearsAgo = new Date(today);
        fourYearsAgo.setFullYear(today.getFullYear() - 3);
        fourYearsAgo.setMonth(0, 1);
        fourYearsAgo.setHours(0, 0, 0, 0);

        return paymentDate >= fourYearsAgo;
      }
    });

    // Aggregate payments by period
    relevantPayments.forEach(payment => {
      const paymentDate = new Date(payment.date);
      const key = getKey(paymentDate);
      if (dataMap.has(key)) {
        dataMap.set(key, dataMap.get(key)! + payment.amount);
      }
    });

    const data = labels.map((label, index) => {
      // Find the corresponding key for this label by recreating the date
      let date = new Date();
      if (grouping === 'week') {
        const today = new Date(now);
        const dayOfWeek = (today.getDay() + 6) % 7;
        const monday = new Date(today);
        monday.setDate(today.getDate() - dayOfWeek);
        date = new Date(monday);
        date.setDate(monday.getDate() + index);
      } else if (grouping === 'month') {
        date.setMonth(now.getMonth() - (periods - 1 - index));
        date.setDate(1);
      } else {
        date.setFullYear(now.getFullYear() - (periods - 1 - index));
        date.setMonth(0, 1);
      }

      const key = getKey(date);
      return dataMap.get(key) || 0;
    });

    return { labels, data };
  };

  // Compute colors for chart option labels
  const chartBarColor = chartType === 'bar' ? '#ffffff' : theme.colors.text;
  const chartPieColor = chartType === 'pie' ? '#ffffff' : theme.colors.text;

  const getCategoryData = (paymentsData: Payment[]) => {
    const categoryTotals: Record<PaymentCategory, number> = {
      Food: 0,
      Travel: 0,
      Clothes: 0,
      Entertainment: 0,
      Bills: 0,
      Healthcare: 0,
      Others: 0,
    };

    paymentsData.forEach(payment => {
      categoryTotals[payment.category] += payment.amount;
    });

    return categoryTotals;
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [paymentsData, insights] = await Promise.all([
        PaymentService.getAllPayments(),
        PaymentService.getSpendingInsights(),
      ]);
      setPayments(paymentsData);
      setSpendingInsights(insights);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const chartData = processTimeGroupedData(payments, timeGrouping);
  const categoryData = getCategoryData(payments);

  const hasData = payments.length > 0;
  const totalSpending = chartData.data.reduce((sum, value) => sum + value, 0);

  // Filter payments by time period for pie chart
  const getFilteredPaymentsForPieChart = (
    paymentsData: Payment[],
    grouping: TimeGrouping,
  ) => {
    const now = new Date();

    if (grouping === 'week') {
      const dayOfWeek = (now.getDay() + 6) % 7;
      const monday = new Date(now);
      monday.setDate(now.getDate() - dayOfWeek);
      monday.setHours(0, 0, 0, 0);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      return paymentsData.filter(payment => {
        const paymentDate = new Date(payment.date);
        return paymentDate >= monday && paymentDate <= sunday;
      });
    } else if (grouping === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );

      return paymentsData.filter(payment => {
        const paymentDate = new Date(payment.date);
        return paymentDate >= startOfMonth && paymentDate <= endOfMonth;
      });
    } else {
      // year
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

      return paymentsData.filter(payment => {
        const paymentDate = new Date(payment.date);
        return paymentDate >= startOfYear && paymentDate <= endOfYear;
      });
    }
  };

  // Get filtered category data for pie chart
  const getFilteredCategoryData = (
    paymentsData: Payment[],
    grouping: TimeGrouping,
  ) => {
    const filteredPayments = getFilteredPaymentsForPieChart(
      paymentsData,
      grouping,
    );
    return getCategoryData(filteredPayments);
  };

  // Get period display name
  const getPeriodDisplayName = (grouping: TimeGrouping) => {
    const now = new Date();

    if (grouping === 'week') {
      return 'This Week';
    } else if (grouping === 'month') {
      return now.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });
    } else {
      return now.getFullYear().toString();
    }
  };

  // Generate formatted y-axis labels
  const getYAxisLabels = (data: number[]) => {
    const maxVal = Math.max(...data) * 1.2;
    const sections = 6;
    const step = maxVal / sections;
    const labels = [];

    for (let i = 0; i <= sections; i++) {
      const value = step * i;
      if (value >= 100000) {
        labels.push(`${(value / 100000).toFixed(1)}L`);
      } else if (value >= 1000) {
        labels.push(`${(value / 1000).toFixed(1)}k`);
      } else {
        labels.push(value.toFixed(0));
      }
    }

    return labels;
  };

  // Find highest and lowest spending periods
  let maxValue = 0;
  let minValue = 0;
  let maxIndex = -1;
  let minIndex = -1;
  let maxLabel = '';
  let minLabel = '';

  if (hasData && chartData.data.length > 0) {
    const nonZeroData = chartData.data.filter(val => val > 0);
    if (nonZeroData.length > 0) {
      maxValue = Math.max(...chartData.data);
      minValue = Math.min(...nonZeroData); // Only consider non-zero values for minimum
      maxIndex = chartData.data.indexOf(maxValue);
      minIndex = chartData.data.findIndex(val => val === minValue && val > 0);
      maxLabel = chartData.labels[maxIndex];
      minLabel = minIndex >= 0 ? chartData.labels[minIndex] : '';
    }
  }

  // Prepare pie chart data with enhanced formatting
  const pieChartData = Object.entries(
    chartType === 'pie'
      ? getFilteredCategoryData(payments, timeGrouping)
      : categoryData,
  )
    .filter(([_, value]) => value > 0)
    .map(([category, amount], index) => {
      const colors = [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40',
        '#FF6384',
      ];
      const filteredPayments =
        chartType === 'pie'
          ? getFilteredPaymentsForPieChart(payments, timeGrouping)
          : payments;
      const periodTotal = filteredPayments.reduce(
        (sum, payment) => sum + payment.amount,
        0,
      );
      const percentage =
        periodTotal > 0 ? ((amount / periodTotal) * 100).toFixed(1) : '0';
      return {
        name: category,
        amount: amount,
        color: colors[index % colors.length],
        legendFontColor: theme.colors.text,
        legendFontSize: 14,
        percentage: percentage,
        displayText: `${category}\n${formatAmountChart(
          amount,
          true,
        )}\n(${percentage}%)`,
      };
    });

  const getChartWidth = () => {
    return screenWidth - 30; // Consistent width for all charts
  };

  // Calculate dynamic bar width based on number of data points
  const getDynamicBarWidth = (dataLength: number) => {
    // Get the actual chart width used in BarChart component
    const chartWidth = getChartWidth() - 40; // This matches the width prop in BarChart
    const spacing = getDynamicSpacing(dataLength);

    // Calculate total space needed for spacing
    const totalSpacingWidth = (dataLength - 1) * spacing;

    // Calculate remaining space for bars
    const availableBarSpace = chartWidth - totalSpacingWidth;

    // Divide equally among all bars
    const barWidth = availableBarSpace / dataLength;

    // Ensure minimum and maximum reasonable widths
    return Math.max(15, Math.min(70, Math.floor(barWidth)));
  };

  // Calculate dynamic spacing based on number of data points
  const getDynamicSpacing = (dataLength: number) => {
    if (dataLength <= 5) return 10; // Few data points: more spacing
    if (dataLength <= 7) return 4; // Weekly: comfortable spacing
    if (dataLength <= 12) return 2; // Monthly: tighter spacing to fit all 12 bars
    return 4; // More data: minimal spacing
  };

  // Transform data for gifted-charts
  const getGiftedChartData = (labels: string[], data: number[]) => {
    const colors = theme.isDark
      ? [
          '#60A5FA', // Blue - good contrast on dark
          '#34D399', // Green - good contrast on dark
          '#FBBF24', // Yellow - good contrast on dark
          '#F87171', // Red - good contrast on dark
          '#A78BFA', // Purple - good contrast on dark
          '#22D3EE', // Cyan - good contrast on dark
          '#FB923C', // Orange - good contrast on dark
        ]
      : [
          '#3B82F6', // Dark blue - good contrast on light
          '#10B981', // Dark green - good contrast on light
          '#D97706', // Dark orange - good contrast on light
          '#DC2626', // Dark red - good contrast on light
          '#7C3AED', // Dark purple - good contrast on light
          '#0891B2', // Dark cyan - good contrast on light
          '#EA580C', // Dark orange - good contrast on light
        ];

    return data.map((value, index) => {
      return {
        value: value, // Keep numeric for chart calculations
        label: labels[index] || `Day ${index + 1}`,
        frontColor: colors[index % colors.length],
        topLabelComponent: () => (
          <Text
            style={{
              color: theme.colors.text,
              fontSize: timeGrouping === 'month' ? 8 : 11,
              fontWeight: '600',
              textAlign: 'center',
              backgroundColor: theme.colors.surface,
              paddingHorizontal: 4,
              paddingVertical: 2,
              borderRadius: 4,
              marginBottom: 4,
              overflow: 'hidden',
              elevation: 2,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.2,
              shadowRadius: 2,
            }}>
            ₹{formatAmountCompact(value)}
          </Text>
        ),
      };
    });
  };

  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: () => theme.colors.text,
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
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
    contentHeader: {
      paddingHorizontal: 20,
      paddingVertical: 20,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    periodSelector: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 4,
      marginBottom: 12,
      elevation: 1,
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    periodOption: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 10,
      alignItems: 'center',
    },
    periodOptionActive: {
      backgroundColor: theme.colors.primary,
    },
    periodOptionText: {
      ...textStyles.smallSemibold,
      color: theme.colors.textSecondary,
    },
    periodOptionTextActive: {
      color: '#ffffff',
    },
    chartTypeSelector: {
      flexDirection: 'row',
      gap: 10,
    },
    chartOption: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      elevation: 1,
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    chartOptionActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    chartOptionText: {
      ...textStyles.smallSemibold,
      color: theme.colors.text,
    },
    chartOptionTextActive: {
      color: '#ffffff',
    },
    chartContainer: {
      paddingHorizontal: 10,
      paddingVertical: 15,
      alignItems: 'center',
      marginHorizontal: 5,
      marginVertical: 5,
    },
    chartTitle: {
      ...textStyles.large,
      color: theme.colors.text,
      marginBottom: 15,
      textAlign: 'center',
      fontWeight: fontWeights.bold,
    },
    emptyState: {
      paddingVertical: 40,
      alignItems: 'center',
    },
    emptyStateText: {
      ...textStyles.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    insightsTitle: {
      ...textStyles.large,
      fontWeight: fontWeights.bold,
      color: theme.colors.text,
      textAlign: 'center',
    },
    insightsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    insightItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 4,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    insightLabel: {
      ...textStyles.small,
      color: theme.colors.textSecondary,
      flex: 1,
    },
    insightValue: {
      ...textStyles.smallSemibold,
      color: theme.colors.text,
    },
    highLowContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      margin: 15,
      gap: 10,
      paddingHorizontal: 5,
    },
    highLowCard: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      padding: 8,
      borderRadius: 16,
      alignItems: 'center',
      elevation: 3,
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    highLowTitle: {
      ...textStyles.caption,
      color: theme.colors.textSecondary,
      marginBottom: 2,
      textAlign: 'center',
    },
    highLowValue: {
      ...textStyles.bodyMedium,
      color: theme.colors.text,
      textAlign: 'center',
      fontSize: 14,
    },
    highLowLabel: {
      ...textStyles.caption,
      color: theme.colors.textSecondary,
      marginTop: 2,
      textAlign: 'center',
    },
    spendingInsights: {
      margin: 15,
      padding: 12,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      elevation: 2,
    },
    spendingInsightsTitle: {
      ...textStyles.large,
      fontWeight: fontWeights.bold,
      color: theme.colors.text,
      marginBottom: 8,
    },
    insightsContainer: {
      margin: 15,
      padding: 15,
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      elevation: 3,
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    insightsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 12,
    },
    insightCard: {
      width: '48%',
      backgroundColor: theme.colors.card || theme.colors.surface,
      padding: 8,
      borderRadius: 12,
      marginBottom: 8,
      alignItems: 'center',
      elevation: 2,
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    insightCardTitle: {
      ...textStyles.caption,
      color: theme.colors.textSecondary,
      marginBottom: 4,
      textAlign: 'center',
    },
    insightCardValue: {
      ...textStyles.bodyMedium,
      color: theme.colors.text,
      textAlign: 'center',
      fontSize: 13,
    },
    pieChartContainer: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      margin: 10,
      padding: 15,
      elevation: 3,
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    chartStyle: {
      borderRadius: 16,
    },
    barChartContainer: {
      backgroundColor: theme.isDark ? '#2A2A2A' : '#F8F9FA',
      borderRadius: 16,
      margin: 5,
      padding: 5,
      elevation: 3,
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.isDark ? 0.2 : 0.1,
      shadowRadius: 4,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    enhancedChartStyle: {
      borderRadius: 16,
      marginVertical: 8,
    },
    legendContainer: {
      marginTop: 12,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    legendColor: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 8,
    },
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text
            style={{ ...textStyles.body, color: theme.colors.textSecondary }}
          >
            Loading Analytics...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="bar-chart-outline" size={24} color={theme.colors.text} />
        <Text style={styles.headerTitle}>Analytics</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.contentHeader}>
          {/* Time Grouping Selection */}
          <View style={styles.periodSelector}>
            {(['week', 'month', 'year'] as TimeGrouping[]).map(period => {
              const periodColor =
                timeGrouping === period
                  ? '#ffffff'
                  : theme.colors.textSecondary;
              return (
                <TouchableOpacity
                  key={period}
                  style={[
                    styles.periodOption,
                    timeGrouping === period && styles.periodOptionActive,
                  ]}
                  onPress={() => setTimeGrouping(period)}
                >
                  <Ionicons
                    name={
                      period === 'week'
                        ? 'calendar-outline'
                        : period === 'month'
                        ? 'calendar'
                        : 'calendar-clear'
                    }
                    size={16}
                    color={periodColor}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      { ...textStyles.smallMedium, color: periodColor },
                      timeGrouping === period && styles.periodOptionTextActive,
                    ]}
                  >
                    {period === 'week'
                      ? 'Weekly'
                      : period === 'month'
                      ? 'Monthly'
                      : 'Yearly'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Chart Type Selection */}
          <View style={styles.chartTypeSelector}>
            <TouchableOpacity
              style={[
                styles.chartOption,
                chartType === 'bar' && styles.chartOptionActive,
              ]}
              onPress={() => setChartType('bar')}
            >
              <Ionicons
                name="bar-chart"
                size={16}
                color={chartBarColor}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  { ...textStyles.bodySemibold, color: chartBarColor },
                  chartType === 'bar' && styles.chartOptionTextActive,
                ]}
              >
                Bar Chart
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.chartOption,
                chartType === 'pie' && styles.chartOptionActive,
              ]}
              onPress={() => setChartType('pie')}
            >
              <Ionicons
                name="pie-chart"
                size={16}
                color={chartPieColor}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  { ...textStyles.bodySemibold, color: chartPieColor },
                  chartType === 'pie' && styles.chartOptionTextActive,
                ]}
              >
                Pie Chart
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {!hasData ? (
          <View style={styles.emptyState}>
            <Text
              style={{ ...textStyles.body, color: theme.colors.textSecondary }}
            >
              No transaction data available.{'\n'}
              Add some payments to see analytics.
            </Text>
          </View>
        ) : (
          <>
            {/* Main Chart */}
            <View style={styles.chartContainer}>
              <Text style={{ ...textStyles.large, color: theme.colors.text }}>
                {chartType === 'pie'
                  ? `${getPeriodDisplayName(timeGrouping)} - Category Breakdown`
                  : `${
                      timeGrouping === 'week'
                        ? 'Weekly'
                        : timeGrouping === 'month'
                        ? 'Monthly'
                        : 'Yearly'
                    } Spending Trends`}
              </Text>

              {chartType === 'bar' ? (
                chartData.data.some(value => value > 0) ? (
                  <View style={styles.barChartContainer}>
                    <BarChart
                      data={getGiftedChartData(
                        chartData.labels,
                        chartData.data,
                      )}
                      width={getChartWidth()}
                      height={260}
                      barWidth={getDynamicBarWidth(chartData.data.length)}
                      spacing={getDynamicSpacing(chartData.data.length)}
                      // roundedTop
                      roundedBottom={false}
                      isAnimated
                      animationDuration={800}
                      yAxisThickness={1}
                      xAxisThickness={1}
                      yAxisTextStyle={{
                        color: theme.colors.text,
                        fontSize: timeGrouping === 'month' ? 6 : 10,
                        fontWeight: '500',
                      }}
                      xAxisLabelTextStyle={{
                        color: theme.colors.text,
                        fontSize: timeGrouping === 'year' ? 12 : timeGrouping === 'month' ? 6 : 10,
                        fontWeight: '500',
                      }}
                      noOfSections={6}
                      maxValue={Math.max(...chartData.data) * 1.2}
                      rulesColor={theme.colors.border}
                      rulesType="solid"
                      yAxisColor={theme.colors.border}
                      xAxisColor={theme.colors.border}
                      yAxisLabelTexts={getYAxisLabels(chartData.data)}
                    />
                  </View>
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>
                      No data for selected period
                    </Text>
                  </View>
                )
              ) : pieChartData.length > 0 ? (
                <View style={styles.pieChartContainer}>
                  <PieChart
                    data={pieChartData.map(item => ({
                      name: `${item.name} - ₹${formatAmountCompact(
                        item.amount,
                      )}`,
                      population: item.amount,
                      color: item.color,
                      legendFontColor: item.legendFontColor,
                      legendFontSize: 9,
                    }))}
                    width={getChartWidth() - 40}
                    height={200}
                    chartConfig={chartConfig}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    center={[0, 0]}
                  />
                  {/* Enhanced Pie Chart Legend */}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    No category data available
                  </Text>
                </View>
              )}
            </View>

            {/* Highest/Lowest Spending */}
            {chartType === 'bar' &&
              hasData &&
              chartData.data.some(value => value > 0) && (
                <View style={styles.highLowContainer}>
                  <View style={styles.highLowCard}>
                    <Ionicons
                      name="trending-up"
                      size={20}
                      color={theme.colors.error}
                      style={{ marginBottom: 8 }}
                    />
                    <Text style={styles.highLowTitle}>Highest Spending</Text>
                    <Text style={styles.highLowValue}>
                      ₹{formatAmountCompact(maxValue)}
                    </Text>
                    <Text style={styles.highLowLabel}>{maxLabel}</Text>
                  </View>
                  {minValue > 0 && minLabel && (
                    <View style={styles.highLowCard}>
                      <Ionicons
                        name="trending-down"
                        size={20}
                        color={theme.colors.success}
                        style={{ marginBottom: 8 }}
                      />
                      <Text style={styles.highLowTitle}>Lowest Spending</Text>
                      <Text style={styles.highLowValue}>
                        ₹{formatAmountCompact(minValue)}
                      </Text>
                      <Text style={styles.highLowLabel}>{minLabel}</Text>
                    </View>
                  )}
                </View>
              )}

            {/* Enhanced Spending Insights */}
            {spendingInsights && (
              <View style={styles.insightsContainer}>
                <View style={styles.insightsHeader}>
                  <Text style={styles.insightsTitle}>Spending Insights</Text>
                </View>

                <View style={styles.insightsGrid}>
                  <View style={styles.insightCard}>
                    <Ionicons
                      name="calendar"
                      size={16}
                      color={theme.colors.primary}
                      style={{ marginBottom: 4 }}
                    />
                    <Text style={styles.insightCardTitle}>
                      Highest Spending Day
                    </Text>
                    <Text style={styles.insightCardValue}>
                      {spendingInsights.highestSpendingDay}
                    </Text>
                  </View>

                  <View style={styles.insightCard}>
                    <Ionicons
                      name="time"
                      size={16}
                      color={theme.colors.primary}
                      style={{ marginBottom: 4 }}
                    />
                    <Text style={styles.insightCardTitle}>Average Daily</Text>
                    <Text style={styles.insightCardValue}>
                      ₹{formatAmountCompact(
                        spendingInsights.averageDailySpending,
                      )}
                    </Text>
                  </View>

                  <View style={styles.insightCard}>
                    <Ionicons
                      name="trophy"
                      size={16}
                      color={theme.colors.primary}
                      style={{ marginBottom: 4 }}
                    />
                    <Text style={styles.insightCardTitle}>Top Category</Text>
                    <Text style={styles.insightCardValue}>
                      {spendingInsights.mostSpentCategory}
                    </Text>
                  </View>

                  <View style={styles.insightCard}>
                    <Ionicons
                      name="swap-horizontal"
                      size={16}
                      color={theme.colors.primary}
                      style={{ marginBottom: 4 }}
                    />
                    <Text style={styles.insightCardTitle}>
                      Total Transactions
                    </Text>
                    <Text style={styles.insightCardValue}>
                      {spendingInsights.totalTransactions}
                    </Text>
                  </View>

                  <View style={styles.insightCard}>
                    <Ionicons
                      name="calculator"
                      size={16}
                      color={theme.colors.primary}
                      style={{ marginBottom: 4 }}
                    />
                    <Text style={styles.insightCardTitle}>
                      Avg per Transaction
                    </Text>
                    <Text style={styles.insightCardValue}>
                      ₹{formatAmountCompact(
                        spendingInsights.avgTransactionAmount,
                      )}
                    </Text>
                  </View>

                  <View style={styles.insightCard}>
                    <Ionicons
                      name="wallet"
                      size={16}
                      color={theme.colors.primary}
                      style={{ marginBottom: 4 }}
                    />
                    <Text style={styles.insightCardTitle}>Total Spending</Text>
                    <Text style={styles.insightCardValue}>
                      ₹{formatAmountCompact(totalSpending)}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AnalyticsScreen;
