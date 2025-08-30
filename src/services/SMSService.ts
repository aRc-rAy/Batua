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

  // Load processed SMS IDs from storage
  private static async loadProcessedSmsIds(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.PROCESSED_SMS_STORAGE_KEY);
      if (stored) {
        const ids = JSON.parse(stored);
        this.processedSmsIds = new Set(ids);
        console.log(`Loaded ${this.processedSmsIds.size} processed SMS IDs from storage`);
      }
    } catch (error) {
      console.error('Error loading processed SMS IDs:', error);
      this.processedSmsIds = new Set();
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

  // Request SMS permissions
  static async requestSmsPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        {
          title: 'SMS Permission',
          message: 'This app needs access to SMS to automatically detect payment transactions',
          buttonPositive: 'Allow',
          buttonNegative: 'Deny',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch {
      return false;
    }
  }

  // Parse SMS message to extract payment information
  static parseSmsForPayment(smsBody: string, sender: string, date: number): Payment | null {
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

    this.isListening = true;
    console.log('SMS monitoring started');

    // Check for new SMS messages periodically
    this.checkForNewSms();
  }

  // Stop monitoring SMS messages
  static stopSmsMonitoring(): void {
    this.isListening = false;
    console.log('SMS monitoring stopped');
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

      const filter = {
        box: 'inbox',
        maxCount: 20, // Check last 20 messages to catch any missed ones
      };

      SmsAndroid.list(
        JSON.stringify(filter),
        (fail: any) => {
          console.log('Failed to read SMS:', fail);
        },
        async (count: number, smsList: string) => {
          try {
            const messages = JSON.parse(smsList);
            let processedCount = 0;
            let skippedCount = 0;

            console.log(`📱 Checking ${messages.length} SMS messages for payments...`);

            for (const sms of messages) {
              const smsId = this.generateSmsId(sms);
              console.log(`🔍 Checking SMS ID: ${smsId.substring(0, 20)}...`);

              // Skip if already processed
              if (this.isSmsProcessed(smsId)) {
                console.log(`⏭️ SMS already processed, skipping: ${smsId.substring(0, 20)}`);
                skippedCount++;
                continue;
              }

              const payment = this.parseSmsForPayment(sms.body, sms.address, sms.date);
              if (payment) {
                await PaymentService.addPayment(payment);
                console.log('✅ Added payment from SMS:', payment.description);

                // Only mark as processed if payment was successfully added
                await this.markSmsAsProcessed(smsId);
                console.log(`💾 Marked SMS as processed: ${smsId.substring(0, 20)}`);
                processedCount++;
              } else {
                console.log(`❌ No payment found in SMS from ${sms.address}`);
              }
            }

            console.log(`� SMS Check Summary: ${processedCount} processed, ${skippedCount} skipped, ${messages.length - processedCount - skippedCount} no payment found`);
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
    console.log('=== Force Checking Recent SMS ===');

    try {
      // Load processed SMS IDs if not already loaded
      if (this.processedSmsIds.size === 0) {
        await this.loadProcessedSmsIds();
      }

      const hasPermission = await this.requestSmsPermissions();
      if (!hasPermission) {
        console.log('❌ SMS permission not granted');
        return;
      }

      const filter = {
        box: 'inbox',
        maxCount: 10, // Check last 10 messages
      };

      SmsAndroid.list(
        JSON.stringify(filter),
        (fail: any) => {
          console.log('❌ Failed to read SMS:', fail);
        },
        async (count: number, smsList: string) => {
          try {
            console.log(`📱 Found ${count} recent SMS messages`);
            const messages = JSON.parse(smsList);
            let processedCount = 0;
            let skippedCount = 0;

            for (const sms of messages) {
              const smsId = this.generateSmsId(sms);
              console.log(`\nChecking SMS from ${sms.address}:`);
              console.log(`Body: ${sms.body.substring(0, 100)}...`);

              // Skip if already processed
              if (this.isSmsProcessed(smsId)) {
                console.log('⏭️ SMS already processed, skipping');
                skippedCount++;
                continue;
              }

              const payment = this.parseSmsForPayment(sms.body, sms.address, sms.date);
              if (payment) {
                console.log('✅ Payment detected and will be added!');
                await PaymentService.addPayment(payment);
                console.log('💾 Payment saved to storage');
                processedCount++;

                // Mark SMS as processed
                await this.markSmsAsProcessed(smsId);
              } else {
                console.log('❌ No payment detected in this SMS');
              }
            }

            console.log(`\n📊 Summary: ${processedCount} new payments processed, ${skippedCount} skipped`);
            console.log('\n=== Force Check Complete ===');
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
      console.log('🧹 Cleared all processed SMS IDs');
    } catch (error) {
      console.error('Error clearing processed SMS IDs:', error);
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
    console.log('=== SMS Processing Debug Info ===');
    console.log(`Total processed SMS in memory: ${this.processedSmsIds.size}`);

    try {
      const stored = await AsyncStorage.getItem(this.PROCESSED_SMS_STORAGE_KEY);
      if (stored) {
        const ids = JSON.parse(stored);
        console.log(`Total processed SMS in storage: ${ids.length}`);
        console.log('Sample SMS IDs:');
        ids.slice(0, 5).forEach((id: string, index: number) => {
          console.log(`  ${index + 1}. ${id.substring(0, 30)}...`);
        });
      } else {
        console.log('No processed SMS found in storage');
      }
    } catch (error) {
      console.error('Error reading processed SMS from storage:', error);
    }

    console.log('=== End Debug Info ===');
  }

  // Test SMS ID generation (for debugging)
  static testSmsIdGeneration(smsBody: string, sender: string, date: number): string {
    const mockSms = {
      body: smsBody,
      address: sender,
      date: date
    };
    const smsId = this.generateSmsId(mockSms);
    console.log(`Generated SMS ID: ${smsId}`);
    console.log(`SMS Content: ${sender} | ${date} | ${smsBody.substring(0, 50)}...`);
    return smsId;
  }
}
