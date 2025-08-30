import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PaymentCategory, RootStackParamList } from '../types';
import { PaymentService } from '../services/PaymentService';
import { useTheme } from '../context/ThemeContext';
import { textStyles } from '../utils/typography';

type NavigationProp = StackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'EditPayment'>;

const EditPaymentScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  
  const { payment } = route.params;
  
  const [amount, setAmount] = useState(payment.amount.toString());
  const [description, setDescription] = useState(payment.description);
  const [selectedCategory, setSelectedCategory] = useState<PaymentCategory>(payment.category);

  const categories: PaymentCategory[] = [
    'Food', 'Travel', 'Clothes', 'Entertainment', 'Bills', 'Healthcare', 'Others'
  ];

  const getCategoryIcon = (category: PaymentCategory): string => {
    const iconMap: Record<PaymentCategory, string> = {
      Food: '🍽️',
      Travel: '✈️',
      Clothes: '👕',
      Entertainment: '🎬',
      Bills: '🧾',
      Healthcare: '🏥',
      Others: '📦'
    };
    return iconMap[category];
  };

  const getDescriptionRecommendations = (category: PaymentCategory): string[] => {
    const recommendations: Record<PaymentCategory, string[]> = {
      Food: ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Coffee', 'Groceries', 'Restaurant'],
      Travel: ['Local Bus', 'Metro', 'Train', 'Flight', 'Taxi', 'Auto', 'Fuel', 'Parking'],
      Clothes: ['Shirt', 'Jeans', 'Shoes', 'Accessories', 'Formal Wear', 'Casual Wear'],
      Entertainment: ['Movie', 'Concert', 'Game', 'Books', 'Music', 'Sports', 'Party'],
      Bills: ['Electricity', 'Water', 'Internet', 'Mobile', 'Gas', 'Insurance', 'Rent'],
      Healthcare: ['Doctor Visit', 'Medicines', 'Lab Tests', 'Dental', 'Eye Care', 'Checkup'],
      Others: ['Gifts', 'Donation', 'Repairs', 'Maintenance', 'Miscellaneous']
    };
    return recommendations[category];
  };

  const validateAndSave = async () => {
    const parsedAmount = parseFloat(amount);

    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0');
      return;
    }

    if (parsedAmount > 1000000) {
      Alert.alert('Amount Too High', 'Please enter an amount less than ₹10,00,000');
      return;
    }

    try {
      const updatedPayment = {
        ...payment,
        amount: parsedAmount,
        description: description.trim(),
        category: selectedCategory,
      };

      await PaymentService.updatePayment(payment.id, updatedPayment);
      Alert.alert(
        'Success', 
        'Payment updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error updating payment:', error);
      Alert.alert('Error', 'Failed to update payment. Please try again.');
    }
  };

  const handleRecommendationPress = (recommendation: string) => {
    setDescription(recommendation);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 16,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      marginBottom: 10,
    },
    backButtonText: {
      ...textStyles.bodyMedium,
      color: theme.colors.primary,
      paddingVertical: 2,
      lineHeight: 22,
    },
    headerTitle: {
      ...textStyles.heading,
      color: theme.colors.text,
    },
    headerSubtitle: {
      ...textStyles.body,
      color: theme.colors.textSecondary,
    },
    section: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    label: {
      ...textStyles.bodyMedium,
      color: theme.colors.text,
      marginBottom: 8,
    },
    amountInput: {
      ...textStyles.subheading,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    categoriesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    categoryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 8,
    },
    selectedCategory: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    categoryIcon: {
      ...textStyles.large,
      marginRight: 8,
    },
    categoryText: {
      ...textStyles.caption,
      color: theme.colors.text,
    },
    selectedCategoryText: {
      color: '#ffffff',
    },
    descriptionInput: {
      ...textStyles.bodyMedium,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      minHeight: 80,
      textAlignVertical: 'top',
    },
    recommendationsContainer: {
      marginTop: 12,
    },
    recommendationsLabel: {
      ...textStyles.caption,
      color: theme.colors.textSecondary,
      marginBottom: 8,
    },
    recommendationsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    recommendationChip: {
      backgroundColor: theme.colors.background,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    recommendationText: {
      ...textStyles.caption,
      color: theme.colors.text,
    },
    saveButtonSection: {
      paddingHorizontal: 20,
      paddingVertical: 20,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    saveButtonText: {
      ...textStyles.button,
      color: '#ffffff',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Payment</Text>
          <Text style={styles.headerSubtitle}>Update your expense details</Text>
        </View>

        {/* Amount Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Amount (₹)</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="numeric"
            placeholderTextColor="#bdc3c7"
          />
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoriesContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.selectedCategory
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={styles.categoryIcon}>
                  {getCategoryIcon(category)}
                </Text>
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category && styles.selectedCategoryText
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description Input with Recommendations */}
        <View style={styles.section}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={styles.descriptionInput}
            value={description}
            onChangeText={setDescription}
            placeholder={`What did you spend on? (e.g., ${getDescriptionRecommendations(selectedCategory)[0]})`}
            placeholderTextColor="#bdc3c7"
            multiline
          />

          {/* Recommendations */}
          <View style={styles.recommendationsContainer}>
            <Text style={styles.recommendationsLabel}>Quick suggestions:</Text>
            <View style={styles.recommendationsGrid}>
              {getDescriptionRecommendations(selectedCategory).slice(0, 6).map((recommendation, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.recommendationChip}
                  onPress={() => handleRecommendationPress(recommendation)}
                >
                  <Text style={styles.recommendationText}>{recommendation}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Update Button */}
        <View style={styles.saveButtonSection}>
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={validateAndSave}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>Update Payment</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditPaymentScreen;
