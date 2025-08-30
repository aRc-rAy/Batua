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
import { formatAmount, formatAmountChart } from '../utils/formatting';
import { PieChart, BarChart } from 'react-native-chart-kit';

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
      periods = 6; // Last 6 months (as requested)
      formatLabel = (date: Date) => {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          year: '2-digit',
        });
      };
      getKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}`;
    } else {
      periods = 6; // Last 6 years (same as monthly)
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
        const sixMonthsAgo = new Date(today);
        sixMonthsAgo.setMonth(today.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        return paymentDate >= sixMonthsAgo;
      } else {
        const sixYearsAgo = new Date(today);
        sixYearsAgo.setFullYear(today.getFullYear() - 5);
        sixYearsAgo.setMonth(0, 1);
        sixYearsAgo.setHours(0, 0, 0, 0);

        return paymentDate >= sixYearsAgo;
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

    const data = labels.map(label => {
      const key = [...dataMap.keys()].find(
        (_, index) => labels[index] === label,
      );
      return key ? dataMap.get(key) || 0 : 0;
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
  const pieChartData = Object.entries(categoryData)
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
      const percentage =
        totalSpending > 0 ? ((amount / totalSpending) * 100).toFixed(1) : '0';
      return {
        name: category,
        amount: amount,
        color: colors[index % colors.length],
        legendFontColor: theme.colors.text,
        legendFontSize: 14,
        percentage: percentage,
        displayText: `${category}\n${formatAmountChart(amount, true)}\n(${percentage}%)`,
      };
    });

  const getChartWidth = () => {
    return screenWidth - 30; // Consistent width for all charts
  };

  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) =>
      theme.isDark
        ? `rgba(52, 152, 219, ${opacity})`
        : `rgba(41, 128, 185, ${opacity})`,
    labelColor: (opacity = 1) =>
      `${theme.colors.text}${Math.round(opacity * 255)
        .toString(16)
        .padStart(2, '0')}`,
    style: {
      borderRadius: 16,
    },
    propsForLabels: {
      fontSize: 11,
      fontWeight: '600',
    },
    propsForVerticalLabels: {
      fontSize: 11,
      fontWeight: '600',
    },
    formatYLabel: (yValue: string) => {
      const value = parseInt(yValue, 10);
      if (value >= 1000) {
        return `₹${(value / 1000).toFixed(1)}k`;
      } else if (value >= 100) {
        return `₹${Math.round(value / 10) * 10}`;
      } else if (value > 0) {
        return `₹${value}`;
      } else {
        return '₹0';
      }
    },
    barPercentage: timeGrouping === 'week' ? 0.7 : 0.6, // Reduced bar padding
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
      paddingHorizontal: 20,
      paddingVertical: 20,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      ...textStyles.heading,
      color: theme.colors.text,
    },
    periodSelector: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 4,
      marginBottom: 16,
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
      paddingHorizontal: 15,
      paddingVertical: 20,
      alignItems: 'center',
      marginHorizontal: 10,
      marginVertical: 10,
    },
    chartTitle: {
      ...textStyles.large,
      color: theme.colors.text,
      marginBottom: 20,
      textAlign: 'center',
      fontWeight: fontWeights.bold,
    },
    emptyState: {
      paddingVertical: 60,
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
      marginBottom: 12,
    },
    insightItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 6,
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
      margin: 20,
      gap: 15,
      paddingHorizontal: 10,
    },
    highLowCard: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      padding: 12,
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
      ...textStyles.smallSemibold,
      color: theme.colors.text,
      textAlign: 'center',
    },
    highLowLabel: {
      ...textStyles.caption,
      color: theme.colors.textSecondary,
      marginTop: 2,
      textAlign: 'center',
    },
    spendingInsights: {
      margin: 20,
      padding: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      elevation: 2,
    },
    spendingInsightsTitle: {
      ...textStyles.large,
      fontWeight: fontWeights.bold,
      color: theme.colors.text,
      marginBottom: 12,
    },
    insightsContainer: {
      margin: 20,
      padding: 20,
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
      padding: 12,
      borderRadius: 12,
      marginBottom: 12,
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
      ...textStyles.bodySemibold,
      color: theme.colors.text,
      textAlign: 'center',
    },
    pieChartContainer: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      margin: 15,
      padding: 20,
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
    legendContainer: {
      marginTop: 16,
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
        <Text style={styles.headerTitle}>Analytics</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
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
              <Text
                style={[
                  { ...textStyles.bodySemibold, color: chartBarColor },
                  chartType === 'bar' && styles.chartOptionTextActive,
                ]}
              >
                📍Bar Chart
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.chartOption,
                chartType === 'pie' && styles.chartOptionActive,
              ]}
              onPress={() => setChartType('pie')}
            >
              <Text
                style={[
                  { ...textStyles.bodySemibold, color: chartPieColor },
                  chartType === 'pie' && styles.chartOptionTextActive,
                ]}
              >
                🧩 Pie Chart
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
                {timeGrouping === 'week'
                  ? 'Weekly'
                  : timeGrouping === 'month'
                  ? 'Monthly'
                  : 'Yearly'}{' '}
                Spending Trends
              </Text>

              {chartType === 'bar' ? (
                chartData.data.some(value => value > 0) ? (
                  <BarChart
                    data={{
                      labels: chartData.labels,
                      datasets: [{ data: chartData.data }],
                    }}
                    width={getChartWidth()}
                    height={220}
                    yAxisLabel=""
                    yAxisSuffix=""
                    chartConfig={chartConfig}
                    style={styles.chartStyle}
                    showValuesOnTopOfBars
                    fromZero
                  />
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
                      name: `${item.name} - ${formatAmountChart(item.amount, true)}`,
                      population: item.amount,
                      color: item.color,
                      legendFontColor: item.legendFontColor,
                      legendFontSize: 12,
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
                    <Text style={styles.highLowTitle}>Highest Spending</Text>
                    <Text style={styles.highLowValue}>
                      ₹{maxValue.toFixed(0)}
                    </Text>
                    <Text style={styles.highLowLabel}>{maxLabel}</Text>
                  </View>
                  {minValue > 0 && minLabel && (
                    <View style={styles.highLowCard}>
                      <Text style={styles.highLowTitle}>Lowest Spending</Text>
                      <Text style={styles.highLowValue}>
                        ₹{minValue.toFixed(0)}
                      </Text>
                      <Text style={styles.highLowLabel}>{minLabel}</Text>
                    </View>
                  )}
                </View>
              )}

            {/* Enhanced Spending Insights */}
            {spendingInsights && (
              <View style={styles.insightsContainer}>
                <Text style={styles.insightsTitle}>📊 Spending Insights</Text>

                <View style={styles.insightsGrid}>
                  <View style={styles.insightCard}>
                    <Text style={styles.insightCardTitle}>
                      Highest Spending Day
                    </Text>
                    <Text style={styles.insightCardValue}>
                      {spendingInsights.highestSpendingDay}
                    </Text>
                  </View>

                  <View style={styles.insightCard}>
                    <Text style={styles.insightCardTitle}>Average Daily</Text>
                    <Text style={styles.insightCardValue}>
                      {formatAmount(spendingInsights.averageDailySpending, true)}
                    </Text>
                  </View>

                  <View style={styles.insightCard}>
                    <Text style={styles.insightCardTitle}>Top Category</Text>
                    <Text style={styles.insightCardValue}>
                      {spendingInsights.mostSpentCategory}
                    </Text>
                  </View>

                  <View style={styles.insightCard}>
                    <Text style={styles.insightCardTitle}>
                      Total Transactions
                    </Text>
                    <Text style={styles.insightCardValue}>
                      {spendingInsights.totalTransactions}
                    </Text>
                  </View>

                  <View style={styles.insightCard}>
                    <Text style={styles.insightCardTitle}>
                      Avg per Transaction
                    </Text>
                    <Text style={styles.insightCardValue}>
                      {formatAmount(spendingInsights.avgTransactionAmount, true)}
                    </Text>
                  </View>

                  <View style={styles.insightCard}>
                    <Text style={styles.insightCardTitle}>Total Spending</Text>
                    <Text style={styles.insightCardValue}>
                      {formatAmount(totalSpending, true)}
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
