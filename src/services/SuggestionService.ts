import { PaymentCategory, DescriptionSuggestion } from '../types';

export class SuggestionService {
  private static suggestions: DescriptionSuggestion[] = [
    // Food suggestions
    { text: 'Breakfast at cafe', category: 'Food', icon: '☕' },
    { text: 'Lunch buffet', category: 'Food', icon: '🍽️' },
    { text: 'Dinner restaurant', category: 'Food', icon: '🍷' },
    { text: 'Pizza delivery', category: 'Food', icon: '🍕' },
    { text: 'Coffee and snacks', category: 'Food', icon: '☕' },
    { text: 'Grocery shopping', category: 'Food', icon: '🛒' },
    { text: 'Street food', category: 'Food', icon: '🌮' },
    { text: 'Ice cream treat', category: 'Food', icon: '🍦' },
    { text: 'Fast food meal', category: 'Food', icon: '🍔' },
    { text: 'Fresh juice', category: 'Food', icon: '🧃' },
    { text: 'Bakery items', category: 'Food', icon: '🥐' },
    { text: 'Fruits and vegetables', category: 'Food', icon: '🥗' },

    // Travel suggestions
    { text: 'Metro/Bus fare', category: 'Travel', icon: '🚌' },
    { text: 'Auto rickshaw', category: 'Travel', icon: '🛺' },
    { text: 'Taxi ride', category: 'Travel', icon: '🚕' },
    { text: 'Uber/Ola', category: 'Travel', icon: '🚗' },
    { text: 'Train ticket', category: 'Travel', icon: '🚂' },
    { text: 'Flight booking', category: 'Travel', icon: '✈️' },
    { text: 'Petrol/Diesel', category: 'Travel', icon: '⛽' },
    { text: 'Parking fees', category: 'Travel', icon: '🅿️' },
    { text: 'Highway toll', category: 'Travel', icon: '🛣️' },
    { text: 'Vehicle service', category: 'Travel', icon: '🔧' },

    // Clothes suggestions
    { text: 'Casual shirt', category: 'Clothes', icon: '👕' },
    { text: 'Formal wear', category: 'Clothes', icon: '👔' },
    { text: 'Jeans/Trousers', category: 'Clothes', icon: '👖' },
    { text: 'Footwear', category: 'Clothes', icon: '👟' },
    { text: 'Accessories', category: 'Clothes', icon: '👜' },
    { text: 'Winter wear', category: 'Clothes', icon: '🧥' },
    { text: 'Undergarments', category: 'Clothes', icon: '🩲' },
    { text: 'Watch/Jewelry', category: 'Clothes', icon: '⌚' },

    // Entertainment suggestions
    { text: 'Movie tickets', category: 'Entertainment', icon: '🎬' },
    { text: 'Concert/Show', category: 'Entertainment', icon: '🎵' },
    { text: 'Gaming expenses', category: 'Entertainment', icon: '🎮' },
    { text: 'Books/Magazines', category: 'Entertainment', icon: '📚' },
    { text: 'Sports activity', category: 'Entertainment', icon: '⚽' },
    { text: 'Streaming subscription', category: 'Entertainment', icon: '📺' },
    { text: 'Party/Celebration', category: 'Entertainment', icon: '🎉' },
    { text: 'Art/Craft supplies', category: 'Entertainment', icon: '🎨' },

    // Bills suggestions
    { text: 'Electricity bill', category: 'Bills', icon: '⚡' },
    { text: 'Water bill', category: 'Bills', icon: '💧' },
    { text: 'Internet bill', category: 'Bills', icon: '🌐' },
    { text: 'Mobile recharge', category: 'Bills', icon: '📱' },
    { text: 'Gas cylinder', category: 'Bills', icon: '🔥' },
    { text: 'House rent', category: 'Bills', icon: '🏠' },
    { text: 'Insurance premium', category: 'Bills', icon: '🛡️' },
    { text: 'Loan EMI', category: 'Bills', icon: '🏦' },
    { text: 'Credit card bill', category: 'Bills', icon: '💳' },

    // Healthcare suggestions
    { text: 'Doctor consultation', category: 'Healthcare', icon: '👨‍⚕️' },
    { text: 'Medicines', category: 'Healthcare', icon: '💊' },
    { text: 'Lab tests', category: 'Healthcare', icon: '🔬' },
    { text: 'Dental treatment', category: 'Healthcare', icon: '🦷' },
    { text: 'Eye checkup', category: 'Healthcare', icon: '👁️' },
    { text: 'Health supplements', category: 'Healthcare', icon: '💪' },
    { text: 'Medical equipment', category: 'Healthcare', icon: '🩺' },

    // Others suggestions
    { text: 'Gift for someone', category: 'Others', icon: '🎁' },
    { text: 'Charitable donation', category: 'Others', icon: '❤️' },
    { text: 'Home repairs', category: 'Others', icon: '🔨' },
    { text: 'Pet expenses', category: 'Others', icon: '🐕' },
    { text: 'Education fees', category: 'Others', icon: '🎓' },
    { text: 'Office supplies', category: 'Others', icon: '📝' },
    { text: 'Bank charges', category: 'Others', icon: '🏦' },
    { text: 'Miscellaneous', category: 'Others', icon: '📦' },
  ];

