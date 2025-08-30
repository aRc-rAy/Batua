import { NativeModules } from 'react-native';
import { PaymentService } from './PaymentService';

interface WidgetModule {
  updateWidgetData(todaySpending: number, monthSpending: number): Promise<string>;
  areWidgetsSupported(): Promise<boolean>;
}

const { WidgetModule } = NativeModules;

export class WidgetService {
  /**
   * Update widget data with current spending totals
   */
  static async updateWidget(todaySpending: number, monthSpending: number): Promise<boolean> {
    try {
      if (!WidgetModule) {
        console.warn('Widget module not available');
        return false;
      }

      await WidgetModule.updateWidgetData(todaySpending, monthSpending);
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
   * Update widget with latest payment data
   */
  static async refreshWidget(): Promise<void> {
    try {
      // Get data from PaymentService
      const { today, month } = await PaymentService.getTotalSpending();
      
      await this.updateWidget(today, month);
    } catch (error) {
      console.error('Error refreshing widget:', error);
    }
  }
}

export default WidgetService;
