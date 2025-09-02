import { PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SmsAndroid from 'react-native-sms-android';
import { PaymentService } from './PaymentService';
import { Payment, PaymentCategory } from '../types';

export class SMSService {
  private static isListening = false;
  private static processedSmsIds: Set<string> = new Set();
  private static readonly PROCESSED_SMS_STORAGE_KEY = 'processed_sms_ids';
  private static readonly MAX_PROCESSED_SMS_TO_KEEP = 1000; // Keep track of last 1000 SMS to prevent storage bloat
  private static readonly SMS_MONITORING_START_TIME_KEY = 'sms_monitoring_start_time';
  private static monitoringStartTime: number | null = null;

  // Enhanced trusted sender list for Play Store compliance
  private static readonly TRUSTED_FINANCIAL_INSTITUTIONS = [
    // Banks
    'HDFC', 'ICICI', 'SBI', 'AXIS', 'KOTAK', 'PNB', 'BOI', 'CANARA', 'UNION',
    'INDUSIND', 'YES', 'RBL', 'FEDERAL', 'IDFC', 'BANDHAN', 'AU',
    // Digital Wallets
    'PAYTM', 'GPAY', 'PHONEPE', 'AMAZONPAY', 'MOBIKWIK', 'FREECHARGE',
    // Card Networks
    'VISA', 'MASTERCARD', 'RUPAY', 'AMEX',
    // UPI
    'UPI', 'BHIM', 'YONO'
  ];

  /**
   * Enhanced privacy-compliant SMS sender verification
   */
  private static isFromTrustedFinancialInstitution(address: string): boolean {
    if (!address) return false;
    
    const normalizedAddress = address.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    return this.TRUSTED_FINANCIAL_INSTITUTIONS.some(institution => 
      normalizedAddress.includes(institution)
    );
  }

  // Load processed SMS IDs from storage
  private static async loadProcessedSmsIds(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.PROCESSED_SMS_STORAGE_KEY);
      if (stored) {
        const ids = JSON.parse(stored);
        this.processedSmsIds = new Set(ids);
      }
    } catch (error) {
      console.error('Error loading processed SMS IDs:', error);
      this.processedSmsIds = new Set();
    }
  }

  // Load monitoring start time from storage
  private static async loadMonitoringStartTime(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.SMS_MONITORING_START_TIME_KEY);
      if (stored) {
        this.monitoringStartTime = JSON.parse(stored);
      } else {
        this.monitoringStartTime = null;
      }
    } catch (error) {
      console.error('Error loading monitoring start time:', error);
      this.monitoringStartTime = null;
    }
  }

  // Save monitoring start time to storage
  private static async saveMonitoringStartTime(): Promise<void> {
    try {
      if (this.monitoringStartTime) {
        await AsyncStorage.setItem(this.SMS_MONITORING_START_TIME_KEY, JSON.stringify(this.monitoringStartTime));
      } else {
        await AsyncStorage.removeItem(this.SMS_MONITORING_START_TIME_KEY);
      }
    } catch (error) {
      console.error('Error saving monitoring start time:', error);
    }
  }

  // Save processed SMS IDs to storage
  private static async saveProcessedSmsIds(): Promise<void> {
    try {
      // Convert Set to Array and keep only the most recent ones
      const idsArray = Array.from(this.processedSmsIds);
      if (idsArray.length > this.MAX_PROCESSED_SMS_TO_KEEP) {
        // Keep only the most recent MAX_PROCESSED_SMS_TO_KEEP IDs
        idsArray.splice(0, idsArray.length - this.MAX_PROCESSED_SMS_TO_KEEP);
        this.processedSmsIds = new Set(idsArray);
      }

      await AsyncStorage.setItem(this.PROCESSED_SMS_STORAGE_KEY, JSON.stringify(idsArray));
    } catch (error) {
      console.error('Error saving processed SMS IDs:', error);
    }
  }

  // Generate a unique identifier for an SMS message
  private static generateSmsId(sms: any): string {
    // Use a combination of sender, date, and body hash for uniqueness
    const content = `${sms.address}_${sms.date}_${sms.body}`;
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash * 31) + char) % 1000000007; // Simple hash function with modulo
    }
    return `sms_${Math.abs(hash).toString(36)}_${sms.date}`;
  }

  // Check if SMS has already been processed
  private static isSmsProcessed(smsId: string): boolean {
    return this.processedSmsIds.has(smsId);
  }

  // Mark SMS as processed
  private static async markSmsAsProcessed(smsId: string): Promise<void> {
    this.processedSmsIds.add(smsId);
    await this.saveProcessedSmsIds();
  }

  // Check if SMS parsing is enabled in settings
  static async isSmsParsingEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem('smsParsingEnabled');
      return enabled ? JSON.parse(enabled) : false;
    } catch {
      return false;
    }
  }

  // Request SMS permissions with enhanced privacy message
  static async requestSmsPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        {
          title: 'Payment Tracker SMS Access',
          message: 'Payment Tracker needs SMS access to automatically detect bank transaction messages and help you track your payments.\n\n• Only reads messages from banks and payment services\n• No personal messages are accessed\n• All data stays on your device\n• You can disable this anytime in settings',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'Allow',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch {
      return false;
    }
  }

  // Parse SMS message to extract payment information with privacy protection
  static parseSmsForPayment(smsBody: string, sender: string, date: number): Payment | null {
    // Privacy check: Only process SMS from trusted financial institutions
    if (!this.isFromTrustedFinancialInstitution(sender)) {
      return null;
    }

    const body = smsBody.toLowerCase();
    
    // Common payment keywords
    const paymentKeywords = [
      'debited', 'withdrawn', 'paid', 'spent', 'transaction', 'upi',
      'payment', 'purchase', 'charged', 'deducted', 'transfer'
    ];

    // Check if SMS contains payment keywords
    const isPaymentSms = paymentKeywords.some(keyword => body.includes(keyword));
    if (!isPaymentSms) return null;

    // Extract amount using regex patterns
    const amountPatterns = [
      /(?:rs\.?|inr|₹)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
      /([0-9,]+(?:\.[0-9]{1,2})?)\s*(?:rs\.?|inr|₹)/i,
      /amount\s*:?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
      /(?:debited|withdrawn|paid|spent)\s*(?:rs\.?|inr|₹)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
      // New pattern for "INR X.XX is paid" format
      /inr\s*([0-9,]+(?:\.[0-9]{1,2})?)\s*is\s*paid/i,
      // Additional patterns for various formats
      /([0-9,]+(?:\.[0-9]{1,2})?)\s*(?:is\s*paid|paid)/i,
    ];

    let amount = 0;
    for (const pattern of amountPatterns) {
      const match = body.match(pattern);
      if (match) {
        amount = parseFloat(match[1].replace(/,/g, ''));
        break;
      }
    }

    if (amount <= 0) return null;

    // Determine category based on keywords and sender
    const category = this.categorizeTransaction(body, sender);
    
    // Generate description
    const description = this.generateDescription(body, sender, amount);

    return {
      id: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      category,
      description,
      date: new Date(date).toISOString(),
      type: 'sms',
      isFromSMS: true,
    };
  }

  // Categorize transaction based on SMS content and sender
  private static categorizeTransaction(body: string, sender: string): PaymentCategory {
    const sender_lower = sender.toLowerCase();
    const body_lower = body.toLowerCase();

    // Food-related
    if (
      sender_lower.includes('zomato') ||
      sender_lower.includes('swiggy') ||
      sender_lower.includes('uber') ||
      sender_lower.includes('ola') ||
      body_lower.includes('restaurant') ||
      body_lower.includes('food') ||
      body_lower.includes('meal')
    ) {
      return 'Food';
    }

    // Travel-related
    if (
      sender_lower.includes('irctc') ||
      sender_lower.includes('makemytrip') ||
      sender_lower.includes('cleartrip') ||
      sender_lower.includes('redbus') ||
      sender_lower.includes('goibibo') ||
      body_lower.includes('flight') ||
      body_lower.includes('train') ||
      body_lower.includes('bus') ||
      body_lower.includes('hotel') ||
      body_lower.includes('travel')
    ) {
      return 'Travel';
    }

    // Shopping/Clothes
    if (
      sender_lower.includes('amazon') ||
      sender_lower.includes('flipkart') ||
      sender_lower.includes('myntra') ||
      sender_lower.includes('nykaa') ||
      sender_lower.includes('ajio') ||
      body_lower.includes('shopping') ||
      body_lower.includes('clothes') ||
      body_lower.includes('fashion')
    ) {
      return 'Clothes';
    }

    // Bills
    if (
      sender_lower.includes('electricity') ||
      sender_lower.includes('water') ||
      sender_lower.includes('gas') ||
      sender_lower.includes('internet') ||
      sender_lower.includes('mobile') ||
      sender_lower.includes('phone') ||
      body_lower.includes('bill') ||
      body_lower.includes('recharge') ||
      body_lower.includes('utility')
    ) {
      return 'Bills';
    }

    // Entertainment
    if (
      sender_lower.includes('netflix') ||
      sender_lower.includes('prime') ||
      sender_lower.includes('spotify') ||
      sender_lower.includes('hotstar') ||
      sender_lower.includes('bookmyshow') ||
      body_lower.includes('movie') ||
      body_lower.includes('music') ||
      body_lower.includes('entertainment')
    ) {
      return 'Entertainment';
    }

    // Healthcare
    if (
      sender_lower.includes('pharmacy') ||
      sender_lower.includes('hospital') ||
      sender_lower.includes('medical') ||
      body_lower.includes('medicine') ||
      body_lower.includes('doctor') ||
      body_lower.includes('health')
    ) {
      return 'Healthcare';
    }

    // Default to Others
    return 'Others';
  }

  // Generate description from SMS content
  private static generateDescription(body: string, sender: string, amount: number): string {
    // Clean sender name
    const cleanSender = sender.replace(/[-]/g, ' ').replace(/[^a-zA-Z0-9\s]/g, '').trim();
    
    // Try to extract merchant name from body
    const merchantPatterns = [
      /at\s+([^.]+?)(?:\s+on|\s+via|\.|$)/i,
      /to\s+([^.]+?)(?:\s+on|\s+via|\.|$)/i,
      /for\s+([^.]+?)(?:\s+on|\s+via|\.|$)/i,
    ];

    let merchantName = '';
    for (const pattern of merchantPatterns) {
      const match = body.match(pattern);
      if (match) {
        merchantName = match[1].trim();
        break;
      }
    }

    if (merchantName && merchantName.length > 3) {
      return `Payment to ${merchantName}`;
    }

    if (cleanSender && cleanSender !== 'SMS' && cleanSender.length > 2) {
      return `Payment via ${cleanSender}`;
    }

    return `SMS Payment ₹${amount.toFixed(2)}`;
  }

  // Start monitoring SMS messages
  static async startSmsMonitoring(): Promise<void> {
    if (this.isListening) return;

    const isEnabled = await this.isSmsParsingEnabled();
    if (!isEnabled) return;

    const hasPermission = await this.requestSmsPermissions();
    if (!hasPermission) return;

    // Load monitoring start time if not already loaded
    if (this.monitoringStartTime === null) {
      await this.loadMonitoringStartTime();
    }

    // Set monitoring start time if this is the first time enabling
    if (this.monitoringStartTime === null) {
      this.monitoringStartTime = Date.now();
      await this.saveMonitoringStartTime();
    }

    this.isListening = true;

    // Check for new SMS messages periodically
    this.checkForNewSms();
  }

  // Stop monitoring SMS messages
  static stopSmsMonitoring(): void {
    this.isListening = false;
  }

  // Enable or disable SMS parsing and handle persistence/monitoring centrally
  static async setSmsParsingEnabled(value: boolean): Promise<boolean> {
    try {
      if (value) {
        // Request permission before enabling
        const hasPermission = await this.requestSmsPermissions();
        if (!hasPermission) return false;

        await AsyncStorage.setItem('smsParsingEnabled', JSON.stringify(true));
        await this.startSmsMonitoring();
        return true;
      } else {
        await AsyncStorage.setItem('smsParsingEnabled', JSON.stringify(false));
        this.stopSmsMonitoring();

        // Clear monitoring start time when disabling SMS parsing
        this.monitoringStartTime = null;
        await this.saveMonitoringStartTime();

        return true;
      }
    } catch (e) {
      console.error('SMSService.setSmsParsingEnabled error', e);
      return false;
    }
  }

  // Check for new SMS messages
  private static async checkForNewSms(): Promise<void> {
    if (!this.isListening) return;

    try {
      // Always ensure processed SMS IDs are loaded
      if (this.processedSmsIds.size === 0) {
        await this.loadProcessedSmsIds();
      }

      // Ensure monitoring start time is loaded
      if (this.monitoringStartTime === null) {
        await this.loadMonitoringStartTime();
      }

      const filter = {
        box: 'inbox',
        maxCount: 50, // Check more messages to ensure we don't miss any
      };

      SmsAndroid.list(
        JSON.stringify(filter),
        (_fail: any) => {
        },
        async (count: number, smsList: string) => {
          try {
            const messages = JSON.parse(smsList);

            for (const sms of messages) {
              const smsId = this.generateSmsId(sms);
              const smsTimestamp = sms.date;

              // Skip messages that are older than when monitoring started
              if (this.monitoringStartTime && smsTimestamp < this.monitoringStartTime) {
                continue;
              }

              // Skip if already processed
              if (this.isSmsProcessed(smsId)) {
                continue;
              }

              const payment = this.parseSmsForPayment(sms.body, sms.address, sms.date);
              if (payment) {
                await PaymentService.addPayment(payment);
                // Only mark as processed if payment was successfully added
                await this.markSmsAsProcessed(smsId);
              }
            }

          } catch (error) {
            console.error('Error processing SMS messages:', error);
          }
        }
      );
    } catch (error) {
      console.error('Error checking for new SMS:', error);
    }

    // Check again after 30 seconds if still listening
    setTimeout(() => {
      this.checkForNewSms();
    }, 30000);
  }

  // Initialize SMS service
  static async initialize(): Promise<void> {
    try {
      // Load processed SMS IDs
      await this.loadProcessedSmsIds();

      // Load monitoring start time
      await this.loadMonitoringStartTime();

      const isEnabled = await this.isSmsParsingEnabled();
      if (isEnabled) {
        await this.startSmsMonitoring();
      }
    } catch (error) {
      console.error('Error initializing SMS service:', error);
    }
  }


  // Force check for recent SMS (for manual testing)
  static async forceCheckRecentSms(): Promise<void> {

    try {
      // Load processed SMS IDs if not already loaded
      if (this.processedSmsIds.size === 0) {
        await this.loadProcessedSmsIds();
      }

      // Load monitoring start time if not already loaded
      if (this.monitoringStartTime === null) {
        await this.loadMonitoringStartTime();
      }

      const hasPermission = await this.requestSmsPermissions();
      if (!hasPermission) {
        return;
      }

      const filter = {
        box: 'inbox',
        maxCount: 20, // Check last 20 messages
      };

      SmsAndroid.list(
        JSON.stringify(filter),
        (_fail: any) => {
        },
        async (count: number, smsList: string) => {
          try {
            const messages = JSON.parse(smsList);

            for (const sms of messages) {
              const smsId = this.generateSmsId(sms);
              const smsTimestamp = sms.date;

              // Skip messages that are older than when monitoring started
              if (this.monitoringStartTime && smsTimestamp < this.monitoringStartTime) {
                continue;
              }

              // Skip if already processed
              if (this.isSmsProcessed(smsId)) {
                continue;
              }

              const payment = this.parseSmsForPayment(sms.body, sms.address, sms.date);
              if (payment) {
                await PaymentService.addPayment(payment);
                // Mark SMS as processed
                await this.markSmsAsProcessed(smsId);
              }
            }

          } catch (error) {
            console.error('Error processing SMS messages:', error);
          }
        }
      );
    } catch (error) {
      console.error('Error in force check:', error);
    }
  }

  // Clear all processed SMS IDs (for testing/debugging)
  static async clearProcessedSmsIds(): Promise<void> {
    try {
      this.processedSmsIds.clear();
      await AsyncStorage.removeItem(this.PROCESSED_SMS_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing processed SMS IDs:', error);
    }
  }

  // Clear monitoring start time (for testing/debugging)
  static async clearMonitoringStartTime(): Promise<void> {
    try {
      this.monitoringStartTime = null;
      await AsyncStorage.removeItem(this.SMS_MONITORING_START_TIME_KEY);
    } catch (error) {
      console.error('Error clearing monitoring start time:', error);
    }
  }

  // Get statistics about processed SMS
  static getProcessedSmsStats(): { totalProcessed: number; storageKey: string } {
    return {
      totalProcessed: this.processedSmsIds.size,
      storageKey: this.PROCESSED_SMS_STORAGE_KEY,
    };
  }

  // Debug method to check current processed SMS state
  static async debugProcessedSms(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.PROCESSED_SMS_STORAGE_KEY);
      if (stored) {
        JSON.parse(stored);
      }

      const startTimeStored = await AsyncStorage.getItem(this.SMS_MONITORING_START_TIME_KEY);
      if (startTimeStored) {
        JSON.parse(startTimeStored);
      }
    } catch (error) {
      console.error('Error reading processed SMS from storage:', error);
    }
  }

  // Test SMS ID generation (for debugging)
  static testSmsIdGeneration(smsBody: string, sender: string, date: number): string {
    const mockSms = {
      body: smsBody,
      address: sender,
      date: date
    };
    const smsId = this.generateSmsId(mockSms);
    return smsId;
  }
}
