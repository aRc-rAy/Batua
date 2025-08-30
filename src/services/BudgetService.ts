import AsyncStorage from '@react-native-async-storage/async-storage';

const BUDGET_STORAGE_KEY = '@SpendBook:budget';

export interface Budget {
  monthlyLimit: number;
  dailyLimit: number;
  month: number;
  year: number;
  createdAt: string;
}

export class BudgetService {
  static async setMonthlyBudget(amount: number): Promise<void> {
    try {
      const now = new Date();
      const budget: Budget = {
        monthlyLimit: amount,
        dailyLimit: amount / new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(),
        month: now.getMonth(),
        year: now.getFullYear(),
        createdAt: now.toISOString(),
      };

      await AsyncStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(budget));
    } catch (error) {
      console.error('Error setting budget:', error);
      throw error;
    }
  }

  static async getCurrentBudget(): Promise<Budget | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(BUDGET_STORAGE_KEY);
      if (jsonValue) {
        const budget: Budget = JSON.parse(jsonValue);
        const now = new Date();
        
        // Check if budget is for current month
        if (budget.year === now.getFullYear() && budget.month === now.getMonth()) {
          return budget;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting budget:', error);
      return null;
    }
  }

  static async getBudgetStatus(currentSpending: number): Promise<{
    budget: Budget | null;
    remainingBudget: number;
    dailyBudgetRemaining: number;
    isOverBudget: boolean;
    daysRemaining: number;
    suggestedDailySpend: number;
  }> {
    try {
      const budget = await this.getCurrentBudget();
      if (!budget) {
        return {
          budget: null,
          remainingBudget: 0,
          dailyBudgetRemaining: 0,
          isOverBudget: false,
          daysRemaining: 0,
          suggestedDailySpend: 0,
        };
      }

      const now = new Date();
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const daysRemaining = daysInMonth - now.getDate() + 1;
      const remainingBudget = budget.monthlyLimit - currentSpending;
      const suggestedDailySpend = Math.max(0, remainingBudget / daysRemaining);

      return {
        budget,
        remainingBudget,
        dailyBudgetRemaining: budget.dailyLimit,
        isOverBudget: currentSpending > budget.monthlyLimit,
        daysRemaining,
        suggestedDailySpend,
      };
    } catch (error) {
      console.error('Error getting budget status:', error);
      return {
        budget: null,
        remainingBudget: 0,
        dailyBudgetRemaining: 0,
        isOverBudget: false,
        daysRemaining: 0,
        suggestedDailySpend: 0,
      };
    }
  }

  static async clearBudget(): Promise<void> {
    try {
      await AsyncStorage.removeItem(BUDGET_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing budget:', error);
      throw error;
    }
  }
}
