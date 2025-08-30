import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  PropsWithChildren,
} from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Theme {
  isDark: boolean;
  colors: {
    primary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    card: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    disabled: string;
    tabActive: string;
    tabInactive: string;
  };
  typography: {
    heading: number;
    subheading: number;
    body: number;
    caption: number;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
  };
}

const lightTheme: Theme = {
  isDark: false,
  colors: {
    primary: '#2980b9',
    background: '#f8f9fa',
    surface: '#ffffff',
    text: '#2c3e50',
    textSecondary: '#7f8c8d',
    border: '#e1e8ed',
    card: '#ffffff',
    accent: '#3498db',
    success: '#27ae60',
    warning: '#f39c12',
    error: '#e74c3c',
    info: '#17a2b8',
    disabled: '#bdc3c7',
    tabActive: '#2980b9',
    tabInactive: '#95a5a6',
  },
  typography: {
    heading: 20,
    subheading: 16,
    body: 14,
    caption: 12,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
  },
};

const darkTheme: Theme = {
  isDark: true,
  colors: {
    primary: '#3498db',
    background: '#121212',
    surface: '#1e1e1e',
    text: '#ffffff',
    textSecondary: '#b3b3b3',
    border: '#333333',
    card: '#1e1e1e',
    accent: '#5dade2',
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    info: '#29b6f6',
    disabled: '#555555',
    tabActive: '#3498db',
    tabInactive: '#888888',
  },
  typography: {
    heading: 20,
    subheading: 16,
    body: 14,
    caption: 12,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
  },
};

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const systemScheme = useColorScheme(); // "light" | "dark" | null
  const [theme, setTheme] = useState<Theme>(lightTheme);

  useEffect(() => {
    loadTheme();
  }, [systemScheme]);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('@theme');
      if (savedTheme) {
        setTheme(savedTheme === 'dark' ? darkTheme : lightTheme);
      } else {
        // fallback to system preference if available
        setTheme(systemScheme === 'dark' ? darkTheme : lightTheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleTheme = useCallback(async () => {
    try {
      const newTheme = theme.isDark ? lightTheme : darkTheme;
      setTheme(newTheme);
      await AsyncStorage.setItem('@theme', newTheme.isDark ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
