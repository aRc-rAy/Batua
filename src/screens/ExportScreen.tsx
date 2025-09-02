import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../types';
import { PaymentService } from '../services/PaymentService';
import { useTheme } from '../context/ThemeContext';
import { textStyles } from '../utils/typography';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface ExportStep {
  step: 'ready' | 'exporting' | 'complete';
  progress: number;
  fileName?: string;
  filePath?: string;
}

const ExportScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [paymentCount, setPaymentCount] = useState(0);
  const [exportState, setExportState] = useState<ExportStep>({
    step: 'ready',
    progress: 0,
  });
  const [progressAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadPaymentCount();
  }, []);

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: exportState.progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [exportState.progress]);

  const loadPaymentCount = async () => {
    try {
      const payments = await PaymentService.getAllPayments();
      setPaymentCount(payments.length);
    } catch (error) {
      console.error('Error loading payment count:', error);
    }
  };

  const handleStartExport = async () => {
    try {
      setExportState({ step: 'exporting', progress: 10 });

      // Simulate progress steps
      setTimeout(() => setExportState(prev => ({ ...prev, progress: 30 })), 200);
      setTimeout(() => setExportState(prev => ({ ...prev, progress: 60 })), 500);
      setTimeout(() => setExportState(prev => ({ ...prev, progress: 80 })), 800);

      const filePath = await PaymentService.exportToExcel();

      if (filePath) {
        const fileName = filePath.split('/').pop() || 'SpendBook_Export.xlsx';
        setExportState({
          step: 'complete',
          progress: 100,
          fileName,
          filePath,
        });
      } else {
        throw new Error('Failed to generate file');
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Failed', 'Failed to export payments to Excel');
      setExportState({ step: 'ready', progress: 0 });
    }
  };

  const exportStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      ...textStyles.heading,
      color: theme.colors.text,
      marginLeft: 16,
    },
    backButton: {
      padding: 8,
      marginLeft: -8,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 24,
      marginBottom: 20,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    cardTitle: {
      ...textStyles.subheading,
      color: theme.colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    statsLabel: {
      ...textStyles.body,
      color: theme.colors.textSecondary,
    },
    statsValue: {
      ...textStyles.body,
      color: theme.colors.text,
      fontWeight: '600',
    },
    exportButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 20,
    },
    exportButtonText: {
      ...textStyles.body,
      color: theme.colors.surface,
      fontWeight: '600',
    },
    exportButtonDisabled: {
      backgroundColor: theme.colors.border,
    },
    progressCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
    },
    progressTitle: {
      ...textStyles.subheading,
      color: theme.colors.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    progressBarContainer: {
      width: '100%',
      height: 8,
      backgroundColor: theme.colors.border,
      borderRadius: 4,
      marginBottom: 16,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      backgroundColor: theme.colors.primary,
      borderRadius: 4,
    },
    progressText: {
      ...textStyles.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 16,
    },
    completeCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
    },
    completeIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    completeTitle: {
      ...textStyles.subheading,
      color: theme.colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    fileName: {
      ...textStyles.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 20,
    },
    doneButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 24,
      minWidth: 120,
      alignItems: 'center',
    },
    doneButtonText: {
      ...textStyles.body,
      color: theme.colors.surface,
      fontWeight: '600',
    },
  });

  const renderContent = () => {
    switch (exportState.step) {
      case 'ready':
        return (
          <>
            <View style={exportStyles.card}>
              <Text style={exportStyles.cardTitle}>Export Data Overview</Text>
              
              <View style={exportStyles.statsRow}>
                <Text style={exportStyles.statsLabel}>Total Payments</Text>
                <Text style={exportStyles.statsValue}>{paymentCount} records</Text>
              </View>
              
              <View style={exportStyles.statsRow}>
                <Text style={exportStyles.statsLabel}>Export Format</Text>
                <Text style={exportStyles.statsValue}>Excel (.xlsx)</Text>
              </View>
              
              <View style={exportStyles.statsRow}>
                <Text style={exportStyles.statsLabel}>File Location</Text>
                <Text style={exportStyles.statsValue}>Downloads folder</Text>
              </View>
              
              <TouchableOpacity
                style={[
                  exportStyles.exportButton,
                  paymentCount === 0 && exportStyles.exportButtonDisabled
                ]}
                onPress={handleStartExport}
                disabled={paymentCount === 0}
              >
                <Text style={exportStyles.exportButtonText}>
                  {paymentCount === 0 ? 'No Data to Export' : 'Start Export'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        );

      case 'exporting':
        return (
          <View style={exportStyles.progressCard}>
            <Text style={exportStyles.progressTitle}>Exporting Data</Text>
            
            <View style={exportStyles.progressBarContainer}>
              <Animated.View
                style={[
                  exportStyles.progressBar,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
            
            <Text style={exportStyles.progressText}>
              {exportState.progress}% Complete
            </Text>
            
            <Text style={exportStyles.progressText}>
              Generating Excel file...
            </Text>
          </View>
        );

      case 'complete':
        return (
          <View style={exportStyles.completeCard}>
            <View style={exportStyles.completeIcon}>
              <Ionicons name="checkmark" size={32} color={theme.colors.primary} />
            </View>
            
            <Text style={exportStyles.completeTitle}>Export Complete</Text>
            
            <Text style={exportStyles.fileName}>
              {exportState.fileName}
            </Text>
            
            <TouchableOpacity
              style={exportStyles.doneButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={exportStyles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={exportStyles.container}>
      <View style={exportStyles.header}>
        <TouchableOpacity
          style={exportStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={exportStyles.headerTitle}>Export to Excel</Text>
      </View>

      <View style={exportStyles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
};

export default ExportScreen;
