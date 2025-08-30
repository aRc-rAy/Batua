import { Payment, PaymentCategory } from '../types';
import { PaymentService } from './PaymentService';

export interface SpendingInsight {
  type: 'warning' | 'suggestion' | 'achievement' | 'tip';
  title: string;
  description: string;
  emoji: string;
  actionable?: boolean;
  action?: string;
}

export interface MonthlyAnalysis {
  totalSpent: number;
  avgDailySpending: number;
  topCategory: PaymentCategory;
  topCategoryAmount: number;
  daysActive: number;
  comparison: 'higher' | 'lower' | 'similar';
  comparisonPercentage: number;
}

export class AIAssistantService {
  private static readonly INSIGHTS_CACHE_KEY = '@SpendBook:insights_cache';
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Generate AI-powered spending insights based on payment patterns
   */
  static async generateSpendingInsights(): Promise<SpendingInsight[]> {
    try {
      const payments = await PaymentService.getAllPayments();
      if (payments.length === 0) {
        return this.getEmptyStateInsights();
      }

      const insights: SpendingInsight[] = [];
      const monthlyAnalysis = await this.analyzeCurrentMonth(payments);
      
      // Budget insights
      insights.push(...await this.generateBudgetInsights(payments, monthlyAnalysis));
      
      // Category insights
      insights.push(...this.generateCategoryInsights(payments, monthlyAnalysis));
      
      // Spending pattern insights
      insights.push(...this.generatePatternInsights(payments));
      
      // Achievement insights
      insights.push(...this.generateAchievementInsights(payments));
      
      // Actionable tips
      insights.push(...this.generateActionableTips(payments, monthlyAnalysis));

      return insights.slice(0, 6); // Return top 6 insights
    } catch (error) {
      console.error('Error generating insights:', error);
      return this.getFallbackInsights();
    }
  }

  /**
   * Get personalized spending recommendations
   */
  static async getSpendingRecommendations(): Promise<string[]> {
    try {
      const payments = await PaymentService.getAllPayments();
      const recommendations: string[] = [];

      if (payments.length === 0) {
        return [
          "Start tracking your expenses to get personalized recommendations!",
          "Set a monthly budget to better control your spending.",
          "Use categories to understand where your money goes."
        ];
      }

      const monthlyAnalysis = await this.analyzeCurrentMonth(payments);
      
      // Budget-based recommendations
      if (monthlyAnalysis.totalSpent > 0) {
        if (monthlyAnalysis.comparison === 'higher') {
          recommendations.push(`You're spending ${monthlyAnalysis.comparisonPercentage}% more this month. Consider reducing ${monthlyAnalysis.topCategory.toLowerCase()} expenses.`);
        }
      }

      // Category-based recommendations
      const categorySpending = await PaymentService.getCategorySpending();
      const sortedCategories = Object.entries(categorySpending)
        .sort((a, b) => b[1] - a[1])
        .filter(([_, amount]) => amount > 0);

      if (sortedCategories.length > 0) {
        const [topCategory, topAmount] = sortedCategories[0];
        const totalSpent = Object.values(categorySpending).reduce((sum, amount) => sum + amount, 0);
        const percentage = Math.round((topAmount / totalSpent) * 100);
        
        if (percentage > 40) {
          recommendations.push(`${topCategory} takes up ${percentage}% of your spending. Consider setting a specific budget for this category.`);
        }
      }

      // Pattern-based recommendations
      const recentPayments = payments.slice(0, 7);
      const dailySpending = this.groupPaymentsByDay(recentPayments);
      const highSpendingDays = Object.entries(dailySpending)
        .filter(([_, amount]) => amount > monthlyAnalysis.avgDailySpending * 1.5);

      if (highSpendingDays.length > 2) {
        recommendations.push("You tend to overspend on certain days. Try planning your expenses in advance.");
      }

      // Add generic helpful tips if not enough specific recommendations
      while (recommendations.length < 3) {
        const genericTips = [
          "Track every expense, no matter how small - it adds up!",
          "Review your spending weekly to stay on track.",
          "Set aside money for savings before spending on other categories.",
          "Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings.",
          "Consider using cash for discretionary spending to limit overspending."
        ];
        
        const randomTip = genericTips[Math.floor(Math.random() * genericTips.length)];
        if (!recommendations.includes(randomTip)) {
          recommendations.push(randomTip);
        }
      }

      return recommendations.slice(0, 4);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return ["Keep tracking your expenses to get better insights!"];
    }
  }

