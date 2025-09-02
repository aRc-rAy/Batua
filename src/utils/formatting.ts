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

/**
 * Formats amounts in compact form for charts (1.5k, 2.3L, etc.)
 * @param amount - The numeric amount to format
 * @param includeCurrency - Whether to include the ₹ symbol (default: false)
 * @returns Formatted string in compact form
 */
export const formatAmountCompact = (amount: number, includeCurrency: boolean = false): string => {
  let formattedValue: string;
  
  if (amount >= 10000000) { // 1 crore and above
    const crores = amount / 10000000;
    formattedValue = `${crores % 1 === 0 ? crores.toString() : crores.toFixed(1)}Cr`;
  } else if (amount >= 100000) { // 1 lakh and above
    const lakhs = amount / 100000;
    formattedValue = `${lakhs % 1 === 0 ? lakhs.toString() : lakhs.toFixed(1)}L`;
  } else if (amount >= 1000) { // 1 thousand and above
    const thousands = amount / 1000;
    formattedValue = `${thousands % 1 === 0 ? thousands.toString() : thousands.toFixed(1)}k`;
  } else {
    // Less than 1000, show full amount
    formattedValue = amount.toString();
  }
  
  return includeCurrency ? `₹${formattedValue}` : formattedValue;
};
