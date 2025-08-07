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
import {
  PieChart as ChartKitPieChart,
  BarChart as ChartKitBarChart,
} from 'react-native-chart-kit';

type ChartType = 'bar' | 'pie';
type TimeGrouping = 'week' | 'month' | 'year';

const screenWidth = Dimensions.get('window').width;

// Process data by time grouping
const processTimeGroupedData = (payments: Payment[], grouping: TimeGrouping) => {
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
      // Ensure consistent date formatting without time zone issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
  } else if (grouping === 'month') {
    periods = 4; // Last 4 months
    formatLabel = (date: Date) => {
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
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
      // Get current week starting from Monday
      const today = new Date(now);
      const dayOfWeek = (today.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
      const monday = new Date(today);
      monday.setDate(today.getDate() - dayOfWeek); // Go to Monday of current week
      
      // Set date to Monday + i days (Mon, Tue, Wed, Thu, Fri, Sat, Sun)
      date = new Date(monday);
      date.setDate(monday.getDate() + i);
    } else if (grouping === 'month') {
      date.setMonth(now.getMonth() - (periods - 1 - i));
      date.setDate(1); // First day of month for consistency
    } else {
      date.setFullYear(now.getFullYear() - (periods - 1 - i));
      date.setMonth(0, 1); // January 1st for consistency
    }
    
    const key = getKey(date);
    const label = formatLabel(date);
    dataMap.set(key, 0);
    labels.push(label);
    
    if (grouping === 'week') {
      console.log(`Week day ${i}: ${date.toDateString()} -> key: ${key}, label: ${label}`);
    }
  }
  
  // Filter payments to only include relevant time range
  const relevantPayments = payments.filter(payment => {
    const paymentDate = new Date(payment.date);
    const today = new Date();
    
    if (grouping === 'week') {
      // For weekly: include current week (Monday to Sunday)
      const dayOfWeek = (today.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
      const monday = new Date(today);
      monday.setDate(today.getDate() - dayOfWeek);
      monday.setHours(0, 0, 0, 0);
      
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      
      return paymentDate >= monday && paymentDate <= sunday;
    } else if (grouping === 'month') {
      // For monthly: include last 4 months
      const monthsDiff = (today.getFullYear() - paymentDate.getFullYear()) * 12 + 
                        (today.getMonth() - paymentDate.getMonth());
      return monthsDiff >= 0 && monthsDiff < periods;
    } else {
      // For yearly: include last 4 years
      const yearsDiff = today.getFullYear() - paymentDate.getFullYear();
      return yearsDiff >= 0 && yearsDiff < periods;
    }
  });
  
  // Debug log for weekly data (remove in production)
  if (grouping === 'week') {
    console.log('Current date:', now.toISOString());
    console.log('All payments:', payments.map(p => ({ date: p.date, amount: p.amount })));
    console.log('Relevant payments for week:', relevantPayments.map(p => ({ date: p.date, amount: p.amount })));
    console.log('Data map keys:', Array.from(dataMap.keys()));
  }
  
  // Aggregate payments
  relevantPayments.forEach(payment => {
    const paymentDate = new Date(payment.date);
    // Use same key format as initialization
    const key = getKey(paymentDate);
    
    if (dataMap.has(key)) {
      const oldValue = dataMap.get(key)!;
      dataMap.set(key, oldValue + payment.amount);
      if (grouping === 'week') {
        console.log(`Added payment: ${payment.date} -> ${key} = ₹${payment.amount}, total now: ₹${dataMap.get(key)}`);
      }
    } else if (grouping === 'week') {
      console.log(`Payment date ${payment.date} -> ${key} not in expected range. Available keys: ${Array.from(dataMap.keys()).join(', ')}`);
    }
  });
  
  const data = Array.from(dataMap.values());
  return { data, labels };
};

const categoryColors: Record<PaymentCategory, string> = {
  Food: '#e74c3c',
  Travel: '#3498db',
  Entertainment: '#9b59b6',
  Clothes: '#e67e22',
  Bills: '#f39c12',
  Healthcare: '#27ae60',
  Others: '#95a5a6'
};

const AnalyticsScreen: React.FC = () => {
  const [timeGrouping, setTimeGrouping] = useState<TimeGrouping>('month');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [categoryData, setCategoryData] = useState<Record<PaymentCategory, number>>({
    Food: 0, Travel: 0, Entertainment: 0, Clothes: 0,
    Bills: 0, Healthcare: 0, Others: 0
  });
  const [loading, setLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const [allPayments, categorySpendings] = await Promise.all([
        PaymentService.getAllPayments(),
        PaymentService.getCategorySpending()
      ]);
      
      setPayments(allPayments);
      setCategoryData(categorySpendings);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadAnalytics();
    }, [loadAnalytics])
  );

  // Process data based on current settings
  const chartData = processTimeGroupedData(payments, timeGrouping);
  const hasData = chartData.data.some((val: number) => val > 0);
  const totalSpending = chartData.data.reduce((sum: number, val: number) => sum + val, 0);
  
  // Get min/max from actual chart data for display
  let maxValue = 0;
  let minValue = 0;
  let maxIndex = -1;
  let minIndex = -1;
  let maxLabel = '';
  let minLabel = '';
  
  if (hasData) {
    // Find max and min from ALL chart data (including zeros)
    maxValue = Math.max(...chartData.data);
    minValue = Math.min(...chartData.data); // This will include 0 if present
    maxIndex = chartData.data.indexOf(maxValue);
    minIndex = chartData.data.indexOf(minValue);
    maxLabel = chartData.labels[maxIndex];
    minLabel = chartData.labels[minIndex];
  }

  const categoryTotal = Object.values(categoryData).reduce((sum, val) => sum + val, 0);

  // Chart configuration
  const getChartWidth = () => {
    if (timeGrouping === 'week') {
      return screenWidth - 20; // Full width for 7 days with minimal margins
    }
    return screenWidth - 40;
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#f8f9fa',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(60, 60, 67, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForLabels: {
      fontSize: timeGrouping === 'week' ? 9 : 11,
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
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Analytics Dashboard</Text>
          
          {/* Time Grouping Selection */}
          <View style={styles.periodSelector}>
            {(['week', 'month', 'year'] as TimeGrouping[]).map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodOption,
                  timeGrouping === period && styles.periodOptionActive
                ]}
                onPress={() => setTimeGrouping(period)}
              >
                <Text style={[
                  styles.periodOptionText,
                  timeGrouping === period && styles.periodOptionTextActive
                ]}>
                  {period.charAt(0).toUpperCase() + period.slice(1)}ly
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Chart Type Selection */}
          <View style={styles.chartTypeSelector}>
            <TouchableOpacity
              style={[
                styles.chartOption,
                chartType === 'bar' && styles.chartOptionActive
              ]}
              onPress={() => setChartType('bar')}
            >
              <Text style={[
                styles.chartOptionText,
                chartType === 'bar' && styles.chartOptionTextActive
              ]}>
                📊 Bar
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.chartOption,
                chartType === 'pie' && styles.chartOptionActive
              ]}
              onPress={() => setChartType('pie')}
            >
              <Text style={[
                styles.chartOptionText,
                chartType === 'pie' && styles.chartOptionTextActive
              ]}>
                🥧 Pie
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bar Chart */}
        {chartType === 'bar' && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Spending - {timeGrouping.charAt(0).toUpperCase() + timeGrouping.slice(1)}ly</Text>
            {hasData ? (
              <View style={styles.chartWrapper}>
                <ChartKitBarChart
                  data={{
                    labels: chartData.labels,
                    datasets: [{
                      data: chartData.data
                    }]
                  }}
                  width={getChartWidth()}
                  height={220}
                  chartConfig={chartConfig}
                  style={styles.chartStyle}
                  yAxisLabel=""
                  yAxisSuffix=""
                  showValuesOnTopOfBars={true}
                  withInnerLines={true}
                  fromZero={true}
                />
              </View>
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No spending data available</Text>
                <Text style={styles.noDataSubtext}>Add some payments to see the chart</Text>
              </View>
            )}
            <View style={styles.analyticsInfo}>
              <Text style={styles.chartInfo}>
                📊 Total: ₹{totalSpending.toLocaleString()}
              </Text>
              {hasData && (
                <View style={styles.minMaxContainer}>
                  <View style={styles.statCard}>
                    <Text style={styles.statEmoji}>📈</Text>
                    <Text style={styles.statLabel}>Highest</Text>
                    <Text style={styles.statValue}>₹{maxValue.toLocaleString()}</Text>
                    <Text style={styles.statPeriod}>{maxLabel}</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statEmoji}>📉</Text>
                    <Text style={styles.statLabel}>Lowest</Text>
                    <Text style={styles.statValue}>₹{minValue.toLocaleString()}</Text>
                    <Text style={styles.statPeriod}>{minLabel}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Pie Chart */}
        {chartType === 'pie' && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Category Breakdown</Text>
            {categoryTotal > 0 ? (
              <View style={styles.chartWrapper}>
                <ChartKitPieChart
                  data={Object.entries(categoryData)
                    .filter(([_, amount]) => amount > 0)
                    .map(([category, amount]) => ({
                      name: category,
                      amount: amount,
                      color: categoryColors[category as PaymentCategory],
                      legendFontColor: '#333',
                      legendFontSize: 12,
                    }))}
                  width={screenWidth - 40}
                  height={220}
                  chartConfig={chartConfig}
                  accessor="amount"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  center={[10, 10]}
                  absolute={false}
                />
                
                {/* Category Legend */}
                <View style={styles.categoryLegend}>
                  {Object.entries(categoryData)
                    .filter(([_, amount]) => amount > 0)
                    .map(([category, amount]) => {
                      const percentage = ((amount / categoryTotal) * 100).toFixed(1);
                      return (
                        <View key={category} style={styles.legendItem}>
                          <View 
                            style={[
                              styles.legendColor, 
                              { backgroundColor: categoryColors[category as PaymentCategory] }
                            ]} 
                          />
                          <Text style={styles.legendText}>
                            {category}: {percentage}% (₹{amount.toLocaleString()})
                          </Text>
                        </View>
                      );
                    })}
                </View>
              </View>
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No category data available</Text>
                <Text style={styles.noDataSubtext}>Add payments with categories</Text>
              </View>
            )}
          </View>
        )}

        {/* Insights Cards */}
        {hasData && (
          <View style={styles.insightsContainer}>
            <Text style={styles.insightsTitle}>📊 Spending Insights</Text>
            
            <View style={styles.insightsGrid}>
              {/* Top Category Card */}
              {(() => {
                const topCategory = Object.entries(categoryData)
                  .filter(([_, amount]) => amount > 0)
                  .sort(([, a], [, b]) => b - a)[0];
                
                return topCategory ? (
                  <View style={styles.insightCard}>
                    <Text style={styles.insightEmoji}>🏆</Text>
                    <Text style={styles.insightTitle}>Top Category</Text>
                    <Text style={styles.insightValue}>{topCategory[0]}</Text>
                    <Text style={styles.insightSubtext}>₹{topCategory[1].toLocaleString()}</Text>
                  </View>
                ) : null;
              })()}

              {/* Average Daily Spending */}
              {(() => {
                const avgDaily = timeGrouping === 'week' && hasData ? 
                  (totalSpending / 7).toFixed(0) : 
                  timeGrouping === 'month' ? 
                  (totalSpending / 30).toFixed(0) : 
                  (totalSpending / 365).toFixed(0);
                
                return (
                  <View style={styles.insightCard}>
                    <Text style={styles.insightEmoji}>📅</Text>
                    <Text style={styles.insightTitle}>Daily Average</Text>
                    <Text style={styles.insightValue}>₹{avgDaily}</Text>
                    <Text style={styles.insightSubtext}>
                      {timeGrouping === 'week' ? 'This week' : 
                       timeGrouping === 'month' ? 'This month' : 'This year'}
                    </Text>
                  </View>
                );
              })()}

              {/* Total Categories */}
              {(() => {
                const activeCategories = Object.values(categoryData).filter(amount => amount > 0).length;
                return (
                  <View style={styles.insightCard}>
                    <Text style={styles.insightEmoji}>📋</Text>
                    <Text style={styles.insightTitle}>Active Categories</Text>
                    <Text style={styles.insightValue}>{activeCategories}</Text>
                    <Text style={styles.insightSubtext}>Categories used</Text>
                  </View>
                );
              })()}

              {/* Spending Trend */}
              {(() => {
                const isIncreasing = hasData && chartData.data.length >= 2 && 
                  chartData.data[chartData.data.length - 1] > chartData.data[chartData.data.length - 2];
                const trend = !hasData ? 'No data' : isIncreasing ? 'Increasing' : 'Decreasing';
                const trendEmoji = !hasData ? '📊' : isIncreasing ? '📈' : '📉';
                
                return (
                  <View style={styles.insightCard}>
                    <Text style={styles.insightEmoji}>{trendEmoji}</Text>
                    <Text style={styles.insightTitle}>Trend</Text>
                    <Text style={styles.insightValue}>{trend}</Text>
                    <Text style={styles.insightSubtext}>
                      {timeGrouping === 'week' ? 'Weekly pattern' : 
                       timeGrouping === 'month' ? 'Monthly pattern' : 'Yearly pattern'}
                    </Text>
                  </View>
                );
              })()}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
    paddingVertical: 4,
    lineHeight: 34,
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
    backgroundColor: '#e9ecef',
    borderRadius: 25,
    padding: 4,
  },
  periodOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignItems: 'center',
  },
  periodOptionActive: {
    backgroundColor: '#007AFF',
  },
  periodOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    paddingVertical: 2,
    lineHeight: 20,
  },
  periodOptionTextActive: {
    color: 'white',
  },
  chartTypeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  chartOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  chartOptionActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  chartOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    paddingVertical: 2,
    lineHeight: 18,
  },
  chartOptionTextActive: {
    color: 'white',
  },
  chartContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
    paddingVertical: 3,
    lineHeight: 24,
  },
  chartWrapper: {
    alignItems: 'center',
  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    marginVertical: 8,
  },
  noDataText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  analyticsInfo: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  chartInfo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  insightsText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
  categoryLegend: {
    marginTop: 15,
    alignItems: 'flex-start',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 10,
  },
  legendText: {
    fontSize: 13,
    color: '#333',
  },
  minMaxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
    fontWeight: '600',
    paddingVertical: 1,
    lineHeight: 16,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
    paddingVertical: 2,
    lineHeight: 22,
  },
  statPeriod: {
    fontSize: 11,
    color: '#95a5a6',
    textAlign: 'center',
    paddingVertical: 1,
    lineHeight: 14,
  },
  insightsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  insightsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
    paddingVertical: 3,
    lineHeight: 26,
  },
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  insightCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: 12,
  },
  insightEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7f8c8d',
    marginBottom: 4,
    textAlign: 'center',
    paddingVertical: 1,
    lineHeight: 16,
  },
  insightValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
    textAlign: 'center',
    paddingVertical: 2,
    lineHeight: 24,
  },
  insightSubtext: {
    fontSize: 10,
    color: '#95a5a6',
    textAlign: 'center',
    paddingVertical: 1,
    lineHeight: 13,
  },
});

export default AnalyticsScreen;