  static getFilteredSuggestions(
    query: string, 
    category?: PaymentCategory,
    limit: number = 10
  ): DescriptionSuggestion[] {
    let filtered = this.suggestions;

    // Filter by category if provided
    if (category) {
      filtered = filtered.filter(s => s.category === category);
    }

    // Filter by query if provided
    if (query.trim()) {
      const queryLower = query.toLowerCase();
      filtered = filtered.filter(s => 
        s.text.toLowerCase().includes(queryLower) ||
        s.category.toLowerCase().includes(queryLower)
      );
    }

    return filtered.slice(0, limit);
  }

  static getPopularSuggestions(category?: PaymentCategory): DescriptionSuggestion[] {
    const popular = [
      'Coffee and snacks', 'Uber/Ola', 'Grocery shopping', 'Movie tickets',
      'Mobile recharge', 'Doctor consultation', 'Gift for someone'
    ];

    return this.suggestions.filter(s => 
      popular.includes(s.text) && (!category || s.category === category)
    );
  }

  static getSuggestionsByCategory(category: PaymentCategory): DescriptionSuggestion[] {
    return this.suggestions.filter(s => s.category === category);
  }

  static getCategorySuggestion(description: string): PaymentCategory {
    const descriptionLower = description.toLowerCase();
    
    // Food keywords
    if (['food', 'eat', 'drink', 'coffee', 'tea', 'lunch', 'dinner', 'breakfast', 'snack', 'restaurant', 'cafe', 'pizza', 'burger', 'grocery'].some(word => descriptionLower.includes(word))) {
      return 'Food';
    }
    
    // Travel keywords
    if (['travel', 'uber', 'ola', 'taxi', 'metro', 'bus', 'train', 'flight', 'fuel', 'petrol', 'diesel'].some(word => descriptionLower.includes(word))) {
      return 'Travel';
    }
    
    // Clothes keywords
    if (['cloth', 'shirt', 'jeans', 'shoe', 'dress', 'wear'].some(word => descriptionLower.includes(word))) {
      return 'Clothes';
    }
    
    // Entertainment keywords
    if (['movie', 'game', 'party', 'fun', 'entertainment'].some(word => descriptionLower.includes(word))) {
      return 'Entertainment';
    }
    
    // Bills keywords
    if (['bill', 'recharge', 'electricity', 'water', 'internet', 'rent'].some(word => descriptionLower.includes(word))) {
      return 'Bills';
    }
    
    // Healthcare keywords
    if (['doctor', 'medicine', 'hospital', 'health', 'medical'].some(word => descriptionLower.includes(word))) {
      return 'Healthcare';
    }
    
    return 'Others';
  }
}
