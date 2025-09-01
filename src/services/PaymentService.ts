import AsyncStorage from '@react-native-async-storage/async-storage';
import { Payment, PaymentCategory } from '../types';
import * as XLSX from 'xlsx';
import RNFS from 'react-native-fs';

const STORAGE_KEY = '@SpendBook:payments';

export class PaymentService {
  static async getAllPayments(): Promise<Payment[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      const payments = jsonValue != null ? JSON.parse(jsonValue) : [];
      // Sort by date (newest first)
      return payments.sort((a: Payment, b: Payment) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } catch (error) {
      console.error('Error getting payments:', error);
      return [];
    }
  }

  static async addPayment(paymentData: {
    amount: number;
    description: string;
    category: PaymentCategory;
  } | Payment): Promise<Payment> {
    try {
      const payments = await this.getAllPayments();
      
      let newPayment: Payment;
      
      // Check if it's already a complete Payment object (from SMS)
      if ('id' in paymentData && 'date' in paymentData && 'type' in paymentData) {
        newPayment = paymentData as Payment;
      } else {
        // Create new manual payment
        const data = paymentData as { amount: number; description: string; category: PaymentCategory };
        newPayment = {
          id: Date.now().toString(),
          amount: data.amount,
          description: data.description,
          category: data.category,
          date: new Date().toISOString(),
          type: 'manual',
          isFromSMS: false
        };
      }

      payments.push(newPayment);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payments));
      return newPayment;
    } catch (error) {
      console.error('Error adding payment:', error);
      throw error;
    }
  }

  static async deletePayment(id: string): Promise<void> {
    try {
      const payments = await this.getAllPayments();
      const updatedPayments = payments.filter(payment => payment.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPayments));
    } catch (error) {
      console.error('Error deleting payment:', error);
      throw error;
    }
  }

  static async updatePayment(id: string, updates: Partial<Payment>): Promise<void> {
    try {
      const payments = await this.getAllPayments();
      const updatedPayments = payments.map(payment =>
        payment.id === id ? { ...payment, ...updates } : payment
      );
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPayments));
    } catch (error) {
      console.error('Error updating payment:', error);
      throw error;
    }
  }

  static async getTotalSpending(): Promise<{ today: number; month: number }> {
    try {
      const payments = await this.getAllPayments();
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const todaySpending = payments
        .filter(payment => new Date(payment.date) >= today)
        .reduce((total, payment) => total + payment.amount, 0);

      const monthSpending = payments
        .filter(payment => new Date(payment.date) >= startOfMonth)
        .reduce((total, payment) => total + payment.amount, 0);

      return { today: todaySpending, month: monthSpending };
    } catch (error) {
      console.error('Error calculating spending:', error);
      return { today: 0, month: 0 };
    }
  }

  static async getCategorySpending(): Promise<Record<PaymentCategory, number>> {
    try {
      const payments = await this.getAllPayments();
      const categories: PaymentCategory[] = [
        'Food', 'Travel', 'Clothes', 'Entertainment', 'Bills', 'Healthcare', 'Others'
      ];

      const categorySpending: Record<PaymentCategory, number> = {} as Record<PaymentCategory, number>;
      
      categories.forEach(category => {
        categorySpending[category] = payments
          .filter(payment => payment.category === category)
          .reduce((total, payment) => total + payment.amount, 0);
      });

      return categorySpending;
    } catch (error) {
      console.error('Error calculating category spending:', error);
      return {
        Food: 0, Travel: 0, Clothes: 0, Entertainment: 0,
        Bills: 0, Healthcare: 0, Others: 0
      };
    }
  }

  static async getFilteredPayments(filter: 'all' | 'manual' | 'sms'): Promise<Payment[]> {
    try {
      const payments = await this.getAllPayments();
      if (filter === 'all') return payments;
      return payments.filter(payment => payment.type === filter);
    } catch (error) {
      console.error('Error filtering payments:', error);
      return [];
    }
  }

  static async exportToCSV(): Promise<string> {
    try {
      const payments = await this.getAllPayments();
      const headers = 'Date,Amount,Category,Description,Type\n';
      const rows = payments.map(payment => {
        const date = new Date(payment.date).toLocaleDateString();
        return `${date},₹${payment.amount},${payment.category},"${payment.description}",${payment.type}`;
      }).join('\n');
      
      return headers + rows;
    } catch (error) {
      console.error('Error exporting payments:', error);
      return '';
    }
  }

  static async exportToExcel(): Promise<string> {
    try {
      const payments = await this.getAllPayments();
      
      // Prepare data for Excel
      const excelData = payments.map(payment => ({
        Date: new Date(payment.date).toLocaleDateString(),
        Time: new Date(payment.date).toLocaleTimeString(),
        Amount: `₹${payment.amount.toFixed(2)}`,
        Category: payment.category,
        Description: payment.description,
        Type: payment.isFromSMS ? 'SMS' : 'Manual',
        'Payment ID': payment.id
      }));

      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Payment History');

      // Set column widths for better formatting
      const colWidths = [
        { wch: 12 }, // Date
        { wch: 10 }, // Time
        { wch: 12 }, // Amount
        { wch: 15 }, // Category
        { wch: 30 }, // Description
        { wch: 8 },  // Type
        { wch: 15 }  // Payment ID
      ];
      ws['!cols'] = colWidths;

      // Generate Excel file buffer
      const excelBuffer = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      
      // Create filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const fileName = `SpendBook_${timestamp}.xlsx`;
      const filePath = `${RNFS.DownloadDirectoryPath}/${fileName}`;

      // Write file to downloads directory
      await RNFS.writeFile(filePath, excelBuffer, 'base64');
      
      return filePath;
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw error;
    }
  }

  static async clearAllPayments(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing all payments:', error);
      throw error;
    }
  }

  static async clearSmsPayments(): Promise<void> {
    try {
      const payments = await this.getAllPayments();
      const manualPayments = payments.filter(payment => payment.type !== 'sms');
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(manualPayments));
    } catch (error) {
      console.error('Error clearing SMS payments:', error);
      throw error;
    }
  }

  static async getPaymentStats(): Promise<{ total: number; manual: number; sms: number }> {
    try {
      const payments = await this.getAllPayments();
      const manual = payments.filter(payment => payment.type === 'manual').length;
      const sms = payments.filter(payment => payment.type === 'sms').length;

      return {
        total: payments.length,
        manual,
        sms
      };
    } catch (error) {
      console.error('Error getting payment stats:', error);
      return { total: 0, manual: 0, sms: 0 };
    }
  }

  static async getRecentPayments(count: number = 15): Promise<Payment[]> {
    try {
      const payments = await this.getAllPayments();
      return payments.slice(0, count);
    } catch (error) {
      console.error('Error getting recent payments:', error);
      return [];
    }
  }

  static async getPaymentsByMonth(year: number, month: number): Promise<Payment[]> {
    try {
      const payments = await this.getAllPayments();
      return payments.filter(payment => {
        const paymentDate = new Date(payment.date);
        return paymentDate.getFullYear() === year && paymentDate.getMonth() === month;
      });
    } catch (error) {
      console.error('Error getting payments by month:', error);
      return [];
    }
  }

  static async getAvailableMonths(): Promise<Array<{ year: number; month: number; monthName: string }>> {
    try {
      const payments = await this.getAllPayments();
      const monthsSet = new Set<string>();
      const months: Array<{ year: number; month: number; monthName: string }> = [];

      payments.forEach(payment => {
        const date = new Date(payment.date);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        if (!monthsSet.has(key)) {
          monthsSet.add(key);
          months.push({
            year: date.getFullYear(),
            month: date.getMonth(),
            monthName: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
          });
        }
      });

      return months.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });
    } catch (error) {
      console.error('Error getting available months:', error);
      return [];
    }
  }

  static async exportMonthlyCSV(year: number, month: number): Promise<string> {
    try {
      const payments = await this.getPaymentsByMonth(year, month);
      const headers = 'Date,Amount,Category,Description,Type\n';
      const rows = payments.map(payment => {
        const date = new Date(payment.date).toLocaleDateString();
        return `${date},₹${payment.amount},"${payment.category}","${payment.description}",${payment.type}`;
      }).join('\n');
      
      return headers + rows;
    } catch (error) {
      console.error('Error exporting monthly payments:', error);
      return '';
    }
  }

  static async getSpendingInsights(): Promise<{
    highestSpendingDay: string;
    averageDailySpending: number;
    mostSpentCategory: PaymentCategory;
    totalTransactions: number;
    avgTransactionAmount: number;
  }> {
    try {
      const payments = await this.getAllPayments();
      if (payments.length === 0) {
        return {
          highestSpendingDay: 'No data',
          averageDailySpending: 0,
          mostSpentCategory: 'Food',
          totalTransactions: 0,
          avgTransactionAmount: 0,
        };
      }

      // Find highest spending day
      const dailySpending = new Map<string, number>();
      payments.forEach(payment => {
        const day = new Date(payment.date).toLocaleDateString('en-US', { weekday: 'long' });
        dailySpending.set(day, (dailySpending.get(day) || 0) + payment.amount);
      });

      const highestSpendingDay = [...dailySpending.entries()]
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'No data';

      // Calculate averages
      const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
      const avgTransactionAmount = totalAmount / payments.length;

      // Get date range for daily average
      const dates = payments.map(p => new Date(p.date).toDateString());
      const uniqueDates = new Set(dates);
      const averageDailySpending = totalAmount / uniqueDates.size;

      // Most spent category
      const categorySpending = await this.getCategorySpending();
      const mostSpentCategory = Object.entries(categorySpending)
        .sort((a, b) => b[1] - a[1])[0]?.[0] as PaymentCategory || 'Food';

      return {
        highestSpendingDay,
        averageDailySpending,
        mostSpentCategory,
        totalTransactions: payments.length,
        avgTransactionAmount,
      };
    } catch (error) {
      console.error('Error getting spending insights:', error);
      return {
        highestSpendingDay: 'Error',
        averageDailySpending: 0,
        mostSpentCategory: 'Food',
        totalTransactions: 0,
        avgTransactionAmount: 0,
      };
    }
  }
}
