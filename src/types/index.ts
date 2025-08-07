// Payment categories
export type PaymentCategory = 'Food' | 'Travel' | 'Clothes' | 'Entertainment' | 'Bills' | 'Healthcare' | 'Others';

// Payment entry interface
export interface Payment {
  id: string;
  amount: number;
  description: string;
  category: PaymentCategory;
  date: string; // ISO date string for JSON serialization
  type: 'manual' | 'sms'; // Payment type for filtering
  isFromSMS: boolean;
}

// Navigation types
export type RootStackParamList = {
  Main: undefined;
  AddPayment: undefined;
  EditPayment: { payment: Payment };
  Analytics: undefined;
  Settings: undefined;
};

export type TabParamList = {
  Home: undefined;
  History: undefined;
  Analytics: undefined;
  Settings: undefined;
};

// Chart data types
export interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    colors?: (opacity: number) => string[];
  }[];
}

// Analytics period
export type AnalyticsPeriod = '7days' | '2weeks' | '1month' | '3months' | '6months' | '1year';
