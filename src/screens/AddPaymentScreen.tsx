import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PaymentCategory, RootStackParamList, DescriptionSuggestion } from '../types';
import { PaymentService } from '../services/PaymentService';
import { SuggestionService } from '../services/SuggestionService';
import { useTheme } from '../context/ThemeContext';
import { textStyles } from '../utils/typography';
import { formatAmount } from '../utils/formatting';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const AddPaymentScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PaymentCategory | null>(null);
  const [suggestions, setSuggestions] = useState<DescriptionSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

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

  useEffect(() => {
    // Load initial suggestions
    if (selectedCategory) {
      const categorySuggestions = SuggestionService.getSuggestionsByCategory(selectedCategory);
      setSuggestions(categorySuggestions.slice(0, 8));
    } else {
      const popularSuggestions = SuggestionService.getPopularSuggestions();
      setSuggestions(popularSuggestions);
    }
  }, [selectedCategory]);

  useEffect(() => {
    // Update suggestions based on description input
    if (description.length > 1) {
      const filteredSuggestions = SuggestionService.getFilteredSuggestions(
        description,
        selectedCategory || undefined,
        8
      );
      setSuggestions(filteredSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      if (selectedCategory) {
        const categorySuggestions = SuggestionService.getSuggestionsByCategory(selectedCategory);
        setSuggestions(categorySuggestions.slice(0, 8));
      }
    }
  }, [description, selectedCategory]);

  const handleDescriptionChange = (text: string) => {
    setDescription(text);
    
    // Auto-suggest category if none selected
    if (!selectedCategory && text.length > 2) {
      // Category suggestion is handled in render for visual feedback
    }
  };

  const handleSuggestionPress = (suggestion: DescriptionSuggestion) => {
    setDescription(suggestion.text);
    if (!selectedCategory) {
      setSelectedCategory(suggestion.category);
    }
    setShowSuggestions(false);
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

    // Use auto-suggested category if none selected
    let finalCategory = selectedCategory;
    if (!finalCategory && description.length > 2) {
      finalCategory = SuggestionService.getCategorySuggestion(description);
    }
    if (!finalCategory) {
      finalCategory = 'Others';
    }

    try {
      await PaymentService.addPayment({
        amount: numAmount,
        description: description.trim() || `${finalCategory} expense`,
        category: finalCategory,
      });

      Alert.alert(
        'Payment Saved! 🎉',
        `${formatAmount(numAmount, true)} for "${description || `${finalCategory} expense`}" has been saved successfully.`,
        [
          { text: 'Add Another', onPress: () => {
            setAmount('');
            setDescription('');
            setSelectedCategory(null);
          }},
          { text: 'Done', onPress: () => navigation.goBack() }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save payment. Please try again.');
      console.error('Error saving payment:', error);
    }
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
    headerTitle: {
      ...textStyles.heading,
      color: theme.colors.text,
      marginBottom: 4,
    },
    headerSubtitle: {
      ...textStyles.body,
      color: theme.colors.textSecondary,
    },
    form: {
      padding: 20,
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      ...textStyles.bodySemibold,
      color: theme.colors.text,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      padding: 16,
      ...textStyles.body,
      color: theme.colors.text,
      backgroundColor: theme.colors.surface,
    },
    descriptionContainer: {
      position: 'relative',
    },
    suggestionsContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      marginTop: 8,
      maxHeight: 200,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    suggestionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    suggestionEmoji: {
      ...textStyles.large,
      marginRight: 12,
    },
    suggestionText: {
      ...textStyles.small,
      color: theme.colors.text,
      flex: 1,
    },
    suggestionCategory: {
      ...textStyles.caption,
      color: theme.colors.textSecondary,
      fontStyle: 'italic',
    },
    categorySection: {
      marginBottom: 20,
    },
    categoryLabel: {
      ...textStyles.bodySemibold,
      color: theme.colors.text,
      marginBottom: 8,
    },
    categoryOptional: {
      ...textStyles.caption,
      color: theme.colors.textSecondary,
      fontStyle: 'italic',
    },
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    categoryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      minWidth: 100,
    },
    categoryButtonSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    categoryEmoji: {
      ...textStyles.bodyMedium,
      marginRight: 8,
    },
    categoryText: {
      ...textStyles.smallMedium,
      color: theme.colors.text,
    },
    categoryTextSelected: {
      color: '#ffffff',
    },
    autoSuggestedCategory: {
      borderColor: theme.colors.warning,
      borderWidth: 2,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 20,
    },
    saveButtonText: {
      ...textStyles.large,
      fontWeight: '600',
      color: '#ffffff',
    },
    quickSuggestions: {
      marginBottom: 20,
    },
    quickSuggestionsList: {
      paddingVertical: 8,
    },
    quickSuggestionItem: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
      marginRight: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      minWidth: 80,
    },
    quickSuggestionText: {
      ...textStyles.caption,
      color: theme.colors.text,
      textAlign: 'center',
    },
    categoryHeader: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginBottom: 12,
    },
    quickSuggestionsLabel: {
      ...textStyles.bodySemibold,
      color: theme.colors.text,
      marginBottom: 12,
    },
  });

  const renderSuggestion = ({ item }: { item: DescriptionSuggestion }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionPress(item)}
    >
      <Text style={styles.suggestionEmoji}>{item.icon}</Text>
      <Text style={styles.suggestionText}>{item.text}</Text>
      <Text style={styles.suggestionCategory}>{item.category}</Text>
    </TouchableOpacity>
  );

  const renderQuickSuggestion = ({ item }: { item: DescriptionSuggestion }) => (
    <TouchableOpacity
      style={styles.quickSuggestionItem}
      onPress={() => handleSuggestionPress(item)}
    >
      <Text style={styles.quickSuggestionText}>{item.icon} {item.text}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Add Payment</Text>
          <Text style={styles.headerSubtitle}>Record your expense quickly</Text>
        </View>

        <View style={styles.form}>
          {/* Amount Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Amount *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter amount (₹)"
              placeholderTextColor={theme.colors.textSecondary}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
          </View>

          {/* Description Input with Suggestions */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <View style={styles.descriptionContainer}>
              <TextInput
                style={styles.input}
                placeholder="What did you spend on?"
                placeholderTextColor={theme.colors.textSecondary}
                value={description}
                onChangeText={handleDescriptionChange}
                multiline={false}
              />
              
              {showSuggestions && suggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <FlatList
                    data={suggestions}
                    renderItem={renderSuggestion}
                    keyExtractor={(item, index) => `suggestion-${index}`}
                    maxToRenderPerBatch={8}
                    scrollEnabled={false}
                  />
                </View>
              )}
            </View>
          </View>

          {/* Quick Suggestions */}
          {!showSuggestions && suggestions.length > 0 && (
            <View style={styles.quickSuggestions}>
              <Text style={styles.quickSuggestionsLabel}>Quick Suggestions</Text>
              <FlatList
                horizontal
                data={suggestions}
                renderItem={renderQuickSuggestion}
                keyExtractor={(item, index) => `quick-${index}`}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickSuggestionsList}
              />
            </View>
          )}

          {/* Category Selection */}
          <View style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryLabel}>Category </Text>
              <Text style={styles.categoryOptional}>(optional - auto-suggested based on description)</Text>
            </View>
            
            <View style={styles.categoryGrid}>
              {categories.map((category) => {
                const isSelected = selectedCategory === category;
                const isAutoSuggested = !selectedCategory && description.length > 2 && 
                  SuggestionService.getCategorySuggestion(description) === category;
                
                return (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      isSelected && styles.categoryButtonSelected,
                      isAutoSuggested && styles.autoSuggestedCategory,
                    ]}
                    onPress={() => setSelectedCategory(isSelected ? null : category)}
                  >
                    <Text style={styles.categoryEmoji}>{getCategoryIcon(category)}</Text>
                    <Text style={[styles.categoryText, isSelected && styles.categoryTextSelected]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSavePayment}>
            <Text style={styles.saveButtonText}>💾 Save Payment</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddPaymentScreen;