  /**
   * Analyze current month spending patterns
   */
  private static async analyzeCurrentMonth(payments: Payment[]): Promise<MonthlyAnalysis> {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Current month payments
    const currentMonthPayments = payments.filter(payment => {
      const paymentDate = new Date(payment.date);
      return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
    });

    // Previous month payments for comparison
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const previousMonthPayments = payments.filter(payment => {
      const paymentDate = new Date(payment.date);
      return paymentDate.getMonth() === prevMonth && paymentDate.getFullYear() === prevYear;
    });

    const totalSpent = currentMonthPayments.reduce((sum, p) => sum + p.amount, 0);
    const prevMonthTotal = previousMonthPayments.reduce((sum, p) => sum + p.amount, 0);

    // Calculate unique days with spending
    const spendingDays = new Set(
      currentMonthPayments.map(p => new Date(p.date).toDateString())
    );

    const avgDailySpending = spendingDays.size > 0 ? totalSpent / spendingDays.size : 0;

    // Find top category
    const categoryTotals = new Map<PaymentCategory, number>();
    currentMonthPayments.forEach(payment => {
      const current = categoryTotals.get(payment.category) || 0;
      categoryTotals.set(payment.category, current + payment.amount);
    });

    const sortedCategories = Array.from(categoryTotals.entries())
      .sort((a, b) => b[1] - a[1]);

    const [topCategory = 'Food', topCategoryAmount = 0] = sortedCategories[0] || [];

    // Compare with previous month
    let comparison: 'higher' | 'lower' | 'similar' = 'similar';
    let comparisonPercentage = 0;

    if (prevMonthTotal > 0) {
      const percentageDiff = Math.abs((totalSpent - prevMonthTotal) / prevMonthTotal) * 100;
      comparisonPercentage = Math.round(percentageDiff);
      
      if (totalSpent > prevMonthTotal * 1.1) {
        comparison = 'higher';
      } else if (totalSpent < prevMonthTotal * 0.9) {
        comparison = 'lower';
      }
    }

    return {
      totalSpent,
      avgDailySpending,
      topCategory,
      topCategoryAmount,
      daysActive: spendingDays.size,
      comparison,
      comparisonPercentage
    };
  }

  private static async generateBudgetInsights(payments: Payment[], analysis: MonthlyAnalysis): Promise<SpendingInsight[]> {
    const insights: SpendingInsight[] = [];

    if (analysis.comparison === 'higher' && analysis.comparisonPercentage > 15) {
      insights.push({
        type: 'warning',
        title: 'Higher Spending Alert',
        description: `You're spending ${analysis.comparisonPercentage}% more than last month. Consider reviewing your ${analysis.topCategory.toLowerCase()} expenses.`,
        emoji: '⚠️',
        actionable: true,
        action: 'Review Budget'
      });
    } else if (analysis.comparison === 'lower' && analysis.comparisonPercentage > 10) {
      insights.push({
        type: 'achievement',
        title: 'Great Job Saving!',
        description: `You've reduced spending by ${analysis.comparisonPercentage}% this month. Keep up the good work!`,
        emoji: '🎉',
        actionable: false
      });
    }

    return insights;
  }

