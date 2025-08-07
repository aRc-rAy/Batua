import AsyncStorage from '@react-native-async-storage/async-storage';
import { Payment, PaymentCategory } from '../types';

const STORAGE_KEY = '@PaymentTracker:payments';

export class PaymentService {
  static async getAllPayments(): Promise<Payment[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error('Error getting payments:', error);
      return [];
    }
  }

  static async addPayment(paymentData: {
    amount: number;
    description: string;
    category: PaymentCategory;
  }): Promise<Payment> {
    try {
      const payments = await this.getAllPayments();
      const newPayment: Payment = {
        id: Date.now().toString(),
        amount: paymentData.amount,
        description: paymentData.description,
        category: paymentData.category,
        date: new Date().toISOString(),
        type: 'manual',
        isFromSMS: false
      };

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

  static async clearAllPayments(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing all payments:', error);
      throw error;
    }
  }
}
