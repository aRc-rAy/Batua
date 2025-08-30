/**
 * Formatting Utilities
 * Centralized formatting functions for consistent display across the app
 */

/**
 * Formats currency amounts with proper comma separators and Indian locale
 * @param amount - The numeric amount to format
 * @param includeCurrency - Whether to include the ₹ symbol (default: false)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string with comma separators
 */
export const formatAmount = (amount: number, includeCurrency: boolean = false, decimals: number = 2): string => {
  const locale = 'en-IN';
  const formattedNumber = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);

  return includeCurrency ? `₹${formattedNumber}` : formattedNumber;
};

/**
 * Formats amounts for display in charts/analytics (no decimals for cleaner look)
 * @param amount - The numeric amount to format
 * @param includeCurrency - Whether to include the ₹ symbol (default: false)
 * @returns Formatted string with comma separators, no decimals
 */
export const formatAmountChart = (amount: number, includeCurrency: boolean = false): string => {
  return formatAmount(amount, includeCurrency, 0);
};

/**
 * Formats amounts for input display (removes extra zeros)
 * @param amount - The numeric amount to format
 * @returns Formatted string optimized for input fields
 */
export const formatAmountInput = (amount: number): string => {
  // For input fields, we want to avoid unnecessary decimal places
  if (amount % 1 === 0) {
    // Whole number, no decimals needed
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } else {
    // Has decimals, show 2 decimal places
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
};
