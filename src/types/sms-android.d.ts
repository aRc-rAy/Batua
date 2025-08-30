declare module 'react-native-sms-android' {
  export interface SMSFilter {
    box?: string;
    maxCount?: number;
  }

  interface SMSAndroid {
    list(
      filter: string,
      fail: (error: any) => void,
      success: (count: number, smsList: string) => void
    ): void;
  }

  const SmsAndroid: SMSAndroid;
  export default SmsAndroid;
}