  private static generateCategoryInsights(payments: Payment[], analysis: MonthlyAnalysis): SpendingInsight[] {
    const insights: SpendingInsight[] = [];

    if (analysis.topCategoryAmount > analysis.totalSpent * 0.4) {
      const percentage = Math.round((analysis.topCategoryAmount / analysis.totalSpent) * 100);
      insights.push({
        type: 'suggestion',
        title: 'Category Concentration',
        description: `${analysis.topCategory} accounts for ${percentage}% of your spending. Consider setting a specific budget for this category.`,
        emoji: '📊',
        actionable: true,
        action: 'Set Category Budget'
      });
    }

    return insights;
  }

  private static generatePatternInsights(payments: Payment[]): SpendingInsight[] {
    const insights: SpendingInsight[] = [];

    // Check for weekend spending patterns
    const weekendPayments = payments.filter(payment => {
      const day = new Date(payment.date).getDay();
      return day === 0 || day === 6; // Sunday or Saturday
    });

    const weekdayPayments = payments.filter(payment => {
      const day = new Date(payment.date).getDay();
      return day >= 1 && day <= 5; // Monday to Friday
    });

    if (weekendPayments.length > 0 && weekdayPayments.length > 0) {
      const weekendAvg = weekendPayments.reduce((sum, p) => sum + p.amount, 0) / weekendPayments.length;
      const weekdayAvg = weekdayPayments.reduce((sum, p) => sum + p.amount, 0) / weekdayPayments.length;

      if (weekendAvg > weekdayAvg * 1.3) {
        insights.push({
          type: 'tip',
          title: 'Weekend Spending Pattern',
          description: 'You tend to spend more on weekends. Planning weekend activities in advance can help control costs.',
          emoji: '📅',
          actionable: true,
          action: 'Plan Weekend Budget'
        });
      }
    }

    return insights;
  }

  private static generateAchievementInsights(payments: Payment[]): SpendingInsight[] {
    const insights: SpendingInsight[] = [];

    if (payments.length >= 50) {
      insights.push({
        type: 'achievement',
        title: 'Tracking Champion!',
        description: `You've tracked ${payments.length} transactions! Your financial awareness is growing.`,
        emoji: '🏆',
        actionable: false
      });
    } else if (payments.length >= 20) {
      insights.push({
        type: 'achievement',
        title: 'Great Progress!',
        description: `${payments.length} transactions tracked. Keep building your spending awareness!`,
        emoji: '⭐',
        actionable: false
      });
    }

    return insights;
  }

  private static generateActionableTips(payments: Payment[], analysis: MonthlyAnalysis): SpendingInsight[] {
    const insights: SpendingInsight[] = [];

    if (analysis.avgDailySpending > 0) {
      const monthlyProjection = analysis.avgDailySpending * 30;
      insights.push({
        type: 'tip',
        title: 'Monthly Projection',
        description: `At your current rate (₹${analysis.avgDailySpending.toFixed(0)}/day), you'll spend ₹${monthlyProjection.toFixed(0)} this month.`,
        emoji: '📈',
        actionable: true,
        action: 'Adjust Daily Budget'
      });
    }

    return insights;
  }

  private static getEmptyStateInsights(): SpendingInsight[] {
    return [
      {
        type: 'tip',
        title: 'Welcome to Batua!',
        description: 'Start by adding your first expense to get personalized insights.',
        emoji: '🎯',
        actionable: true,
        action: 'Add Expense'
      },
      {
        type: 'suggestion',
        title: 'Set Your Budget',
        description: 'Define a monthly budget to track your financial goals effectively.',
        emoji: '💰',
        actionable: true,
        action: 'Set Budget'
      }
    ];
  }

  private static getFallbackInsights(): SpendingInsight[] {
    return [
      {
        type: 'tip',
        title: 'Keep Tracking!',
        description: 'Consistent expense tracking leads to better financial insights.',
        emoji: '📊',
        actionable: false
      }
    ];
  }

  private static groupPaymentsByDay(payments: Payment[]): Record<string, number> {
    const dailySpending: Record<string, number> = {};
    
    payments.forEach(payment => {
      const day = new Date(payment.date).toDateString();
      dailySpending[day] = (dailySpending[day] || 0) + payment.amount;
    });

    return dailySpending;
  }
}
