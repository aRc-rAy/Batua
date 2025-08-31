import { PaymentCategory, DescriptionSuggestion } from '../types';

export class SuggestionService {
  private static suggestions: DescriptionSuggestion[] = [
    // Food suggestions
    { text: 'Breakfast at cafe', category: 'Food', icon: 'cafe' },
    { text: 'Lunch buffet', category: 'Food', icon: 'restaurant' },
    { text: 'Dinner restaurant', category: 'Food', icon: 'wine' },
    { text: 'Pizza delivery', category: 'Food', icon: 'pizza' },
    { text: 'Coffee and snacks', category: 'Food', icon: 'cafe' },
    { text: 'Grocery shopping', category: 'Food', icon: 'bag' },
    { text: 'Street food', category: 'Food', icon: 'fast-food' },
    { text: 'Ice cream treat', category: 'Food', icon: 'ice-cream' },
    { text: 'Fast food meal', category: 'Food', icon: 'fast-food' },
    { text: 'Fresh juice', category: 'Food', icon: 'water' },
    { text: 'Bakery items', category: 'Food', icon: 'cafe' },
    { text: 'Fruits and vegetables', category: 'Food', icon: 'leaf' },

    // Travel suggestions
    { text: 'Metro/Bus fare', category: 'Travel', icon: 'bus' },
    { text: 'Auto rickshaw', category: 'Travel', icon: 'car' },
    { text: 'Taxi ride', category: 'Travel', icon: 'car' },
    { text: 'Uber/Ola', category: 'Travel', icon: 'car' },
    { text: 'Train ticket', category: 'Travel', icon: 'train' },
    { text: 'Flight booking', category: 'Travel', icon: 'airplane' },
    { text: 'Petrol/Diesel', category: 'Travel', icon: 'speedometer' },
    { text: 'Parking fees', category: 'Travel', icon: 'car' },
    { text: 'Highway toll', category: 'Travel', icon: 'car' },
    { text: 'Vehicle service', category: 'Travel', icon: 'construct' },

    // Clothes suggestions
    { text: 'Casual shirt', category: 'Clothes', icon: 'shirt' },
    { text: 'Formal wear', category: 'Clothes', icon: 'shirt' },
    { text: 'Jeans/Trousers', category: 'Clothes', icon: 'shirt' },
    { text: 'Footwear', category: 'Clothes', icon: 'footsteps' },
    { text: 'Accessories', category: 'Clothes', icon: 'bag' },
    { text: 'Winter wear', category: 'Clothes', icon: 'shirt' },
    { text: 'Undergarments', category: 'Clothes', icon: 'shirt' },
    { text: 'Watch/Jewelry', category: 'Clothes', icon: 'watch' },

    // Entertainment suggestions
    { text: 'Movie tickets', category: 'Entertainment', icon: 'film' },
    { text: 'Concert/Show', category: 'Entertainment', icon: 'musical-notes' },
    { text: 'Gaming expenses', category: 'Entertainment', icon: 'game-controller' },
    { text: 'Books/Magazines', category: 'Entertainment', icon: 'book' },
    { text: 'Sports activity', category: 'Entertainment', icon: 'football' },
    { text: 'Streaming subscription', category: 'Entertainment', icon: 'tv' },
    { text: 'Party/Celebration', category: 'Entertainment', icon: 'party' },
    { text: 'Art/Craft supplies', category: 'Entertainment', icon: 'color-palette' },

    // Bills suggestions
    { text: 'Electricity bill', category: 'Bills', icon: 'flash' },
    { text: 'Water bill', category: 'Bills', icon: 'water' },
    { text: 'Internet bill', category: 'Bills', icon: 'wifi' },
    { text: 'Mobile recharge', category: 'Bills', icon: 'phone-portrait' },
    { text: 'Gas cylinder', category: 'Bills', icon: 'flame' },
    { text: 'House rent', category: 'Bills', icon: 'home' },
    { text: 'Insurance premium', category: 'Bills', icon: 'shield' },
    { text: 'Loan EMI', category: 'Bills', icon: 'cash' },
    { text: 'Credit card bill', category: 'Bills', icon: 'card' },

    // Healthcare suggestions
    { text: 'Doctor consultation', category: 'Healthcare', icon: 'medical' },
    { text: 'Medicines', category: 'Healthcare', icon: 'medkit' },
    { text: 'Lab tests', category: 'Healthcare', icon: 'flask' },
    { text: 'Dental treatment', category: 'Healthcare', icon: 'medical' },
    { text: 'Eye checkup', category: 'Healthcare', icon: 'eye' },
    { text: 'Health supplements', category: 'Healthcare', icon: 'fitness' },
    { text: 'Medical equipment', category: 'Healthcare', icon: 'medical' },

    // Others suggestions
    { text: 'Gift for someone', category: 'Others', icon: 'gift' },
    { text: 'Charitable donation', category: 'Others', icon: 'heart' },
    { text: 'Home repairs', category: 'Others', icon: 'construct' },
    { text: 'Pet expenses', category: 'Others', icon: 'paw' },
    { text: 'Education fees', category: 'Others', icon: 'school' },
    { text: 'Office supplies', category: 'Others', icon: 'document' },
    { text: 'Bank charges', category: 'Others', icon: 'cash' },
    { text: 'Miscellaneous', category: 'Others', icon: 'ellipsis-horizontal' },
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
