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
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PaymentCategory, RootStackParamList } from '../types';
import { PaymentService } from '../services/PaymentService';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const AddPaymentScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PaymentCategory>('Food');

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
    return recommendations[category] || [];
  };

  const handleSavePayment = async () => {
    if (!amount) {
      Alert.alert('Error', 'Please enter an amount');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      await PaymentService.addPayment({
        amount: numAmount,
        description: description.trim() || `${selectedCategory} expense`,
        category: selectedCategory,
      });

      Alert.alert(
        'Payment Saved! 🎉',
        `₹${numAmount.toFixed(2)} for ${description} in ${selectedCategory} category has been saved successfully.`,
        [
          { text: 'OK', onPress: () => {
            setAmount('');
            setDescription('');
            setSelectedCategory('Food');
            navigation.goBack();
          }}
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save payment. Please try again.');
      console.error('Error saving payment:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Add Payment</Text>
          <Text style={styles.headerSubtitle}>Record your expense</Text>
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
            numberOfLines={2}
          />
          
          {/* Quick Recommendations */}
          <View style={styles.recommendationsContainer}>
            <Text style={styles.recommendationsLabel}>Quick suggestions:</Text>
            <View style={styles.recommendationsGrid}>
              {getDescriptionRecommendations(selectedCategory).slice(0, 6).map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.recommendationChip}
                  onPress={() => setDescription(suggestion)}
                >
                  <Text style={styles.recommendationText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.saveButtonSection}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSavePayment}>
            <Text style={styles.saveButtonText}>💾 Save Payment</Text>
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
    padding: 15,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
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
    backgroundColor: '#27ae60',
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

export default AddPaymentScreen;
