import { NativeModules } from 'react-native';
import { PaymentService } from './PaymentService';

interface WidgetModule {
  updateWidgetData(todaySpending: number, weekSpending: number, monthSpending: number): Promise<string>;
  areWidgetsSupported(): Promise<boolean>;
}

const { WidgetModule } = NativeModules;

export class WidgetService {
  /**
   * Update widget data with current spending totals
   */
  static async updateWidget(todaySpending: number, weekSpending: number, monthSpending: number): Promise<boolean> {
    try {
      if (!WidgetModule) {
        console.warn('Widget module not available');
        return false;
      }

      await WidgetModule.updateWidgetData(todaySpending, weekSpending, monthSpending);
      return true;
    } catch (error) {
      console.error('Error updating widget:', error);
      return false;
    }
  }

  /**
   * Check if widgets are supported on this device
   */
  static async isWidgetSupported(): Promise<boolean> {
    try {
      if (!WidgetModule) {
        return false;
      }

      return await WidgetModule.areWidgetsSupported();
    } catch (error) {
      console.error('Error checking widget support:', error);
      return false;
    }
  }

  /**
   * Get weekly spending total
   */
  static async getWeeklySpending(): Promise<number> {
    try {
      const payments = await PaymentService.getAllPayments();
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
      startOfWeek.setHours(0, 0, 0, 0);

      return payments
        .filter((payment) => new Date(payment.date) >= startOfWeek)
        .reduce((total: number, payment) => total + payment.amount, 0);
    } catch (error) {
      console.error('Error getting weekly spending:', error);
      return 0;
    }
  }

  /**
   * Update widget with latest payment data
   */
  static async refreshWidget(): Promise<void> {
    try {
      // Get data from PaymentService
      const { today, month } = await PaymentService.getTotalSpending();
      const weekSpending = await this.getWeeklySpending();
      
      await this.updateWidget(today, weekSpending, month);
      
      // Also update compact widget if available
      if (WidgetModule) {
        // The native module will update both widget types
        console.log('Widget data updated:', { today, weekSpending, month });
      }
    } catch (error) {
      console.error('Error refreshing widget:', error);
    }
  }
}

export default WidgetService;
