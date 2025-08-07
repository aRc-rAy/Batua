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

type NavigationProp = StackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'EditPayment'>;

const EditPaymentScreen: React.FC = () => {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: '600',
    paddingVertical: 2,
    lineHeight: 22,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
    paddingVertical: 3,
    lineHeight: 30,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    paddingVertical: 2,
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 15,
    marginBottom: 18,
  },
  saveButtonSection: {
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 6,
    paddingVertical: 2,
    lineHeight: 20,
  },
  amountInput: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 12,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  descriptionInput: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#2c3e50',
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    minHeight: 60,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  selectedCategory: {
    backgroundColor: '#3498db',
  },
  categoryIcon: {
    fontSize: 18,
    marginBottom: 3,
  },
  categoryText: {
    fontSize: 11,
    color: '#2c3e50',
    fontWeight: '500',
    paddingVertical: 1,
    lineHeight: 16,
  },
  selectedCategoryText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#3498db',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    paddingVertical: 2,
    lineHeight: 22,
  },
  recommendationsContainer: {
    marginTop: 10,
  },
  recommendationsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 6,
    paddingVertical: 2,
    lineHeight: 18,
  },
  recommendationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  recommendationChip: {
    backgroundColor: '#e8f4f8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3498db',
  },
  recommendationText: {
    fontSize: 12,
    color: '#3498db',
    fontWeight: '500',
    paddingVertical: 1,
    lineHeight: 16,
  },
});

export default EditPaymentScreen;
